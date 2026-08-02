export default function Header() {
  return (
    <div className="top">
      <div className="brand">
        <div className="logo" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 9a8 8 0 0116 0"
              stroke="#E39B2C"
              strokeWidth="2"
              strokeLinecap="round"
            />
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
          <div className="sub">AI Household Nutrition &amp; Kitchen OS</div>
        </div>
      </div>
      <div className="maker">Deemona&nbsp;Technologies</div>
    </div>
  );
}
