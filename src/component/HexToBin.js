import React, { useState } from 'react';
import './HexToBin.css';

const HexToBin = ({ bitLabels }) => {
  const [bin, setBin] = useState([0, 0, 0, 0]);
  const [hexValue, setHexValue] = useState('');

  const hexToBinMap = {
    '0': [0, 0, 0, 0], '1': [0, 0, 0, 1], '2': [0, 0, 1, 0], '3': [0, 0, 1, 1],
    '4': [0, 1, 0, 0], '5': [0, 1, 0, 1], '6': [0, 1, 1, 0], '7': [0, 1, 1, 1],
    '8': [1, 0, 0, 0], '9': [1, 0, 0, 1], 'a': [1, 0, 1, 0], 'b': [1, 0, 1, 1],
    'c': [1, 1, 0, 0], 'd': [1, 1, 0, 1], 'e': [1, 1, 1, 0], 'f': [1, 1, 1, 1]
  };

  const binToHexMap = {
    '0000': '0', '0001': '1', '0010': '2', '0011': '3',
    '0100': '4', '0101': '5', '0110': '6', '0111': '7',
    '1000': '8', '1001': '9', '1010': 'a', '1011': 'b',
    '1100': 'c', '1101': 'd', '1110': 'e', '1111': 'f'
  };

  const convertToBin = (event) => {
    let input = event.target.value.toLowerCase();

    if (hexToBinMap.hasOwnProperty(input)) {
      setBin(hexToBinMap[input]);
      setHexValue(input);
    } else {
      setBin([0, 0, 0, 0]);
      setHexValue('');
    }
  }

  const toggleBit = (index) => {
    setBin(prevBin => {
      let newBin = [...prevBin];
      newBin[index] = newBin[index] === 0 ? 1 : 0;
      let newHexValue = binToHexMap[newBin.join('')];
      setHexValue(newHexValue);
      return newBin;
    });
  }

  return (
    <div className="byte_container">
      <input
        type="text"
        className='HexInput'
        value={hexValue}
        onChange={convertToBin}
        maxLength="1"
        pattern="[a-fA-F0-9]{1}"
        required
      />
      <div className="btn_container">
        {bin.map((bit, index) => (
          <div key={index}>
            <button onClick={() => toggleBit(index)}>{bit}</button>
            <p>{bitLabels[index]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HexToBin;
