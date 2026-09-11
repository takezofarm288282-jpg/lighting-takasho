// サーバーAPIの代わりに、ブラウザ内で商品データを扱うための置き換え。
// 以前は fetch("/api/...") でサーバーに問い合わせていた処理を、
// すべて src/data/catalog.ts の静的データに対して行う。
import {
  categories as ALL_CATEGORIES,
  locations as ALL_LOCATIONS,
  locationCategories as ALL_LOCATION_CATEGORIES,
  products as ALL_PRODUCTS,
  type Category,
  type Location,
  type Product,
} from "../data/catalog";

export type ProductWithCategory = Product & { category: Category };

const categoryById = new Map(ALL_CATEGORIES.map((c) => [c.id, c]));
const categoryBySlug = new Map(ALL_CATEGORIES.map((c) => [c.slug, c]));
const locationBySlug = new Map(ALL_LOCATIONS.map((l) => [l.slug, l]));
const productById = new Map(ALL_PRODUCTS.map((p) => [p.id, p]));

const withCategory = (p: Product): ProductWithCategory => ({
  ...p,
  category: categoryById.get(p.categoryId)!,
});

// SQLと同じ挙動：値が null の商品は数値条件では除外される
const gte = (v: number | null, min: number) => v !== null && v >= min;
const lte = (v: number | null, max: number) => v !== null && v <= max;

type Query = Record<string, string | undefined>;

function filterProducts(q: Query): ProductWithCategory[] {
  let list = ALL_PRODUCTS;

  if (q.category) {
    const cat = categoryBySlug.get(q.category);
    list = cat ? list.filter((p) => p.categoryId === cat.id) : list;
  }
  if (q.minPrice) list = list.filter((p) => p.price >= parseInt(q.minPrice!));
  if (q.maxPrice) list = list.filter((p) => p.price <= parseInt(q.maxPrice!));
  if (q.colorTemp) list = list.filter((p) => p.colorTemp === q.colorTemp);
  if (q.style) list = list.filter((p) => p.style === q.style);
  if (q.minLumen) list = list.filter((p) => gte(p.lumen, parseInt(q.minLumen!)));
  if (q.maxBeamAngle) list = list.filter((p) => lte(p.beamAngle, parseInt(q.maxBeamAngle!)));
  if (q.minBeamAngle) list = list.filter((p) => gte(p.beamAngle, parseInt(q.minBeamAngle!)));
  if (q.maxReach) list = list.filter((p) => lte(p.reachDistance, parseFloat(q.maxReach!)));
  if (q.minReach) list = list.filter((p) => gte(p.reachDistance, parseFloat(q.minReach!)));
  if (q.voltage) list = list.filter((p) => p.voltage === q.voltage);
  if (q.maker) list = list.filter((p) => p.maker === q.maker);

  return list.map(withCategory);
}

// 以前の hono クライアントと同じ書き方（await ...$get()).json()）で使えるようにする
const ok = <T>(data: T) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

export const api = {
  health: {
    $get: async () => ok({ status: "ok" as const }),
  },

  locations: Object.assign(
    {
      $get: async () => ok({ locations: ALL_LOCATIONS as Location[] }),
    },
    {
      ":slug": {
        categories: {
          $get: async ({ param }: { param: { slug: string } }) => {
            const loc = locationBySlug.get(param.slug);
            if (!loc) return ok({ categories: [] as Category[] });
            const ids = ALL_LOCATION_CATEGORIES.filter((lc) => lc.locationId === loc.id).map(
              (lc) => lc.categoryId
            );
            return ok({
              categories: ids.map((id) => categoryById.get(id)!).filter(Boolean),
            });
          },
        },
      },
    }
  ),

  categories: {
    $get: async () => ok({ categories: ALL_CATEGORIES as Category[] }),
  },

  products: Object.assign(
    {
      $get: async ({ query }: { query?: Query } = {}) =>
        ok({ products: filterProducts(query ?? {}) }),
    },
    {
      ":id": {
        $get: async ({ param }: { param: { id: string } }) => {
          const p = productById.get(parseInt(param.id));
          return ok({ product: p ? withCategory(p) : null });
        },
      },
    }
  ),

  estimate: {
    $post: async ({ json }: { json: { items: { productId: number; quantity: number }[] } }) => {
      const items = json.items
        .map((i) => {
          const product = productById.get(i.productId);
          if (!product) return null;
          return {
            product: withCategory(product),
            quantity: i.quantity,
            subtotal: product.price * i.quantity,
          };
        })
        .filter(Boolean) as {
        product: ProductWithCategory;
        quantity: number;
        subtotal: number;
      }[];
      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      return ok({ estimate: { items, total } });
    },
  },
};
