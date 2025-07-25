import React, { useState, useMemo } from "react";
import { NumInput, toWord } from "./MiiHelpers";

export default function StatsPanel({ phyAddr }) {
    const [selectedPort, setSelectedPort] = useState("0");

    const script = useMemo(() => {
        const pa = toWord(phyAddr) & 0x1f;
        const port = toWord(selectedPort) & 0x7;

        return [
            `# ---- Port ${port} Statistics ----`,
            "echo 'Reading port statistics...'",
            "",
            "# RX Good Frames",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x00).toString(16).padStart(4, "0").toUpperCase()}`,
            "RX_GOOD=$(mii read 0x1c 0x19 | tail -n1)",
            "echo \"RX Good Frames: $RX_GOOD\"",
            "",
            "# TX Good Frames",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x01).toString(16).padStart(4, "0").toUpperCase()}`,
            "TX_GOOD=$(mii read 0x1c 0x19 | tail -n1)",
            "echo \"TX Good Frames: $TX_GOOD\"",
            "",
            "# RX Errors",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x02).toString(16).padStart(4, "0").toUpperCase()}`,
            "RX_ERR=$(mii read 0x1c 0x19 | tail -n1)",
            "echo \"RX Errors: $RX_ERR\"",
            "",
            "# Collisions",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x03).toString(16).padStart(4, "0").toUpperCase()}`,
            "COLL=$(mii read 0x1c 0x19 | tail -n1)",
            "echo \"Collisions: $COLL\"",
        ].join("\n");
    }, [phyAddr, selectedPort]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>📊 Port Statistics</h3>
            <div style={{ marginBottom: 16 }}>
                <NumInput label="Port Number (0-6)" value={selectedPort} onChange={setSelectedPort} max={1} />
            </div>
            <pre style={{ background: "#7c2d12", color: "#fed7aa", padding: 8, whiteSpace: "pre-wrap", borderRadius: 4 }}>{script}</pre>
        </div>
    );
}