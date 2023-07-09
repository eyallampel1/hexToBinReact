import React from "react";
import "./HexToBin.css";
import { useState, useEffect } from "react";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers";

//componenet to display one byte both hex and bin forms, gets data from props.data and lifts data back with props.updateBit
const HexToBin = (props) => {
  const [ErrorFlag, setErrorFlag] = useState(false);
  const [HexValue, setHexValue] = useState("");

  useEffect(() => {
    setHexValue(ConvertBinToHex(props.data));
  }, [props.data]);

  const ChangeHexHandler = (event) => {
    const convertedHex = ConvertHexToBin(event.target.value);
    if (convertedHex) {
      setErrorFlag(false);
      setHexValue(event.target.value);
      props.updateByte(props.index, ConvertHexToBin(event.target.value));
    } else {
      setErrorFlag(true);
    }
  };

  return (
    <div className="byte_container">
      <input
        type="text"
        className="HexInput"
        value={HexValue}
        onChange={ChangeHexHandler}
        maxlength="1"
      ></input>
      <div className="btn_container">
        <button onClick={() => props.updateBit(props.index, 3)}>
          {props.data[0]}
        </button>
        <button onClick={() => props.updateBit(props.index, 2)}>
          {props.data[1]}
        </button>
        <button onClick={() => props.updateBit(props.index, 1)}>
          {props.data[2]}
        </button>
        <button onClick={() => props.updateBit(props.index, 0)}>
          {props.data[3]}
        </button>
      </div>
      <h4>
        {`${props.index * 4 + 3}
        ${props.index * 4 + 2}
        ${props.index * 4 + 1}
        ${props.index * 4 + 0}`}
      </h4>
    </div>
  );
};

export default HexToBin;
