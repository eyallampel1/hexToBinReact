import React, { useState, useMemo } from "react";
import { NumInput, toWord } from "./MiiHelpers";

export default function RegisterDecoderPanel() {
    const [regValue, setRegValue] = useState("8000");
    const [regType, setRegType] = useState("control");

    const decodedBits = useMemo(() => {
        const val = toWord(regValue);
        const bits = [];

        if (regType === "control") {
            bits.push({ bit: 15, name: "Reset", value: !!(val & 0x8000) });
            bits.push({ bit: 14, name: "Loopback", value: !!(val & 0x4000) });
            bits.push({ bit: 13, name: "Speed Select", value: !!(val & 0x2000) });
            bits.push({ bit: 12, name: "Auto-Negotiation", value: !!(val & 0x1000) });
            bits.push({ bit: 11, name: "Power Down", value: !!(val & 0x0800) });
            bits.push({ bit: 10, name: "Isolate", value: !!(val & 0x0400) });
            bits.push({ bit: 9, name: "Restart Auto-Neg", value: !!(val & 0x0200) });
            bits.push({ bit: 8, name: "Full Duplex", value: !!(val & 0x0100) });
            bits.push({ bit: 7, name: "Collision Test", value: !!(val & 0x0080) });
        } else if (regType === "status") {
            bits.push({ bit: 15, name: "100BASE-T4", value: !!(val & 0x8000) });
            bits.push({ bit: 14, name: "100BASE-X Full", value: !!(val & 0x4000) });
            bits.push({ bit: 13, name: "100BASE-X Half", value: !!(val & 0x2000) });
            bits.push({ bit: 12, name: "10 Mbps Full", value: !!(val & 0x1000) });
            bits.push({ bit: 11, name: "10 Mbps Half", value: !!(val & 0x0800) });
            bits.push({ bit: 5, name: "Auto-Neg Complete", value: !!(val & 0x0020) });
            bits.push({ bit: 4, name: "Remote Fault", value: !!(val & 0x0010) });
            bits.push({ bit: 3, name: "Auto-Neg Ability", value: !!(val & 0x0008) });
            bits.push({ bit: 2, name: "Link Status", value: !!(val & 0x0004) });
            bits.push({ bit: 1, name: "Jabber Detect", value: !!(val & 0x0002) });
            bits.push({ bit: 0, name: "Extended Capability", value: !!(val & 0x0001) });
        } else if (regType === "port") {
            bits.push({ bit: 15, name: "Reserved", value: !!(val & 0x8000) });
            bits.push({ bit: 14, name: "Force Link", value: !!(val & 0x4000) });
            bits.push({ bit: 13, name: "Port State[2]", value: !!(val & 0x2000) });
            bits.push({ bit: 12, name: "Port State[1]", value: !!(val & 0x1000) });
            bits.push({ bit: 11, name: "Port State[0]", value: !!(val & 0x0800) });
            bits.push({ bit: 10, name: "TX Pause En", value: !!(val & 0x0400) });
            bits.push({ bit: 9, name: "RX Pause En", value: !!(val & 0x0200) });
            bits.push({ bit: 8, name: "Drop on Lock", value: !!(val & 0x0100) });
            bits.push({ bit: 7, name: "Double Tag", value: !!(val & 0x0080) });
            bits.push({ bit: 4, name: "Forward Unknown", value: !!(val & 0x0010) });
            bits.push({ bit: 3, name: "Forward BC", value: !!(val & 0x0008) });
            bits.push({ bit: 2, name: "Forward MC", value: !!(val & 0x0004) });
            bits.push({ bit: 1, name: "Forward UC", value: !!(val & 0x0002) });
        }

        return bits;
    }, [regValue, regType]);

    const binaryView = useMemo(() => {
        const val = toWord(regValue);
        return Array.from({ length: 16 }, (_, i) => (val >> (15 - i)) & 1).join("");
    }, [regValue]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>🔍 Register Bit Decoder</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <NumInput label="Register Value" value={regValue} onChange={setRegValue} />
                <div>
                    <label style={{ fontSize: 12 }}>Register Type</label>
                    <select
                        value={regType}
                        onChange={(e) => setRegType(e.target.value)}
                        style={{ padding: 4, marginTop: 4, display: "block" }}
                    >
                        <option value="control">Control Register</option>
                        <option value="status">Status Register</option>
                        <option value="port">Port Control</option>
                    </select>
                </div>
            </div>

            <div style={{ background: "#f3f4f6", padding: 12, borderRadius: 4, marginBottom: 12 }}>
                <div style={{ fontFamily: "monospace", fontSize: 14, marginBottom: 8 }}>
                    Binary: {binaryView.match(/.{1,4}/g).join(" ")}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#666" }}>
                    Hex: 0x{regValue.padStart(4, "0").toUpperCase()} | Dec: {toWord(regValue)}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {decodedBits.map(({ bit, name, value }) => (
                    <div
                        key={bit}
                        style={{
                            padding: "6px 10px",
                            background: value ? "#dcfce7" : "#fee2e2",
                            borderRadius: 4,
                            fontSize: 12,
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        <span>Bit {bit}: {name}</span>
                        <span style={{ fontWeight: "bold" }}>{value ? "1" : "0"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}