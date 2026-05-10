import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: "*" }))

  // Health
  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // Get all locations
  .get("/locations", async (c) => {
    const locations = await db.select().from(schema.locations);
    return c.json({ locations }, 200);
  })

  // Get categories for a location
  .get("/locations/:slug/categories", async (c) => {
    const { slug } = c.req.param();
    const location = await db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.slug, slug))
      .limit(1);

    if (!location[0]) return c.json({ error: "Not found" }, 404);

    const cats = await db
      .select({ category: schema.categories })
      .from(schema.locationCategories)
      .innerJoin(schema.categories, eq(schema.locationCategories.categoryId, schema.categories.id))
      .where(eq(schema.locationCategories.locationId, location[0].id));

    return c.json({ categories: cats.map((r) => r.category) }, 200);
  })

  // Get all categories
  .get("/categories", async (c) => {
    const categories = await db.select().from(schema.categories);
    return c.json({ categories }, 200);
  })

  // Get products with filters
  .get("/products", async (c) => {
    const categorySlug = c.req.query("category");
    const minPrice = c.req.query("minPrice");
    const maxPrice = c.req.query("maxPrice");
    const colorTemp = c.req.query("colorTemp");
    const style = c.req.query("style");
    const minLumen = c.req.query("minLumen");
    const maxBeamAngle = c.req.query("maxBeamAngle");   // 照射角度 上限 (narrow=30, wide=120+)
    const minBeamAngle = c.req.query("minBeamAngle");
    const maxReach = c.req.query("maxReach");            // 照射距離 上限 (m)
    const minReach = c.req.query("minReach");
    const voltage = c.req.query("voltage");              // 電圧: "12V" | "24V" | "100V"

    let query = db
      .select({ product: schema.products, category: schema.categories })
      .from(schema.products)
      .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id));

    const conditions = [];

    if (categorySlug) {
      const cat = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, categorySlug))
        .limit(1);
      if (cat[0]) conditions.push(eq(schema.products.categoryId, cat[0].id));
    }
    if (minPrice) conditions.push(gte(schema.products.price, parseInt(minPrice)));
    if (maxPrice) conditions.push(lte(schema.products.price, parseInt(maxPrice)));
    if (colorTemp) conditions.push(eq(schema.products.colorTemp, colorTemp));
    if (style) conditions.push(eq(schema.products.style, style));
    if (minLumen) conditions.push(gte(schema.products.lumen, parseInt(minLumen)));
    if (maxBeamAngle) conditions.push(lte(schema.products.beamAngle, parseInt(maxBeamAngle)));
    if (minBeamAngle) conditions.push(gte(schema.products.beamAngle, parseInt(minBeamAngle)));
    if (maxReach) conditions.push(lte(schema.products.reachDistance, parseFloat(maxReach)));
    if (minReach) conditions.push(gte(schema.products.reachDistance, parseFloat(minReach)));
    if (voltage) conditions.push(eq(schema.products.voltage, voltage));

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    const products = rows.map((r) => ({ ...r.product, category: r.category }));
    return c.json({ products }, 200);
  })

  // Get single product
  .get("/products/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const rows = await db
      .select({ product: schema.products, category: schema.categories })
      .from(schema.products)
      .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .where(eq(schema.products.id, id))
      .limit(1);

    if (!rows[0]) return c.json({ error: "Not found" }, 404);
    return c.json({ product: { ...rows[0].product, category: rows[0].category } }, 200);
  })

  // Calculate estimate
  .post("/estimate", async (c) => {
    const body = await c.req.json<{ items: { productId: number; quantity: number }[] }>();
    const productIds = body.items.map((i) => i.productId);

    if (productIds.length === 0) return c.json({ estimate: { items: [], total: 0 } }, 200);

    const products = await db
      .select()
      .from(schema.products)
      .where(inArray(schema.products.id, productIds));

    const productMap: Record<number, typeof products[0]> = {};
    for (const p of products) productMap[p.id] = p;

    const items = body.items.map((i) => {
      const product = productMap[i.productId];
      if (!product) return null;
      return {
        product,
        quantity: i.quantity,
        subtotal: product.price * i.quantity,
      };
    }).filter(Boolean);

    const total = items.reduce((sum, i) => sum + (i?.subtotal ?? 0), 0);
    return c.json({ estimate: { items, total } }, 200);
  });

export type AppType = typeof app;
export default app;
