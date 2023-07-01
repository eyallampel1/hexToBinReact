import React from 'react';
import './HexToBin.css';
import { useState } from 'react';

// let bin0 = 0;
// let bin1 = 0;
// let bin2 = 0;
// let bin3 = 0;





const HexToBin = () => {

  //define onstate named bin0
  const [bin0, setBin0] = useState(0);
  //define onstate named bin1
  const [bin1, setBin1] = useState(0);
  //define onstate named bin2
  const [bin2, setBin2] = useState(0);
  //define onstate named bin3
  const [bin3, setBin3] = useState(0);

  const [hexValue, setHexValue] = useState('0');



  //write arrow function named ConvertToBin and send to it the input value
  const ConvertToBin = (event) => {
    //convert the input value to binary
    //let input = inputRef.current.value;
    let input = event.target.value;

    let binary = parseInt(input, 16).toString(2);
    //if input is equal to NAN then set all the binary to 0
    if (!isNaN(input)) {
      console.log("inside NAN");
      setBin3(0);
      setBin2(0);
      setBin1(0);
      setBin0(0);
    }

    else if (input === 'a') {
      console.log("inside a");
      setBin3(1);
      setBin2(0);
      setBin1(1);
      setBin0(0);
    }
    else if (input === 'b') {
      console.log("inside b");
      setBin3(1);
      setBin2(0);
      setBin1(1);
      setBin0(1);
    }
    else if (input === 'c') {
      console.log("inside c");
      setBin3(1);
      setBin2(1);
      setBin1(0);
      setBin0(0);
    }
    else if (input === 'd') {
      console.log("inside d");
      setBin3(1);
      setBin2(1);
      setBin1(0);
      setBin0(1);
    }
    else if (input === 'e') {
      console.log("inside e");
      setBin3(1);
      setBin2(1);
      setBin1(1);
      setBin0(0);
    }
    else if (input === 'f') {
      console.log("inside f");
      setBin3(1);
      setBin2(1);
      setBin1(1);
      setBin0(1);
    }
    else if (input === '0') {
      console.log("inside 0");
      setBin3(0);
      setBin2(0);
      setBin1(0);
      setBin0(0);
    }
    else if (input === '1') {
      console.log("inside 1");
      setBin3(0);
      setBin2(0);
      setBin1(0);
      setBin0(1);
    }
    else if (input === '2') {
      console.log("inside 2");
      setBin3(0);
      setBin2(0);
      setBin1(1);
      setBin0(0);
    }
    else if (input === '3') {
      console.log("inside 3");
      setBin3(0);
      setBin2(0);
      setBin1(1);
      setBin0(1);
    }
    else if (input === '4') {
      console.log("inside 4");
      setBin3(0);
      setBin2(1);
      setBin1(0);
      setBin0(0);
    }
    else if (input === '5') {
      console.log("inside 5");
      setBin3(0);
      setBin2(1);
      setBin1(0);
      setBin0(1);
    }
    else if (input === '6') {
      console.log("inside 6");
      setBin3(0);
      setBin2(1);
      setBin1(1);
      setBin0(0);
    }
    else if (input === '7') {
      console.log("inside 7");
      setBin3(0);
      setBin2(1);
      setBin1(1);
      setBin0(1);
    }
    else if (input === '8') {
      console.log("inside 8");
      setBin3(1);
      setBin2(0);
      setBin1(0);
      setBin0(0);
    }
    else if (input === '9') {
      console.log("inside 9");
      setBin3(1);
      setBin2(0);
      setBin1(0);
      setBin0(1);
      setHexValue('9');
    }
    else {
      console.log("inside else");
      setBin3(0);
      setBin2(0);
      setBin1(0);
      setBin0(0);
      setHexValue('');
    }





    //return the binary value
    console.log(input);
    console.log(binary);
    return binary;
  }

  //get the value of the input 


  return (
    <div className="byte_container">
      <input type="text" className='HexInput' onChange={ConvertToBin} maxlength="1" pattern="[a-fA-F0-9]{1}" required value={hexValue}></input>
      <div className="btn_container">
        <button>{bin3}</button>
        <button>{bin2}</button>
        <button>{bin1}</button>
        <button>{bin0}</button>
      </div>
    </div >
  )
}

export default HexToBin;

