import React, { useState, useEffect } from "react";
import HexToBin from "./HexToBin";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers.js";

const HexDisplay = (props) => {
  //this holds our number at all times. LSB is 63 , MSB is 0 this means bit n is BitsArray[63-n]
  const [BitsArray, setBitsArray] = useState(Array(64).fill(0));

  //this will update on bit in BitsArray in the correct index
  const updateBit = (base, offset) => {
    const index = base * 4 + offset;
    setBitsArray((prev) => {
      const newBits = [...prev];
      newBits[63 - index] = (newBits[63 - index] + 1) % 2;
      return newBits;
    });
  };

  const updateByte = (base, byte) => {
    const index = base * 4;
    console.log(byte);
    setBitsArray((prev) => {
      const newBits = [...prev];
      newBits.splice(60 - index, 4, ...byte);
      return newBits;
    });
  };

  //update BitsArray when user inputs hex number
  useEffect(() => {
    console.log(parseInt(props.user_input, 16).toString(2).padStart(64, 0));
  }, [props.user_input]);

  //props.size/4 => number of HexToBin components to render.
  return (
    <React.Fragment>
      {[...Array(props.size / 4)].map((_, i) => (
        <HexToBin
          key={i}
          index={props.size / 4 - i - 1}
          data={BitsArray.slice(
            64 - props.size + i * 4,
            64 - props.size + i * 4 + 4
          )}
          updateBit={updateBit}
          updateByte={updateByte}
        />
      ))}
    </React.Fragment>
  );
};

export default HexDisplay;
