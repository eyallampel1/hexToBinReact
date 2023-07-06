import React, { useState } from 'react';
import HexToBin from './component/HexToBin';
import './App.css';

const BIT_MODES = {
  SHORT: 4,  // For 16-bit mode
  LONG: 8    // For 32-bit mode
}

function App() {
  // Initialize the application in 16-bit mode
  const [bitMode, setBitMode] = useState(BIT_MODES.SHORT);

  // Function to change the bit mode
  const handleBitModeChange = event => {
    setBitMode(event.target.value === "16bit" ? BIT_MODES.SHORT : BIT_MODES.LONG);
  };

  // Generate the HexToBin components based on the current bit mode
  const hexToBinComponents = Array(bitMode).fill().map((_, i) => (
    <HexToBin key={i} className="forMarginName" />
  ));

  // Generate the binary index numbers
  const binIndexNumbers = Array(bitMode).fill().map((_, i) => (
    <div key={i} className="binIndexNumber">{i + 1}</div>
  ));

  return (
    <React.Fragment>
      <h1>Hex to Binary Convertor</h1>
      <div className="MainApp">
        <div className="hex2binComp">
          {hexToBinComponents}
        </div>
      </div>
      <div className="binIndexNumberContainer">
        {binIndexNumbers}
      </div>
      <fieldset className='radio_container'>
        <legend>Choose length :</legend>
        <div>
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
      </fieldset>
    </React.Fragment>
  );
}

export default App;
