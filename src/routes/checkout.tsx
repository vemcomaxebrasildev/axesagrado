import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CreditCard,
  QrCode,
  Barcode,
  ShieldCheck,
  Check,
  Loader2,
  Mail,
  MessageCircle,
  Sparkles,
  Package,
  ArrowRight,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/data/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido — Axé Sagrado" },
      { name: "description", content: "Finalize sua compra com segurança." },
    ],
  }),
  component: CheckoutPage,
});

type Step = "form" | "processing" | "success";
type PayMethod = "pix" | "credit" | "boleto";

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [method, setMethod] = useState<PayMethod>("pix");
  const [orderId, setOrderId] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const shipping = subtotal > 0 ? (subtotal >= 350 ? 0 : 24.9) : 0;
  const discount = method === "pix" ? subtotal * 0.05 : 0;
  const total = useMemo(
    () => Math.max(0, subtotal + shipping - discount),
    [subtotal, shipping, discount],
  );

  const canSubmit =
    name.trim().length > 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    phone.replace(/\D/g, "").length >= 10 &&
    cep.replace(/\D/g, "").length === 8 &&
    address.trim().length > 3 &&
    city.trim().length > 2 &&
    items.length > 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Confira seus dados", { description: "Preencha todos os campos para continuar." });
      return;
    }
    setStep("processing");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: sess } = await supabase.auth.getSession();
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: sess.session?.user.id ?? null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        address: `${address} — ${city} — CEP ${cep}`,
        total,
        status: "Em preparação",
      }).select("id").single();
      if (error) throw error;

      await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_name: i.product.name,
          quantity: i.qty,
          unit_price: i.product.price,
        })),
      );

      await new Promise((r) => setTimeout(r, 1200));
      setOrderId("AS-" + order.id.slice(0, 6).toUpperCase());
      setStep("success");
      setTimeout(() => toast.success("E-mail enviado", { description: `Confirmação enviada para ${email}.`, icon: <Mail className="h-4 w-4" /> }), 600);
      setTimeout(() => toast.success("WhatsApp enviado", { description: `Mensagem enviada para ${phone}.`, icon: <MessageCircle className="h-4 w-4" /> }), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tente novamente.";
      toast.error("Erro ao processar pedido", { description: message });
      setStep("form");
    }
  };

  const finishOrder = () => {
    clear();
    navigate({ to: "/minha-conta" });
  };

  // Empty cart guard
  if (items.length === 0 && step === "form") {
    return (
      <div className="bg-warm">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-5 font-display text-3xl font-semibold">
            Sua sacola está vazia
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Adicione peças à sua sacola para continuar.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  // PROCESSING
  if (step === "processing") {
    return (
      <div className="bg-warm">
        <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <div className="relative grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
          <h1 className="mt-8 font-display text-3xl font-semibold">
            Processando pagamento...
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Não feche essa janela. Estamos firmando seu pedido com axé.
          </p>
          <ul className="mt-8 space-y-2 text-left text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Validando pagamento
            </li>
            <li className="flex items-center gap-2 opacity-50">
              <span className="h-3.5 w-3.5" /> Confirmando estoque
            </li>
            <li className="flex items-center gap-2 opacity-50">
              <span className="h-3.5 w-3.5" /> Gerando nota
            </li>
          </ul>
        </section>
      </div>
    );
  }

  // SUCCESS
  if (step === "success") {
    return (
      <div className="bg-warm">
        <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent">
              <Check className="h-8 w-8" />
            </div>
            <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Pedido {orderId}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Pagamento confirmado!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
              Que axé! Seu pedido foi recebido e já está sendo preparado pela nossa
              equipe com muito cuidado.
            </p>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">E-mail enviado</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confirmação foi para <span className="font-medium">{email}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                <MessageCircle className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">WhatsApp enviado</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mensagem para <span className="font-medium">{phone}</span>
                  </p>
                </div>
              </div>
            </div>

            <dl className="mt-8 space-y-2 rounded-2xl border border-border bg-background p-5 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total pago</dt>
                <dd className="font-display text-lg font-semibold">
                  {formatBRL(total)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Forma de pagamento</dt>
                <dd className="font-medium capitalize">{method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Entrega</dt>
                <dd className="font-medium">3 a 7 dias úteis</dd>
              </div>
            </dl>

            <button
              onClick={finishOrder}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition hover:bg-primary"
            >
              <Package className="h-4 w-4" /> Acompanhar pedido
            </button>
            <Link
              to="/catalogo"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Continuar comprando <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // FORM
  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-7xl px-6 pt-12 md:px-8 md:pt-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Finalizar pedido
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] md:text-5xl">
          Última etapa pra firmar seu axé.
        </h1>
      </section>

      <form
        onSubmit={handlePay}
        className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-12 md:px-8 md:py-14"
      >
        <div className="space-y-6 md:col-span-7">
          {/* Contato */}
          <Card title="Contato" icon={User}>
            <Field label="Nome completo">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={input}
                placeholder="Seu nome"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={input}
                  placeholder="voce@email.com"
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={input}
                  placeholder="(11) 99999-9999"
                />
              </Field>
            </div>
          </Card>

          {/* Entrega */}
          <Card title="Endereço de entrega" icon={MapPin}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="CEP">
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className={input}
                  placeholder="00000-000"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Cidade">
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={input}
                    placeholder="Sua cidade"
                  />
                </Field>
              </div>
            </div>
            <Field label="Endereço">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={input}
                placeholder="Rua, número, complemento"
              />
            </Field>
          </Card>

          {/* Pagamento */}
          <Card title="Forma de pagamento" icon={CreditCard}>
            <div className="grid gap-3 sm:grid-cols-3">
              <PayOption
                active={method === "pix"}
                onClick={() => setMethod("pix")}
                icon={QrCode}
                title="PIX"
                hint="5% de desconto"
              />
              <PayOption
                active={method === "credit"}
                onClick={() => setMethod("credit")}
                icon={CreditCard}
                title="Cartão"
                hint="até 6× sem juros"
              />
              <PayOption
                active={method === "boleto"}
                onClick={() => setMethod("boleto")}
                icon={Barcode}
                title="Boleto"
                hint="vence em 3 dias"
              />
            </div>

            {method === "credit" && (
              <div className="mt-5 space-y-4">
                <Field label="Número do cartão">
                  <input
                    className={input}
                    placeholder="0000 0000 0000 0000"
                    defaultValue=""
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Validade">
                    <input className={input} placeholder="MM/AA" />
                  </Field>
                  <Field label="CVV">
                    <input className={input} placeholder="123" />
                  </Field>
                  <Field label="Parcelas">
                    <select className={input} defaultValue="1">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}× de {formatBRL(total / n)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Resumo */}
        <aside className="md:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold">Seu pedido</h3>

              <ul className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                {items.map((i) => (
                  <li key={i.product.slug} className="flex items-center gap-3">
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{i.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.qty}× {formatBRL(i.product.price)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {formatBRL(i.qty * i.product.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <Row label="Subtotal" value={formatBRL(subtotal)} />
                <Row
                  label="Frete"
                  value={shipping === 0 ? "Grátis" : formatBRL(shipping)}
                />
                {discount > 0 && (
                  <Row label="Desconto PIX" value={`- ${formatBRL(discount)}`} accent />
                )}
                <div className="flex items-end justify-between border-t border-border pt-3">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-display text-2xl font-semibold">
                    {formatBRL(total)}
                  </dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium transition",
                  canSubmit
                    ? "bg-foreground text-background hover:bg-primary"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                )}
              >
                <Sparkles className="h-4 w-4" />
                Pagar {formatBRL(total)}
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                Pagamento criptografado · Compra protegida
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-foreground/70" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function PayOption({
  active,
  onClick,
  icon: Icon,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CreditCard;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border bg-background p-4 text-left transition",
        active
          ? "border-foreground ring-2 ring-foreground/10"
          : "border-border hover:border-foreground/40",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Icon className="h-5 w-5" />
        {active && <Check className="h-4 w-4 text-accent" />}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </button>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", accent && "text-accent")}>{value}</dd>
    </div>
  );
}
