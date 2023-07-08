import React from "react";
import "./HexToBin.css";
import { useState } from "react";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers";

//componenet to display one byte both hex and bin forms, gets data from props.data and lifts data back with props.updateBit
const HexToBin = (props) => {
  return (
    <div className="byte_container">
      <input
        type="text"
        className="HexInput"
        // onChange={ConvertToBin}
        maxlength="1"
      ></input>
      <div className="btn_container">
        <button>{props.data[0]}</button>
        <button>{props.data[1]}</button>
        <button>{props.data[2]}</button>
        <button>{props.data[3]}</button>
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
