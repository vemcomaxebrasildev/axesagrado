import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { type Product, formatBRL } from "@/data/products";
import { cn } from "@/lib/utils";
import { ShareMenu } from "@/components/site/ShareMenu";
import { useCart } from "@/contexts/CartContext";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const { add } = useCart();
  const navigate = useNavigate();

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      to="/produto/$slug"
      params={{ slug: product.slug }}
      className={cn("group block", className)}
    >
      <div className="relative overflow-hidden rounded-xl bg-muted shadow-soft hover-lift">
        <div className="aspect-[4/5] w-full overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background backdrop-blur">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            −{discount}%
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              navigate({ to: "/produto/$slug", params: { slug: product.slug } });
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-soft backdrop-blur transition hover:bg-background"
            aria-label={`Ver detalhes de ${product.name}`}
          >
            <Eye className="h-3.5 w-3.5" /> Detalhes
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              add(product, 1);
              toast.success("Adicionado à sacola", { description: product.name });
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background shadow-soft transition hover:bg-primary"
            aria-label={`Adicionar ${product.name} à sacola`}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Adicionar
          </button>
          <div onClick={stop}>
            <ShareMenu slug={product.slug} title={product.name} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {product.entity ?? product.category.replace("-", " ")}
          </p>
          <h3 className="mt-1 truncate font-display text-base font-semibold text-foreground">
            {product.name}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatBRL(product.oldPrice)}
            </p>
          )}
          <p className="font-display text-base font-semibold text-foreground">
            {formatBRL(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
