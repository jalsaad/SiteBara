import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { listArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const news = await listArticles({ publishedOnly: true, limit: 3 });

  return (
    <>
      {/* ============ héro ============ */}
      <section className="hero" id="pub-hero">
        <video className="hero-video" autoPlay muted loop playsInline src="/hero.mp4" />
        <div className="hero-veil" />
        <div className="hero-in">
          <div className="reveal in">
            <span className="pill">
              <span className="dot" /> Établissement d&apos;enseignement · Fondé en 1595
            </span>
            <h1 className="serif">
              Apprendre,
              <br />
              <em>s&apos;ouvrir</em>,
              <br />
              s&apos;accomplir.
            </h1>
            <p className="sub">
              Au cœur de Tournai, un athénée où chaque élève est accompagné
              individuellement vers la réussite, dans un cadre moderne et
              bienveillant.
            </p>
            <div className="hero-btns">
              <Link className="btn btn-orange" href="/#contact">
                Préinscriptions ouvertes →
              </Link>
              <Link className="btn btn-ghost" href="/#mission">
                Découvrir l&apos;école
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="n serif">
                  430<em>+</em>
                </div>
                <div className="l">Ans d&apos;histoire</div>
              </div>
              <div>
                <div className="n serif">950</div>
                <div className="l">Élèves heureux</div>
              </div>
              <div>
                <div className="n serif">100%</div>
                <div className="l">Personnels investis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ mission ============ */}
      <section className="mission" id="mission">
        <div className="mission-in">
          <p className="big serif reveal">
            Depuis plus de quatre siècles, l&apos;Athénée Royal Jules Bara
            forme des esprits <em>curieux, ouverts et autonomes</em>.
          </p>
          <div className="pillar reveal">
            <div className="num">01</div>
            <h3 className="serif">Apprendre</h3>
            <p>
              Des approches pédagogiques diversifiées et ludiques, du matériel
              moderne et un suivi personnalisé de chaque élève.
            </p>
          </div>
          <div className="pillar reveal">
            <div className="num">02</div>
            <h3 className="serif">S&apos;ouvrir</h3>
            <p>
              Échanges, projets citoyens, langues et culture : une école
              tournée vers le monde et la diversité.
            </p>
          </div>
          <div className="pillar reveal">
            <div className="num">03</div>
            <h3 className="serif">S&apos;accomplir</h3>
            <p>
              Développer l&apos;autonomie et la confiance pour que chacun
              trouve sa voie et révèle son potentiel.
            </p>
          </div>
        </div>
      </section>

      <main>
        {/* ============ accès rapides ============ */}
        <section className="wrap section" style={{ paddingTop: 60 }} id="grilles">
          <div className="shead reveal">
            <span className="eyebrow">Accès rapides</span>
            <h2 className="serif">
              Tout ce dont vous avez besoin, <em>en un clic</em>
            </h2>
            <p className="lead">
              Élèves, parents et enseignants accèdent directement aux
              ressources essentielles de l&apos;établissement.
            </p>
          </div>
          <div className="access">
            <a className="acard reveal" style={{ "--c": "var(--royal)" } as React.CSSProperties} href="#grilles">
              <div className="ic">🎓</div>
              <h3 className="serif">Nos filières</h3>
              <p>
                Grilles horaires du premier au troisième degré, DASPA et 7ᵉ
                préparatoire.
              </p>
              <span className="go">Voir les grilles →</span>
            </a>
            <a className="acard reveal" style={{ "--c": "var(--orange)" } as React.CSSProperties} href="#calendrier">
              <div className="ic">📅</div>
              <h3 className="serif">Calendrier</h3>
              <p>Dates clés, congés et événements de l&apos;année scolaire en cours.</p>
              <span className="go">Consulter →</span>
            </a>
            <a className="acard reveal" style={{ "--c": "var(--teal)" } as React.CSSProperties} href="#numerique">
              <div className="ic">💻</div>
              <h3 className="serif">École numérique</h3>
              <p>
                Google Classroom, APSchool et l&apos;espace de travail en ligne
                MyBara.
              </p>
              <span className="go">Se connecter →</span>
            </a>
            <a className="acard reveal" style={{ "--c": "var(--gold)" } as React.CSSProperties} href="#restaurant" id="restaurant">
              <div className="ic">🍽️</div>
              <h3 className="serif">Restaurant</h3>
              <p>Menus de la semaine et informations sur la cantine scolaire.</p>
              <span className="go">Voir le menu →</span>
            </a>
          </div>
        </section>

        {/* ============ école numérique ============ */}
        <section className="wrap section" id="numerique">
          <div className="split">
            <div className="split-visual reveal">
              <div className="ic">💻</div>
              <div className="tags">
                <span>Google Classroom</span>
                <span>APSchool</span>
                <span>Tableaux interactifs</span>
                <span>MyBara</span>
              </div>
            </div>
            <div className="reveal">
              <span className="eyebrow">Une école résolument numérique</span>
              <h2
                className="serif"
                style={{ fontSize: "clamp(28px,3.6vw,40px)", lineHeight: 1.1 }}
              >
                Des outils modernes au service de la <em>pédagogie</em>
              </h2>
              <ul className="flist">
                <li>
                  <span className="ck">✓</span>
                  <div>
                    <b>Classes connectées</b>
                    <span>
                      Matériel moderne et environnements numériques de travail.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="ck">✓</span>
                  <div>
                    <b>Suivi en ligne</b>
                    <span>
                      Parents et élèves suivent les résultats et communications
                      via MyBara.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="ck">✓</span>
                  <div>
                    <b>Accompagnement adapté</b>
                    <span>
                      Prise en charge des troubles de l&apos;apprentissage et
                      école des devoirs.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ============ actus ============ */}
        <section className="news-band" id="actus">
          <div className="wrap section">
            <div className="news-head reveal">
              <div className="shead" style={{ marginBottom: 0 }}>
                <span className="eyebrow">Vie de l&apos;école</span>
                <h2 className="serif">
                  Dernières <em>actualités</em>
                </h2>
              </div>
              <Link
                className="btn btn-ghost"
                style={{ borderColor: "var(--line)", color: "var(--royal)" }}
                href="/actualites"
              >
                Toutes les actus →
              </Link>
            </div>
            <div className="news-grid">
              {news.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ citation ============ */}
        <section className="wrap section">
          <div className="quote reveal">
            <div className="mark serif">“</div>
            <blockquote>
              Une école n&apos;est pas un lieu où l&apos;on entasse des
              savoirs, mais où l&apos;on apprend à devenir soi-même.
            </blockquote>
            <div className="who">
              — <b>L&apos;équipe pédagogique</b>, Athénée Royal Jules Bara
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="wrap cta-band" id="contact">
          <div className="banner reveal">
            <div className="bc">
              <h2 className="serif">Envie de rejoindre l&apos;aventure Bara ?</h2>
              <p>
                Les préinscriptions pour la prochaine rentrée sont ouvertes.
                Venez nous rencontrer.
              </p>
            </div>
            <a
              className="btn btn-light"
              style={{ position: "relative", zIndex: 2 }}
              href="mailto:direction@atheneejulesbara.be"
            >
              Je m&apos;inscris →
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
