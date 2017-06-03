let crypto = require('crypto');
// try {
//   crypto = require('crypto');
// } catch (err) {
//   console.log('crypto support is disabled but needed!');
// }

//assume we have crypto. Otherwise think about an alternative
let index = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
let length = 11;
let base = 64;
let filling = true;
let byteLength = 9;
let nextPowerBase = 64;  //gives the minimal value of power st 2^power >= base

//this module can only gurantee an equal distribution, if the base is a power of 2!

let caluclateGCD = function(a,b){
  while(b !== 0){
    let m = a % b;
    a = b;
    b = m;
  }
  return a;
}

//works only for bases with power of 2!
let calculateByteLengthOld = function(){
  let power = powerOfTwo(base);
  let gcd = caluclateGCD(8,power);
  let n = Math.ceil(length * gcd);
  return n * power / 8;
}

let calculateByteLength = function(){
  //findnextPower
  nextPowerBase = NextPowerOfTwo(base);

  //equation: power*length + power*a = 8*byteLength (a is a variable which symbolises the (not used) added chars to the end)
  let power = powerOfTwo(nextPowerBase);
  //TODO: because we know, that the powerBase is a power of two, we can use a better calculation for byteLength!
  byteLength = findMinimumOFOverstimulatedEquation(
    function(bl){return 8*bl;},
    function(a){return power*(length+a);}
  );

    //=> there are multiple bases which can not be euqual, regardless of the input!
    // byteLength = findMinimumOFOverstimulatedEquation(
    //   function(bl){return Math.pow(2,8*bl);},
    //   function(a){return Math.pow(base,length+a);}
    // );
    //the base is not a power of 2, so we habe to calculate a more difficult equation (this equation does have sometimes no solution in the natural numbers!)
    //equation: 2^(8*byteLength) = base^length * base^a (a is a variable which symbolises the (not used) added chars to the end)

}

//func1 is the term (given a variable) which should be as small as possible
//func2 takes also a variable, which size does not matter
//algo finds smallest variable a for func1 so that func1(a) === func2(b)
//both functions has to have a positive slope!
let findMinimumOFOverstimulatedEquation = function(func1, func2){
  let a = 0;
  let b = 0;
  let maxIteration = 1000;
  if(func1(a)===func2(b)){
    return a;
  }
  while(maxIteration--){
    while(func2(b) > func1(a)){
      ++a;
    }
    if(func1(a)===func2(b)){
      return a;
    }
    // b = 0;
    while(func1(a) > func2(b)){
      ++b;
    }
    if(func1(a)===func2(b)){
      return a;
    }
  }
}

let isPowerOfTwo = function(n){
  return n && (n & (n - 1)) === 0;
}

let powerOfTwo = function(n){
  counter = 0;
  while(n > 1){
    n /= 2;
    ++counter;
  }
  return counter;
}

//works only for 32-bit integers or all numbers which are smaller than 2^32 -> enough for our purpose
let NextPowerOfTwo = function(n){
  n--;           // 1101 1101 --> 1101 1100
  n |= n >> 1;   // 1101 1100 | 0110 1110 = 1111 1110
  n |= n >> 2;   // 1111 1110 | 0011 1111 = 1111 1111
  n |= n >> 4;   // ...
  n |= n >> 8;
  n |= n >> 16;  // 1111 1111 | 1111 1111 = 1111 1111
  n++;           // 1111 1111 --> 1 0000 0000
  return n;
}

let convertBase = function(string,fromBase,toBase){
  if(fromBase === toBase){
    return string;
  }
  return convertBaseIndeces(string,index.substr(0,fromBase),index.substr(0,toBase));
}

let convertBaseIndeces = function(string,fromIndex,toIndex){
  let from_zero = fromIndex.substr(0,1);
  let re = new RegExp('^'+from_zero+'+');
  string = string.replace(re, '');
  let output = '';
  let base_from = fromIndex.length;
  let base_to = toIndex.length;

  while(string !== ""){
    let r = 0;
    let new_string = "";

    for(let t = 0; t < string.length; t++){
      r = base_from * r + fromIndex.indexOf(string.substr(t,1));
      let mod = Math.floor(r/base_to);
      r -= mod * base_to;
      new_string += fromIndex.substr(mod,1);
    }
    string = new_string;
    string = string.replace(re,'');
    output = toIndex.substr(r,1) + output;
  }
  return output;

}

let fill = function(string, zero, length){
  let toFill = length - string.length;
  for(let i = toFill; i > 0; --i){
    string = zero + string;
  }
  return string;
}

let empty = function(string, zero){
  while(string[0] === zero){
    string = string.slice(1);
  }
  return string;
}

let strip = function(string, chars){
  let exp = new RegExp("["+chars+"]","g");
  return string.replace(exp,"");
}

let createCodeSnippet= function(){
  let code = convertBase(createSimpleHex(), 16, nextPowerBase);
  //strip the code of all "bad" chars
  code = fill(code, index.substr(0,1), byteLength*2);
  return strip(code,index.substr(base, nextPowerBase));
}

let createSimpleHex = function(){
  let bits = crypto.randomBytes(byteLength);
  return bits.toString('hex');
}

let create = function(){
  let code = "";
  if(!isPowerOfTwo(base)){
    while(code.length < length){
      //create more codesnipptes!
      code += createCodeSnippet();
    }
    if(!filling){
      code = empty(code, index.substr(0,1));
    }
  }else{
    code = convertBase(createSimpleHex(), 16, base);
    if(filling){
      code = fill(code,index.substr(0,1), length);
    }
  }
  return code.substr(code.length - length);
}

let setLength = function(l){
  if(l <= 2){
    return;
  }
  length = l;
  calculateByteLength();
}

let setBase = function(b){
  if(b < 2){
    return;
  }
  base = b;
  calculateByteLength();
}

let setOutputSettings = function(b, l){
  if(l < 0){
    throw new Error("The wanted length of the created number has to be positive!");
  }
  if(b < 2 || b > index.length){
    throw new Error("The base of the number has to be at least 2 and maximal the length of the given index");
  }
  base = b;
  length = l;
  calculateByteLength();
}

let setIndex = function(i){
  if(base > i.length){
    throw new Error("The new length of the given index is to small, the base is bigger.If you want to use a smaller Index, change the base first!");
  }
  if(!UniqueString){
    throw new Error("The given index has not unique chars, some have duplicates!");
  }
  index = i;
}

let UniqueString = function(str){
  var obj = {};
  for(var z=0;z<str.length;++z) {
    var ch = str[z];
    if(obj[ch]) return false; else obj[ch] = true;
  }
  return true;
}

let getLength = function(){
  return length;
}

let getBase = function(){
  return base;
}

let getValue = function(char){
  return index.indexOf(char);
}

let getByteLength = function(){
  return byteLength;
}

let getIndex = function(){
  return index;
}

module.exports = {
  create: create,
  setOutputSettings: setOutputSettings,
  setIndex: setIndex,
  getByteLength: getByteLength,
  getLength: getLength,
  getBase: getBase,
  getValue: getValue,
  getIndex: getIndex
}
