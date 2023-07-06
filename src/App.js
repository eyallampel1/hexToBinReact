import React from 'react';
import './App.css';
import HexToBin from './component/HexToBin';
import { useState } from 'react';

function App() {
  const [LongHex, setLongHex] = useState(false);


  return (
    <React.Fragment>
      <h1>Hex to Binary convertor</h1>
      <div className="App">

        {LongHex ? (
          <div>
            <HexToBin />
            <HexToBin />
            <HexToBin />
            <HexToBin />
          </div>
        ) : (
          <div>
            <HexToBin />
            <HexToBin />
            <HexToBin />
            <HexToBin />
            <HexToBin />
            <HexToBin />
            <HexToBin />
            <HexToBin />
          </div>
        )}
              

      </div>
      <fieldset className='radio_container'>
        <legend>Choose length :</legend>
        <div>
          <input className='radio_input' type="radio" id="16bit" name="drone" value="16bit" defaultChecked
            checked onClick={() => { setLongHex(false) }} />
          <label className='radio_label'>16bit</label>
        </div>
        <div>
          <input className='radio_input' type="radio" id="32bit" name="drone" value="32bit" onClick={() => { setLongHex(true) }} />
          <label className='radio_label'>32bit</label>
        </div>


      </fieldset>
    </React.Fragment>
  );
}

export default App;


