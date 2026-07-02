import Countdown from "./Countdown";

export const dynamic = "force-dynamic";

const LAUNCH = process.env.LAUNCH_DATE ?? "2026-07-03T11:45:00+02:00";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/* Éléments flottants : formules, citations, mots-clés — s'écrivent en fond */
const BG_ELEMENTS = [
  { t: "a² + b² = c²",          x:  4, y:  8, s: 22, d: 0.0, dur: 9  },
  { t: "E = mc²",                x: 82, y:  6, s: 26, d: 1.2, dur: 11 },
  { t: "∫f(x)dx",               x: 12, y: 28, s: 20, d: 2.5, dur: 8  },
  { t: "1830",                   x: 70, y: 22, s: 34, d: 0.8, dur: 14 },
  { t: "lim(x→∞) = L",          x: 55, y: 12, s: 18, d: 3.1, dur: 10 },
  { t: "H₂O",                   x: 88, y: 42, s: 30, d: 1.8, dur: 7  },
  { t: "∑(n=1..∞)",             x:  3, y: 55, s: 19, d: 4.2, dur: 12 },
  { t: "Qui cherche, trouve.",   x: 60, y: 55, s: 15, d: 2.0, dur: 16 },
  { t: "F = m·a",               x: 22, y: 72, s: 22, d: 5.0, dur: 9  },
  { t: "1595",                   x: 78, y: 70, s: 32, d: 0.4, dur: 13 },
  { t: "CO₂ + H₂O →",          x: 38, y: 82, s: 17, d: 3.8, dur: 8  },
  { t: "√(x² + y²)",            x:  6, y: 88, s: 20, d: 1.5, dur: 11 },
  { t: "Apprendre.",             x: 68, y: 88, s: 24, d: 6.0, dur: 15 },
  { t: "λ = h / mv",            x: 42, y:  5, s: 18, d: 2.8, dur: 10 },
  { t: "PV = nRT",              x: 18, y: 42, s: 21, d: 4.5, dur: 9  },
  { t: "π ≈ 3,14159…",          x: 50, y: 72, s: 20, d: 1.0, dur: 12 },
  { t: "S'ouvrir.",              x: 88, y: 58, s: 22, d: 3.3, dur: 14 },
  { t: "sin²θ + cos²θ = 1",     x: 28, y: 16, s: 17, d: 5.5, dur: 11 },
];

