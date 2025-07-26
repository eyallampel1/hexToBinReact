import React, { useState, useEffect } from "react";
import "./HexToBin.css";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers";

// This component displays a byte in both hexadecimal and binary form.
// It gets the binary data from props.data and uses props.updateBit to propagate changes to its parent component.
const HexToBin = (props) => {
  // ErrorFlag is a state variable to handle conversion errors
  const [ErrorFlag, setErrorFlag] = useState(false);
  // HexValue is a state variable that holds the hex value
  const [HexValue, setHexValue] = useState("");

  // When the prop data changes, convert the binary data to hex and store it in HexValue
  useEffect(() => {
    setHexValue(ConvertBinToHex(props.data));
  }, [props.data]);

  // Event handler for changes in the hex input field
  const ChangeHexHandler = (event) => {
    const convertedHex = ConvertHexToBin(event.target.value);
    if (convertedHex) {  // If conversion is successful
      setErrorFlag(false);
      setHexValue(event.target.value);
      // Convert the hex value to binary and update the parent component
      props.updateByte(props.index, ConvertHexToBin(event.target.value));
    } else {  // If conversion fails, set error flag
      setErrorFlag(true);
    }
  };

  let index = 0;
  if (props.displayMode) {
    index = Math.abs(props.index - (props.size / 4 - 1));
  } else {
    index = props.index;
  }

  return (
    // Byte container has an input field for hexadecimal values and buttons to toggle individual bits
    <div className="byte_container">
      <input
        type="text"
        className="HexInput"
        value={HexValue}
        onChange={ChangeHexHandler}
        maxlength="1"
      ></input>

      <button onClick={() => props.updateBit(props.index, 3)}>
        {props.data[0]}
      </button>
      {/* <label>{props.index * 4 + 3}</label> */}
      {props.displayMode ? (
        <label>{Math.abs(props.index - (props.size / 4 - 1)) * 4 + 0}</label>
      ) : (
        <label>{props.index * 4 + 3}</label>
      )}
      <button onClick={() => props.updateBit(props.index, 2)}>
        {props.data[1]}
      </button>
      {/* <label>{props.index * 4 + 2}</label> */}
      {props.displayMode ? (
        <label>{index * 4 + 1}</label>
      ) : (
        <label>{index * 4 + 2}</label>
      )}
      <button onClick={() => props.updateBit(props.index, 1)}>
        {props.data[2]}
      </button>
      {/* <label>{props.index * 4 + 1}</label> */}
      {props.displayMode ? (
        <label>{index * 4 + 2}</label>
      ) : (
        <label>{index * 4 + 1}</label>
      )}
      <button onClick={() => props.updateBit(props.index, 0)}>
        {props.data[3]}
      </button>
      {/* <label>{props.index * 4 + 0}</label> */}
      {props.displayMode ? (
        <label>{index * 4 + 3}</label>
      ) : (
        <label>{index * 4 + 0}</label>
      )}

    </div>
  );
};

export default HexToBin;
