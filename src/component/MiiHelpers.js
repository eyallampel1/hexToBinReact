import React from "react";

function RawNumInput({ label, value, onChange, max = 8, disabled = false }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12 }}>{label}</label>
            <input
                type="text"
                value={value}
                disabled={disabled}
                maxLength={max}
                onChange={(e) => onChange(e.target.value)}
                style={{ padding: 4, fontFamily: "monospace" }}
            />
            <span style={{ fontSize: 10, color: "#888" }}>
                {value.toLowerCase().startsWith("0x") || /[a-f]/i.test(value)
                    ? "hex"
                    : "dec"}
            </span>
        </div>
    );
}

export const NumInput = React.memo(
    RawNumInput,
    (p, n) => p.value === n.value && p.disabled === n.disabled
);

export const toWord = (v) => {
    if (!v) return 0;
    const s = v.trim();
    if (s.toLowerCase().startsWith("0x")) return parseInt(s.slice(2), 16) & 0xffff;
    if (/[a-f]/i.test(s)) return parseInt(s, 16) & 0xffff;
    return parseInt(s, 10) & 0xffff;
};