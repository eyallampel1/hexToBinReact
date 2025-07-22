import React, { useState } from "react";
import "./App.css";

import HexDisplay from "./component/HexDisplay";
import { ConvertBinToHex } from "./helpers";
import MiiCommandBuilder from "./MiiCommandBuilder";

function App() {
    // ---------------- hex‑to‑bin state ----------------
    const [userInput,   setUserInput]   = useState("");
    const [inputError,  setInputError]  = useState(false);
    const [numSize,     setNumSize]     = useState(16);
    const [trig,        setTrig]        = useState(false);
    const [displayMode, setDisplayMode] = useState(false);

    // ---------------- tool selector -------------------
    const [tool, setTool] = useState("hex");   // "hex" | "mii"

    // -------------- input handler ---------------------
    const inputChangeHandler = (e) => {
        const input = e.currentTarget.value;
        if (/^[0-9a-fA-F]*$/.test(input)) {
            setInputError(false);
            setUserInput(input);
            setTrig((p) => !p);
        } else {
            setInputError(true);
        }
    };

    // -------------- update from child -----------------
    const updateInput = (bits) => {
        const hi = bits.slice(0, 32);
        const lo = bits.slice(32);
        const hex =
            ConvertBinToHex(hi) !== "0"
                ? ConvertBinToHex(hi) + ConvertBinToHex(lo)
                : ConvertBinToHex(lo);
        setUserInput(hex);
    };

    // ==================================================
    //                       UI
    // ==================================================
    return (
        <>
            {/* simple top bar */}
            <nav style={{ display: "flex", gap: 12, padding: 12 }}>
                <button onClick={() => setTool("hex")}>Hex ↔ Bin</button>
                <button onClick={() => setTool("mii")}>MII Cmd Builder</button>
            </nav>

            {/* choose tool */}
            {tool === "hex" ? (
                <>
                    <h1>Hex to Binary converter</h1>

                    {/* bit / hex viewer */}
                    <div className="number_display">
                        <HexDisplay
                            size={numSize}
                            user_input={userInput}
                            trigger={trig}
                            update_handler={updateInput}
                            displayMode={displayMode}
                        />
                    </div>

                    {/* hex input */}
                    <input
                        type="text"
                        maxLength="16"
                        value={userInput}
                        className={`input_hex ${inputError ? "input_error" : ""}`}
                        onChange={inputChangeHandler}
                        onBlur={() => setInputError(false)}
                    />

                    {/* size radio buttons */}
                    <div className="radio_container">
                        {["16bit", "32bit", "64bit"].map((lbl) => (
                            <label key={lbl} style={{marginRight: 12}}>
                                <input
                                    className="radio_input"
                                    type="radio"
                                    name="wordSize"
                                    id={lbl}
                                    defaultChecked={lbl === "16bit"}
                                    onChange={(e) => setNumSize(parseInt(lbl, 10))}
                                />
                                {lbl}
                            </label>
                        ))}
                    </div>


                    {/* flip order */}
                    <button onClick={() => setDisplayMode((p) => !p)}>Change</button>

                    {inputError && <h4 className="error_msg">Hex Only!</h4>}
                </>
            ) : (
                <MiiCommandBuilder/>
            )}
        </>
    );
}

export default App;