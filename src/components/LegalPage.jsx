import { useEffect } from "react";
import { PAGES } from "../legal/content.js";
import { LEGAL, LEGAL_LINKS, legalHref } from "../legal/config.js";

export function LegalLinks({ className = "legal-links" }) {
  return (
    <nav className={className} aria-label="Legal">
      {LEGAL_LINKS.map(([slug, label]) => (
        <a key={slug} href={legalHref(slug)}>{label}</a>
      ))}
    </nav>
  );
}

export default function LegalPage({ slug }) {
  const page = PAGES[slug];
  useEffect(() => {
    document.title = `${page.title} — ${LEGAL.product}`;
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="legal-wrap">
      <header className="legal-top">
        <a className="legal-brand disp" href="/">{LEGAL.product}</a>
        <a className="legal-back" href="/">&larr; Back to app</a>
      </header>

      <main className="legal-card card">
        <h1 className="disp">{page.title}</h1>
        <div className="legal-meta">Last updated: {LEGAL.updated} · {LEGAL.entity}</div>
        <p className="legal-intro">{page.intro}</p>

        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="disp">{s.h}</h2>
            {s.p && s.p.map((t, i) => <p key={i}>{t}</p>)}
            {s.ul && (
              <ul>
                {s.ul.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
      </main>

      <footer className="legal-foot">
        <LegalLinks />
        <div>© {new Date().getFullYear()} {LEGAL.entity}, {LEGAL.address}</div>
      </footer>
    </div>
  );
}
