import { useState, useEffect, useRef } from "react";

const labelOf = (loc) =>
  `${loc.building}${loc.room ? " - " + loc.room : ""}`;

export default function LocationPicker({ locations, onChange, onCreate }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const q = text.trim().toLowerCase();
  const matches = locations.filter((l) =>
    labelOf(l).toLowerCase().includes(q),
  );
  const exactMatch = locations.some((l) => labelOf(l).toLowerCase() === q);

  const pick = (loc) => {
    setText(labelOf(loc));
    onChange(String(loc.id));
    setOpen(false);
  };

  const handleType = (e) => {
    setText(e.target.value);
    onChange(""); // typing again clears the earlier choice
    setOpen(true);
  };

  const handleAdd = async () => {
    setCreating(true);
    try {
      const loc = await onCreate(text.trim());
      pick(loc);
    } catch {
      alert("Couldn't add that location. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="picker-wrap" ref={wrapRef}>
      <input
        className="auth-input"
        placeholder="e.g. Engineering Block B - Hall 4"
        value={text}
        onChange={handleType}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (matches.length > 0 || (q && !exactMatch)) && (
        <div className="picker-menu">
          {matches.map((loc) => (
            <button
              type="button"
              key={loc.id}
              className="picker-item"
              onClick={() => pick(loc)}
            >
              {labelOf(loc)}
            </button>
          ))}
          {q && !exactMatch && (
            <button
              type="button"
              className="picker-item picker-add"
              onClick={handleAdd}
              disabled={creating}
            >
              {creating ? "Adding..." : `+ Add "${text.trim()}" as new location`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}