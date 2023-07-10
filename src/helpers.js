//gets Hex string and turns it into array of binary bits
export const ConvertHexToBin = (hexnum) => {
  const converted = parseInt(hexnum, 16);
  if (isNaN(converted)) {
    return "";
  }
  return converted
    .toString(2)
    .padStart(4, 0)
    .split("")
    .map((n) => parseInt(n));
};
//gets Bin array and returns Hex string
export const ConvertBinToHex = (bits_array) => {
  return parseInt(bits_array.join(""), 2).toString(16);
};
