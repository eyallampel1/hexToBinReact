import React, { useState, useEffect } from "react";
import "./HexToBin.css";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers";
import { useTheme } from "../context/ThemeContext";

// This component displays a byte in both hexadecimal and binary form.
// It gets the binary data from props.data and uses props.updateBit to propagate changes to its parent component.
const HexToBin = (props) => {
  const { colors } = useTheme();

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
    <div
      className="byte_container"
      style={{
        backgroundColor: colors.hexDisplay.container,
        borderColor: colors.border.primary,
        transition: "all 0.3s ease"
      }}
    >
      <input
        type="text"
        className="HexInput"
        value={HexValue}
        onChange={ChangeHexHandler}
        maxLength="1"
        style={{
          backgroundColor: colors.hexDisplay.input.bg,
          color: colors.hexDisplay.input.text,
          borderColor: colors.border.primary,
          transition: "all 0.3s ease"
        }}
      />

      <button
        onClick={() => props.updateBit(props.index, 3)}
        style={{
          backgroundImage: colors.hexDisplay.button.bg,
          borderColor: colors.border.secondary,
          color: colors.hexDisplay.button.text,
          transition: "all 0.3s ease"
        }}
        onMouseDown={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.active;
        }}
        onMouseUp={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
      >
        {props.data[0]}
      </button>
      {/* <label>{props.index * 4 + 3}</label> */}
      {props.displayMode ? (
        <label style={{ color: colors.hexDisplay.label }}>{Math.abs(props.index - (props.size / 4 - 1)) * 4 + 0}</label>
      ) : (
        <label style={{ color: colors.hexDisplay.label }}>{props.index * 4 + 3}</label>
      )}
      <button
        onClick={() => props.updateBit(props.index, 2)}
        style={{
          backgroundImage: colors.hexDisplay.button.bg,
          borderColor: colors.border.secondary,
          color: colors.hexDisplay.button.text,
          transition: "all 0.3s ease"
        }}
        onMouseDown={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.active;
        }}
        onMouseUp={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
      >
        {props.data[1]}
      </button>
      {/* <label>{props.index * 4 + 2}</label> */}
      {props.displayMode ? (
        <label style={{ color: colors.hexDisplay.label }}>{index * 4 + 1}</label>
      ) : (
        <label style={{ color: colors.hexDisplay.label }}>{index * 4 + 2}</label>
      )}
      <button
        onClick={() => props.updateBit(props.index, 1)}
        style={{
          backgroundImage: colors.hexDisplay.button.bg,
          borderColor: colors.border.secondary,
          color: colors.hexDisplay.button.text,
          transition: "all 0.3s ease"
        }}
        onMouseDown={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.active;
        }}
        onMouseUp={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
      >
        {props.data[2]}
      </button>
      {/* <label>{props.index * 4 + 1}</label> */}
      {props.displayMode ? (
        <label style={{ color: colors.hexDisplay.label }}>{index * 4 + 2}</label>
      ) : (
        <label style={{ color: colors.hexDisplay.label }}>{index * 4 + 1}</label>
      )}
      <button
        onClick={() => props.updateBit(props.index, 0)}
        style={{
          backgroundImage: colors.hexDisplay.button.bg,
          borderColor: colors.border.secondary,
          color: colors.hexDisplay.button.text,
          transition: "all 0.3s ease"
        }}
        onMouseDown={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.active;
        }}
        onMouseUp={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundImage = colors.hexDisplay.button.bg;
        }}
      >
        {props.data[3]}
      </button>
      {/* <label>{props.index * 4 + 0}</label> */}
      {props.displayMode ? (
        <label style={{ color: colors.hexDisplay.label }}>{index * 4 + 3}</label>
      ) : (
        <label style={{ color: colors.hexDisplay.label }}>{index * 4 + 0}</label>
      )}

    </div>
  );
};

export default HexToBin;
