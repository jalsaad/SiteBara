"use client";

import { useRef, useState, DragEvent } from "react";
import { jsPDF } from "jspdf";

type Mode = "img2pdf" | "merge";

interface ImgItem {
  id: string;
  name: string;
  url: string;
}

interface PdfPage {
  id: string;
  sourceId: string;
  pageIndex: number;
  sourceName: string;
  sourceColor: string;
}

const SOURCE_COLORS = [
  "#2843b3", "#e05a1a", "#1a7a3f", "#8b2284", "#1a6fa0",
  "#b35a00", "#3a5e00", "#a0001a", "#006b6b", "#5a3ab3",
];

function uid() { return Math.random().toString(36).slice(2); }

function loadHTMLImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export default function PdfBuilder() {
  const [mode, setMode] = useState<Mode>("img2pdf");

  // ── Mode 1 : Scans & Images → PDF ─────────────────────────────────────────
  const [imgItems, setImgItems] = useState<ImgItem[]>([]);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const [imgFilename, setImgFilename] = useState("document-bara");
  const [imgOrientation, setImgOrientation] = useState<"portrait" | "landscape">("portrait");
  const [imgDropOver, setImgDropOver] = useState(false);
  const [imgDragId, setImgDragId] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  function addImages(fileArr: File[]) {
    const images = fileArr.filter(f => f.type.startsWith("image/"));
    if (!images.length) return;
    setImgItems(prev => [
      ...prev,
      ...images.map(f => ({ id: uid(), name: f.name, url: URL.createObjectURL(f) })),
    ]);
  }

  function reorderImgs(fromId: string, toId: string) {
    setImgItems(prev => {
      const from = prev.findIndex(x => x.id === fromId);
      const to   = prev.findIndex(x => x.id === toId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }

  async function buildImgPdf() {
    if (!imgItems.length || imgBusy) return;
    setImgBusy(true); setImgProgress(0);
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: imgOrientation });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const m = 10;
      for (let i = 0; i < imgItems.length; i++) {
        if (i > 0) pdf.addPage();
        const img = await loadHTMLImage(imgItems[i].url);
        const ratio = Math.min((pw - m * 2) / img.width, (ph - m * 2) / img.height);
        pdf.addImage(img, "JPEG",
          (pw - img.width * ratio) / 2, (ph - img.height * ratio) / 2,
          img.width * ratio, img.height * ratio);
        setImgProgress(Math.round(((i + 1) / imgItems.length) * 100));
      }
      pdf.save(`${imgFilename.trim() || "document-bara"}.pdf`);
    } finally {
      setImgBusy(false); setImgProgress(0);
    }
  }

  // ── Mode 2 : Fusionner & Réorganiser ──────────────────────────────────────
  const [mergePages, setMergePages] = useState<PdfPage[]>([]);
  const [mergeSources, setMergeSources] = useState<Map<string, Uint8Array>>(new Map());
  const [mergeColorMap, setMergeColorMap] = useState<Map<string, string>>(new Map());
  const [mergeBusy, setMergeBusy] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeDragId, setMergeDragId] = useState<string | null>(null);
  const [mergeFilename, setMergeFilename] = useState("fusionné-bara");
  const [mergeDropOver, setMergeDropOver] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Reçoit un tableau File[] (pas FileList) pour éviter l'invalidation après
  // e.target.value = "" ou la fin de l'événement drag/drop.
  async function addMergePdfs(fileArr: File[]) {
    const pdfs = fileArr.filter(f => f.type === "application/pdf");
    if (!pdfs.length) return;
    setMergeBusy(true); setMergeError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const newSources = new Map(mergeSources);
      const newColorMap = new Map(mergeColorMap);
      const newPages: PdfPage[] = [];
      const colorIndex = newColorMap.size;

      for (const file of pdfs) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        let pageCount = 0;
        try {
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          pageCount = doc.getPageCount();
        } catch {
          setMergeError(`Impossible de lire "${file.name}" (protégé ou corrompu).`);
          continue;
        }
        if (pageCount === 0) continue;

        const sourceId = uid();
        const color = SOURCE_COLORS[(colorIndex + newColorMap.size) % SOURCE_COLORS.length];
        newSources.set(sourceId, bytes);
        newColorMap.set(sourceId, color);

        for (let i = 0; i < pageCount; i++) {
          newPages.push({ id: uid(), sourceId, pageIndex: i, sourceName: file.name, sourceColor: color });
        }
      }

      setMergeSources(newSources);
      setMergeColorMap(newColorMap);
      setMergePages(prev => [...prev, ...newPages]);
    } catch (e) {
      console.error("addMergePdfs:", e);
      setMergeError("Erreur lors du chargement des fichiers.");
    } finally {
      setMergeBusy(false);
    }
  }

  function reorderMerge(fromId: string, toId: string) {
    setMergePages(prev => {
      const from = prev.findIndex(x => x.id === fromId);
      const to   = prev.findIndex(x => x.id === toId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }

  async function buildMergedPdf() {
    if (!mergePages.length || mergeBusy) return;
    setMergeBusy(true); setMergeProgress(0); setMergeError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      const cache = new Map<string, Awaited<ReturnType<typeof PDFDocument.load>>>();

      for (let i = 0; i < mergePages.length; i++) {
        const p = mergePages[i];
        if (!cache.has(p.sourceId)) {
          cache.set(p.sourceId, await PDFDocument.load(mergeSources.get(p.sourceId)!));
        }
        const [copied] = await merged.copyPages(cache.get(p.sourceId)!, [p.pageIndex]);
        merged.addPage(copied);
        setMergeProgress(Math.round(((i + 1) / mergePages.length) * 100));
      }

      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${mergeFilename.trim() || "fusionné-bara"}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error("buildMergedPdf:", e);
      setMergeError("Erreur lors de la génération du PDF.");
    } finally {
      setMergeBusy(false); setMergeProgress(0);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const MODES: { id: Mode; label: string }[] = [
    { id: "img2pdf", label: "📷 Scans & Images → PDF" },
    { id: "merge",   label: "🔗 Fusionner & Réorganiser" },
  ];

  // Convertit FileList → File[] immédiatement, avant tout await ou e.target.value=""
  function fromList(list: FileList | null): File[] {
    return Array.from(list ?? []);
  }

  function dropProps(onDrop: (files: File[]) => void, over: boolean, setOver: (v: boolean) => void) {
    return {
      onDragOver:  (e: DragEvent) => { e.preventDefault(); setOver(true); },
      onDragLeave: (e: DragEvent) => {
        if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setOver(false);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault(); setOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onDrop(files);
      },
    };
  }

  function shortName(name: string) {
    const base = name.replace(/\.pdf$/i, "");
    return base.length > 18 ? base.slice(0, 16) + "…" : base;
  }

  const sectionStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    gap: 14,
    // Quand inactif : hors du flux visuel mais toujours monté (refs et état préservés)
    visibility: active ? "visible" : "hidden",
    position: active ? "static" : "absolute",
    pointerEvents: active ? "auto" : "none",
    height: active ? "auto" : 0,
    overflow: active ? "visible" : "hidden",
  });

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="tool-card">
      <div className="tool-head">
        <span className="tool-ic" style={{ background: "var(--orange)" }}>📄</span>
        <div>
          <h3 className="serif">Convertisseur PDF</h3>
          <p>Scans & images → PDF · Fusion · Réorganisation de pages.</p>
        </div>
      </div>

      <div className="tool-body">
        <div className="pdf-tabs">
          {MODES.map(m => (
            <button key={m.id} type="button"
              className={`pdf-tab${mode === m.id ? " active" : ""}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Scans & Images → PDF ── */}
        <div style={sectionStyle(mode === "img2pdf")}>
          <button type="button"
            className={`pdf-drop${imgDropOver ? " pdf-drop--over" : ""}`}
            onClick={() => imgInputRef.current?.click()}
            {...dropProps(files => addImages(files), imgDropOver, setImgDropOver)}
          >
            {imgDropOver ? "⬇ Déposez ici…" : "📎 Ajouter des scans / images"}
          </button>
          <input ref={imgInputRef} type="file" accept="image/*" multiple hidden
            onChange={e => {
              const files = fromList(e.target.files);
              e.target.value = "";
              addImages(files);
            }} />

          <div className="pdf-options">
            <div className="pdf-option-group">
              <label className="pdf-label">Nom du fichier</label>
              <div className="pdf-filename-row">
                <input type="text" className="pdf-filename-input" value={imgFilename}
                  onChange={e => setImgFilename(e.target.value)}
                  placeholder="document-bara" maxLength={60} />
                <span className="pdf-ext">.pdf</span>
              </div>
            </div>
            <div className="pdf-option-group">
              <label className="pdf-label">Orientation</label>
              <div className="pdf-orient-btns">
                <button type="button"
                  className={`pdf-orient-btn${imgOrientation === "portrait" ? " active" : ""}`}
                  onClick={() => setImgOrientation("portrait")}>▯ Portrait</button>
                <button type="button"
                  className={`pdf-orient-btn${imgOrientation === "landscape" ? " active" : ""}`}
                  onClick={() => setImgOrientation("landscape")}>▭ Paysage</button>
              </div>
            </div>
          </div>

          {imgItems.length > 0 && (
            <>
              <div className="pdf-list-header">
                <span className="pdf-count">{imgItems.length} image{imgItems.length > 1 ? "s" : ""}</span>
                <button type="button" className="pdf-clear"
                  onClick={() => { imgItems.forEach(i => URL.revokeObjectURL(i.url)); setImgItems([]); }}>
                  Tout supprimer
                </button>
              </div>
              <ul className="pdf-list">
                {imgItems.map(it => (
                  <li key={it.id} draggable
                    className={imgDragId === it.id ? "pdf-dragging" : ""}
                    onDragStart={() => setImgDragId(it.id)}
                    onDragOver={e => { e.preventDefault(); if (imgDragId && imgDragId !== it.id) reorderImgs(imgDragId, it.id); }}
                    onDragEnd={() => setImgDragId(null)}
                  >
                    <span className="pdf-drag-handle">⠿</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.url} alt="" />
                    <span className="pdf-name">{it.name}</span>
                    <button type="button" className="pdf-x"
                      onClick={() => { URL.revokeObjectURL(it.url); setImgItems(prev => prev.filter(x => x.id !== it.id)); }}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {imgBusy && (
            <div className="pdf-progress">
              <div className="pdf-progress-bar" style={{ width: `${imgProgress}%` }} />
            </div>
          )}
          <button className="btn btn-orange"
            style={{
              justifyContent: "center",
              ...(!imgItems.length || imgBusy ? { opacity: 0.5, pointerEvents: "none" } : {}),
            }}
            onClick={buildImgPdf}>
            {imgBusy
              ? `Génération… ${imgProgress}%`
              : `Générer le PDF${imgItems.length ? ` (${imgItems.length} page${imgItems.length > 1 ? "s" : ""})` : ""}`}
          </button>
        </div>

        {/* ── Fusionner & Réorganiser ── */}
        <div style={sectionStyle(mode === "merge")}>
          <button type="button"
            className={`pdf-drop${mergeDropOver ? " pdf-drop--over" : ""}`}
            onClick={() => mergeInputRef.current?.click()}
            {...dropProps(files => { void addMergePdfs(files); }, mergeDropOver, setMergeDropOver)}
          >
            {mergeDropOver ? "⬇ Déposez ici…" : "📎 Ajouter des PDF (plusieurs possibles)"}
          </button>
          <input ref={mergeInputRef} type="file" accept="application/pdf" multiple hidden
            onChange={e => {
              const files = fromList(e.target.files); // snapshot avant tout
              e.target.value = "";
              void addMergePdfs(files);
            }} />

          <div className="pdf-option-group">
            <label className="pdf-label">Nom du fichier</label>
            <div className="pdf-filename-row">
              <input type="text" className="pdf-filename-input" value={mergeFilename}
                onChange={e => setMergeFilename(e.target.value)}
                placeholder="fusionné-bara" maxLength={60} />
              <span className="pdf-ext">.pdf</span>
            </div>
          </div>

          {mergeError && <p className="qr-warn">⚠️ {mergeError}</p>}
          {mergeBusy && (
            <div className="pdf-progress">
              <div className="pdf-progress-bar" style={{ width: `${mergeProgress || 30}%` }} />
            </div>
          )}

          {mergePages.length > 0 && (
            <>
              <div className="pdf-list-header">
                <span className="pdf-count">
                  {mergePages.length} page{mergePages.length > 1 ? "s" : ""} — glissez pour réordonner
                </span>
                <button type="button" className="pdf-clear"
                  onClick={() => { setMergePages([]); setMergeSources(new Map()); setMergeColorMap(new Map()); }}>
                  Tout vider
                </button>
              </div>
              <div className="pdf-pages">
                {mergePages.map((p, idx) => (
                  <div key={p.id}
                    className={`pdf-page-item${mergeDragId === p.id ? " pdf-dragging" : ""}`}
                    draggable
                    onDragStart={() => setMergeDragId(p.id)}
                    onDragOver={e => { e.preventDefault(); if (mergeDragId && mergeDragId !== p.id) reorderMerge(mergeDragId, p.id); }}
                    onDragEnd={() => setMergeDragId(null)}
                    title={`${p.sourceName} — page ${p.pageIndex + 1}`}
                  >
                    <div className="pdf-page-card" style={{ borderColor: p.sourceColor }}>
                      <span className="pdf-page-card-num" style={{ color: p.sourceColor }}>
                        {idx + 1}
                      </span>
                      <span className="pdf-page-card-src" style={{ background: p.sourceColor }}>
                        {shortName(p.sourceName)}
                      </span>
                      <span className="pdf-page-card-orig">p.{p.pageIndex + 1}</span>
                    </div>
                    <button type="button" className="pdf-page-del"
                      onClick={() => setMergePages(prev => prev.filter(x => x.id !== p.id))}
                      aria-label="Supprimer">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="btn btn-orange"
            style={{
              justifyContent: "center",
              ...(!mergePages.length || mergeBusy ? { opacity: 0.5, pointerEvents: "none" } : {}),
            }}
            onClick={buildMergedPdf}>
            {mergeBusy && mergeProgress > 0
              ? `Génération… ${mergeProgress}%`
              : `Générer le PDF${mergePages.length ? ` (${mergePages.length} page${mergePages.length > 1 ? "s" : ""})` : ""}`}
          </button>
        </div>

      </div>
    </div>
  );
}
