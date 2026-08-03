import { MEAL_LABELS } from "../lib/constants.js";
import { dayProtein } from "../lib/nutrition.js";
import DishImage from "./DishImage.jsx";

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function openRecipe(mealId) {
  window.open(`?recipe=${encodeURIComponent(mealId)}`, "_blank", "noopener");
}

function Meal({ meal, showDivider, busy, onSwap }) {
  return (
    <>
      {showDivider && <div className="mdiv" />}
      <div className="meal">
        <DishImage dishName={meal.dish} className="meal-thumb" />
        <div className="mtype">{MEAL_LABELS[meal.mealType] || meal.mealType}</div>
        <div className="mname">
          <span className={"vmark " + (meal.isVeg ? "v" : "n")}>
            <i />
          </span>
          <span>{meal.dish}</span>
        </div>
        <div className="macros">
          <span className="macro">
            <b>{meal.proteinG}</b>g protein
          </span>
          <span className="macro">
            <b>{meal.kcal}</b> kcal
          </span>
          <span className="macro">
            <b>{meal.cookMin}</b>m
          </span>
        </div>
        <button className="recipe-btn" onClick={() => openRecipe(meal.id)}>
          View recipe
        </button>
        <button
          className={"swap" + (busy ? " busy" : "")}
          title="Swap this dish"
          onClick={() => onSwap(meal.id)}
          disabled={busy}
          aria-label={"Swap " + meal.dish}
        >
          {busy ? (
            <span
              className="spin"
              style={{ borderColor: "rgba(37,107,78,.3)", borderTopColor: "var(--green)" }}
            />
          ) : (
            <SwapIcon />
          )}
        </button>
      </div>
    </>
  );
}

export default function WeekGrid({ plan, swappingId, onSwap }) {
  return (
    <>
      <div className="section-h">
        <h2>{plan.span === "month" ? "This month's menu" : "This week's menu"}</h2>
        <span className="note">
          Tap a dish's recipe, or hover to swap it &middot;{" "}
          <span style={{ color: "var(--green)" }}>&#9673; veg</span> &middot;{" "}
          <span style={{ color: "var(--chili)" }}>&#9650; non-veg</span>
        </span>
      </div>

      <div className="week">
        {plan.days.map((day) => (
          <div key={day.id} className="card day">
            <div className="dh">
              <span className="dn">{day.label}</span>
              <span className="dp">{dayProtein(day)}g protein</span>
            </div>
            <div className="meals">
              {day.meals.map((meal, i) => (
                <Meal
                  key={meal.id}
                  meal={meal}
                  showDivider={i > 0}
                  busy={swappingId === meal.id}
                  onSwap={onSwap}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
