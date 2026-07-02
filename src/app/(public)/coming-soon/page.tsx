import Countdown from "./Countdown";

export const dynamic = "force-dynamic";

const LAUNCH = process.env.LAUNCH_DATE ?? "2026-07-03T11:45:00+02:00";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function ComingSoonPage() {
  return (
    <>
      <style>{`
        body { background: #d6d0c4; margin: 0; }

        .cs-wrap {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 16px 60px;
          font-family: Georgia, serif;
        }

        /* ── La feuille ── */
        .cs-paper {
          position: relative;
          background-color: #fffef5;
          background-image:
            repeating-linear-gradient(transparent 0, transparent 31px, #b8d4f0 31px, #b8d4f0 32px);
          width: 100%;
          max-width: 780px;
          box-shadow: 3px 4px 18px rgba(0,0,0,0.28), -1px 1px 6px rgba(0,0,0,0.12);
          border-radius: 2px;
          padding: 0 0 48px 0;
          overflow: hidden;
        }

        /* Ligne de marge rouge */
        .cs-paper::before {
          content: '';
          position: absolute;
          left: 72px;
          top: 0; bottom: 0;
          width: 2px;
          background: rgba(220, 80, 80, 0.55);
          z-index: 1;
        }

        /* Perforations */
        .cs-holes {
          position: absolute;
          left: 16px;
          top: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          pointer-events: none;
          z-index: 2;
        }
        .cs-hole {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #d6d0c4;
          border: 1px solid #bbb;
          box-shadow: inset 0 1px 4px rgba(0,0,0,0.25);
        }

        /* ── En-tête ── */
        .cs-header {
          padding: 28px 36px 18px 90px;
          border-bottom: 2px solid #111;
          position: relative;
        }
        .cs-school { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #333; font-weight: bold; }
        .cs-subject-line {
          display: flex; gap: 32px; flex-wrap: wrap;
          margin-top: 10px; font-size: 14px; color: #222;
        }
        .cs-field { border-bottom: 1px solid #555; min-width: 160px; padding-bottom: 2px; }
        .cs-field span { color: #888; font-size: 12px; display: block; margin-bottom: 2px; }

        /* ── Tampon EN COURS ── */
        .cs-stamp-wrap {
          position: absolute;
          top: 18px; right: 32px;
          transform: rotate(-9deg);
          z-index: 5;
        }
        .cs-stamp {
          border: 5px solid rgba(185, 28, 28, 0.82);
          color: rgba(185, 28, 28, 0.82);
          padding: 10px 18px;
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          line-height: 1.3;
          text-align: center;
          border-radius: 4px;
          box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.18), inset 0 0 0 1px rgba(185, 28, 28, 0.18);
        }

        /* ── Corps ── */
        .cs-body { padding: 0 36px 0 90px; }

        .cs-question {
          margin-top: 0;
          padding: 20px 0 12px;
          border-bottom: 1px dashed #ccc;
          position: relative;
        }
        .cs-q-header {
          display: flex; align-items: baseline; gap: 12px;
          margin-bottom: 8px;
        }
        .cs-q-num {
          font-size: 12px; font-weight: bold; text-transform: uppercase;
          letter-spacing: 1px; color: #444;
        }
        .cs-q-pts {
          font-size: 12px; color: #888; margin-left: auto;
          border: 1px solid #bbb; padding: 1px 8px; border-radius: 20px;
        }
        .cs-q-text { font-size: 15px; color: #222; margin-bottom: 10px; font-style: italic; }

        /* Réponse style "écrit à la main" */
        .cs-answer {
          font-family: cursive;
          font-size: 17px;
          color: #1a3a70;
          line-height: 1.9;
          position: relative;
        }

        /* Annotation rouge du prof */
        .cs-note {
          position: absolute;
          right: -28px;
          top: 50%;
          transform: translateY(-50%);
          font-family: cursive;
          color: #b91c1c;
          font-size: 18px;
          white-space: nowrap;
        }
        @media (max-width: 640px) { .cs-note { display: none; } }

        /* Coche/Croix rouge */
        .cs-mark {
          display: inline-block;
          font-family: cursive;
          font-size: 22px;
          font-weight: bold;
          margin-left: 8px;
          vertical-align: middle;
        }
        .cs-mark.ok { color: #15803d; }
        .cs-mark.warn { color: #b45309; }

        /* Score encerclé (style correction) */
        .cs-score {
          display: inline-block;
          border: 2px solid #b91c1c;
          border-radius: 50%;
          color: #b91c1c;
          font-family: cursive;
          font-size: 14px;
          width: 38px; height: 38px;
          line-height: 34px;
          text-align: center;
          margin-left: 6px;
          vertical-align: middle;
        }

        /* ── Compte à rebours ── */
        .cs-countdown-box {
          background: #fffde7;
          border: 2px dashed #f59e0b;
          border-radius: 4px;
          padding: 14px 20px;
          margin: 8px 0;
          text-align: center;
        }
        .cs-cd {
          display: inline-flex; align-items: baseline; gap: 4px;
          font-family: 'Courier New', monospace;
        }
        .cs-cd-unit { display: inline-flex; flex-direction: column; align-items: center; }
        .cs-cd-unit b { font-size: 36px; color: #1e3a8a; line-height: 1; }
        .cs-cd-unit small { font-size: 11px; color: #666; text-transform: uppercase; }
        .cs-cd-sep { font-size: 28px; color: #999; padding: 0 2px; line-height: 1.1; }
        .cs-cd-done { font-family: cursive; font-size: 24px; color: #15803d; }

        /* ── Barre de progression ── */
        .cs-progress-wrap { margin: 10px 0 4px; }
        .cs-progress-label { font-size: 13px; color: #444; margin-bottom: 5px; font-family: cursive; }
        .cs-progress-track {
          height: 22px;
          background: #f3f4f6;
          border: 1.5px solid #9ca3af;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }
        .cs-progress-fill {
          height: 100%;
          width: 87%;
          background: repeating-linear-gradient(
            45deg,
            #16a34a, #16a34a 8px,
            #22c55e 8px, #22c55e 16px
          );
          position: relative;
        }
        .cs-progress-fill::after {
          content: '87 %';
          position: absolute; right: 8px; top: 50%;
          transform: translateY(-50%);
          font-size: 12px; font-weight: bold; color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          font-family: Arial, sans-serif;
        }
        .cs-progress-remainder {
          position: absolute; right: 8px; top: 50%;
          transform: translateY(-50%);
          font-size: 11px; color: #9ca3af;
          font-family: Arial, sans-serif;
        }

        /* ── Barré (raturé) ── */
        .cs-strike {
          text-decoration: line-through;
          text-decoration-color: #b91c1c;
          text-decoration-thickness: 2px;
          color: #888;
        }

        /* ── Appréciation ── */
        .cs-appreciation {
          margin: 24px 0 0;
          padding: 18px 20px;
          background: #fff9f0;
          border-left: 4px solid #b91c1c;
          position: relative;
        }
        .cs-appr-label {
          font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
          color: #888; margin-bottom: 8px; font-family: Arial, sans-serif;
        }
        .cs-appr-text {
          font-family: cursive; font-size: 16px; color: #7f1d1d;
          line-height: 1.8; font-style: italic;
        }

        /* ── Pied de page (note + signature) ── */
        .cs-footer {
          margin-top: 28px;
          padding: 0 36px 0 90px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .cs-grade-box {
          text-align: center;
        }
        .cs-grade-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
        .cs-grade {
          font-family: cursive; font-size: 48px; color: #15803d;
          line-height: 1; position: relative;
          display: inline-block;
        }
        .cs-grade::after {
          content: '/20';
          font-size: 20px; color: #888;
          position: absolute; bottom: 4px; right: -34px;
        }
        .cs-grade-note { font-family: cursive; font-size: 13px; color: #b91c1c; margin-top: 4px; }

        .cs-sig {
          text-align: right;
        }
        .cs-sig-name {
          font-family: cursive; font-size: 22px; color: #1a3a70;
          border-bottom: 1px solid #aaa; padding-bottom: 4px; margin-bottom: 4px;
        }
        .cs-sig-role { font-size: 11px; color: #888; letter-spacing: 1px; text-transform: uppercase; }

        /* ── Date de lancement ── */
        .cs-launch-date {
          margin-top: 28px;
          text-align: center;
          font-size: 13px;
          color: #666;
          font-family: cursive;
        }
        .cs-launch-date strong { color: #1a3a70; font-size: 15px; }

        /* ── Admin bypass hint ── */
        .cs-admin-hint {
          margin-top: 32px;
          text-align: center;
          font-size: 11px;
          color: #bbb;
          font-family: Arial, sans-serif;
        }
        .cs-admin-hint a { color: #aaa; }
      `}</style>

      <div className="cs-wrap">
        <div className="cs-paper">

          {/* Perforations */}
          <div className="cs-holes">
            <div className="cs-hole" />
            <div className="cs-hole" />
            <div className="cs-hole" />
          </div>

          {/* En-tête */}
          <div className="cs-header">
            <div className="cs-school">Athénée Royal Jules Bara · Tournai</div>
            <div className="cs-subject-line">
              <div className="cs-field"><span>Cours</span>Développement Web — Site officiel</div>
              <div className="cs-field"><span>Date de remise</span>{fmtDate(LAUNCH)}</div>
              <div className="cs-field"><span>Classe</span>Communauté scolaire</div>
            </div>

            {/* Tampon */}
            <div className="cs-stamp-wrap">
              <div className="cs-stamp">En cours<br />de correction</div>
            </div>
          </div>

          {/* Corps */}
          <div className="cs-body">

            {/* Q1 */}
            <div className="cs-question">
              <div className="cs-q-header">
                <span className="cs-q-num">Question 1</span>
                <span className="cs-q-pts">2 pts</span>
              </div>
              <p className="cs-q-text">
                L&apos;Athénée Jules Bara dispose-t-il d&apos;un nouveau site web ?
              </p>
              <div className="cs-answer" style={{ position: "relative" }}>
                Oui, et il sera magnifique.
                <span className="cs-mark ok"> ✓</span>
                <span className="cs-score">2</span>
                <span className="cs-note">Excellente réponse !</span>
              </div>
            </div>

            {/* Q2 */}
            <div className="cs-question">
              <div className="cs-q-header">
                <span className="cs-q-num">Question 2</span>
                <span className="cs-q-pts">8 pts</span>
              </div>
              <p className="cs-q-text">
                Calculez avec précision le délai restant avant la mise en ligne. Montrez votre travail.
              </p>
              <div className="cs-answer">
                Calcul en cours…
              </div>
              <div className="cs-countdown-box">
                <Countdown target={LAUNCH} />
              </div>
              <div className="cs-answer" style={{ position: "relative" }}>
                <span className="cs-mark warn">⚠</span> Patience requise.
                <span className="cs-score" style={{ borderColor: "#b45309", color: "#b45309" }}>7</span>
                <span className="cs-note">— 1 pt : impatience</span>
              </div>
            </div>

            {/* Q3 */}
            <div className="cs-question">
              <div className="cs-q-header">
                <span className="cs-q-num">Question 3</span>
                <span className="cs-q-pts">10 pts</span>
              </div>
              <p className="cs-q-text">
                Évaluez le taux d&apos;avancement des travaux et justifiez votre réponse.
              </p>
              <div className="cs-progress-wrap">
                <div className="cs-progress-label">Avancement des travaux :</div>
                <div className="cs-progress-track">
                  <div className="cs-progress-fill" />
                  <span className="cs-progress-remainder" style={{ right: "auto", left: "calc(87% + 8px)" }}>
                    13 % ✏
                  </span>
                </div>
              </div>
              <div className="cs-answer" style={{ marginTop: 8, position: "relative" }}>
                <span className="cs-strike">Note : voir fiche séparée</span>
                <span className="cs-mark ok"> ✓</span>
                <span className="cs-score">9</span>
                <span className="cs-note">Travail soigné !</span>
              </div>
            </div>

            {/* Appréciation */}
            <div className="cs-appreciation">
              <div className="cs-appr-label">Appréciation générale du correcteur</div>
              <div className="cs-appr-text">
                &laquo;&nbsp;Travail sérieux et projet ambitieux. Le site sera à la hauteur des attentes de la
                communauté scolaire. Repassez le&nbsp;<strong>{fmtDate(LAUNCH)}</strong> pour consulter
                les résultats définitifs.&nbsp;&raquo;
              </div>
            </div>

          </div>

          {/* Pied de page */}
          <div className="cs-footer">
            <div className="cs-grade-box">
              <div className="cs-grade-label">Note provisoire</div>
              <div className="cs-grade">18</div>
              <div className="cs-grade-note">Mention : Très bien ✓</div>
            </div>

            <div className="cs-sig">
              <div className="cs-sig-name">Prof. Jules Bara</div>
              <div className="cs-sig-role">Directeur du projet numérique</div>
            </div>
          </div>

          <div className="cs-launch-date">
            📅 Résultats définitifs affichés le&nbsp;<strong>{fmtDate(LAUNCH)}</strong>
          </div>

          <div className="cs-admin-hint">
            <a href="/admin">→ accès administration</a>
          </div>

        </div>
      </div>
    </>
  );
}
