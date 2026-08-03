export default function StatsRow({ stats, grocery, spanLabel }) {
  if (!stats) return null;
  const ringDash = Math.min(100, stats.proteinPctOfTarget);
  const costLabel = spanLabel === "month" ? "Est. monthly cost" : "Est. weekly cost";

  return (
    <div className="stats">
      <div className="card stat protein">
        <div className="ring" aria-hidden>
          <svg viewBox="0 0 52 52" width="52" height="52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="var(--line)" strokeWidth="6" />
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke="var(--green)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(ringDash / 100) * 138} 138`}
              transform="rotate(-90 26 26)"
            />
          </svg>
          <div className="ringtxt">{stats.proteinPctOfTarget}%</div>
        </div>
        <div>
          <div className="k">Protein / day</div>
          <div className="v">
            {stats.avgProteinDay}
            <span className="u">g</span>
          </div>
          <div className="u">of ~{stats.target}g target</div>
        </div>
      </div>

      <div className="card stat">
        <div className="k">Calories / person</div>
        <div className="v">
          {stats.avgKcalPerson}
          <span className="u">kcal</span>
        </div>
        <div className="u">avg per day</div>
      </div>

      <div className="card stat">
        <div className="k">Vegetarian</div>
        <div className="v">
          {stats.vegPct}
          <span className="u">%</span>
        </div>
        <div className="u">of all meals</div>
      </div>

      <div className="card stat">
        <div className="k">{costLabel}</div>
        <div className="v">
          {grocery ? "₹" + grocery.totalInr.toLocaleString("en-IN") : "—"}
        </div>
        <div className="u">{grocery ? "from grocery list" : "build list below"}</div>
      </div>
    </div>
  );
}
