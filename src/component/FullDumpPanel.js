import React, { useState, useMemo } from "react";
import { NumInput, toWord } from "./MiiHelpers";

export default function FullDumpPanel() {
    const [dumpType, setDumpType] = useState("all");
    const [startPhy, setStartPhy] = useState("00");
    const [endPhy, setEndPhy] = useState("1F");
    const [regRange, setRegRange] = useState("0-31");

    const script = useMemo(() => {
        const lines = ["#!/bin/bash", "# MII Register Dump Script", ""];

        if (dumpType === "all" || dumpType === "phy") {
            const start = toWord(startPhy) & 0x1f;
            const end = toWord(endPhy) & 0x1f;

            lines.push("echo '=== PHY Register Dump with Page Switching ==='");
            lines.push(`for phy in $(seq ${start} ${end}); do`);
            lines.push("  echo \"\"");
            lines.push("  echo \"PHY Address: $phy\"");
            lines.push("  echo \"======================\"");
            
            // Define available pages and their descriptions
            const pages = [
                { page: 0, name: "Basic Control/Status" },
                { page: 2, name: "MAC Specific Control" },
                { page: 5, name: "Advanced VCT" },
                { page: 6, name: "Packet Generation" },
                { page: 7, name: "Cable Diagnostics" }
            ];

            // Loop through each page
            pages.forEach(({ page, name }) => {
                lines.push("  echo \"\"");
                lines.push(`  echo \"  Page ${page} - ${name}\"`);
                lines.push("  echo \"  ------------------------\"");
                
                // Switch to the specific page using SMI indirect access
                lines.push(`  # Switch to page ${page}`);
                lines.push(`  mii write 0x1c 0x19 0x$(printf "%04X" ${page}) 2>/dev/null`);
                lines.push(`  mii write 0x1c 0x18 0x$(printf "%04X" $((0x9400 | ($phy << 5) | 0x16))) 2>/dev/null`);
                lines.push("  sleep 0.01  # Brief delay for page switch");
                
                // Read registers from this page
                const [regStart, regEnd] = regRange.split("-").map(n => parseInt(n) || 0);
                lines.push(`  for reg in $(seq ${regStart} ${regEnd}); do`);
                lines.push("    # Read register using SMI indirect access");
                lines.push(`    mii write 0x1c 0x18 0x$(printf "%04X" $((0x9800 | ($phy << 5) | $reg))) 2>/dev/null`);
                lines.push("    val=$(mii read 0x1c 0x19 2>/dev/null | tail -n1)");
                lines.push("    if [ ! -z \"$val\" ]; then");
                lines.push("      printf \"    Reg 0x%02X: %s\\n\" $reg \"$val\"");
                lines.push("    fi");
                lines.push("  done");
            });
            
            lines.push("  echo \"\"");
            lines.push("  # Reset to page 0 after dump");
            lines.push("  mii write 0x1c 0x19 0x0000 2>/dev/null");
            lines.push("  mii write 0x1c 0x18 0x$(printf \"%04X\" $((0x9400 | ($phy << 5) | 0x16))) 2>/dev/null");
            lines.push("done");
        }

        if (dumpType === "all" || dumpType === "switch") {
            lines.push("", "echo ''", "echo '=== Switch Global Registers ==='");
            lines.push("# Global registers at PHY 0x1B");
            lines.push("for reg in 0 1 3 4 5 6 10 11; do");
            lines.push("  val=$(mii read 0x1B $reg 2>/dev/null | tail -n1)");
            lines.push("  printf \"Global Reg 0x%02X: %s\\n\" $reg \"$val\"");
            lines.push("done");

            lines.push("", "echo ''", "echo '=== Port Status ==='");
            lines.push("# Port status for ports 0-6");
            lines.push("for port in $(seq 0 6); do");
            lines.push("  phy=$((0x10 + $port))");
            lines.push("  status=$(mii read $phy 0 2>/dev/null | tail -n1)");
            lines.push("  control=$(mii read $phy 1 2>/dev/null | tail -n1)");
            lines.push("  echo \"Port $port - Status: $status, Control: $control\"");
            lines.push("done");
        }

        if (dumpType === "indirect") {
            lines.push("echo '=== Indirect Register Access ==='");
            lines.push("# Read all ATU entries");
            lines.push("mii write 0x1c 0x18 0x8C0B  # ATU operation");
            lines.push("mii read 0x1c 0x19");
            lines.push("");
            lines.push("# Read VLAN table");
            lines.push("for vlan in 1 100 200; do");
            lines.push("  echo \"VLAN $vlan:\"");
            lines.push("  mii write 0x1c 0x19 $vlan");
            lines.push("  mii write 0x1c 0x18 0x8606  # Read VLAN");
            lines.push("  mii read 0x1c 0x19");
            lines.push("done");
        }

        return lines.join("\n");
    }, [dumpType, startPhy, endPhy, regRange]);

    return (
        <div style={{ marginTop: 32 }}>
            <h3>📄 Full Register Dump Generator</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                    <label style={{ fontSize: 12 }}>Dump Type</label>
                    <select
                        value={dumpType}
                        onChange={(e) => setDumpType(e.target.value)}
                        style={{ padding: 4, marginTop: 4, display: "block" }}
                    >
                        <option value="all">Complete Dump</option>
                        <option value="phy">PHY Registers Only</option>
                        <option value="switch">Switch Registers Only</option>
                        <option value="indirect">Indirect Access Tables</option>
                    </select>
                </div>

                {(dumpType === "all" || dumpType === "phy") && (
                    <>
                        <NumInput label="Start PHY" value={startPhy} onChange={setStartPhy} max={2} />
                        <NumInput label="End PHY" value={endPhy} onChange={setEndPhy} max={2} />
                        <div>
                            <label style={{ fontSize: 12 }}>Register Range</label>
                            <select
                                value={regRange}
                                onChange={(e) => setRegRange(e.target.value)}
                                style={{ padding: 4, marginTop: 4, display: "block" }}
                            >
                                <option value="0-31">All (0-31)</option>
                                <option value="0-15">Standard (0-15)</option>
                                <option value="16-31">Extended (16-31)</option>
                                <option value="0-7">Basic (0-7)</option>
                            </select>
                        </div>
                    </>
                )}
            </div>

            <div style={{ background: "#fef3c7", padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12 }}>
                <strong>💡 Tip:</strong> Save this script to a file and run with: <code>chmod +x dump.sh && ./dump.sh > mii_dump.txt</code>
            </div>

            <pre style={{ background: "#065f46", color: "#6ee7b7", padding: 8, whiteSpace: "pre-wrap", borderRadius: 4, fontSize: 11, maxHeight: 400, overflowY: "auto" }}>{script}</pre>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                    onClick={() => {
                        const blob = new Blob([script], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "mii_dump.sh";
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    style={{ padding: "6px 12px", background: "#059669", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                    Download Script
                </button>
                <button
                    onClick={() => navigator.clipboard.writeText(script)}
                    style={{ padding: "6px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                    Copy Script
                </button>
            </div>
        </div>
    );
}