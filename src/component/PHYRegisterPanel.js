import React, { useState, useMemo, useEffect } from 'react';

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
            0x04: {
                name: "Copper Auto-Negotiation Advertisement Register",
                bits: [
                    { bit: 15, name: "Next Page", type: "R/W, Update", desc: "1=Advertise next page capability, 0=Not advertised" },
                    { bit: 14, name: "Acknowledge", type: "RO", desc: "Always 0" },
                    { bit: 13, name: "Remote Fault", type: "R/W, Update", desc: "1=Set remote fault bit, 0=Do not set" },
                    { bit: 12, name: "Reserved", type: "R/W, Update", desc: "Reserved" },
                    { bit: 11, name: "Asymmetric Pause", type: "R/W, Update", desc: "1=Asymmetric pause, 0=No asymmetric pause" },
                    { bit: 10, name: "Pause", type: "R/W, Update", desc: "1=Pause capable, 0=Not pause capable" },
                    { bit: 9, name: "100BASE-T4", type: "R/W, Retain", desc: "Always 0 (not capable)" },
                    { bit: 8, name: "100BASE-TX Full-Duplex", type: "R/W, Update", desc: "1=Advertise capability, 0=Not advertised" },
                    { bit: 7, name: "100BASE-TX Half-Duplex", type: "R/W, Update", desc: "1=Advertise capability, 0=Not advertised" },
                    { bit: 6, name: "10BASE-TX Full-Duplex", type: "R/W, Update", desc: "1=Advertise capability, 0=Not advertised" },
                    { bit: 5, name: "10BASE-TX Half-Duplex", type: "R/W, Update", desc: "1=Advertise capability, 0=Not advertised" },
                    { bits: "4:0", name: "Selector Field", type: "R/W, Retain", desc: "00001 = 802.3" }
                ]
            },
            0x05: {
                name: "Copper Link Partner Ability Register",
                bits: [
                    { bit: 15, name: "Next Page", type: "RO", desc: "1=Link partner capable of next page, 0=Not capable" },
                    { bit: 14, name: "Acknowledge", type: "RO", desc: "1=Link partner received code word, 0=Not received" },
                    { bit: 13, name: "Remote Fault", type: "RO", desc: "1=Link partner detected remote fault, 0=No fault" },
                    { bit: 12, name: "Technology Ability Field", type: "RO", desc: "Technology ability field" },
                    { bit: 11, name: "Asymmetric Pause", type: "RO", desc: "1=Link partner requests asymmetric pause, 0=Does not request" },
                    { bit: 10, name: "Pause Capable", type: "RO", desc: "1=Link partner pause capable, 0=Not capable" },
                    { bit: 9, name: "100BASE-T4 Capability", type: "RO", desc: "1=Link partner 100BASE-T4 capable, 0=Not capable" },
                    { bit: 8, name: "100BASE-TX Full-Duplex Capability", type: "RO", desc: "1=Link partner capable, 0=Not capable" },
                    { bit: 7, name: "100BASE-TX Half-Duplex Capability", type: "RO", desc: "1=Link partner capable, 0=Not capable" },
                    { bit: 6, name: "10BASE-T Full-Duplex Capability", type: "RO", desc: "1=Link partner capable, 0=Not capable" },
                    { bit: 5, name: "10BASE-T Half-Duplex Capability", type: "RO", desc: "1=Link partner capable, 0=Not capable" },
                    { bits: "4:0", name: "Selector Field", type: "RO", desc: "Selector field" }
                ]
            },
            0x06: {
                name: "Copper Auto-Negotiation Expansion Register",
                bits: [
                    { bits: "15:5", name: "Reserved", type: "RO", desc: "0x000" },
                    { bit: 4, name: "Parallel Detection Fault", type: "RO, LH", desc: "1=Fault detected via parallel detection, 0=No fault" },
                    { bit: 3, name: "Link Partner Next Page Able", type: "RO", desc: "1=Link partner next page able, 0=Not able" },
                    { bit: 2, name: "Local Next Page Able", type: "RO", desc: "Always 1" },
                    { bit: 1, name: "Page Received", type: "RO, LH", desc: "1=New page received, 0=No new page" },
                    { bit: 0, name: "Link Partner Auto-Negotiation Able", type: "RO", desc: "1=Link partner auto-negotiation able, 0=Not able" }
                ]
            },
            0x07: {
                name: "Copper Next Page Transmit Register",
                bits: [
                    { bit: 15, name: "Next Page", type: "R/W", desc: "Next page" },
                    { bit: 14, name: "Reserved", type: "RO", desc: "Always 0" },
                    { bit: 13, name: "Message Page Mode", type: "R/W", desc: "Default 1" },
                    { bit: 12, name: "Acknowledge2", type: "R/W", desc: "Acknowledge2" },
                    { bit: 11, name: "Toggle", type: "RO", desc: "Toggle" },
                    { bits: "10:0", name: "Message/Unformatted Field", type: "R/W", desc: "Default 0x001" }
                ]
            },
            0x08: {
                name: "Copper Link Partner Next Page Register",
                bits: [
                    { bit: 15, name: "Next Page", type: "RO", desc: "Next page" },
                    { bit: 14, name: "Acknowledge", type: "RO", desc: "Acknowledge" },
                    { bit: 13, name: "Message Page", type: "RO", desc: "Message page" },
                    { bit: 12, name: "Acknowledge2", type: "RO", desc: "Acknowledge2" },
                    { bit: 11, name: "Toggle", type: "RO", desc: "Toggle" },
                    { bits: "10:0", name: "Message/Unformatted Field", type: "RO", desc: "Message/Unformatted field" }
                ]
            },
            0x09: {
                name: "1000BASE-T Control Register",
                bits: [
                    { bits: "15:13", name: "Test Mode", type: "R/W, Retain", desc: "000=Normal, 001=Test Mode 1, 010=Test Mode 2 (MASTER), 011=Test Mode 3 (SLAVE), 100=Test Mode 4" },
                    { bit: 12, name: "MASTER/SLAVE Manual Config Enable", type: "R/W, Update", desc: "1=Manual configuration, 0=Automatic configuration" },
                    { bit: 11, name: "MASTER/SLAVE Configuration Value", type: "R/W, Update", desc: "1=Manual MASTER, 0=Manual SLAVE" },
                    { bit: 10, name: "Port Type", type: "R/W, Update", desc: "1=Prefer multi-port device (MASTER), 0=Prefer single port (SLAVE)" },
                    { bit: 9, name: "1000BASE-T Full-Duplex", type: "R/W, Update", desc: "1=Advertise capability, 0=Not advertised" },
                    { bit: 8, name: "1000BASE-T Half-Duplex", type: "R/W, Update", desc: "1=Advertise capability, 0=Not advertised" },
                    { bits: "7:0", name: "Reserved", type: "R/W, Retain", desc: "Reserved" }
                ]
            },
            0x0A: {
                name: "1000BASE-T Status Register",
                bits: [
                    { bit: 15, name: "MASTER/SLAVE Configuration Fault", type: "RO, LH", desc: "1=Configuration fault detected, 0=No fault" },
                    { bit: 14, name: "MASTER/SLAVE Configuration Resolution", type: "RO", desc: "1=Local PHY resolved to MASTER, 0=Resolved to SLAVE" },
                    { bit: 13, name: "Local Receiver Status", type: "RO", desc: "1=Local receiver OK, 0=Not OK" },
                    { bit: 12, name: "Remote Receiver Status", type: "RO", desc: "1=Remote receiver OK, 0=Not OK" },
                    { bit: 11, name: "Link Partner 1000BASE-T Full-Duplex Capability", type: "RO", desc: "1=Link partner capable, 0=Not capable" },
                    { bit: 10, name: "Link Partner 1000BASE-T Half-Duplex Capability", type: "RO", desc: "1=Link partner capable, 0=Not capable" },
                    { bits: "9:8", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "7:0", name: "Idle Error Count", type: "RO, SC", desc: "MSB of idle error counter (clears on read, pegs at 0xFF)" }
                ]
            },
            0x0D: {
                name: "XMDIO MMD Access Control Register",
                bits: [
                    { bits: "15:14", name: "Function", type: "R/W, Retain", desc: "00=Address, 01=Data no post increment, 10=Data with post increment on read/write, 11=Data with post increment on write only" },
                    { bits: "13:5", name: "Reserved", type: "RO, Retain", desc: "Reserved" },
                    { bits: "4:0", name: "DEVAD", type: "RO, Retain", desc: "Device address" }
                ]
            },
            0x0E: {
                name: "XMDIO MMD Access Address/Data Register",
                bits: [
                    { bits: "15:0", name: "Address Data", type: "R/W", desc: "Address or data depending on register 13 function setting" }
                ]
            },
            0x0F: {
                name: "Extended Status Register",
                bits: [
                    { bit: 15, name: "1000BASE-X Full-Duplex", type: "RO", desc: "Always 0 (not capable)" },
                    { bit: 14, name: "1000BASE-X Half-Duplex", type: "RO", desc: "Always 0 (not capable)" },
                    { bit: 13, name: "1000BASE-T Full-Duplex", type: "RO", desc: "Always 1 (capable)" },
                    { bit: 12, name: "1000BASE-T Half-Duplex", type: "RO", desc: "Always 1 (capable)" },
                    { bits: "11:0", name: "Reserved", type: "RO", desc: "0x000" }
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
            0x14: {
                name: "Copper Specific Control Register 2",
                bits: [
                    { bit: 15, name: "Low Power Transmitter Enable", type: "R/W, Retain", desc: "0=Transmitter always on, 1=Transmitter turns off between FLP bursts" },
                    { bits: "14:8", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 7, name: "10BASE-Te Enable", type: "R/W, Retain", desc: "0=Disable 10BASE-Te, 1=Enable 10BASE-Te" },
                    { bit: 6, name: "Break Link On Insufficient IPG", type: "R/W, Retain", desc: "0=Break link on insufficient IPGs, 1=Do not break link" },
                    { bit: 5, name: "100BASE-T Transmitter Clock Source", type: "R/W, Update", desc: "1=Local clock, 0=Recovered clock" },
                    { bit: 4, name: "Accelerate 100BASE-T Link Up", type: "R/W, Retain", desc: "0=No acceleration, 1=Accelerate" },
                    { bit: 3, name: "Reverse MDIP/N[3] Transmit Polarity", type: "R/W, Retain", desc: "0=Normal polarity, 1=Reverse polarity" },
                    { bit: 2, name: "Reverse MDIP/N[2] Transmit Polarity", type: "R/W, Retain", desc: "0=Normal polarity, 1=Reverse polarity" },
                    { bit: 1, name: "Reverse MDIP/N[1] Transmit Polarity", type: "R/W, Retain", desc: "0=Normal polarity, 1=Reverse polarity" },
                    { bit: 0, name: "Reverse MDIP/N[0] Transmit Polarity", type: "R/W, Retain", desc: "0=Normal polarity, 1=Reverse polarity" }
                ]
            },
            0x15: {
                name: "Copper Specific Receive Error Counter Register",
                bits: [
                    { bits: "15:0", name: "Receive Error Count", type: "ROC, Retain", desc: "Counter pegs at 0xFFFF, reports false carrier and symbol errors" }
                ]
            },
            0x16: {
                name: "Page Address",
                bits: [
                    { bits: "15:14", name: "Reserved", type: "R/W, Retain", desc: "Must be 0" },
                    { bits: "13:8", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "7:0", name: "Page Select", type: "R/W, Retain", desc: "Page number (0x00-0xFF)" }
                ]
            },
            0x1A: {
                name: "Copper Specific Control Register 3",
                bits: [
                    { bit: 15, name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 14, name: "Disable 1000BASE-T", type: "R/W, Retain", desc: "1=Disable 1000BASE-T advertisement, 0=Enable" },
                    { bit: 13, name: "Reverse Autoneg", type: "R/W, Retain", desc: "1=Reverse auto-negotiation, 0=Normal" },
                    { bit: 12, name: "Disable 100BASE-T", type: "R/W, Retain", desc: "1=Disable 100BASE-TX advertisement, 0=Enable" },
                    { bits: "11:10", name: "Gigabit Link Down Delay", type: "R/W, Retain", desc: "00=0ms, 01=10±2ms, 10=20±2ms, 11=40±2ms" },
                    { bit: 9, name: "Speed Up Gigabit Link Down Time", type: "R/W, Retain", desc: "1=Enable faster gigabit link down, 0=Use IEEE timing" },
                    { bit: 8, name: "DTE Detect Enable", type: "R/W, Update", desc: "1=Enable DTE detection, 0=Disable" },
                    { bits: "7:4", name: "DTE Detect Status Drop Hysteresis", type: "R/W, Retain", desc: "0000=Report immediately, 0001=Report 5s after drop, ..., 1111=Report 75s after drop" },
                    { bits: "3:2", name: "100 MB Test Select", type: "R/W, Retain", desc: "0x=Normal operation, 10=Select 112ns sequence, 11=Select 16ns sequence" },
                    { bit: 1, name: "10 BT Polarity Force", type: "R/W, Retain", desc: "1=Force negative polarity for receive only, 0=Normal" },
                    { bit: 0, name: "Reserved", type: "R/W, Retain", desc: "Reserved" }
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
            },
            0x12: {
                name: "MAC Specific Interrupt Enable Register",
                bits: [
                    { bits: "15:8", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 7, name: "FIFO Over/Underflow Interrupt Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bits: "6:4", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bit: 3, name: "FIFO Idle Inserted Interrupt Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bit: 2, name: "FIFO Idle Deleted Interrupt Enable", type: "R/W, Retain", desc: "1=Enable, 0=Disable" },
                    { bits: "1:0", name: "Reserved", type: "R/W, Retain", desc: "Reserved" }
                ]
            },
            0x13: {
                name: "MAC Specific Status Register",
                bits: [
                    { bits: "15:8", name: "Reserved", type: "RO", desc: "Always 00" },
                    { bit: 7, name: "FIFO Over/Underflow", type: "RO, LH", desc: "1=Over/underflow error, 0=No FIFO error" },
                    { bits: "6:4", name: "Reserved", type: "RO", desc: "Always 0" },
                    { bit: 3, name: "FIFO Idle Inserted", type: "RO, LH", desc: "1=Idle inserted, 0=No idle inserted" },
                    { bit: 2, name: "FIFO Idle Deleted", type: "RO, LH", desc: "1=Idle deleted, 0=Idle not deleted" },
                    { bits: "1:0", name: "Reserved", type: "RO", desc: "Always 0" }
                ]
            },
            0x14: {
                name: "Copper RX_ER Byte Capture",
                bits: [
                    { bit: 15, name: "Capture Data Valid", type: "RO", desc: "1=Bits 14:0 valid, 0=Invalid" },
                    { bit: 14, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "13:12", name: "Byte Number", type: "RO", desc: "00=4 bytes before RX_ER, 01=3 bytes before, 10=2 bytes before, 11=1 byte before" },
                    { bits: "11:10", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bit: 9, name: "RX_ER", type: "RO", desc: "RX Error" },
                    { bit: 8, name: "RX_DV", type: "RO", desc: "RX Data Valid" },
                    { bits: "7:0", name: "RXD[7:0]", type: "RO", desc: "RX Data" }
                ]
            },
            0x15: {
                name: "MAC Specific Control Register 2",
                bits: [
                    { bit: 15, name: "Reserved", type: "R/W", desc: "Reserved" },
                    { bit: 14, name: "Copper Line Loopback", type: "R/W", desc: "1=Enable loopback of MDI to MDI, 0=Normal operation" },
                    { bits: "13:12", name: "Reserved", type: "R/W, Update", desc: "Reserved" },
                    { bits: "11:7", name: "Reserved", type: "R/W", desc: "Reserved" },
                    { bit: 6, name: "Reserved", type: "R/W, Update", desc: "Reserved" },
                    { bits: "5:4", name: "Reserved", type: "R/W, Update", desc: "Reserved" },
                    { bit: 3, name: "Block Carrier Extension Bit", type: "R/W, Retain", desc: "1=Enable block carrier extension, 0=Disable" },
                    { bits: "2:0", name: "Default MAC Interface Speed", type: "R/W, Update", desc: "0XX=Reserved, 100=10 Mbps, 101=100 Mbps, 110=1000 Mbps, 111=Reserved" }
                ]
            }
        }
    },
    5: {
        name: "Page 5 - Advanced VCT",
        registers: {
            0x10: {
                name: "Advanced VCT TX to MDI[0] Rx Coupling",
                bits: [
                    { bit: 15, name: "Reflected Polarity", type: "RO, Retain", desc: "1=Positive reflection, 0=Negative reflection" },
                    { bits: "14:8", name: "Reflected Amplitude", type: "RO, Retain", desc: "0000000=No reflection (0mV), each bit increases 7.8125mV" },
                    { bits: "7:0", name: "Distance", type: "RO, Retain", desc: "Distance of reflection (valid when test completed)" }
                ]
            },
            0x11: {
                name: "Advanced VCT TX to MDI[1] Rx Coupling",
                bits: [
                    { bit: 15, name: "Reflected Polarity", type: "RO, Retain", desc: "1=Positive reflection, 0=Negative reflection" },
                    { bits: "14:8", name: "Reflected Amplitude", type: "RO, Retain", desc: "0000000=No reflection (0mV), each bit increases 7.8125mV" },
                    { bits: "7:0", name: "Distance", type: "RO, Retain", desc: "Distance of reflection (valid when test completed)" }
                ]
            },
            0x12: {
                name: "Advanced VCT TX to MDI[2] Rx Coupling",
                bits: [
                    { bit: 15, name: "Reflected Polarity", type: "RO, Retain", desc: "1=Positive reflection, 0=Negative reflection" },
                    { bits: "14:8", name: "Reflected Amplitude", type: "RO, Retain", desc: "0000000=No reflection (0mV), each bit increases 7.8125mV" },
                    { bits: "7:0", name: "Distance", type: "RO, Retain", desc: "Distance of reflection (valid when test completed)" }
                ]
            },
            0x13: {
                name: "Advanced VCT TX to MDI[3] Rx Coupling",
                bits: [
                    { bit: 15, name: "Reflected Polarity", type: "RO, Retain", desc: "1=Positive reflection, 0=Negative reflection" },
                    { bits: "14:8", name: "Reflected Amplitude", type: "RO, Retain", desc: "0000000=No reflection (0mV), each bit increases 7.8125mV" },
                    { bits: "7:0", name: "Distance", type: "RO, Retain", desc: "Distance of reflection (valid when test completed)" }
                ]
            },
            0x14: {
                name: "1000BASE-T Pair Skew Register",
                bits: [
                    { bits: "15:12", name: "Pair 7,8 (MDI[3]±)", type: "RO", desc: "Skew = bit value × 8ns (±8ns accuracy)" },
                    { bits: "11:8", name: "Pair 4,5 (MDI[2]±)", type: "RO", desc: "Skew = bit value × 8ns (±8ns accuracy)" },
                    { bits: "7:4", name: "Pair 3,6 (MDI[1]±)", type: "RO", desc: "Skew = bit value × 8ns (±8ns accuracy)" },
                    { bits: "3:0", name: "Pair 1,2 (MDI[0]±)", type: "RO", desc: "Skew = bit value × 8ns (±8ns accuracy)" }
                ]
            },
            0x15: {
                name: "1000BASE-T Pair Swap and Polarity",
                bits: [
                    { bits: "15:7", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bit: 6, name: "Register 20 and 21 Valid", type: "RO", desc: "1=Valid, 0=Invalid" },
                    { bit: 5, name: "C, D Crossover", type: "RO", desc: "1=Channel C on MDI[2]±, Channel D on MDI[3]±; 0=Channel D on MDI[2]±, Channel C on MDI[3]±" },
                    { bit: 4, name: "A, B Crossover", type: "RO", desc: "1=Channel A on MDI[0]±, Channel B on MDI[1]±; 0=Channel B on MDI[0]±, Channel A on MDI[1]±" },
                    { bit: 3, name: "Pair 7,8 (MDI[3]±) Polarity", type: "RO", desc: "1=Negative, 0=Positive" },
                    { bit: 2, name: "Pair 4,5 (MDI[2]±) Polarity", type: "RO", desc: "1=Negative, 0=Positive" },
                    { bit: 1, name: "Pair 3,6 (MDI[1]±) Polarity", type: "RO", desc: "1=Negative, 0=Positive" },
                    { bit: 0, name: "Pair 1,2 (MDI[0]±) Polarity", type: "RO", desc: "1=Negative, 0=Positive" }
                ]
            },
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
            },
            0x18: {
                name: "Advanced VCT Sample Point Distance",
                bits: [
                    { bits: "15:10", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "9:0", name: "Distance to Measure/Distance to Start", type: "R/W, Retain", desc: "When mode=11: measurement taken at this distance; When mode=0x: distances below this not considered" }
                ]
            },
            0x19: {
                name: "Advanced VCT Cross Pair Positive Threshold",
                bits: [
                    { bit: 15, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "14:8", name: "Cross Pair Positive Threshold > 30m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Cross Pair Positive Threshold < 30m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" }
                ]
            },
            0x1A: {
                name: "Advanced VCT Same Pair Impedance Positive Threshold 0 and 1",
                bits: [
                    { bit: 15, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "14:8", name: "Same-Pair Positive Threshold 10m-50m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Same-Pair Positive Threshold < 10m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" }
                ]
            },
            0x1B: {
                name: "Advanced VCT Same Pair Impedance Positive Threshold 2 and 3",
                bits: [
                    { bit: 15, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "14:8", name: "Same-Pair Positive Threshold 110m-140m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Same-Pair Positive Threshold 50m-110m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" }
                ]
            },
            0x1C: {
                name: "Advanced VCT Same Pair Impedance Positive Threshold 4 and Transmit Pulse Control",
                bits: [
                    { bits: "15:14", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bit: 13, name: "First Peak/Last Peak Select", type: "R/W, Retain", desc: "0=First peak, 1=Last peak (when mode=01)" },
                    { bit: 12, name: "Break Link Prior to Measurement", type: "R/W, Retain", desc: "1=Do not wait 1.5s to break link, 0=Wait 1.5s" },
                    { bits: "11:10", name: "Transmit Pulse Width", type: "R/W, Retain", desc: "00=Full pulse (128ns), 01=3/4 pulse, 10=1/2 pulse, 11=1/4 pulse" },
                    { bits: "9:8", name: "Transmit Amplitude", type: "R/W, Retain", desc: "00=Full amplitude, 01=3/4 amplitude, 10=1/2 amplitude, 11=1/4 amplitude" },
                    { bit: 7, name: "Distance Measurement Point", type: "R/W, Retain", desc: "Measurement reference point selection" },
                    { bits: "6:0", name: "Same-Pair Positive Threshold > 140m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=7.81mV, ..., 0x7F=992mV" }
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
            },
            0x11: {
                name: "Copper Port CRC Counters",
                bits: [
                    { bits: "15:8", name: "Packet Count", type: "RO, Retain", desc: "0x00=No packets received, 0xFF=256 packets received (max count)" },
                    { bits: "7:0", name: "CRC Error Count", type: "RO, Retain", desc: "0x00=No CRC errors, 0xFF=256 CRC errors (max count)" }
                ]
            },
            0x12: {
                name: "Checker Control",
                bits: [
                    { bits: "15:5", name: "Reserved", type: "RO, Retain", desc: "Reserved" },
                    { bit: 4, name: "CRC Counter Reset", type: "R/W, SC", desc: "1=Reset (self-clears)" },
                    { bit: 3, name: "Enable Stub Test", type: "R/W, Retain", desc: "1=Enable stub test, 0=Normal operation" },
                    { bits: "2:0", name: "Reserved", type: "R/W, Retain", desc: "Reserved" }
                ]
            },
            0x1A: {
                name: "Misc Test",
                bits: [
                    { bit: 15, name: "TX_TCLK Enable", type: "R/W, Retain", desc: "1=Enable (highest numbered enabled port drives transmit clock), 0=Disable" },
                    { bits: "14:13", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bits: "12:8", name: "Temperature Threshold", type: "R/W, Retain", desc: "Temperature in °C = 5 × value - 25" },
                    { bit: 7, name: "Temperature Sensor Interrupt Enable", type: "R/W, Retain", desc: "1=Interrupt enable, 0=Interrupt disable" },
                    { bit: 6, name: "Temperature Sensor Interrupt", type: "RO, LH", desc: "1=Temperature reached threshold, 0=Below threshold" },
                    { bit: 5, name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bits: "4:0", name: "Temperature Sensor (5-bit)", type: "RO", desc: "Temperature in °C = 5 × value - 25" }
                ]
            },
            0x1B: {
                name: "Temperature Sensor",
                bits: [
                    { bits: "15:13", name: "Reserved", type: "R/W, Retain", desc: "Reserved" },
                    { bits: "12:11", name: "Temperature Sensor Number of Samples to Average", type: "R/W, Retain", desc: "00=5×2^9 samples, 01=5×2^11 samples, 10=5×2^13 samples, 11=5×2^15 samples" },
                    { bits: "10:8", name: "Temperature Sensor Sampling Rate", type: "R/W, Retain", desc: "000-001=Reserved, 010=168µs, 011=280µs, 100=816µs, 101=2.28ms, 110=6.22ms, 111=11.79ms" },
                    { bits: "7:0", name: "Temperature Sensor Alternative Reading (8-bit)", type: "RO", desc: "Temperature in °C = 1 × value - 25" }
                ]
            }
        }
    },
    7: {
        name: "Page 7 - PHY Cable Diagnostics",
        registers: {
            0x10: {
                name: "PHY Cable Diagnostics Pair 0 Length",
                bits: [
                    { bits: "15:0", name: "Pair 0 Cable Length", type: "RO, Retain", desc: "Length to fault in meters or centimeters based on register 21 bit 10" }
                ]
            },
            0x11: {
                name: "PHY Cable Diagnostics Pair 1 Length",
                bits: [
                    { bits: "15:0", name: "Pair 1 Cable Length", type: "RO, Retain", desc: "Length to fault in meters or centimeters based on register 21 bit 10" }
                ]
            },
            0x12: {
                name: "PHY Cable Diagnostics Pair 2 Length",
                bits: [
                    { bits: "15:0", name: "Pair 2 Cable Length", type: "RO, Retain", desc: "Length to fault in meters or centimeters based on register 21 bit 10" }
                ]
            },
            0x13: {
                name: "PHY Cable Diagnostics Pair 3 Length",
                bits: [
                    { bits: "15:0", name: "Pair 3 Cable Length", type: "RO, Retain", desc: "Length to fault in meters or centimeters based on register 21 bit 10" }
                ]
            },
            0x14: {
                name: "PHY Cable Diagnostics Results",
                bits: [
                    { bits: "15:12", name: "Pair 3 Fault Code", type: "RO, Retain", desc: "0000=Invalid, 0001=Pair OK, 0010=Pair Open, 0011=Same Pair Short, 0100=Cross Pair Short, 1001=Pair Busy" },
                    { bits: "11:8", name: "Pair 2 Fault Code", type: "RO, Retain", desc: "Same codes as Pair 3" },
                    { bits: "7:4", name: "Pair 1 Fault Code", type: "RO, Retain", desc: "Same codes as Pair 3" },
                    { bits: "3:0", name: "Pair 0 Fault Code", type: "RO, Retain", desc: "Same codes as Pair 3" }
                ]
            },
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
            },
            0x19: {
                name: "Advanced VCT Cross Pair Negative Threshold",
                bits: [
                    { bit: 15, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "14:8", name: "Cross Pair Negative Threshold > 30m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Cross Pair Negative Threshold < 30m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" }
                ]
            },
            0x1A: {
                name: "Advanced VCT Same Pair Impedance Negative Threshold 0 and 1",
                bits: [
                    { bit: 15, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "14:8", name: "Same-Pair Negative Threshold 10m-50m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Same-Pair Negative Threshold < 10m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" }
                ]
            },
            0x1B: {
                name: "Advanced VCT Same Pair Impedance Negative Threshold 2 and 3",
                bits: [
                    { bit: 15, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "14:8", name: "Same-Pair Negative Threshold 110m-140m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" },
                    { bit: 7, name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Same-Pair Negative Threshold 50m-110m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" }
                ]
            },
            0x1C: {
                name: "Advanced VCT Same Pair Impedance Negative Threshold 4",
                bits: [
                    { bits: "15:7", name: "Reserved", type: "RO", desc: "Reserved" },
                    { bits: "6:0", name: "Same-Pair Negative Threshold > 140m", type: "R/W, Retain", desc: "0x00=0mV, 0x01=-7.81mV, ..., 0x7F=-992mV" }
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

// localStorage helper functions
const STORAGE_KEYS = {
    selectedPage: 'phy_selectedPage',
    currentPhyPage: 'phy_currentPhyPage', 
    selectedRegister: 'phy_selectedRegister',
    registerValues: 'phy_registerValues',
    selectedPort: 'phy_selectedPort',
    currentPhyPort: 'phy_currentPhyPort'
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

function RegisterView({ pageNum, portNum, regAddr, regDef, currentValue, onValueChange, onGenerateCommand, currentPhyPage }) {
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
        
        // Show page switching if current PHY page is different from target page
        if (currentPhyPage !== pageNum) {
            commands.push(`# Set page to ${pageNum} (switching from page ${currentPhyPage} to page ${pageNum})`);
            commands.push(`mii write 0x1c 0x19 0x${pageNum.toString(16).padStart(4, '0').toUpperCase()}`);
            commands.push(`mii write 0x1c 0x18 0x${(0x9400 | (portNum << 5) | 0x16).toString(16).toUpperCase()}`); // Write to page register (0x16) for specific port
            commands.push('');
        }
        
        if (regAddr === 0x16) {
            commands.push(`# Read Page Address Register (0x16) from port ${portNum} - Current page selection`);
        } else {
            commands.push(`# Read register 0x${regAddr.toString(16).toUpperCase()} from port ${portNum}, page ${pageNum}`);
        }
        // DevAddr (bits 9:5) = portNum, RegAddr (bits 4:0) = regAddr, SMIOp = 10 (read), SMIMode = 1 (Clause 22), SMIBusy = 1
        const reg18Value = 0x9800 | (portNum << 5) | regAddr;
        commands.push(`mii write 0x1c 0x18 0x${reg18Value.toString(16).toUpperCase()}`);
        commands.push(`mii read 0x1c 0x19`);
        
        onGenerateCommand(commands.join('\n'));
    };

    const generateWriteCommand = () => {
        let commands = [];
        
        // Show page switching if current PHY page is different from target page
        if (currentPhyPage !== pageNum) {
            commands.push(`# Set page to ${pageNum} (switching from page ${currentPhyPage} to page ${pageNum})`);
            commands.push(`mii write 0x1c 0x19 0x${pageNum.toString(16).padStart(4, '0').toUpperCase()}`);
            commands.push(`mii write 0x1c 0x18 0x${(0x9400 | (portNum << 5) | 0x16).toString(16).toUpperCase()}`); // Write to page register (0x16) for specific port
            commands.push('');
        }
        
        if (regAddr === 0x16) {
            commands.push(`# Write to Page Address Register (0x16) on port ${portNum} - Switch to page 0x${(currentValue & 0xFF).toString(16).toUpperCase()}`);
        } else {
            commands.push(`# Write 0x${currentValue.toString(16).padStart(4, '0').toUpperCase()} to register 0x${regAddr.toString(16).toUpperCase()} on port ${portNum}, page ${pageNum}`);
        }
        commands.push(`mii write 0x1c 0x19 0x${currentValue.toString(16).padStart(4, '0').toUpperCase()}`);
        // DevAddr (bits 9:5) = portNum, RegAddr (bits 4:0) = regAddr, SMIOp = 01 (write), SMIMode = 1 (Clause 22), SMIBusy = 1
        const reg18Value = 0x9400 | (portNum << 5) | regAddr;
        commands.push(`mii write 0x1c 0x18 0x${reg18Value.toString(16).toUpperCase()}`);
        
        onGenerateCommand(commands.join('\n'));
    };

    return (
        <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px", margin: "8px 0" }}>
            <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#1f2937" }}>
                    Port {portNum} - Register 0x{regAddr.toString(16).toUpperCase()} ({regAddr}) - {regDef.name}
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
                            onBitRangeChange={handleBitRangeChange}
                            isReadOnly={isReadOnly}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function PHYRegisterPanel() {
    // Initialize state from localStorage
    const [selectedPage, setSelectedPage] = useState(() => loadFromStorage(STORAGE_KEYS.selectedPage, 0));
    const [selectedRegister, setSelectedRegister] = useState(() => loadFromStorage(STORAGE_KEYS.selectedRegister, 0x00));
    const [registerValues, setRegisterValues] = useState(() => loadFromStorage(STORAGE_KEYS.registerValues, {}));
    const [generatedCommand, setGeneratedCommand] = useState('');
    const [readResult, setReadResult] = useState('');
    const [currentPhyPage, setCurrentPhyPage] = useState(() => loadFromStorage(STORAGE_KEYS.currentPhyPage, 0)); // Track the actual PHY page
    const [selectedPort, setSelectedPort] = useState(() => loadFromStorage(STORAGE_KEYS.selectedPort, 0)); // Current UI port selection
    const [currentPhyPort, setCurrentPhyPort] = useState(() => loadFromStorage(STORAGE_KEYS.currentPhyPort, 0)); // Track the actual PHY port

    const currentValue = registerValues[`${selectedPort}_${selectedPage}_${selectedRegister.toString(16)}`] || 0;

    // Save state to localStorage whenever it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedPage, selectedPage);
    }, [selectedPage]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedRegister, selectedRegister);
    }, [selectedRegister]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.registerValues, registerValues);
    }, [registerValues]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.currentPhyPage, currentPhyPage);
    }, [currentPhyPage]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.selectedPort, selectedPort);
    }, [selectedPort]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.currentPhyPort, currentPhyPort);
    }, [currentPhyPort]);

    // Validate that selectedRegister exists on selectedPage, fallback to first register if not
    useEffect(() => {
        const currentPageData = PHY_REGISTERS[selectedPage];
        if (currentPageData && !currentPageData.registers[selectedRegister]) {
            const firstRegister = parseInt(Object.keys(currentPageData.registers)[0]);
            setSelectedRegister(firstRegister);
        }
    }, [selectedPage, selectedRegister]);

    const setCurrentValue = (value) => {
        setRegisterValues(prev => ({
            ...prev,
            [`${selectedPort}_${selectedPage}_${selectedRegister.toString(16)}`]: value
        }));
    };

    const handleGenerateCommand = (command) => {
        setGeneratedCommand(command);
        
        // Update current PHY page if we're switching pages
        if (selectedPage !== currentPhyPage) {
            setCurrentPhyPage(selectedPage);
        }
        
        // Update current PHY port if we're switching ports
        if (selectedPort !== currentPhyPort) {
            setCurrentPhyPort(selectedPort);
        }
        
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
            
            // If we're parsing the page register (0x16), update the current PHY page
            if (selectedRegister === 0x16) {
                const newPage = value & 0xFF;
                setCurrentPhyPage(newPage);
            }
        } catch (e) {
            alert('Invalid hex value format');
        }
    };

    const resetPhyPage = () => {
        setCurrentPhyPage(0);
    };

    const clearAllStoredData = () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        setSelectedPage(0);
        setSelectedRegister(0x00);
        setRegisterValues({});
        setCurrentPhyPage(0);
        setSelectedPort(0);
        setCurrentPhyPort(0);
    };

    const currentPageData = PHY_REGISTERS[selectedPage];
    const currentRegisterData = currentPageData?.registers[selectedRegister];

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", color: "#1f2937", marginBottom: "16px" }}>
                🔧 88E6321 PHY Register Utility
            </h2>

            {/* Page Status */}
            <div style={{ 
                textAlign: "center", 
                marginBottom: "16px",
                padding: "12px",
                background: currentPhyPage !== selectedPage ? "#fef3c7" : "#ecfdf5",
                border: `1px solid ${currentPhyPage !== selectedPage ? "#f59e0b" : "#10b981"}`,
                borderRadius: "8px"
            }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                    PHY Current Page: {currentPhyPage} | Viewing Page: {selectedPage}
                </div>
                {currentPhyPage !== selectedPage && (
                    <div style={{ fontSize: "12px", color: "#92400e", marginTop: "4px" }}>
                        ⚠️ Page switch required! Commands will include page switching instructions.
                    </div>
                )}
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                    Register 22 (0x16) controls page switching. All non-page-0 registers require page selection first.
                </div>
            </div>

            {/* Port Status */}
            <div style={{ 
                textAlign: "center", 
                marginBottom: "24px",
                padding: "12px",
                background: currentPhyPort !== selectedPort ? "#fef3c7" : "#ecfdf5",
                border: `1px solid ${currentPhyPort !== selectedPort ? "#f59e0b" : "#10b981"}`,
                borderRadius: "8px"
            }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                    PHY Current Port: {currentPhyPort} | Viewing Port: {selectedPort}
                </div>
                {currentPhyPort !== selectedPort && (
                    <div style={{ fontSize: "12px", color: "#92400e", marginTop: "4px" }}>
                        ⚠️ Port switch required! Commands will target the selected port.
                    </div>
                )}
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                    DevAddr field (bits 9:5) in register 18 controls port selection. Each port has its own PHY register set.
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                        onClick={resetPhyPage}
                        style={{
                            padding: "4px 8px",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "10px"
                        }}
                    >
                        Reset PHY to Page 0
                    </button>
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
                <h3 style={{ marginBottom: "8px", color: "#374151" }}>Select Port:</h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((portNum) => (
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
                            Port {portNum}
                        </button>
                    ))}
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                    Each port has its own independent set of PHY registers
                </p>
            </div>

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
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "8px" }}>
                        {Object.entries(currentPageData.registers).map(([regAddr, regData]) => (
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
            )}

            {/* Register Details */}
            {currentRegisterData && (
                <RegisterView
                    pageNum={selectedPage}
                    portNum={selectedPort}
                    regAddr={selectedRegister}
                    regDef={currentRegisterData}
                    currentValue={currentValue}
                    onValueChange={setCurrentValue}
                    onGenerateCommand={handleGenerateCommand}
                    currentPhyPage={currentPhyPage}
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