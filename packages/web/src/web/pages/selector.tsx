import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useEstimate } from "../hooks/useEstimate";
import { LocationIcon } from "../components/LocationIcon";
import type { Location, Category, Product } from "../types";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  SlidersHorizontal,
  Zap,
  Droplets,
  Sun,
  Palette,
  Trees,
  MapPin,
  Lightbulb,
  Shield,
  Thermometer,
  Layers,
  Radio,
  Ruler,
  Bolt,
  Info,
  Plug,
  Calculator,
  HelpCircle,
  ChevronDown,
  Wrench,
  BookMarked,
} from "lucide-react";

// ============================================================
// スペック定義 — アイコン・ラベル・ツールチップ・図解
// ============================================================
type SpecKey = "lumen" | "ipRating" | "colorTemp" | "style" | "beamAngle" | "reachDistance" | "voltage";

interface SpecDef {
  key: SpecKey;
  label: string;           // カード上のラベル
  icon: React.ReactNode;
  color: string;
  bg: string;
  tooltip: string;         // B: ホバー説明
  detailTitle: string;     // C: モーダルタイトル
  detailDesc: string;      // C: 詳細説明
  detailVisual: React.ReactNode; // C: 図解
}

const makeSpecDefs = (): Record<SpecKey, SpecDef> => ({
  lumen: {
    key: "lumen",
    label: "明るさ",
    icon: <Lightbulb size={11} />,
    color: "#c9a84c",
    bg: "rgba(201,168,76,0.12)",
    tooltip: "光束（ルーメン）。数値が大きいほど明るくなります。",
    detailTitle: "明るさ（lm／ルーメン）",
    detailDesc: "光源から出る光の総量です。数値が大きいほど広範囲を明るく照らせます。",
    detailVisual: (
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "center", padding: "12px 0" }}>
        {[{ lm: "200lm", h: 32, label: "控えめ" }, { lm: "600lm", h: 56, label: "標準" }, { lm: "1200lm", h: 80, label: "明るい" }].map(({ lm, h, label }) => (
          <div key={lm} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 40, height: h, background: "radial-gradient(ellipse at top, #ffe066 0%, #c9a84c 60%, transparent 100%)", borderRadius: "50% 50% 0 0", opacity: 0.85 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#c9a84c" }}>{lm}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>
    ),
  },
  ipRating: {
    key: "ipRating",
    label: "防水等級",
    icon: <Shield size={11} />,
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    tooltip: "IP（侵入保護）等級。屋外設置に必要な防塵・防水性能を示します。",
    detailTitle: "防水等級（IP等級）",
    detailDesc: "IPの後ろの2桁が性能を示します。最初の数字が防塵、次の数字が防水。数値が大きいほど高性能です。",
    detailVisual: (
      <div style={{ padding: "8px 0" }}>
        {[
          { rating: "IP44", dust: "防塵: 直径1mm以上の固体侵入を防ぐ", water: "防水: あらゆる方向の水の飛まつを防ぐ", use: "軒下・半屋外向け" },
          { rating: "IP54", dust: "防塵: 粉塵の侵入を防ぐ", water: "防水: あらゆる方向の水の飛まつを防ぐ", use: "屋外一般向け（標準）" },
          { rating: "IP65", dust: "防塵: 完全防塵", water: "防水: あらゆる方向からの噴流水を防ぐ", use: "雨ざらし・噴水周辺向け" },
          { rating: "IP67", dust: "防塵: 完全防塵", water: "防水: 一時的な水没に耐える", use: "地中埋込・水景設備向け" },
        ].map(({ rating, dust, water, use }) => (
          <div key={rating} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, padding: "8px 10px", background: "var(--color-surface2)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
            <div style={{ minWidth: 44, fontWeight: 700, fontSize: 13, color: "#4ade80", fontFamily: "'Oswald', sans-serif" }}>{rating}</div>
            <div style={{ flex: 1, fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              <div>🛡 {dust}</div>
              <div>💧 {water}</div>
              <div style={{ color: "var(--color-text)", marginTop: 2, fontWeight: 600 }}>🔰 防水・防塵対応 → {use}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  colorTemp: {
    key: "colorTemp",
    label: "光の色",
    icon: <Thermometer size={11} />,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    tooltip: "色温度（ケルビン）。数値が低いほど暖かみのある光、高いほど白い光になります。",
    detailTitle: "光の色（色温度）",
    detailDesc: "ケルビン（K）という単位で表します。庭・外構では暖かみのある電球色が人気です。",
    detailVisual: (
      <div style={{ padding: "8px 0" }}>
        <div style={{ display: "flex", height: 24, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ flex: 1, background: "linear-gradient(to right, #ff8c00, #ffd27a)" }} />
          <div style={{ flex: 1, background: "linear-gradient(to right, #ffd27a, #fff5cc)" }} />
          <div style={{ flex: 1, background: "linear-gradient(to right, #fff5cc, #e8f4ff)" }} />
          <div style={{ flex: 1, background: "linear-gradient(to right, #e8f4ff, #cce5ff)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {[
            { k: "2700K", name: "電球色", note: "温かみ・リラックス" },
            { k: "3000K", name: "温白色", note: "庭・エントランス定番" },
            { k: "4000K", name: "昼白色", note: "明るく自然な白" },
            { k: "6500K", name: "昼光色", note: "白く冷たい光" },
          ].map(({ k, name, note }) => (
            <div key={k} style={{ textAlign: "center", flex: 1, fontSize: 10, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 700, color: "var(--color-text)", fontSize: 11 }}>{k}</div>
              <div style={{ color: "#fbbf24", fontWeight: 600 }}>{name}</div>
              <div style={{ color: "var(--color-text-muted)" }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  style: {
    key: "style",
    label: "デザイン",
    icon: <Layers size={11} />,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    tooltip: "外観・デザインスタイル。建物の雰囲気に合わせてお選びください。",
    detailTitle: "デザインスタイル",
    detailDesc: "建物や庭のテイストに合わせて選ぶと統一感が出ます。",
    detailVisual: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "8px 0" }}>
        {[
          { name: "モダン", desc: "直線的・スリム。スタイリッシュな住宅に。", emoji: "🏢" },
          { name: "ナチュラル", desc: "木目・曲線。植栽や和洋ガーデンに。", emoji: "🌿" },
          { name: "クラシック", desc: "重厚感・装飾的。格式ある外構に。", emoji: "🏛" },
          { name: "和風", desc: "行灯・石灯籠風。和庭・数寄屋に。", emoji: "🏮" },
        ].map(({ name, desc, emoji }) => (
          <div key={name} style={{ padding: "8px 10px", background: "var(--color-surface2)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#a78bfa", marginBottom: 2 }}>{name}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  beamAngle: {
    key: "beamAngle",
    label: "照射角度",
    icon: <Radio size={11} />,
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    tooltip: "光が広がる角度。狭いほど遠くまで届き、広いほど範囲が広がります。",
    detailTitle: "照射角度（°）",
    detailDesc: "光が照らす広がりの角度です。スポットライトは狭く遠くへ、フラッドは広く手前を照らします。",
    detailVisual: (
      <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "8px 0" }}>
        {[
          { angle: 15, label: "スポット", desc: "15〜30°\n遠くをピンポイントで" },
          { angle: 45, label: "ナロー", desc: "30〜60°\n木・壁のポイント照射" },
          { angle: 90, label: "ミドル", desc: "60〜100°\n中間的な広がり" },
          { angle: 120, label: "ワイド", desc: "100°以上\n広範囲を均一に" },
        ].map(({ angle, label, desc }) => {
          const rad = (angle / 2) * Math.PI / 180;
          const h = 60;
          const w = Math.tan(rad) * h * 2;
          const clampedW = Math.min(w, 90);
          return (
            <div key={angle} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
              <svg width={90} height={h + 10} viewBox={`0 0 90 ${h + 10}`}>
                <polygon
                  points={`45,5 ${(90 - clampedW) / 2},${h + 5} ${(90 + clampedW) / 2},${h + 5}`}
                  fill="rgba(52,211,153,0.25)"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
                <circle cx="45" cy="5" r="3" fill="#34d399" />
              </svg>
              <div style={{ fontWeight: 700, fontSize: 11, color: "#34d399" }}>{label}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.3 }}>{desc}</div>
            </div>
          );
        })}
      </div>
    ),
  },
  reachDistance: {
    key: "reachDistance",
    label: "照射距離",
    icon: <Ruler size={11} />,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    tooltip: "光が効果的に届く最大距離の目安です。",
    detailTitle: "照射距離（m）",
    detailDesc: "ライトから照らしたい対象物までの距離の目安です。木や壁の高さ・距離に合った商品を選びましょう。",
    detailVisual: (
      <div style={{ padding: "8px 0" }}>
        {/* 3パターンを横並びで図解 */}
        <div style={{ display: "flex", gap: 10, justifyContent: "space-around", alignItems: "flex-end", marginBottom: 16 }}>
          {[
            { m: "1.5m", treeH: 44, label: "低木・石", eg: "植込み・石灯籠" },
            { m: "3m",   treeH: 72, label: "中木",     eg: "ソヨゴ・ハナミズキ" },
            { m: "6m",   treeH: 108, label: "高木",    eg: "ケヤキ・シマトネリコ" },
          ].map(({ m, treeH, label, eg }) => (
            <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              {/* 樹木シルエット */}
              <svg width={40} height={treeH} viewBox={`0 0 40 ${treeH}`} style={{ display: "block" }}>
                {/* 幹 */}
                <rect x={17} y={treeH - 14} width={6} height={14} rx={2} fill="#6b4226" />
                {/* 葉（三角形3段重ね） */}
                <polygon points={`20,4 34,${treeH - 14} 6,${treeH - 14}`} fill="#22863a" opacity={0.9} />
                <polygon points={`20,12 36,${treeH - 10} 4,${treeH - 10}`} fill="#2ea44f" opacity={0.7} />
              </svg>
              {/* 距離矢印 */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%", justifyContent: "center", margin: "4px 0 2px" }}>
                <div style={{ fontSize: 10, color: "#60a5fa" }}>💡</div>
                <div style={{ flex: 1, height: 1, background: "#60a5fa", margin: "0 2px", position: "relative" }}>
                  <div style={{ position: "absolute", right: -4, top: -3, fontSize: 8, color: "#60a5fa" }}>▶</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", whiteSpace: "nowrap" }}>{m}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)", textAlign: "center" }}>{label}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", textAlign: "center", lineHeight: 1.3, marginTop: 2 }}>{eg}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          💡 <strong style={{ color: "#60a5fa" }}>選び方のポイント：</strong>照らしたい木や壁の高さ・距離に近い値の商品を選ぶと、ちょうど対象物の頂上付近まで光が届きます。
        </div>
      </div>
    ),
  },
  voltage: {
    key: "voltage",
    label: "電圧",
    icon: <Bolt size={11} />,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    tooltip: "動作電圧。12V/24Vは低圧（専用トランス必要）、100Vは家庭用コンセント電源です。",
    detailTitle: "電圧（V）",
    detailDesc: "照明器具の動作電圧です。設置環境に合わせて選びます。",
    detailVisual: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
        {[
          { v: "12V", color: "#34d399", icon: "🔋", title: "12V（低圧）", desc: "専用トランスが必要。安全で配線が簡単。小〜中規模ガーデンに最適。" },
          { v: "24V", color: "#60a5fa", icon: "⚡", title: "24V（低圧）", desc: "専用トランスが必要。12Vより遠くまで送電可能。大規模ガーデン向け。" },
          { v: "100V", color: "#fb923c", icon: "🔌", title: "100V（家庭用）", desc: "通常のコンセント電源。工事が必要だが安定した電力供給。業務・公共施設向け。" },
        ].map(({ v, color, icon, title, desc }) => (
          <div key={v} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--color-surface2)", borderRadius: 8, border: `1px solid ${color}40` }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color, marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
});

// ============================================================
// A + B: SpecBadge — ラベル付きバッジ＋ホバーツールチップ
// ============================================================
function SpecBadge({
  specDef,
  value,
  onInfoClick,
}: {
  specDef: SpecDef;
  value: string;
  onInfoClick: (key: SpecKey) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
  };

  return (
    <>
      <span
        ref={ref}
        onClick={() => onInfoClick(specDef.key)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          background: specDef.bg,
          border: `1px solid ${specDef.color}40`,
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 11,
          color: specDef.color,
          cursor: "pointer",
          position: "relative",
          transition: "all 0.15s",
          userSelect: "none",
          ...(hovered ? { border: `1px solid ${specDef.color}`, boxShadow: `0 0 0 2px ${specDef.color}20`, background: specDef.bg.replace("0.12", "0.22") } : {}),
        }}
      >
        {specDef.icon}
        <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>{specDef.label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </span>
      {/* B: Tooltip */}
      {hovered && tooltipPos && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translate(-50%, -100%)",
            background: "var(--color-surface)",
            border: `1px solid ${specDef.color}50`,
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 11,
            color: "var(--color-text)",
            maxWidth: 200,
            lineHeight: 1.5,
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            marginBottom: 4,
          }}
        >
          <div style={{ fontWeight: 700, color: specDef.color, marginBottom: 2 }}>{specDef.label}</div>
          {specDef.tooltip}
        </div>
      )}
    </>
  );
}

// ============================================================
// SpecBadgeList — スペック一覧
// ============================================================
function SpecBadgeList({
  product,
  onInfoClick,
}: {
  product: Product & { voltage?: string };
  onInfoClick: (key: SpecKey) => void;
}) {
  const SPEC_DEFS = makeSpecDefs();
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {product.lumen && <SpecBadge specDef={SPEC_DEFS.lumen} value={`${product.lumen}lm`} onInfoClick={onInfoClick} />}
      {product.ipRating && <SpecBadge specDef={SPEC_DEFS.ipRating} value={product.ipRating} onInfoClick={onInfoClick} />}
      {product.colorTemp && <SpecBadge specDef={SPEC_DEFS.colorTemp} value={product.colorTemp.split(" ")[0]} onInfoClick={onInfoClick} />}
      {product.style && <SpecBadge specDef={SPEC_DEFS.style} value={product.style} onInfoClick={onInfoClick} />}
      {product.beamAngle && <SpecBadge specDef={SPEC_DEFS.beamAngle} value={`${product.beamAngle}°`} onInfoClick={onInfoClick} />}
      {product.reachDistance && <SpecBadge specDef={SPEC_DEFS.reachDistance} value={`${product.reachDistance}m`} onInfoClick={onInfoClick} />}
      {product.voltage && <SpecBadge specDef={SPEC_DEFS.voltage} value={product.voltage} onInfoClick={onInfoClick} />}
    </div>
  );
}

// ============================================================
// C: SpecDetailModal — 図解モーダル
// ============================================================
function SpecDetailModal({
  specKey,
  onClose,
}: {
  specKey: SpecKey | null;
  onClose: () => void;
}) {
  const SPEC_DEFS = makeSpecDefs();
  useEffect(() => {
    if (!specKey) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [specKey, onClose]);

  if (!specKey) return null;
  const def = SPEC_DEFS[specKey];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: `1px solid ${def.color}50`,
          borderRadius: 16,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${def.color}20`,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: def.bg, border: `1px solid ${def.color}50`, display: "flex", alignItems: "center", justifyContent: "center", color: def.color, transform: "scale(1.5)" }}>
              {def.icon}
            </div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text)", fontFamily: "'Noto Serif JP', serif" }}>
              {def.detailTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4, display: "flex", alignItems: "center" }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Description */}
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
          {def.detailDesc}
        </p>
        {/* Visual */}
        <div style={{ background: "var(--color-surface2)", borderRadius: 10, padding: "8px 12px", border: "1px solid var(--color-border)" }}>
          {def.detailVisual}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            width: "100%",
            background: def.bg,
            border: `1px solid ${def.color}50`,
            borderRadius: 8,
            padding: "10px",
            color: def.color,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

type Step = "location" | "category" | "products" | "estimate";
type SelectMode = "location" | "tree" | "shape" | "transformer";
type TreeStep = "height" | "lightType" | "beamAngleStep" | "voltageStep" | "results";
type ShapeStep = "select" | "products";

const PRICE_RANGES = [
  { label: "指定なし", min: 0, max: 999999 },
  { label: "〜¥10,000", min: 0, max: 10000 },
  { label: "¥10,000〜¥20,000", min: 10000, max: 20000 },
  { label: "¥20,000〜¥30,000", min: 20000, max: 30000 },
  { label: "¥30,000以上", min: 30000, max: 999999 },
];

const COLOR_TEMPS = ["指定なし", "電球色 2700K", "昼白色 4000K", "両対応"];
const STYLES = ["指定なし", "モダン", "ナチュラル", "クラシック", "和風"];

// 照射角度: 狭角(〜45°) / 中角(46〜120°) / 広角(121°〜)
const BEAM_ANGLES = [
  { label: "指定なし", min: 0, max: 999 },
  { label: "狭角 〜45° (スポット照射)", min: 0, max: 45 },
  { label: "中角 46〜120° (中距離照射)", min: 46, max: 120 },
  { label: "広角 121°〜 (エリア照射)", min: 121, max: 999 },
];

// 照射距離
const REACH_DISTANCES = [
  { label: "指定なし", min: 0, max: 999 },
  { label: "〜1m (足元・手元)", min: 0, max: 1.0 },
  { label: "1〜3m (近距離)", min: 1.0, max: 3.0 },
  { label: "3〜5m (中距離)", min: 3.0, max: 5.0 },
  { label: "5m〜 (遠距離)", min: 5.0, max: 999 },
];

// 樹木の高さカテゴリ (6段階)
const TREE_HEIGHTS = [
  {
    key: "tiny",
    label: "地被・草花",
    sublabel: "〜30cm",
    desc: "芝生・グランドカバー・草花・多年草",
    emoji: "🌿",
    example: "芝生・クローバー・ハーブ類",
    minReach: 0.3,
    maxReach: 1.0,
    categories: ["garden-uplight", "ground-light"],
    color: "#86efac",
  },
  {
    key: "low",
    label: "低木",
    sublabel: "30cm〜1m",
    desc: "ツツジ・サツキ・アベリアなど低灌木",
    emoji: "🌱",
    example: "ツツジ・サツキ・ローズマリー",
    minReach: 0.8,
    maxReach: 2.0,
    categories: ["garden-uplight", "ground-light"],
    color: "#4ade80",
  },
  {
    key: "medium",
    label: "中木",
    sublabel: "1〜3m",
    desc: "ドウダンツツジ・コデマリ・アジサイなど",
    emoji: "🌳",
    example: "ドウダン・コデマリ・ヒイラギ",
    minReach: 1.5,
    maxReach: 4.0,
    categories: ["garden-uplight", "ground-light"],
    color: "#22c55e",
  },
  {
    key: "tall",
    label: "高木",
    sublabel: "3〜6m",
    desc: "シンボルツリー・ヤマボウシ・モミジなど",
    emoji: "🌲",
    example: "ヤマボウシ・モミジ・シマトネリコ",
    minReach: 3.0,
    maxReach: 7.0,
    categories: ["garden-uplight"],
    color: "#16a34a",
  },
  {
    key: "large",
    label: "大高木",
    sublabel: "6〜10m",
    desc: "コニファー・ハナミズキ・ソヨゴなど大型樹木",
    emoji: "🎄",
    example: "コニファー・ハナミズキ・アラカシ",
    minReach: 5.0,
    maxReach: 12.0,
    categories: ["garden-uplight"],
    color: "#15803d",
  },
  {
    key: "huge",
    label: "巨木",
    sublabel: "10m〜",
    desc: "ケヤキ・クスノキ・ヤマザクラなど大型巨木",
    emoji: "🌴",
    example: "ケヤキ・クスノキ・ランドマーク樹木",
    minReach: 8.0,
    maxReach: 999,
    categories: ["garden-uplight"],
    color: "#166534",
  },
] as const;

// ライト種類 (ツリーフロー用)
const TREE_LIGHT_TYPES = [
  {
    key: "garden-uplight",
    label: "ガーデンアップライト",
    sublabel: "地面設置・スパイク型",
    desc: "地面に刺して植栽を下から照らす最も一般的なアップライト",
    icon: "🔆",
    color: "#4ade80",
    suitable: ["tiny", "low", "medium", "tall", "large", "huge"],
  },
  {
    key: "ground-light",
    label: "グランドライト",
    sublabel: "地中埋込型",
    desc: "地面に埋め込んで植栽をすっきり照らす埋込型ライト",
    icon: "⬆️",
    color: "#22c55e",
    suitable: ["tiny", "low", "medium"],
  },
  {
    key: "wall-spotlight",
    label: "ウォールアップライト",
    sublabel: "壁面・フェンス設置",
    desc: "壁やフェンスに取り付けて高い位置から植栽を照射",
    icon: "💡",
    color: "#86efac",
    suitable: ["tall", "large", "huge"],
  },
] as const;

// 照射角度ステップ (ツリーフロー用) ※カタログ記載の2種類のみ
const TREE_BEAM_ANGLES = [
  {
    key: "narrow",
    label: "狭角",
    sublabel: "〜45°",
    desc: "スポット照射で樹木のシルエットを際立たせる",
    detail: "幹や枝の一点にフォーカスし、ドラマチックなシャドーを演出。高木・大木に特に効果的。",
    icon: "▲",
    minAngle: 0,
    maxAngle: 45,
    color: "#f59e0b",
    image: "/images/beam/narrow.png",
  },
  {
    key: "wide",
    label: "広角",
    sublabel: "120°〜",
    desc: "ウォッシュ照射でエリア全体を均一に照らす",
    detail: "広い面積に光を拡散し、地被・低木のエリアをふんわりと照明。グランドカバーや低木列に最適。",
    icon: "⬛",
    minAngle: 120,
    maxAngle: 999,
    color: "#60a5fa",
    image: "/images/beam/wide.png",
  },
] as const;

// 電圧ステップ (ツリーフロー用)
const TREE_VOLTAGES = [
  {
    key: "12V",
    label: "12V ローボルト",
    sublabel: "タカショー低圧システム",
    desc: "安全・省エネ。DIYでも設置しやすい低電圧システム",
    detail: "感電リスクが低く、配線工事が不要なケースも。家庭の庭に最適な省エネシステム。",
    icon: "🔋",
    color: "#4ade80",
    tags: ["安全", "省エネ", "DIY可"],
  },
  {
    key: "24V",
    label: "24V ローボルト",
    sublabel: "タカショー中圧システム",
    desc: "12Vより高輝度。中〜大型樹木に対応する中圧システム",
    detail: "より長い配線にも電圧降下が少なく、広い庭や複数灯の連結に適したシステム。",
    icon: "⚡",
    color: "#fbbf24",
    tags: ["高輝度", "長距離配線", "連結対応"],
  },
  {
    key: "100V",
    label: "100V 商用電源",
    sublabel: "一般家庭用コンセント",
    desc: "最高輝度。大型・巨木照明や本格的な演出に",
    detail: "一般家庭のコンセントから電源を取る最大出力タイプ。電気工事士による施工推奨。",
    icon: "🔌",
    color: "#f87171",
    tags: ["最高輝度", "大型対応", "施工推奨"],
  },
] as const;

// ============================================================
// トランスガイド — 商品データ
// ============================================================

const TRANSFORMER_PRODUCTS = [
  // ── 24V タイマートランス（コンセントタイプ）──
  {
    id: "HEA-032",
    modelNoS: "HEA-032S",
    modelNoK: "HEA-032K",
    name: "24V タイマートランス 15W",
    voltage: "24V" as const,
    watt: 15,
    price: 15000,
    maxBranch: 2,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "【2026年6月発売予定】",
    ip: "IP43",
    color: "#4ade80",
    badge: "NEW",
  },
  {
    id: "HEA-034",
    modelNoS: "HEA-034S",
    modelNoK: "HEA-034K",
    name: "24V タイマートランス 35W",
    voltage: "24V" as const,
    watt: 35,
    price: 18500,
    maxBranch: 4,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "",
    ip: "IP43",
    color: "#4ade80",
    badge: "",
  },
  {
    id: "HEA-035",
    modelNoS: "HEA-035S",
    modelNoK: "HEA-035K",
    name: "24V タイマートランス 75W",
    voltage: "24V" as const,
    watt: 75,
    price: 33000,
    maxBranch: 4,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "",
    ip: "IP43",
    color: "#4ade80",
    badge: "",
  },
  {
    id: "HEA-029",
    modelNoS: "HEA-029S",
    modelNoK: "HEA-029K",
    name: "24V タイマートランス 150W",
    voltage: "24V" as const,
    watt: 150,
    price: 59000,
    maxBranch: 7,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "",
    ip: "IP43",
    color: "#4ade80",
    badge: "",
  },
  {
    id: "HEA-030",
    modelNoS: "HEA-030S",
    modelNoK: "",
    name: "24V タイマートランス 300W",
    voltage: "24V" as const,
    watt: 300,
    price: 82000,
    maxBranch: 8,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "",
    ip: "IP43",
    color: "#4ade80",
    badge: "",
  },
  // ── 24V タイマートランス 直結タイプ ──
  {
    id: "HEA-033",
    modelNoS: "HEA-033S",
    modelNoK: "HEA-033K",
    name: "24V タイマートランス 35W（直結仕様）",
    voltage: "24V" as const,
    watt: 35,
    price: 18500,
    maxBranch: 4,
    type: "timer" as const,
    plug: "direct" as const,
    note: "有資格者による電気工事が必要",
    ip: "IP43",
    color: "#60a5fa",
    badge: "",
  },
  // ── 24V シンプルトランス（常時出力）──
  {
    id: "HEA-031",
    modelNoS: "HEA-031S",
    modelNoK: "",
    name: "24V シンプルトランス 300W",
    voltage: "24V" as const,
    watt: 300,
    price: 75000,
    maxBranch: 8,
    type: "simple" as const,
    plug: "direct" as const,
    note: "有資格者による電気工事が必要",
    ip: "IP43",
    color: "#fbbf24",
    badge: "",
  },
  // ── 12V タイマートランス（生産完了品）──
  {
    id: "HEA-024",
    modelNoS: "HEA-024S",
    modelNoK: "HEA-024K",
    name: "12V タイマートランス 15W",
    voltage: "12V" as const,
    watt: 15,
    price: 15000,
    maxBranch: 2,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "生産完了品・在庫確認要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
  {
    id: "HEA-025",
    modelNoS: "HEA-025S",
    modelNoK: "HEA-025K",
    name: "12V タイマートランス 35W",
    voltage: "12V" as const,
    watt: 35,
    price: 18500,
    maxBranch: 4,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "生産完了品・在庫確認要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
  {
    id: "HEA-026",
    modelNoS: "HEA-026S",
    modelNoK: "HEA-026K",
    name: "12V タイマートランス 75W",
    voltage: "12V" as const,
    watt: 75,
    price: 33000,
    maxBranch: 4,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "生産完了品・在庫確認要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
  {
    id: "HEA-027",
    modelNoS: "HEA-027S",
    modelNoK: "HEA-027K",
    name: "12V タイマートランス 150W",
    voltage: "12V" as const,
    watt: 150,
    price: 59000,
    maxBranch: 7,
    type: "timer" as const,
    plug: "outlet" as const,
    note: "生産完了品・在庫確認要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
  {
    id: "HEA-028",
    modelNoS: "HEA-028S",
    modelNoK: "HEA-028K",
    name: "12V タイマートランス 35W（直結仕様）",
    voltage: "12V" as const,
    watt: 35,
    price: 18500,
    maxBranch: 4,
    type: "timer" as const,
    plug: "direct" as const,
    note: "生産完了品・在庫確認要 / 有資格者による電気工事が必要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
  // ── 12V シンプルトランス（生産完了品）──
  {
    id: "HEA-022",
    modelNoS: "HEA-022S",
    modelNoK: "HEA-022K",
    name: "12V シンプルトランス 35W",
    voltage: "12V" as const,
    watt: 35,
    price: 14500,
    maxBranch: 4,
    type: "simple" as const,
    plug: "outlet" as const,
    note: "生産完了品・在庫確認要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
  {
    id: "HEA-023",
    modelNoS: "HEA-023S",
    modelNoK: "HEA-023K",
    name: "12V シンプルトランス 75W",
    voltage: "12V" as const,
    watt: 75,
    price: 29000,
    maxBranch: 4,
    type: "simple" as const,
    plug: "outlet" as const,
    note: "生産完了品・在庫確認要",
    ip: "IP43",
    color: "#f87171",
    badge: "生産終了",
  },
] as const;

// ── トランス計算機コンポーネント ──
function TransformerCalculator() {
  const [lightCount, setLightCount] = useState(1);
  const [wattPerLight, setWattPerLight] = useState(5);
  const [voltage, setVoltage] = useState<"24V" | "12V">("24V");
  const [hoursPerDay, setHoursPerDay] = useState(5);

  const totalW = lightCount * wattPerLight;
  // 合計W × 1.4 の安全係数で推奨トランスを決定
  const safeW = totalW * 1.4;
  // 月額電気代目安 (27円/kWh、31日)
  const monthlyKwh = (totalW / 1000) * hoursPerDay * 31;
  const monthlyCost = Math.round(monthlyKwh * 27);

  const recommended = TRANSFORMER_PRODUCTS.filter(
    (t) =>
      t.voltage === voltage &&
      t.watt >= safeW &&
      t.type === "timer" &&
      t.plug === "outlet"
  ).sort((a, b) => a.watt - b.watt)[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 警告：12V終了 */}
      {voltage === "12V" && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f87171", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span>12V仕様は2028年度より取り扱い終了予定です。新規設計には24Vをおすすめします。</span>
        </div>
      )}

      {/* 電圧選択 */}
      <div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 600 }}>使用するシステム</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["24V", "12V"] as const).map(v => (
            <button
              key={v}
              onClick={() => setVoltage(v)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, fontWeight: 700,
                transition: "all 0.2s",
                background: voltage === v ? (v === "24V" ? "#4ade80" : "#f87171") : "var(--color-surface2)",
                color: voltage === v ? "#ffffff" : "var(--color-text-muted)",
              }}
            >
              {v} {v === "24V" ? "推奨" : "（終了予定）"}
            </button>
          ))}
        </div>
      </div>

      {/* 照明の数 */}
      <div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 600 }}>
          照明の数：<span style={{ color: "var(--color-accent)", fontSize: 16 }}>{lightCount}</span>灯
        </div>
        <input
          type="range" min={1} max={40} value={lightCount}
          onChange={e => setLightCount(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--color-accent)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
          <span>1灯</span><span>40灯</span>
        </div>
      </div>

      {/* 1灯あたりのW数 */}
      <div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 600 }}>
          1灯あたりの消費電力：<span style={{ color: "var(--color-accent)", fontSize: 16 }}>{wattPerLight}W</span>
        </div>
        <input
          type="range" min={1} max={20} value={wattPerLight}
          onChange={e => setWattPerLight(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--color-accent)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
          <span>1W</span><span>20W</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
          ※ 商品の「消費電力」欄の数値を入力してください（カタログP.330参照）
        </div>
      </div>

      {/* 1日の点灯時間 */}
      <div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 600 }}>
          1日の点灯時間：<span style={{ color: "var(--color-accent)", fontSize: 16 }}>{hoursPerDay}</span>時間
        </div>
        <input
          type="range" min={1} max={12} value={hoursPerDay}
          onChange={e => setHoursPerDay(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--color-accent)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
          <span>1時間</span><span>12時間</span>
        </div>
      </div>

      {/* 計算結果 */}
      <div style={{ background: "var(--color-surface2)", borderRadius: 12, padding: "16px 20px", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>合計W数</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{totalW}<span style={{ fontSize: 13, marginLeft: 2 }}>W</span></div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--color-border)", borderRight: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>安全係数 ×1.4</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: "#fbbf24" }}>{safeW.toFixed(1)}<span style={{ fontSize: 13, marginLeft: 2 }}>W</span></div>
          </div>
          <div style={{ textAlign: "center", borderRight: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>必要容量</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--color-accent)" }}>{Math.ceil(safeW)}<span style={{ fontSize: 13, marginLeft: 2 }}>W以上</span></div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>月の電気料金目安</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: "#34d399" }}>¥{monthlyCost.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 2 }}>約{monthlyKwh.toFixed(1)}kWh/月</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 12 }}>
          ※ 電気料金目安：{hoursPerDay}時間/日 × 31日 × 27円/kWh で算出（概算）
        </div>

        {/* 推奨トランス */}
        {recommended ? (
          <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, marginBottom: 3 }}>✅ 推奨トランス</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>{recommended.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{recommended.modelNoS} / {recommended.modelNoK}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--color-accent)" }}>
                ¥{recommended.price.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>税別</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
            ⚠️ 選択した条件のトランスが見つかりません。複数のトランスを分岐してお使いください。
          </div>
        )}
      </div>
    </div>
  );
}

// ── アコーディオンコンポーネント ──
function Accordion({ title, icon, defaultOpen = false, children }: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: open ? "rgba(201,168,76,0.06)" : "var(--color-surface)",
          border: "none", padding: "16px 20px", cursor: "pointer",
          fontFamily: "'Noto Sans JP', sans-serif",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--color-text)", fontSize: 15, fontWeight: 700 }}>
          <span style={{ color: "var(--color-accent)" }}>{icon}</span>
          {title}
        </div>
        <div style={{ color: "var(--color-text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <ChevronDown size={18} />
        </div>
      </button>
      {open && (
        <div style={{ padding: "20px 24px", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── トランスガイド全体 ──
function TransformerGuide() {
  const [filterVoltage, setFilterVoltage] = useState<"all" | "24V" | "12V">("24V");
  const [filterType, setFilterType] = useState<"all" | "timer" | "simple">("all");

  const filteredProducts = TRANSFORMER_PRODUCTS.filter(p => {
    if (filterVoltage !== "all" && p.voltage !== filterVoltage) return false;
    if (filterType !== "all" && p.type !== filterType) return false;
    return true;
  });

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800 }}>

      {/* ヘッダー */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>
          <span style={{ color: "var(--color-accent)" }}>ローボルト®</span> トランスガイド
        </h2>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
          ローボルトシステムの仕組みと、あなたの庭に最適なトランスの選び方を解説します。
        </p>
      </div>

      {/* 1. ローボルトとは */}
      <Accordion title="ローボルト®とは？ — 12V/24Vで安全・省エネ" icon={<Zap size={18} />} defaultOpen={true}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            ローボルト®とは、家庭用の100V電源をトランスで12Vまたは24Vに降圧して照明を点灯させるタカショー独自のシステムです。
            低電圧のため感電リスクが低く、電気工事士の資格がない方でも配線できます（直結タイプを除く）。
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { v: "12V", color: "#f87171", icon: "🔋", title: "12V システム", desc: "コンパクトな住宅・ガーデン向け。配線距離は最大16m。2028年度より取り扱い終了予定。", tag: "終了予定" },
              { v: "24V S", color: "#4ade80", icon: "⚡", title: "24V S システム", desc: "標準的な住宅庭園向け。最大延長32m（25W使用時）。ガーデン用コードも使用可能。", tag: "推奨" },
              { v: "24V L", color: "#60a5fa", icon: "🌐", title: "24V L システム", desc: "ランドスケープ用コード採用で最大延長86.4m。大規模な施設・公共空間向け。", tag: "大規模" },
            ].map(item => (
              <div key={item.v} style={{ background: "var(--color-surface2)", border: `1px solid ${item.color}40`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: item.color }}>{item.title}</div>
                    <div style={{ fontSize: 10, background: `${item.color}20`, color: item.color, borderRadius: 4, padding: "1px 6px", display: "inline-block", marginTop: 2 }}>{item.tag}</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 配線距離比較 */}
          <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 10 }}>📏 最大配線距離の比較（25W使用時）</div>
            {[
              { label: "12V", dist: 16, max: 86.4, color: "#f87171" },
              { label: "24V S（ガーデン用コード）", dist: 32, max: 86.4, color: "#4ade80" },
              { label: "24V L（ランドスケープ用コード）", dist: 86.4, max: 86.4, color: "#60a5fa" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ minWidth: 200, fontSize: 12, color: "var(--color-text-muted)" }}>{item.label}</div>
                <div style={{ flex: 1, height: 12, background: "var(--color-surface2)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${(item.dist / item.max) * 100}%`, height: "100%", background: item.color, borderRadius: 6, transition: "width 0.5s" }} />
                </div>
                <div style={{ minWidth: 48, fontSize: 13, fontWeight: 700, color: item.color }}>{item.dist}m</div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* 2. トランスとは */}
      <Accordion title="トランスとは？ — 仕組みと役割" icon={<Plug size={18} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            トランスは、コンセントの100V電源を低電圧（12V/24V）に変換する装置です。
            照明器具本体に直接電気を接続するのではなく、必ずトランスを経由させることで安全性と省エネを両立します。
          </p>

          {/* 仕組み図 */}
          <div style={{ background: "var(--color-surface2)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "コンセント", sub: "100V", icon: "🔌", color: "#fb923c" },
              { arrow: true },
              { label: "トランス", sub: "変圧・自動管理", icon: "📦", color: "var(--color-accent)" },
              { arrow: true },
              { label: "コード配線", sub: "12V / 24V", icon: "🔗", color: "#60a5fa" },
              { arrow: true },
              { label: "照明器具", sub: "安全点灯", icon: "💡", color: "#4ade80" },
            ].map((item, i) => (
              "arrow" in item ? (
                <div key={i} style={{ fontSize: 18, color: "var(--color-text-muted)", padding: "0 6px" }}>→</div>
              ) : (
                <div key={i} style={{ textAlign: "center", padding: "8px 12px" }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{item.sub}</div>
                </div>
              )
            ))}
          </div>

          {/* タイマー・センサー機能 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { icon: "🌙", title: "照度センサー自動点灯", desc: "日暮れとともに自動で点灯。5段階の感度調整が可能。" },
              { icon: "⏰", title: "タイマー消灯", desc: "日没後1〜10時間後に自動消灯、または終夜点灯を選択。" },
              { icon: "🔄", title: "常時点灯回路", desc: "センサー回路とは別に常時通電する回路を内蔵。センサーライトと組み合わせ可能。" },
              { icon: "🎨", title: "調光対応（24Vのみ）", desc: "24Vシステムはローボルト調光に対応。雰囲気に合わせた明るさ調節が可能。" },
            ].map(item => (
              <div key={item.title} style={{ background: "var(--color-surface2)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* 3. 選び方 + 計算機 */}
      <Accordion title="トランスの選び方 — 消費W数を計算しよう" icon={<Calculator size={18} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--color-accent)" }}>選び方の基本：</strong><br />
            ① 使用する照明器具の消費電力（W）をカタログで確認<br />
            ② 全灯の合計W数を計算（例：5W × 6灯 = 30W）<br />
            ③ 合計W数の <strong style={{ color: "#fbbf24" }}>1.4倍以上</strong> の容量のトランスを選ぶ（余裕を持たせる）<br />
            ④ 設置場所の電源（コンセント or 直結）に合ったタイプを選ぶ
          </div>

          <TransformerCalculator />
        </div>
      </Accordion>

      {/* 4. 商品一覧 */}
      <Accordion title="トランス商品一覧" icon={<BookMarked size={18} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* フィルター */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>電圧：</span>
              {(["all", "24V", "12V"] as const).map(v => (
                <button key={v} onClick={() => setFilterVoltage(v)} style={{
                  padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: filterVoltage === v ? "var(--color-accent)" : "var(--color-surface2)",
                  color: filterVoltage === v ? "#ffffff" : "var(--color-text-muted)",
                }}>
                  {v === "all" ? "すべて" : v}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>タイプ：</span>
              {(["all", "timer", "simple"] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)} style={{
                  padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: filterType === t ? "var(--color-accent)" : "var(--color-surface2)",
                  color: filterType === t ? "#ffffff" : "var(--color-text-muted)",
                }}>
                  {t === "all" ? "すべて" : t === "timer" ? "タイマー付" : "シンプル（常時）"}
                </button>
              ))}
            </div>
          </div>

          {/* 24V推奨バナー */}
          {filterVoltage !== "12V" && (
            <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#4ade80" }}>
              💡 2028年度より12V仕様は終了。新規設置には24Vシステムを推奨します。
            </div>
          )}

          {/* 商品グリッド */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: "var(--color-surface2)",
                  border: `1px solid ${product.color}30`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  position: "relative",
                  opacity: product.badge === "生産終了" ? 0.7 : 1,
                }}
              >
                {product.badge && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: product.badge === "NEW" ? "var(--color-accent)" : "rgba(248,113,113,0.8)",
                    color: product.badge === "NEW" ? "#ffffff" : "#fff",
                    borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                  }}>
                    {product.badge}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${product.color}20`, border: `1px solid ${product.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plug size={18} style={{ color: product.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginBottom: 1 }}>
                      {product.modelNoS}{product.modelNoK ? ` / ${product.modelNoK}` : ""}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.3 }}>{product.name}</div>
                  </div>
                </div>

                {/* スペックバッジ */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: `${product.color}15`, color: product.color, fontWeight: 600 }}>
                    {product.voltage}
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(251,146,60,0.1)", color: "#fb923c", fontWeight: 600 }}>
                    {product.watt}W
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(96,165,250,0.1)", color: "#60a5fa", fontWeight: 600 }}>
                    最大{product.maxBranch}分岐
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--color-surface)", color: "var(--color-text-muted)", fontWeight: 600 }}>
                    {product.type === "timer" ? "タイマー付" : "常時出力"}
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--color-surface)", color: "var(--color-text-muted)", fontWeight: 600 }}>
                    {product.plug === "outlet" ? "コンセント" : "直結"}
                  </span>
                </div>

                {product.note && (
                  <div style={{ fontSize: 11, color: product.badge === "生産終了" ? "#f87171" : "#fbbf24", marginBottom: 8, lineHeight: 1.5 }}>
                    ※ {product.note}
                  </div>
                )}

                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 600, color: "var(--color-accent)" }}>
                  ¥{product.price.toLocaleString()}
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 4, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>税別</span>
                </div>
              </div>
            ))}
          </div>

          {/* コンバータ */}
          <div style={{ background: "var(--color-surface2)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "16px 18px", marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>🔄 24V用コンバータ（HEC-027S / HEC-034K）</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 8 }}>
              12V専用ライトを24Vトランスで使用できるようにする変換アダプタ。許容W数：10W。
            </div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 600, color: "var(--color-accent)" }}>¥8,000 <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>税別</span></div>
          </div>
        </div>
      </Accordion>

      {/* 5. 配線・施工の基本 */}
      <Accordion title="配線・施工の基本" icon={<Wrench size={18} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {[
              { step: "1", title: "コードを選ぶ", icon: "🔌", items: ["ガーデン用コード φ7.4mm（1.25sq）— 地上・地中・水中対応", "ランドスケープ用コード φ9.5mm（3.5sq）— 電圧降下に強く長距離向け", "調光対応コード — 調光システム使用時"] },
              { step: "2", title: "配線ルートを決める", icon: "🗺️", items: ["地上配線：そのままコードを這わせる", "地中配線：土中を直接通線可能", "コンクリート・モルタル：配管工事が必要"] },
              { step: "3", title: "接続・結線する", icon: "🔗", items: ["ドライコーン：ねじって差し込むだけ（防水）", "ワンタッチ端子：差し込んでパチっと固定", "圧着閉端子：より確実な結線に"] },
              { step: "4", title: "分岐・ジャンクション", icon: "🔀", items: ["ジャンクションボックスで分岐を整理", "地上スパイク型・壁面スリム型など設置場所に合わせて選択"] },
            ].map(item => (
              <div key={item.step} style={{ background: "var(--color-surface2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>{item.title}</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                  {item.items.map((it, i) => (
                    <li key={i} style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#60a5fa", lineHeight: 1.6 }}>
            💡 直結タイプのトランスや、コンクリート・モルタルへの配管工事は電気工事士の資格が必要です。コンセントタイプであれば資格不要でDIY設置が可能です。
          </div>
        </div>
      </Accordion>

      {/* 6. よくある質問 */}
      <Accordion title="よくある質問" icon={<HelpCircle size={18} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { q: "12Vと24Vどちらを選べばいいですか？", a: "新規設置は24Vを推奨します。12Vは2028年度より取り扱いが終了します。24Vは配線距離が2倍（最大32m）で電圧降下も起きにくく、既存の12V照明も「24Vコンバータ（HEC-027S）」で使用できます。" },
            { q: "トランスは屋外に設置できますか？", a: "はい。IP43の防塵・防雨性能を持ち、屋外への設置が可能です。外壁への取り付けはシルバーまたはブラックを選べます。直射日光や浸水する場所への設置は避けてください。" },
            { q: "タイマートランスとシンプルトランスの違いは？", a: "タイマートランスは照度センサー（自動点灯）とタイマー（自動消灯）を内蔵しています。シンプルトランスは常時出力で、別途タイマーを接続することも可能です（300Wのみ）。一般家庭にはタイマートランスを推奨します。" },
            { q: "合計W数の計算が面倒です。", a: "上の「トランスの選び方」セクションにある計算機をご利用ください。灯数と1灯あたりのW数を入力するだけで推奨トランスが表示されます。" },
            { q: "コンセントタイプと直結タイプの違いは？", a: "コンセントタイプは家庭用コンセントに挿すだけで設置でき、電気工事士の資格は不要です。直結タイプは壁内の電源に直接配線するため、電気工事士による施工が必要です。見た目がすっきりします。" },
            { q: "1つのトランスに何灯まで接続できますか？", a: "照明器具の合計W数がトランスの容量×70%以内に収まるよう計算してください（安全係数1.4倍）。また各トランスの最大分岐数（2〜8分岐）も確認が必要です。" },
          ].map((faq, i) => (
            <div key={i} style={{ background: "var(--color-surface2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", marginBottom: 6 }}>Q. {faq.q}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.7 }}>A. {faq.a}</div>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

// ============================================================
// 形状カテゴリ定義
// ============================================================
const SHAPE_CATEGORIES = [
  {
    slug: "garden-uplight",
    name: "ガーデンアップライト",
    emoji: "🌿",
    desc: "植栽・樹木を下から照らすアップライト",
    note: "樹木・低木の演出に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/010/main1.jpg",
    color: "#4ade80",
  },
  {
    slug: "wall-spotlight",
    name: "ウォールスポットライト",
    emoji: "💡",
    desc: "壁面・外構をスポット照射",
    note: "外壁・フェンスのアクセントに",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/003/main1.jpg",
    color: "#fbbf24",
  },
  {
    slug: "wall-light",
    name: "ウォールライト",
    emoji: "🏠",
    desc: "外壁・門柱に取り付ける壁面照明",
    note: "エントランス・外壁照明に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/001/main1.jpg",
    color: "#c9a84c",
  },
  {
    slug: "ground-light",
    name: "地中埋込型ライト",
    emoji: "⭕",
    desc: "地面に埋め込んで使用するライト",
    note: "地面からのライトアップに",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/005/main1.jpg",
    color: "#34d399",
  },
  {
    slug: "pole-light",
    name: "ポールライト",
    emoji: "🗼",
    desc: "ポールに取り付ける外構照明",
    note: "アプローチ・駐車場に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/008/main1.jpg",
    color: "#60a5fa",
  },
  {
    slug: "path-stand-light",
    name: "パススタンドライト",
    emoji: "🚶",
    desc: "アプローチ・小道を照らすスタンドライト",
    note: "足元照明・誘導灯に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/007/main1.jpg",
    color: "#a78bfa",
  },
  {
    slug: "path-light",
    name: "パスライト",
    emoji: "👣",
    desc: "足元を照らすローボルトパスライト",
    note: "玄関アプローチ・歩道に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/009/main1.jpg",
    color: "#fb923c",
  },
  {
    slug: "water-light",
    name: "ウォーターライト",
    emoji: "💧",
    desc: "水中・水景設備用の防水照明",
    note: "池・噴水・ウォーターガーデンに",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/011/main1.jpg",
    color: "#38bdf8",
  },
  {
    slug: "downlight",
    name: "ダウンライト",
    emoji: "⬇️",
    desc: "天井・軒下から下向きに照らす照明",
    note: "テラス・軒下・カーポートに",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/012/main1.jpg",
    color: "#f472b6",
  },
  {
    slug: "rail-light",
    name: "レールライト",
    emoji: "🚃",
    desc: "レール式で向きを自由に調整できる照明",
    note: "エクステリア天井・フレームに",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/013/main1.jpg",
    color: "#94a3b8",
  },
  {
    slug: "deck-light",
    name: "デッキライト",
    emoji: "🪵",
    desc: "ウッドデッキ・フェンスに埋め込む照明",
    note: "デッキ床・フェンス壁面に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/014/main1.jpg",
    color: "#d97706",
  },
  {
    slug: "foot-light",
    name: "フットライト",
    emoji: "🦶",
    desc: "足元・階段段差を照らす小型照明",
    note: "階段・段差の安全照明に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/006/main1.jpg",
    color: "#10b981",
  },
  {
    slug: "gate-light",
    name: "門柱灯",
    emoji: "🏮",
    desc: "門柱・門扉まわりに設置する照明",
    note: "表札灯・門まわり照明に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/002/main1.jpg",
    color: "#c9a84c",
  },
  {
    slug: "carport-light",
    name: "カーポートライト",
    emoji: "🚗",
    desc: "カーポート天井・梁に取り付ける照明",
    note: "車庫・駐車スペースに",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/004/main1.jpg",
    color: "#64748b",
  },
  {
    slug: "solar-light",
    name: "ソーラーライト",
    emoji: "☀️",
    desc: "太陽光で充電・配線不要のソーラー照明",
    note: "配線なし・DIY設置に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/018/main1.jpg",
    color: "#eab308",
  },
  {
    slug: "decoration-light",
    name: "デコレーションライト",
    emoji: "✨",
    desc: "ガーデンのアクセント・装飾用照明",
    note: "イルミネーション・演出に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/015/main1.jpg",
    color: "#e879f9",
  },
  {
    slug: "japanese-light",
    name: "和風ライト",
    emoji: "⛩️",
    desc: "和のテイストを演出する行灯・石灯籠風照明",
    note: "和庭・和モダン外構に",
    imageUrl: "https://takasho-digitec.jp/lighting/wp-content/themes/takashodigitec_ge/assets/img/site/4100_products_detail/017/main1.jpg",
    color: "#b45309",
  },
] as const;

export default function SelectorPage() {
  const [step, setStep] = useState<Step>("location");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const [userName, setUserName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("userName") || "" : ""));
  const [postalCode, setPostalCode] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("postalCode") || "" : ""));
  const [userInfoConfirmed, setUserInfoConfirmed] = useState(() => typeof window !== "undefined" ? !!(localStorage.getItem("userName") && localStorage.getItem("postalCode")) : false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [selectedMaker, setSelectedMaker] = useState<"ALL" | "TAKASHO" | "LIXIL">("ALL");
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [colorTemp, setColorTemp] = useState("指定なし");
  const [style, setStyle] = useState("指定なし");
  const [showFilters, setShowFilters] = useState(false);
  const [beamAngle, setBeamAngle] = useState(BEAM_ANGLES[0]);
  const [reachDistance, setReachDistance] = useState(REACH_DISTANCES[0]);
  const [estimateResult, setEstimateResult] = useState<{
    items: { product: Product; quantity: number; subtotal: number }[];
    total: number;
  } | null>(null);

  const [, setNavLocation] = useLocation();

  // Tree flow state
  const [selectMode, setSelectMode] = useState<SelectMode>("location");
  const [treeStep, setTreeStep] = useState<TreeStep>("height");
  const [selectedTreeHeight, setSelectedTreeHeight] = useState<typeof TREE_HEIGHTS[number] | null>(null);
  const [selectedTreeLightType, setSelectedTreeLightType] = useState<typeof TREE_LIGHT_TYPES[number] | null>(null);
  const [selectedTreeBeamAngle, setSelectedTreeBeamAngle] = useState<typeof TREE_BEAM_ANGLES[number] | null>(null);
  const [selectedTreeVoltage, setSelectedTreeVoltage] = useState<typeof TREE_VOLTAGES[number] | null>(null);
  const [treePriceRange, setTreePriceRange] = useState(PRICE_RANGES[0]);
  const [treeColorTemp, setTreeColorTemp] = useState("指定なし");

  // C: スペック図解モーダル
  const [activeSpecKey, setActiveSpecKey] = useState<SpecKey | null>(null);

  // 形状フロー
  const [shapeStep, setShapeStep] = useState<ShapeStep>("select");
  const [selectedShape, setSelectedShape] = useState<typeof SHAPE_CATEGORIES[number] | null>(null);
  const [shapePriceRange, setShapePriceRange] = useState(PRICE_RANGES[0]);
  const [shapeColorTemp, setShapeColorTemp] = useState("指定なし");
  const [shapeStyle, setShapeStyle] = useState("指定なし");

  const { items, addItem, removeItem, updateQuantity, clearItems, totalCount } = useEstimate();

  // Queries
  const { data: locationsData, isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await api.locations.$get()).json(),
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", selectedLocation?.slug],
    queryFn: async () =>
      (await api.locations[":slug"].categories.$get({ param: { slug: selectedLocation!.slug } })).json(),
    enabled: !!selectedLocation,
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", selectedCategory?.slug, priceRange, colorTemp, style, beamAngle, reachDistance, selectedMaker],
    queryFn: async () => {
      const params: Record<string, string> = {
        category: selectedCategory!.slug,
      };
      if (priceRange.min > 0) params.minPrice = priceRange.min.toString();
      if (priceRange.max < 999999) params.maxPrice = priceRange.max.toString();
      if (colorTemp !== "指定なし") params.colorTemp = colorTemp;
      if (style !== "指定なし") params.style = style;
      if (beamAngle.max < 999) params.maxBeamAngle = beamAngle.max.toString();
      if (beamAngle.min > 0) params.minBeamAngle = beamAngle.min.toString();
      if (reachDistance.max < 999) params.maxReach = reachDistance.max.toString();
      if (reachDistance.min > 0) params.minReach = reachDistance.min.toString();
      if (selectedMaker !== "ALL") params.maker = selectedMaker;
      return (await api.products.$get({ query: params })).json();
    },
    enabled: !!selectedCategory,
  });

  // Tree products query — filtered by height + lightType + beamAngle + voltage
  const { data: treeProductsData, isLoading: loadingTreeProducts } = useQuery({
    queryKey: ["tree-products", selectedTreeHeight?.key, selectedTreeLightType?.key, selectedTreeBeamAngle?.key, selectedTreeVoltage?.key, treePriceRange, treeColorTemp],
    queryFn: async () => {
      if (!selectedTreeHeight || !selectedTreeLightType || !selectedTreeBeamAngle || !selectedTreeVoltage) return { products: [] };
      const params: Record<string, string> = { category: selectedTreeLightType.key };
      // 照射角度で絞り込む（樹木高さは選択表示用のみ、reachDistanceフィルタは不要）
      if (selectedTreeBeamAngle.maxAngle < 999) params.maxBeamAngle = selectedTreeBeamAngle.maxAngle.toString();
      if (selectedTreeBeamAngle.minAngle > 0) params.minBeamAngle = selectedTreeBeamAngle.minAngle.toString();
      params.voltage = selectedTreeVoltage.key;
      if (treePriceRange.min > 0) params.minPrice = treePriceRange.min.toString();
      if (treePriceRange.max < 999999) params.maxPrice = treePriceRange.max.toString();
      if (treeColorTemp !== "指定なし") params.colorTemp = treeColorTemp;
      const res = await (await api.products.$get({ query: params })).json();
      return { products: res.products };
    },
    enabled: !!selectedTreeHeight && !!selectedTreeLightType && !!selectedTreeBeamAngle && !!selectedTreeVoltage && treeStep === "results",
  });

  // 形状フロー: 商品クエリ
  const { data: shapeProductsData, isLoading: loadingShapeProducts } = useQuery({
    queryKey: ["shape-products", selectedShape?.slug, shapePriceRange, shapeColorTemp, shapeStyle],
    queryFn: async () => {
      if (!selectedShape) return { products: [] };
      const params: Record<string, string> = { category: selectedShape.slug };
      if (shapePriceRange.min > 0) params.minPrice = shapePriceRange.min.toString();
      if (shapePriceRange.max < 999999) params.maxPrice = shapePriceRange.max.toString();
      if (shapeColorTemp !== "指定なし") params.colorTemp = shapeColorTemp;
      if (shapeStyle !== "指定なし") params.style = shapeStyle;
      const res = await (await api.products.$get({ query: params })).json();
      return { products: res.products };
    },
    enabled: !!selectedShape && shapeStep === "products",
  });

  const estimateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.estimate.$post({ json: { items } });
      return res.json();
    },
    onSuccess: (data) => {
      setEstimateResult(data.estimate as any);
    },
  });

  const handleLocationSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setSelectedCategory(null);
    setStep("category");
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setStep("products");
  };

  const handleViewEstimate = () => {
    setShowEstimate(true);
    estimateMutation.mutate();
  };

  const isInEstimate = (productId: number) =>
    items.some((i) => i.productId === productId);

  const getQuantity = (productId: number) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0;

  const steps: { key: Step; label: string }[] = [
    { key: "location", label: "設置場所" },
    { key: "category", label: "照明種類" },
    { key: "products", label: "商品選択" },
    { key: "estimate", label: "見積もり" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  // User info gate — show full-screen form until confirmed
  if (!userInfoConfirmed) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "36px 32px",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, letterSpacing: "0.2em", color: "var(--color-accent)", marginBottom: 8 }}>
              TAKASHO LIGHTING
            </div>
            <h1 style={{ margin: 0, fontFamily: "'Noto Serif JP', serif", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>
              ご利用前にお客様情報を<br />ご入力ください
            </h1>

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6, fontFamily: "'Noto Sans JP', sans-serif" }}>
                お名前 <span style={{ color: "#e05" }}>*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="例：田中 太郎"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--color-surface2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-text)",
                  fontSize: 14,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6, fontFamily: "'Noto Sans JP', sans-serif" }}>
                郵便番号 <span style={{ color: "#e05" }}>*</span>
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="例：123-4567"
                maxLength={8}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--color-surface2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-text)",
                  fontSize: 14,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={() => {
                if (!userName.trim() || !postalCode.trim()) return;
                localStorage.setItem("userName", userName.trim());
                localStorage.setItem("postalCode", postalCode.trim());
                setUserName(userName.trim());
                setPostalCode(postalCode.trim());
                setUserInfoConfirmed(true);
              }}
              disabled={!userName.trim() || !postalCode.trim()}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: 8,
                background: (!userName.trim() || !postalCode.trim()) ? "var(--color-surface2)" : "var(--color-accent)",
                border: "none",
                borderRadius: 8,
                color: (!userName.trim() || !postalCode.trim()) ? "var(--color-text-muted)" : "#ffffff",
                cursor: (!userName.trim() || !postalCode.trim()) ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Noto Sans JP', sans-serif",
                transition: "background 0.2s",
              }}
            >
              はじめる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(180deg, rgba(249,246,242,0.98) 0%, rgba(255,255,255,0.95) 100%)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Noto Serif JP', serif", fontSize: 18, fontWeight: 700, color: "var(--color-text)" }}>
              <span style={{ color: "var(--color-accent)" }}>外構照明</span> セレクター
            </h1>
          </div>

          {/* Cart button */}
          {totalCount > 0 && (
            <button
              onClick={handleViewEstimate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--color-accent)",
                color: "#ffffff",
                border: "none",
                borderRadius: 24,
                padding: "8px 16px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              <ShoppingCart size={16} />
              見積もりを見る ({totalCount}点)
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 24px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {steps.map((s, i) => {
              const isDone = i < stepIndex;
              const isActive = i === stepIndex;
              const isReachable = i <= stepIndex || (i === 1 && selectedLocation) || (i === 2 && selectedCategory);
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {i > 0 && (
                    <div style={{ width: 32, height: 1, background: isDone ? "var(--color-accent)" : "var(--color-border)" }} />
                  )}
                  <button
                    onClick={() => {
                      if (i === 0) setStep("location");
                      else if (i === 1 && selectedLocation) setStep("category");
                      else if (i === 2 && selectedCategory) setStep("products");
                    }}
                    disabled={!isReachable && !isDone}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: "none",
                      cursor: isReachable || isDone ? "pointer" : "default",
                      padding: "4px 8px",
                      borderRadius: 20,
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: isDone ? "var(--color-accent)" : isActive ? "var(--color-accent)" : "var(--color-surface2)",
                        border: `1px solid ${isDone || isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: isDone || isActive ? "#ffffff" : "var(--color-text-muted)",
                        fontWeight: 700,
                      }}
                    >
                      {isDone ? <Check size={12} /> : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: isActive ? "var(--color-accent)" : isDone ? "var(--color-text)" : "var(--color-text-muted)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {s.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Mode toggle tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          <button
            onClick={() => setSelectMode("location")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 600,
              transition: "all 0.2s",
              background: selectMode === "location" ? "var(--color-accent)" : "transparent",
              color: selectMode === "location" ? "#ffffff" : "var(--color-text-muted)",
            }}
          >
            <MapPin size={16} />
            場所から選ぶ
          </button>
          <button
            onClick={() => {
              setSelectMode("tree");
              setTreeStep("height");
              setSelectedTreeHeight(null);
              setSelectedTreeLightType(null);
              setSelectedTreeBeamAngle(null);
              setSelectedTreeVoltage(null);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 600,
              transition: "all 0.2s",
              background: selectMode === "tree" ? "var(--color-accent)" : "transparent",
              color: selectMode === "tree" ? "#ffffff" : "var(--color-text-muted)",
            }}
          >
            <Trees size={16} />
            樹木の高さから選ぶ
          </button>
          <button
            onClick={() => {
              setSelectMode("shape");
              setShapeStep("select");
              setSelectedShape(null);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 600,
              transition: "all 0.2s",
              background: selectMode === "shape" ? "var(--color-accent)" : "transparent",
              color: selectMode === "shape" ? "#ffffff" : "var(--color-text-muted)",
            }}
          >
            <Layers size={16} />
            形状から選ぶ
          </button>
          <button
            onClick={() => setSelectMode("transformer")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 600,
              transition: "all 0.2s",
              background: selectMode === "transformer" ? "var(--color-accent)" : "transparent",
              color: selectMode === "transformer" ? "#ffffff" : "var(--color-text-muted)",
            }}
          >
            <Plug size={16} />
            トランスガイド
          </button>
          {/* 区切り線 */}
          <div style={{ width: 1, height: 24, background: "var(--color-border)", alignSelf: "center", margin: "0 4px" }} />
          <button
            onClick={() => setNavLocation("/cases")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 600,
              transition: "all 0.2s",
              background: "transparent",
              color: "var(--color-accent)",
            }}
          >
            <BookMarked size={16} />
            事例集
          </button>
        </div>

        {/* TREE FLOW */}
        {selectMode === "tree" && (
          <div className="animate-fade-in-up">

            {/* ── Step breadcrumb ── */}
            {(() => {
              const treeStepList = [
                { key: "height",       label: "樹木の高さ" },
                { key: "lightType",    label: "ライト種類" },
                { key: "beamAngleStep",label: "照射角度" },
                { key: "voltageStep",  label: "電圧" },
                { key: "results",      label: "商品一覧" },
              ];
              const currentIdx = treeStepList.findIndex(s => s.key === treeStep);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
                  {treeStepList.map((s, i) => {
                    const isDone = i < currentIdx;
                    const isActive = i === currentIdx;
                    return (
                      <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {i > 0 && <div style={{ width: 20, height: 1, background: isDone ? "var(--color-accent)" : "var(--color-border)" }} />}
                        <div style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 20,
                          background: isActive ? "var(--color-accent)" : isDone ? "rgba(74,222,128,0.15)" : "var(--color-surface)",
                          border: `1px solid ${isActive || isDone ? "var(--color-accent)" : "var(--color-border)"}`,
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%", fontSize: 10, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: isDone ? "var(--color-accent)" : isActive ? "#ffffff" : "var(--color-surface2)",
                            color: isDone ? "#ffffff" : isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                          }}>
                            {isDone ? <Check size={10} /> : i + 1}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? "#ffffff" : isDone ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── STEP 1: 樹木の高さ ── */}
            {treeStep === "height" && (
              <>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: "var(--color-text)" }}>
                    樹木の高さを選んでください
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>
                    照らす樹木・植栽のサイズを選ぶと、最適な照明をご提案します
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {TREE_HEIGHTS.map((t, i) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setSelectedTreeHeight(t);
                        setSelectedTreeLightType(null);
                        setSelectedTreeBeamAngle(null);
                        setSelectedTreeVoltage(null);
                        setTreeStep("lightType");
                      }}
                      className={`animate-fade-in-up stagger-${i + 1}`}
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 0, cursor: "pointer", textAlign: "left", transition: "all 0.25s", display: "flex", flexDirection: "column", overflow: "hidden" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = t.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${t.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div style={{ width: "100%", height: 140, overflow: "hidden", background: "rgba(0,0,0,0.3)", position: "relative" }}>
                        <img
                          src={`/images/trees/${t.key}.png`}
                          alt={`${t.label} 照明図解`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.style.display = "none";
                            const fb = el.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                        <div style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: 48 }}>{t.emoji}</div>
                        <div style={{ position: "absolute", top: 8, right: 8, background: t.color, color: "#ffffff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{t.sublabel}</div>
                      </div>
                      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 18, fontWeight: 700, color: "var(--color-text)" }}>{t.label}</span>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{t.desc}</p>
                        <div style={{ fontSize: 10, color: "var(--color-text-muted)", paddingTop: 6, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>例: {t.example}</span>
                          <ChevronRight size={12} color="var(--color-text-muted)" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── STEP 2: ライト種類 ── */}
            {treeStep === "lightType" && selectedTreeHeight && (
              <>
                <button onClick={() => setTreeStep("height")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 13, padding: 0, marginBottom: 20 }}>
                  <ChevronLeft size={14} /> 樹木の高さを選び直す
                </button>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, padding: "3px 10px", borderRadius: 20, background: selectedTreeHeight.color + "20", color: selectedTreeHeight.color, border: `1px solid ${selectedTreeHeight.color}40`, fontWeight: 600 }}>
                      {selectedTreeHeight.label}（{selectedTreeHeight.sublabel}）
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>
                    ライトの種類を選んでください
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>設置方法・演出スタイルに合わせてお選びください</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {TREE_LIGHT_TYPES.filter(lt => (lt.suitable as readonly string[]).includes(selectedTreeHeight.key)).map((lt, i) => (
                    <button
                      key={lt.key}
                      onClick={() => { setSelectedTreeLightType(lt); setTreeStep("beamAngleStep"); }}
                      className={`animate-fade-in-up stagger-${i + 1}`}
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 24, cursor: "pointer", textAlign: "left", transition: "all 0.25s", display: "flex", flexDirection: "column", gap: 12 }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = lt.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${lt.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontSize: 36 }}>{lt.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>{lt.label}</div>
                        <div style={{ fontSize: 12, color: lt.color, fontWeight: 600, marginBottom: 8 }}>{lt.sublabel}</div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{lt.desc}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
                        <ChevronRight size={16} color="var(--color-text-muted)" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── STEP 3: 照射角度 ── */}
            {treeStep === "beamAngleStep" && selectedTreeHeight && selectedTreeLightType && (
              <>
                <button onClick={() => setTreeStep("lightType")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 13, padding: 0, marginBottom: 20 }}>
                  <ChevronLeft size={14} /> ライト種類を選び直す
                </button>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: selectedTreeHeight.color + "20", color: selectedTreeHeight.color, border: `1px solid ${selectedTreeHeight.color}40` }}>{selectedTreeHeight.label}</span>
                    <ChevronRight size={12} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: selectedTreeLightType.color + "20", color: selectedTreeLightType.color, border: `1px solid ${selectedTreeLightType.color}40` }}>{selectedTreeLightType.label}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>
                    照射角度を選んでください
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>光の広がり方で演出のイメージが変わります</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {TREE_BEAM_ANGLES.map((ba, i) => (
                    <button
                      key={ba.key}
                      onClick={() => { setSelectedTreeBeamAngle(ba); setTreeStep("voltageStep"); }}
                      className={`animate-fade-in-up stagger-${i + 1}`}
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 24, cursor: "pointer", textAlign: "left", transition: "all 0.25s", display: "flex", flexDirection: "column", gap: 12 }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = ba.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${ba.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      {/* カタログ準拠の配光角度図 */}
                      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 8, background: "var(--color-bg)" }}>
                        <img
                          src={(ba as any).image}
                          alt={ba.label}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{ba.label}</span>
                          <span style={{ fontSize: 13, color: ba.color, fontWeight: 600 }}>{ba.sublabel}</span>
                        </div>
                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--color-text)", fontWeight: 600 }}>{ba.desc}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{ba.detail}</p>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <ChevronRight size={16} color="var(--color-text-muted)" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── STEP 4: 電圧 ── */}
            {treeStep === "voltageStep" && selectedTreeHeight && selectedTreeLightType && selectedTreeBeamAngle && (
              <>
                <button onClick={() => setTreeStep("beamAngleStep")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 13, padding: 0, marginBottom: 20 }}>
                  <ChevronLeft size={14} /> 照射角度を選び直す
                </button>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: selectedTreeHeight.color + "20", color: selectedTreeHeight.color, border: `1px solid ${selectedTreeHeight.color}40` }}>{selectedTreeHeight.label}</span>
                    <ChevronRight size={12} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: selectedTreeLightType.color + "20", color: selectedTreeLightType.color, border: `1px solid ${selectedTreeLightType.color}40` }}>{selectedTreeLightType.label}</span>
                    <ChevronRight size={12} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, background: selectedTreeBeamAngle.color + "20", color: selectedTreeBeamAngle.color, border: `1px solid ${selectedTreeBeamAngle.color}40` }}>{selectedTreeBeamAngle.label}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>
                    電圧システムを選んでください
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>設置環境・工事条件に合わせてお選びください</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {TREE_VOLTAGES.map((v, i) => (
                    <button
                      key={v.key}
                      onClick={() => { setSelectedTreeVoltage(v); setTreeStep("results"); }}
                      className={`animate-fade-in-up stagger-${i + 1}`}
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 24, cursor: "pointer", textAlign: "left", transition: "all 0.25s", display: "flex", flexDirection: "column", gap: 12 }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = v.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${v.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontSize: 40 }}>{v.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 20, fontWeight: 700, color: "var(--color-text)", marginBottom: 2 }}>{v.label}</div>
                        <div style={{ fontSize: 12, color: v.color, fontWeight: 600, marginBottom: 8 }}>{v.sublabel}</div>
                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--color-text)", fontWeight: 600 }}>{v.desc}</p>
                        <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{v.detail}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {v.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: v.color + "20", color: v.color, border: `1px solid ${v.color}40` }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <ChevronRight size={16} color="var(--color-text-muted)" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── STEP 5: 商品一覧 ── */}
            {treeStep === "results" && selectedTreeHeight && selectedTreeLightType && selectedTreeBeamAngle && selectedTreeVoltage && (
              <>
                {/* Back + selection summary */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <button
                      onClick={() => setTreeStep("voltageStep")}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 13, padding: 0, marginBottom: 14 }}
                    >
                      <ChevronLeft size={14} /> 電圧を選び直す
                    </button>
                    {/* Selection summary pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {[
                        { label: selectedTreeHeight.label + "（" + selectedTreeHeight.sublabel + "）", color: selectedTreeHeight.color },
                        { label: selectedTreeLightType.label, color: selectedTreeLightType.color },
                        { label: selectedTreeBeamAngle.label + " " + selectedTreeBeamAngle.sublabel, color: selectedTreeBeamAngle.color },
                        { label: selectedTreeVoltage.label, color: selectedTreeVoltage.color },
                      ].map((pill) => (
                        <span key={pill.label} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: pill.color + "20", color: pill.color, border: `1px solid ${pill.color}40`, fontWeight: 600 }}>
                          {pill.label}
                        </span>
                      ))}
                    </div>
                    <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
                      おすすめ商品
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setTreeStep("height");
                      setSelectedTreeHeight(null);
                      setSelectedTreeLightType(null);
                      setSelectedTreeBeamAngle(null);
                      setSelectedTreeVoltage(null);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--color-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    <X size={12} /> 最初からやり直す
                  </button>
                </div>

                {/* Product grid */}
                {loadingTreeProducts ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}
                  </div>
                ) : !treeProductsData?.products.length ? (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--color-text-muted)" }}>
                    <Trees size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p style={{ fontSize: 15 }}>条件に合う商品が見つかりませんでした</p>
                    <p style={{ fontSize: 13, marginTop: 8 }}>条件を変えてお試しください</p>
                    <button
                      onClick={() => setTreeStep("voltageStep")}
                      style={{ marginTop: 16, background: "var(--color-accent)", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
                    >
                      電圧を変更する
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
                      {treeProductsData.products.length}件の推奨商品
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                      {treeProductsData.products.map((product, i) => {
                        const inList = isInEstimate(product.id);
                        const qty = getQuantity(product.id);
                        const treeFeatures = product.features ? JSON.parse(product.features) as string[] : [];
                        const TREE_COLOR_NAMES = ["シルバー", "ブラック", "クリア", "ホワイト", "ゴールド", "ブロンズ", "グレー", "アンバー"];
                        const TREE_COLOR_MAP: Record<string, string> = { シルバー: "#c0c0c0", ブラック: "#222", クリア: "#b8d4e8", ホワイト: "#f5f5f0", ゴールド: "#c9a84c", ブロンズ: "#8b5c2a", グレー: "#888", アンバー: "#e07b00" };
                        const treeProductColors = TREE_COLOR_NAMES.filter(c => treeFeatures.some((f: string) => f.includes(c)) || product.name.includes(c));
                        return (
                          <div
                            key={product.id}
                            className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                            style={{ background: "var(--color-surface)", border: `1px solid ${inList ? "var(--color-accent)" : "var(--color-border)"}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.2s" }}
                          >
                            {product.imageUrl && (
                              <div style={{ height: 160, overflow: "hidden", background: "var(--color-surface2)" }}>
                                <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            )}
                            <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.4 }}>{product.name}</h3>
                              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-accent)", fontFamily: "'Noto Serif JP', serif" }}>
                                ¥{product.price.toLocaleString()}
                              </div>
                              {/* Specs — A+B+C */}
                              <SpecBadgeList product={product as Product & { voltage?: string }} onInfoClick={setActiveSpecKey} />
                              {treeProductColors.length > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>色：</span>
                                  {treeProductColors.map(c => (
                                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: TREE_COLOR_MAP[c], border: "1px solid var(--color-border)", flexShrink: 0 }} />
                                      <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{c}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {product.description && (
                                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{product.description}</p>
                              )}
                              <div style={{ marginTop: "auto", paddingTop: 12 }}>
                                {!inList ? (
                                  <button
                                    onClick={() => addItem(product.id)}
                                    style={{ width: "100%", background: "var(--color-accent)", color: "#ffffff", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                                  >
                                    <Plus size={14} /> 見積もりに追加
                                  </button>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--color-surface2)", borderRadius: 8, padding: "4px 8px", flex: 1, justifyContent: "space-between" }}>
                                      <button onClick={() => updateQuantity(product.id, qty - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", padding: 4 }}><Minus size={12} /></button>
                                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", minWidth: 24, textAlign: "center" }}>{qty}</span>
                                      <button onClick={() => updateQuantity(product.id, qty + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", padding: 4 }}><Plus size={12} /></button>
                                    </div>
                                    <button onClick={() => removeItem(product.id)} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "var(--color-text-muted)" }}><Trash2 size={14} /></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}


        {/* ========== SHAPE FLOW ========== */}
        {selectMode === "shape" && (
          <div className="animate-fade-in-up">

            {shapeStep === "select" && (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "var(--color-text)" }}>
                    照明の形状・種類を選ぶ
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>
                    設置したい照明の形状・タイプを選択してください
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                  {SHAPE_CATEGORIES.map((shape, i) => (
                    <button
                      key={shape.slug}
                      className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                      onClick={() => {
                        setSelectedShape(shape);
                        setShapeStep("products");
                        setShapePriceRange(PRICE_RANGES[0]);
                        setShapeColorTemp("指定なし");
                        setShapeStyle("指定なし");
                      }}
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 14,
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        overflow: "hidden",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = shape.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${shape.color}30`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      {/* Image */}
                      <div style={{ width: "100%", height: 120, overflow: "hidden", background: "var(--color-surface2)", position: "relative", flexShrink: 0 }}>
                        <img
                          src={shape.imageUrl}
                          alt={shape.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />

                      </div>
                      {/* Body */}
                      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.3 }}>
                          {shape.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                          {shape.desc}
                        </div>
                        <div style={{
                          marginTop: 6,
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 10, color: shape.color, fontWeight: 600,
                          background: shape.color + "15",
                          borderRadius: 4, padding: "2px 7px",
                          width: "fit-content",
                        }}>
                          {shape.note}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {shapeStep === "products" && selectedShape && (
              <>
                {/* Header + back */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <button
                      onClick={() => { setShapeStep("select"); setSelectedShape(null); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 13, padding: 0, marginBottom: 10 }}
                    >
                      <ChevronLeft size={14} /> 形状を選び直す
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: selectedShape.color + "20",
                        border: `1px solid ${selectedShape.color}50`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                      }}>
                        {selectedShape.emoji}
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
                          {selectedShape.name}
                        </h2>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{selectedShape.desc}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShapeStep("select"); setSelectedShape(null); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--color-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    <X size={12} /> 最初からやり直す
                  </button>
                </div>

                {/* Filters */}
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    {/* Price */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>価格帯</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {PRICE_RANGES.map(p => (
                          <button key={p.label} onClick={() => setShapePriceRange(p)}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${shapePriceRange.label === p.label ? selectedShape.color : "var(--color-border)"}`, background: shapePriceRange.label === p.label ? selectedShape.color + "20" : "transparent", color: shapePriceRange.label === p.label ? selectedShape.color : "var(--color-text-muted)", cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Color temp */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>光の色</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {COLOR_TEMPS.map(ct => (
                          <button key={ct} onClick={() => setShapeColorTemp(ct)}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${shapeColorTemp === ct ? selectedShape.color : "var(--color-border)"}`, background: shapeColorTemp === ct ? selectedShape.color + "20" : "transparent", color: shapeColorTemp === ct ? selectedShape.color : "var(--color-text-muted)", cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {ct}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Style */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>デザイン</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {STYLES.map(s => (
                          <button key={s} onClick={() => setShapeStyle(s)}
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${shapeStyle === s ? selectedShape.color : "var(--color-border)"}`, background: shapeStyle === s ? selectedShape.color + "20" : "transparent", color: shapeStyle === s ? selectedShape.color : "var(--color-text-muted)", cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                {loadingShapeProducts ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)" }}>読み込み中...</div>
                ) : shapeProductsData?.products.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <p>条件に一致する商品が見つかりません</p>
                    <button
                      onClick={() => { setShapePriceRange(PRICE_RANGES[0]); setShapeColorTemp("指定なし"); setShapeStyle("指定なし"); }}
                      style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 16px", color: "var(--color-text)", cursor: "pointer", marginTop: 8, fontFamily: "'Noto Sans JP', sans-serif" }}
                    >
                      絞り込みをリセット
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>
                      {shapeProductsData?.products.length ?? 0}件の商品
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                      {shapeProductsData?.products.map((product, i) => {
                        const inCart = isInEstimate(product.id);
                        const qty = getQuantity(product.id);
                        const shapeFeatures = product.features ? JSON.parse(product.features) as string[] : [];
                        const SHAPE_COLOR_NAMES = ["シルバー", "ブラック", "クリア", "ホワイト", "ゴールド", "ブロンズ", "グレー", "アンバー"];
                        const SHAPE_COLOR_MAP: Record<string, string> = { シルバー: "#c0c0c0", ブラック: "#222", クリア: "#b8d4e8", ホワイト: "#f5f5f0", ゴールド: "#c9a84c", ブロンズ: "#8b5c2a", グレー: "#888", アンバー: "#e07b00" };
                        const shapeProductColors = SHAPE_COLOR_NAMES.filter(c => shapeFeatures.some((f: string) => f.includes(c)) || product.name.includes(c));
                        return (
                          <div
                            key={product.id}
                            className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                            style={{ background: "var(--color-surface)", border: `1px solid ${inCart ? selectedShape.color : "var(--color-border)"}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.2s" }}
                          >
                            {product.imageUrl && (
                              <div style={{ height: 160, overflow: "hidden", background: "var(--color-surface2)" }}>
                                <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            )}
                            <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{(product as any).modelNo}</div>
                              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.4 }}>{product.name}</h3>
                              <SpecBadgeList product={product as Product & { voltage?: string }} onInfoClick={setActiveSpecKey} />
                              {shapeProductColors.length > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>色：</span>
                                  {shapeProductColors.map(c => (
                                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: SHAPE_COLOR_MAP[c], border: "1px solid var(--color-border)", flexShrink: 0 }} />
                                      <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{c}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {product.description && (
                                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{product.description}</p>
                              )}
                              <div style={{ fontSize: 18, fontWeight: 700, color: selectedShape.color, fontFamily: "'Noto Serif JP', serif", marginTop: "auto" }}>
                                ¥{product.price.toLocaleString()}
                                <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 400, fontFamily: "'Noto Sans JP', sans-serif", marginLeft: 4 }}>(税別)</span>
                              </div>
                              <div style={{ paddingTop: 4 }}>
                                {!inCart ? (
                                  <button
                                    onClick={() => addItem(product.id)}
                                    style={{ width: "100%", background: selectedShape.color, color: "#ffffff", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                                  >
                                    <Plus size={14} /> 見積もりに追加
                                  </button>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--color-surface2)", borderRadius: 8, padding: "4px 8px", flex: 1, justifyContent: "space-between" }}>
                                      <button onClick={() => updateQuantity(product.id, qty - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", padding: 4 }}><Minus size={12} /></button>
                                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", minWidth: 24, textAlign: "center" }}>{qty}</span>
                                      <button onClick={() => updateQuantity(product.id, qty + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", padding: 4 }}><Plus size={12} /></button>
                                    </div>
                                    <button onClick={() => removeItem(product.id)} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "var(--color-text-muted)" }}><Trash2 size={14} /></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        )}

        {/* TRANSFORMER GUIDE */}
        {selectMode === "transformer" && <TransformerGuide />}

                {/* LOCATION FLOW (original) */}
        {selectMode === "location" && (
        <>

        {/* STEP 1: Location */}
        {step === "location" && (
          <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: "var(--color-text)" }}>
                設置場所を選んでください
              </h2>
              <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>
                照明を取り付ける場所を選ぶと、最適な種類をご提案します
              </p>
            </div>

            {loadingLocations ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 140 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {locationsData?.locations.map((loc, i) => (
                  <button
                    key={loc.id}
                    onClick={() => handleLocationSelect(loc)}
                    className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.25s",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Location photo */}
                    <div style={{ width: "100%", height: 150, overflow: "hidden", background: "rgba(201,168,76,0.06)", position: "relative" }}>
                      <img
                        src={`/images/locations/${loc.slug}.png`}
                        alt={loc.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                          const fb = el.nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      {/* fallback icon */}
                      <div style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                        <LocationIcon name={loc.icon} size={36} />
                      </div>
                    </div>
                    {/* Text area */}
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0 }}>
                          <LocationIcon name={loc.icon} size={14} />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>{loc.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{loc.description}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-accent)", fontSize: 12, marginTop: 4 }}>
                        <span>選択する</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Category */}
        {step === "category" && selectedLocation && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setStep("location")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", marginBottom: 24, fontSize: 13, padding: 0 }}
            >
              <ChevronLeft size={16} /> 設置場所に戻る
            </button>

            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 24,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LocationIcon name={selectedLocation.icon} size={16} color="var(--color-accent)" />
              <span style={{ fontSize: 14, color: "var(--color-text)" }}>{selectedLocation.name}</span>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
                照明の種類を選んでください
              </h2>
              <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 14 }}>
                {selectedLocation.name}に適した照明タイプを選択してください
              </p>
            </div>

            {loadingCategories ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 140 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {categoriesData?.categories.map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.25s",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Image area */}
                    <div
                      style={{
                        width: "100%",
                        height: 140,
                        background: "rgba(201,168,76,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.style.display = "none";
                            const fb = el.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: cat.imageUrl ? "none" : "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          color: "var(--color-accent)",
                        }}
                      >
                        <LocationIcon name={cat.icon} size={36} />
                      </div>
                    </div>
                    {/* Text area */}
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", marginBottom: 3 }}>{cat.name}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{cat.description}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-accent)", fontSize: 12, marginTop: "auto" }}>
                        <span>選択する</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Products */}
        {step === "products" && selectedCategory && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setStep("category")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", marginBottom: 24, fontSize: 13, padding: 0 }}
            >
              <ChevronLeft size={16} /> 種類選択に戻る
            </button>

            {/* Breadcrumb */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {selectedLocation && (
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <LocationIcon name={selectedLocation.icon} size={14} color="var(--color-accent)" />
                  {selectedLocation.name}
                </div>
              )}
              <div style={{ color: "var(--color-text-muted)", display: "flex", alignItems: "center" }}>
                <ChevronRight size={14} />
              </div>
              <div style={{ background: "rgba(201,168,76,0.15)", border: "1px solid var(--color-accent)", borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-accent)" }}>
                <LocationIcon name={selectedCategory.icon} size={14} />
                {selectedCategory.name}
              </div>
            </div>

            {/* メーカータブ */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {(["ALL", "TAKASHO", "LIXIL"] as const).map((maker) => {
                const active = selectedMaker === maker;
                const label = maker === "ALL" ? "すべて" : maker === "TAKASHO" ? "TAKASHO" : "LIXIL 美彩";
                const accentColor = maker === "LIXIL" ? "#4a9eff" : "var(--color-accent)";
                return (
                  <button
                    key={maker}
                    onClick={() => setSelectedMaker(maker)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 20,
                      border: `1px solid ${active ? accentColor : "var(--color-border)"}`,
                      background: active ? (maker === "LIXIL" ? "rgba(74,158,255,0.12)" : "rgba(201,168,76,0.15)") : "var(--color-surface)",
                      color: active ? accentColor : "var(--color-text-muted)",
                      fontFamily: "'Noto Sans JP', sans-serif",
                      fontSize: 13,
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      letterSpacing: maker !== "ALL" ? "0.05em" : undefined,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
                  {selectedCategory.name}
                </h2>
                <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 13 }}>
                  {productsData?.products.length ?? 0}件の商品
                </p>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: showFilters ? "rgba(201,168,76,0.15)" : "var(--color-surface)",
                  border: `1px solid ${showFilters ? "var(--color-accent)" : "var(--color-border)"}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: showFilters ? "var(--color-accent)" : "var(--color-text)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                <SlidersHorizontal size={15} />
                絞り込み
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div
                className="animate-fade-in"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 20,
                }}
              >
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, display: "block" }}>
                    <Zap size={12} style={{ verticalAlign: "middle", marginRight: 4, color: "var(--color-accent)" }} />
                    価格帯
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {PRICE_RANGES.map((r) => (
                      <label key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="radio"
                          checked={priceRange.label === r.label}
                          onChange={() => setPriceRange(r)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, display: "block" }}>
                    <Sun size={12} style={{ verticalAlign: "middle", marginRight: 4, color: "var(--color-accent)" }} />
                    色温度
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {COLOR_TEMPS.map((ct) => (
                      <label key={ct} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="radio"
                          checked={colorTemp === ct}
                          onChange={() => setColorTemp(ct)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        {ct}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, display: "block" }}>
                    <Palette size={12} style={{ verticalAlign: "middle", marginRight: 4, color: "var(--color-accent)" }} />
                    スタイル
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {STYLES.map((s) => (
                      <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="radio"
                          checked={style === s}
                          onChange={() => setStyle(s)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, display: "block" }}>
                    <Droplets size={12} style={{ verticalAlign: "middle", marginRight: 4, color: "var(--color-accent)" }} />
                    光の広がり（照射角度）
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {BEAM_ANGLES.map((b) => (
                      <label key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="radio"
                          checked={beamAngle.label === b.label}
                          onChange={() => setBeamAngle(b)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        {b.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, display: "block" }}>
                    <Zap size={12} style={{ verticalAlign: "middle", marginRight: 4, color: "var(--color-accent)" }} />
                    照射距離
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {REACH_DISTANCES.map((r) => (
                      <label key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input
                          type="radio"
                          checked={reachDistance.label === r.label}
                          onChange={() => setReachDistance(r)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {loadingProducts ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 280 }} />
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p>条件に一致する商品が見つかりません</p>
                <button
                  onClick={() => { setPriceRange(PRICE_RANGES[0]); setColorTemp("指定なし"); setStyle("指定なし"); setBeamAngle(BEAM_ANGLES[0]); setReachDistance(REACH_DISTANCES[0]); }}
                  style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 16px", color: "var(--color-text)", cursor: "pointer", marginTop: 8, fontFamily: "'Noto Sans JP', sans-serif" }}
                >
                  絞り込みをリセット
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {productsData?.products.map((product, i) => {
                  const inCart = isInEstimate(product.id);
                  const qty = getQuantity(product.id);
                  const features = product.features ? JSON.parse(product.features) as string[] : [];
                  // 色の種類をfeaturesまたは製品名から抽出
                  const COLOR_NAMES = ["シルバー", "ブラック", "クリア", "ホワイト", "ゴールド", "ブロンズ", "グレー", "アンバー"];
                  const COLOR_MAP: Record<string, string> = { シルバー: "#c0c0c0", ブラック: "#222", クリア: "#b8d4e8", ホワイト: "#f5f5f0", ゴールド: "#c9a84c", ブロンズ: "#8b5c2a", グレー: "#888", アンバー: "#e07b00" };
                  const productColors = COLOR_NAMES.filter(c => features.some(f => f.includes(c)) || product.name.includes(c));
                  return (
                    <div
                      key={product.id}
                      className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                      style={{
                        background: "var(--color-surface)",
                        border: `1px solid ${inCart ? "var(--color-accent)" : "var(--color-border)"}`,
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "all 0.25s",
                      }}
                    >
                      {/* Product image */}
                      <div
                        style={{
                          height: 160,
                          background: "linear-gradient(135deg, var(--color-surface2) 0%, var(--color-bg) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style && ((e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex");
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            display: product.imageUrl ? "none" : "flex",
                            position: "absolute",
                            inset: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, var(--color-surface2) 0%, var(--color-bg) 100%)",
                          }}
                        >
                          <LocationIcon
                            name={selectedCategory.icon}
                            size={56}
                            color="rgba(201,168,76,0.3)"
                          />
                        </div>
                        {inCart && (
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              background: "var(--color-accent)",
                              color: "#ffffff",
                              borderRadius: "50%",
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {qty}
                          </div>
                        )}
                        {product.maker === "LIXIL" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              background: "rgba(74,158,255,0.9)",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            LIXIL
                          </div>
                        )}
                        {product.catalogPage && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 8,
                              left: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: "rgba(0,0,0,0.6)",
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            <BookOpen size={11} />
                            P.{product.catalogPage}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4, letterSpacing: "0.05em" }}>
                          {product.modelNo}
                        </div>
                        <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.4 }}>
                          {product.name}
                        </h3>
                        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                          {product.description}
                        </p>

                        {/* Specs — A+B: ラベル付きバッジ＋ツールチップ、info→Cモーダル */}
                        <div style={{ marginBottom: 8 }}>
                          <SpecBadgeList product={product as Product & { voltage?: string }} onInfoClick={setActiveSpecKey} />
                        </div>

                        {/* 色の種類 */}
                        {productColors.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>色：</span>
                            {productColors.map(c => (
                              <div key={c} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_MAP[c], border: "1px solid var(--color-border)", flexShrink: 0 }} />
                                <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{c}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div style={{ marginBottom: 14 }}>
                          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 600, color: "var(--color-accent)" }}>
                            ¥{product.price.toLocaleString()}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 4 }}>(税別)</span>
                        </div>

                        {/* Add/Remove buttons */}
                        {!inCart ? (
                          <button
                            onClick={() => addItem(product.id)}
                            style={{
                              width: "100%",
                              background: "var(--color-accent)",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 8,
                              padding: "10px",
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              fontFamily: "'Noto Sans JP', sans-serif",
                              transition: "background 0.2s",
                            }}
                          >
                            <Plus size={15} />
                            見積もりに追加
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                              onClick={() => updateQuantity(product.id, qty - 1)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "var(--color-surface2)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 600, color: "var(--color-accent)", flex: 1, textAlign: "center" }}>
                              {qty}
                            </span>
                            <button
                              onClick={() => addItem(product.id)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "var(--color-surface2)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => removeItem(product.id)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "rgba(248,113,113,0.1)",
                                border: "1px solid rgba(248,113,113,0.2)",
                                color: "#f87171",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Floating estimate bar */}
            {totalCount > 0 && (
              <div
                className="animate-fade-in"
                style={{
                  position: "fixed",
                  bottom: 24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-surface2)",
                  border: "1px solid var(--color-accent)",
                  borderRadius: 24,
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  boxShadow: "0 8px 32px rgba(201,168,76,0.2)",
                  zIndex: 40,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {totalCount}点を選択中
                </span>
                <button
                  onClick={handleViewEstimate}
                  style={{
                    background: "var(--color-accent)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'Noto Sans JP', sans-serif",
                  }}
                >
                  <ShoppingCart size={15} />
                  見積もりを確認
                </button>
              </div>
            )}
          </div>
        )}
        </>
        )}
      </main>

      {/* Estimate Modal */}
      {showEstimate && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 0,
          }}
          onClick={() => setShowEstimate(false)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "24px 24px 0 0",
              width: "100%",
              maxWidth: 680,
              maxHeight: "85vh",
              overflow: "auto",
              padding: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontFamily: "'Noto Serif JP', serif", fontSize: 20, fontWeight: 700 }}>
                お見積もり
              </h2>
              <button
                onClick={() => setShowEstimate(false)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {estimateMutation.isPending ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-muted)" }}>
                計算中...
              </div>
            ) : estimateResult ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {estimateResult.items.map((item: any) => (
                    <div
                      key={item.product.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background: "var(--color-surface2)",
                        borderRadius: 10,
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{item.product.modelNo}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                          ¥{item.product.price.toLocaleString()} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => { updateQuantity(item.product.id, item.quantity - 1); estimateMutation.mutate(); }}
                          style={{ width: 28, height: 28, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: "var(--color-accent)", minWidth: 24, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => { addItem(item.product.id); estimateMutation.mutate(); }}
                          style={{ width: 28, height: 28, borderRadius: 6, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 80 }}>
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: "var(--color-accent)" }}>
                          ¥{item.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => { removeItem(item.product.id); estimateMutation.mutate(); }}
                        style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: 4 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div
                  style={{
                    background: "var(--color-surface2)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>小計（税別）</span>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "var(--color-text)" }}>
                      ¥{estimateResult.total.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>消費税（10%）</span>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "var(--color-text)" }}>
                      ¥{Math.floor(estimateResult.total * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>合計（税込）</span>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 600, color: "var(--color-accent)" }}>
                      ¥{Math.floor(estimateResult.total * 1.1).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 12, textAlign: "center" }}>
                  ※ 工事費・配線費用は含まれていません。別途お見積もりが必要です。
                </p>

                {/* Send estimate button */}
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={async () => {
                      if (emailSending || emailSent) return;
                      setEmailSending(true);
                      try {
                        await fetch("/api/send-estimate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: userName,
                            postalCode,
                            items: estimateResult!.items,
                            total: estimateResult!.total,
                          }),
                        });
                        setEmailSent(true);
                        setTimeout(() => setEmailSent(false), 4000);
                      } catch {
                        // silent fail
                      } finally {
                        setEmailSending(false);
                      }
                    }}
                    disabled={emailSending}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: emailSent ? "#2a7a4f" : "var(--color-accent)",
                      border: "none",
                      borderRadius: 8,
                      color: "#ffffff",
                      cursor: emailSending ? "wait" : "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "'Noto Sans JP', sans-serif",
                      transition: "background 0.3s",
                    }}
                  >
                    {emailSent ? "✓ 見積を送信しました" : emailSending ? "送信中..." : "この見積を担当者に送る"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => { clearItems(); setShowEstimate(false); setStep("location"); }}
                    style={{
                      flex: 1,
                      background: "none",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "12px",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                  >
                    リセット
                  </button>
                  <button
                    onClick={() => setShowEstimate(false)}
                    style={{
                      flex: 2,
                      background: "var(--color-surface2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "12px",
                      color: "var(--color-text)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                  >
                    商品選択に戻る
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* C: スペック図解モーダル */}
      <SpecDetailModal specKey={activeSpecKey} onClose={() => setActiveSpecKey(null)} />
    </div>
  );
}
