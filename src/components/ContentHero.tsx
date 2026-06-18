import { shade } from "@/lib/colors";

// Bandeau d'en-tête des pages de contenu (filières, restaurant, calendrier…),
// aligné sur la charte (héro marine, pastille orange, titre Fraunces).

export default function ContentHero({
  eyebrow,
  title,
  sub,
  color = "#1b2245",
  textColor,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <section
      className="hero"
      style={{ background: `linear-gradient(160deg,${shade(color)},${color})` }}
    >
      <div
        className="hero-in"
        style={{
          gridTemplateColumns: "1fr",
          padding: "72px 30px 84px",
          ...(textColor ? { color: textColor } : {}),
        }}
      >
        <div className="reveal in">
          <span className="pill">
            <span className="dot" /> {eyebrow}
          </span>
          <h1 className="serif" style={{ fontSize: "clamp(34px,5vw,58px)" }}>
            {title}
          </h1>
          {sub && <p className="sub">{sub}</p>}
        </div>
      </div>
    </section>
  );
}
