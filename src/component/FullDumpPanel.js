import React, { useState, useMemo, useEffect } from "react";
import { NumInput, toWord } from "./MiiHelpers";

// localStorage helpers
const STORAGE_KEYS = {
    selectedPorts: 'fullDump_selectedPorts',
    phyPages: 'fullDump_phyPages',
    switchPorts: 'fullDump_switchPorts',
    phyPorts: 'fullDump_phyPorts'
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

export default function FullDumpPanel() {
    const [dumpType, setDumpType] = useState("all");
    const [selectedPorts, setSelectedPorts] = useState(() => loadFromStorage(STORAGE_KEYS.selectedPorts, "0,1,2,3,4,5,6"));
    const [phyPages, setPhyPages] = useState(() => loadFromStorage(STORAGE_KEYS.phyPages, "0,2,5,6,7"));
    const [switchPorts, setSwitchPorts] = useState(() => loadFromStorage(STORAGE_KEYS.switchPorts, "10,11,12,13,14,15,16"));
    const [phyPorts, setPhyPorts] = useState(() => loadFromStorage(STORAGE_KEYS.phyPorts, "0,1,2,3,4,5,6"));

    // Save to localStorage whenever values change
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedPorts, selectedPorts);
    }, [selectedPorts]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.phyPages, phyPages);
    }, [phyPages]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.switchPorts, switchPorts);
    }, [switchPorts]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.phyPorts, phyPorts);
    }, [phyPorts]);

    const getPageName = (page) => {
        const pageNames = {
            0: "Basic Control/Status",
            1: "Reserved", 
            2: "MAC Specific Control",
            3: "Special Control",
            4: "Reserved",
            5: "Advanced VCT",
            6: "Packet Generation", 
            7: "Cable Diagnostics"
        };
        return pageNames[page] || "Unknown";
    };

    const script = useMemo(() => {
        const lines = ["# U-Boot MII Register Dump - Basic Commands Only", "# Copy and paste these commands into U-Boot console", ""];

        const ports = selectedPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p >= 0 && p <= 6);
        const pages = phyPages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p >= 0 && p <= 7);
        const switchPortAddrs = switchPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p >= 0x10 && p <= 0x19);
        const phyPortAddrs = phyPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p >= 0x00 && p <= 0x09);

        if (dumpType === "all" || dumpType === "phy") {
            lines.push("# ========================================");
            lines.push("# PHY REGISTERS (via Indirect Access)");
            lines.push("# ========================================");
            lines.push("");

            phyPortAddrs.forEach(port => {
                lines.push(`# PHY Port 0x${port.toString(16).padStart(2, '0').toUpperCase()} Registers`);
                lines.push(`# --------------------------`);
                
                pages.forEach(page => {
                    lines.push("");
                    lines.push(`# Page ${page} - ${getPageName(page)}`);
                    
                    // Switch to page using register 22 (0x16)
                    lines.push(`# Set page ${page}`);
                    lines.push(`mii write 0x1c 0x19 0x${page.toString(16).padStart(4, '0').toUpperCase()}`);
                    lines.push(`mii write 0x1c 0x18 0x${((0x9400) | (port << 5) | 0x16).toString(16).padStart(4, '0').toUpperCase()}`);
                    
                    // Read registers 0-31 for this page
                    for (let reg = 0; reg <= 31; reg++) {
                        lines.push(`# Read PHY${port} Page${page} Reg${reg}`);
                        lines.push(`mii write 0x1c 0x18 0x${((0x9800) | (port << 5) | reg).toString(16).padStart(4, '0').toUpperCase()}`);
                        lines.push(`mii read 0x1c 0x19`);
                    }
                });
                
                // Reset to page 0 after each port
                lines.push("");
                lines.push(`# Reset PHY${port} to Page 0`);
                lines.push(`mii write 0x1c 0x19 0x0000`);
                lines.push(`mii write 0x1c 0x18 0x${((0x9400) | (port << 5) | 0x16).toString(16).padStart(4, '0').toUpperCase()}`);
                lines.push("");
            });
        }

        if (dumpType === "all" || dumpType === "switch") {
            lines.push("# ========================================");
            lines.push("# SWITCH PORT REGISTERS (Direct Access)");
            lines.push("# ========================================");
            lines.push("");

            switchPortAddrs.forEach(switchAddr => {
                lines.push(`# Switch Port Address 0x${switchAddr.toString(16).toUpperCase()}`);
                lines.push(`# ----------------------------------------`);
                
                // Read important switch registers for each port
                const switchRegs = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F];
                
                switchRegs.forEach(reg => {
                    lines.push(`# SwitchAddr 0x${switchAddr.toString(16).toUpperCase()} Reg 0x${reg.toString(16).padStart(2, '0').toUpperCase()}`);
                    lines.push(`mii read 0x${switchAddr.toString(16)} 0x${reg.toString(16).padStart(2, '0')}`);
                });
                lines.push("");
            });
        }

        if (dumpType === "all" || dumpType === "global1") {
            lines.push("# ========================================");
            lines.push("# GLOBAL1 REGISTERS (Direct Access 0x1B)");
            lines.push("# ========================================");
            lines.push("");
            
            // Read all Global1 registers (0x00 to 0x1F)
            for (let reg = 0; reg <= 0x1F; reg++) {
                lines.push(`# Global1 Reg 0x${reg.toString(16).padStart(2, '0').toUpperCase()}`);
                lines.push(`mii read 0x1b 0x${reg.toString(16).padStart(2, '0')}`);
            }
            lines.push("");
        }

        if (dumpType === "all" || dumpType === "global2") {
            lines.push("# ========================================");
            lines.push("# GLOBAL2 REGISTERS (Direct Access 0x1C)");
            lines.push("# ========================================");
            lines.push("");
            
            // Read important Global2 registers
            const global2Regs = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1F];
            
            global2Regs.forEach(reg => {
                lines.push(`# Global2 Reg 0x${reg.toString(16).padStart(2, '0').toUpperCase()}`);
                lines.push(`mii read 0x1c 0x${reg.toString(16).padStart(2, '0')}`);
            });
            lines.push("");
        }

        lines.push("# ========================================");
        lines.push("# END OF DUMP");
        lines.push("# ========================================");

        return lines.join("\n");
    }, [dumpType, selectedPorts, phyPages, switchPorts, phyPorts]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>📄 U-Boot MII Register Dump Generator</h3>
            
            <div style={{ background: "#dbeafe", padding: 12, borderRadius: 8, marginBottom: 16, border: "1px solid #3b82f6" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#1e40af" }}>🔧 U-Boot Compatible</h4>
                <p style={{ margin: "0", fontSize: "12px", color: "#1e40af" }}>
                    Uses only basic <code>mii read</code> and <code>mii write</code> commands.
                    Copy commands and paste into U-Boot console.
                </p>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>Dump Type</label>
                    <select
                        value={dumpType}
                        onChange={(e) => setDumpType(e.target.value)}
                        style={{ padding: 6, marginTop: 4, display: "block", border: "1px solid #d1d5db", borderRadius: 4 }}
                    >
                        <option value="all">Complete Dump (All)</option>
                        <option value="phy">PHY Registers Only</option>
                        <option value="switch">Switch Port Registers</option>
                        <option value="global1">Global1 Registers (0x1B)</option>
                        <option value="global2">Global2 Registers (0x1C)</option>
                    </select>
                </div>

                {(dumpType === "all" || dumpType === "switch") && (
                    <div>
                        <label style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>Switch Ports (comma-separated)</label>
                        <input
                            type="text"
                            value={switchPorts}
                            onChange={(e) => setSwitchPorts(e.target.value)}
                            placeholder="10,11,12,13,14,15,16"
                            style={{ 
                                padding: 6, 
                                marginTop: 4, 
                                display: "block", 
                                border: "1px solid #d1d5db", 
                                borderRadius: 4,
                                fontFamily: "monospace",
                                width: "140px"
                            }}
                        />
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Hex: 0x10-0x19</div>
                    </div>
                )}

                {(dumpType === "all" || dumpType === "phy") && (
                    <div>
                        <label style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>PHY Ports (comma-separated)</label>
                        <input
                            type="text"
                            value={phyPorts}
                            onChange={(e) => setPhyPorts(e.target.value)}
                            placeholder="0,1,2,3,4,5,6"
                            style={{ 
                                padding: 6, 
                                marginTop: 4, 
                                display: "block", 
                                border: "1px solid #d1d5db", 
                                borderRadius: 4,
                                fontFamily: "monospace",
                                width: "120px"
                            }}
                        />
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>Hex: 0x00-0x09</div>
                    </div>
                )}

                {(dumpType === "all" || dumpType === "phy") && (
                    <div>
                        <label style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>PHY Pages (comma-separated)</label>
                        <input
                            type="text"
                            value={phyPages}
                            onChange={(e) => setPhyPages(e.target.value)}
                            placeholder="0,2,5,6,7"
                            style={{ 
                                padding: 6, 
                                marginTop: 4, 
                                display: "block", 
                                border: "1px solid #d1d5db", 
                                borderRadius: 4,
                                fontFamily: "monospace",
                                width: "100px"
                            }}
                        />
                    </div>
                )}
            </div>

            <div style={{ background: "#fef3c7", padding: 12, borderRadius: 4, marginBottom: 12, fontSize: 12, border: "1px solid #fbbf24" }}>
                <div style={{ fontWeight: "600", color: "#92400e", marginBottom: 4 }}>💡 U-Boot Usage:</div>
                <div style={{ color: "#92400e" }}>
                    1. Copy the commands below<br/>
                    2. Paste them one by one into U-Boot console<br/>
                    3. Each command will show the register value<br/>
                    4. PHY registers use indirect access via 0x1C 0x18/0x19<br/>
                    5. Switch ports use direct access 0x10-0x16<br/>
                    6. Global1 uses direct access 0x1B<br/>
                    7. Global2 uses direct access 0x1C
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
                        a.download = "uboot_mii_dump.txt";
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
                    onClick={() => {
                        navigator.clipboard.writeText(script);
                        // Add to history
                        const event = new CustomEvent('addToHistory', { detail: script });
                        window.dispatchEvent(event);
                    }}
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