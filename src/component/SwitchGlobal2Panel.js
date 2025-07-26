import React, { useState, useMemo, useEffect } from 'react';

// Switch Global2 Register definitions based on Marvell 88E6321/88E6320 Switch Global 2 Registers Mapping
const GLOBAL2_REGISTERS = {
    0x00: {
        name: "Interrupt Source Register",
        bits: [
            { bit: 15, name: "WatchDog Int", type: "RO", desc: "WatchDog interrupt" },
            { bit: 14, name: "JamLimit", type: "ROC", desc: "Jam Limit interrupt" },
            { bit: 13, name: "Duplex Mismatch", type: "ROC", desc: "Duplex Mismatch interrupt" },
            { bit: 12, name: "WakeEvent", type: "RO", desc: "Wake Event interrupt" },
            { bits: "11:5", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "4:3", name: "PHYInt", type: "RO", desc: "PHY layer core interrupt bit" },
            { bit: 2, name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "1:0", name: "SERDES Int", type: "RO", desc: "SERDES layer core interrupt bit" }
        ]
    },
    0x01: {
        name: "Interrupt Mask Register",
        bits: [
            { bit: 15, name: "WatchDog IntEn", type: "RWR", desc: "WatchDog interrupt enable" },
            { bit: 14, name: "JamLimitEn", type: "ROC", desc: "Jam Limit interrupt enable" },
            { bit: 13, name: "Duplex Mismatch Error", type: "RWR", desc: "Duplex Mismatch interrupt enable" },
            { bit: 12, name: "WakeEventEn", type: "RWR", desc: "Wake Event interrupt enable" },
            { bits: "11:5", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "4:3", name: "PHYIntEn", type: "RWR", desc: "PHY layer core interrupt enable bit" },
            { bit: 2, name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "1:0", name: "SERDES IntEn", type: "RWR", desc: "SERDES layer core interrupt enable bit" }
        ]
    },
    0x02: {
        name: "MGMT Enable Register 2x",
        bits: [
            { bits: "15:0", name: "Rsvd2CPU Enables 2x", type: "RWS", desc: "Reserved DA Enables 2x. Form: 01:80:C2:00:00:2x where x maps to bit position" }
        ]
    },
    0x03: {
        name: "MGMT Enable Register 0x",
        bits: [
            { bits: "15:0", name: "Rsvd2CPU Enables 0x", type: "RWS", desc: "Reserved DA Enables 0x. Form: 01:80:C2:00:00:0x where x maps to bit position" }
        ]
    },
    0x04: {
        name: "Flow Control Delay Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update FC Delay Time data" },
            { bits: "14:13", name: "SPD", type: "RWR", desc: "Speed Number (00=10M, 01=100M, 10=1000M)" },
            { bits: "12:0", name: "FC Delay Time", type: "RWS", desc: "Flow Control Delay Time" }
        ]
    },
    0x05: {
        name: "Switch Management Register",
        bits: [
            { bit: 15, name: "Loopback Filter", type: "RWR", desc: "Loopback filter" },
            { bit: 14, name: "Reserved", type: "RES", desc: "Reserved" },
            { bit: 13, name: "Flow Control Message", type: "RWR", desc: "Enable Flow Control Messages" },
            { bit: 12, name: "FloodBC", type: "RWR", desc: "Flood Broadcast" },
            { bit: 11, name: "Remove 1PTag", type: "RWR", desc: "Remove One Provider Tag" },
            { bit: 10, name: "ATUAge IntEn", type: "RWS", desc: "ATU Age Violation Interrupt Enable" },
            { bit: 9, name: "Tag Flow Control", type: "RWR", desc: "Use and generate source port Flow Control" },
            { bit: 8, name: "Reserved", type: "RES", desc: "Reserved" },
            { bit: 7, name: "ForceFlowControlPri", type: "RWS", desc: "Force Flow Control Priority" },
            { bits: "6:4", name: "FC Pri", type: "RWS", desc: "Flow Control Priority" },
            { bit: 3, name: "Rsvd2CPU", type: "RWR", desc: "Reserved multicast frames to CPU" },
            { bits: "2:0", name: "MGMT Pri", type: "RWS", desc: "MGMT Priority" }
        ]
    },
    0x06: {
        name: "Device Mapping Table Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Target Device Routing data" },
            { bits: "14:13", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "12:8", name: "Trg_Dev Value", type: "RWR", desc: "Target Device Value" },
            { bits: "7:4", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "3:0", name: "Trg_Dev Port", type: "RWS", desc: "Target Device Port number" }
        ]
    },
    0x07: {
        name: "Trunk Mask Table Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Trunk Mask data" },
            { bits: "14:12", name: "MaskNum", type: "RWR", desc: "Mask Number (0-7)" },
            { bit: 11, name: "HashTrunk", type: "RWR", desc: "Hash DA & SA for TrunkMask selection" },
            { bits: "10:7", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "6:0", name: "TrunkMask", type: "RWS", desc: "Trunk Mask bits" }
        ]
    },
    0x08: {
        name: "Trunk Mapping Table Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Trunk Routing data" },
            { bits: "14:11", name: "Trunk ID", type: "RWR", desc: "Trunk Identifier (0-15)" },
            { bits: "10:7", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "6:0", name: "TrunkMap", type: "RWR", desc: "Trunk Map bits" }
        ]
    },
    0x09: {
        name: "Ingress Rate Command Register",
        bits: [
            { bit: 15, name: "IRLBusy", type: "SC", desc: "Ingress Rate Limit unit Busy" },
            { bits: "14:12", name: "IRLOp", type: "RWR", desc: "Ingress Rate Limit unit Opcode. 000=No Operation, 001=Init all resources, 010=Init selected resource, 011=Write to selected resource/register, 100=Read selected resource/register, 101-111=Reserved" },
            { bits: "11:8", name: "IRLPort", type: "RWR", desc: "Ingress rate limiting port" },
            { bits: "7:5", name: "IRLRes", type: "RWR", desc: "Ingress rate limit resource" },
            { bit: 4, name: "Reserved", type: "RWR", desc: "Reserved" },
            { bits: "3:0", name: "IRLReg", type: "RWR", desc: "Ingress Rate Limit register" }
        ]
    },
    0x0A: {
        name: "Ingress Rate Data Register",
        bits: [
            { bits: "15:0", name: "IRLData", type: "RWR", desc: "Ingress Rate Limit Data" }
        ]
    },
    0x0B: {
        name: "Cross-chip Port VLAN Register",
        bits: [
            { bit: 15, name: "PVTBusy", type: "SC", desc: "Port VLAN Table Busy" },
            { bits: "14:12", name: "PVTOp", type: "RWR", desc: "Port VLAN Table Opcode. 000=No Operation, 001=Init PVT Table to all ones, 010=Reserved, 011=Write PVLAN Data, 100=Read selected register, 101-111=Reserved" },
            { bits: "11:9", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "8:0", name: "Pointer", type: "RWR", desc: "Pointer to desired entry (0-511)" }
        ]
    },
    0x0C: {
        name: "Cross-chip Port VLAN Data Register",
        bits: [
            { bits: "15:7", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "6:0", name: "PVLAN Data", type: "RWS", desc: "Cross-chip Port VLAN Data bit mask" }
        ]
    },
    0x0D: {
        name: "Switch MAC/WoL/WoF Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data" },
            { bits: "14:13", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "12:8", name: "Pointer", type: "RWR", desc: "Pointer to desired octet. 0x00-0x05: Switch MAC register space, 0x06-0x0B: Reserved, 0x0C-0x0F: Wake on Frame (WoF) register space, 0x10-0x1F: Wake on LAN (WoL) register space" },
            { bits: "7:0", name: "Data", type: "RWR", desc: "Octet Data" }
        ]
    },
    0x0E: {
        name: "ATU Stats Register",
        bits: [
            { bits: "15:14", name: "Bin", type: "RWR", desc: "Bin selector bits (0-3)" },
            { bits: "13:12", name: "CountMode", type: "RWR", desc: "Bin Counter Mode. 00=Count all valid entries, 01=Count all valid non-static entries only, 10=Count all valid entries in defined FID only, 11=Count all valid non-static entries in defined FID only" },
            { bits: "11:0", name: "ActiveBin Ctr", type: "RO", desc: "Active ATU Bin Entry Counter" }
        ]
    },
    0x0F: {
        name: "Priority Override Table",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data" },
            { bits: "14:13", name: "Reserved", type: "RES", desc: "Reserved" },
            { bit: 12, name: "FPriSet", type: "RWR", desc: "When 0=QPri access, When 1=FPri access" },
            { bits: "11:8", name: "Pointer", type: "RWT", desc: "Pointer to desired entry (0-15)" },
            { bit: 7, name: "QpriAvbEn", type: "RWR", desc: "QpriAvb override enable" },
            { bit: 6, name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "5:4", name: "DataAvb", type: "RWR", desc: "Queue Priority Override Data for AVB ports" },
            { bit: 3, name: "QPriEn/FPriEn", type: "RWR", desc: "QPri/FPri enable" },
            { bits: "2:0", name: "Data", type: "RWR", desc: "Priority Override Data" }
        ]
    },
    0x14: {
        name: "EEPROM Command",
        bits: [
            { bit: 15, name: "EEBusy", type: "SC", desc: "EEPROM Unit Busy" },
            { bits: "14:12", name: "EEOp", type: "RWR", desc: "EEPROM Opcode. 000=No Operation, 001=Reserved, 010=Reserved, 011=Write EEPROM, 100=Read EEPROM, 101=Reserved, 110=Restart Register Load execution, 111=Reserved" },
            { bit: 11, name: "Running", type: "RO", desc: "Register Loader Running" },
            { bit: 10, name: "WriteEn", type: "RO", desc: "EEPROM Write Enable" },
            { bits: "9:8", name: "Reserved", type: "RES", desc: "Reserved" },
            { bits: "7:0", name: "Addr", type: "RWR", desc: "EEPROM Address" }
        ]
    },
    0x15: {
        name: "EEPROM Data",
        bits: [
            { bits: "15:0", name: "Data", type: "RWR", desc: "EEPROM data" }
        ]
    },
    0x16: {
        name: "AVB Command Register",
        bits: [
            { bit: 15, name: "AVBBusy", type: "SC", desc: "AVB unit Busy" },
            { bits: "14:12", name: "AVBOp", type: "RWR", desc: "AVB unit Operation code. 000=No Operation, 001=Reserved, 010=Reserved, 011=Write to register, 100=Read from register, 101=Reserved, 110=Read with post increment, 111=Reserved" },
            { bits: "11:8", name: "AVBPort", type: "RWR", desc: "Physical port (0xF=Global, 0xE=TAI Global)" },
            { bits: "7:5", name: "AVBBlock", type: "RWR", desc: "Block selection. 0x0=PTP register space, 0x1=AVB Policy register space, 0x2=Qav register space, 0x3-0x7=Reserved" },
            { bits: "4:0", name: "AVBAddr", type: "RWR", desc: "Address bits for register operation" }
        ]
    },
    0x17: {
        name: "AVB Data Register",
        bits: [
            { bits: "15:0", name: "AVBData", type: "RWR", desc: "AVB Data bits" }
        ]
    },
    0x18: {
        name: "SMI PHY Command Register",
        bits: [
            { bit: 15, name: "SMIBusy", type: "SC", desc: "SMI PHY Unit Busy" },
            { bits: "14:13", name: "Reserved", type: "RES", desc: "Reserved" },
            { bit: 12, name: "SMIMode", type: "RWR", desc: "SMI PHY Mode (0=Clause 45, 1=Clause 22)" },
            { bits: "11:10", name: "SMIOp", type: "RWR", desc: "SMI PHY Opcode" },
            { bits: "9:5", name: "DevAddr", type: "RWR", desc: "SMI PHY Device Address" },
            { bits: "4:0", name: "RegAddr", type: "RWR", desc: "SMI PHY Register Address" }
        ]
    },
    0x19: {
        name: "SMI PHY Data Register",
        bits: [
            { bits: "15:0", name: "SMIData", type: "RWR", desc: "SMI PHY Data register" }
        ]
    },
    0x1A: {
        name: "Scratch and Misc. Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data" },
            { bits: "14:8", name: "Pointer", type: "RWR", desc: "Pointer to desired octet. 0x00-0x01: Scratch Bytes, 0x02-0x0A: Reserved, 0x0B-0x0F: EEE register space, 0x10-0x1F: Reserved, 0x20-0x3F: GPIO Port Stall Vectors, 0x60-0x6F: GPIO registers data and configuration, 0x70-0x7F: CONFIG reads" },
            { bits: "7:0", name: "Data", type: "RWR", desc: "Scratch and Misc. Control data" }
        ]
    },
    0x1B: {
        name: "Watch Dog Control Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data" },
            { bits: "14:8", name: "Pointer", type: "RWR", desc: "Pointer to desired octet. 0x00: Watch Dog Interrupt Source, 0x10-0x13: Data Path Watch Dog Interrupts, Masks, Events & History, 0x40: Auto Fixing Enables" },
            { bits: "7:0", name: "Data", type: "RWR", desc: "Watch Dog Control data" }
        ]
    },
    0x1C: {
        name: "QoS Weights Register",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data. When this bit is set to a one the data written to bits 7:0 will be loaded into the QoS Weights octet register selected by the Pointer bits below. After the write has taken place this bit self clears to zero." },
            { bit: 14, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "13:8", name: "Pointer", type: "RWR", desc: "Pointer to desired octet of QoS Weights. These bits select one of 32 possible QoS Weight Data registers and the QoS Weight Length register for both read and write operations. A write operation occurs if the Update bit is a one. Otherwise a read operation occurs." },
            { bits: "7:0", name: "Data", type: "RWS", desc: "Octet Data of the programmable QoS Weight table. 33 QoS Weight registers are accessed by using the Pointer bits above as follows: 0x00 to 0x1F = QoS Weight Table Data, 0x20 = QoS Weight Table Length." }
        ]
    },
    0x1D: {
        name: "Misc Register",
        bits: [
            { bit: 15, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 14, name: "5 Bit Port", type: "RWR", desc: "Use 5 bits for Port data in the Port VLAN Table (PVT). When this bit is set to a one the 9 bits used to access the PVT memory is: Addr[8:5] = Source Device[3:0] or Device Number[3:0], Addr[4:0] = Source Port/Trunk[4:0]. When this bit is cleared to a zero the 9 bits used to access the PVT memory is: Addr[8:4] = Source Device[4:0] or Device Number[4:0], Addr[3:0] = Source Port/Trunk[3:0]" },
            { bit: 13, name: "NoEgr Policy", type: "RWR", desc: "No Egress Policy. When this bit is set to a one Egress 802.1Q Secure and Check discards are not performed. This mode allows a non-802.1Q enabled port to send a frame to an 802.1Q enabled port that is configured in the Secure or Check 802.1Q mode. When this bit is cleared to zero and the Egress port's 802.1Q mode is Secure or Check the VID assigned to all frames mapped to this port must be found in the VTU or the frame will not be allowed to egress this port." },
            { bits: "12:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x1F: {
        name: "Misc Register (Cut Through)",
        bits: [
            { bits: "15:13", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "12:8", name: "Cut Through Hold", type: "RWR", desc: "Cut Through Burst Hold amount (88E6321 only). To support bursts of frames in Cut Through mode, once a Cut Through connection is made between ports, the Cut Through connection needs to be held beyond the end of each transmitted frame. This hold time keeps the last Cut Through connection active until the next ingressing frame can be processed to see if it is also to be Cut Through. The Cut Through Hold register determines the number of octets a Cut Through connection is held after the last bytes of a frame's CRC is transmitted. The default value of 0x00 breaks the connection right away. A value of 0x16 (22 decimal) will hold the connection for a 96-bit IFG + 64-bit Preamble with 2 bytes of pad in case the IFG expanded due to PPM clock differences." },
            { bits: "7:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    }
};

// localStorage helpers for Global2 registers
const STORAGE_KEYS = {
    selectedRegister: 'switchGlobal2_selectedRegister',
    registerValues: 'switchGlobal2_registerValues'
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

// BitField component for individual bit manipulation
function BitField({ bit, bitDef, value, onBitToggle, onBitRangeChange, isReadOnly }) {
    const isBitRange = typeof bit === 'string' && bit.includes(':');
    
    if (isBitRange) {
        const [highBit, lowBit] = bit.split(':').map(Number);
        const mask = ((1 << (highBit - lowBit + 1)) - 1) << lowBit;
        const currentBits = (value & mask) >>> lowBit;
        const maxValue = (1 << (highBit - lowBit + 1)) - 1;
        
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 8px",
                margin: "2px 0",
                background: isReadOnly ? "#f9fafb" : "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                fontSize: "12px"
            }}>
                <div style={{ minWidth: "60px", fontWeight: "600", color: "#374151" }}>
                    [{bit}]
                </div>
                <div style={{ minWidth: "120px", marginRight: "8px", color: "#1f2937" }}>
                    {bitDef.name}
                </div>
                <div style={{ minWidth: "60px", marginRight: "8px" }}>
                    <input
                        type="number"
                        min="0"
                        max={maxValue}
                        value={currentBits}
                        onChange={(e) => onBitRangeChange(highBit, lowBit, parseInt(e.target.value) || 0)}
                        disabled={isReadOnly}
                        style={{
                            width: "50px",
                            padding: "2px 4px",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            fontSize: "11px",
                            background: isReadOnly ? "#f3f4f6" : "white"
                        }}
                    />
                </div>
                <div style={{ 
                    minWidth: "50px", 
                    fontFamily: "monospace", 
                    marginRight: "8px",
                    color: "#6b7280"
                }}>
                    0x{currentBits.toString(16).toUpperCase()}
                </div>
                <div style={{ 
                    minWidth: "100px", 
                    fontFamily: "monospace", 
                    marginRight: "8px",
                    color: "#6b7280"
                }}>
                    {currentBits.toString(2).padStart(highBit - lowBit + 1, '0')}
                </div>
                <div style={{ fontSize: "10px", color: "#6b7280", flex: 1 }}>
                    {bitDef.desc} [{bitDef.type}]
                </div>
            </div>
        );
    } else {
        const bitNum = parseInt(bit);
        const currentBit = (value >>> bitNum) & 1;
        
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 8px",
                margin: "2px 0",
                background: isReadOnly ? "#f9fafb" : "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                fontSize: "12px"
            }}>
                <div style={{ minWidth: "60px", fontWeight: "600", color: "#374151" }}>
                    [{bitNum}]
                </div>
                <div style={{ minWidth: "120px", marginRight: "8px", color: "#1f2937" }}>
                    {bitDef.name}
                </div>
                <div style={{ minWidth: "60px", marginRight: "8px" }}>
                    <button
                        onClick={() => onBitToggle(bitNum)}
                        disabled={isReadOnly}
                        style={{
                            width: "40px",
                            height: "24px",
                            background: currentBit ? "#10b981" : "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: isReadOnly ? "not-allowed" : "pointer",
                            fontSize: "10px",
                            opacity: isReadOnly ? 0.5 : 1
                        }}
                    >
                        {currentBit}
                    </button>
                </div>
                <div style={{ 
                    minWidth: "50px", 
                    fontFamily: "monospace", 
                    marginRight: "8px",
                    color: "#6b7280"
                }}>
                    {currentBit ? "0x1" : "0x0"}
                </div>
                <div style={{ 
                    minWidth: "100px", 
                    fontFamily: "monospace", 
                    marginRight: "8px",
                    color: "#6b7280"
                }}>
                    {currentBit}
                </div>
                <div style={{ fontSize: "10px", color: "#6b7280", flex: 1 }}>
                    {bitDef.desc} [{bitDef.type}]
                </div>
            </div>
        );
    }
}

