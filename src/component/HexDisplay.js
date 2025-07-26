import React, { useState, useEffect } from "react";
import HexToBin from "./HexToBin";
import { ConvertHexToBin, ConvertBinToHex } from "../helpers.js";

// Component responsible for displaying hexadecimal values
const HexDisplay = (props) => {
  // BitsArray holds binary representation of hex number
  // with the least significant bit at index 63 and the most significant bit at index 0
  const [BitsArray, setBitsArray] = useState(Array(64).fill(0));

  // Function to update a specific bit in BitsArray at the correct index
  const updateBit = (base, offset) => {
    const index = base * 4 + offset;
    setBitsArray((prev) => {
      const newBits = [...prev];
      // Toggle the bit value at the specific index
      newBits[63 - index] = (newBits[63 - index] + 1) % 2;
      // Notify parent component of the change
      props.update_handler(newBits);
      return newBits;
    });
  };

  // Function to update a byte in BitsArray
  const updateByte = (base, byte) => {
    const index = base * 4;
    setBitsArray((prev) => {
      const newBits = [...prev];
      // Replace the bits at the index with the new byte
      newBits.splice(60 - index, 4, ...byte);
      // Notify parent component of the change
      props.update_handler(newBits);
      return newBits;
    });
  };

  // Update BitsArray when user inputs a new hexadecimal number
  useEffect(() => {
    if (props.user_input === "") {
      setBitsArray(BitsArray.fill(0));
    }
    // Convert each hexadecimal character to binary and store in UserBitArray
    const UserBitArray = props.user_input.split("").map((byte) => {
      return ConvertHexToBin(byte);
    });
    // Prepare the new BitsArray with leading zeros
    const temp = Array(64 - UserBitArray.length * 4)
      .fill(0)
      .concat(UserBitArray);
    setBitsArray(temp.flat(1));
  }, [props.trigger]); // Only run effect if props.trigger changes

  // Render HexToBin components depending on the size of the input
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
