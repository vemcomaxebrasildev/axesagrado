import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Phone, Mail, Clock, RefreshCcw, ShieldCheck, FileText } from "lucide-react";

export const Route = createFileRoute("/suporte")({
  component: SuportePage,
  head: () => ({
    meta: [
      { title: "Suporte ao Cliente — Vem com Axé" },
      { name: "description", content: "Fale com a Vem com Axé pelo WhatsApp, telefone ou e-mail. Conheça nossos termos de troca e devolução." },
    ],
  }),
});

const WHATSAPP = "5511999990000";
const PHONE_DISPLAY = "(11) 99999-0000";
const EMAIL = "contato@axesagrado.com.br";

function SuportePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-8">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Atendimento
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
          Suporte ao Cliente
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Estamos aqui para ajudar com pedidos, dúvidas sobre peças, prazos de entrega e trocas.
          Escolha o canal que preferir.
        </p>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">WhatsApp</h3>
          <p className="mt-1 text-sm text-muted-foreground">Resposta rápida no horário comercial.</p>
          <p className="mt-3 text-sm font-medium text-foreground">{PHONE_DISPLAY}</p>
        </a>

        <a
          href={`tel:+${WHATSAPP}`}
          className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Telefone</h3>
          <p className="mt-1 text-sm text-muted-foreground">Ligue para falar com nossa equipe.</p>
          <p className="mt-3 text-sm font-medium text-foreground">{PHONE_DISPLAY}</p>
        </a>

        <a
          href={`mailto:${EMAIL}`}
          className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">E-mail</h3>
          <p className="mt-1 text-sm text-muted-foreground">Para pedidos detalhados e anexos.</p>
          <p className="mt-3 text-sm font-medium text-foreground">{EMAIL}</p>
        </a>
      </section>

      <section className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 shrink-0 text-foreground" />
        <span>
          <strong className="text-foreground">Horário de atendimento:</strong> segunda a sexta, das 10h às 18h.
          Sábados das 10h às 14h. Domingos e feriados: e-mail apenas.
        </span>
      </section>

      <section id="trocas" className="mt-16">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            Termos de Troca e Devolução
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/90).
        </p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/90">
          <div>
            <h3 className="font-semibold text-foreground">1. Prazo de arrependimento</h3>
            <p className="mt-1 text-muted-foreground">
              Você tem até <strong>7 dias corridos</strong> após o recebimento para solicitar a devolução
              do produto, sem necessidade de justificativa, conforme art. 49 do CDC.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">2. Troca por defeito</h3>
            <p className="mt-1 text-muted-foreground">
              Em caso de produto com defeito de fabricação, o prazo para solicitação é de
              <strong> 30 dias</strong> a partir do recebimento. Faremos a troca pelo mesmo item ou
              devolução integral do valor pago.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">3. Condições para troca</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Produto sem sinais de uso, com etiquetas e embalagem original.</li>
              <li>Acompanhar nota fiscal ou comprovante de compra.</li>
              <li>Peças personalizadas ou consagradas não podem ser trocadas, salvo defeito.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">4. Como solicitar</h3>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Entre em contato pelo WhatsApp ou e-mail informando o número do pedido.</li>
              <li>Nossa equipe enviará o código de postagem reversa em até 2 dias úteis.</li>
              <li>Após recebermos e conferirmos o produto, processamos a troca ou reembolso em até 7 dias úteis.</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">5. Reembolso</h3>
            <p className="mt-1 text-muted-foreground">
              O reembolso é feito pelo mesmo meio de pagamento utilizado na compra. Para PIX e boleto,
              é necessário informar dados bancários do titular da compra.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <Link
          to="/suporte"
          hash="trocas"
          className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <FileText className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Política de Privacidade & LGPD</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Tratamos seus dados conforme a Lei nº 13.709/18. Você pode solicitar acesso, correção
              ou exclusão dos seus dados a qualquer momento pelo nosso e-mail.
            </p>
          </div>
        </Link>
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">Compra segura</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Pagamentos processados em ambiente criptografado. Não armazenamos dados de cartão.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
