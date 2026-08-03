export default function SummaryBar({ household, plan, busy, onEdit, onRegenerate }) {
  const c = plan.constraints || household || {};
  return (
    <div className="card sumbar">
      <div className="tags">
        <span className="tag">
          {c.adults}A · {c.kids}K
        </span>
        <span className="tag">{c.diet}</span>
        <span className="tag">{c.region}</span>
        <span className="tag">{c.goal}</span>
        <span className="tag">≤{c.maxCookMin} min</span>
        {plan.occasion && plan.occasion !== "Regular week" && (
          <span className="tag">{plan.occasion}</span>
        )}
        {(c.allergies || []).map((a) => (
          <span key={a} className="tag">
            no {a.toLowerCase()}
          </span>
        ))}
        <span className="tag">{plan.span === "month" ? "monthly" : "weekly"}</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onEdit}>
          Edit
        </button>
        <button className="btn btn-primary" onClick={onRegenerate} disabled={busy}>
          {busy ? (
            <>
              <span className="spin" />
              Regenerating…
            </>
          ) : (
            "Regenerate"
          )}
        </button>
      </div>
    </div>
  );
}