// Individual register component
function Global2RegisterCard({ regAddr, regDef, currentValue, onValueChange }) {
    const handleBitToggle = (bitNum) => {
        const newValue = currentValue ^ (1 << bitNum);
        onValueChange(newValue);
    };

    const handleBitRangeChange = (highBit, lowBit, newBits) => {
        const mask = ((1 << (highBit - lowBit + 1)) - 1) << lowBit;
        const clearedValue = currentValue & ~mask;
        const newValue = clearedValue | ((newBits & ((1 << (highBit - lowBit + 1)) - 1)) << lowBit);
        onValueChange(newValue);
    };

    const handleManualValueChange = (e) => {
        const input = e.target.value;
        let newValue;
        
        if (input.startsWith('0x') || input.startsWith('0X')) {
            newValue = parseInt(input.slice(2), 16);
        } else if (/^[0-9a-fA-F]+$/.test(input)) {
            newValue = parseInt(input, 16);
        } else {
            newValue = parseInt(input, 10);
        }
        
        if (!isNaN(newValue)) {
            onValueChange(newValue & 0xFFFF);
        }
    };

    const generateReadCommand = () => {
        const command = `mii read 0x1c 0x${regAddr.toString(16).padStart(2, '0')}`;
        navigator.clipboard.writeText(command);
        
        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    const generateWriteCommand = () => {
        const command = `mii write 0x1c 0x${regAddr.toString(16).padStart(2, '0')} 0x${currentValue.toString(16).padStart(4, '0').toUpperCase()}`;
        navigator.clipboard.writeText(command);
        
        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    return (
        <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px", margin: "8px 0" }}>
            <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#1f2937" }}>
                    Global2 Register 0x{regAddr.toString(16).toUpperCase()} ({regAddr}) - {regDef.name}
                </h4>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                    MII Address: 0x1C | Global2 registers use direct MII access to address 0x1C
                </div>
                
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
                    const isReadOnly = bitDef.type.includes('RO') || bitDef.type.includes('RES');
                    
                    return (
                        <BitField
                            key={idx}
                            bit={bit}
                            bitDef={bitDef}
                            value={currentValue}
                            onBitToggle={handleBitToggle}
                            onBitRangeChange={handleBitRangeChange}
                            isReadOnly={isReadOnly}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function SwitchGlobal2Panel() {
    // Initialize state from localStorage
    const [selectedRegister, setSelectedRegister] = useState(() => loadFromStorage(STORAGE_KEYS.selectedRegister, 0x00));
    const [registerValues, setRegisterValues] = useState(() => loadFromStorage(STORAGE_KEYS.registerValues, {}));
    const [generatedCommand, setGeneratedCommand] = useState('');
    const [readResult, setReadResult] = useState('');

    const currentValue = registerValues[selectedRegister.toString(16)] || 0;

    // Save state to localStorage whenever it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedRegister, selectedRegister);
    }, [selectedRegister]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.registerValues, registerValues);
    }, [registerValues]);

    const handleValueChange = (newValue) => {
        setRegisterValues(prev => ({
            ...prev,
            [selectedRegister.toString(16)]: newValue & 0xFFFF
        }));
    };

    const availableRegisters = Object.keys(GLOBAL2_REGISTERS).map(addr => parseInt(addr));

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
            <div style={{ 
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", 
                color: "white", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                textAlign: "center"
            }}>
                <h2 style={{ margin: "0 0 8px 0" }}>🌐 Switch Global2 Registers</h2>
                <p style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}>
                    Global2 registers are accessed directly via MII address 0x1C. These control advanced switch functionality including interrupts, management, and GPIO.
                </p>
            </div>

            {/* Register Selection */}
            <div style={{ 
                background: "#f8fafc", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                border: "1px solid #e2e8f0"
            }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#1f2937" }}>📋 Register Selection</h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                        Select Register:
                    </label>
                    <select
                        value={selectedRegister}
                        onChange={(e) => setSelectedRegister(parseInt(e.target.value))}
                        style={{
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontFamily: "monospace",
                            background: "white"
                        }}
                    >
                        {availableRegisters.map(addr => (
                            <option key={addr} value={addr}>
                                0x{addr.toString(16).padStart(2, '0').toUpperCase()} - {GLOBAL2_REGISTERS[addr].name}
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Global2 MII Address: 0x1C (Fixed for all registers)
                    </div>
                </div>
            </div>

            {/* Command Generation */}
            <div style={{ 
                background: "#f0fdf4", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                border: "1px solid #bbf7d0"
            }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#166534" }}>⚡ Quick Commands</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
                    <div>
                        <h4 style={{ margin: "0 0 8px 0", color: "#166534" }}>Read Command:</h4>
                        <div style={{ 
                            background: "#1e1e1e", 
                            color: "#00c853", 
                            padding: "8px", 
                            borderRadius: "4px", 
                            fontFamily: "monospace", 
                            fontSize: "12px" 
                        }}>
                            mii read 0x1c 0x{selectedRegister.toString(16).padStart(2, '0')}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ margin: "0 0 8px 0", color: "#166534" }}>Write Command:</h4>
                        <div style={{ 
                            background: "#1e1e1e", 
                            color: "#00c853", 
                            padding: "8px", 
                            borderRadius: "4px", 
                            fontFamily: "monospace", 
                            fontSize: "12px" 
                        }}>
                            mii write 0x1c 0x{selectedRegister.toString(16).padStart(2, '0')} 0x{currentValue.toString(16).padStart(4, '0').toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Details */}
            <Global2RegisterCard
                regAddr={selectedRegister}
                regDef={GLOBAL2_REGISTERS[selectedRegister]}
                currentValue={currentValue}
                onValueChange={handleValueChange}
            />

            {/* Register Summary */}
            <div style={{ 
                background: "#fef3c7", 
                padding: "16px", 
                borderRadius: "8px", 
                marginTop: "16px",
                border: "1px solid #fbbf24"
            }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#92400e" }}>📊 Register Summary</h3>
                <div style={{ fontSize: "12px", color: "#92400e" }}>
                    <strong>Total Global2 Registers:</strong> {Object.keys(GLOBAL2_REGISTERS).length}<br/>
                    <strong>Current Register:</strong> 0x{selectedRegister.toString(16).toUpperCase()} - {GLOBAL2_REGISTERS[selectedRegister].name}<br/>
                    <strong>Current Value:</strong> 0x{currentValue.toString(16).padStart(4, '0').toUpperCase()} ({currentValue})<br/>
                    <strong>MII Address:</strong> 0x1C (Global2 access point)
                </div>
            </div>
        </div>
    );
}

export default SwitchGlobal2Panel;