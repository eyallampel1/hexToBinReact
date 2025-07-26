import React, { useState, useMemo, useEffect } from 'react';

// Switch Register definitions based on switch_registers_without_global.pdf
const SWITCH_REGISTERS = {
    0x00: {
        name: "Port Status Register",
        bits: [
            { bit: 15, name: "PauseEn", type: "RO", desc: "Pause enabled bit indicates full-duplex flow control" },
            { bit: 14, name: "MyPause", type: "RO", desc: "My Pause bit sent to PHY during PHY Polling Unit initialization" },
            { bit: 13, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 12, name: "PHYDetect", type: "RWR", desc: "802.3 PHY Detected. Set if PPU finds a non-all-one's value" },
            { bit: 11, name: "Link", type: "RO", desc: "Link Status. 0=Link down, 1=Link up" },
            { bit: 10, name: "Duplex", type: "RO", desc: "Duplex mode. 0=Half-duplex, 1=Full-duplex" },
            { bits: "9:8", name: "Speed", type: "RO", desc: "Speed mode. 00=10Mbps, 01=100/200Mbps, 10=1000Mbps, 11=Reserved" },
            { bit: 7, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 6, name: "EEE Enabled", type: "RO", desc: "EEE (Energy Efficient Ethernet) Enabled from PHY" },
            { bit: 5, name: "TxPaused", type: "RO", desc: "Transmitter Paused. Set when Rx MAC receives Pause frame" },
            { bit: 4, name: "FlowCtrl", type: "RO", desc: "Flow Control. Set when Rx MAC determines no more data should enter" },
            { bits: "3:0", name: "C_Mode", type: "RO or RW", desc: "Config Mode. Current interface type configuration mode" }
        ]
    },
    0x01: {
        name: "Physical Control Register",
        bits: [
            { bit: 15, name: "RGMII Rx Timing", type: "RWR", desc: "RGMII Receive Timing Control. Changes disruptive to normal operation" },
            { bit: 14, name: "RGMII Tx Timing", type: "RWR", desc: "RGMII Transmit Timing Control. Changes disruptive to normal operation" },
            { bit: 13, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 12, name: "200BASE", type: "RWR", desc: "200 BASE Mode. For Port2,5,6 when C_Mode is 0x0 or 0x1" },
            { bit: 11, name: "MII PHY", type: "RWR", desc: "MII PHY Mode. Configure for connection to MAC device or PHY" },
            { bits: "10:8", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 7, name: "FCValue", type: "RWR", desc: "Flow Control's Forced value. Force flow control when enabled" },
            { bit: 6, name: "ForcedFC", type: "RWR", desc: "Force Flow Control. Enable forced flow control" },
            { bit: 5, name: "LinkValue", type: "RWR", desc: "Link's Forced value. Force link up or down" },
            { bit: 4, name: "ForcedLink", type: "RWR", desc: "Force Link. Enable forced link state" },
            { bit: 3, name: "DpxValue", type: "RWR", desc: "Duplex's Forced value. Force full or half-duplex" },
            { bit: 2, name: "ForcedDpx", type: "RWR", desc: "Force Duplex. Enable forced duplex mode" },
            { bits: "1:0", name: "ForceSpd", type: "RWS to 0x3", desc: "Force Speed. 00=10Mbps, 01=100/200Mbps, 10=1000Mbps, 11=Reserved" }
        ]
    },
    0x02: {
        name: "Jamming Control Register",
        bits: [
            { bits: "15:8", name: "LimitOut", type: "RWS To 0xFF", desc: "Limit the number of continuous Pause refresh frames transmitted" },
            { bits: "7:0", name: "LimitIn", type: "RWR", desc: "Limit the number of continuous Pause refresh frames received" }
        ]
    },
    0x03: {
        name: "Switch Identifier Register",
        bits: [
            { bits: "15:4", name: "Product Num", type: "RO", desc: "Product Number or identifier. 88E6321=0x310, 88E6320=0x115" },
            { bits: "3:0", name: "Rev", type: "RO", desc: "Revision Identifier. Initial version has Rev of 0x0" }
        ]
    },
    0x04: {
        name: "Port Control Register",
        bits: [
            { bits: "15:14", name: "SA Filtering", type: "RWR", desc: "Source Address Filtering controls. 00=Disabled, 01=Drop On Lock, 10=Drop On Unlock, 11=Drop to CPU" },
            { bits: "13:12", name: "Egress Mode", type: "RWR", desc: "Egress Mode determines frame look when egressing. Frame Mode bits control effect" },
            { bit: 11, name: "Header", type: "RWR", desc: "Ingress & Egress Header Mode. Enable Marvell 2-byte Egress Header" },
            { bit: 10, name: "IGMP/MLD Snoop", type: "RWR", desc: "IGMP and MLD Snooping. Enable frame switching to CPU" },
            { bits: "9:8", name: "Frame Mode", type: "RWR", desc: "Frame Mode defines expected Ingress and Egress tagging format. 00=Normal, 01=DSA, 10=Provider, 11=Ether Type DSA" },
            { bit: 7, name: "VLAN Tunnel", type: "RWR", desc: "VLAN Tunnel. Clear to zero for port based VLANs" },
            { bit: 6, name: "TagIfBoth", type: "RWS", desc: "Use Tag information for initial QPri assignment if frame is both tagged and IPv4/IPv6" },
            { bits: "5:4", name: "InitialPri", type: "RWS to 0x3", desc: "Initial Priority assignment. Frame Priority and Queue Priority" },
            { bits: "3:2", name: "Egress Floods", type: "RWS to 0x3", desc: "Egress Flooding mode. DA search in ATU for frame destination" },
            { bits: "1:0", name: "PortState", type: "RWR", desc: "Port State. 00=Disabled, 01=Blocking/Listening, 10=Learning, 11=Forwarding" }
        ]
    },
    0x05: {
        name: "Port Control 1",
        bits: [
            { bit: 15, name: "Message Port", type: "RWR", desc: "Message Port. Enable generation of learning message frames" },
            { bit: 14, name: "Trunk Port", type: "RWR", desc: "Trunk Port. Consider port as member of a Trunk" },
            { bits: "13:12", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "11:8", name: "Trunk ID", type: "RWR", desc: "Trunk ID. Define which trunk this port is associated with" },
            { bits: "7:0", name: "FID", type: "RWR", desc: "Port's Default Filtering Information Database (FID) bits 11:4" }
        ]
    },
    0x06: {
        name: "Port Based VLAN Map",
        bits: [
            { bits: "15:12", name: "FID[3:0]", type: "RWR", desc: "Port's Default Filtering Information Database (FID) bits 3:0" },
            { bit: 11, name: "ForceMap", type: "RWR", desc: "Force Mapping. All received frames considered MGMT and mapped to port" },
            { bits: "10:7", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "6:0", name: "VLANTable", type: "RWS to all ones", desc: "In Chip Port based VLAN Table. Restrict output ports for frames" }
        ]
    },
    0x07: {
        name: "Default Port VLAN ID & Priority",
        bits: [
            { bits: "15:13", name: "DefPri", type: "RWR", desc: "Default Frame Priority. Default ingress priority when no priority info available" },
            { bit: 12, name: "Force DefaultVID", type: "RWR", desc: "Force to use Default VID when 802.1Q is enabled" },
            { bits: "11:0", name: "DefaultVID", type: "RWS to 0x001", desc: "Default VLAN Identifier for IEEE Tagged VID" }
        ]
    },
    0x08: {
        name: "Port Control 2 Register",
        bits: [
            { bit: 15, name: "ForceGoodFCS", type: "RWR", desc: "Force good FCS in frame. Overwrite with good CRC" },
            { bit: 14, name: "AllowBadFCS", type: "RWR", desc: "Allow receiving frames with bad FCS. Disable CRC error discard" },
            { bits: "13:12", name: "Jumbo Mode", type: "RWS to 0x21", desc: "JumboMode bits determine maximum frame size (MTU) allowed. 0x0=1522, 0x1=2048, 0x2=10240, 0x3=Reserved" },
            { bits: "11:10", name: "802.1QMode", type: "RWR", desc: "IEEE 802.1Q Mode for port. Determine if 802.1Q based VLANs are used" },
            { bit: 9, name: "Discard Tagged", type: "RWR", desc: "Discard Tagged Frames. Discard all non-MGMT frames processed as tagged" },
            { bit: 8, name: "Discard Untagged", type: "RWR", desc: "Discard Untagged Frames. Discard all non-MGMT frames processed as untagged" },
            { bit: 7, name: "MapDA", type: "RWS", desc: "Map using DA hits. Use frame's DA to direct frame to correct ports" },
            { bit: 6, name: "ARP Mirror", type: "RWR", desc: "ARP Mirror enable. Mirror non-filtered Tagged/Untagged frames with Ethertype 0x0806" },
            { bit: 5, name: "Egress Monitor Source", type: "RWR", desc: "Egress Monitor Source Port. Enable egress monitoring" },
            { bit: 4, name: "Ingress Monitor Source", type: "RWR", desc: "Ingress Monitor Source Port. Enable ingress monitoring" },
            { bit: 3, name: "Use Def Qpri", type: "RWR", desc: "Use Default Queue Priority. Use port's DefQPri for initial Queue Priority assignment" },
            { bits: "2:1", name: "DefQPri", type: "RWR", desc: "Default Queue Priority. Port's default queue priority" },
            { bit: 0, name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x09: {
        name: "Egress Rate Control",
        bits: [
            { bits: "15:12", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "11:8", name: "Frame Overhead", type: "RWR", desc: "Egress Rate Frame Overhead adjustment. Compensate for protocol mismatch" },
            { bit: 7, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "6:0", name: "Egress Dec", type: "RWS 0x01", desc: "Egress Rate Decrement value. Determine egress rate counter decrement" }
        ]
    },
    0x0A: {
        name: "Egress Rate Control 2",
        bits: [
            { bits: "15:14", name: "Count Mode", type: "RWS to 0x2", desc: "Egress rate limiting count mode. 00=Frame based, 01=Layer 1 bytes, 10=Layer 2 bytes, 11=Layer 3 bytes" },
            { bits: "13:12", name: "Schedule", type: "RWR", desc: "Port's Scheduling mode. 00=Weighted round robin, 01=Strict priority 3 and weighted round robin for priorities 2,1,0" },
            { bits: "11:0", name: "Egress Rate", type: "RWR", desc: "Egress data rate shaping. Modify port's effective transmission rate" }
        ]
    },
    0x0B: {
        name: "Port Association Vector",
        bits: [
            { bit: 15, name: "HoldAt1", type: "RWR", desc: "Hold Aging ATU Entries at Entry State of 1. Prevent aging down" },
            { bit: 14, name: "IntOn AgeOut", type: "RWR", desc: "Interrupt on Age Out. Generate interrupt when aging is enabled" },
            { bit: 13, name: "LockedPort", type: "RWR", desc: "Locked Port. Enable CPU directed learning and disable automatic SA learning" },
            { bit: 12, name: "Ignore WrongData", type: "RWR", desc: "Ignore Wrong Data. Mask ATU Member Violation error" },
            { bit: 11, name: "Refresh Locked", type: "RWR", desc: "Auto Refresh known addressed when port is Locked" },
            { bits: "10:7", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "6:0", name: "PAV", type: "RWS to all zeros", desc: "Port Association Vector for ATU learning. Set up port trunking" }
        ]
    },
    0x0C: {
        name: "Port ATU Control",
        bits: [
            { bit: 15, name: "Read LearnCnt", type: "RWR", desc: "Read current number of 'active' unicast MAC addresses associated with port" },
            { bit: 14, name: "Limit Reached", type: "RO", desc: "Limit Reached. Set when port can no longer auto learn more MAC addresses" },
            { bit: 13, name: "OverLimit IntEn", type: "RWR", desc: "Over Limit Interrupt Enable. Generate ATU Miss Violation interrupt" },
            { bit: 12, name: "KeepOldLearnLimit", type: "RWR", desc: "Keep Old Learn Limit. Allow ReadLearnCnt bit to toggle without modifying LearnLimit" },
            { bits: "11:10", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "9:0", name: "LearnLimit/LearnCnt", type: "RWR/RO", desc: "Port's Auto Learning Limit or current Auto Learning count" }
        ]
    },
    0x0D: {
        name: "Priority Override Register",
        bits: [
            { bits: "15:14", name: "DAPri Override", type: "RWR", desc: "DA Priority Override. Enable frame priority override when DA ATU priority override occurs" },
            { bits: "13:12", name: "SAPri Override", type: "RWR", desc: "SA Priority Override. Enable frame priority override when SA ATU priority override occurs" },
            { bits: "11:10", name: "VTUPri Override", type: "RWR", desc: "VTU Priority Override. Enable frame priority override when determined VID results in VID with VIDPRIOverride" },
            { bit: 9, name: "Mirror SA Miss", type: "RWR", desc: "Mirror Source Address Misses to the MirrorDest port" },
            { bit: 8, name: "Mirror VTU Miss", type: "RWR", desc: "Mirror VLAN Identifier Misses to the MirrorDest port" },
            { bit: 7, name: "Trap DA Miss", type: "RWR", desc: "Trap Destination Address Misses to CPU" },
            { bit: 6, name: "Trap SA Miss", type: "RWR", desc: "Trap Source Address Misses to CPU" },
            { bit: 5, name: "Trap VTU Miss", type: "RWR", desc: "Trap VLAN Identifier Misses to CPU" },
            { bit: 4, name: "Trap TCAM Miss", type: "RWR", desc: "Trap TCAM Misses to CPU (88E6321 only)" },
            { bits: "3:2", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "1:0", name: "TCAM Mode", type: "RWR", desc: "TCAM Mode (88E6321 only). 00=TCAM disabled, 01=TCAM enabled for 48 byte searches only" }
        ]
    },
    0x0E: {
        name: "Policy Control Register",
        bits: [
            { bits: "15:14", name: "DA Policy", type: "RWR", desc: "DA Policy Mapping. Enable frame switching based on destination address policy" },
            { bits: "13:12", name: "SA Policy", type: "RWR", desc: "SA Policy Mapping. Enable frame switching based on source address policy" },
            { bits: "11:10", name: "VTU Policy", type: "RWR", desc: "VTU Policy Mapping. Enable frame switching based on VTU policy" },
            { bits: "9:8", name: "EType Policy", type: "RWR", desc: "EType Policy Mapping. Enable frame switching based on Ethernet Type" },
            { bits: "7:6", name: "PPPoE Policy", type: "RWR", desc: "PPPoE Policy Mapping. Enable frame switching based on PPPoE Ethertype" },
            { bits: "5:4", name: "VBAS Policy", type: "RWR", desc: "VBAS Policy Mapping. Enable frame switching based on VBAS Ethertype" },
            { bits: "3:2", name: "Opt82 Policy", type: "RWR", desc: "DHCP Option 82 Policy Mapping. Enable frame switching based on DHCP Option 82" },
            { bits: "1:0", name: "UDP Policy", type: "RWR", desc: "UDP Policy Mapping. Enable frame switching based on UDP port numbers" }
        ]
    },
    0x0F: {
        name: "Port E Type",
        bits: [
            { bits: "15:0", name: "Port EType", type: "RWS to 0x9100", desc: "Port's Special Ether Type. Used for many features depending on port mode" }
        ]
    },
    0x10: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x11: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x12: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x13: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x14: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x15: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x16: {
        name: "LED Control",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data. Load data into LED Control register selected by Pointer bits" },
            { bits: "14:12", name: "Pointer", type: "RWR", desc: "Pointer to desired LED Control register. Select register for read/write operations" },
            { bit: 11, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "10:0", name: "Data", type: "RWR", desc: "LED Control data read or written to register pointed to by Pointer bits" }
        ]
    },
    0x17: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x18: {
        name: "Port IEEE Priority Remapping Registers - Register 1",
        bits: [
            { bit: 15, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "14:12", name: "TagRemap3", type: "RWS to 0x3", desc: "Tag Remap 3. IEEE tagged frames with priority 3 get this register's value" },
            { bit: 11, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "10:8", name: "TagRemap2", type: "RWS to 0x2", desc: "Tag Remap 2. IEEE tagged frames with priority 2 get this register's value" },
            { bit: 7, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "6:4", name: "TagRemap1", type: "RWS to 0x1", desc: "Tag Remap 1. IEEE tagged frames with priority 1 get this register's value" },
            { bit: 3, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "2:0", name: "TagRemap0", type: "RWR", desc: "Tag Remap 0. IEEE tagged frames with priority 0 get this register's value" }
        ]
    },
    0x19: {
        name: "Port IEEE Priority Remapping Registers - Register 2",
        bits: [
            { bit: 15, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "14:12", name: "TagRemap7", type: "RWS to 0x7", desc: "Tag Remap 7. IEEE tagged frames with priority 7 get this register's value" },
            { bit: 11, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "10:8", name: "TagRemap6", type: "RWS to 0x6", desc: "Tag Remap 6. IEEE tagged frames with priority 6 get this register's value" },
            { bit: 7, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "6:4", name: "TagRemap5", type: "RWS to 0x5", desc: "Tag Remap 5. IEEE tagged frames with priority 5 get this register's value" },
            { bit: 3, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "2:0", name: "TagRemap4", type: "RWS to 0x4", desc: "Tag Remap 4. IEEE tagged frames with priority 4 get this register's value" }
        ]
    },
    0x1A: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x1B: {
        name: "Queue Counter Registers",
        bits: [
            { bits: "15:12", name: "Mode", type: "RWS to 0x8", desc: "Mode. Setting determines content of Data field. 0x0-0x3=Queue Size Counters, 0x4-0x7=Queue Size Counters mirror, 0x8=Egress Total Queue Size, 0x9=Ingress Reserved Queue Size" },
            { bit: 11, name: "Self Inc", type: "RWR", desc: "Self Increment Mode. Allow automatic increment of Mode bits after each read" },
            { bits: "10:9", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "8:0", name: "Data", type: "RO", desc: "Data. Content controlled by Mode bits above" }
        ]
    },
    0x1C: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x1D: {
        name: "Reserved",
        bits: [
            { bits: "15:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x1E: {
        name: "Debug Counter",
        bits: [
            { bits: "15:8", name: "RxBad Frames/Tx Collisions", type: "RO", desc: "Bad Counter. Increment each time frame enters port with error or transmit collision" },
            { bits: "7:0", name: "RxGood Frames/Tx Transmit Frames", type: "RO", desc: "Good Counter. Increment each time good frame enters or is transmitted from port" }
        ]
    },
    0x1F: {
        name: "Cut Through Register",
        bits: [
            { bits: "15:12", name: "Enable Select", type: "RWS", desc: "Port Enable Select. Select Px_ENABLE pin for cut through control" },
            { bits: "11:9", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 8, name: "Cut Through", type: "RWR", desc: "Cut Through enable. Enable frames to cut through from Ingress to Egress port" },
            { bits: "7:4", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "3:0", name: "Cut Through Queue", type: "RWR", desc: "Cut Through Queues. Allow frames to cut through to Egress port" }
        ]
    }
};

const toWord = (v) => {
    if (!v) return 0;
    const s = v.trim();
    if (s.toLowerCase().startsWith("0x")) return parseInt(s.slice(2), 16) & 0xffff;
    if (/[a-f]/i.test(s)) return parseInt(s, 16) & 0xffff;
    return parseInt(s, 10) & 0xffff;
};

// localStorage helper functions
const STORAGE_KEYS = {
    selectedRegister: 'switch_selectedRegister',
    registerValues: 'switch_registerValues',
    selectedPort: 'switch_selectedPort'
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

function BitField({ bit, bitDef, value, onBitToggle, onBitRangeChange, isReadOnly }) {
    const isBitRange = typeof bit === 'string' && bit.includes(':');
    const isChecked = isBitRange ? false : (value & (1 << bit)) !== 0;
    
    // Parse bit range (e.g., "15:14" -> {high: 15, low: 14})
    const getBitRange = (bitStr) => {
        if (!isBitRange) return null;
        const [high, low] = bitStr.split(':').map(n => parseInt(n));
        return { high, low };
    };
    
    // Extract current value from bit range
    const getBitRangeValue = () => {
        if (!isBitRange) return 0;
        const range = getBitRange(bit);
        const mask = ((1 << (range.high - range.low + 1)) - 1);
        return (value >> range.low) & mask;
    };
    
    const handleToggle = () => {
        if (!isReadOnly && !isBitRange) {
            onBitToggle(bit);
        }
    };
    
    const handleRangeChange = (e) => {
        if (!isReadOnly && isBitRange && onBitRangeChange) {
            const newValue = parseInt(e.target.value) || 0;
            const range = getBitRange(bit);
            const maxValue = (1 << (range.high - range.low + 1)) - 1;
            
            if (newValue <= maxValue) {
                onBitRangeChange(bit, newValue);
            }
        }
    };
    
    const currentRangeValue = getBitRangeValue();
    const range = getBitRange(bit);
    const maxRangeValue = range ? (1 << (range.high - range.low + 1)) - 1 : 0;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 8px",
            margin: "2px 0",
            background: isChecked || (isBitRange && currentRangeValue > 0) ? "#dbeafe" : "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
            fontSize: "12px"
        }}>
            <div style={{ minWidth: "40px", fontWeight: "bold", color: "#374151" }}>
                {isBitRange ? bit : `${bit}`}
            </div>
            
            {/* Single bit checkbox */}
            {!isBitRange && !isReadOnly && (
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleToggle}
                    style={{ marginRight: "8px" }}
                />
            )}
            
            {/* Multi-bit range input */}
            {isBitRange && !isReadOnly && (
                <div style={{ display: "flex", alignItems: "center", marginRight: "8px", gap: "4px" }}>
                    <input
                        type="number"
                        value={currentRangeValue}
                        onChange={handleRangeChange}
                        min={0}
                        max={maxRangeValue}
                        style={{
                            width: "50px",
                            padding: "2px 4px",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            fontSize: "11px",
                            textAlign: "center"
                        }}
                    />
                    <span style={{ fontSize: "9px", color: "#6b7280" }}>
                        (0-{maxRangeValue})
                    </span>
                </div>
            )}
            
            {/* Read-only range value display */}
            {isBitRange && isReadOnly && (
                <div style={{ marginRight: "8px", fontSize: "11px", color: "#374151", fontWeight: "600" }}>
                    Value: {currentRangeValue}
                </div>
            )}
            
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>{bitDef.name}</div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>{bitDef.type}</div>
                <div style={{ fontSize: "11px", color: "#374151", marginTop: "2px" }}>{bitDef.desc}</div>
                {isBitRange && (
                    <div style={{ fontSize: "9px", color: "#3b82f6", marginTop: "2px" }}>
                        Current: {currentRangeValue} (0x{currentRangeValue.toString(16).toUpperCase()}) | Binary: {currentRangeValue.toString(2).padStart(range.high - range.low + 1, '0')}
                    </div>
                )}
            </div>
        </div>
    );
}

function RegisterView({ portNum, regAddr, regDef, currentValue, onValueChange, onGenerateCommand }) {
    const handleBitToggle = (bitNum) => {
        const newValue = currentValue ^ (1 << bitNum);
        onValueChange(newValue);
    };
    
    const handleBitRangeChange = (bitRange, newRangeValue) => {
        const [high, low] = bitRange.split(':').map(n => parseInt(n));
        const bitCount = high - low + 1;
        const mask = ((1 << bitCount) - 1) << low;
        const newValue = (currentValue & ~mask) | ((newRangeValue & ((1 << bitCount) - 1)) << low);
        onValueChange(newValue);
    };

    const handleManualValueChange = (e) => {
        const value = toWord(e.target.value);
        onValueChange(value);
    };

    const generateReadCommand = () => {
        let commands = [];
        
        const portHex = (0x11 + portNum).toString(16).toUpperCase();
        const regHex = regAddr.toString(16).toUpperCase();
        
        commands.push(`# Read register 0x${regHex} from switch port ${portNum} (address 0x${portHex})`);
        commands.push(`# Direct MII access - no indirect register needed for switch registers`);
        commands.push(`mii read 0x${portHex} 0x${regHex}`);
        
        onGenerateCommand(commands.join('\n'));
    };

    const generateWriteCommand = () => {
        let commands = [];
        
        const portHex = (0x11 + portNum).toString(16).toUpperCase();
        const regHex = regAddr.toString(16).toUpperCase();
        const valueHex = currentValue.toString(16).padStart(4, '0').toUpperCase();
        
        commands.push(`# Write 0x${valueHex} to register 0x${regHex} on switch port ${portNum} (address 0x${portHex})`);
        commands.push(`# Direct MII access - no indirect register needed for switch registers`);
        commands.push(`mii write 0x${portHex} 0x${regHex} 0x${valueHex}`);
        
        onGenerateCommand(commands.join('\n'));
    };

    return (
        <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px", margin: "8px 0" }}>
            <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#1f2937" }}>
                    Switch Port {portNum} - Register 0x{regAddr.toString(16).toUpperCase()} ({regAddr}) - {regDef.name}
                </h4>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                    MII Address: 0x{(0x11 + portNum).toString(16).toUpperCase()} | Switch ports use direct MII access (no indirection)
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

function SwitchRegisterPanel() {
    // Initialize state from localStorage
    const [selectedRegister, setSelectedRegister] = useState(() => loadFromStorage(STORAGE_KEYS.selectedRegister, 0x00));
    const [registerValues, setRegisterValues] = useState(() => loadFromStorage(STORAGE_KEYS.registerValues, {}));
    const [generatedCommand, setGeneratedCommand] = useState('');
    const [readResult, setReadResult] = useState('');
    const [selectedPort, setSelectedPort] = useState(() => loadFromStorage(STORAGE_KEYS.selectedPort, 0)); // Switch ports 0-8 map to MII addresses 0x11-0x19

    const currentValue = registerValues[`${selectedPort}_${selectedRegister.toString(16)}`] || 0;

    // Save state to localStorage whenever it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedRegister, selectedRegister);
    }, [selectedRegister]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.registerValues, registerValues);
    }, [registerValues]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedPort, selectedPort);
    }, [selectedPort]);

    const setCurrentValue = (value) => {
        setRegisterValues(prev => ({
            ...prev,
            [`${selectedPort}_${selectedRegister.toString(16)}`]: value
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

    const clearAllStoredData = () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        setSelectedRegister(0x00);
        setRegisterValues({});
        setSelectedPort(0);
    };

    const currentRegisterData = SWITCH_REGISTERS[selectedRegister];

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", color: "#1f2937", marginBottom: "16px" }}>
                🔧 88E6321 Switch Register Utility
            </h2>

            <div style={{ 
                textAlign: "center", 
                marginBottom: "24px",
                padding: "12px",
                background: "#ecfdf5",
                border: "1px solid #10b981",
                borderRadius: "8px"
            }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                    Switch Port Register Access - Direct MII Commands
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                    Switch registers use direct MII read/write commands. No indirect register access needed.
                    Port addresses: Port 0→0x11, Port 1→0x12, ..., Port 8→0x19
                </div>
                <div style={{ marginTop: "8px" }}>
                    <button
                        onClick={clearAllStoredData}
                        style={{
                            padding: "4px 8px",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "10px"
                        }}
                    >
                        Clear All Data
                    </button>
                </div>
            </div>

            {/* Port Selection */}
            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "8px", color: "#374151" }}>Select Switch Port:</h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((portNum) => (
                        <button
                            key={portNum}
                            onClick={() => setSelectedPort(portNum)}
                            style={{
                                padding: "8px 16px",
                                background: selectedPort === portNum ? "#10b981" : "#f3f4f6",
                                color: selectedPort === portNum ? "white" : "#374151",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                        >
                            Port {portNum} (0x{(0x11 + portNum).toString(16).toUpperCase()})
                        </button>
                    ))}
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                    Switch ports 0-8 map to MII addresses 0x11-0x19. Each port has independent switch register values.
                </p>
            </div>

            {/* Register Selection */}
            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "8px", color: "#374151" }}>Select Register:</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "8px" }}>
                    {Object.entries(SWITCH_REGISTERS).map(([regAddr, regData]) => (
                        <button
                            key={regAddr}
                            onClick={() => setSelectedRegister(parseInt(regAddr))}
                            style={{
                                padding: "8px 12px",
                                background: selectedRegister === parseInt(regAddr) ? "#10b981" : "#f3f4f6",
                                color: selectedRegister === parseInt(regAddr) ? "white" : "#374151",
                                border: selectedRegister === parseInt(regAddr) ? "2px solid #059669" : "1px solid #e2e8f0",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11px",
                                textAlign: "left",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                minHeight: "50px",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <div style={{ 
                                fontWeight: "bold", 
                                fontSize: "12px",
                                color: selectedRegister === parseInt(regAddr) ? "white" : "#1f2937"
                            }}>
                                0x{parseInt(regAddr).toString(16).toUpperCase()} ({parseInt(regAddr)})
                            </div>
                            <div style={{ 
                                fontSize: "10px", 
                                opacity: "0.9",
                                lineHeight: "1.2"
                            }}>
                                {regData.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Register Details */}
            {currentRegisterData && (
                <RegisterView
                    portNum={selectedPort}
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

export default SwitchRegisterPanel;