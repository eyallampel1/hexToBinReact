import React, { useState } from "react";
import HexToBin from "./HexToBin";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers.js";

const HexDisplay = (props) => {
  //this holds our number at all times. LSB is 63 , MSB is 0 this means bit n is BitsArray[63-n]
  const [BitsArray, setBitsArray] = useState(Array(64).fill(0));
  //this will update BitsArray in the correct index
  const updateBit = (base, offset) => {
    const index = base * 4 + offset;
    setBitsArray((prev) => {
      const newBits = [...prev];
      newBits[63 - index] = (newBits[63 - index] + 1) % 2;
      return newBits;
    });
  };

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
        />
      ))}
    </React.Fragment>
  );
};

export default HexDisplay;
