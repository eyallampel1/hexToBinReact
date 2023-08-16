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
      props.update_handler(newBits);
      return newBits;
    });
  };

  const updateByte = (base, byte) => {
    const index = base * 4;
    setBitsArray((prev) => {
      const newBits = [...prev];
      newBits.splice(60 - index, 4, ...byte);
      props.update_handler(newBits);
      return newBits;
    });
  };

  //update BitsArray when user inputs hex number
  useEffect(() => {
    if (props.user_input === "") {
      setBitsArray(BitsArray.fill(0));
    }
    const UserBitArray = props.user_input.split("").map((byte) => {
      return ConvertHexToBin(byte);
    });
    const temp = Array(64 - UserBitArray.length * 4)
      .fill(0)
      .concat(UserBitArray);
    setBitsArray(temp.flat(1));
  }, [props.trigger]);

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
          displayMode={props.displayMode}
          size={props.size}
        />
      ))}
    </React.Fragment>
  );
};

export default HexDisplay;
