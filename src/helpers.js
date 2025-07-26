// This function takes a hexadecimal number (as a string) and converts it into an array of binary bits
export const ConvertHexToBin = (hexnum) => {
  // Convert the hexadecimal number to a decimal number
  const converted = parseInt(hexnum, 16);

  // If the conversion fails (i.e., if the input is not a valid hexadecimal number), return an empty string
  if (isNaN(converted)) {
    return "";
  }

  // Convert the decimal number to binary, pad it with zeros at the beginning to ensure it is 4 bits long,
  // split the string into individual characters (bits), and convert each bit to a number
  return converted
    .toString(2)
    .padStart(4, 0)
    .split("")
    .map((n) => parseInt(n));
};

// This function takes an array of binary bits and converts it to a hexadecimal string
export const ConvertBinToHex = (bits_array) => {
  // Join the bits into a single binary number, convert it to a decimal number, and then convert it to a hexadecimal string
  return parseInt(bits_array.join(""), 2).toString(16);
};
