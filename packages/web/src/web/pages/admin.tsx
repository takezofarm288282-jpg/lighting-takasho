import { useState, useEffect } from "react";

interface EstimateItem {
  name: string;
  modelNo: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Visitor {
  id: number;
  name: string;
  postalCode: string;
  registeredAt: string;
  lastEstimateAt: string | null;
  estimateCount: number | null;
  lastEstimateItems: string | null; // JSON
  lastEstimateTotal: number | null;
}

const TOKEN_KEY = "admin_token";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

  // ---- Login Screen ----
  if (!token) {
    return (
      <div style={{
        minHeight: "100vh", background: "#111",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}>
        <div style={{
          background: "#1e1e1e", border: "1px solid #333", borderRadius: 16,
          padding: "48px 40px", width: 360, boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
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
              style={{
                width: "100%", padding: "12px 14px", background: "#2a2a2a",
                border: "1px solid #444", borderRadius: 8, color: "#eee",
                fontSize: 14, boxSizing: "border-box" as const, outline: "none",
              }}
            />
          </div>
          {loginError && <div style={{ color: "#f66", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{loginError}</div>}
          <button onClick={login} style={{
            width: "100%", padding: "13px", background: "#c8a96e", border: "none",
            borderRadius: 8, color: "#111", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>ログイン</button>
        </div>
      </div>
    );
  }

  // ---- Main Admin Screen ----
  return (
    <div style={{ minHeight: "100vh", background: "#111", fontFamily: "'Noto Sans JP', sans-serif", color: "#eee" }}>
      {/* Header */}
      <div style={{
        background: "#1a1a1a", borderBottom: "1px solid #2a2a2a",
        padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#c8a96e", fontWeight: 700, letterSpacing: 2 }}>TAKASHO</span>
          <span style={{ color: "#444" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>ユーザー管理</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#666" }}>登録者数: <strong style={{ color: "#c8a96e" }}>{visitors.length}</strong></span>
          <button onClick={() => token && fetchVisitors(token)} style={{
            padding: "7px 16px", background: "#2a2a2a", border: "1px solid #444",
            borderRadius: 6, color: "#aaa", fontSize: 13, cursor: "pointer",
          }}>更新</button>
          <button onClick={logout} style={{
            padding: "7px 16px", background: "transparent", border: "1px solid #444",
            borderRadius: 6, color: "#888", fontSize: 13, cursor: "pointer",
          }}>ログアウト</button>
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・郵便番号で検索…"
            style={{
              width: 280, padding: "10px 14px", background: "#1e1e1e",
              border: "1px solid #333", borderRadius: 8, color: "#eee",
              fontSize: 14, outline: "none", boxSizing: "border-box" as const,
            }}
          />
        </div>

        {error && <div style={{ color: "#f66", marginBottom: 16 }}>{error}</div>}

        {loading ? (
          <div style={{ color: "#666", padding: 40, textAlign: "center" }}>読み込み中…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ color: "#555", padding: 40, textAlign: "center" }}>
                {search ? "検索結果なし" : "登録者なし"}
              </div>
            ) : (
              filtered.map((v, i) => {
                const items = parseItems(v.lastEstimateItems);
                const isOpen = expandedId === v.id;
                const totalWithTax = v.lastEstimateTotal ? Math.floor(v.lastEstimateTotal * 1.1) : null;

                return (
                  <div key={v.id} style={{
                    background: "#1a1a1a", border: "1px solid #2a2a2a",
                    borderRadius: 12, overflow: "hidden",
                  }}>
                    {/* Row */}
                    <div
                      onClick={() => setExpandedId(isOpen ? null : v.id)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 1fr 120px 160px 160px 80px 28px",
                        alignItems: "center",
                        padding: "14px 20px",
                        cursor: items.length > 0 ? "pointer" : "default",
                        background: isOpen ? "#1e1e1e" : "transparent",
                        gap: 12,
                      }}
                    >
                      <span style={{ color: "#555", fontSize: 12 }}>{i + 1}</span>
                      <strong style={{ color: "#eee", fontSize: 14 }}>{v.name}</strong>
                      <span style={{ color: "#c8a96e", fontFamily: "monospace", fontSize: 13 }}>〒{v.postalCode}</span>
                      <span style={{ color: "#666", fontSize: 12 }}>{formatDate(v.registeredAt)}</span>
                      <span style={{ color: "#888", fontSize: 12 }}>{formatDate(v.lastEstimateAt)}</span>
                      <span>
                        {(v.estimateCount ?? 0) > 0 ? (
                          <span style={{
                            display: "inline-block", padding: "2px 10px",
                            background: "#2a2a1a", border: "1px solid #c8a96e55",
                            borderRadius: 12, color: "#c8a96e", fontSize: 13, fontWeight: 700,
                          }}>{v.estimateCount}回</span>
                        ) : <span style={{ color: "#555", fontSize: 13 }}>—</span>}
                      </span>
                      <span style={{ color: items.length > 0 ? "#888" : "#333", fontSize: 16, textAlign: "right" }}>
                        {items.length > 0 ? (isOpen ? "▲" : "▼") : ""}
                      </span>
                    </div>

                    {/* Column header (once, above first row) */}
                    {i === 0 && !isOpen && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "32px 1fr 120px 160px 160px 80px 28px",
                        gap: 12, padding: "0 20px 4px",
                        borderTop: "1px solid #222",
                      }}>
                        {["#", "お名前", "郵便番号", "登録日時", "最終見積", "見積回数", ""].map((h) => (
                          <span key={h} style={{ fontSize: 11, color: "#555" }}>{h}</span>
                        ))}
                      </div>
                    )}

                    {/* Estimate detail */}
                    {isOpen && items.length > 0 && (
                      <div style={{ borderTop: "1px solid #2a2a2a", padding: "16px 20px 20px" }}>
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 700 }}>
                          最後の見積内容（{formatDate(v.lastEstimateAt)}）
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: "#222" }}>
                              <th style={thStyle}>商品名</th>
                              <th style={thStyle}>型番</th>
                              <th style={{ ...thStyle, textAlign: "center" }}>数量</th>
                              <th style={{ ...thStyle, textAlign: "right" }}>単価</th>
                              <th style={{ ...thStyle, textAlign: "right" }}>小計</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={idx} style={{ borderTop: "1px solid #222" }}>
                                <td style={tdStyle}>{item.name}</td>
                                <td style={{ ...tdStyle, color: "#888", fontFamily: "monospace" }}>{item.modelNo}</td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.quantity}</td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>¥{item.price.toLocaleString("ja-JP")}</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#c8a96e" }}>¥{item.subtotal.toLocaleString("ja-JP")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {v.lastEstimateTotal !== null && (
                          <div style={{
                            marginTop: 12, padding: "12px 16px", background: "#222",
                            borderRadius: 8, borderLeft: "3px solid #c8a96e",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              税別: ¥{v.lastEstimateTotal.toLocaleString("ja-JP")}　
                              消費税: ¥{Math.floor(v.lastEstimateTotal * 0.1).toLocaleString("ja-JP")}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#c8a96e" }}>
                              合計（税込）¥{totalWithTax?.toLocaleString("ja-JP")}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* ヘッダー行（テーブルの外に出す） */}
            {filtered.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 120px 160px 160px 80px 28px",
                gap: 12, padding: "4px 20px 0",
                order: -1,
              }}>
                {["#", "お名前", "郵便番号", "登録日時", "最終見積日時", "見積回数", ""].map((h) => (
                  <span key={h} style={{ fontSize: 11, color: "#555" }}>{h}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "9px 12px", textAlign: "left", fontSize: 11,
  fontWeight: 700, color: "#666", letterSpacing: 0.5,
};
const tdStyle: React.CSSProperties = {
  padding: "10px 12px", fontSize: 13, color: "#ccc",
};
