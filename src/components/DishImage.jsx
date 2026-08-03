import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { dishGlyph, hueFor } from "../lib/foodGlyph.js";

export function DishCard({ dishName, className = "" }) {
  const hue = hueFor(dishName);
  return (
    <div
      className={"dishcard " + className}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 45% 88%), hsl(${(hue + 40) % 360} 42% 80%))`,
      }}
      aria-hidden
    >
      <span className="dishglyph">{dishGlyph(dishName)}</span>
    </div>
  );
}

// Lazily fetches a photo for the dish; shows the stylized card while loading
// or when no photo is available.
export default function DishImage({ dishName, className = "" }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .getDishImage(dishName)
      .then((r) => alive && setUrl(r?.url || null))
      .catch(() => alive && setUrl(null));
    return () => {
      alive = false;
    };
  }, [dishName]);

  if (url) {
    return (
      <img className={"dishimg " + className} src={url} alt={dishName} loading="lazy" />
    );
  }
  return <DishCard dishName={dishName} className={className} />;
}
