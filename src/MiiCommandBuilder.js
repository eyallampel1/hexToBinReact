// -----------------------------------------------------------------------------
// Mii Command Builder – plain‑JS + live decoder **v4 (final focus fix)**
// -----------------------------------------------------------------------------
// Why focus kept dropping:
//   • A component *defined inside* the parent gets a **new identity every render**.
//   • React therefore unmounts/remounts the <input>, losing focus.
// Fix:
//   • Move RawNumInput + NumInput *outside* the main component so their type
//     is stable. (React.memo then becomes optional but we keep it.)
//   • Remove the accidental duplicate React.memo wrapper that broke linting.
// -----------------------------------------------------------------------------
import React, { useState, useMemo } from "react";

// ====================== reusable numeric input =============================
function RawNumInput({ label, value, onChange, max, disabled }) {
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
        {value.toLowerCase().startsWith("0x") || /[a-f]/i.test(value) ? "hex" : "dec"}
      </span>
        </div>
    );
}
// Memoize so React skips re‑render unless the *value* or *disabled* prop changed.
const NumInput = React.memo(
    RawNumInput,
    (prev, next) => prev.value === next.value && prev.disabled === next.disabled
);
// ===========================================================================

export default function MiiCommandBuilder() {
    // ---------------- state ----------------------------------------------
    const [mode, setMode]   = useState("read"); // "read" | "write"
    const [phyAddr, setPhy] = useState("04");   // default 0x04 (Port‑4 PHY)
    const [regAddr, setReg] = useState("02");   // default 0x02 (PHY‑ID1)
    const [data, setData]   = useState("0000"); // payload for WRITE mode
    const [copied, setCopied] = useState(false);

    // helper: flex‑radix parser  ------------------------------------------
    const toWord = (val) => {
        if (!val) return 0;
        const s = val.trim();
        if (s.toLowerCase().startsWith("0x")) return parseInt(s.slice(2), 16) & 0xffff;
        if (/[a-f]/i.test(s))                 return parseInt(s,        16) & 0xffff;
        return parseInt(s, 10) & 0xffff; // decimal fallback
    };

    // ---------------- build command word ---------------------------------
    const cmdWord = useMemo(() => {
        const busy     = 0x8000;
        const clause22 = 0x1000;
        const op       = mode === "read" ? 0x0800 : 0x0400;
        const dev      = (toWord(phyAddr) & 0x1f) << 5;
        const reg      =  toWord(regAddr) & 0x1f;
        return (busy | clause22 | op | dev | reg) & 0xffff;
    }, [mode, phyAddr, regAddr]);

    const cmdHex = cmdWord.toString(16).padStart(4, "0").toUpperCase();

    // ---------------- decode helper --------------------------------------
    const decode = useMemo(() => ({
        SMIBusy: (cmdWord & 0x8000) ? 1 : 0,
        SMIMode: (cmdWord & 0x1000) ? "Clause 22" : "Clause 45",
        SMIOp:   (cmdWord >> 10) & 0x3,
        DevAddr: (cmdWord >> 5)  & 0x1f,
        RegAddr:  cmdWord        & 0x1f,
    }), [cmdWord]);

    const opLabel = decode.SMIMode === "Clause 22"
        ? ["Reserved", "Write Data", "Read Data", "Reserved"][decode.SMIOp]
        : ["Write Addr", "Write Data", "Read Data+", "Read Data"][decode.SMIOp];

    // ---------------- full mii script ------------------------------------
    const sequence = useMemo(() => {
        const out = [];
        if (mode === "write") {
            out.push("# Load data word");
            out.push(`mii write 0x1c 0x19 0x${data.padStart(4, "0").toUpperCase()}`);
        }
        out.push("# Send command word");
        out.push(`mii write 0x1c 0x18 0x${cmdHex}`);
        if (mode === "read") {
            out.push("# Fetch returned data");
            out.push("mii read  0x1c 0x19");
        }
        return out.join("\n");
    }, [mode, cmdHex, data]);

    // ---------------- clipboard helper -----------------------------------
    const copySeq = () => {
        navigator.clipboard.writeText(sequence).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        });
    };

    // --------------------------- UI --------------------------------------
    return (
        <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "Arial, sans" }}>
            <h2 style={{ textAlign: "center" }}>MII Indirect Command Builder</h2>

            {/* mode selector */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
                {["read", "write"].map((m) => (
                    <label key={m} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                            type="radio"
                            name="mode"
                            value={m}
                            checked={mode === m}
                            onChange={() => setMode(m)}
                        />
                        <span style={{ textTransform: "capitalize" }}>{m}</span>
                    </label>
                ))}
            </div>

            {/* inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginTop: 20 }}>
                <NumInput label="PHY addr" value={phyAddr} onChange={setPhy} max={6} />
                <NumInput label="Reg addr" value={regAddr} onChange={setReg} max={6} />
                <NumInput label="Data"     value={data}    onChange={setData} max={6} disabled={mode === "read"} />
            </div>

            {/* command script */}
            <pre style={{ background: "#1e1e1e", color: "#00c853", padding: 12, borderRadius: 6, marginTop: 20, whiteSpace: "pre-wrap" }}>
        {sequence}
      </pre>

            {/* decoded fields */}
            <div style={{ marginTop: 20, fontFamily: "monospace", fontSize: 14 }}>
                <strong>Decode 0x{cmdHex}:</strong>
                <div>Bits 15‥0 : 0x{cmdHex}</div>
                <div>Busy      : {decode.SMIBusy}</div>
                <div>Mode      : {decode.SMIMode}</div>
                <div>Opcode    : 0b{decode.SMIOp.toString(2).padStart(2, "0")} ({opLabel})</div>
                <div>DevAddr   : 0x{decode.DevAddr.toString(16).toUpperCase()} ({decode.DevAddr})</div>
                <div>RegAddr   : 0x{decode.RegAddr.toString(16).toUpperCase()} ({decode.RegAddr})</div>
            </div>

            {/* copy button */}
            <div style={{ textAlign: "right", marginTop: 8 }}>
                <button onClick={copySeq} style={{ padding: "6px 12px" }}>
                    {copied ? "Copied ✅" : "Copy"}
                </button>
            </div>
        </div>
    );
}