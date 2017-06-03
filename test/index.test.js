var gen = require('../index');

//helper functions!
var createCounterArray = function(mult){
  let base = gen.getBase();
  let length = gen.getLength();
  let counter = mult*base;
  //create array for every char and every lengthposition and also the last row (array[last][x] gives the sum of all rows above)
  let arr = Array.apply(null, Array(gen.getLength()+1)).map(Number.prototype.valueOf,0);
  arr.forEach(function(e,i){
    arr[i] = Array.apply(null, Array(gen.getBase())).map(Number.prototype.valueOf,0);
  });
  //populate the array
  let i = counter;
  let j = null;
  while(i--){
    let number = gen.create();
    //go trough all chars of the number
    j = number.length;
    while(j--){
      let value = gen.getValue(number[j]);
      arr[j][value] += 1;
      arr[length][value] += 1;
    }
  }
  // console.log(arr.slice(arr.length-2,arr.length-1));
  //caluclate the relative -> value/supposedValue
  i = length;
  while(i--){
    j = base;
    while(j--){
      arr[i][j] /= mult;
    }
  }
  j = base;
  while(j--){
    arr[length][j] /= mult*length;
  }

  return arr;
}

var flatten = function(arr){
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

var findMaxDiffToOne = function(arr){
  let flattend = flatten(arr);
  let diff = flattend.map( e => Math.abs(1-e));
  return Math.max(...diff);
}

//test here with gen.create();
var assert = require('assert');
describe('create-function', function(){
  describe('generating numbers', function(){
    let settings = [
      {base: 2, length: 8, result: 1},
      {base: 4, length: 4, result: 1},
      {base: 16, length: 1, result: 1},
      {base: 16, length: 13, result: 7},  //by base 16 you hust has to calculate Math.ceil(length/2)
      {base: 16, length: 27, result: 14},
      {base: 16, length: 50, result: 25},
      {base: 64, length: 1, result: 3}, //a = 3 and byteLength = 3
      {base: 64, length: 11, result: 9},
      {base: 64, length: 10, result: 9},
      {base: 3, length: 1, result: 1},
      {base: 63, length: 1, result: 3},
      {base: 63, length: 11, result: 9}
    ];
    settings.forEach(function(setting){
      describe('for setting {' +setting.base+ ',' +setting.length+ '}', function(){
        beforeEach(function(){
          gen.setOutputSettings(setting.base, setting.length);
        });
        after(function(){
          gen.setOutputSettings(64,11);
        });
        it('byteLength should be '+setting.result, function(){
          assert.equal(gen.getByteLength(),setting.result);
        });
        it('should create numbers of length '+setting.length, function(){
          assert.equal(gen.create().length,setting.length);
        });
        it('should only create numbers with the allowed chars', function(){
          assert.equal(gen.create().replace(new RegExp("["+gen.getIndex().substr(0,gen.getBase())+"]","g"),""), "");
        })
      })
    });
  });
  describe.skip('distribution of the created numbers', function(){
    it('should be euqally distributed', function(){
      // let arr = createCounterArray(100);
      // console.log(arr.slice(arr.length-2,arr.length-1));
      // let maxDiff = findMaxDiffToOne(arr.slice(arr.length-1));
      // console.log(arr.slice(arr.length-1));
      // assert.ok(maxDiff < 0.25, "maxDiff is more than 30% :"+maxDiff);
    });
  });
});
describe('setter-functions', function(){
  describe('setOutputSettings', function(){
    it('should throw error if base ist smaller than 2', function(){
      assert.throws(()=>{gen.setOutputSettings(1,10);});
    });
    it('should throw error if base is bigger than index', function(){
      assert.throws(()=>{gen.setOutputSettings(65,10);});
    });
    it('should throw no error', function(){
      assert.doesNotThrow(()=>{gen.setOutputSettings(32,60);});
    });
    after(function(){
      gen.setOutputSettings(64,11);
    });
  });
  describe('setIndex', function(){
    it('should throw error if index is smaller than base', function(){
      assert.throws(()=>{gen.setIndex("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");});
    });
    it('should throw error if index has duplicates', function(){
      before(function(){
        gen.setOutputSettings(4,10);
      });
      assert.throws(()=>{gen.setIndex("abcdefghhijklmnopqrtuvwxyz");});
      after(function(){
        gen.setOutputSettings(64,11);
      });
    });
    it('throws no error, even if all chars are given', function(){
      assert.doesNotThrow(function(){
        gen.setIndex(' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~');
      });
    });
  });
});
