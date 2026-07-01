import Link from "next/link";
import JulesBaraLink from "@/components/JulesBaraModal";
import FooterInfoModal from "@/components/FooterInfoModal";

type NavLink = { href: string; label: string };

function pageLink(pages: NavLink[], label: string, fallback: string): string {
  return pages.find((p) => p.label === label)?.href ?? fallback;
}

export default function Footer({ pages = [] }: { pages?: NavLink[] }) {
  const notreProjetHref = pageLink(pages, "Notre projet", "/p/notre-projet");
  void notreProjetHref;

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        {/* Colonne 1 : identité */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footer-logo" src="/logo-white.png" alt="Athénée Royal Jules Bara" />
          <p className="desc">
            Apprendre, s&apos;ouvrir, s&apos;accomplir. Un enseignement de
            qualité au cœur de Tournai depuis 1595.
          </p>
          <div className="social">
            <a aria-label="Facebook" href="#">f</a>
            <a aria-label="Instagram" href="#">◉</a>
            <a aria-label="LinkedIn" href="#">in</a>
          </div>
        </div>

        {/* Colonne 2 : navigation principale */}
        <div>
          <Link href="/actualites">Actualités</Link>
          <Link href="/calendrier">Calendrier scolaire</Link>
          <Link href="/preinscription">Inscription</Link>
          <Link href="/applis">Applis</Link>
          <Link href="/grilles">Grilles</Link>
          <Link href="/restaurant">Menu scolaire</Link>
          <Link href="/p/projet-pedagogique">Documents</Link>
        </div>

        {/* Colonne 3 : l'école */}
        <div>
          <JulesBaraLink />

          <FooterInfoModal label="Historique" title="Historique de l'établissement">
            <p>En octobre 1595 naissait le <em>Collegium Tornacense</em>, fondé par les Jésuites à la demande de l&apos;administration municipale de Tournai. Les bâtiments, initialement situés rue des Allemands, appartenaient à la ville. À mesure que les effectifs augmentaient, de nouveaux locaux furent acquis rue du Quesnoy, où les Jésuites construisirent sept bâtiments distincts entre 1609 et 1644.</p>
            <p>En 1775, une bulle papale dissout l&apos;ordre jésuite. Les écoles furent vendues et saisies lors de la Révolution française. Après l&apos;annexion de Tournai à la France en 1795, deux professeurs loyaux — les abbés Bouly et Moch — contribuèrent à la réouverture de l&apos;établissement, désigné alors « Collège National ».</p>
            <p>En 1817, l&apos;institution reçut le titre d&apos;« Athénée », distinction réservée aux meilleures écoles secondaires de Belgique. Après l&apos;indépendance belge en 1830, l&apos;école mit l&apos;accent sur les langues modernes et les sciences commerciales pour se distinguer des collèges ecclésiastiques.</p>
            <p>La réforme de 1923 marqua une étape importante : les portes de l&apos;Athénée s&apos;ouvrirent aux jeunes filles. L&apos;école adopta l&apos;enseignement moral indépendant en 1924. Durant la Seconde Guerre mondiale, l&apos;occupation allemande provoqua des perturbations temporaires, mais les bâtiments ne subirent que des dommages superficiels.</p>
            <p>En 1979, l&apos;établissement adopta son nom actuel — <strong>Athénée Royal Jules Bara</strong> — en hommage à l&apos;un de ses illustres anciens élèves, homme politique tournaisien du XIXe siècle.</p>
            <p>En 1995, l&apos;école célébra son remarquable 400e anniversaire.</p>
          </FooterInfoModal>

          <Link href="/Projets/Biodiversity/index.html">Projets</Link>

          <FooterInfoModal label="Projet d'établissement" title="Projet d'établissement">
            <p>Le projet d&apos;établissement de l&apos;Athénée Royal Jules Bara est placé sous la devise :</p>
            <p><strong>« Conduire chacun vers sa propre Excellence »</strong></p>
            <p>Cette vision guide l&apos;ensemble des choix pédagogiques et éducatifs de l&apos;établissement : accompagner chaque élève, quelles que soient ses capacités ou ses difficultés, vers la meilleure version de lui-même.</p>
            <p>Pour consulter le document complet, veuillez contacter la direction :</p>
            <ul>
              <li>Rue Duquesnoy 24, 7500 Tournai</li>
              <li>069 89 06 02</li>
              <li><a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a></li>
            </ul>
          </FooterInfoModal>

          <FooterInfoModal label="Règlement d'ordre intérieur" title="Règlement d'Ordre Intérieur">
            <p>Le Règlement d&apos;Ordre Intérieur (ROI) définit les droits et devoirs de tous les membres de la communauté scolaire : élèves, parents et personnel.</p>
            <p>Il couvre notamment :</p>
            <ul>
              <li>Les règles de vie en communauté</li>
              <li>Les procédures d&apos;absences et de justifications</li>
              <li>Les sanctions disciplinaires</li>
              <li>Les modalités d&apos;évaluation et de délibération</li>
              <li>Les droits des élèves et des parents</li>
            </ul>
            <p>Pour obtenir le document complet, contactez la direction ou consultez le secrétariat de l&apos;école :</p>
            <ul>
              <li>Rue Duquesnoy 24, 7500 Tournai</li>
              <li>069 89 06 02</li>
              <li><a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a></li>
            </ul>
          </FooterInfoModal>
        </div>

        {/* Colonne 4 : services & communauté */}
        <div>
          <FooterInfoModal label="École des devoirs" title="L'École des devoirs">
            <p>L&apos;École des devoirs de l&apos;Athénée Royal Jules Bara est une structure qui accueille les enfants et les jeunes de 6 à 18 ans en dehors des heures scolaires régulières.</p>
            <p>Elle remplit une mission à la fois <strong>sociale, culturelle et éducative</strong> : accompagner les élèves dans leur scolarité et leur développement citoyen, en leur proposant un soutien pédagogique adapté.</p>
            <p>Les activités proposées visent à :</p>
            <ul>
              <li>Aider à la réalisation des devoirs et à la préparation des leçons</li>
              <li>Offrir un encadrement éducatif bienveillant</li>
              <li>Favoriser l&apos;épanouissement personnel et la socialisation</li>
            </ul>
            <p>Pour plus d&apos;informations, contactez la direction au <strong>069 89 06 02</strong> ou à <a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a>.</p>
          </FooterInfoModal>

          <FooterInfoModal label="École numérique" title="L'École numérique">
            <p>L&apos;Athénée Royal Jules Bara participe au programme <strong>« École numérique »</strong> lancé en 2011 par les gouvernements wallon et de la Fédération Wallonie-Bruxelles. Ce programme vise à impulser les usages innovants des Technologies de l&apos;Information et de la Communication (TIC) au bénéfice de l&apos;éducation.</p>
            <p>Le dispositif couvre tous les niveaux d&apos;enseignement, du maternel jusqu&apos;à la promotion sociale, en enseignement ordinaire et spécialisé. Les premiers appels à projets ont généré des dizaines puis des centaines de projets pilotes à travers la Belgique.</p>
            <p>L&apos;expérience a démontré que <em>« l&apos;accompagnement technique et pédagogique est une clé importante du succès »</em>. Au-delà des équipements informatiques, l&apos;école cherche à ancrer des pratiques pédagogiques durables exploitant le numérique.</p>
            <p>Dans le cadre de <strong>Digital Wallonia</strong>, l&apos;établissement s&apos;engage sur deux axes complémentaires :</p>
            <ul>
              <li><strong>L&apos;éducation par le numérique</strong> : utilisation des outils numériques comme support d&apos;apprentissage</li>
              <li><strong>L&apos;éducation au numérique</strong> : apprentissage du codage, maîtrise des médias numériques et esprit critique</li>
            </ul>
          </FooterInfoModal>

          <FooterInfoModal label="Troubles d'apprentissage" title="Troubles de l'apprentissage">
            <p><em>« Chaque élève avec ses capacités et ses difficultés trouve sa place chez nous. »</em></p>
            <p>Cette conviction est au cœur du projet d&apos;établissement de l&apos;Athénée Royal Jules Bara : <strong>Conduire chacun vers sa propre Excellence</strong>.</p>
            <p>L&apos;école propose un accompagnement spécialisé pour les élèves présentant des troubles d&apos;apprentissage (dyslexie, TDAH, dyscalculie…) ainsi que pour les élèves à haut potentiel. Une <strong>logopède</strong> travaille en collaboration étroite avec les enseignants et les parents pour :</p>
            <ul>
              <li>Identifier les difficultés spécifiques de chaque élève</li>
              <li>Élaborer des plans d&apos;aménagements raisonnables individualisés</li>
              <li>Mettre en place des stratégies pédagogiques adaptées</li>
              <li>Aider chaque jeune à exploiter pleinement son potentiel</li>
            </ul>
            <p>Pour toute demande d&apos;accompagnement, contactez la direction au <strong>069 89 06 02</strong>.</p>
          </FooterInfoModal>

          <FooterInfoModal label="Union des Anciens" title="Union des Anciens Élèves">
            <p>L&apos;Union des Anciens Élèves de l&apos;Athénée Royal Jules Bara rassemble tous ceux qui ont fréquenté notre établissement. Elle maintient le lien entre l&apos;école et ses anciens élèves, et contribue à la vie de la communauté scolaire.</p>
            <p>Rejoignez l&apos;Union en choisissant votre formule d&apos;adhésion :</p>
            <ul>
              <li><strong>10 €</strong> — Ancien(ne) Base / Sympathisant(e)</li>
              <li><strong>20 €</strong> — Ancien(ne) Silver</li>
              <li><strong>30 €</strong> — Ancien(ne) Gold</li>
              <li><strong>50 €</strong> — Ancien(ne) Diamond</li>
            </ul>
            <p>Le paiement s&apos;effectue par virement bancaire. Suivez l&apos;actualité de l&apos;Union sur <strong>Facebook</strong> et restez connecté à votre école !</p>
            <p>Pour toute information : <a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a></p>
          </FooterInfoModal>

          <FooterInfoModal label="Association des parents" title="Association des parents d'élèves">
            <p>L&apos;Association des parents d&apos;élèves de l&apos;Athénée Royal Jules Bara est un partenaire actif de la vie scolaire. Elle représente les familles, favorise le dialogue avec l&apos;équipe pédagogique et contribue à l&apos;organisation d&apos;activités pour les élèves.</p>
            <p>Retrouvez l&apos;Association sur :</p>
            <ul>
              <li>Site officiel : <a href="https://www.apbara.be" target="_blank" rel="noopener noreferrer">www.apbara.be</a></li>
              <li>Page Facebook de l&apos;Association des parents</li>
            </ul>
            <p>Contact via la direction de l&apos;école :</p>
            <ul>
              <li>Rue Duquesnoy 24, 7500 Tournai</li>
              <li>069 89 06 02</li>
              <li><a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a></li>
            </ul>
          </FooterInfoModal>

          <FooterInfoModal label="Internat" title="Internats partenaires">
            <p>L&apos;Athénée Royal Jules Bara travaille en étroite collaboration avec les internats de la région pour accueillir les élèves qui nécessitent un hébergement durant leur scolarité.</p>
            <p>Deux structures partenaires sont disponibles :</p>
            <ul>
              <li><strong>Internat Mixte d&apos;Antoing</strong> — internat mixte accueillant filles et garçons</li>
              <li><strong>Internat Walter Ravez</strong> — internat de la région tournaisienne</li>
            </ul>
            <p>Pour toute information sur les modalités d&apos;accueil, les tarifs et les conditions d&apos;admission, contactez directement l&apos;internat de votre choix ou renseignez-vous auprès du secrétariat de l&apos;école au <strong>069 89 06 02</strong>.</p>
          </FooterInfoModal>
        </div>

        {/* Colonne 5 : contact */}
        <div>
          <p>Rue Duquesnoy 24<br />7500 Tournai</p>
          <p>069 89 06 02</p>
          <a href="mailto:direction@atheneejulesbara.be">direction@atheneejulesbara.be</a>
        </div>

        {/* Colonne 6 : partenaires */}
        <div className="footer-partners">
          <a href="https://www.wbe.be/" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/wbe.svg" alt="Wallonie-Bruxelles Enseignement" className="footer-partner-logo" />
          </a>
          <div className="footer-eu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/union-europeenne.svg" alt="Union Européenne" className="footer-eu-logo" />
            <span>Cofinancé par l&apos;UE</span>
          </div>
        </div>
      </div>

      <div className="copy wrap">
        © 2026 Athénée Royal Jules Bara · Apprendre · S&apos;ouvrir · S&apos;accomplir
        <div className="credit">
          <span>Réalisation signée&nbsp;:</span>
          <a href="https://www.jas-dw.be" target="_blank" rel="noopener noreferrer" aria-label="JAS Digital Works">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jas-digital-works.png" alt="JAS Digital Works" />
          </a>
        </div>
      </div>
    </footer>
  );
}
