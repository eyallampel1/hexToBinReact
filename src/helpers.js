//gets Hex string and turns it into array of binary bits
export const ConvertHexToBin = (hexnum) => {
  return parseInt(hexnum, 16).toString(2).split("");
};
//gets Bin array and returns Hex string
export const ConvertBinToHex = (bits_array) => {
  return parseInt(bits_array.join(""), 2).toString(16);
};
