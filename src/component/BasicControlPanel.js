import React, { useState, useMemo, useEffect } from "react";
import { NumInput, toWord } from "./MiiHelpers";

// localStorage helper functions for BasicControlPanel
const BASIC_CTRL_STORAGE_KEYS = {
    ctrlReg: 'basicCtrl_ctrlReg',
    statReg: 'basicCtrl_statReg',
    autoNegAdvReg: 'basicCtrl_autoNegAdvReg',
    linkPartnerReg: 'basicCtrl_linkPartnerReg',
    giga1000CtrlReg: 'basicCtrl_giga1000CtrlReg',
    giga1000StatReg: 'basicCtrl_giga1000StatReg',
    extStatReg: 'basicCtrl_extStatReg',
    copperCtrl1Reg: 'basicCtrl_copperCtrl1Reg',
    copperStat1Reg: 'basicCtrl_copperStat1Reg'
};

const loadFromStorageBasicCtrl = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn(`Failed to load ${key} from localStorage:`, e);
        return defaultValue;
    }
};

const saveToStorageBasicCtrl = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
};

export default function BasicControlPanel() {
    // Initialize state from localStorage
    const [ctrlReg, setCtrlReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.ctrlReg, "4040"));
    const [statReg, setStatReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.statReg, "7809"));
    const [autoNegAdvReg, setAutoNegAdvReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.autoNegAdvReg, "01E1"));
    const [linkPartnerReg, setLinkPartnerReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.linkPartnerReg, "0000"));
    const [giga1000CtrlReg, setGiga1000CtrlReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.giga1000CtrlReg, "0300"));
    const [giga1000StatReg, setGiga1000StatReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.giga1000StatReg, "3000"));
    const [extStatReg, setExtStatReg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.extStatReg, "3000"));
    const [copperCtrl1Reg, setCopperCtrl1Reg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.copperCtrl1Reg, "0060"));
    const [copperStat1Reg, setCopperStat1Reg] = useState(() => loadFromStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.copperStat1Reg, "A400"));

    // Save state to localStorage whenever values change
    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.ctrlReg, ctrlReg);
    }, [ctrlReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.statReg, statReg);
    }, [statReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.autoNegAdvReg, autoNegAdvReg);
    }, [autoNegAdvReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.linkPartnerReg, linkPartnerReg);
    }, [linkPartnerReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.giga1000CtrlReg, giga1000CtrlReg);
    }, [giga1000CtrlReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.giga1000StatReg, giga1000StatReg);
    }, [giga1000StatReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.extStatReg, extStatReg);
    }, [extStatReg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.copperCtrl1Reg, copperCtrl1Reg);
    }, [copperCtrl1Reg]);

    useEffect(() => {
        saveToStorageBasicCtrl(BASIC_CTRL_STORAGE_KEYS.copperStat1Reg, copperStat1Reg);
    }, [copperStat1Reg]);

    const decodeControl = useMemo(() => {
        const val = toWord(ctrlReg);
        const speed13 = !!(val & 0x2000);
        const speed6 = !!(val & 0x0040);
        let speedStr = "10 Mbps";
        if (speed13 && speed6) speedStr = "Reserved";      // 11 = Reserved
        else if (!speed13 && speed6) speedStr = "1000 Mbps"; // 10 = 1000 Mbps (bit6=1, bit13=0)
        else if (speed13 && !speed6) speedStr = "100 Mbps";  // 01 = 100 Mbps (bit6=0, bit13=1)
        
        return {
            softReset: !!(val & 0x8000),
            loopback: !!(val & 0x4000),
            speedSelection: speedStr,
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

    const decodeAutoNegAdv = useMemo(() => {
        const val = toWord(autoNegAdvReg);
        return {
            nextPage: !!(val & 0x8000),
            remoteFault: !!(val & 0x2000),
            asymPause: !!(val & 0x0800),
            pause: !!(val & 0x0400),
            adv100TxFull: !!(val & 0x0100),
            adv100TxHalf: !!(val & 0x0080),
            adv10TxFull: !!(val & 0x0040),
            adv10TxHalf: !!(val & 0x0020),
            selector: val & 0x001F,
        };
    }, [autoNegAdvReg]);

    const decodeLinkPartner = useMemo(() => {
        const val = toWord(linkPartnerReg);
        return {
            nextPage: !!(val & 0x8000),
            acknowledge: !!(val & 0x4000),
            remoteFault: !!(val & 0x2000),
            asymPause: !!(val & 0x0800),
            pause: !!(val & 0x0400),
            cap100TxFull: !!(val & 0x0100),
            cap100TxHalf: !!(val & 0x0080),
            cap10TxFull: !!(val & 0x0040),
            cap10TxHalf: !!(val & 0x0020),
        };
    }, [linkPartnerReg]);

    const decode1000BaseT = useMemo(() => {
        const ctrlVal = toWord(giga1000CtrlReg);
        const statVal = toWord(giga1000StatReg);
        const testMode = (ctrlVal >> 13) & 0x7;
        const testModeStr = ["Normal", "Test Mode 1", "Test Mode 2 (MASTER)", "Test Mode 3 (SLAVE)", "Test Mode 4", "Reserved", "Reserved", "Reserved"][testMode];
        
        return {
            ctrl: {
                testMode: testModeStr,
                manualConfig: !!(ctrlVal & 0x1000),
                masterSlave: !!(ctrlVal & 0x0800) ? "MASTER" : "SLAVE",
                portType: !!(ctrlVal & 0x0400) ? "Multi-port (MASTER)" : "Single-port (SLAVE)",
                adv1000Full: !!(ctrlVal & 0x0200),
                adv1000Half: !!(ctrlVal & 0x0100),
            },
            status: {
                configFault: !!(statVal & 0x8000),
                masterSlave: !!(statVal & 0x4000) ? "MASTER" : "SLAVE",
                localRxOK: !!(statVal & 0x2000),
                remoteRxOK: !!(statVal & 0x1000),
                lp1000Full: !!(statVal & 0x0800),
                lp1000Half: !!(statVal & 0x0400),
                idleErrorCount: statVal & 0xFF,
            }
        };
    }, [giga1000CtrlReg, giga1000StatReg]);

    const decodeExtendedStatus = useMemo(() => {
        const val = toWord(extStatReg);
        return {
            cap1000XFull: !!(val & 0x8000),
            cap1000XHalf: !!(val & 0x4000),
            cap1000TFull: !!(val & 0x2000),
            cap1000THalf: !!(val & 0x1000),
        };
    }, [extStatReg]);

    const decodeCopperSpecific = useMemo(() => {
        const ctrlVal = toWord(copperCtrl1Reg);
        const statVal = toWord(copperStat1Reg);
        
        const downshiftCounter = (ctrlVal >> 12) & 0x7;
        const energyDetect = (ctrlVal >> 7) & 0x7;
        const mdiMode = (ctrlVal >> 5) & 0x3;
        
        const speed = (statVal >> 14) & 0x3;
        const speedStr = ["10 Mbps", "100 Mbps", "1000 Mbps", "Reserved"][speed];
        
        return {
            ctrl: {
                disableLinkPulse: !!(ctrlVal & 0x8000),
                downshiftCounter: downshiftCounter + 1,
                downshiftEnable: !!(ctrlVal & 0x0800),
                forceLinkGood: !!(ctrlVal & 0x0400),
                energyDetectMode: ["Off", "Off", "Off", "Off", "Auto wake-up", "SW wake-up", "ED+TM auto", "ED+TM SW"][energyDetect],
                mdiMode: ["Manual MDI", "Manual MDIX", "Reserved", "Auto crossover"][mdiMode],
                txDisable: !!(ctrlVal & 0x0008),
                powerDown: !!(ctrlVal & 0x0004),
                polarityRevDisabled: !!(ctrlVal & 0x0002),
                jabberDisabled: !!(ctrlVal & 0x0001),
            },
            status: {
                speed: speedStr,
                duplex: !!(statVal & 0x2000) ? "Full-duplex" : "Half-duplex",
                pageReceived: !!(statVal & 0x1000),
                speedDuplexResolved: !!(statVal & 0x0800),
                linkUp: !!(statVal & 0x0400),
                txPauseEnabled: !!(statVal & 0x0200),
                rxPauseEnabled: !!(statVal & 0x0100),
                mdiCrossover: !!(statVal & 0x0040) ? "MDIX" : "MDI",
                downshiftOccurred: !!(statVal & 0x0020),
                energyDetectSleep: !!(statVal & 0x0010),
                globalLinkUp: !!(statVal & 0x0008),
                dtePowerNeeded: !!(statVal & 0x0004),
                polarityReversed: !!(statVal & 0x0002),
                jabberDetected: !!(statVal & 0x0001),
            }
        };
    }, [copperCtrl1Reg, copperStat1Reg]);

    const script = useMemo(() => {
        return [
            "#!/bin/bash",
            "# Enhanced PHY Control and Status Script",
            "# Basic control and status",
            `mii write 0x00 0x00 0x${ctrlReg.padStart(4, "0").toUpperCase()}  # Control register`,
            "mii read 0x00 0x01                                               # Status register",
            "",
            "# Auto-negotiation configuration",
            `mii write 0x00 0x04 0x${autoNegAdvReg.padStart(4, "0").toUpperCase()}  # Auto-neg advertisement`,
            "mii read 0x00 0x05                                               # Link partner ability",
            "mii read 0x00 0x06                                               # Auto-neg expansion",
            "",
            "# 1000BASE-T configuration",
            `mii write 0x00 0x09 0x${giga1000CtrlReg.padStart(4, "0").toUpperCase()}  # 1000BASE-T control`,
            "mii read 0x00 0x0A                                               # 1000BASE-T status",
            "mii read 0x00 0x0F                                               # Extended status",
            "",
            "# Copper-specific advanced features",
            `mii write 0x00 0x10 0x${copperCtrl1Reg.padStart(4, "0").toUpperCase()}  # Copper control 1`,
            "mii read 0x00 0x11                                               # Copper status 1",
            "",
            "# Complete status readback",
            "mii read 0x00 0x00  # Control register",
            "mii read 0x00 0x01  # Status register",
            "mii read 0x00 0x02  # PHY ID 1",
            "mii read 0x00 0x03  # PHY ID 2"
        ].join("\n");
    }, [ctrlReg, autoNegAdvReg, giga1000CtrlReg, copperCtrl1Reg]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>⚙️ Enhanced PHY Control & Status</h3>
            
            {/* Basic Control & Status Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                    <NumInput label="Control Register (0x00)" value={ctrlReg} onChange={setCtrlReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>Basic Control:</h4>
                        {Object.entries(decodeControl).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: key === 'speedSelection' ? "#3b82f6" : (val === true ? "#10b981" : "#6b7280") }}>
                                    {key === 'speedSelection' ? "⚡" : (val ? "✓" : "○")} {key.replace(/([A-Z])/g, " $1").trim()}: {typeof val === 'string' ? val : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <NumInput label="Status Register (0x01)" value={statReg} onChange={setStatReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>Basic Status:</h4>
                        {Object.entries(decodeStatus).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: val ? "#10b981" : "#6b7280" }}>
                                    {val ? "✓" : "○"} {key.replace(/([A-Z])/g, " $1").replace(/capability/g, "").trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Auto-Negotiation Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                    <NumInput label="Auto-Neg Advertisement (0x04)" value={autoNegAdvReg} onChange={setAutoNegAdvReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>Advertised Capabilities:</h4>
                        {Object.entries(decodeAutoNegAdv).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: key === 'selector' ? "#3b82f6" : (val === true ? "#10b981" : "#6b7280") }}>
                                    {key === 'selector' ? "🏷️" : (val ? "✓" : "○")} {key.replace(/([A-Z])/g, " $1").replace(/adv/g, "").trim()}{key === 'selector' ? `: ${val} (802.3)` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <NumInput label="Link Partner Ability (0x05)" value={linkPartnerReg} onChange={setLinkPartnerReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>Partner Capabilities:</h4>
                        {Object.entries(decodeLinkPartner).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: val ? "#10b981" : "#6b7280" }}>
                                    {val ? "✓" : "○"} {key.replace(/([A-Z])/g, " $1").replace(/cap/g, "").trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 1000BASE-T Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                    <NumInput label="1000BASE-T Control (0x09)" value={giga1000CtrlReg} onChange={setGiga1000CtrlReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>🚀 1000Mb Control:</h4>
                        {Object.entries(decode1000BaseT.ctrl).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: typeof val === 'string' ? "#3b82f6" : (val === true ? "#10b981" : "#6b7280") }}>
                                    {typeof val === 'string' ? "⚙️" : (val ? "✓" : "○")} {key.replace(/([A-Z])/g, " $1").replace(/adv/g, "Advertise ").trim()}: {typeof val === 'string' ? val : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <NumInput label="1000BASE-T Status (0x0A)" value={giga1000StatReg} onChange={setGiga1000StatReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>🚀 1000Mb Status:</h4>
                        {Object.entries(decode1000BaseT.status).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: typeof val === 'string' || typeof val === 'number' ? "#3b82f6" : (val === true ? "#10b981" : "#6b7280") }}>
                                    {typeof val === 'string' || typeof val === 'number' ? "📊" : (val ? "✓" : "○")} {key.replace(/([A-Z])/g, " $1").replace(/lp/g, "Link Partner ").trim()}: {typeof val === 'string' || typeof val === 'number' ? val : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Advanced Features Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                    <NumInput label="Copper Control 1 (0x10)" value={copperCtrl1Reg} onChange={setCopperCtrl1Reg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>🔧 Advanced Control:</h4>
                        {Object.entries(decodeCopperSpecific.ctrl).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: typeof val === 'string' || typeof val === 'number' ? "#3b82f6" : (val === true ? "#10b981" : "#6b7280") }}>
                                    {typeof val === 'string' || typeof val === 'number' ? "⚙️" : (val ? "✓" : "○")} {key.replace(/([A-Z])/g, " $1").trim()}: {typeof val === 'string' || typeof val === 'number' ? val : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <NumInput label="Copper Status 1 (0x11)" value={copperStat1Reg} onChange={setCopperStat1Reg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>🔧 Advanced Status:</h4>
                        {Object.entries(decodeCopperSpecific.status).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: typeof val === 'string' ? "#3b82f6" : (val === true ? "#10b981" : "#6b7280") }}>
                                    {typeof val === 'string' ? "📈" : (val ? "✓" : "○")} {key.replace(/([A-Z])/g, " $1").trim()}: {typeof val === 'string' ? val : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Extended Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                    <NumInput label="Extended Status (0x0F)" value={extStatReg} onChange={setExtStatReg} />
                    <div style={{ marginTop: 12, fontSize: 11 }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1f2937" }}>🔍 Extended Capabilities:</h4>
                        {Object.entries(decodeExtendedStatus).map(([key, val]) => (
                            <div key={key} style={{ margin: "1px 0" }}>
                                <span style={{ color: val ? "#10b981" : "#6b7280" }}>
                                    {val ? "✓" : "○"} {key.replace(/([A-Z])/g, " $1").replace(/cap/g, "").trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ background: "#fef3c7", padding: 12, borderRadius: 8, border: "1px solid #f59e0b" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#92400e" }}>💡 Quick Actions</h4>
                    <div style={{ fontSize: 11, color: "#78350f" }}>
                        <div>• Enable 1000Mb: Set bits 9,8 in reg 0x09</div>
                        <div>• Auto MDI/MDIX: Set bits 6,5=11 in reg 0x10</div>
                        <div>• Energy detect: Set bits 9:7 in reg 0x10</div>
                        <div>• Downshift: Set bit 11 + counter in reg 0x10</div>
                        <div>• Link up: Check bit 10 in reg 0x11</div>
                        <div>• Speed/Duplex: Check bits 15:13 in reg 0x11</div>
                    </div>
                </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 11 }}>
                <strong>📋 Enhanced Script:</strong> Complete PHY configuration with 1000Mb support, auto-negotiation, and advanced features
            </div>
            
            <pre style={{ background: "#5b21b6", color: "#e9d5ff", padding: 8, whiteSpace: "pre-wrap", borderRadius: 4, fontSize: 10, maxHeight: 300, overflowY: "auto" }}>{script}</pre>
        </div>
    );
}