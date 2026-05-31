import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import { exec } from "child_process";

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
    const maker = c.req.query("maker");                  // メーカー: "TAKASHO" | "LIXIL"

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
    if (maker) conditions.push(eq(schema.products.maker, maker));

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
  })

  // Send estimate email
  .post("/send-estimate", async (c) => {
    const { name, postalCode, items, total } = await c.req.json<{
      name: string;
      postalCode: string;
      items: { product: { id: number; name: string; modelNo: string; price: number }; quantity: number; subtotal: number }[];
      total: number;
    }>();

    const tax = Math.floor(total * 0.1);
    const totalWithTax = Math.floor(total * 1.1);

    const itemRows = items.map((item) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${item.product.modelNo}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${item.product.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;text-align:right;">¥${item.product.price.toLocaleString()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;text-align:right;">¥${item.subtotal.toLocaleString()}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>お見積もり</title></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#1a1a1a;color:#e8e8e8;margin:0;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#222;border-radius:12px;overflow:hidden;">
    <div style="background:#c8a96e;padding:24px 32px;">
      <h1 style="margin:0;font-size:22px;color:#1a1a1a;font-weight:700;">お見積もり依頼</h1>
    </div>
    <div style="padding:28px 32px;">
      <h2 style="font-size:15px;color:#c8a96e;margin:0 0 16px;">お客様情報</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <tr>
          <td style="padding:8px 12px;background:#2a2a2a;border-radius:4px;color:#aaa;font-size:13px;width:120px;">お名前</td>
          <td style="padding:8px 12px;font-size:14px;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#2a2a2a;border-radius:4px;color:#aaa;font-size:13px;">郵便番号</td>
          <td style="padding:8px 12px;font-size:14px;">〒${postalCode}</td>
        </tr>
      </table>

      <h2 style="font-size:15px;color:#c8a96e;margin:0 0 16px;">見積内容</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#2a2a2a;">
            <th style="padding:10px 12px;text-align:left;color:#aaa;font-weight:500;">型番</th>
            <th style="padding:10px 12px;text-align:left;color:#aaa;font-weight:500;">商品名</th>
            <th style="padding:10px 12px;text-align:center;color:#aaa;font-weight:500;">数量</th>
            <th style="padding:10px 12px;text-align:right;color:#aaa;font-weight:500;">単価</th>
            <th style="padding:10px 12px;text-align:right;color:#aaa;font-weight:500;">小計</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:20px;padding:16px 20px;background:#2a2a2a;border-radius:8px;border-left:3px solid #c8a96e;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:#aaa;">
          <span>小計（税別）</span><span>¥${total.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #444;font-size:13px;color:#aaa;">
          <span>消費税（10%）</span><span>¥${tax.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#c8a96e;">
          <span>合計（税込）</span><span>¥${totalWithTax.toLocaleString()}</span>
        </div>
      </div>

      <p style="font-size:11px;color:#666;margin-top:16px;text-align:center;">
        ※ 工事費・配線費用は含まれていません。別途お見積もりが必要です。
      </p>
    </div>
  </div>
</body>
</html>`;

    await new Promise<void>((resolve, reject) => {
      const child = exec(
        `send-email --to "izumo@takezofarm.co.jp" --subject "【見積依頼】${name} 様（〒${postalCode}）" --html -`,
        (err) => { if (err) reject(err); else resolve(); }
      );
      child.stdin!.write(html);
      child.stdin!.end();
    });

    return c.json({ ok: true }, 200);
  })

  // Generate PDF estimate
  .post("/generate-pdf", async (c) => {
    const { name, postalCode, items, total } = await c.req.json<{
      name: string;
      postalCode: string;
      items: { product: { id: number; name: string; modelNo: string; price: number }; quantity: number; subtotal: number }[];
      total: number;
    }>();

    const tax = Math.floor(total * 0.1);
    const totalWithTax = Math.floor(total * 1.1);
    const now = new Date();
    const dateStr = now.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

    const itemRows = items.map((item) =>
      `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;">
          <div style="font-size:13px;font-weight:600;color:#1e1e1e;">${item.product.name}</div>
          <div style="font-size:11px;color:#999999;margin-top:2px;">${item.product.modelNo || ""}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:right;white-space:nowrap;">¥${item.product.price.toLocaleString("ja-JP")}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:right;font-weight:700;white-space:nowrap;">¥${item.subtotal.toLocaleString("ja-JP")}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
    background: #ffffff;
    color: #1e1e1e;
    font-size: 14px;
    line-height: 1.6;
  }
  .page { width: 794px; padding: 0 60px 60px; }
  .header { background: #1e1e1e; color: #ffffff; margin: 0 -60px 40px; padding: 14px 60px; display: flex; justify-content: space-between; align-items: center; }
  .header-title { font-size: 13px; font-weight: 700; letter-spacing: 0.05em; }
  .header-date { font-size: 12px; color: #aaaaaa; }
  h1 { text-align: center; font-size: 26px; font-weight: 700; letter-spacing: 0.15em; margin: 0 0 10px; }
  .gold-line { height: 2px; background: #c8a050; margin-bottom: 28px; }
  .customer-info { font-size: 13px; color: #555555; margin-bottom: 24px; }
  .customer-info div { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #f5f5f5; }
  th { padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 700; color: #444444; border-bottom: 2px solid #e0e0e0; }
  th.right { text-align: right; }
  th.center { text-align: center; }
  .total-box { background: #faf7ee; border: 1.5px solid #c8a050; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; }
  .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #666666; }
  .total-row.border { padding-bottom: 14px; border-bottom: 1px solid #e0d0a0; margin-bottom: 14px; }
  .total-final { display: flex; justify-content: space-between; align-items: center; }
  .total-label { font-size: 16px; font-weight: 700; color: #1e1e1e; }
  .total-amount { font-size: 26px; font-weight: 700; color: #b4781e; }
  .note { font-size: 11px; color: #aaaaaa; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <span class="header-title">TAKASHO / LIXIL ガーデンライト</span>
    <span class="header-date">${dateStr}</span>
  </div>
  <h1>お 見 積 書</h1>
  <div class="gold-line"></div>
  <div class="customer-info">
    ${name ? `<div>お名前：${name} 様</div>` : ""}
    ${postalCode ? `<div>郵便番号：〒${postalCode}</div>` : ""}
  </div>
  <table>
    <thead>
      <tr>
        <th>商品名 / 型番</th>
        <th class="right">単価</th>
        <th class="center">数量</th>
        <th class="right">小計</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="total-box">
    <div class="total-row">
      <span>小計（税別）</span>
      <span>¥${total.toLocaleString("ja-JP")}</span>
    </div>
    <div class="total-row border">
      <span>消費税（10%）</span>
      <span>¥${tax.toLocaleString("ja-JP")}</span>
    </div>
    <div class="total-final">
      <span class="total-label">合計（税込）</span>
      <span class="total-amount">¥${totalWithTax.toLocaleString("ja-JP")}</span>
    </div>
  </div>
  <p class="note">※ 工事費・配線費用は含まれていません。別途お見積もりが必要です。</p>
</div>
</body>
</html>`;

    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.default.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent("見積書")}_${now.toISOString().slice(0,10).replace(/-/g,"")}.pdf`,
      },
    });
  });

export type AppType = typeof app;
export default app;
