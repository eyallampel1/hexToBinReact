import React, { useState, useMemo } from "react";
import { NumInput, toWord } from "./MiiHelpers";

export default function PortConfigPanel({ phyAddr }) {
    const [portNum, setPortNum] = useState("0");
    const [portState, setPortState] = useState("forwarding");
    const [vlanId, setVlanId] = useState("1");
    const [portMode, setPortMode] = useState("access");

    const script = useMemo(() => {
        const pa = toWord(phyAddr) & 0x1f;
        const port = toWord(portNum) & 0x7;
        const vlan = toWord(vlanId) & 0xfff;

        const stateMap = {
            "disabled": 0x00,
            "blocking": 0x01,
            "learning": 0x02,
            "forwarding": 0x03
        };

        const lines = [
            `# ---- Port ${port} Configuration ----`,
            `# Set port state to ${portState}`,
            `mii write 0x1c 0x19 0x${(0x0400 | (stateMap[portState] << 2)).toString(16).padStart(4, "0").toUpperCase()}`,
            `mii write 0x1c 0x18 0x${(0x9400 | (pa << 5) | 0x04).toString(16).padStart(4, "0").toUpperCase()}`,
            "",
            `# Set VLAN ID to ${vlan}`,
            `mii write 0x1c 0x19 0x${vlan.toString(16).padStart(4, "0").toUpperCase()}`,
            `mii write 0x1c 0x18 0x${(0x9400 | (pa << 5) | 0x06).toString(16).padStart(4, "0").toUpperCase()}`,
        ];

        if (portMode === "trunk") {
            lines.push("", "# Enable trunk mode",
                `mii write 0x1c 0x19 0x8000`,
                `mii write 0x1c 0x18 0x${(0x9400 | (pa << 5) | 0x08).toString(16).padStart(4, "0").toUpperCase()}`);
        }

        return lines.join("\n");
    }, [phyAddr, portNum, portState, vlanId, portMode]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>🔌 Port Configuration</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
                <NumInput label="Port Number (0-6)" value={portNum} onChange={setPortNum} max={1} />
                <div>
                    <label style={{ fontSize: 12 }}>Port State</label>
                    <select value={portState} onChange={(e) => setPortState(e.target.value)}
                            style={{ padding: 4, marginTop: 4, display: "block" }}>
                        <option value="disabled">Disabled</option>
                        <option value="blocking">Blocking</option>
                        <option value="learning">Learning</option>
                        <option value="forwarding">Forwarding</option>
                    </select>
                </div>
                <NumInput label="VLAN ID" value={vlanId} onChange={setVlanId} max={4} />
                <div>
                    <label style={{ fontSize: 12 }}>Port Mode</label>
                    <select value={portMode} onChange={(e) => setPortMode(e.target.value)}
                            style={{ padding: 4, marginTop: 4, display: "block" }}>
                        <option value="access">Access</option>
                        <option value="trunk">Trunk</option>
                    </select>
                </div>
            </div>
            <pre style={{ background: "#1a4731", color: "#4ade80", padding: 8, whiteSpace: "pre-wrap", marginTop: 12, borderRadius: 4 }}>{script}</pre>
        </div>
    );
}