import React, { useState } from 'react';
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
    .map((_, i) => (
      <HexToBin
        key={i}
        className="forMarginName"
        bitLabels={[
          'Bit ' + (i * 4 + 4),
          'Bit ' + (i * 4 + 3),
          'Bit ' + (i * 4 + 2),
          'Bit ' + (i * 4 + 1)
        ]}
      />
    ))
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
        {/* Render the binary index numbers */}
        {binIndexNumbers}
      </div>
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