export default function ComingSoonPage() {
  return (
    <>
      {/* Import fonte manuscrite */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap"
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a2a1a; overflow-x: hidden; }

        /* ── Tableau ── */
        .tb-scene {
          min-height: 100vh;
          background: radial-gradient(ellipse at 40% 40%, #2c412c 0%, #1a2a1a 70%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px 60px;
          position: relative;
          overflow: hidden;
        }

        /* Grain de craie sur tout l'écran */
        .tb-scene::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* ── Formules de fond ── */
        .tb-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .tb-bg-item {
          position: absolute;
          font-family: 'Caveat', cursive;
          color: rgba(255,255,255,0.10);
          white-space: nowrap;
          animation: tb-drift var(--dur, 10s) ease-in-out var(--delay, 0s) infinite alternate;
          text-shadow: 0 0 6px rgba(255,255,255,0.06);
        }
        @keyframes tb-drift {
          0%   { opacity: 0.04; transform: translateY(0px)   rotate(-1deg); }
          50%  { opacity: 0.13; transform: translateY(-6px)  rotate(0.5deg); }
          100% { opacity: 0.06; transform: translateY(3px)   rotate(-0.5deg); }
        }

        /* ── Cadre en bois ── */
        .tb-frame {
          position: relative;
          z-index: 2;
          background: linear-gradient(160deg, #263d26 0%, #1c301c 55%, #263d26 100%);
          border-radius: 4px;
          padding: 18px;
          box-shadow:
            0 0 0 3px #6b4c1a,
            0 0 0 6px #7a5a22,
            0 0 0 9px #5c3d14,
            0 30px 80px rgba(0,0,0,0.7),
            inset 0 0 80px rgba(0,0,0,0.25);
          max-width: 680px;
          width: 100%;
        }

        /* Surface du tableau */
        .tb-surface {
          background: linear-gradient(135deg, #233323 0%, #1e2e1e 40%, #253525 100%);
          border-radius: 2px;
          padding: 48px 52px 44px;
          position: relative;
          overflow: hidden;
        }

        /* Reflet subtil */
        .tb-surface::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
        }

        /* Traces d'effacement */
        .tb-erased {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 120px 40px at 70% 30%, rgba(255,255,255,0.018) 0%, transparent 100%),
            radial-gradient(ellipse 80px 30px at 20% 70%, rgba(255,255,255,0.012) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ── Contenu ── */
        .tb-school {
          font-family: 'Caveat', cursive;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 3px;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 6px;
          animation: tb-in 1s ease-out 0.2s both;
        }

        .tb-divider {
          text-align: center;
          color: rgba(255,255,255,0.20);
          font-size: 12px;
          letter-spacing: 10px;
          margin: 10px 0 28px;
          animation: tb-in 1s ease-out 0.4s both;
        }

        .tb-title {
          font-family: 'Caveat', cursive;
          font-size: clamp(32px, 5.5vw, 52px);
          font-weight: 700;
          color: rgba(250, 248, 240, 0.93);
          text-align: center;
          line-height: 1.2;
          text-shadow:
            0 0 4px rgba(255,255,255,0.25),
            1px 1px 0 rgba(0,0,0,0.5),
            -1px -1px 0 rgba(0,0,0,0.3);
          animation: tb-write 1.4s ease-out 0.7s both;
          margin-bottom: 8px;
        }

        .tb-sub {
          font-family: 'Caveat', cursive;
          font-size: clamp(16px, 2.5vw, 20px);
          color: rgba(255,248,200,0.65);
          text-align: center;
          margin-bottom: 36px;
          animation: tb-in 1s ease-out 1.2s both;
        }

        /* ── Compte à rebours ── */
        .tb-countdown-wrap {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px;
          padding: 24px 16px 20px;
          margin: 0 0 28px;
          animation: tb-in 1s ease-out 1.5s both;
          position: relative;
        }
        .tb-countdown-wrap::before {
          content: 'Compte à rebours';
          position: absolute;
          top: -10px; left: 50%; transform: translateX(-50%);
          background: #1e2e1e;
          padding: 0 12px;
          font-family: 'Caveat', cursive;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 2px;
          white-space: nowrap;
        }

        /* Countdown units */
        .cs-cd {
          display: inline-flex;
          align-items: flex-end;
          gap: 6px;
          justify-content: center;
          width: 100%;
        }
        .cs-cd-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 64px;
        }
        .cs-cd-unit b {
          font-family: 'Caveat', cursive;
          font-size: clamp(38px, 7vw, 56px);
          color: rgba(255, 248, 200, 0.95);
          line-height: 1;
          text-shadow: 0 0 12px rgba(255,248,180,0.3), 1px 1px 0 rgba(0,0,0,0.6);
          font-weight: 700;
        }
        .cs-cd-unit small {
          font-family: 'Caveat', cursive;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: -2px;
        }
        .cs-cd-sep {
          font-family: 'Caveat', cursive;
          font-size: 40px;
          color: rgba(255,255,255,0.2);
          line-height: 1.05;
          padding-bottom: 14px;
        }
        .cs-cd-done {
          font-family: 'Caveat', cursive;
          font-size: 28px;
          color: rgba(255,248,200,0.9);
          text-align: center;
          display: block;
        }

        /* ── Date de lancement ── */
        .tb-date {
          font-family: 'Caveat', cursive;
          font-size: 17px;
          color: rgba(255,255,255,0.42);
          text-align: center;
          animation: tb-in 1s ease-out 1.8s both;
          margin-bottom: 28px;
        }
        .tb-date strong {
          color: rgba(255,248,180,0.7);
        }

        /* ── Citation ── */
        .tb-quote {
          font-family: 'Caveat', cursive;
          font-size: 16px;
          font-style: italic;
          color: rgba(255,255,255,0.28);
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 20px;
          line-height: 1.6;
          animation: tb-in 1s ease-out 2.0s both;
        }

        /* ── Lien admin ── */
        .tb-admin {
          font-family: 'Caveat', cursive;
          font-size: 13px;
          color: rgba(255,255,255,0.18);
          text-align: center;
          margin-top: 10px;
          animation: tb-in 1s ease-out 2.2s both;
        }
        .tb-admin a { color: rgba(255,255,255,0.22); text-decoration: none; }
        .tb-admin a:hover { color: rgba(255,255,255,0.45); }

        /* ── Bord de la craie (en bas) ── */
        .tb-tray {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 18px;
          background: linear-gradient(180deg, #7a5a22 0%, #5c3d14 100%);
          box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        /* Craies sur le rebord */
        .tb-chalk-piece {
          height: 10px;
          border-radius: 3px;
          opacity: 0.7;
        }

        /* ── Animations ── */
        @keyframes tb-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tb-write {
          from { opacity: 0; letter-spacing: 0.4em; }
          to   { opacity: 1; letter-spacing: normal; }
        }

        /* ── Poussière de craie ── */
        .tb-dust {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          overflow: hidden;
        }
        .tb-dust-p {
          position: absolute;
          bottom: 18px;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          animation: tb-float var(--dur,6s) ease-in-out var(--delay,0s) infinite;
        }
        @keyframes tb-float {
          0%   { transform: translate(0, 0) scale(1);   opacity: 0.3; }
          50%  { transform: translate(var(--dx,10px), calc(var(--h,-80px))) scale(0.7); opacity: 0.15; }
          100% { transform: translate(0, -200px) scale(0.2); opacity: 0; }
        }

        @media (max-width: 520px) {
          .tb-surface { padding: 32px 24px 30px; }
          .tb-frame { padding: 12px; }
          .cs-cd-unit { min-width: 48px; }
        }
      `}</style>

      {/* Formules en arrière-plan */}
      <div className="tb-bg">
        {BG_ELEMENTS.map((el, i) => (
          <span
            key={i}
            className="tb-bg-item"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              fontSize: `${el.s}px`,
              ["--delay" as string]: `${el.d}s`,
              ["--dur" as string]: `${el.dur}s`,
            }}
          >
            {el.t}
          </span>
        ))}
      </div>

      {/* Poussière de craie */}
      <div className="tb-dust">
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="tb-dust-p"
            style={{
              left: `${10 + i * 6.5}%`,
              ["--dur" as string]: `${5 + (i % 4)}s`,
              ["--delay" as string]: `${(i * 0.7) % 4}s`,
              ["--dx" as string]: `${-12 + (i % 5) * 6}px`,
              ["--h" as string]: `${-60 - (i % 3) * 40}px`,
            }}
          />
        ))}
      </div>

      <div className="tb-scene">
        {/* Tableau encadré */}
        <div className="tb-frame">
          <div className="tb-surface">
            <div className="tb-erased" />

            <div className="tb-school">Athénée Royal Jules Bara · Tournai</div>
            <div className="tb-divider">✦ · ✦ · ✦</div>

            <h1 className="tb-title">
              Un nouveau site<br />se prépare…
            </h1>
            <p className="tb-sub">Le tableau s&apos;efface pour mieux recommencer.</p>

            <div className="tb-countdown-wrap">
              <Countdown target={LAUNCH} />
            </div>

            <p className="tb-date">
              Inauguration le <strong>{fmtDate(LAUNCH)} à 11h45</strong>
            </p>

            <p className="tb-quote">
              &laquo;&nbsp;Une école n&apos;est pas un lieu où l&apos;on entasse des savoirs,<br />
              mais où l&apos;on apprend à devenir soi-même.&nbsp;&raquo;
            </p>

            <p className="tb-admin">
              <a href="/admin">→ accès administration</a>
            </p>
          </div>
        </div>
      </div>

      {/* Rebord du tableau avec craies */}
      <div className="tb-tray">
        {[
          { w: 42, bg: "#f5f5f0" },
          { w: 28, bg: "#f5e8d0" },
          { w: 36, bg: "#f5f5f0" },
          { w: 22, bg: "#d0e8d0" },
          { w: 38, bg: "#f5f5f0" },
        ].map((c, i) => (
          <div
            key={i}
            className="tb-chalk-piece"
            style={{ width: c.w, background: c.bg }}
          />
        ))}
      </div>
    </>
  );
}
