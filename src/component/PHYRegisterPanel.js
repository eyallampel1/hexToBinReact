import React, { useState, useMemo } from 'react';

// PHY Register definitions based on 88E6321_PHY_Registers_Reference.txt
const PHY_REGISTERS = {
    0: {
        name: "Page 0 - Basic PHY Control and Status",
        registers: {
            0x00: {
                name: "Copper Control Register",
                bits: [
                    { bit: 15, name: "Copper Reset", type: "R/W, SC", desc: "1=PHY reset, 0=Normal operation" },
                    { bit: 14, name: "Loopback", type: "R/W", desc: "1=Enable loopback, 0=Disable loopback" },
                    { bit: 13, name: "Speed Select LSB", type: "R/W, Update", desc: "Combined with bit 6 for speed" },
                    { bit: 12, name: "Auto-Negotiation Enable", type: "R/W, Update", desc: "1=Enable auto-neg, 0=Disable" },
                    { bit: 11, name: "Power Down", type: "R/W, Retain", desc: "1=Power down, 0=Normal operation" },
                    { bit: 10, name: "Isolate", type: "RO", desc: "No effect" },
                    { bit: 9, name: "Restart Auto-Negotiation", type: "R/W, SC", desc: "1=Restart auto-neg, 0=Normal" },
                    { bit: 8, name: "Duplex Mode", type: "R/W, Update", desc: "1=Full-duplex, 0=Half-duplex" },
                    { bit: 7, name: "Collision Test", type: "RO", desc: "No effect" },
                    { bit: 6, name: "Speed Selection MSB", type: "R/W, Update", desc: "Combined with bit 13" },
                    { bits: "5:0", name: "Reserved", type: "RO", desc: "Always 000000" }
                ]
            },
            0x01: {
                name: "Copper Status Register",
                bits: [
                    { bit: 15, name: "100BASE-T4", type: "RO", desc: "Always 0 (not available)" },
                    { bit: 14, name: "100BASE-X Full-Duplex", type: "RO", desc: "Always 1 (capable)" },
                    { bit: 13, name: "100BASE-X Half-Duplex", type: "RO", desc: "Always 1 (capable)" },
                    { bit: 12, name: "10 Mbps Full-Duplex", type: "RO", desc: "Always 1 (capable)" },
                    { bit: 11, name: "10 Mbps Half-Duplex", type: "RO", desc: "Always 1 (capable)" },
                    { bit: 10, name: "100BASE-T2 Full-Duplex", type: "RO", desc: "Always 0 (not available)" },
                    { bit: 9, name: "100BASE-T2 Half-Duplex", type: "RO", desc: "Always 0 (not available)" },
                    { bit: 8, name: "Extended Status", type: "RO", desc: "Always 1 (Register 15 has extended status)" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Always 0" },
                    { bit: 6, name: "MF Preamble Suppression", type: "RO", desc: "Always 1 (accepts suppressed preamble)" },
                    { bit: 5, name: "Auto-Negotiation Complete", type: "RO", desc: "1=Complete, 0=Not complete" },
                    { bit: 4, name: "Remote Fault", type: "RO, LH", desc: "1=Remote fault detected, 0=No fault" },
                    { bit: 3, name: "Auto-Negotiation Ability", type: "RO", desc: "Always 1 (capable)" },
                    { bit: 2, name: "Link Status", type: "RO, LL", desc: "1=Link up, 0=Link down (latching low)" },
                    { bit: 1, name: "Jabber Detect", type: "RO, LH", desc: "1=Jabber detected, 0=No jabber" },
                    { bit: 0, name: "Extended Capability", type: "RO", desc: "Always 1 (has extended registers)" }
                ]
            },
            0x02: {
                name: "PHY Identifier 1",
                bits: [
                    { bits: "15:0", name: "OUI Bits 3:18", type: "RO", desc: "Marvell OUI bits 3-18 (0x0141)" }
                ]
            },
            0x03: {
                name: "PHY Identifier 2",
                bits: [
                    { bits: "15:10", name: "OUI LSB", type: "RO", desc: "OUI bits 19-24 (000011)" },
                    { bits: "9:0", name: "Reserved", type: "RO", desc: "Reserved" }
                ]
            },
            0x10: {
                name: "Copper Specific Control Register 1",
                bits: [
                    { bit: 15, name: "Disable Link Pulses", type: "R/W", desc: "1=Disable link pulse, 0=Enable" },
                    { bits: "14:12", name: "Downshift Counter", type: "R/W, Update", desc: "000=1x, 001=2x, 010=3x, 011=4x, 100=5x, 101=6x, 110=7x, 111=8x" },
                    { bit: 11, name: "Downshift Enable", type: "R/W, Update", desc: "1=Enable downshift, 0=Disable" },
                    { bit: 10, name: "Force Link Good", type: "R/W, Retain", desc: "1=Force link good, 0=Normal" },
                    { bits: "9:7", name: "Energy Detect", type: "R/W, Update", desc: "Energy detect modes" },
                    { bits: "6:5", name: "MDI Crossover Mode", type: "R/W, Update", desc: "00=Manual MDI, 01=Manual MDIX, 11=Auto crossover" },
                    { bit: 4, name: "Energy Detect Wake Up", type: "R/W or RO, SC", desc: "Wake up control" },
                    { bit: 3, name: "Transmitter Disable", type: "R/W, Retain", desc: "1=Disable, 0=Enable" },
                    { bit: 2, name: "Power Down", type: "R/W, Retain", desc: "1=Power down, 0=Normal" },
                    { bit: 1, name: "Polarity Reversal Disable", type: "R/W, Retain", desc: "1=Disabled, 0=Enabled" },
                    { bit: 0, name: "Disable Jabber", type: "R/W, Retain", desc: "1=Disable jabber, 0=Enable" }
                ]
            },
            0x11: {
                name: "Copper Specific Status Register 1",
                bits: [
                    { bits: "15:14", name: "Speed", type: "RO, Retain", desc: "11=Reserved, 10=1000Mbps, 01=100Mbps, 00=10Mbps" },
                    { bit: 13, name: "Duplex", type: "RO, Retain", desc: "1=Full-duplex, 0=Half-duplex" },
                    { bit: 12, name: "Page Received", type: "RO, LH", desc: "1=Page received, 0=Not received" },
                    { bit: 11, name: "Speed/Duplex Resolved", type: "RO", desc: "1=Resolved, 0=Not resolved" },
                    { bit: 10, name: "Link Status (real time)", type: "RO", desc: "1=Link up, 0=Link down" },
                    { bit: 9, name: "TX Pause Enabled", type: "RO", desc: "1=TX pause enabled, 0=Disabled" },
                    { bit: 8, name: "RX Pause Enabled", type: "RO", desc: "1=RX pause enabled, 0=Disabled" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bit: 6, name: "MDI Crossover Status", type: "RO, Retain", desc: "1=MDIX, 0=MDI" },
                    { bit: 5, name: "Downshift Status", type: "RO", desc: "1=Downshift occurred, 0=No downshift" },
                    { bit: 4, name: "Energy Detect Status", type: "RO", desc: "1=Sleep, 0=Active" },
                    { bit: 3, name: "Global Link Status", type: "RO", desc: "1=Link up, 0=Link down" },
                    { bit: 2, name: "DTE Power Status", type: "RO", desc: "1=Partner needs DTE power, 0=Not needed" },
                    { bit: 1, name: "Polarity (real time)", type: "RO", desc: "1=Reversed, 0=Normal" },
                    { bit: 0, name: "Jabber (real time)", type: "RO", desc: "1=Jabber, 0=No jabber" }
                ]
            },
            0x12: {
                name: "Copper Specific Interrupt Enable Register",
                bits: [
                    { bit: 15, name: "Auto-Neg Error Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 14, name: "Speed Changed Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 13, name: "Duplex Changed Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 12, name: "Page Received Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 11, name: "Auto-Neg Complete Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 10, name: "Link Status Changed Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 9, name: "Symbol Error Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 8, name: "False Carrier Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 7, name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 6, name: "MDI Crossover Changed Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 5, name: "Downshift Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 4, name: "Energy Detect Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 3, name: "FLP Exchange Complete Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 2, name: "Reserved", type: "R/W, Retain", desc: "Must be 0" },
                    { bit: 1, name: "Polarity Changed Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 0, name: "Jabber Int Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" }
                ]
            },
            0x13: {
                name: "Copper Interrupt Status Register",
                bits: [
                    { bit: 15, name: "Auto-Neg Error", type: "RO, LH", desc: "1=Error occurred, 0=No error" },
                    { bit: 14, name: "Speed Changed", type: "RO, LH", desc: "1=Speed changed, 0=No change" },
                    { bit: 13, name: "Duplex Changed", type: "RO, LH", desc: "1=Duplex changed, 0=No change" },
                    { bit: 12, name: "Page Received", type: "RO, LH", desc: "1=Page received, 0=Not received" },
                    { bit: 11, name: "Auto-Neg Completed", type: "RO, LH", desc: "1=Completed, 0=Not completed" },
                    { bit: 10, name: "Link Status Changed", type: "RO, LH", desc: "1=Changed, 0=No change" },
                    { bit: 9, name: "Symbol Error", type: "RO, LH", desc: "1=Error occurred, 0=No error" },
                    { bit: 8, name: "False Carrier", type: "RO, LH", desc: "1=False carrier, 0=No false carrier" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Always 0" },
                    { bit: 6, name: "MDI Crossover Changed", type: "RO, LH", desc: "1=Changed, 0=No change" },
                    { bit: 5, name: "Downshift", type: "RO, LH", desc: "1=Downshift detected, 0=No downshift" },
                    { bit: 4, name: "Energy Detect Changed", type: "RO, LH", desc: "1=State changed, 0=No change" },
                    { bit: 3, name: "FLP Exchange Complete but no Link", type: "RO, LH", desc: "1=Event detected, 0=No event" },
                    { bit: 2, name: "DTE Power Status Changed", type: "RO, LH", desc: "1=Changed, 0=No change" },
                    { bit: 1, name: "Polarity Changed", type: "RO, LH", desc: "1=Changed, 0=No change" },
                    { bit: 0, name: "Jabber", type: "RO, LH", desc: "1=Jabber detected, 0=No jabber" }
                ]
            },
            0x16: {
                name: "Page Address",
                bits: [
                    { bits: "15:14", name: "Reserved", type: "R/W, Retain", desc: "Must be 0" },
                    { bits: "13:8", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "7:0", name: "Page Select", type: "R/W, Retain", desc: "Page number (0x00-0xFF)" }
                ]
            }
        }
    },
    2: {
        name: "Page 2 - MAC Specific Control",
        registers: {
            0x10: {
                name: "MAC Specific Control Register 1",
                bits: [
                    { bits: "15:14", name: "TX FIFO Depth", type: "R/W, Retain", desc: "00=1518B, 01=9K, 10=18K, 11=27K packets" },
                    { bits: "13:11", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 10, name: "RCLK Enable", type: "R/W, Retain", desc: "1=Enable RCLK, 0=Disable" },
                    { bits: "9:8", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 7, name: "Copper Ref Clock Source", type: "R/W, Update", desc: "1=SE_SCLK, 0=XTAL_IN as 25MHz source" },
                    { bit: 6, name: "Pass Odd Nibble Preambles", type: "R/W, Update", desc: "0=Pad, 1=Pass as is" },
                    { bit: 5, name: "DPLL Ref Clock Source", type: "R/W, Retain", desc: "1=SE_SCLK, 0=XTAL_IN for DPLL" },
                    { bit: 4, name: "Reserved", type: "R/W, Retain", desc: "Write 0" },
                    { bit: 3, name: "MAC Interface Power Down", type: "R/W, Update", desc: "1=Always power up, 0=Can power down" },
                    { bits: "2:0", name: "Reserved", type: "R/W, Retain", desc: "Reserved" }
                ]
            }
        }
    },
    5: {
        name: "Page 5 - Advanced VCT",
        registers: {
            0x17: {
                name: "Advanced VCT Control",
                bits: [
                    { bit: 15, name: "Enable Test", type: "R/W, SC", desc: "0=Disable, 1=Enable test (self-clears)" },
                    { bit: 14, name: "Test Status", type: "RO", desc: "0=Not started/in progress, 1=Completed" },
                    { bits: "13:11", name: "TX Channel Select", type: "R/W", desc: "000=Normal, 100=TX0 to all RX, 101=TX1 to all RX, etc." },
                    { bits: "10:8", name: "Sample Averaged", type: "R/W, Retain", desc: "0=2 samples, 1=4, ..., 7=256 samples" },
                    { bits: "7:6", name: "Mode", type: "R/W, Retain", desc: "00=Max peak, 01=First/last peak, 10=Offset, 11=Sample point" },
                    { bits: "5:0", name: "Peak Detection Hysteresis", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x3F=±492mV" }
                ]
            }
        }
    },
    6: {
        name: "Page 6 - Packet Generation and Checking",
        registers: {
            0x10: {
                name: "Copper Port Packet Generation",
                bits: [
                    { bits: "15:8", name: "Packet Burst", type: "R/W, Retain", desc: "0x00=Continuous, 0x01-0xFF=Burst 1-255 packets" },
                    { bit: 7, name: "Packet Generator TX Trigger", type: "R/W, Retain", desc: "Trigger control for packet transmission" },
                    { bit: 6, name: "Packet Generator Enable Self Clear", type: "R/W, Retain", desc: "0=Bit 3 self-clears, 1=Stays high" },
                    { bit: 5, name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 4, name: "Enable CRC Checker", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 3, name: "Enable Packet Generator", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 2, name: "Payload Type", type: "R/W, Retain", desc: "0=Pseudo-random, 1=A5,5A,A5,5A pattern" },
                    { bit: 1, name: "Packet Length", type: "R/W, Retain", desc: "1=1518 bytes, 0=64 bytes" },
                    { bit: 0, name: "Transmit Errored Packet", type: "R/W, Retain", desc: "1=TX with CRC/symbol errors, 0=No error" }
                ]
            }
        }
    },
    7: {
        name: "Page 7 - PHY Cable Diagnostics",
        registers: {
            0x15: {
                name: "PHY Cable Diagnostics Control",
                bits: [
                    { bit: 15, name: "Run Immediately", type: "R/W, SC", desc: "0=No action, 1=Run VCT now" },
                    { bit: 14, name: "Run At Auto-Neg Cycle", type: "R/W, Retain", desc: "0=Don't run, 1=Run at auto-neg" },
                    { bit: 13, name: "Disable Cross Pair Check", type: "R/W, Retain", desc: "0=Enable, 1=Disable cross pair check" },
                    { bit: 12, name: "Run After Break Link", type: "R/W, SC", desc: "0=No action, 1=Run VCT after breaking link" },
                    { bit: 11, name: "Cable Diagnostics Status", type: "RO, Retain", desc: "0=Complete, 1=In progress" },
                    { bit: 10, name: "Cable Length Unit", type: "R/W, Retain", desc: "0=Centimeters, 1=Meters" },
                    { bits: "9:0", name: "Reserved", type: "RO", desc: "Reserved" }
                ]
            }
        }
    }
};

const toWord = (v) => {
    if (!v) return 0;
    const s = v.trim();
    if (s.toLowerCase().startsWith("0x")) return parseInt(s.slice(2), 16) & 0xffff;
    if (/[a-f]/i.test(s)) return parseInt(s, 16) & 0xffff;
    return parseInt(s, 10) & 0xffff;
};

function BitField({ bit, bitDef, value, onBitToggle, isReadOnly }) {
    const isBitRange = typeof bit === 'string' && bit.includes(':');
    const isChecked = isBitRange ? false : (value & (1 << bit)) !== 0;
    
    const handleToggle = () => {
        if (!isReadOnly && !isBitRange) {
            onBitToggle(bit);
        }
    };

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 8px",
            margin: "2px 0",
            background: isChecked ? "#dbeafe" : "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
            fontSize: "12px"
        }}>
            <div style={{ minWidth: "40px", fontWeight: "bold", color: "#374151" }}>
                {isBitRange ? bit : `${bit}`}
            </div>
            {!isBitRange && !isReadOnly && (
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleToggle}
                    style={{ marginRight: "8px" }}
                />
            )}
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>{bitDef.name}</div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>{bitDef.type}</div>
                <div style={{ fontSize: "11px", color: "#374151", marginTop: "2px" }}>{bitDef.desc}</div>
            </div>
        </div>
    );
}

