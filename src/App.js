import React, { useState, useEffect } from 'react';
import HexToBin from './component/HexToBin';
import './App.css';

// Define the modes for bit representation
const BIT_MODES = {
  SHORT: 4,       // For 16-bit mode
  LONG: 8,        // For 32-bit mode
  EXTRA_LONG: 16  // For 64-bit mode
}

function App() {
  // The selected mode for bit representation, initialized to 16-bit mode
  const [bitMode, setBitMode] = useState(BIT_MODES.SHORT);

  const [hexMultiple, setHexMultiple] = useState('');
  const [hexMultipleInput, setHexMultipleInput] = useState("");

  useEffect(() => {
    let joinedValue = Array.from(hexMultiple).reverse().join('');
    setHexMultipleInput(joinedValue);
  }, [hexMultiple]);




  //change hex input from parent
  const [hexInput, setHexInput] = useState("");

  const handleHexMultipleChange = (event) => {
    let input = event.target.value;
    input = input.split('').filter(char => /^[0-9a-fA-F]$/.test(char)).join(''); // Keep only valid hex characters

    setHexMultiple(prev => {
      let inputReversed = input.split('').reverse();
      let newHexMultiple = [...prev];
      for (let i = 0; i < bitMode; i++) {
        newHexMultiple[i] = inputReversed[i] || '';
      }
      return newHexMultiple;
    });
  };



  const handleHexChange = (newValue, index) => {
    setHexMultiple(prev => {
      let newArray = [...prev];
      newArray[index] = newValue;
      return newArray;
    });
  };



  // This function is called when the bit mode is changed.
  const handleBitModeChange = event => {
    // Set the bit mode based on the selected radio button
    switch (event.target.value) {
      case "16bit":
        setBitMode(BIT_MODES.SHORT);
        break;
      case "32bit":
        setBitMode(BIT_MODES.LONG);
        break;
      case "64bit":
        setBitMode(BIT_MODES.EXTRA_LONG);
        break;
      default:
        setBitMode(BIT_MODES.SHORT);
    }
  };

  // Generate the HexToBin components for the current bit mode, in reverse order
  const hexToBinComponents = Array(bitMode)
    .fill()
    .map((_, i) => {
      let hexChar = hexMultiple[bitMode - 1 - i] || '';
      return (
        <HexToBin
          key={i}
          hexInput={hexMultiple[i] || ''}
          onHexChange={(newValue) => handleHexChange(newValue, i)}
          className="forMarginName"
          bitLabels={[
            'Bit ' + (i * 4 + 3),
            'Bit ' + (i * 4 + 2),
            'Bit ' + (i * 4 + 1),
            'Bit ' + (i * 4 + 0)
          ]}
        />

      );
    })
    .reverse();


  // Generate the binary index numbers for the current bit mode
  const binIndexNumbers = Array(bitMode).fill().map((_, i) => (
    <div key={i} className="binIndexNumber">{i + 1}</div>
  ));

  return (
    <React.Fragment>
      <h1>Hex to Binary Convertor</h1>
      <div className="MainApp">
        <div className="hex2binComp">
          {/* Render the HexToBin components */}
          {hexToBinComponents}
        </div>
      </div>
      <div className="binIndexNumberContainer">
      </div>

      <label>
        Hex input: <input name="hexMultiple" value={hexMultipleInput} onChange={handleHexMultipleChange} />
      </label>



      <fieldset className='radio_container'>
        <legend>Choose length :</legend>
        <div>
          {/* Render the radio buttons for selecting the bit mode */}
          <input
            className='radio_input'
            type="radio"
            id="16bit"
            name="drone"
            value="16bit"
            defaultChecked
            onClick={handleBitModeChange}
          />
          <label className='radio_label'>16bit</label>
        </div>
        <div>
          <input
            className='radio_input'
            type="radio"
            id="32bit"
            name="drone"
            value="32bit"
            onClick={handleBitModeChange}
          />
          <label className='radio_label'>32bit</label>
        </div>
        <div>
          <input
            className='radio_input'
            type="radio"
            id="64bit"
            name="drone"
            value="64bit"
            onClick={handleBitModeChange}
          />
          <label className='radio_label'>64bit</label>
        </div>
      </fieldset>
    </React.Fragment>
  );
}

export default App;
