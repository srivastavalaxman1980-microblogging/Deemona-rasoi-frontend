import { LANGUAGES, useLang } from "../lib/i18n.jsx";

export default function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="top">
      <div className="brand">
        <div className="logo" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 9a8 8 0 0116 0" stroke="#E39B2C" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M2 9h20M6 9v9a2 2 0 002 2h8a2 2 0 002-2V9"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1 className="disp">Deemona&nbsp;Rasoi</h1>
          <div className="sub">{t("app.tagline")}</div>
        </div>
      </div>
      <div className="top-right">
        <label className="lang-select" title={t("lang.label")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
          </svg>
          <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t("lang.label")}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </label>
        <div className="maker">Deemona&nbsp;Technologies</div>
      </div>
    </div>
  );
}
