import React, { useState, useMemo, useEffect } from 'react';

// Switch Global1 Register definitions based on 88E6321/88E6320 Switch Global1 Registers Reference
const GLOBAL1_REGISTERS = {
    0x00: {
        name: "Switch Global Status Register",
        bits: [
            { bit: 15, name: "PPUState", type: "RO", desc: "PPU Polling Unit State. 0=PPU Disabled, 1=PPU Polling" },
            { bits: "14:12", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 11, name: "InitReady", type: "RO", desc: "Switch Ready. 1=Address Translation Unit, VLAN Translation Unit, Queue Controller and Statistics Controller complete their initialization and are ready to accept frames" },
            { bits: "10:9", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 8, name: "AVBInt", type: "RO", desc: "AVB Interrupt. If any of the per-port PTPInt bits are set then this bit gets set" },
            { bit: 7, name: "DeviceInt", type: "RO", desc: "Device Interrupt. Set to 1 when any device interrupts have at least one active interrupt" },
            { bit: 6, name: "StatsDone", type: "LH", desc: "Statistics Done Interrupt. Set to 1 whenever the STATBusy bit transitions from 1 to 0. Automatically cleared when read" },
            { bit: 5, name: "VTUProb", type: "RO", desc: "VLAN Table Problem/Violation Interrupt. Set to 1 if a VLAN Violation is detected. Automatically cleared when all pending VTU Violations have been serviced" },
            { bit: 4, name: "VTUDone", type: "LH", desc: "VTU Done Interrupt. Set to 1 whenever the VTUBusy bit transitions from 1 to 0. Automatically cleared when read" },
            { bit: 3, name: "ATUProb", type: "RO", desc: "ATU Problem/Violation Interrupt. Set to 1 if the ATU cannot load or learn a new mapping due to all available locations being static or if an ATU Violation is detected" },
            { bit: 2, name: "ATUDone", type: "LH", desc: "ATU Done Interrupt. Set to 1 whenever the ATUBusy bit transitions from 1 to 0. Automatically cleared when read" },
            { bit: 1, name: "TCAMInt", type: "ROC", desc: "TCAM Interrupt. Set to 1 whenever the TCAM gets a hit where the Action Int bit is set to 1 (88E6321 only)" },
            { bit: 0, name: "EEInt", type: "LH", desc: "EEPROM Done Interrupt. Set to 1 after the EEPROM is done loading registers or when an EEPROM operation is done" }
        ]
    },
    0x01: {
        name: "ATU FID Register",
        bits: [
            { bits: "15:12", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "11:0", name: "FID", type: "RWR", desc: "ATU MAC Address Forwarding Information Database (FID) number. If multiple address databases are not being used these bits must remain zero. Used to set the desired address database number that is to be used on the Database supported commands" }
        ]
    },
    0x02: {
        name: "VTU FID Register",
        bits: [
            { bits: "15:13", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 12, name: "VIDPolicy", type: "RWR", desc: "VID Policy. Used to indicate any frames associated with this VID value are to be trapped to the TrapDest port, monitored to the MirrorDest port or discarded" },
            { bits: "11:0", name: "FID", type: "RWR", desc: "VTU MAC Address Forwarding Information Database (FID) number. Used in VTU Load and VTU GetNext operations" }
        ]
    },
    0x03: {
        name: "VTU SID Register",
        bits: [
            { bits: "15:6", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "5:0", name: "SID", type: "RWR", desc: "VTU 802.1s Port State Information Database (SID) number. Used on VTU Load and VTU GetNext operations for 802.1s multiple spanning trees support" }
        ]
    },
    0x04: {
        name: "Switch Global Control Register",
        bits: [
            { bit: 15, name: "SWReset", type: "SC", desc: "Switch Software Reset. Writing 1 to this bit causes the QC, MAC state machines in the switch to be reset. Register values are not modified. The EEPROM is not re-read" },
            { bit: 14, name: "Reserved", type: "RWS", desc: "Reserved for future use. Must be set to 1" },
            { bit: 13, name: "DiscardExcessive", type: "RWR", desc: "Discard frames with Excessive Collisions. When set to 1, frames that encounter 16 consecutive collisions are discarded. When cleared to 0, frames are never discarded and the backoff range is reset after 16 consecutive collisions" },
            { bit: 12, name: "ARPwoBC", type: "RWR", desc: "ARP detection without Broadcast checking. When enabled the switch core does not check for a Broadcast MAC address as part of ARP frame detection" },
            { bits: "11:10", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 9, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 8, name: "AVBIntEn", type: "RO", desc: "AVB Interrupt Enable. Must be set to 1 to allow active interrupts enabled in AVB registers in PTP Global Status Data Structure to drive the device's INTn pin low" },
            { bit: 7, name: "DevIntEn", type: "RWR", desc: "Device Interrupt Enable. Must be set to 1 to allow the Device Interrupt to drive the device's INTn pin low" },
            { bit: 6, name: "StatsDoneIntEn", type: "RWR", desc: "Statistics Operation Done Interrupt Enable. Must be set to 1 to allow the Stat Done interrupt to drive the device's INTn pin low" },
            { bit: 5, name: "VTUProbIntEn", type: "RWR", desc: "VLAN Problem/Violation Interrupt Enable. Must be set to 1 to allow the VTUProblem interrupt to drive the device's INTn pin low" },
            { bit: 4, name: "VTUDoneIntEn", type: "RWR", desc: "VLAN Table Operation Done Interrupt Enable. Must be set to 1 to allow the VTUDone interrupt to drive the device's INTn pin low" },
            { bit: 3, name: "ATUProbIntEn", type: "RWR", desc: "ATU Problem/Violation Interrupt Enable. Must be set to 1 to allow the ATU Problem interrupt to drive the device's INTn pin low" },
            { bit: 2, name: "ATUDoneIntEn", type: "RWR", desc: "ATU Operation Done Interrupt Enable. Must be set to 1 to allow the ATU Done interrupt to drive the device's INTn pin low" },
            { bit: 1, name: "TCAMIntEn", type: "RWR", desc: "TCAM Int Interrupt Enable. Must be set to 1 to allow the TCAMInt interrupt to drive the Agate's INTn pin low (88E6321 only)" },
            { bit: 0, name: "EEIntEn", type: "RWS", desc: "EEPROM Done Interrupt Enable. Must be set to 1 to allow the EEPROM Done interrupt to drive the device's INTn pin low" }
        ]
    },
    0x05: {
        name: "VTU Operation Register",
        bits: [
            { bit: 15, name: "VTUBusy", type: "SC", desc: "VLAN Table Unit Busy. Must be set to 1 to start a VTU operation. Only one VTU operation can be executing at one time. When the requested VTU operation completes, this bit will automatically be cleared to 0" },
            { bits: "14:12", name: "VTUOp", type: "RWR", desc: "VLAN Table Unit Table Opcode. 000=No Operation, 001=Flush All Entries in the VTU and STU, 010=No Operation, 011=VTU Load or Purge an Entry, 100=VTU Get Next, 101=STU Load or Purge an Entry, 110=STU Get Next, 111=Get/Clear Violation Data" },
            { bits: "11:7", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 6, name: "MemberViolation", type: "RO", desc: "Source Member Violation. On Get/Clear Violation Data VTUOps, this bit is returned set to 1 if the Violation being serviced is due to an 802.1Q Member Violation" },
            { bit: 5, name: "MissViolation", type: "RO", desc: "VTU Miss Violation. On Get/Clear Violation Data VTUOps this bit is returned set to 1 if the Violation being serviced was due to an 802.1Q Miss Violation" },
            { bit: 4, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "3:0", name: "SPID", type: "RO", desc: "On the Get Violation Data VTUOp, this field returns the Source Port ID of the port that caused the violation. The SPID was the source of the violations was the CPU register interface" }
        ]
    },
    0x06: {
        name: "VTU VID Register",
        bits: [
            { bits: "15:13", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 12, name: "Valid", type: "RWR", desc: "Entry's Valid bit. At the end of VTU (or STU) Get Next operations, if this bit is set to 1 it indicates the VID (or SID) value below is valid. If this bit is cleared to 0 and the VID (or SID) is all ones, it indicates the end of the VID (or SID) list was reached with no new valid entries found" },
            { bits: "11:0", name: "VID", type: "RWR", desc: "VLAN Identifier. This VID is used in the VTU Load or VTU GetNext operation and it is the VID that is associated with the VTU data" }
        ]
    },
    0x07: {
        name: "VTU/STU Data Register Ports 0 to 3 for VTU Operations",
        bits: [
            { bits: "15:14", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "13:12", name: "MemberTagP3", type: "RWR", desc: "Membership and Egress Tagging for Port 3. These bits are used to support 802.1Q membership and Egress Tagging" },
            { bits: "11:10", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "9:8", name: "MemberTagP2", type: "RWR", desc: "Membership and Egress Tagging for Port 2. These bits are used to support 802.1Q membership and Egress Tagging" },
            { bits: "7:6", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "5:4", name: "MemberTagP1", type: "RWR", desc: "Membership and Egress Tagging for Port 1. These bits are used to support 802.1Q membership and Egress Tagging" },
            { bits: "3:2", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "1:0", name: "MemberTagP0", type: "RWR", desc: "Membership and Egress Tagging for Port 0. 00=egress unmodified, 01=egress Untagged, 10=egress Tagged, 11=not a member of this VLAN" }
        ]
    },
    0x08: {
        name: "VTU/STU Data Register Ports 4 to 5 for VTU Operations",
        bits: [
            { bits: "15:10", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "9:8", name: "MemberTagP6", type: "RWR", desc: "Ingress and Egress Membership and Egress Tagging for Port 6" },
            { bits: "7:6", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "5:4", name: "MemberTagP5", type: "RWR", desc: "Membership and Egress Tagging for Port 5. These bits are used to support 802.1Q membership and Egress Tagging" },
            { bits: "3:2", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" },
            { bits: "1:0", name: "MemberTagP4", type: "RWR", desc: "Membership and Egress Tagging for Port 4. These bits are used to support 802.1Q membership and Egress Tagging" }
        ]
    },
    0x09: {
        name: "VTU/STU Data Register for VTU Operations",
        bits: [
            { bit: 15, name: "VIDPRIOverride", type: "RWR", desc: "VID Priority Override. When this bit is set to 1 the VIDPRI bits are used to override the priority on any frame associated with this VID" },
            { bits: "14:12", name: "VIDPRI", type: "RWR", desc: "VID Priority bits. These bits are used to override the priority on any frames associated with this VID value, if the VIDPRIOverride bit is set to 1" },
            { bits: "11:0", name: "Reserved", type: "RES", desc: "Reserved for future use. Will return 0x0 on STU GetNext Operations" }
        ]
    },
    0x0A: {
        name: "ATU Control Register",
        bits: [
            { bit: 15, name: "MACAVB", type: "RWR", desc: "ATU MAC entry in AVB mode. When 0x1, the ATU entries operate in AVB mode: Entry state 101x = Static AVB Unicast entry and Entry state x101 = Static AVB Multicast entry when 0x0, the ATU entries operate in non-AVB mode: Entry state 101x = Static NRL Unicast entry and Entry state x101 = Static NRL Multicast entry" },
            { bits: "14:12", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "11:4", name: "AgeTime", type: "RWS", desc: "ATU Age Time. These bits determine the time that each ATU Entry remains valid in the database, since its last access as a source address, before being purged (default 0x16)" },
            { bit: 3, name: "Learn2All", type: "RWR", desc: "Learn to All devices in a Switch. When more than one Marvell device is used to form a single 'switch' it may be desirable for all devices in the 'switch' to learn any address this device learns" },
            { bit: 2, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "1:0", name: "HashSel", type: "RWR", desc: "Hash Select. These bits select how a MAC addressed is hashed into the ATU: 00=Reserved, 01=Default, 10=Reserved, 11=Direct Method (no hash). Should be used for test purposes only" }
        ]
    },
    0x0B: {
        name: "ATU Operation Register",
        bits: [
            { bit: 15, name: "ATUBusy", type: "SC", desc: "Address Translation Unit Busy. Must be set to 1 to start an ATU operation. Only one ATU operation can be executing at one time. When the requested ATU operation completes, this bit will automatically be cleared to 0" },
            { bits: "14:12", name: "ATUOp", type: "RWR", desc: "Address Translation Unit Opcode. 000=No Operation, 001=Flush All Entries, 010=Flush all Non-Static Entries, 011=Load or Purge an Entry in a particular FID Database, 100=Get Next from a particular FID Database, 101=Flush All Entries in a particular FID Database, 110=Flush all Non-Static Entries in a particular FID Database, 111=Get/Clear Violation Data" },
            { bit: 11, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "10:8", name: "MACPri", type: "RWR", desc: "MAC Priority bits. These bits are used to override the priority on any frames associated with this MAC value, if the EntryState bits indicate MAC Priority can be used" },
            { bit: 7, name: "AgeOutViolation", type: "RO", desc: "Age Out Violation. On Get/Clear Violation Data ATUOps this bit is returned set to 1 if the Violation being serviced was due to a non-static entry being aged with an EntryState = 0x1" },
            { bit: 6, name: "MemberViolation", type: "RO", desc: "Source Port Violation. On Get/Clear Violation Data ATUOps this bit is returned set to 1 if the Violation being serviced is due to a Source Address look-up that resulted in a Hit but where the ATUData[8:0] bits does not contain the frame's Ingress port bit set to 1" },
            { bit: 5, name: "MissViolation", type: "RO", desc: "ATU Miss Violation. On Get/Clear Violation Data ATUOps this bit is returned set to 1 if the Violation being serviced is due to a Source Address look-up that resulted in a Miss on ports that are Locked" },
            { bit: 4, name: "ATUFullViolation", type: "RO", desc: "ATU Full Violation. On Get/Clear Violation Data ATUOps this bit is set to 1 if the Violation being serviced is due to a Load ATUOp or automatic learn that could not store the desired entry" },
            { bits: "3:0", name: "Reserved", type: "RES", desc: "Reserved for future use" }
        ]
    },
    0x0C: {
        name: "ATU Data Register",
        bits: [
            { bit: 15, name: "Trunk", type: "RWR", desc: "Trunk Mapped Address. When this bit is set to 1 the data bits 7:4 (PortVec bits [3:0]) is the Trunk ID assigned to this address. PortVec bits [10:4] must be written as zero" },
            { bits: "14:12", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "11:4", name: "PortVec", type: "RWR", desc: "Port Vector. If the Trunk bit, above, is zero, these bits are used as the input Port Vector for ATU Load operations and it's the resulting Port Vector from ATU Get Next operations" },
            { bits: "3:0", name: "EntryState", type: "RWR", desc: "ATU Entry State. These bits are used as the Entry State for ATU Load/Purge or Flush/Move operations and it is the resulting Entry State from ATU Get Next operations. If these bits equal 0x0 then the ATUOp is a Purge or a Flush. If these bits are not 0x0 then the ATUOp is a Load or a Move" }
        ]
    },
    0x0D: {
        name: "ATU MAC Address Register Bytes 0 & 1",
        bits: [
            { bits: "15:8", name: "ATUByte0", type: "RWR", desc: "ATU MAC Address Byte 0 (bits 47:40) used as the MAC address for ATU Load, Purge or Get Next operations and it is the resulting MAC address from ATU Get Next operations" },
            { bits: "7:0", name: "ATUByte1", type: "RWR", desc: "ATU MAC Address Byte 1 (bits 39:32) used as the input MAC address for ATU Load, Purge or Get Next operations and it is the resulting MAC address from ATU Get Next operations" }
        ]
    },
    0x0E: {
        name: "ATU MAC Address Register Bytes 2 & 3",
        bits: [
            { bits: "15:8", name: "ATUByte2", type: "RWR", desc: "ATU MAC Address Byte 2 (bits 31:24) used as the input MAC address for ATU Load, Purge or Get Next operations and it is the resulting MAC address from ATU Get Next operations" },
            { bits: "7:0", name: "ATUByte3", type: "RWR", desc: "ATU MAC Address Byte 3 (bits 23:16) used as the input MAC address for ATU Load, Purge or Get Next operations and it is the resulting MAC address from ATU Get Next operations" }
        ]
    },
    0x0F: {
        name: "ATU MAC Address Register Bytes 4 & 5",
        bits: [
            { bits: "15:8", name: "ATUByte4", type: "RWR", desc: "ATU MAC Address Byte 4 (bits 15:8) used as the input MAC address for ATU Load, Purge or Get Next operations and it is the resulting MAC address from ATU Get Next operations" },
            { bits: "7:0", name: "ATUByte5", type: "RWR", desc: "ATU MAC Address Byte 5 (bits 7:0) used as the input MAC address for ATU Load, Purge or Get Next operations and it is the resulting MAC address from ATU Get Next operations" }
        ]
    },
    0x18: {
        name: "IEEE-PRI Register",
        bits: [
            { bits: "15:14", name: "Tag_0x7", type: "RWS", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 7 (default 0x3)" },
            { bits: "13:12", name: "Tag_0x6", type: "RWS", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 6 (default 0x3)" },
            { bits: "11:10", name: "Tag_0x5", type: "RWS", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 5 (default 0x2)" },
            { bits: "9:8", name: "Tag_0x4", type: "RWS", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 4 (default 0x2)" },
            { bits: "7:6", name: "Tag_0x3", type: "RWS", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 3 (default 0x1)" },
            { bits: "5:4", name: "Tag_0x2", type: "RWS", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 2 (default 0x1)" },
            { bits: "3:2", name: "Tag_0x1", type: "RWR", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 1" },
            { bits: "1:0", name: "Tag_0x0", type: "RWR", desc: "IEEE 802.1p mapping. The value in this field is used as the frame's priority if its IEEE Tag has a value of 0" }
        ]
    },
    0x19: {
        name: "IP Mapping Table",
        bits: [
            { bit: 15, name: "Update", type: "SC", desc: "Update Data. When this bit is set to 1 the data written to bits 7:0 will be loaded into the IP Mapping register selected by the Pointer bits" },
            { bit: 14, name: "UseIPFPri", type: "RWR", desc: "Use IP Frame Priorities from this table. This bit is used to be maintain backwards compatibility. When this bit is cleared to 0, the IP_FPRI data in this table is ignored. When this bit is set to 1, the IP_FPRI data in this table is used as the frame's initial IP_FPRI" },
            { bits: "13:8", name: "Pointer", type: "RWR", desc: "Pointer to the desired entry of the IP Mapping table. These bits select one of 64 possible IP mapping registers for both read and write operations" },
            { bit: 7, name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "6:4", name: "IP_FPRI", type: "RWS", desc: "IPv4 and IPv6 Frame Priority Mapping. The value in this field is used as the frame's initial FPRI when the frame is an IPv4 or an IPv6 frame, and the port's InitialPri and TagIfBoth registers are configured to use IP FPRIs" },
            { bits: "3:2", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "1:0", name: "IP_QPRI", type: "RWS", desc: "IPv4 and IPv6 Queue Priority Mapping. The value in this field is used as the frame's initial QPRI when the frame is an IPv4 or an IPv6 frame, and the port's InitialPri and TagIfBoth registers are configured to use IP QPRIs" }
        ]
    },
    0x1A: {
        name: "Monitor Control",
        bits: [
            { bits: "15:12", name: "IngressMonitorDest", type: "RWS", desc: "Ingress Monitor Destination Port. Frames that are targeted toward an Ingress Monitor Destination go out the port number indicated in these bits. This includes frames received on a DSA Tag port with the Ingress Monitor type, and frames received on a Network port that is enabled to be the Ingress Monitor Source Port" },
            { bits: "11:8", name: "EgressMonitorDest", type: "RWS", desc: "Egress Monitor Destination Port. Frames that are targeted toward an Egress Monitor Destination go out of the port number indicated in these bits. This includes frames received on a DSA Tag port with the Egress Monitor type, and frames transmitted on a Network port that is enabled to be the Egress Monitor Source Port" },
            { bits: "7:4", name: "CPUDest", type: "RWS", desc: "CPU Destination Port. Many modes of frame processing need to know where the CPU is located. When IGMP/MLD frame is received and Snooping is enabled on the port" },
            { bits: "3:0", name: "MirrorDest", type: "RWS", desc: "Mirror Destination Port. Frames that ingress a port that trigger a policy mirror are mapped (copied) to this port as long as the frame is not filtered or discarded. The MirrorDest should point to the port that directs these frames to the CPU that will process these frames" }
        ]
    },
    0x1B: {
        name: "Total Free Counter",
        bits: [
            { bits: "15:10", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bits: "9:0", name: "FreeQSize", type: "RO", desc: "Free Queue Size Counter. This counter reflects the current number of unallocated buffers available for all the ports" }
        ]
    },
    0x1C: {
        name: "Global Control 2",
        bits: [
            { bits: "15:14", name: "HeaderType", type: "RWR", desc: "Header Type. These bits are used to configure the bits that are placed into the Egress Header when it is enabled on a port: 00=Original Header, 01=Single chip MGMT Header, 10=Trunk Header, 11=Reserved" },
            { bits: "13:12", name: "RMUMode", type: "RWR", desc: "Remote Management Unit Mode 0x0=RMU feature is disabled, 0x1=Port 4 is enabled to be the RMU port for the switch, 0x2=Port 5 is enabled to be the RMU port for the switch, 0x3=Port 6 is enabled to be the RMU port for the switch" },
            { bit: 11, name: "DACheck", type: "RWR", desc: "Check the DA on Remote Management frames. When this bit is set to 1 the DA of Remote Management frames must be contained in this device's address database (ATU) as a Static entry (either unicast or multicast)" },
            { bits: "10:6", name: "Reserved", type: "RES", desc: "Reserved for future use" },
            { bit: 5, name: "CtrMode", type: "RWR", desc: "Counter Mode. This bit controls the operating mode of the Port's Debug counter at Port offset 0x1E. When CtrMode is cleared to 0 the Debug counter for all ports counts RxBad frames in the upper 8 bits of the register and counts RxGood frames in the lower 8 bits of the register. When this bit is set to 1 the Debug counter for all ports counts Collisions in the upper 8 bits of the register and counts Tx Transmitted frames in the lower 8 bits of the register" },
            { bits: "4:0", name: "DeviceNumber", type: "RWS", desc: "Device Number. In multi-chip systems, frames coming from a CPU (From_CPU frames) need to know when they have reached their destination chip. From_CPU frames whose Trg_Dev field matches these bits have reached their destination chip and are sent out from this chip using the port number indicated in the frame's Trg_Port field" }
        ]
    },
    0x1D: {
        name: "Stats Operation Register",
        bits: [
            { bit: 15, name: "StatsBusy", type: "SC", desc: "Statistics Unit Busy. Must be set to 1 to start a Stats operation. Only one Stats operation can be executing at one time. When the requested Stats operation completes, this bit automatically is cleared to 0" },
            { bits: "14:12", name: "StatsOp", type: "RWR", desc: "Statistics Unit Opcode. 000=No Operation, 001=Flush (clear) All Counters for all Ports, 010=Flush (clear) All Counters for a Port, 011=Reserved, 100=Read a Captured or Direct Counter, 101=Capture All Counters for a Port, 11x=Reserved" },
            { bits: "11:10", name: "HistogramMode", type: "RES", desc: "Histogram Counters Mode. The Histogram mode bits control how the Histogram counters work: 00=Reserved, 01=Count received frames only, 10=Count transmitted frames only, 11=Count receive and transmitted frames (default 0x3)" },
            { bit: 9, name: "StatsBank", type: "RWR", desc: "Statistics Bank of Counters. When this bit is cleared to 0 the MAC based MIBs (Bank 0) are accessed when a 'Read a Captured or Direct Counter' StatsOp is performed. When this bit is set to 1 the Policy based MIBs (Bank 1) are accessed when a 'Read a Captured or Direct Counter' StatsOp is performed" },
            { bits: "8:5", name: "StatsPort", type: "RWR", desc: "Access Statistics Counters directly for a Port or the Capture area. These bits can be used to directly access a ports counters without doing a capture first. Set these bits = 0x0 to access the captured counters. Set these bits = 0x1 to access the counters for Port 0, etc." },
            { bits: "4:0", name: "StatsPtr", type: "RWR", desc: "Statistics Pointer. This field is used as a parameter for the above StatsOp commands. StatsPtr must be set to the desired counter to read for the Read a Captured or Direct Counter (0x4) StatsOp (valid range is 0x00 to 0x1F)" }
        ]
    },
    0x1E: {
        name: "Stats Counter Register Bytes 3 & 2",
        bits: [
            { bits: "15:8", name: "StatsByte3", type: "RO", desc: "Statistics Counter Byte 3. These bits contain bits 31:24 of the last stat counter requested to be read by the CPU (by using the Read a Counter StatsOp)" },
            { bits: "7:0", name: "StatsByte2", type: "RO", desc: "Statistics Counter Byte 2. These bits contain bits 23:16 of the last stat counter requested to be read by the CPU (by using the Read a Counter StatsOp)" }
        ]
    },
    0x1F: {
        name: "Stats Counter Register Bytes 1 & 0",
        bits: [
            { bits: "15:8", name: "StatsByte1", type: "RO", desc: "Statistics Counter Byte 1. These bits contain bits 15:8 of the last stat counter requested to be read by the CPU (by using the Read a Counter StatsOp)" },
            { bits: "7:0", name: "StatsByte0", type: "RO", desc: "Statistics Counter Byte 0. These bits contain bits 7:0 of the last stat counter requested to be read by the CPU (by using the Read a Counter StatsOp)" }
        ]
    }
};

// localStorage helpers for Global1 registers
const STORAGE_KEYS = {
    selectedRegister: 'switchGlobal1_selectedRegister',
    registerValues: 'switchGlobal1_registerValues'
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
function Global1RegisterCard({ regAddr, regDef, currentValue, onValueChange }) {
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
        const command = `mii read 0x1b 0x${regAddr.toString(16).padStart(2, '0')}`;
        navigator.clipboard.writeText(command);
        
        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    const generateWriteCommand = () => {
        const command = `mii write 0x1b 0x${regAddr.toString(16).padStart(2, '0')} 0x${currentValue.toString(16).padStart(4, '0').toUpperCase()}`;
        navigator.clipboard.writeText(command);
        
        // Add to history
        const event = new CustomEvent('addToHistory', { detail: command });
        window.dispatchEvent(event);
    };

    return (
        <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px", margin: "8px 0" }}>
            <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#1f2937" }}>
                    Global1 Register 0x{regAddr.toString(16).toUpperCase()} ({regAddr}) - {regDef.name}
                </h4>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                    MII Address: 0x1B | Global1 registers use direct MII access to address 0x1B
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

function SwitchGlobal1Panel() {
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

    const availableRegisters = Object.keys(GLOBAL1_REGISTERS).map(addr => parseInt(addr));

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
            <div style={{ 
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
                color: "white", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "16px",
                textAlign: "center"
            }}>
                <h2 style={{ margin: "0 0 8px 0" }}>🌐 Switch Global1 Registers</h2>
                <p style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}>
                    Global1 registers are accessed directly via MII address 0x1B. These control device-wide switch functionality.
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
                                0x{addr.toString(16).padStart(2, '0').toUpperCase()} - {GLOBAL1_REGISTERS[addr].name}
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Global1 MII Address: 0x1B (Fixed for all registers)
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
                            mii read 0x1b 0x{selectedRegister.toString(16).padStart(2, '0')}
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
                            mii write 0x1b 0x{selectedRegister.toString(16).padStart(2, '0')} 0x{currentValue.toString(16).padStart(4, '0').toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Details */}
            <Global1RegisterCard
                regAddr={selectedRegister}
                regDef={GLOBAL1_REGISTERS[selectedRegister]}
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
                    <strong>Total Global1 Registers:</strong> {Object.keys(GLOBAL1_REGISTERS).length}<br/>
                    <strong>Current Register:</strong> 0x{selectedRegister.toString(16).toUpperCase()} - {GLOBAL1_REGISTERS[selectedRegister].name}<br/>
                    <strong>Current Value:</strong> 0x{currentValue.toString(16).padStart(4, '0').toUpperCase()} ({currentValue})<br/>
                    <strong>MII Address:</strong> 0x1B (Global1 access point)
                </div>
            </div>
        </div>
    );
}

export default SwitchGlobal1Panel;