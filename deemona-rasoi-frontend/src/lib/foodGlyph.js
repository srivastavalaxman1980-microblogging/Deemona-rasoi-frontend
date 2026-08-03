const GLYPH_RULES = [
  [/rice|pulao|biryani|khichdi|congee/, "\u{1F35A}"],
  [/noodle|pad thai|chow ?mein|hakka|pad see|ramen|udon/, "\u{1F35C}"],
  [/spring roll|momo|dumpling|manchurian|satay|gyoza|bao/, "\u{1F95F}"],
  [/roti|paratha|naan|bhatura|puri|litti|bread|toast|bun|paratha/, "\u{1FAD3}"],
  [/chilla|dosa|uttapam|cheela|omelette|pancake|poha|upma|daliya|idli/, "\u{1F95E}"],
  [/salad|chaat|sprout|kachumber|papaya|som tam|slaw/, "\u{1F957}"],
  [/paneer|tofu|cheese/, "\u{1F9C0}"],
  [/chicken|mutton|keema|kebab|tikka|lamb/, "\u{1F357}"],
  [/fish|prawn|seafood|shrimp/, "\u{1F41F}"],
  [/egg|bhurji|anda/, "\u{1F95A}"],
  [/dal|kadhi|sambar|rasam|soup|curry|kadhai|masala|gravy|korma|panang|massaman|tom yum|tom kha/, "\u{1F35B}"],
  [/fruit|mango|banana|apple|pomegranate/, "\u{1F34E}"],
  [/tea|chaas|buttermilk|lassi|smoothie|milk|juice/, "\u{1F964}"],
  [/onion|garlic|ginger|tomato|potato|vegetable|carrot|beans|peas|spinach|palak|cabbage/, "\u{1F9C5}"],
  [/rice flour|atta|flour|besan|semolina|rava|maida/, "\u{1F33E}"],
  [/oil|ghee|butter/, "\u{1FAD9}"],
  [/salt|sugar|spice|masala|powder|chili|turmeric|cumin|pepper/, "\u{1F9C2}"],
];

export function dishGlyph(name = "") {
  const n = String(name).toLowerCase();
  for (const [re, glyph] of GLYPH_RULES) if (re.test(n)) return glyph;
  return "\u{1F37D}\u{FE0F}"; // fork & knife
}

// Deterministic hue so a given dish always gets the same card color.
export function hueFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}
