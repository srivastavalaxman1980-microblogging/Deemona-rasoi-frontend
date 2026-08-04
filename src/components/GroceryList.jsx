import { GROCERY_CATEGORIES } from "../lib/constants.js";
import { useLang } from "../lib/i18n.jsx";

export default function GroceryList({ plan, grocery, busy, householdSize, onBuild }) {
  const { t } = useLang();
  const perPersonDaily =
    grocery && householdSize
      ? Math.round(grocery.totalInr / plan.days.length / householdSize)
      : null;

  const buyItems = grocery ? grocery.items.filter((x) => !x.isHave) : [];
  const ownedItems = grocery ? grocery.items.filter((x) => x.isHave) : [];

  return (
    <div className="grocery">
      <div className="section-h">
        <h2>{t("grocery.title")}</h2>
        <span className="note">
          Consolidated for the whole {plan.span === "month" ? "month" : "week"}, minus
          what's in your pantry
        </span>
      </div>

      {!grocery && (
        <div className="card empty">
          <p>
            Turn this menu into one shopping list, grouped by aisle and priced for
            Indian retail. Anything in your pantry is left off.
          </p>
          <button className="btn btn-primary" onClick={onBuild} disabled={busy}>
            {busy ? (
              <>
                <span className="spin" />
                {t("grocery.adding")}
              </>
            ) : (
              t("grocery.build")
            )}
          </button>
        </div>
      )}

      {grocery && (
        <>
          {ownedItems.length > 0 && (
            <div className="pantry-note">
              {ownedItems.length} item{ownedItems.length === 1 ? "" : "s"} skipped &mdash;
              already in your pantry: {ownedItems.map((x) => x.item).join(", ")}
            </div>
          )}

          <div className="gcats">
            {GROCERY_CATEGORIES.map((cat) => {
              const items = buyItems.filter((x) => x.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="card gcat">
                  <h4>{cat}</h4>
                  {items.map((x) => (
                    <div key={x.id} className="gitem">
                      <span>
                        {x.item} <span className="q">{x.quantity}</span>
                      </span>
                      <span className="r">&#8377;{x.costInr}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="card gtotal">
            <div>
              <div className="lbl">
                Estimated {plan.span === "month" ? "monthly" : "weekly"} grocery bill
              </div>
              {perPersonDaily != null && (
                <div className="lbl" style={{ marginTop: 4 }}>
                  &asymp; &#8377;{perPersonDaily}/person/day
                </div>
              )}
            </div>
            <div>
              <span className="amt">&#8377;{grocery.totalInr.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
