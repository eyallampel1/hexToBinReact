import React, { useState, useEffect } from "react";
import HexDisplay from "./HexDisplay";
import { ConvertBinToHex } from "../helpers";
import "./HexToBin.css";

// localStorage helper functions for HexToBinApp
const HEX_STORAGE_KEYS = {
  userInput: 'hexToBin_userInput',
  bitSize: 'hexToBin_bitSize',
  displayMode: 'hexToBin_displayMode'
};

const loadFromStorageHex = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
    return defaultValue;
  }
};

const saveToStorageHex = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

const HexToBinApp = () => {
  // Initialize state from localStorage
  const [userInput, setUserInput] = useState(() => loadFromStorageHex(HEX_STORAGE_KEYS.userInput, ""));
  const [bitsArray, setBitsArray] = useState(Array(64).fill(0));
  const [trigger, setTrigger] = useState(0);
  const [displayMode, setDisplayMode] = useState(() => loadFromStorageHex(HEX_STORAGE_KEYS.displayMode, false));
  const [bitSize, setBitSize] = useState(() => loadFromStorageHex(HEX_STORAGE_KEYS.bitSize, 16));

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToStorageHex(HEX_STORAGE_KEYS.userInput, userInput);
  }, [userInput]);

  useEffect(() => {
    saveToStorageHex(HEX_STORAGE_KEYS.bitSize, bitSize);
  }, [bitSize]);

  useEffect(() => {
    saveToStorageHex(HEX_STORAGE_KEYS.displayMode, displayMode);
  }, [displayMode]);

  // Trigger initial conversion when component mounts with stored userInput
  useEffect(() => {
    if (userInput) {
      setTrigger(prev => prev + 1);
    }
  }, []); // Only run on mount

  const updateHandler = (newBits) => {
    setBitsArray(newBits);
  };

  const handleInputChange = (event) => {
    const input = event.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    if (input.length <= 16) {
      setUserInput(input);
      setTrigger(prev => prev + 1);
    }
  };

  const handleClear = () => {
    setUserInput("");
    setBitsArray(Array(64).fill(0));
    setTrigger(prev => prev + 1);
  };

  const getHexOutput = () => {
    const relevantBits = bitsArray.slice(64 - bitSize);
    let hex = "";
    for (let i = 0; i < relevantBits.length; i += 4) {
      const nibble = relevantBits.slice(i, i + 4);
      hex = ConvertBinToHex(nibble) + hex;
    }
    return hex.toUpperCase().padStart(bitSize / 4, "0");
  };

  const getBinaryOutput = () => {
    const relevantBits = bitsArray.slice(64 - bitSize);
    return relevantBits.join("");
  };

  const getDecimalOutput = () => {
    const binaryString = getBinaryOutput();
    return parseInt(binaryString, 2).toString();
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#1f2937", marginBottom: "2rem" }}>
        🔢 Hex ↔ Binary Converter
      </h1>

      {/* Input Section */}
      <div style={{ 
        background: "#f8fafc", 
        padding: "20px", 
        borderRadius: "8px", 
        marginBottom: "20px",
        border: "1px solid #e2e8f0"
      }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#374151" }}>Input (Hexadecimal)</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>0x</span>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Enter hex (up to 16 chars)"
              style={{
                padding: "10px",
                fontSize: "16px",
                fontFamily: "monospace",
                border: "2px solid #d1d5db",
                borderRadius: "6px",
                width: "300px",
                textTransform: "uppercase"
              }}
              maxLength={16}
            />
          </div>
          <button
            onClick={handleClear}
            style={{
              padding: "10px 15px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        background: "#f1f5f9", 
        padding: "15px", 
        borderRadius: "8px", 
        marginBottom: "20px",
        display: "flex",
        gap: "20px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <div>
          <label style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
            Bit Size:
          </label>
          <select
            value={bitSize}
            onChange={(e) => setBitSize(parseInt(e.target.value))}
            style={{ padding: "5px", borderRadius: "4px", border: "1px solid #d1d5db" }}
          >
            <option value={8}>8-bit</option>
            <option value={16}>16-bit</option>
            <option value={32}>32-bit</option>
            <option value={64}>64-bit</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
            <input
              type="checkbox"
              checked={displayMode}
              onChange={(e) => setDisplayMode(e.target.checked)}
              style={{ marginRight: "5px" }}
            />
            Reverse Bit Order
          </label>
        </div>
      </div>

      {/* Interactive Binary Display */}
      <div style={{ 
        background: "#ffffff", 
        padding: "20px", 
        borderRadius: "8px", 
        border: "2px solid #3b82f6",
        marginBottom: "20px"
      }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#1f2937" }}>Interactive Binary Display</h3>
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "15px" }}>
          Click on individual bits to toggle them, or modify hex values directly
        </p>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "5px",
          justifyContent: "center",
          padding: "10px 0"
        }}>
          <HexDisplay
            user_input={userInput}
            update_handler={updateHandler}
            trigger={trigger}
            displayMode={displayMode}
            size={bitSize}
          />
        </div>
      </div>

      {/* Output Section */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "15px" 
      }}>
        <div style={{ 
          background: "#ecfdf5", 
          padding: "15px", 
          borderRadius: "8px", 
          border: "1px solid #10b981" 
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#065f46" }}>Hexadecimal</h4>
          <div style={{ 
            fontFamily: "monospace", 
            fontSize: "16px", 
            fontWeight: "bold",
            color: "#047857",
            wordBreak: "break-all"
          }}>
            0x{getHexOutput()}
          </div>
        </div>

        <div style={{ 
          background: "#fef3c7", 
          padding: "15px", 
          borderRadius: "8px", 
          border: "1px solid #f59e0b" 
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#92400e" }}>Binary</h4>
          <div style={{ 
            fontFamily: "monospace", 
            fontSize: "14px", 
            fontWeight: "bold",
            color: "#b45309",
            wordBreak: "break-all",
            lineHeight: "1.4"
          }}>
            {getBinaryOutput().match(/.{1,4}/g)?.join(" ") || "0000"}
          </div>
        </div>

        <div style={{ 
          background: "#e0f2fe", 
          padding: "15px", 
          borderRadius: "8px", 
          border: "1px solid #0ea5e9" 
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#0c4a6e" }}>Decimal</h4>
          <div style={{ 
            fontFamily: "monospace", 
            fontSize: "16px", 
            fontWeight: "bold",
            color: "#0369a1",
            wordBreak: "break-all"
          }}>
            {getDecimalOutput()}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        background: "#f8fafc", 
        padding: "15px", 
        borderRadius: "8px", 
        marginTop: "20px",
        fontSize: "14px",
        color: "#64748b"
      }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#374151" }}>How to use:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          <li>Enter a hexadecimal value in the input field (without 0x prefix)</li>
          <li>Click on individual bits to toggle them on/off</li>
          <li>Modify hex values directly in the small input boxes above each 4-bit group</li>
          <li>Use the controls to change bit size and display mode</li>
          <li>All representations (hex, binary, decimal) update in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default HexToBinApp;