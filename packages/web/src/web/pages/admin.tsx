import { useState, useEffect } from "react";

interface EstimateItem {
  name: string;
  modelNo: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface EstimateRecord {
  id: number;
  visitorId: number;
  locationName: string | null;
  items: string; // JSON
  total: number;
  createdAt: string;
}

interface Visitor {
  id: number;
  name: string;
  postalCode: string;
  registeredAt: string;
  lastEstimateAt: string | null;
  estimateCount: number | null;
  lastEstimateItems: string | null;
  lastEstimateTotal: number | null;
  estimateHistory: EstimateRecord[];
}

const TOKEN_KEY = "admin_token";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function parseItems(json: string | null): EstimateItem[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const login = async () => {
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const { token: t } = await res.json();
      sessionStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    } else {
      setLoginError("パスワードが違います");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setVisitors([]);
  };

  const fetchVisitors = async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/visitors", {
        headers: { "x-admin-token": t },
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setVisitors(data.visitors);
    } catch {
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVisitors(token);
  }, [token]);

  const filtered = visitors.filter(
    (v) => v.name.includes(search) || v.postalCode.includes(search)
  );

  // ---- Login ----
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 16, padding: "48px 40px", width: 360, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: "#c8a96e", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>ADMIN</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#eee" }}>管理者ログイン</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6 }}>パスワード</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="パスワードを入力"
              style={{ width: "100%", padding: "12px 14px", background: "#2a2a2a", border: "1px solid #444", borderRadius: 8, color: "#eee", fontSize: 14, boxSizing: "border-box" as const, outline: "none" }}
            />
          </div>
          {loginError && <div style={{ color: "#f66", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{loginError}</div>}
          <button onClick={login} style={{ width: "100%", padding: "13px", background: "#c8a96e", border: "none", borderRadius: 8, color: "#111", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            ログイン
          </button>
        </div>
      </div>
    );
  }

  // ---- Main ----
  return (
    <div style={{ minHeight: "100vh", background: "#111", fontFamily: "'Noto Sans JP', sans-serif", color: "#eee" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#c8a96e", fontWeight: 700, letterSpacing: 2 }}>TAKASHO</span>
          <span style={{ color: "#444" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>ユーザー管理</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#666" }}>登録者数: <strong style={{ color: "#c8a96e" }}>{visitors.length}</strong></span>
          <button onClick={() => token && fetchVisitors(token)} style={{ padding: "7px 16px", background: "#2a2a2a", border: "1px solid #444", borderRadius: 6, color: "#aaa", fontSize: 13, cursor: "pointer" }}>更新</button>
          <button onClick={logout} style={{ padding: "7px 16px", background: "transparent", border: "1px solid #444", borderRadius: 6, color: "#888", fontSize: 13, cursor: "pointer" }}>ログアウト</button>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・郵便番号で検索…"
            style={{ width: 280, padding: "10px 14px", background: "#1e1e1e", border: "1px solid #333", borderRadius: 8, color: "#eee", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
          />
        </div>

        {error && <div style={{ color: "#f66", marginBottom: 16 }}>{error}</div>}

        {/* Column headers */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 110px 155px 70px 24px", gap: 12, padding: "0 20px 8px", marginBottom: 4 }}>
            {["#", "お名前・郵便番号", "登録日時", "最終見積日時", "見積回数", ""].map((h) => (
              <span key={h} style={{ fontSize: 11, color: "#555" }}>{h}</span>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ color: "#666", padding: 40, textAlign: "center" }}>読み込み中…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.length === 0 && (
              <div style={{ color: "#555", padding: 40, textAlign: "center" }}>{search ? "検索結果なし" : "登録者なし"}</div>
            )}
            {filtered.map((v, i) => {
              const isOpen = expandedId === v.id;
              const hasHistory = v.estimateHistory.length > 0;

              return (
                <div key={v.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, overflow: "hidden" }}>
                  {/* Summary row */}
                  <div
                    onClick={() => hasHistory && setExpandedId(isOpen ? null : v.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28px 1fr 110px 155px 70px 24px",
                      alignItems: "center",
                      padding: "14px 20px",
                      gap: 12,
                      cursor: hasHistory ? "pointer" : "default",
                      background: isOpen ? "#1f1f1f" : "transparent",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: 12 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "#eee", fontSize: 14 }}>{v.name}</div>
                      <div style={{ color: "#c8a96e", fontFamily: "monospace", fontSize: 12, marginTop: 2 }}>〒{v.postalCode}</div>
                    </div>
                    <span style={{ color: "#666", fontSize: 12 }}>{formatDate(v.registeredAt)}</span>
                    <span style={{ color: "#888", fontSize: 12 }}>{formatDate(v.lastEstimateAt)}</span>
                    <span>
                      {(v.estimateCount ?? 0) > 0 ? (
                        <span style={{ display: "inline-block", padding: "2px 10px", background: "#2a2a1a", border: "1px solid #c8a96e55", borderRadius: 12, color: "#c8a96e", fontSize: 13, fontWeight: 700 }}>
                          {v.estimateCount}回
                        </span>
                      ) : <span style={{ color: "#555", fontSize: 13 }}>—</span>}
                    </span>
                    <span style={{ color: hasHistory ? "#888" : "#333", fontSize: 14, textAlign: "right" }}>
                      {hasHistory ? (isOpen ? "▲" : "▼") : ""}
                    </span>
                  </div>

                  {/* Estimate history */}
                  {isOpen && hasHistory && (
                    <div style={{ borderTop: "1px solid #252525", padding: "0 20px 20px" }}>
                      <div style={{ fontSize: 12, color: "#666", fontWeight: 700, padding: "14px 0 10px", letterSpacing: 0.5 }}>
                        見積履歴（全{v.estimateHistory.length}件）
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {v.estimateHistory.map((est, ei) => {
                          const estItems = parseItems(est.items);
                          const tax = Math.floor(est.total * 0.1);
                          const totalWithTax = Math.floor(est.total * 1.1);
                          return (
                            <div key={est.id} style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 10, overflow: "hidden" }}>
                              {/* Estimate header */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#1c1c1c", borderBottom: "1px solid #222" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ fontSize: 11, color: "#555" }}>#{v.estimateHistory.length - ei}</span>
                                  {est.locationName ? (
                                    <span style={{ fontSize: 12, color: "#fff", background: "#2a2a1a", border: "1px solid #c8a96e44", borderRadius: 6, padding: "2px 10px" }}>
                                      📍 {est.locationName}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: 12, color: "#555" }}>場所未選択</span>
                                  )}
                                </div>
                                <span style={{ fontSize: 12, color: "#666" }}>{formatDate(est.createdAt)}</span>
                              </div>

                              {/* Items table */}
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                  <tr style={{ background: "#1a1a1a" }}>
                                    <th style={thStyle}>商品名</th>
                                    <th style={thStyle}>型番</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>数量</th>
                                    <th style={{ ...thStyle, textAlign: "right" }}>単価</th>
                                    <th style={{ ...thStyle, textAlign: "right" }}>小計</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {estItems.map((item, ii) => (
                                    <tr key={ii} style={{ borderTop: "1px solid #222" }}>
                                      <td style={tdStyle}>{item.name}</td>
                                      <td style={{ ...tdStyle, color: "#888", fontFamily: "monospace", fontSize: 12 }}>{item.modelNo}</td>
                                      <td style={{ ...tdStyle, textAlign: "center" }}>{item.quantity}</td>
                                      <td style={{ ...tdStyle, textAlign: "right" }}>¥{item.price.toLocaleString("ja-JP")}</td>
                                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#c8a96e" }}>¥{item.subtotal.toLocaleString("ja-JP")}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* Total */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#1a1a1a", borderTop: "1px solid #222" }}>
                                <span style={{ fontSize: 12, color: "#666" }}>
                                  税別 ¥{est.total.toLocaleString("ja-JP")}　消費税 ¥{tax.toLocaleString("ja-JP")}
                                </span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: "#c8a96e" }}>
                                  税込 ¥{totalWithTax.toLocaleString("ja-JP")}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 0.5,
};
const tdStyle: React.CSSProperties = {
  padding: "10px 12px", fontSize: 13, color: "#ccc",
};
