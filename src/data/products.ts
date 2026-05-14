import orixa from "@/assets/produto-orixa.jpg";
import pretovelho from "@/assets/produto-pretovelho.jpg";
import caboclo from "@/assets/produto-caboclo.jpg";
import guias from "@/assets/produto-guias.jpg";
import velas from "@/assets/produto-velas.jpg";
import incensos from "@/assets/produto-incensos.jpg";
import pombagira from "@/assets/produto-pombagira.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  entity?: string;
  shortDescription: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images: string[];
  badge?: "Lançamento" | "Mais vendido" | "Promoção" | "Edição limitada";
  rating: number;
  reviews: number;
  stock: number;
  dimensions: string;
  weight: string;
  shipping: string;
};

export const categories = [
  { slug: "orixas", name: "Imagens de Orixás", description: "Esculturas das forças da natureza." },
  { slug: "pretos-velhos", name: "Pretos Velhos", description: "Sabedoria ancestral em cada peça." },
  { slug: "caboclos", name: "Caboclos", description: "A força da mata e dos guerreiros." },
  { slug: "pombagiras", name: "Pombagiras", description: "Senhoras dos caminhos e do amor." },
  { slug: "guias", name: "Guias e Colares", description: "Proteção contada em cada conta." },
  { slug: "velas", name: "Velas Ritualísticas", description: "A chama que conecta mundos." },
  { slug: "incensos", name: "Incensos e Ervas", description: "Defumações para purificar o terreiro." },
];

export const products: Product[] = [
  {
    slug: "orixa-oxum-coroa-dourada",
    name: "Oxum — Coroa Dourada",
    category: "orixas",
    entity: "Oxum",
    shortDescription: "Imagem de Oxum em cerâmica pintada à mão com coroa dourada.",
    description:
      "Peça artesanal esculpida em cerâmica e pintada à mão por artesãos brasileiros. Representa Mamãe Oxum, senhora das águas doces, da prosperidade e do amor. Acabamento com folha dourada na coroa e detalhes em contas naturais.",
    price: 389,
    oldPrice: 459,
    image: orixa,
    images: [orixa],
    badge: "Mais vendido",
    rating: 4.9,
    reviews: 142,
    stock: 12,
    dimensions: "32 × 12 × 12 cm",
    weight: "1,4 kg",
    shipping: "Envio em até 3 dias úteis",
  },
  {
    slug: "preto-velho-pai-joaquim",
    name: "Pai Joaquim das Almas",
    category: "pretos-velhos",
    entity: "Preto Velho",
    shortDescription: "Escultura em madeira nobre com pátina natural.",
    description:
      "Pai Joaquim sentado com seu cachimbo, esculpido em madeira nobre com pátina escura. Uma peça que carrega a serenidade e a sabedoria dos pretos velhos para o seu altar.",
    price: 549,
    image: pretovelho,
    images: [pretovelho],
    badge: "Edição limitada",
    rating: 5,
    reviews: 64,
    stock: 4,
    dimensions: "28 × 18 × 16 cm",
    weight: "2,1 kg",
    shipping: "Envio em até 5 dias úteis",
  },
  {
    slug: "caboclo-pena-branca",
    name: "Caboclo Pena Branca",
    category: "caboclos",
    entity: "Caboclo",
    shortDescription: "Cocar artesanal com penas naturais e arco talhado.",
    description:
      "Imagem do Caboclo Pena Branca com cocar de penas naturais, pintura corporal em tons de mata e arco artesanal. A força guerreira da floresta protegendo seu lar.",
    price: 479,
    image: caboclo,
    images: [caboclo],
    badge: "Lançamento",
    rating: 4.8,
    reviews: 38,
    stock: 9,
    dimensions: "36 × 14 × 12 cm",
    weight: "1,7 kg",
    shipping: "Envio em até 4 dias úteis",
  },
  {
    slug: "pombagira-rosa-vermelha",
    name: "Pombagira Rosa Vermelha",
    category: "pombagiras",
    entity: "Pombagira",
    shortDescription: "Vestido vermelho esvoaçante com rosas e detalhes em prata.",
    description:
      "Senhora dos caminhos do amor, esculpida em resina nobre com vestido vermelho ricamente trabalhado, coroa em filigrana e rosas naturalistas. Acompanha base ornamentada.",
    price: 629,
    oldPrice: 729,
    image: pombagira,
    images: [pombagira],
    badge: "Promoção",
    rating: 4.9,
    reviews: 91,
    stock: 6,
    dimensions: "38 × 16 × 14 cm",
    weight: "2,4 kg",
    shipping: "Envio em até 5 dias úteis",
  },
  {
    slug: "guia-7-linhas",
    name: "Guia das 7 Linhas",
    category: "guias",
    shortDescription: "Colar ritualístico com contas naturais e firma de cristal.",
    description:
      "Guia confeccionada à mão representando as sete linhas de Umbanda. Contas de açaí, sementes naturais e firmas de cristal, montadas em fio encerado para uso ritual.",
    price: 129,
    image: guias,
    images: [guias],
    rating: 4.7,
    reviews: 210,
    stock: 35,
    dimensions: "70 cm",
    weight: "120 g",
    shipping: "Envio em 2 dias úteis",
  },
  {
    slug: "velas-7-dias-cera-natural",
    name: "Velas 7 Dias — Cera Natural",
    category: "velas",
    shortDescription: "Conjunto com 3 velas de cera de abelha de longa duração.",
    description:
      "Velas artesanais de cera de abelha 100% natural, com queima longa e suave. Ideais para firmezas, oferendas e meditação. Acompanham porta-velas em vidro reforçado.",
    price: 89,
    oldPrice: 109,
    image: velas,
    images: [velas],
    badge: "Promoção",
    rating: 4.9,
    reviews: 320,
    stock: 80,
    dimensions: "20 × 6 × 6 cm (cada)",
    weight: "900 g",
    shipping: "Envio em 1 dia útil",
  },
  {
    slug: "incensos-defumacao-mata",
    name: "Defumação da Mata — Kit",
    category: "incensos",
    shortDescription: "Sálvia, alecrim, arruda e palo santo em bastões artesanais.",
    description:
      "Kit de defumação preparado por raizeiros com ervas selecionadas: sálvia branca, alecrim, arruda, guiné e palo santo. Para limpeza energética e abertura de caminhos.",
    price: 79,
    image: incensos,
    images: [incensos],
    rating: 4.8,
    reviews: 178,
    stock: 50,
    dimensions: "Embalagem 18 × 10 cm",
    weight: "320 g",
    shipping: "Envio em 1 dia útil",
  },
];

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
