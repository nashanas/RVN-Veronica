/*
let moment = require('moment-timezone');
let config = require('config');
let BlocksWonChannel = config.get('SocketBots').BlocksWonChannel;
let SocketUrl = 'https://testnet.ravencoin.network/';
let socketClient = require('socket.io-client');
let findEntry = require('../db-helpers.js').findEntry;
let newEntry = require('../db-helpers.js').newEntry;
let updateEntry = require('../db-helpers.js').updateEntry;
let dropdb = require('../db-helpers.js').dropdb;

exports.custom = ['BlockTimesTN'];

exports.BlockTimesTN = function(bot) {
  let msg = null;
  let eventToListenTo = 'raven/block';
  let room = 'raven';
  let socket = socketClient(SocketUrl);
  socket.on('connect', function() {
    socket.emit('subscribe', room);
  });
  socket.on(eventToListenTo, function(data) {
    var blockHeight = data.block.height;
    var lastHeight = blockHeight - 1;
    var blockDiff = data.block.difficulty;
    var blockTime = data.block.time;
    var changedDiff = blockHeight / 2016;
    var changeOnBlock = (Math.floor(changedDiff) + 1) * 2016;
    if (blockHeight == changeOnBlock - 1){
      dropdb('blockTimeTN');
    }
    var BlockTimeLog = {
      Height: blockHeight,
      Time: blockTime,
      Diff: blockDiff,
      SolveTime: null
    };
    newEntry(bot, msg, 'blockTimeTN',  BlockTimeLog);
    findEntry(bot, msg, 'blockTimeTN', 'Height', lastHeight, findLastBlock);
    function findLastBlock(bot, msg, docs) {
      if (docs){
      var lastTime = docs[0].Time;
      var SolveTime = blockTime - lastTime;
      if (lastTime) {
        var SolvedIn = {
          SolveTime: SolveTime
        };
        updateEntry(bot, msg, 'blockTimeTN', 'Height', lastHeight, SolvedIn);
      }
    }
    }
  });
};
*/
