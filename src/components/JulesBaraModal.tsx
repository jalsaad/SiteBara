"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PARAGRAPHS = [
  `Depuis 1980, l'Athénée est placé sous les auspices de Jules Bara : il importe de s'interroger sur la personnalité et l'œuvre de Jules Bara, sur ses rapports avec l'Athénée et sur les raisons qui ont conduit à choisir son patronage. Cette figure de proue du libéralisme belge est née à Tournai, le 23 août 1835 ; son père est médecin, mais la famille est nombreuse et ne vit pas dans l'opulence. Après des études secondaires à l'Athénée, il s'inscrit à l'ULB où il obtient en 1857 le diplôme de docteur en droit et en 1859 le titre de docteur agrégé après avoir défendu une thèse sur « les rapports de l'État et des religions au point de vue constitutionnel ».`,
  `L'année suivante, il est professeur à l'ULB et occupe une place notable au barreau de Bruxelles. Les libéraux tournaisiens le remarquent et font de lui leur candidat aux élections législatives de 1862. À 27 ans, Jules Bara est député et le restera jusqu'en 1894, date à laquelle il deviendra sénateur. Il fut, deux fois, ministre de la Justice (de 1865 à 1870 et de 1878 à 1884) et Léopold II l'honora du titre de ministre d'État en 1884. Jusqu'à sa mort, en 1900, il fut un « ténor » du barreau de Bruxelles.`,
  `Ses combats furent sous-tendus par une idée-force : assurer l'indépendance de l'État et du pouvoir civil vis-à-vis des Églises et plus particulièrement de l'Église catholique. L'École fut, dans ce combat, un des enjeux majeurs. Avec ses amis, les libéraux doctrinaires, Jules Bara défendit l'école laïque. Mais il batailla aussi pour assurer aux non-croyants une sépulture digne et chercha à réduire la position matérielle de l'Église. On imagine aisément que les catholiques ne lui pardonnaient pas ses initiatives : la presse de l'époque reflète la virulence des luttes politiques qui secouaient le pays.`,
  `L'attitude de Bara vis-à-vis de la question sociale peut sembler contradictoire : d'une part, il combattit avec constance pour abolir l'article 1781 du Code civil qu'il jugeait humiliant pour les ouvriers ; d'autre part, il s'opposa au suffrage universel. L'instauration de celui-ci, en 1894, même si elle fut assortie du vote plural, lui fit perdre son siège de député.`,
  `L'Athénée où il fit ses études secondaires envoya une délégation à ses obsèques en 1900 : Monsieur le baron de Jamblines y prit la parole au nom de l'Union des Anciens Élèves de l'Athénée.`,
  `En 1980, le ministre de l'Éducation, L. Michel, demanda aux écoles de choisir le nom d'une personnalité éminente qui personnifierait chacune d'elles. À l'époque, le professeur L. Polomé faisait fonction de préfet ; il ne voulut pas prendre une décision si importante et consulta ses collègues, Messieurs De Schepper et Antoine ; il proposa deux anciens élèves célèbres : le peintre Louis Gallait et l'homme politique Jules Bara. C'est ce dernier qui fut préféré et la proposition fut acceptée par le ministre.`,
  `Le nom d'un anticlérical farouche accordé à un ancien noviciat des jésuites ne manque pas de piquant…`,
];

export default function JulesBaraLink() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const modal = (
    <div className="jb-veil" onClick={() => setOpen(false)}>
      <button className="lb-close-float" onClick={() => setOpen(false)} aria-label="Fermer">✕</button>
      <div className="jb-box" onClick={(e) => e.stopPropagation()}>
        <div className="jb-portrait-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/jules-bara.png" alt="Portrait de Jules Bara" className="jb-portrait" />
        </div>
        <div className="jb-text">
          <h2 className="jb-name">Jules Bara <span className="jb-years">(1835–1900)</span></h2>
          <div className="jb-body">
            {PARAGRAPHS.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button className="footer-modal-link" onClick={() => setOpen(true)}>
        Qui est Jules Bara&nbsp;?
      </button>
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
