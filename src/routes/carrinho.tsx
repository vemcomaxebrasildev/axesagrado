import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { formatBRL } from "@/data/products";

type Coupon = { code: string; type: "percent" | "fixed"; value: number; label: string };
const COUPONS: Coupon[] = [
  { code: "AXE10", type: "percent", value: 10, label: "10% de desconto" },
  { code: "PRETOVELHO20", type: "percent", value: 20, label: "20% de desconto" },
  { code: "FRETEGRATIS", type: "fixed", value: 0, label: "Frete grátis" },
];

type ShippingOption = { id: string; label: string; days: string; price: number };
function calcShipping(cep: string, subtotal: number): ShippingOption[] {
  const digits = cep.replace(/\D/g, "");
  const region = Number(digits.slice(0, 1) || "0");
  const base = 18 + region * 2.4;
  const free = subtotal > 350;
  return [
    { id: "pac", label: "PAC", days: "7 a 12 dias úteis", price: free ? 0 : Math.round(base * 100) / 100 },
    { id: "sedex", label: "SEDEX", days: "3 a 5 dias úteis", price: Math.round((base + 18) * 100) / 100 },
    { id: "expresso", label: "Expresso 24h", days: "1 a 2 dias úteis", price: Math.round((base + 38) * 100) / 100 },
  ];
}

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [{ title: "Sacola — Vem com Axé" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count, clear } = useCart();

  const [cep, setCep] = useState("");
  const [shippingOpts, setShippingOpts] = useState<ShippingOption[] | null>(null);
  const [shippingId, setShippingId] = useState<string>("pac");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");

  const handleCalcShipping = () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      toast.error("CEP inválido", { description: "Informe um CEP com 8 dígitos." });
      return;
    }
    const opts = calcShipping(digits, subtotal);
    setShippingOpts(opts);
    setShippingId(opts[0].id);
    toast.success("Frete calculado", { description: `Opções para ${digits.slice(0, 5)}-${digits.slice(5)}` });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === code);
    if (!found) {
      toast.error("Cupom inválido", { description: "Tente AXE10, PRETOVELHO20 ou FRETEGRATIS." });
      return;
    }
    setCoupon(found);
    toast.success("Cupom aplicado", { description: found.label });
  };

  const selectedShipping = shippingOpts?.find((o) => o.id === shippingId) ?? null;
  const baseShipping = selectedShipping
    ? selectedShipping.price
    : subtotal > 350 ? 0 : subtotal > 0 ? 24.9 : 0;
  const freteGratis = coupon?.code === "FRETEGRATIS";
  const shipping = freteGratis ? 0 : baseShipping;
  const discount =
    coupon && coupon.type === "percent" ? (subtotal * coupon.value) / 100 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  if (count === 0) {
    return (
      <div className="bg-warm">
        <div className="mx-auto max-w-2xl px-6 py-32 text-center md:px-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-foreground/70">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">Sua sacola está vazia.</h1>
          <p className="mt-3 text-muted-foreground">
            Encontre a peça certa para fortalecer o seu axé.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary"
          >
            Explorar o catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm">
      <section className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Sua sacola</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Quase lá, irmão de fé.
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map(({ product, qty }) => (
                <li key={product.slug} className="flex gap-4 p-4 md:gap-6 md:p-6">
                  <Link
                    to="/produto/$slug"
                    params={{ slug: product.slug }}
                    className="block w-24 shrink-0 overflow-hidden rounded-lg bg-muted md:w-32"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {product.entity ?? product.category.replace("-", " ")}
                        </p>
                        <h3 className="mt-1 font-display text-lg font-semibold">
                          {product.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => remove(product.slug)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQty(product.slug, qty - 1)}
                          className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{qty}</span>
                        <button
                          onClick={() => setQty(product.slug, qty + 1)}
                          className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-display text-lg font-semibold">
                        {formatBRL(product.price * qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={clear}
              className="mt-4 text-xs text-muted-foreground hover:text-destructive"
            >
              Esvaziar sacola
            </button>
          </div>

          <aside className="md:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Truck className="h-4 w-4 text-accent" /> Calcular frete
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
                    }}
                    className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleCalcShipping}
                    className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-primary"
                  >
                    Calcular
                  </button>
                </div>
                {shippingOpts && (
                  <ul className="mt-3 space-y-1.5">
                    {shippingOpts.map((o) => (
                      <li key={o.id}>
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <span className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="ship"
                              checked={shippingId === o.id}
                              onChange={() => setShippingId(o.id)}
                              className="accent-primary"
                            />
                            <span>
                              <span className="font-medium">{o.label}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{o.days}</span>
                            </span>
                          </span>
                          <span className="text-sm font-medium">
                            {o.price === 0 ? <span className="text-accent">Grátis</span> : formatBRL(o.price)}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4 text-accent" /> Cupom de desconto
                </div>
                {coupon ? (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      <span className="font-medium">{coupon.code}</span>
                      <span className="text-xs text-muted-foreground">— {coupon.label}</span>
                    </span>
                    <button
                      onClick={() => setCoupon(null)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remover cupom"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input
                      placeholder="Insira o código"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      maxLength={24}
                      className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm uppercase focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-primary"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Experimente: AXE10 · PRETOVELHO20 · FRETEGRATIS
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold">Resumo</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal ({count} itens)</dt>
                    <dd className="font-medium">{formatBRL(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <dt>Desconto ({coupon?.code})</dt>
                      <dd className="font-medium">− {formatBRL(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Frete{selectedShipping ? ` · ${selectedShipping.label}` : ""}
                    </dt>
                    <dd className="font-medium">
                      {shipping === 0 ? <span className="text-accent">Grátis</span> : formatBRL(shipping)}
                    </dd>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-end justify-between">
                      <dt className="font-medium">Total</dt>
                      <dd className="font-display text-2xl font-semibold">{formatBRL(total)}</dd>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      em até 6× sem juros · 5% off no PIX
                    </p>
                  </div>
                </dl>

              <Link
                to="/checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition hover:bg-primary"
              >
                Finalizar compra
              </Link>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Pagamento seguro · PIX, cartão e boleto
              </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
