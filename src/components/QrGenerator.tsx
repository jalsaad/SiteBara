"use client";

// Générateur de QR codes — 100 % côté client (lib qrcode, aucun appel réseau).
// Types rapides (lien, e-mail, tél, SMS, Wi-Fi, contact), couleurs réglables,
// logo au centre (téléversé localement), export PNG/SVG et copie presse-papiers.

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type QrType = "url" | "email" | "phone" | "sms" | "wifi" | "vcard";

const TYPES: { id: QrType; label: string }[] = [
  { id: "url", label: "🔗 Lien" },
  { id: "email", label: "✉️ E-mail" },
  { id: "phone", label: "📞 Tél." },
  { id: "sms", label: "💬 SMS" },
  { id: "wifi", label: "📶 Wi-Fi" },
  { id: "vcard", label: "👤 Contact" },
];

const DARK_PRESETS = ["#1b2245", "#284193", "#0f9e75", "#c0392b", "#7c4dff", "#111827"];
const LIGHT_PRESETS = ["#ffffff", "#f7f2e9", "#fff4e6", "#e8f4f8"];

interface Fields {
  url: string;
  email: string;
  subject: string;
  body: string;
  phone: string;
  smsNumber: string;
  smsMsg: string;
  ssid: string;
  password: string;
  enc: "WPA" | "WEP" | "nopass";
  hidden: boolean;
  vfn: string;
  vln: string;
  vphone: string;
  vemail: string;
  vorg: string;
  vtitle: string;
  vurl: string;
}

const INIT: Fields = {
  url: "https://atheneejulesbara.be",
  email: "",
  subject: "",
  body: "",
  phone: "",
  smsNumber: "",
  smsMsg: "",
  ssid: "",
  password: "",
  enc: "WPA",
  hidden: false,
  vfn: "",
  vln: "",
  vphone: "",
  vemail: "",
  vorg: "Athénée Royal Jules Bara",
  vtitle: "",
  vurl: "",
};

// Échappement des caractères spéciaux (Wi-Fi / vCard).
const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

function buildValue(type: QrType, f: Fields): string {
  switch (type) {
    case "url":
      return f.url.trim();
    case "email": {
      const to = f.email.trim();
      if (!to) return "";
      const q: string[] = [];
      if (f.subject) q.push("subject=" + encodeURIComponent(f.subject));
      if (f.body) q.push("body=" + encodeURIComponent(f.body));
      return `mailto:${to}${q.length ? "?" + q.join("&") : ""}`;
    }
    case "phone":
      return f.phone.trim() ? `tel:${f.phone.trim()}` : "";
    case "sms":
      return f.smsNumber.trim() ? `SMSTO:${f.smsNumber.trim()}:${f.smsMsg}` : "";
    case "wifi":
      return f.ssid.trim()
        ? `WIFI:T:${f.enc};S:${esc(f.ssid)};P:${f.enc === "nopass" ? "" : esc(f.password)};${f.hidden ? "H:true;" : ""};`
        : "";
    case "vcard": {
      if (!f.vfn.trim() && !f.vln.trim()) return "";
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${f.vln};${f.vfn}`,
        `FN:${`${f.vfn} ${f.vln}`.trim()}`,
        f.vorg ? `ORG:${f.vorg}` : "",
        f.vtitle ? `TITLE:${f.vtitle}` : "",
        f.vphone ? `TEL;TYPE=CELL:${f.vphone}` : "",
        f.vemail ? `EMAIL:${f.vemail}` : "",
        f.vurl ? `URL:${f.vurl}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    }
  }
}

// Luminance relative → ratio de contraste (WCAG) pour avertir si peu lisible.
function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrast(a: string, b: string): number {
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Dessine le logo (data URL ou chemin) au centre du canvas du QR.
function drawLogo(
  canvas: HTMLCanvasElement,
  logo: string,
  light: string
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve();
    const img = new Image();
    img.onload = () => {
      const cw = canvas.width;
      const s = cw * 0.2;
      const pad = s * 0.14;
      const x = (cw - s) / 2;
      const y = (cw - s) / 2;
      ctx.fillStyle = light;
      roundRect(ctx, x - pad, y - pad, s + pad * 2, s + pad * 2, s * 0.22);
      ctx.fill();
      ctx.drawImage(img, x, y, s, s);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = logo;
  });
}

