import React, { useState, useMemo, useEffect } from "react";
import { NumInput, toWord } from "./MiiHelpers";

// localStorage helpers
const STORAGE_KEYS = {
    selectedPort: 'stats_selectedPort'
};

const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn(`Failed to load ${key} from localStorage:`, e);
        return defaultValue;
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
};

export default function StatsPanel({ phyAddr }) {
    const [selectedPort, setSelectedPort] = useState(() => loadFromStorage(STORAGE_KEYS.selectedPort, "0"));
    
    // Save to localStorage whenever port changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedPort, selectedPort);
    }, [selectedPort]);

    const script = useMemo(() => {
        const pa = toWord(phyAddr) & 0x1f;
        const port = toWord(selectedPort) & 0x7;

        return [
            "# U-Boot Port Statistics - Basic MII Commands Only",
            "# Copy and paste these commands into U-Boot console",
            "",
            `# ========================================`,
            `# Port ${port} Statistics (PHY Address 0x${pa.toString(16).padStart(2, '0').toUpperCase()})`,
            `# ========================================`,
            "",
            "# RX Good Frames Counter",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x00).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# TX Good Frames Counter",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x01).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# RX Error Frames Counter",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x02).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# Collision Counter",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x03).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# RX Broadcast Frames",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x04).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# RX Multicast Frames",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x05).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# RX Unicast Frames",
            `mii write 0x1c 0x18 0x${(0x9C00 | (pa << 5) | 0x06).toString(16).padStart(4, "0").toUpperCase()}`,
            "mii read 0x1c 0x19",
            "",
            "# ========================================",
            "# END OF STATISTICS",
            "# ========================================"
        ].join("\n");
    }, [phyAddr, selectedPort]);

    const copyWithHistory = (command) => {
        navigator.clipboard.writeText(command);
        
        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    return (
        <div style={{ marginTop: 32 }}>
            <h3>📊 U-Boot Port Statistics</h3>
            
            <div style={{ background: "#dbeafe", padding: 12, borderRadius: 8, marginBottom: 16, border: "1px solid #3b82f6" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#1e40af" }}>🔧 U-Boot Compatible</h4>
                <p style={{ margin: "0", fontSize: "12px", color: "#1e40af" }}>
                    Uses only basic <code>mii read</code> and <code>mii write</code> commands.
                    Each command returns a statistics counter value.
                </p>
            </div>
            
            <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "end" }}>
                <div>
                    <NumInput label="Port Number (0-6)" value={selectedPort} onChange={setSelectedPort} max={1} />
                </div>
                <div>
                    <label style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>PHY Address (from main tab)</label>
                    <div style={{ 
                        padding: 6, 
                        marginTop: 4, 
                        display: "block", 
                        border: "1px solid #d1d5db", 
                        borderRadius: 4,
                        fontFamily: "monospace",
                        background: "#f9fafb",
                        color: "#6b7280",
                        fontSize: 14
                    }}>
                        0x{(toWord(phyAddr) & 0x1f).toString(16).padStart(2, '0').toUpperCase()}
                    </div>
                </div>
            </div>
            
            <div style={{ background: "#fef3c7", padding: 12, borderRadius: 4, marginBottom: 12, fontSize: 12, border: "1px solid #fbbf24" }}>
                <div style={{ fontWeight: "600", color: "#92400e", marginBottom: 4 }}>💡 Usage:</div>
                <div style={{ color: "#92400e" }}>
                    1. Copy commands below<br/>
                    2. Paste into U-Boot console one by one<br/>
                    3. Each read command returns a counter value<br/>
                    4. Statistics are accessed via indirect register 0x1C 0x18/0x19
                </div>
            </div>
            
            <pre style={{ 
                background: "#1e1e1e", 
                color: "#00c853", 
                padding: 12, 
                whiteSpace: "pre-wrap", 
                borderRadius: 6, 
                fontSize: 11, 
                maxHeight: 500, 
                overflowY: "auto",
                border: "1px solid #374151"
            }}>
                {script}
            </pre>
            
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                    onClick={() => {
                        const blob = new Blob([script], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "uboot_port_stats.txt";
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    style={{ 
                        padding: "8px 16px", 
                        background: "#059669", 
                        color: "white", 
                        border: "none", 
                        borderRadius: 6, 
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500
                    }}
                >
                    📥 Download Commands
                </button>
                <button
                    onClick={() => copyWithHistory(script)}
                    style={{ 
                        padding: "8px 16px", 
                        background: "#3b82f6", 
                        color: "white", 
                        border: "none", 
                        borderRadius: 6, 
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500
                    }}
                >
                    📋 Copy Commands
                </button>
            </div>
        </div>
    );
}