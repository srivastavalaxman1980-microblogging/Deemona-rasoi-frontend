import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { DishCard } from "./DishImage.jsx";
import { dishGlyph } from "../lib/foodGlyph.js";
import { useLang } from "../lib/i18n.jsx";

export default function RecipeView({ mealId }) {
  const { t, langObj } = useLang();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .getRecipe(mealId, langObj.name)
      .then((r) => {
        if (alive) {
          setRecipe(r);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [mealId, langObj.name]);

  useEffect(() => {
    if (recipe?.dishName) document.title = recipe.dishName + " — Deemona Rasoi";
  }, [recipe]);

  return (
    <div className="wrap recipe">
      <a className="rback" href="/">
        &larr; {t("recipe.back")}
      </a>

      {loading && (
        <div className="card empty">
          <p>{t("recipe.loading")}</p>
        </div>
      )}

      {error && (
        <div className="err">
          <span>&#9888;&#65039;</span>
          <span>{error}</span>
        </div>
      )}

      {recipe && (
        <>
          <div className="rhero">
            {recipe.image?.url ? (
              <img className="rhero-img" src={recipe.image.url} alt={recipe.dishName} />
            ) : (
              <DishCard dishName={recipe.dishName} className="rhero-img" />
            )}
            <div className="rhero-body">
              <div className="rtitle disp">
                <span className={"vmark " + (recipe.isVeg ? "v" : "n")}>
                  <i />
                </span>
                {recipe.dishName}
              </div>
              {recipe.description && <p className="rdesc">{recipe.description}</p>}
              <div className="rmeta">
                <span>{recipe.cuisine}</span>
                <span>&middot;</span>
                <span>{t("recipe.serves")} {recipe.servings}</span>
                <span>&middot;</span>
                <span>{recipe.isVeg ? "Vegetarian" : "Non-vegetarian"}</span>
              </div>
            </div>
          </div>

          <div className="rsection">
            <h3 className="disp">{t("recipe.ingredients")}</h3>
            <div className="ingredients">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="ingredient card">
                  {ing.image ? (
                    <img className="ing-img" src={ing.image} alt={ing.name} loading="lazy" />
                  ) : (
                    <span className="ing-glyph" aria-hidden>
                      {dishGlyph(ing.name)}
                    </span>
                  )}
                  <div className="ing-text">
                    <span className="ing-name">{ing.name}</span>
                    {ing.quantity && <span className="ing-qty">{ing.quantity}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rsection">
            <h3 className="disp">{t("recipe.method")}</h3>
            <ol className="steps">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="stepnum mono">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tips?.length > 0 && (
            <div className="rsection">
              <h3 className="disp">{t("recipe.tips")}</h3>
              <ul className="tips">
                {recipe.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rcredit">
            {recipe.image?.creditUrl ? (
              <>
                Photo by{" "}
                <a href={recipe.image.creditUrl} target="_blank" rel="noreferrer">
                  {recipe.image.creditName || "photographer"}
                </a>{" "}
                on{" "}
                <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
                  Pexels
                </a>
              </>
            ) : (
              <>
                Photos via{" "}
                <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
                  Pexels
                </a>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
