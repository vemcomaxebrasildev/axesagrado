import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getOrCreateOpenConversation, metaSendText, runChatbot } from "@/lib/whatsapp.server";

function verifySignature(body: string, header: string | null): boolean {
  const secret = process.env.META_WA_APP_SECRET;
  if (!secret) return true; // dev: skip if not configured (warn only)
  if (!header || !header.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type IncomingMessage = {
  from: string;
  id: string;
  text?: { body: string };
  type: string;
};

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const expected = process.env.META_WA_VERIFY_TOKEN;
        if (mode === "subscribe" && expected && token === expected && challenge) {
          return new Response(challenge, { status: 200 });
        }
        return new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const raw = await request.text();
        if (!verifySignature(raw, request.headers.get("x-hub-signature-256"))) {
          return new Response("Invalid signature", { status: 401 });
        }
        let payload: any;
        try { payload = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }

        try {
          const entries = payload?.entry ?? [];
          for (const entry of entries) {
            const changes = entry?.changes ?? [];
            for (const change of changes) {
              const value = change?.value ?? {};
              const contacts = value?.contacts ?? [];
              const messages: IncomingMessage[] = value?.messages ?? [];
              for (const msg of messages) {
                if (msg.type !== "text") continue; // only text for now
                const phone = msg.from;
                const name = contacts.find((c: any) => c.wa_id === phone)?.profile?.name ?? null;
                const conv = await getOrCreateOpenConversation(phone, name);

                // store inbound
                await supabaseAdmin.from("wa_messages").insert({
                  conversation_id: conv.id,
                  direction: "in",
                  kind: "text",
                  body: msg.text?.body ?? "",
                  wa_message_id: msg.id,
                });

                // update conv
                await supabaseAdmin
                  .from("wa_conversations")
                  .update({
                    last_message_at: new Date().toISOString(),
                    unread_count: (conv.unread_count ?? 0) + 1,
                    contact_name: name ?? conv.contact_name,
                  })
                  .eq("id", conv.id);

                // If already with a human or resolved-and-reopened-as-bot, run only when bot
                if (conv.status === "bot") {
                  const result = await runChatbot({
                    conversationId: conv.id,
                    incomingText: msg.text?.body ?? "",
                    botState: (conv.bot_state as { node?: string | null } | null) ?? null,
                  });

                  if (result.reply) {
                    const send = await metaSendText(phone, result.reply);
                    await supabaseAdmin.from("wa_messages").insert({
                      conversation_id: conv.id,
                      direction: "out",
                      kind: result.handoff ? "system" : "menu",
                      body: result.reply,
                      wa_message_id: send.wa_message_id ?? null,
                    });
                  }

                  await supabaseAdmin
                    .from("wa_conversations")
                    .update({
                      status: result.handoff ? "queued" : "bot",
                      bot_state: result.nextState,
                      last_message_at: new Date().toISOString(),
                    })
                    .eq("id", conv.id);
                }
              }
            }
          }
        } catch (e) {
          console.error("[whatsapp webhook]", e);
        }
        // Always 200 so Meta doesn't retry on app-level errors
        return new Response("ok", { status: 200 });
      },
    },
  },
});
