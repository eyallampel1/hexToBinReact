import React from "react";
import "./App.css";
import { useState } from "react";
import HexDisplay from "./component/HexDisplay";
import { ConvertBinToHex } from "./helpers";

function App() {
  const [UserInput, setUserInput] = useState("");
  const [InputError, setInputError] = useState(false);
  const [NumSize, setNumSize] = useState(16);
  const [trig, setTrig] = useState(false);

  const InputChangeHandler = (event) => {
    const input = event.currentTarget.value;
    if (/^[0-9a-f]+$/.test(input) || input === "") {
      setInputError(false);
      setUserInput(input);
      setTrig((prev) => !prev);
    } else {
      setInputError(true);
    }
  };

  const UpdateInput = (number) => {
    const number_H = number.slice(0, 32);
    const number_L = number.slice(32);
    const hex_num = !(ConvertBinToHex(number_H) === "0")
      ? ConvertBinToHex(number_H) + ConvertBinToHex(number_L)
      : ConvertBinToHex(number_L);
    setUserInput(hex_num);
  };

  return (
    <React.Fragment>
      <h1>Hex to Binary convertor</h1>
      <div className="number_display">
        <HexDisplay
          size={NumSize}
          user_input={UserInput}
          trigger={trig}
          update_handler={UpdateInput}
        />
      </div>
      <input
        type="text"
        maxlength="16"
        value={UserInput}
        className={`input_hex ${InputError ? "input_error" : ""}`}
        onChange={InputChangeHandler}
        onBlur={() => setInputError(false)}
      ></input>
      <div className="radio_container">
        <input
          className="radio_input"
          label="16bit"
          type="radio"
          id="16bit"
          name="drone"
          value="16bit"
          defaultChecked
          onChange={(event) => {
            setNumSize(parseInt(event.target.id.slice(0, 2)));
          }}
        />

        <input
          className="radio_input"
          label="32bit"
          type="radio"
          id="32bit"
          name="drone"
          value="32bit"
          onChange={(event) => {
            setNumSize(parseInt(event.target.id.slice(0, 2)));
          }}
        />

        <input
          className="radio_input"
          label="64bit"
          type="radio"
          id="64bit"
          name="drone"
          value="64bit"
          onChange={(event) => {
            setNumSize(parseInt(event.target.id.slice(0, 2)));
          }}
        />
      </div>

      {InputError && <h4 classname="error_msg">Hex Only!</h4>}
    </React.Fragment>
  );
}

export default App;
