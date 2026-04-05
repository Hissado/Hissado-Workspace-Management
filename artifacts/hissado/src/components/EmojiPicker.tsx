import React, { useState, useRef, useEffect } from "react";

const C = {
  navy: "#070D1A",
  gold: "#C9A84C",
  w: "#FFFFFF",
  g50: "#F8F9FA",
  g100: "#F1F3F5",
  g200: "#E2E5EE",
  g400: "#9BA3B5",
  g500: "#6B7280",
};

const CATEGORIES: { id: string; label: string; icon: string; emojis: string[] }[] = [
  {
    id: "recent",
    label: "Frequent",
    icon: "🕐",
    emojis: ["😀","😂","❤️","👍","🙏","🎉","🔥","✅","😊","🤔","👋","💪","🎯","🚀","💡","⭐"],
  },
  {
    id: "smileys",
    label: "Smileys",
    icon: "😀",
    emojis: [
      "😀","😁","😂","🤣","😃","😄","😅","😆","😇","😉","😊","😋","😎","😍","🥰","😘",
      "😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮",
      "🤐","😯","😪","😫","🥱","😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕","🙃",
      "🤑","😲","😖","😞","😟","😤","😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱",
      "🥵","🥶","😳","🤪","😵","😡","😠","🤬","😷","🤒","🤕","🤢","🤮","🤧","🥴","🥳",
      "😈","👿","💀","👻","👽","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾",
    ],
  },
  {
    id: "people",
    label: "People",
    icon: "👋",
    emojis: [
      "👋","🤚","🖐","✋","🖖","👌","✌","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝",
      "👍","👎","✊","👊","🤛","🤜","👏","🙌","🤲","🤝","🙏","✍","💅","💪","🦾","🦵",
      "🦶","👂","👃","👀","👅","👄","💋","🫶","💏","💑","👶","🧒","👦","👧","🧑","👱",
      "👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷",
      "💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🧖","🧘","🛀","🧗","🏋","🤸","⛹","🤾",
    ],
  },
  {
    id: "nature",
    label: "Animals",
    icon: "🐶",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈",
      "🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦋","🐛","🐌","🐜","🦗","🕷","🐢","🐍",
      "🦎","🐬","🐋","🦈","🐙","🦑","🦀","🦞","🐡","🐠","🐟","🐊","🐆","🐅","🦓","🐘",
      "🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐄","🐎","🐖","🐑","🐐","🦌","🐕","🐈","🐓",
      "🌵","🎄","🌲","🌳","🌴","🪴","🌱","🌿","☘","🍀","🍃","🍂","🍁","🍄","🌾","💐",
      "🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌙","⭐","🌈",
    ],
  },
  {
    id: "food",
    label: "Food",
    icon: "🍔",
    emojis: [
      "🍎","🍊","🍋","🍌","🍍","🥭","🍓","🍒","🍑","🥝","🍅","🫒","🥥","🍇","🍉","🍈",
      "🍐","🍏","🍆","🥑","🥦","🥬","🥒","🌶","🌽","🥕","🧄","🧅","🥔","🍠","🥜","🍞",
      "🥐","🥖","🫓","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟",
      "🍕","🌮","🌯","🥙","🧆","🍱","🍜","🍝","🍣","🍤","🍥","🧁","🍰","🎂","🍮","🍭",
      "🍬","🍫","🍿","🍩","🍪","🌰","🍯","🧃","🥤","🧋","☕","🍵","🍺","🍻","🥂","🍷",
      "🥃","🍸","🍹","🍾","🧊","🍴","🥢",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    icon: "✈️",
    emojis: [
      "🚗","🚕","🚙","🚌","🏎","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍","🛵","🚲",
      "🛹","🚁","🛸","🚀","✈","🛩","⛵","🚤","🛥","🚢","🚂","🚃","🚄","🚅","🚆","🚇",
      "🚈","🚉","🚊","🚝","🚞","🏰","🏯","🗼","🗽","⛪","🕌","⛩","🗺","🧭","🏔","⛰",
      "🌋","🗻","🏕","🏖","🏗","🏘","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏧","🏨","🏩",
      "🏪","🏫","🏬","🏭","🌃","🌆","🌇","🌉","🌌","🎠","🎡","🎢","⛲","⛺","🚏","🚦",
      "⛽","🗑","🗿","🗺","🧳","🌐","🗾","🧭",
    ],
  },
  {
    id: "activities",
    label: "Activities",
    icon: "⚽",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🏐","🏉","🥏","🎾","🏸","🏒","🏑","🥍","🏏","🥅","⛳",
      "🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷","⛸","⛹","🏋","🤺","🤾","🏄","🏊","🚴",
      "🏇","🏂","🪂","🧗","🚣","🤽","🎯","🎱","🎳","🎰","🎲","♟","🧩","🎭","🎨","🎬",
      "🎤","🎧","🎼","🎵","🎶","🎷","🎸","🎹","🎺","🎻","🥁","🎮","🕹","🎪","🎗","🎟",
      "🎫","🏆","🥇","🥈","🥉","🏅","🎀","🎁","🎊","🎉","🎋","🎍","🎎","🎐","🎑","🎆",
      "🎇","✨","🎃","🎄","🎅","⛄","🎑","🧨",
    ],
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: [
      "💡","🔦","🕯","🔋","🔌","💻","⌨","🖥","🖨","🖱","📱","☎","📞","📟","📺","📻",
      "📷","📸","📹","🎥","📽","🎞","📡","🔭","🔬","🩺","💊","🩹","🧪","🧫","🧬","🧲",
      "🪜","🧰","🔧","🔩","⚙","🔑","🗝","🔏","🔐","🔒","🔓","🔨","⛏","⚒","🛠","🗡",
      "🛡","🔪","🪤","🗑","💌","📦","📫","📬","📭","📮","📯","📜","📃","📑","📊","📈",
      "📉","📋","📁","📂","🗂","🗃","🗄","📄","📝","✏","🖊","🖋","🖌","🖍","📅","📆",
      "📌","📍","📏","📐","✂","🔎","🔮","🪬","🧸","🪆","🖼","🪞","🛏","🛋","🚪","🪑",
      "🚽","🚿","🛁","🧴","🧷","🧹","🧺","🧻","🧼","🪥","🧽","💈","🛒","🎭","🎨","🖼",
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "❤️",
    emojis: [
      "❤","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤‍🔥","❤‍🩹","💕","💞","💓","💗",
      "💖","💘","💝","💟","❣","💬","💭","💯","♾","✔","❌","❎","⭕","🔱","📛","🔰",
      "✨","⚡","💫","🌀","🔯","✅","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔶",
      "🔷","🔸","🔹","🔺","🔻","💠","🔘","🔳","🔲","▶","⏩","⏭","◀","⏪","⏮","🔼",
      "⏫","🔽","⏬","⏸","⏹","⏺","🎦","🔅","🔆","📶","🔔","🔕","🔇","🔈","🔉","🔊",
      "#️⃣","*️⃣","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","💯",
      "❓","❔","❕","❗","➕","➖","➗","✖","♀","♂","⚧","💱","💲","©","®","™",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  align?: "left" | "right";
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, align = "left" }) => {
  const [activeCategory, setActiveCategory] = useState("recent");
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const activeEmojis = search.trim()
    ? CATEGORIES.flatMap((c) => c.emojis).filter((e) =>
        e.includes(search.trim())
      )
    : (CATEGORIES.find((c) => c.id === activeCategory)?.emojis ?? []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        [align === "right" ? "right" : "left"]: 0,
        width: 320,
        background: C.w,
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08)",
        border: `1px solid ${C.g200}`,
        zIndex: 9999,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Search */}
      <div style={{ padding: "10px 10px 6px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis…"
          autoFocus
          style={{
            width: "100%",
            padding: "7px 12px",
            borderRadius: 8,
            border: `1px solid ${C.g200}`,
            outline: "none",
            fontSize: 13,
            fontFamily: "inherit",
            background: C.g50,
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{
          display: "flex",
          overflowX: "auto",
          padding: "4px 8px 0",
          gap: 2,
          borderBottom: `1px solid ${C.g100}`,
          scrollbarWidth: "none",
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              title={cat.label}
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                background: activeCategory === cat.id ? `${C.gold}15` : "none",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .12s",
                borderBottom: activeCategory === cat.id ? `2px solid ${C.gold}` : "2px solid transparent",
              }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: 2,
        padding: "8px",
        maxHeight: 220,
        overflowY: "auto",
      }}>
        {activeEmojis.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px 0", color: C.g400, fontSize: 13 }}>
            No emojis found
          </div>
        ) : (
          activeEmojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              onClick={() => { onSelect(emoji); }}
              style={{
                width: "100%",
                aspectRatio: "1",
                background: "none",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .1s, transform .1s",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.g100;
                e.currentTarget.style.transform = "scale(1.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {emoji}
            </button>
          ))
        )}
      </div>

      {/* Category label */}
      {!search && (
        <div style={{
          padding: "4px 12px 8px",
          fontSize: 11,
          fontWeight: 600,
          color: C.g400,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {CATEGORIES.find((c) => c.id === activeCategory)?.label}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
