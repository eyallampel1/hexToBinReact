import React, { useState, useMemo } from "react";
import { NumInput, toWord } from "./MiiHelpers";

export default function BasicControlPanel() {
    const [ctrlReg, setCtrlReg] = useState("4040");
    const [statReg, setStatReg] = useState("7809");

    const decodeControl = useMemo(() => {
        const val = toWord(ctrlReg);
        return {
            softReset: !!(val & 0x8000),
            loopback: !!(val & 0x4000),
            speed100: !!(val & 0x2000),
            autoNeg: !!(val & 0x1000),
            powerDown: !!(val & 0x0800),
            isolate: !!(val & 0x0400),
            restartAuto: !!(val & 0x0200),
            fullDuplex: !!(val & 0x0100),
            collision: !!(val & 0x0080),
        };
    }, [ctrlReg]);

    const decodeStatus = useMemo(() => {
        const val = toWord(statReg);
        return {
            capability100T4: !!(val & 0x8000),
            capability100XFull: !!(val & 0x4000),
            capability100XHalf: !!(val & 0x2000),
            capability10Full: !!(val & 0x1000),
            capability10Half: !!(val & 0x0800),
            mfPreambleSup: !!(val & 0x0040),
            autoNegComplete: !!(val & 0x0020),
            remoteFault: !!(val & 0x0010),
            autoNegAbility: !!(val & 0x0008),
            linkStatus: !!(val & 0x0004),
            jabberDetect: !!(val & 0x0002),
            extendedCapability: !!(val & 0x0001),
        };
    }, [statReg]);

    const script = useMemo(() => {
        return [
            "# Basic PHY Control Register",
            "# Write control register",
            `mii write 0x00 0x00 0x${ctrlReg.padStart(4, "0").toUpperCase()}`,
            "",
            "# Read status register",
            "mii read 0x00 0x01",
            "",
            "# Read control register back",
            "mii read 0x00 0x00"
        ].join("\n");
    }, [ctrlReg]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>⚙️ Basic PHY Control</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                    <NumInput label="Control Register (0x00)" value={ctrlReg} onChange={setCtrlReg} />
                    <div style={{ marginTop: 16, fontSize: 12 }}>
                        <h4 style={{ margin: "0 0 8px 0" }}>Control Bits:</h4>
                        {Object.entries(decodeControl).map(([key, val]) => (
                            <div key={key} style={{ margin: "2px 0" }}>
                                <span style={{ color: val ? "#10b981" : "#6b7280" }}>
                                    {val ? "✓" : "○"} {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <NumInput label="Status Register (0x01)" value={statReg} onChange={setStatReg} />
                    <div style={{ marginTop: 16, fontSize: 12 }}>
                        <h4 style={{ margin: "0 0 8px 0" }}>Status Bits:</h4>
                        {Object.entries(decodeStatus).map(([key, val]) => (
                            <div key={key} style={{ margin: "2px 0" }}>
                                <span style={{ color: val ? "#10b981" : "#6b7280" }}>
                                    {val ? "✓" : "○"} {key.replace(/([A-Z])/g, " $1").replace(/capability/g, "").trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <pre style={{ background: "#5b21b6", color: "#e9d5ff", padding: 8, whiteSpace: "pre-wrap", marginTop: 12, borderRadius: 4 }}>{script}</pre>
        </div>
    );
}