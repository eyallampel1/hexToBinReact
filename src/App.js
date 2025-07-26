import React, { useState, useMemo, useEffect } from "react";
import BasicControlPanel from "./component/BasicControlPanel";
import RegisterDecoderPanel from "./component/RegisterDecoderPanel";
import FullDumpPanel from "./component/FullDumpPanel";
import PortConfigPanel from "./component/PortConfigPanel";
import VlanPanel from "./component/VlanPanel";
import StatsPanel from "./component/StatsPanel";
import PHYRegisterPanel from "./component/PHYRegisterPanel";
import SwitchRegisterPanel from "./component/SwitchRegisterPanel";
import SwitchGlobal1Panel from "./component/SwitchGlobal1Panel";
import SwitchGlobal2Panel from "./component/SwitchGlobal2Panel";
import HexToBinApp from "./component/HexToBinApp";

/* ════════════════════════ helpers ════════════════════════ */
function RawNumInput({ label, value, onChange, max = 4, disabled = false }) {
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
const NumInput = React.memo(
    RawNumInput,
    (p, n) => p.value === n.value && p.disabled === n.disabled
);

const toWord = (v) => {
    if (!v) return 0;
    const s = v.trim();
    if (s.toLowerCase().startsWith("0x")) return parseInt(s.slice(2), 16) & 0xffff;
    if (/[a-f]/i.test(s)) return parseInt(s, 16) & 0xffff;
    return parseInt(s, 10) & 0xffff;
};

/* ════════════════════════ Register Presets Panel ════════════════════════ */
function PresetsPanel({ onLoadPreset }) {
    // Add localStorage persistence for selected port
    const [selectedPort, setSelectedPort] = useState(() => loadFromStorageApp('presets_selectedPort', "1"));
    
    // Save selectedPort to localStorage whenever it changes
    useEffect(() => {
        saveToStorageApp('presets_selectedPort', selectedPort);
    }, [selectedPort]);
    
    const presets = [
        { name: "Read ID", phy: "01", reg: "02", mode: "read", desc: "PHY Identifier Register 1", usePort: false },
        { name: "Read Status", phy: "01", reg: "01", mode: "read", desc: "Basic Status Register", usePort: true },
        { name: "Enable Auto-Neg", phy: "01", reg: "00", mode: "write", data: "1200", desc: "Enable auto-negotiation", usePort: true },
        { name: "Loopback Mode", phy: "01", reg: "00", mode: "write", data: "4000", desc: "Enable loopback", usePort: true },
        { name: "Reset PHY", phy: "01", reg: "00", mode: "write", data: "8000", desc: "Software reset", usePort: true },
        { name: "Power Down PHY", phy: "01", reg: "00", mode: "write", data: "0800", desc: "Power down selected PHY port", usePort: true, portSpecific: true },
        { name: "Switch to Page 0", phy: "01", reg: "16", mode: "write", data: "0000", desc: "Switch PHY to Page 0 (Basic Control/Status)", usePort: true },
        { name: "Switch to Page 2", phy: "01", reg: "16", mode: "write", data: "0002", desc: "Switch PHY to Page 2 (MAC Specific Control)", usePort: true },
        { name: "Switch to Page 5", phy: "01", reg: "16", mode: "write", data: "0005", desc: "Switch PHY to Page 5 (Advanced VCT)", usePort: true },
        { name: "Switch to Page 6", phy: "01", reg: "16", mode: "write", data: "0006", desc: "Switch PHY to Page 6 (Packet Generation)", usePort: true },
        { name: "Switch to Page 7", phy: "01", reg: "16", mode: "write", data: "0007", desc: "Switch PHY to Page 7 (Cable Diagnostics)", usePort: true },
        {
            name: "Disable EEE Port 3",
            sequence: [
                "# Page 0, Reg22 = 0x0000",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x9476",
                "# Reg13 = 0x0007  (DEVAD=7, address)",
                "mii write 0x1c 0x19 0x0007",
                "mii write 0x1c 0x18 0x946D",
                "# Reg14 = 0x003C",
                "mii write 0x1c 0x19 0x003C",
                "mii write 0x1c 0x18 0x946E",
                "# Reg13 = 0x4007  (data mode)",
                "mii write 0x1c 0x19 0x4007",
                "mii write 0x1c 0x18 0x946D",
                "# Reg14 = 0x0000",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x946E",
                "mii write 0x1c 0x19 0x9140",
                "mii write 0x1c 0x18 0x9460"
            ],
            desc: "Disable Energy Efficient Ethernet (EEE) on PHY Port 3",
            usePort: false,
            isSequence: true
        },
        {
            name: "Disable EEE Port 4",
            sequence: [
                "# Page 0, Reg22 = 0x0000",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x9496",
                "# Reg13 = 0x0007  (DEVAD=7, address phase)",
                "mii write 0x1c 0x19 0x0007",
                "mii write 0x1c 0x18 0x948D",
                "# Reg14 = 0x003C (EEE advert register)",
                "mii write 0x1c 0x19 0x003C",
                "mii write 0x1c 0x18 0x948E",
                "# Reg13 = 0x4007  (DEVAD=7, data phase)",
                "mii write 0x1c 0x19 0x4007",
                "mii write 0x1c 0x18 0x948D",
                "# Reg14 = 0x0000  (disable EEE bits)",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x948E",
                "mii write 0x1c 0x19 0x9140",
                "mii write 0x1c 0x18 0x9480"
            ],
            desc: "Disable Energy Efficient Ethernet (EEE) on PHY Port 4",
            usePort: false,
            isSequence: true
        },
        {
            name: "Disable EEE Ports 3&4",
            sequence: [
                "# Disable EEE on Port 3",
                "# Page 0, Reg22 = 0x0000",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x9476",
                "# Reg13 = 0x0007  (DEVAD=7, address)",
                "mii write 0x1c 0x19 0x0007",
                "mii write 0x1c 0x18 0x946D",
                "# Reg14 = 0x003C",
                "mii write 0x1c 0x19 0x003C",
                "mii write 0x1c 0x18 0x946E",
                "# Reg13 = 0x4007  (data mode)",
                "mii write 0x1c 0x19 0x4007",
                "mii write 0x1c 0x18 0x946D",
                "# Reg14 = 0x0000",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x946E",
                "mii write 0x1c 0x19 0x9140",
                "mii write 0x1c 0x18 0x9460",
                "",
                "# Disable EEE on Port 4",
                "# Page 0, Reg22 = 0x0000",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x9496",
                "# Reg13 = 0x0007  (DEVAD=7, address phase)",
                "mii write 0x1c 0x19 0x0007",
                "mii write 0x1c 0x18 0x948D",
                "# Reg14 = 0x003C (EEE advert register)",
                "mii write 0x1c 0x19 0x003C",
                "mii write 0x1c 0x18 0x948E",
                "# Reg13 = 0x4007  (DEVAD=7, data phase)",
                "mii write 0x1c 0x19 0x4007",
                "mii write 0x1c 0x18 0x948D",
                "# Reg14 = 0x0000  (disable EEE bits)",
                "mii write 0x1c 0x19 0x0000",
                "mii write 0x1c 0x18 0x948E",
                "mii write 0x1c 0x19 0x9140",
                "mii write 0x1c 0x18 0x9480"
            ],
            desc: "Disable Energy Efficient Ethernet (EEE) on both PHY Ports 3 and 4",
            usePort: false,
            isSequence: true
        }
    ];

    const handleLoadPreset = (preset) => {
        if (preset.isSequence) {
            // For sequence presets, copy the entire sequence to clipboard and add to history
            const sequence = preset.sequence.join('\n');
            navigator.clipboard.writeText(sequence);
            
            // Add to history
            const event = new CustomEvent('addToHistory', { detail: sequence });
            window.dispatchEvent(event);
            
            // Show feedback (you could add a toast notification here if desired)
            console.log(`Loaded sequence preset: ${preset.name}`);
        } else {
            const modifiedPreset = { ...preset };
            if (preset.usePort) {
                modifiedPreset.phy = selectedPort.padStart(2, '0');
            }
            onLoadPreset(modifiedPreset);
        }
    };

    return (
        <div style={{ marginTop: 32 }}>
            <h3>⚡ Register Presets</h3>
            
            {/* Port Selection */}
            <div style={{ 
                background: "#e0f2fe", 
                padding: "12px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                border: "1px solid #0ea5e9"
            }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#0c4a6e" }}>🔌 Port Selection</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                        Target Port:
                    </label>
                    <select
                        value={selectedPort}
                        onChange={(e) => setSelectedPort(e.target.value)}
                        style={{
                            padding: "6px 10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontFamily: "monospace"
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(port => (
                            <option key={port} value={port.toString()}>
                                Port {port}
                            </option>
                        ))}
                    </select>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        (Applies to PHY register commands)
                    </span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {presets.map((preset, i) => (
                    <div key={i} style={{ 
                        background: "#f8fafc", 
                        border: "1px solid #e2e8f0",
                        borderRadius: 8, 
                        padding: 12 
                    }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{preset.name}</h4>
                        <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#6b7280" }}>
                            {preset.portSpecific ? preset.desc.replace("selected", `port ${selectedPort}`) : preset.desc}
                        </p>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>
                            {preset.isSequence ? (
                                <div>
                                    <div style={{ color: "#dc2626", fontWeight: "600", marginBottom: 2 }}>
                                        🔄 Multi-command sequence ({preset.sequence.length} commands)
                                    </div>
                                    <div style={{ color: "#7c2d12" }}>
                                        Copies sequence to clipboard automatically
                                    </div>
                                </div>
                            ) : (
                                <>
                                    PHY: {preset.usePort ? selectedPort.padStart(2, '0') : preset.phy} | Reg: {preset.reg} | Mode: {preset.mode}
                                    {preset.data && ` | Data: ${preset.data}`}
                                    {preset.usePort && (
                                        <div style={{ color: "#3b82f6", marginTop: 2 }}>
                                            🔌 Uses selected port
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => handleLoadPreset(preset)}
                            style={{
                                padding: "6px 12px",
                                background: preset.isSequence ? "#dc2626" : "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 12
                            }}
                        >
                            {preset.isSequence ? "Copy Sequence" : "Load Preset"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ════════════════════════ Command History Panel ════════════════════════ */
function HistoryPanel() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const handleAddHistory = (event) => {
            const command = event.detail;
            setHistory(prev => [
                { command, timestamp: new Date().toLocaleTimeString() },
                ...prev.slice(0, 9) // Keep last 10 items
            ]);
        };

        window.addEventListener('addToHistory', handleAddHistory);
        return () => window.removeEventListener('addToHistory', handleAddHistory);
    }, []);

    const copyToClipboard = (command) => {
        navigator.clipboard.writeText(command);
    };

    if (history.length === 0) return null;

    return (
        <div style={{ marginTop: 32, borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
            <h3 style={{ color: "#374151", fontSize: 16, marginBottom: 12 }}>📋 Recent Commands</h3>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {history.map((item, i) => (
                    <div key={i} style={{ 
                        background: "#f9fafb", 
                        padding: 8, 
                        marginBottom: 6,
                        borderRadius: 4,
                        fontSize: 11,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start"
                    }}>
                        <div style={{ flex: 1, marginRight: 8 }}>
                            <div style={{ color: "#6b7280", marginBottom: 2 }}>{item.timestamp}</div>
                            <pre style={{ margin: 0, fontSize: 10, color: "#374151", whiteSpace: "pre-wrap" }}>
                                {item.command}
                            </pre>
                        </div>
                        <button
                            onClick={() => copyToClipboard(item.command)}
                            style={{
                                padding: "2px 6px",
                                background: "#e5e7eb",
                                border: "none",
                                borderRadius: 3,
                                cursor: "pointer",
                                fontSize: 9
                            }}
                        >
                            Copy
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ════════════════════════ localStorage helpers ════════════════════════ */
const APP_STORAGE_KEYS = {
    currentMode: 'app_currentMode',
    miiTab: 'mii_currentTab'
};

const loadFromStorageApp = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn(`Failed to load ${key} from localStorage:`, e);
        return defaultValue;
    }
};

const saveToStorageApp = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
};

/* ════════════════════════ Main Component ════════════════════════ */
function MiiCommandBuilder() {
    // Initialize tab from localStorage
    const [tab, setTab] = useState(() => loadFromStorageApp(APP_STORAGE_KEYS.miiTab, "cmd"));
    const [mode, setMode] = useState("read");
    const [phy, setPhy] = useState("04");
    const [reg, setReg] = useState("02");
    const [dat, setDat] = useState("0000");
    const [copied, setCopied] = useState(false);

    // Save tab state to localStorage whenever it changes
    useEffect(() => {
        saveToStorageApp(APP_STORAGE_KEYS.miiTab, tab);
    }, [tab]);

    const cmdWord = useMemo(() => {
        const busy = 0x8000, c22 = 0x1000, op = mode === "read" ? 0x0800 : 0x0400;
        const dev = (toWord(phy) & 0x1f) << 5, rg = toWord(reg) & 0x1f;
        return (busy | c22 | op | dev | rg) & 0xffff;
    }, [mode, phy, reg]);
    const cmdHex = cmdWord.toString(16).padStart(4, "0").toUpperCase();

    const script = useMemo(() => {
        const out = [];
        if (mode === "write") out.push(`# Load data`, `mii write 0x1c 0x19 0x${dat.padStart(4, "0").toUpperCase()}`);
        out.push(`# Send command`, `mii write 0x1c 0x18 0x${cmdHex}`);
        if (mode === "read") out.push(`# Read back`, `mii read  0x1c 0x19`);
        return out.join("\n");
    }, [mode, cmdHex, dat]);

    const loadPreset = (preset) => {
        setPhy(preset.phy);
        setReg(preset.reg);
        setMode(preset.mode);
        if (preset.data) setDat(preset.data);
        setTab("cmd");
    };

    const copyWithHistory = (command) => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1100);

        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    return (
        <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
            {/* Enhanced navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                    { key: "cmd", label: "🔧 Indirect Cmd", color: "#3b82f6" },
                    { key: "phy", label: "🧬 PHY Registers", color: "#dc2626" },
                    { key: "switch", label: "🔀 Switch Registers", color: "#7c3aed" },
                    { key: "global1", label: "🌐 Switch Global1", color: "#8b5cf6" },
                    { key: "global2", label: "🌍 Switch Global2", color: "#06b6d4" },
                    { key: "bc", label: "⚙️ Basic Ctrl", color: "#059669" },
                    { key: "dec", label: "🔍 Reg Decode", color: "#06b6d4" },
                    { key: "dump", label: "📄 Full Dump", color: "#84cc16" },
                    { key: "ports", label: "🔌 Port Config", color: "#10b981" },
                    { key: "vlan", label: "🏷️ VLAN", color: "#6366f1" },
                    { key: "stats", label: "📊 Statistics", color: "#f59e0b" },
                    { key: "presets", label: "⚡ Presets", color: "#ef4444" }
                ].map(({ key, label, color }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        style={{
                            padding: "8px 12px",
                            background: tab === key ? color : "#f3f4f6",
                            color: tab === key ? "white" : "#374151",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: tab === key ? "600" : "400",
                            transition: "all 0.2s"
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === "cmd" && (
                <>
                    <h2 style={{ textAlign: "center", color: "#1f2937" }}>MII Indirect Command Builder</h2>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
                        {["read", "write"].map(m => (
                            <label key={m} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: mode === m ? "#dbeafe" : "#f9fafb", borderRadius: 8, cursor: "pointer" }}>
                                <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
                                <span style={{ textTransform: "capitalize", fontWeight: mode === m ? "600" : "400" }}>{m}</span>
                            </label>
                        ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginTop: 20 }}>
                        <NumInput label="PHY addr" value={phy} onChange={setPhy} />
                        <NumInput label="Reg addr" value={reg} onChange={setReg} />
                        <NumInput label="Data" value={dat} onChange={setDat} disabled={mode === "read"} />
                    </div>
                    <pre style={{ background: "#1e1e1e", color: "#00c853", padding: 12, marginTop: 20, whiteSpace: "pre-wrap", borderRadius: 6 }}>{script}</pre>
                    <div style={{ textAlign: "right" }}>
                        <button
                            onClick={() => copyWithHistory(script)}
                            style={{
                                padding: "8px 16px",
                                background: copied ? "#10b981" : "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer"
                            }}
                        >
                            {copied ? "Copied ✅" : "Copy"}
                        </button>
                    </div>
                </>
            )}

            {tab === "phy" && <PHYRegisterPanel />}
            {tab === "switch" && <SwitchRegisterPanel />}
            {tab === "global1" && <SwitchGlobal1Panel />}
            {tab === "global2" && <SwitchGlobal2Panel />}
            {tab === "ports" && <PortConfigPanel phyAddr={phy} />}
            {tab === "vlan" && <VlanPanel />}
            {tab === "stats" && <StatsPanel phyAddr={phy} />}
            {tab === "presets" && <PresetsPanel onLoadPreset={loadPreset} />}
            {tab === "bc" && <BasicControlPanel />}
            {tab === "dec" && <RegisterDecoderPanel />}
            {tab === "dump" && <FullDumpPanel />}

            <HistoryPanel />
        </div>
    );
}

// New main App component with toggle functionality
function App() {
    // Initialize currentMode from localStorage
    const [currentMode, setCurrentMode] = useState(() => loadFromStorageApp(APP_STORAGE_KEYS.currentMode, "hextobinary"));

    // Save currentMode to localStorage whenever it changes
    useEffect(() => {
        saveToStorageApp(APP_STORAGE_KEYS.currentMode, currentMode);
    }, [currentMode]);

    return (
        <div>
            {/* Mode Toggle Header */}
            <div style={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                color: "white", 
                padding: "20px 0",
                textAlign: "center",
                marginBottom: "0"
            }}>
                <h1 style={{ margin: "0 0 20px 0", fontSize: "28px" }}>
                    <span style={{ color: "#ff4444" }}>Lampel</span> Network Tools Suite
                </h1>
                <div style={{ display: "flex", gap: "0", justifyContent: "center" }}>
                    <button
                        onClick={() => setCurrentMode("hextobinary")}
                        style={{
                            padding: "12px 24px",
                            background: currentMode === "hextobinary" ? "rgba(255,255,255,0.2)" : "transparent",
                            color: "white",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderRight: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "8px 0 0 8px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: currentMode === "hextobinary" ? "600" : "400",
                            transition: "all 0.3s ease",
                            backdropFilter: currentMode === "hextobinary" ? "blur(10px)" : "none"
                        }}
                    >
                        🔢 Hex ↔ Binary Converter
                    </button>
                    <button
                        onClick={() => setCurrentMode("miicommands")}
                        style={{
                            padding: "12px 24px",
                            background: currentMode === "miicommands" ? "rgba(255,255,255,0.2)" : "transparent",
                            color: "white",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderLeft: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "0 8px 8px 0",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: currentMode === "miicommands" ? "600" : "400",
                            transition: "all 0.3s ease",
                            backdropFilter: currentMode === "miicommands" ? "blur(10px)" : "none"
                        }}
                    >
                        🔧 MII Command Builder
                    </button>
                </div>
            </div>

            {/* Content based on current mode */}
            {currentMode === "hextobinary" ? (
                <HexToBinApp />
            ) : (
                <MiiCommandBuilder />
            )}

            {/* Creator Attribution - Always Visible */}
            <div style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "500",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
            }}>
                Created By <span style={{ color: "#ff4444", fontWeight: "600" }}>Eyal Lampel</span>
            </div>
        </div>
    );
}

// Export as default
export default App;