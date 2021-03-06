let moment = require('moment-timezone');
let config = require('config');
let BlocksWonChannel = config.get('SocketBots').BlocksWonChannel;
let SocketUrl = config.get('SocketBots').SocketUrl;
let socketClient = require('socket.io-client');

exports.custom = ['socketBlocks'];

exports.socketBlocks = function(bot) {
  let eventToListenTo = 'raven/block';
  let room = 'raven';
  let socket = socketClient(SocketUrl);
  socket.on('connect', function() {
    socket.emit('subscribe', room);
  });
  socket.on(eventToListenTo, function(data) {
    var poolName = data.block.poolInfo.poolName;
    var poolUrl = data.block.poolInfo.url;
    var blockHeight = data.block.height;
    var blockHash = data.block.hash;
    let dt = new Date();
    let timestamp = moment()
      .tz('America/Los_Angeles')
      .format('MM-DD-YYYY hh:mm::ss a');
    if (poolName) {
      const embed = {
        description:
          'Won by [' +
          poolName +
          '](' +
          poolUrl +
          ')\n[View Block](' +
          SocketUrl +
          '/block/' +
          blockHash +
          ')',
        color: 7976557,
        footer: {
          text: 'Last Updated | ' + timestamp + ' PST'
        },
        author: {
          name: 'Block ' + blockHeight,
          icon_url: 'https://i.imgur.com/nKHVQgq.png'
        }
      };
      bot.channels.get(BlocksWonChannel).send({ embed });
    }
  });
};
