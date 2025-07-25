import React, { useState, useMemo } from "react";
import { NumInput, toWord } from "./MiiHelpers";

export default function VlanPanel() {
    const [vlanId, setVlanId] = useState("100");
    const [vlanName, setVlanName] = useState("Management");
    const [memberPorts, setMemberPorts] = useState([]);
    const [taggedPorts, setTaggedPorts] = useState([]);

    const togglePort = (port, isTagged = false) => {
        const setter = isTagged ? setTaggedPorts : setMemberPorts;
        const current = isTagged ? taggedPorts : memberPorts;

        setter(prev =>
            prev.includes(port)
                ? prev.filter(p => p !== port)
                : [...prev, port]
        );
    };

    const script = useMemo(() => {
        const vlan = toWord(vlanId) & 0xfff;
        const memberMask = memberPorts.reduce((mask, port) => mask | (1 << port), 0);
        const taggedMask = taggedPorts.reduce((mask, port) => mask | (1 << port), 0);

        return [
            `# ---- VLAN ${vlan} (${vlanName}) Configuration ----`,
            `# Member ports: ${memberPorts.join(", ") || "none"}`,
            `# Tagged ports: ${taggedPorts.join(", ") || "none"}`,
            "",
            `# Set VLAN Table Entry`,
            `mii write 0x1c 0x19 0x${vlan.toString(16).padStart(4, "0").toUpperCase()}`,
            `mii write 0x1c 0x18 0x9500`, // VLAN table access
            `mii write 0x1c 0x19 0x${memberMask.toString(16).padStart(4, "0").toUpperCase()}`,
            `mii write 0x1c 0x18 0x9502`, // Member tag
            `mii write 0x1c 0x19 0x${taggedMask.toString(16).padStart(4, "0").toUpperCase()}`,
            `mii write 0x1c 0x18 0x9503`, // Tagged ports
        ].join("\n");
    }, [vlanId, vlanName, memberPorts, taggedPorts]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>🏷️ VLAN Management</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <NumInput label="VLAN ID" value={vlanId} onChange={setVlanId} max={4} />
                <div>
                    <label style={{ fontSize: 12 }}>VLAN Name</label>
                    <input
                        type="text"
                        value={vlanName}
                        onChange={(e) => setVlanName(e.target.value)}
                        style={{ padding: 4, marginTop: 4, display: "block" }}
                        placeholder="Optional name"
                    />
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Member Ports</h4>
                    {[0,1,2,3,4,5,6].map(port => (
                        <label key={port} style={{ display: "block", margin: "4px 0" }}>
                            <input
                                type="checkbox"
                                checked={memberPorts.includes(port)}
                                onChange={() => togglePort(port, false)}
                            /> Port {port}
                        </label>
                    ))}
                </div>
                <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Tagged Ports</h4>
                    {[0,1,2,3,4,5,6].map(port => (
                        <label key={port} style={{ display: "block", margin: "4px 0" }}>
                            <input
                                type="checkbox"
                                checked={taggedPorts.includes(port)}
                                onChange={() => togglePort(port, true)}
                                disabled={!memberPorts.includes(port)}
                            /> Port {port}
                        </label>
                    ))}
                </div>
            </div>

            <pre style={{ background: "#3730a3", color: "#a5b4fc", padding: 8, whiteSpace: "pre-wrap", marginTop: 12, borderRadius: 4 }}>{script}</pre>
        </div>
    );
}