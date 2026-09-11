// Googleスプレッドシート（Google Apps Script ウェブアプリ）との通信。
// GAS_URL が空のときは何もしない（アプリは通常どおり動く）。
import { GAS_URL } from "../config";

type Json = Record<string, unknown>;

async function call(action: string, payload: Json = {}): Promise<any> {
  if (!GAS_URL) return null;
  // Content-Type を text/plain にすると CORS の事前確認(preflight)が発生せず、
  // Google Apps Script がそのまま受け取れる。
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`GAS ${res.status}`);
  return res.json();
}

export type EstimateLineItem = {
  product: { id: number; name: string; modelNo: string; price: number };
  quantity: number;
  subtotal: number;
};

/** 来場者の名前・郵便番号を記録する（現在は登録画面を廃止したため未使用） */
export function registerVisitor(name: string, postalCode: string) {
  return call("registerVisitor", { name: name.trim(), postalCode: postalCode.trim() }).catch(
    () => null
  );
}

/** 見積内容を記録し、メール通知を送る（お名前が空のときは匿名として記録される） */
export function recordEstimate(params: {
  name: string;
  postalCode: string;
  locationName?: string | null;
  items: EstimateLineItem[];
  total: number;
}) {
  return call("recordEstimate", {
    name: params.name.trim(),
    postalCode: params.postalCode.trim(),
    locationName: params.locationName ?? null,
    total: params.total,
    items: params.items.map((i) => ({
      name: i.product.name,
      modelNo: i.product.modelNo,
      price: i.product.price,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
  }).catch(() => null);
}

/** 管理画面：ログイン */
export function adminLogin(password: string) {
  return call("adminLogin", { password });
}

/** 管理画面：来場者と見積履歴の一覧 */
export function adminVisitors(token: string) {
  return call("adminVisitors", { token });
}

/** 管理画面：見積履歴を1件削除 */
export function adminDeleteEstimate(token: string, estimateId: number) {
  return call("adminDeleteEstimate", { token, estimateId });
}

/** 管理画面：来場者と、その見積履歴をすべて削除 */
export function adminDeleteVisitor(token: string, visitorId: number) {
  return call("adminDeleteVisitor", { token, visitorId });
}

export const backendEnabled = () => Boolean(GAS_URL);