function RegisterView({ pageNum, regAddr, regDef, currentValue, onValueChange, onGenerateCommand }) {
    const handleBitToggle = (bitNum) => {
        const newValue = currentValue ^ (1 << bitNum);
        onValueChange(newValue);
    };

    const handleManualValueChange = (e) => {
        const value = toWord(e.target.value);
        onValueChange(value);
    };

    const generateReadCommand = () => {
        // First set page (if not page 0)
        let commands = [];
        if (pageNum !== 0) {
            commands.push(`# Set page to ${pageNum}`);
            commands.push(`mii write 0x1c 0x19 0x${pageNum.toString(16).padStart(4, '0').toUpperCase()}`);
            commands.push(`mii write 0x1c 0x18 0x9416`); // Write to page register (0x16)
        }
        
        commands.push(`# Read register 0x${regAddr.toString(16).toUpperCase()}`);
        commands.push(`mii write 0x1c 0x18 0x${(0x9800 | (0x04 << 5) | regAddr).toString(16).toUpperCase()}`);
        commands.push(`mii read 0x1c 0x19`);
        
        onGenerateCommand(commands.join('\n'));
    };

    const generateWriteCommand = () => {
        let commands = [];
        if (pageNum !== 0) {
            commands.push(`# Set page to ${pageNum}`);
            commands.push(`mii write 0x1c 0x19 0x${pageNum.toString(16).padStart(4, '0').toUpperCase()}`);
            commands.push(`mii write 0x1c 0x18 0x9416`); // Write to page register (0x16)
        }
        
        commands.push(`# Write 0x${currentValue.toString(16).padStart(4, '0').toUpperCase()} to register 0x${regAddr.toString(16).toUpperCase()}`);
        commands.push(`mii write 0x1c 0x19 0x${currentValue.toString(16).padStart(4, '0').toUpperCase()}`);
        commands.push(`mii write 0x1c 0x18 0x${(0x9400 | (0x04 << 5) | regAddr).toString(16).toUpperCase()}`);
        
        onGenerateCommand(commands.join('\n'));
    };

    return (
        <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px", margin: "8px 0" }}>
            <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#1f2937" }}>
                    Register 0x{regAddr.toString(16).toUpperCase()} ({regAddr}) - {regDef.name}
                </h4>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                        <label style={{ fontSize: "12px", color: "#6b7280" }}>Current Value:</label>
                        <input
                            type="text"
                            value={`0x${currentValue.toString(16).padStart(4, '0').toUpperCase()}`}
                            onChange={handleManualValueChange}
                            style={{
                                marginLeft: "8px",
                                padding: "4px 8px",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px"
                            }}
                        />
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Binary: {currentValue.toString(2).padStart(16, '0')}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button
                        onClick={generateReadCommand}
                        style={{
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Generate Read Command
                    </button>
                    <button
                        onClick={generateWriteCommand}
                        style={{
                            padding: "6px 12px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Generate Write Command
                    </button>
                </div>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {regDef.bits.map((bitDef, idx) => {
                    const bit = bitDef.bit !== undefined ? bitDef.bit : bitDef.bits;
                    const isReadOnly = bitDef.type.includes('RO');
                    
                    return (
                        <BitField
                            key={idx}
                            bit={bit}
                            bitDef={bitDef}
                            value={currentValue}
                            onBitToggle={handleBitToggle}
                            isReadOnly={isReadOnly}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function PHYRegisterPanel() {
    const [selectedPage, setSelectedPage] = useState(0);
    const [selectedRegister, setSelectedRegister] = useState(0x00);
    const [registerValues, setRegisterValues] = useState({});
    const [generatedCommand, setGeneratedCommand] = useState('');
    const [readResult, setReadResult] = useState('');

    const currentValue = registerValues[`${selectedPage}_${selectedRegister.toString(16)}`] || 0;

    const setCurrentValue = (value) => {
        setRegisterValues(prev => ({
            ...prev,
            [`${selectedPage}_${selectedRegister.toString(16)}`]: value
        }));
    };

    const handleGenerateCommand = (command) => {
        setGeneratedCommand(command);
        
        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    const copyCommand = () => {
        navigator.clipboard.writeText(generatedCommand);
    };

    const parseReadResult = () => {
        if (!readResult.trim()) return;
        
        try {
            const value = toWord(readResult.trim());
            setCurrentValue(value);
        } catch (e) {
            alert('Invalid hex value format');
        }
    };

    const currentPageData = PHY_REGISTERS[selectedPage];
    const currentRegisterData = currentPageData?.registers[selectedRegister];

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", color: "#1f2937", marginBottom: "24px" }}>
                🔧 88E6321 PHY Register Utility
            </h2>

            {/* Page Selection */}
            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "8px", color: "#374151" }}>Select Page:</h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {Object.entries(PHY_REGISTERS).map(([pageNum, pageData]) => (
                        <button
                            key={pageNum}
                            onClick={() => {
                                setSelectedPage(parseInt(pageNum));
                                setSelectedRegister(Object.keys(pageData.registers)[0]);
                            }}
                            style={{
                                padding: "8px 16px",
                                background: selectedPage === parseInt(pageNum) ? "#3b82f6" : "#f3f4f6",
                                color: selectedPage === parseInt(pageNum) ? "white" : "#374151",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                        >
                            Page {pageNum}
                        </button>
                    ))}
                </div>
                {currentPageData && (
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                        {currentPageData.name}
                    </p>
                )}
            </div>

            {/* Register Selection */}
            {currentPageData && (
                <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ marginBottom: "8px", color: "#374151" }}>Select Register:</h3>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {Object.entries(currentPageData.registers).map(([regAddr, regData]) => (
                            <button
                                key={regAddr}
                                onClick={() => setSelectedRegister(parseInt(regAddr))}
                                style={{
                                    padding: "6px 12px",
                                    background: selectedRegister === parseInt(regAddr) ? "#10b981" : "#f3f4f6",
                                    color: selectedRegister === parseInt(regAddr) ? "white" : "#374151",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "11px"
                                }}
                            >
                                0x{parseInt(regAddr).toString(16).toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Register Details */}
            {currentRegisterData && (
                <RegisterView
                    pageNum={selectedPage}
                    regAddr={selectedRegister}
                    regDef={currentRegisterData}
                    currentValue={currentValue}
                    onValueChange={setCurrentValue}
                    onGenerateCommand={handleGenerateCommand}
                />
            )}

            {/* Generated Command Section */}
            {generatedCommand && (
                <div style={{ marginTop: "20px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px" }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "#374151" }}>Generated MII Commands:</h3>
                    <pre style={{
                        background: "#1e1e1e",
                        color: "#00c853",
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        overflow: "auto"
                    }}>
                        {generatedCommand}
                    </pre>
                    <button
                        onClick={copyCommand}
                        style={{
                            marginTop: "8px",
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Copy Commands
                    </button>
                </div>
            )}

            {/* Read Result Parser */}
            <div style={{ marginTop: "20px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px" }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#374151" }}>Parse Read Result:</h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Paste MII read result (e.g., 0x1234)"
                        value={readResult}
                        onChange={(e) => setReadResult(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontFamily: "monospace"
                        }}
                    />
                    <button
                        onClick={parseReadResult}
                        style={{
                            padding: "8px 16px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Parse & Update
                    </button>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                    Paste the hex result from your MII read command to automatically decode the register bits
                </p>
            </div>
        </div>
    );
}

export default PHYRegisterPanel;