export default function QrGenerator() {
  const [type, setType] = useState<QrType>("url");
  const [f, setF] = useState<Fields>(INIT);
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const [dark, setDark] = useState("#1b2245");
  const [light, setLight] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [size, setSize] = useState(512);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const value = buildValue(type, f);
  const lowContrast = contrast(dark, light) < 2.5;
  const ecLevel = logo ? "H" : "M";

  useEffect(() => {
    const text = value.trim();
    if (!text) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const canvas = document.createElement("canvas");
        await QRCode.toCanvas(canvas, text, {
          width: size,
          margin: 2,
          color: { dark, light },
          errorCorrectionLevel: ecLevel,
        });
        if (cancelled) return;
        if (logo) await drawLogo(canvas, logo, light);
        if (!cancelled) setDataUrl(canvas.toDataURL("image/png"));
      } catch {
        if (!cancelled) setDataUrl(null);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value, dark, light, logo, size, ecLevel]);

  function onLogoFile(file: File) {
    setErr(null);
    if (!file.type.startsWith("image/")) {
      setErr("Veuillez choisir une image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr("Image trop lourde (2 Mo maximum).");
      return;
    }
    const r = new FileReader();
    r.onload = () => setLogo(r.result as string);
    r.readAsDataURL(file);
  }

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qr-code-bara.png";
    a.click();
  }

  async function downloadSvg() {
    if (!value.trim()) return;
    let svg = await QRCode.toString(value, {
      type: "svg",
      margin: 2,
      color: { dark, light },
      errorCorrectionLevel: ecLevel,
    });
    if (logo) {
      const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      const n = m ? parseFloat(m[1]) : 0;
      if (n) {
        const s = n * 0.2;
        const pad = s * 0.14;
        const x = (n - s) / 2;
        const y = (n - s) / 2;
        const insert =
          `<rect x="${x - pad}" y="${y - pad}" width="${s + pad * 2}" height="${s + pad * 2}" rx="${s * 0.22}" fill="${light}"/>` +
          `<image href="${logo}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
        svg = svg.replace("</svg>", insert + "</svg>");
      }
    }
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qr-code-bara.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyImage() {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setErr("Copie non supportée par ce navigateur.");
    }
  }

  const input = (
    k: keyof Fields,
    label: string,
    placeholder = "",
    area = false
  ) => (
    <label className="qr-field">
      <span className="tool-label">{label}</span>
      {area ? (
        <textarea
          className="tool-input"
          rows={2}
          value={f[k] as string}
          onChange={(e) => set(k, e.target.value as Fields[typeof k])}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="tool-input"
          value={f[k] as string}
          onChange={(e) => set(k, e.target.value as Fields[typeof k])}
          placeholder={placeholder}
        />
      )}
    </label>
  );

  return (
    <div className="tool-card reveal">
      <div className="tool-head">
        <span className="tool-ic" style={{ background: "var(--royal)" }}>▦</span>
        <div>
          <h3 className="serif">Générateur de QR code</h3>
          <p>Lien, e-mail, Wi-Fi, contact… avec couleurs et logo, à imprimer.</p>
        </div>
      </div>

      <div className="tool-body">
        {/* type de contenu */}
        <div className="seg wrap qr-types">
          {TYPES.map((t) => (
            <button
              key={t.id}
              className={type === t.id ? "on" : ""}
              onClick={() => setType(t.id)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* champs selon le type */}
        <div className="qr-fields">
          {type === "url" && input("url", "Lien ou texte", "https://…")}
          {type === "email" && (
            <>
              {input("email", "Adresse e-mail", "nom@exemple.be")}
              {input("subject", "Objet (facultatif)")}
              {input("body", "Message (facultatif)", "", true)}
            </>
          )}
          {type === "phone" && input("phone", "Numéro de téléphone", "+32 …")}
          {type === "sms" && (
            <>
              {input("smsNumber", "Numéro", "+32 …")}
              {input("smsMsg", "Message (facultatif)", "", true)}
            </>
          )}
          {type === "wifi" && (
            <>
              {input("ssid", "Nom du réseau (SSID)")}
              {f.enc !== "nopass" && input("password", "Mot de passe")}
              <label className="qr-field">
                <span className="tool-label">Sécurité</span>
                <div className="seg">
                  {(
                    [
                      ["WPA", "WPA/WPA2"],
                      ["WEP", "WEP"],
                      ["nopass", "Aucune"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      className={f.enc === v ? "on" : ""}
                      onClick={() => set("enc", v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}
          {type === "vcard" && (
            <div className="qr-grid">
              {input("vfn", "Prénom")}
              {input("vln", "Nom")}
              {input("vphone", "Téléphone")}
              {input("vemail", "E-mail")}
              {input("vorg", "Organisation")}
              {input("vtitle", "Fonction")}
            </div>
          )}
        </div>

        {/* couleurs */}
        <div className="qr-colors">
          <div className="qr-colorblock">
            <span className="tool-label">Couleur du QR</span>
            <div className="swatches">
              {DARK_PRESETS.map((c) => (
                <span
                  key={c}
                  className={`swatch${dark === c ? " on" : ""}`}
                  style={{ background: c }}
                  onClick={() => setDark(c)}
                />
              ))}
              <input
                type="color"
                className="swatch-pick"
                value={dark}
                onChange={(e) => setDark(e.target.value)}
                title="Couleur personnalisée"
              />
            </div>
          </div>
          <div className="qr-colorblock">
            <span className="tool-label">Fond</span>
            <div className="swatches">
              {LIGHT_PRESETS.map((c) => (
                <span
                  key={c}
                  className={`swatch${light === c ? " on" : ""}`}
                  style={{ background: c }}
                  onClick={() => setLight(c)}
                />
              ))}
              <input
                type="color"
                className="swatch-pick"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                title="Couleur personnalisée"
              />
            </div>
          </div>
        </div>
        {lowContrast && (
          <p className="qr-warn">
            ⚠️ Contraste faible entre le QR et le fond — il risque d&apos;être
            difficile à scanner.
          </p>
        )}

        {/* logo */}
        <div className="qr-logo">
          <span className="tool-label">Logo au centre (facultatif)</span>
          <div className="qr-logo-row">
            <button
              type="button"
              className="abtn ghost sm"
              onClick={() => fileRef.current?.click()}
            >
              📷 Téléverser un logo
            </button>
            <button
              type="button"
              className="abtn ghost sm"
              onClick={() => setLogo("/logo-dark.png")}
            >
              Logo de l&apos;école
            </button>
            {logo && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qr-logo-prev" src={logo} alt="" />
                <button
                  type="button"
                  className="abtn ghost sm"
                  onClick={() => setLogo(null)}
                >
                  Retirer
                </button>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLogoFile(file);
              e.target.value = "";
            }}
          />
          {logo && (
            <p className="tool-hint">
              Avec un logo, la correction d&apos;erreur passe au niveau maximal
              pour rester scannable.
            </p>
          )}
        </div>

        {/* taille */}
        <label className="qr-field">
          <span className="tool-label">Taille du PNG</span>
          <div className="seg">
            {[
              [256, "Petit"],
              [512, "Moyen"],
              [1024, "Grand"],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                className={size === v ? "on" : ""}
                onClick={() => setSize(v as number)}
              >
                {l}
              </button>
            ))}
          </div>
        </label>

        {/* aperçu */}
        <div className="qr-preview" style={{ background: light }}>
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Aperçu du QR code" />
          ) : (
            <span className="qr-empty">
              Renseignez le contenu pour générer le QR code
            </span>
          )}
        </div>

        {err && <p className="qr-warn">{err}</p>}

        {/* actions */}
        <div className="qr-actions">
          <button
            type="button"
            className="btn btn-orange"
            onClick={downloadPng}
            disabled={!dataUrl}
            style={!dataUrl ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            PNG
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ borderColor: "var(--line)", color: "var(--royal)" }}
            onClick={downloadSvg}
            disabled={!value.trim()}
          >
            SVG
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ borderColor: "var(--line)", color: "var(--royal)" }}
            onClick={copyImage}
            disabled={!dataUrl}
          >
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
      </div>
    </div>
  );
}
