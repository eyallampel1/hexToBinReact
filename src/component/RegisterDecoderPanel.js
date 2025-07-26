import React, { useState, useMemo, useEffect } from "react";
import { NumInput, toWord } from "./MiiHelpers";

// localStorage helper functions for RegisterDecoderPanel
const REG_DECODER_STORAGE_KEYS = {
    regValue: 'regDecoder_regValue',
    regType: 'regDecoder_regType'
};

const loadFromStorageRegDecoder = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn(`Failed to load ${key} from localStorage:`, e);
        return defaultValue;
    }
};

const saveToStorageRegDecoder = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
};

export default function RegisterDecoderPanel() {
    // Initialize state from localStorage
    const [regValue, setRegValue] = useState(() => loadFromStorageRegDecoder(REG_DECODER_STORAGE_KEYS.regValue, "8000"));
    const [regType, setRegType] = useState(() => loadFromStorageRegDecoder(REG_DECODER_STORAGE_KEYS.regType, "control"));

    // Save state to localStorage whenever values change
    useEffect(() => {
        saveToStorageRegDecoder(REG_DECODER_STORAGE_KEYS.regValue, regValue);
    }, [regValue]);

    useEffect(() => {
        saveToStorageRegDecoder(REG_DECODER_STORAGE_KEYS.regType, regType);
    }, [regType]);

    const decodedBits = useMemo(() => {
        const val = toWord(regValue);
        const bits = [];

        switch (regType) {
            case "control": // PHY Control Register (0x00)
                bits.push({ bit: 15, name: "Copper Reset", value: !!(val & 0x8000), desc: "PHY reset" });
                bits.push({ bit: 14, name: "Loopback", value: !!(val & 0x4000), desc: "Enable loopback" });
                bits.push({ bit: 13, name: "Speed LSB", value: !!(val & 0x2000), desc: "Speed select LSB" });
                bits.push({ bit: 12, name: "Auto-Negotiation", value: !!(val & 0x1000), desc: "Enable auto-neg" });
                bits.push({ bit: 11, name: "Power Down", value: !!(val & 0x0800), desc: "Power down" });
                bits.push({ bit: 10, name: "Isolate", value: !!(val & 0x0400), desc: "Isolate (no effect)" });
                bits.push({ bit: 9, name: "Restart Auto-Neg", value: !!(val & 0x0200), desc: "Restart auto-neg" });
                bits.push({ bit: 8, name: "Full Duplex", value: !!(val & 0x0100), desc: "Full-duplex mode" });
                bits.push({ bit: 7, name: "Collision Test", value: !!(val & 0x0080), desc: "Collision test (no effect)" });
                bits.push({ bit: 6, name: "Speed MSB", value: !!(val & 0x0040), desc: "Speed select MSB" });
                const speed = (((val & 0x0040) >> 6) << 1) | ((val & 0x2000) >> 13);
                const speedStr = ["10 Mbps", "100 Mbps", "1000 Mbps", "Reserved"][speed];
                bits.push({ bit: "13,6", name: "Speed", value: speedStr, desc: "Combined speed selection", isMultiBit: true });
                break;

            case "status": // PHY Status Register (0x01)
                bits.push({ bit: 15, name: "100BASE-T4", value: !!(val & 0x8000), desc: "Always 0 (not available)" });
                bits.push({ bit: 14, name: "100BASE-X Full", value: !!(val & 0x4000), desc: "Always 1 (capable)" });
                bits.push({ bit: 13, name: "100BASE-X Half", value: !!(val & 0x2000), desc: "Always 1 (capable)" });
                bits.push({ bit: 12, name: "10 Mbps Full", value: !!(val & 0x1000), desc: "Always 1 (capable)" });
                bits.push({ bit: 11, name: "10 Mbps Half", value: !!(val & 0x0800), desc: "Always 1 (capable)" });
                bits.push({ bit: 10, name: "100BASE-T2 Full", value: !!(val & 0x0400), desc: "Always 0 (not available)" });
                bits.push({ bit: 9, name: "100BASE-T2 Half", value: !!(val & 0x0200), desc: "Always 0 (not available)" });
                bits.push({ bit: 8, name: "Extended Status", value: !!(val & 0x0100), desc: "Always 1 (Reg 15 has ext status)" });
                bits.push({ bit: 6, name: "MF Preamble Sup", value: !!(val & 0x0040), desc: "Always 1 (accepts suppressed preamble)" });
                bits.push({ bit: 5, name: "Auto-Neg Complete", value: !!(val & 0x0020), desc: "Auto-negotiation complete" });
                bits.push({ bit: 4, name: "Remote Fault", value: !!(val & 0x0010), desc: "Remote fault detected (LH)" });
                bits.push({ bit: 3, name: "Auto-Neg Ability", value: !!(val & 0x0008), desc: "Always 1 (capable)" });
                bits.push({ bit: 2, name: "Link Status", value: !!(val & 0x0004), desc: "Link up (LL)" });
                bits.push({ bit: 1, name: "Jabber Detect", value: !!(val & 0x0002), desc: "Jabber detected (LH)" });
                bits.push({ bit: 0, name: "Extended Capability", value: !!(val & 0x0001), desc: "Always 1 (has extended regs)" });
                break;

            case "autoneg_adv": // Auto-Negotiation Advertisement (0x04)
                bits.push({ bit: 15, name: "Next Page", value: !!(val & 0x8000), desc: "Advertise next page capability" });
                bits.push({ bit: 14, name: "Acknowledge", value: !!(val & 0x4000), desc: "Always 0" });
                bits.push({ bit: 13, name: "Remote Fault", value: !!(val & 0x2000), desc: "Set remote fault bit" });
                bits.push({ bit: 12, name: "Reserved", value: !!(val & 0x1000), desc: "Reserved" });
                bits.push({ bit: 11, name: "Asymmetric Pause", value: !!(val & 0x0800), desc: "Asymmetric pause" });
                bits.push({ bit: 10, name: "Pause", value: !!(val & 0x0400), desc: "Pause capable" });
                bits.push({ bit: 9, name: "100BASE-T4", value: !!(val & 0x0200), desc: "Always 0 (not capable)" });
                bits.push({ bit: 8, name: "100BASE-TX Full", value: !!(val & 0x0100), desc: "Advertise 100TX full-duplex" });
                bits.push({ bit: 7, name: "100BASE-TX Half", value: !!(val & 0x0080), desc: "Advertise 100TX half-duplex" });
                bits.push({ bit: 6, name: "10BASE-TX Full", value: !!(val & 0x0040), desc: "Advertise 10TX full-duplex" });
                bits.push({ bit: 5, name: "10BASE-TX Half", value: !!(val & 0x0020), desc: "Advertise 10TX half-duplex" });
                const selector = val & 0x001F;
                bits.push({ bit: "4:0", name: "Selector Field", value: `${selector} (${selector === 1 ? "802.3" : "Unknown"})`, desc: "Protocol selector", isMultiBit: true });
                break;

            case "link_partner": // Link Partner Ability (0x05)
                bits.push({ bit: 15, name: "Next Page", value: !!(val & 0x8000), desc: "Link partner next page capable" });
                bits.push({ bit: 14, name: "Acknowledge", value: !!(val & 0x4000), desc: "Link partner received code word" });
                bits.push({ bit: 13, name: "Remote Fault", value: !!(val & 0x2000), desc: "Link partner detected remote fault" });
                bits.push({ bit: 12, name: "Technology Field", value: !!(val & 0x1000), desc: "Technology ability field" });
                bits.push({ bit: 11, name: "Asymmetric Pause", value: !!(val & 0x0800), desc: "Link partner requests asym pause" });
                bits.push({ bit: 10, name: "Pause Capable", value: !!(val & 0x0400), desc: "Link partner pause capable" });
                bits.push({ bit: 9, name: "100BASE-T4", value: !!(val & 0x0200), desc: "Link partner 100BASE-T4 capable" });
                bits.push({ bit: 8, name: "100BASE-TX Full", value: !!(val & 0x0100), desc: "Link partner 100TX full capable" });
                bits.push({ bit: 7, name: "100BASE-TX Half", value: !!(val & 0x0080), desc: "Link partner 100TX half capable" });
                bits.push({ bit: 6, name: "10BASE-T Full", value: !!(val & 0x0040), desc: "Link partner 10T full capable" });
                bits.push({ bit: 5, name: "10BASE-T Half", value: !!(val & 0x0020), desc: "Link partner 10T half capable" });
                const lpSelector = val & 0x001F;
                bits.push({ bit: "4:0", name: "Selector Field", value: `${lpSelector}`, desc: "Link partner selector field", isMultiBit: true });
                break;

            case "giga_control": // 1000BASE-T Control (0x09)
                const testMode = (val >> 13) & 0x7;
                const testModeStr = ["Normal", "Test Mode 1", "Test Mode 2 (MASTER)", "Test Mode 3 (SLAVE)", "Test Mode 4", "Reserved", "Reserved", "Reserved"][testMode];
                bits.push({ bit: "15:13", name: "Test Mode", value: testModeStr, desc: "Test mode selection", isMultiBit: true });
                bits.push({ bit: 12, name: "Manual Config", value: !!(val & 0x1000), desc: "Manual MASTER/SLAVE config" });
                bits.push({ bit: 11, name: "Config Value", value: !!(val & 0x0800) ? "MASTER" : "SLAVE", desc: "Manual config value", isMultiBit: true });
                bits.push({ bit: 10, name: "Port Type", value: !!(val & 0x0400), desc: "Prefer multi-port device (MASTER)" });
                bits.push({ bit: 9, name: "1000BASE-T Full", value: !!(val & 0x0200), desc: "Advertise 1000T full-duplex" });
                bits.push({ bit: 8, name: "1000BASE-T Half", value: !!(val & 0x0100), desc: "Advertise 1000T half-duplex" });
                bits.push({ bit: "7:0", name: "Reserved", value: (val & 0xFF).toString(16).toUpperCase(), desc: "Reserved bits", isMultiBit: true });
                break;

            case "giga_status": // 1000BASE-T Status (0x0A)
                bits.push({ bit: 15, name: "Config Fault", value: !!(val & 0x8000), desc: "MASTER/SLAVE config fault (LH)" });
                bits.push({ bit: 14, name: "Config Resolution", value: !!(val & 0x4000) ? "MASTER" : "SLAVE", desc: "Local PHY resolved to", isMultiBit: true });
                bits.push({ bit: 13, name: "Local RX Status", value: !!(val & 0x2000), desc: "Local receiver OK" });
                bits.push({ bit: 12, name: "Remote RX Status", value: !!(val & 0x1000), desc: "Remote receiver OK" });
                bits.push({ bit: 11, name: "LP 1000T Full", value: !!(val & 0x0800), desc: "Link partner 1000T full capable" });
                bits.push({ bit: 10, name: "LP 1000T Half", value: !!(val & 0x0400), desc: "Link partner 1000T half capable" });
                bits.push({ bit: "9:8", name: "Reserved", value: ((val >> 8) & 0x3).toString(), desc: "Reserved bits", isMultiBit: true });
                const idleErrors = val & 0xFF;
                bits.push({ bit: "7:0", name: "Idle Error Count", value: `${idleErrors} (0x${idleErrors.toString(16).toUpperCase()})`, desc: "MSB of idle error counter", isMultiBit: true });
                break;

            case "copper_ctrl1": // Copper Specific Control 1 (0x10)
                bits.push({ bit: 15, name: "Disable Link Pulses", value: !!(val & 0x8000), desc: "Disable link pulse" });
                const downshiftCounter = ((val >> 12) & 0x7) + 1;
                bits.push({ bit: "14:12", name: "Downshift Counter", value: `${downshiftCounter}x`, desc: "Downshift counter setting", isMultiBit: true });
                bits.push({ bit: 11, name: "Downshift Enable", value: !!(val & 0x0800), desc: "Enable downshift" });
                bits.push({ bit: 10, name: "Force Link Good", value: !!(val & 0x0400), desc: "Force copper link good" });
                const energyDetect = (val >> 7) & 0x7;
                const energyModes = ["Off", "Off", "Off", "Off", "Auto wake-up", "SW wake-up", "ED+TM auto", "ED+TM SW"];
                bits.push({ bit: "9:7", name: "Energy Detect", value: energyModes[energyDetect], desc: "Energy detect mode", isMultiBit: true });
                const mdiMode = (val >> 5) & 0x3;
                const mdiModes = ["Manual MDI", "Manual MDIX", "Reserved", "Auto crossover"];
                bits.push({ bit: "6:5", name: "MDI Crossover", value: mdiModes[mdiMode], desc: "MDI crossover mode", isMultiBit: true });
                bits.push({ bit: 4, name: "Energy Detect Control", value: !!(val & 0x0010), desc: "Energy detect wake up control" });
                bits.push({ bit: 3, name: "TX Disable", value: !!(val & 0x0008), desc: "Copper transmitter disable" });
                bits.push({ bit: 2, name: "Power Down", value: !!(val & 0x0004), desc: "Power down" });
                bits.push({ bit: 1, name: "Polarity Rev Disable", value: !!(val & 0x0002), desc: "Polarity reversal disabled" });
                bits.push({ bit: 0, name: "Disable Jabber", value: !!(val & 0x0001), desc: "Disable jabber function" });
                break;

            case "copper_status1": // Copper Specific Status 1 (0x11)
                const currentSpeed = (val >> 14) & 0x3;
                const speedStrs = ["10 Mbps", "100 Mbps", "1000 Mbps", "Reserved"];
                bits.push({ bit: "15:14", name: "Speed", value: speedStrs[currentSpeed], desc: "Current speed", isMultiBit: true });
                bits.push({ bit: 13, name: "Duplex", value: !!(val & 0x2000) ? "Full-duplex" : "Half-duplex", desc: "Current duplex mode", isMultiBit: true });
                bits.push({ bit: 12, name: "Page Received", value: !!(val & 0x1000), desc: "Page received (LH)" });
                bits.push({ bit: 11, name: "Speed/Duplex Resolved", value: !!(val & 0x0800), desc: "Speed and duplex resolved" });
                bits.push({ bit: 10, name: "Copper Link", value: !!(val & 0x0400), desc: "Copper link (real time)" });
                bits.push({ bit: 9, name: "TX Pause Enabled", value: !!(val & 0x0200), desc: "Transmit pause enabled" });
                bits.push({ bit: 8, name: "RX Pause Enabled", value: !!(val & 0x0100), desc: "Receive pause enabled" });
                bits.push({ bit: 7, name: "Reserved", value: !!(val & 0x0080), desc: "Reserved" });
                bits.push({ bit: 6, name: "MDI Crossover", value: !!(val & 0x0040) ? "MDIX" : "MDI", desc: "MDI crossover status", isMultiBit: true });
                bits.push({ bit: 5, name: "Downshift Status", value: !!(val & 0x0020), desc: "Downshift occurred" });
                bits.push({ bit: 4, name: "Energy Detect", value: !!(val & 0x0010) ? "Sleep" : "Active", desc: "Energy detect status", isMultiBit: true });
                bits.push({ bit: 3, name: "Global Link", value: !!(val & 0x0008), desc: "Copper link up" });
                bits.push({ bit: 2, name: "DTE Power", value: !!(val & 0x0004), desc: "Link partner needs DTE power" });
                bits.push({ bit: 1, name: "Polarity", value: !!(val & 0x0002) ? "Reversed" : "Normal", desc: "Polarity (real time)", isMultiBit: true });
                bits.push({ bit: 0, name: "Jabber", value: !!(val & 0x0001), desc: "Jabber (real time)" });
                break;

            case "extended_status": // Extended Status (0x0F)
                bits.push({ bit: 15, name: "1000BASE-X Full", value: !!(val & 0x8000), desc: "Always 0 (not capable)" });
                bits.push({ bit: 14, name: "1000BASE-X Half", value: !!(val & 0x4000), desc: "Always 0 (not capable)" });
                bits.push({ bit: 13, name: "1000BASE-T Full", value: !!(val & 0x2000), desc: "Always 1 (capable)" });
                bits.push({ bit: 12, name: "1000BASE-T Half", value: !!(val & 0x1000), desc: "Always 1 (capable)" });
                bits.push({ bit: "11:0", name: "Reserved", value: `0x${(val & 0x0FFF).toString(16).toUpperCase()}`, desc: "Reserved (0x000)", isMultiBit: true });
                break;

            case "port": // Port Control Register
                bits.push({ bit: 15, name: "Reserved", value: !!(val & 0x8000), desc: "Reserved" });
                bits.push({ bit: 14, name: "Force Link", value: !!(val & 0x4000), desc: "Force link good" });
                const portState = (val >> 11) & 0x7;
                const portStates = ["Disabled", "Blocking", "Learning", "Forwarding", "Reserved", "Reserved", "Reserved", "Reserved"];
                bits.push({ bit: "13:11", name: "Port State", value: portStates[portState], desc: "Port state", isMultiBit: true });
                bits.push({ bit: 10, name: "TX Pause Enable", value: !!(val & 0x0400), desc: "Transmit pause enable" });
                bits.push({ bit: 9, name: "RX Pause Enable", value: !!(val & 0x0200), desc: "Receive pause enable" });
                bits.push({ bit: 8, name: "Drop on Lock", value: !!(val & 0x0100), desc: "Drop on lock" });
                bits.push({ bit: 7, name: "Double Tag", value: !!(val & 0x0080), desc: "Double tag mode" });
                bits.push({ bit: 4, name: "Forward Unknown", value: !!(val & 0x0010), desc: "Forward unknown unicast" });
                bits.push({ bit: 3, name: "Forward BC", value: !!(val & 0x0008), desc: "Forward broadcast" });
                bits.push({ bit: 2, name: "Forward MC", value: !!(val & 0x0004), desc: "Forward multicast" });
                bits.push({ bit: 1, name: "Forward UC", value: !!(val & 0x0002), desc: "Forward unicast" });
                break;

            case "vlan_map": // VLAN Map
                const vlanMap = val & 0x07FF;
                bits.push({ bit: "15:11", name: "Reserved", value: ((val >> 11) & 0x1F).toString(), desc: "Reserved bits", isMultiBit: true });
                bits.push({ bit: "10:0", name: "VLAN Map", value: `0x${vlanMap.toString(16).toUpperCase()} (${vlanMap})`, desc: "Port VLAN map", isMultiBit: true });
                for (let i = 0; i < 11; i++) {
                    bits.push({ bit: i, name: `Port ${i}`, value: !!(vlanMap & (1 << i)), desc: `Port ${i} in VLAN` });
                }
                break;

            case "interrupt_enable": // Interrupt Enable
                bits.push({ bit: 15, name: "Auto-Neg Error Int", value: !!(val & 0x8000), desc: "Auto-negotiation error interrupt" });
                bits.push({ bit: 14, name: "Speed Changed Int", value: !!(val & 0x4000), desc: "Speed changed interrupt" });
                bits.push({ bit: 13, name: "Duplex Changed Int", value: !!(val & 0x2000), desc: "Duplex changed interrupt" });
                bits.push({ bit: 12, name: "Page Received Int", value: !!(val & 0x1000), desc: "Page received interrupt" });
                bits.push({ bit: 11, name: "Auto-Neg Complete Int", value: !!(val & 0x0800), desc: "Auto-negotiation complete interrupt" });
                bits.push({ bit: 10, name: "Link Status Changed Int", value: !!(val & 0x0400), desc: "Link status changed interrupt" });
                bits.push({ bit: 9, name: "Symbol Error Int", value: !!(val & 0x0200), desc: "Symbol error interrupt" });
                bits.push({ bit: 8, name: "False Carrier Int", value: !!(val & 0x0100), desc: "False carrier interrupt" });
                bits.push({ bit: 7, name: "FIFO Over/Under Int", value: !!(val & 0x0080), desc: "FIFO over/underflow interrupt" });
                bits.push({ bit: 6, name: "MDI Crossover Int", value: !!(val & 0x0040), desc: "MDI crossover changed interrupt" });
                bits.push({ bit: 5, name: "Downshift Int", value: !!(val & 0x0020), desc: "Downshift interrupt" });
                bits.push({ bit: 4, name: "Energy Detect Int", value: !!(val & 0x0010), desc: "Energy detect interrupt" });
                bits.push({ bit: 3, name: "DTE Power Int", value: !!(val & 0x0008), desc: "DTE power status interrupt" });
                bits.push({ bit: 2, name: "Polarity Changed Int", value: !!(val & 0x0004), desc: "Polarity changed interrupt" });
                bits.push({ bit: 1, name: "Jabber Int", value: !!(val & 0x0002), desc: "Jabber interrupt" });
                break;

            default:
                bits.push({ bit: "N/A", name: "Unknown Register Type", value: "Select a register type", desc: "Please select a valid register type", isMultiBit: true });
        }

        return bits;
    }, [regValue, regType]);

    const binaryView = useMemo(() => {
        const val = toWord(regValue);
        return Array.from({ length: 16 }, (_, i) => (val >> (15 - i)) & 1).join("");
    }, [regValue]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>🔍 Enhanced Register Bit Decoder</h3>
            
            {/* Controls */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                <NumInput label="Register Value" value={regValue} onChange={setRegValue} />
                <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Register Type</label>
                    <select
                        value={regType}
                        onChange={(e) => setRegType(e.target.value)}
                        style={{ 
                            padding: "6px 10px", 
                            marginTop: 4, 
                            display: "block",
                            borderRadius: 4,
                            border: "1px solid #d1d5db",
                            fontSize: 12,
                            minWidth: 200
                        }}
                    >
                        <optgroup label="📡 PHY Control & Status">
                            <option value="control">Control Register (0x00)</option>
                            <option value="status">Status Register (0x01)</option>
                            <option value="extended_status">Extended Status (0x0F)</option>
                        </optgroup>
                        <optgroup label="🤝 Auto-Negotiation">
                            <option value="autoneg_adv">Auto-Neg Advertisement (0x04)</option>
                            <option value="link_partner">Link Partner Ability (0x05)</option>
                        </optgroup>
                        <optgroup label="🚀 1000BASE-T (Gigabit)">
                            <option value="giga_control">1000BASE-T Control (0x09)</option>
                            <option value="giga_status">1000BASE-T Status (0x0A)</option>
                        </optgroup>
                        <optgroup label="🔧 Copper Advanced">
                            <option value="copper_ctrl1">Copper Control 1 (0x10)</option>
                            <option value="copper_status1">Copper Status 1 (0x11)</option>
                        </optgroup>
                        <optgroup label="🌐 Switch Registers">
                            <option value="port">Port Control</option>
                            <option value="vlan_map">VLAN Map</option>
                        </optgroup>
                        <optgroup label="⚠️ Interrupt Control">
                            <option value="interrupt_enable">Interrupt Enable (0x12)</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Value Display */}
            <div style={{ 
                background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 16,
                border: "1px solid #d1d5db"
            }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <h4 style={{ margin: 0, color: "#374151", fontSize: 14 }}>📊 Value Analysis</h4>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 16, marginBottom: 8, fontWeight: 600 }}>
                    Binary: <span style={{ color: "#3b82f6" }}>{binaryView.match(/.{1,4}/g).join(" ")}</span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#6b7280" }}>
                    <span>Hex: <strong style={{ color: "#059669" }}>0x{toWord(regValue).toString(16).padStart(4, "0").toUpperCase()}</strong></span>
                    <span>Dec: <strong style={{ color: "#dc2626" }}>{toWord(regValue)}</strong></span>
                    <span>Reg: <strong style={{ color: "#7c3aed" }}>{regType.replace(/_/g, " ")}</strong></span>
                </div>
            </div>

            {/* Bit Field Breakdown */}
            <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#374151", fontSize: 14 }}>🔧 Bit Field Breakdown</h4>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                    gap: 10 
                }}>
                    {decodedBits.map(({ bit, name, value, desc, isMultiBit }, index) => {
                        const isActive = isMultiBit ? 
                            (typeof value === 'string' && !value.includes('0x0000') && value !== 'Normal' && value !== 'Off') || 
                            (typeof value === 'boolean' && value) :
                            value;
                        
                        return (
                            <div
                                key={`${bit}-${index}`}
                                style={{
                                    padding: "10px 12px",
                                    background: isActive ? 
                                        (isMultiBit ? "#dbeafe" : "#dcfce7") : 
                                        "#f8fafc",
                                    border: `1px solid ${isActive ? 
                                        (isMultiBit ? "#93c5fd" : "#86efac") : 
                                        "#e2e8f0"}`,
                                    borderRadius: 6,
                                    fontSize: 11,
                                    position: "relative",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                                    <div style={{ 
                                        fontSize: 10, 
                                        fontWeight: 600, 
                                        color: "#6b7280",
                                        fontFamily: "monospace"
                                    }}>
                                        {isMultiBit ? `Bits ${bit}` : `Bit ${bit}`}
                                    </div>
                                    <div style={{ 
                                        fontSize: 10, 
                                        fontWeight: "bold",
                                        color: isActive ? 
                                            (isMultiBit ? "#1d4ed8" : "#059669") : 
                                            "#9ca3af"
                                    }}>
                                        {isMultiBit ? 
                                            (typeof value === 'string' ? value : String(value)) :
                                            (value ? "1" : "0")
                                        }
                                    </div>
                                </div>
                                <div style={{ 
                                    fontWeight: 600, 
                                    color: "#1f2937", 
                                    marginBottom: 3,
                                    fontSize: 12
                                }}>
                                    {name}
                                </div>
                                <div style={{ 
                                    fontSize: 10, 
                                    color: "#6b7280", 
                                    lineHeight: 1.3
                                }}>
                                    {desc}
                                </div>
                                {isMultiBit && (
                                    <div style={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        background: "#3b82f6",
                                        color: "white",
                                        fontSize: 8,
                                        padding: "2px 4px",
                                        borderRadius: 3,
                                        fontWeight: 600
                                    }}>
                                        MULTI
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Reference */}
            <div style={{ 
                background: "#fef3c7", 
                padding: 12, 
                borderRadius: 8, 
                border: "1px solid #f59e0b",
                marginTop: 16
            }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#92400e", fontSize: 13 }}>💡 Quick Reference</h4>
                <div style={{ fontSize: 11, color: "#78350f", lineHeight: 1.4 }}>
                    <div><strong>Green:</strong> Single bit fields (0/1 values)</div>
                    <div><strong>Blue:</strong> Multi-bit fields (ranges, enums, counters)</div>
                    <div><strong>LH:</strong> Latching High (cleared on read) | <strong>LL:</strong> Latching Low (set on read)</div>
                    <div><strong>SC:</strong> Self-Clear | <strong>RO:</strong> Read Only | <strong>R/W:</strong> Read/Write</div>
                </div>
            </div>
        </div>
    );
}