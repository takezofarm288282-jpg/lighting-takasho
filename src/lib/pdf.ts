// 見積書PDFをブラウザ内で作る。
// 以前はサーバー側の Chrome(puppeteer) で生成していたが、
// サーバーが不要になったため html2canvas + jsPDF に置き換えた。
import type { EstimateLineItem } from "./backend";

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

function buildHtml(params: {
  name: string;
  postalCode: string;
  items: EstimateLineItem[];
  total: number;
}) {
  const { name, postalCode, items, total } = params;
  const tax = Math.floor(total * 0.1);
  const totalWithTax = Math.floor(total * 1.1);
  const dateStr = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;">
          <div style="font-size:13px;font-weight:600;color:#1e1e1e;">${item.product.name}</div>
          <div style="font-size:11px;color:#999999;margin-top:2px;">${item.product.modelNo || ""}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:right;white-space:nowrap;">${yen(item.product.price)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eeeeee;text-align:right;font-weight:700;white-space:nowrap;">${yen(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="width:794px;background:#ffffff;color:#1e1e1e;font-family:'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;font-size:14px;line-height:1.6;">
    <div style="background:#1e1e1e;color:#ffffff;padding:14px 60px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;font-weight:700;letter-spacing:0.05em;">TAKASHO / LIXIL ガーデンライト</span>
      <span style="font-size:12px;color:#aaaaaa;">${dateStr}</span>
    </div>
    <div style="padding:40px 60px 60px;">
      <h1 style="text-align:center;font-size:26px;font-weight:700;letter-spacing:0.15em;margin:0 0 10px;">お 見 積 書</h1>
      <div style="height:2px;background:#c8a050;margin-bottom:28px;"></div>
      <div style="font-size:13px;color:#555555;margin-bottom:24px;">
        ${name ? `<div style="margin-bottom:4px;">お名前：${name} 様</div>` : ""}
        ${postalCode ? `<div style="margin-bottom:4px;">郵便番号：〒${postalCode}</div>` : ""}
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:700;color:#444;border-bottom:2px solid #e0e0e0;">商品名 / 型番</th>
            <th style="padding:10px 8px;text-align:right;font-size:12px;font-weight:700;color:#444;border-bottom:2px solid #e0e0e0;">単価</th>
            <th style="padding:10px 8px;text-align:center;font-size:12px;font-weight:700;color:#444;border-bottom:2px solid #e0e0e0;">数量</th>
            <th style="padding:10px 8px;text-align:right;font-size:12px;font-weight:700;color:#444;border-bottom:2px solid #e0e0e0;">小計</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="background:#faf7ee;border:1.5px solid #c8a050;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:#666;">
          <span>小計（税別）</span><span>${yen(total)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid #e0d0a0;margin-bottom:14px;font-size:13px;color:#666;">
          <span>消費税（10%）</span><span>${yen(tax)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:16px;font-weight:700;color:#1e1e1e;">合計（税込）</span>
          <span style="font-size:26px;font-weight:700;color:#b4781e;">${yen(totalWithTax)}</span>
        </div>
      </div>
      <p style="font-size:11px;color:#aaaaaa;text-align:center;margin:0;">※ 工事費・配線費用は含まれていません。別途お見積もりが必要です。</p>
    </div>
  </div>`;
}

export async function downloadEstimatePdf(params: {
  name: string;
  postalCode: string;
  items: EstimateLineItem[];
  total: number;
}) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // 画面外に見積書を組み立てて画像化する
  const holder = document.createElement("div");
  holder.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;z-index:-1;";
  holder.innerHTML = buildHtml(params);
  document.body.appendChild(holder);

  try {
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;

    const canvas = await html2canvas(holder.firstElementChild as HTMLElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();   // 210mm
    const pageH = pdf.internal.pageSize.getHeight();  // 297mm
    const imgH = (canvas.height * pageW) / canvas.width;

    if (imgH <= pageH) {
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, imgH);
    } else {
      // 長い見積はA4の高さで切り分けて複数ページにする
      const pageHpx = Math.floor((pageH * canvas.width) / pageW);
      let y = 0;
      let first = true;
      while (y < canvas.height) {
        const sliceH = Math.min(pageHpx, canvas.height - y);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (!first) pdf.addPage();
        pdf.addImage(
          slice.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          0,
          pageW,
          (sliceH * pageW) / canvas.width
        );
        first = false;
        y += sliceH;
      }
    }

    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    pdf.save(`見積書_${stamp}.pdf`);
  } finally {
    holder.remove();
  }
}
