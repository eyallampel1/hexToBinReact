import React from "react";
import "./App.css";
import { useState } from "react";
import HexDisplay from "./component/HexDisplay";

function App() {
  const [UserInput, setUserInput] = useState("");
  const [InputError, setInputError] = useState(false);
  const [NumSize, setNumSize] = useState(16);

  const InputChangeHandler = (event) => {
    const input = event.currentTarget.value;
    if (/^[0-9a-f]+$/.test(input) || input === "") {
      setInputError(false);
      setUserInput(input);
    } else {
      setInputError(true);
    }
  };

  return (
    <React.Fragment>
      <h1>Hex to Binary convertor</h1>
      <div className="number_display">
        <HexDisplay size={NumSize} user_input={UserInput} />
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
        {/* <label className="radio_label">16bit</label> */}

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
        {/* <label className="radio_label">32bit</label> */}

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
        {/* <label className="radio_label">64bit</label> */}
      </div>

      {InputError && <h4 classname="error_msg">Hex Only!</h4>}
    </React.Fragment>
  );
}

export default App;
