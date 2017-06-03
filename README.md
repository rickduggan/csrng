# csrng
(C)riptographically (S)ecure (R)andom (N)umber (G)enerator

## Installation

```shell
  npm install csnrg --save
```

## Usage

```js
  var gen = require('csnrg');

  //output a number (as string) with base 16 and a length of 10
  gen.setOutputSettings(16,10);
  //default is 64,11

  //define your own digits
  gen.setIndex("abcdefghiklmoprstuwxz");
  //default is 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-

  var numberString = gen.create();

  console.log(numberString);
```

## Tests

```shell
   npm test
```

## Features

* Especially good to create some id's for human readability
* Can create numbers which are a lot bigger than the usual cap
* Define your own digits and the hierarchy of them

## Release History

* 0.1.1 Added tests and corrected a calculation
* 0.1.0 Initial release
