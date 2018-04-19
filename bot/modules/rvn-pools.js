const mongoose = require('mongoose');
let moment = require('moment-timezone');
let poolsSchema = require('..\\' + '\\db-models\\pool.js');
let hasRvnPoolsChannels = require('../helpers.js').hasRvnPoolsChannels;
let isPoolOwner = require('../helpers.js').isPoolOwner;
let inPrivate = require('../helpers.js').inPrivate;
let config = require('config');
let channelID = config.get('General').Channels.botspam;
let logChannel = config.get('moderation').logchannel;
let pm2Name = config.get('General').pm2Name;

exports.commands = ['pools'];

exports.pools = {
  usage: '<poolname>',
  description:
    'Rvn Pools List\n  optionally add pools name to return just that pools setup\n**!pools set**, <poolName>, <poolURL>, <poolFee>, <poolStratum>, <poolPort>, <poolExtraInfo>\n     provide all required info for pool seprated by commas! extra info is not required, if providing extra info please do not include commas in the info message.\n    Example: `!pools set, Mining Panda, https://miningpanda.site, 1%, stratum+tcp://miningpanda.site:3636, 3636, diff starts at 10`\nif you would like to update your pools options and not chang others use `d` in place of info to leave default from database\nExample`!pools set, d, d, 0%, d, d, d`',
  process: function(bot, msg, suffix) {
    var words = suffix
      .trim()
      .split(' ')
      .filter(function(n) {
        return n !== '';
      });
    if (words[0] == 'set,') {
      if (inPrivate(msg)) {
        msg.channel.send('You Can Not set a pool In DMs!');
        return;
      }
      if (isPoolOwner(msg)) {
        newPool(bot, msg, suffix);
        return;
      }
    } else {
      poolsList(bot, msg, suffix);
      return;
    }

    function poolsList(bot, msg, suffix) {
      var pools = mongoose.model('pools');
      if (!suffix) {
        msg.channel
          .send('Sending Pools list via DM')
          .then(message => message.delete(8000));
        pools.find({}, function(err, docs) {
          docs.forEach(function(results) {
            var OwnerID = results.poolOwnerID;
            var Owner = results.poolOwner;
            var Name = results.poolName;
            var SiteURL = results.poolURL;
            var Fee = results.poolFee;
            var Stratum = results.poolStratum;
            var Port = results.poolPort;
            var Info = results.poolInfo;
            var message =
              '__**[' +
              Name +
              '](' +
              SiteURL +
              ')**__\n' +
              '    **Owner/Operator**: ' +
              Owner +
              '\n' +
              '    **Fee**: [' +
              Fee +
              '](' +
              SiteURL +
              ')\n' +
              '    **Stratum**: [' +
              Stratum +
              '](' +
              SiteURL +
              ')\n' +
              '    **Port**: [' +
              Port +
              '](' +
              SiteURL +
              ')\n' +
              '    ' +
              Info;
            msg.author.send({
              embed: {
                description: message,
                url: SiteURL,
                color: 7976557,
                author: {
                  name: 'Pool Options',
                  icon_url: 'https://i.imgur.com/ZoakSOl.png'
                }
              }
            });
          });
        });
      } else {
        if (!hasRvnPoolsChannels(msg)) {
          msg.channel.send(
            'Please use <#' + channelID + '> or DMs to talk to pools bot.'
          );
          return;
        }
        var regex = new RegExp(['^', suffix, '$'].join(''), 'i');
        pools.find({ poolName: regex }, function(err, docs) {
          if (!docs || !docs[0]) {
            return;
          } else {
            var OwnerID = docs[0].poolOwnerID;
            var Owner = docs[0].poolOwner;
            var Name = docs[0].poolName;
            var SiteURL = docs[0].poolURL;
            var Fee = docs[0].poolFee;
            var Stratum = docs[0].poolStratum;
            var Port = docs[0].poolPort;
            var Info = docs[0].poolInfo;
            var message =
              '__**[' +
              Name +
              '](' +
              SiteURL +
              ')**__\n' +
              '    **Owner/Operator**: ' +
              Owner +
              '\n' +
              '    **Fee**: [' +
              Fee +
              '](' +
              SiteURL +
              ')\n' +
              '    **Stratum**: [' +
              Stratum +
              '](' +
              SiteURL +
              ')\n' +
              '    **Port**: [' +
              Port +
              '](' +
              SiteURL +
              ')\n' +
              '    ' +
              Info;
            msg.channel.send({
              embed: {
                description: message,
                url: SiteURL,
                color: 7976557,
                author: {
                  name: 'Pool Options',
                  icon_url: 'https://i.imgur.com/ZoakSOl.png'
                }
              }
            });
          }
        });
      }
    }

    function newPool(bot, msg, suffix) {
      if (!hasRvnPoolsChannels(msg)) {
        msg.channel.send('Please use <#' + channelID + '> to set a pool.');
        return;
      }
      var words = suffix
        .trim()
        .split(',')
        .filter(function(n) {
          return n !== '';
        });
      var pools = mongoose.model('pools');
      pools.count({ poolOwnerID: msg.author.id }, function(err, count) {
        pools.find({ poolOwnerID: msg.author.id }, function(err, docs) {
          if (!docs || !docs[0]) {
            if (!words[1] || !words[2] || !words[3] || !words[4] || !words[5]) {
              msg.channel.send(
                'provide all required info for pool seprated by commas! extra info is not required, if providing extra info please do not include commas in the info message.\n!pools set, <poolName>, <poolURL>, <poolFee>, <poolStratum>, <poolPort>, <poolExtraInfo>\nExample: `!pools set Mining Panda, https://miningpanda.site, 1%, stratum+tcp://miningpanda.site:3636, 3636, diff starts at 10`\nif you would like to update your pools options and not chang others use `d` in place of info to leave default from database\nExample`!pools set, d, d, 0%, d, d, d`'
              );
              return;
            }
            if (words[2].includes('stratum+tcp')) {
              msg.channel.send(
                'poolURL is the url to the site for access from the web, not the stratum URL'
              );
              return;
            }
            var Name = words[1];
            var SiteURL = words[2];
            var Fee = words[3];
            var Stratum = words[4];
            var Port = words[5];
            var Info = words[6] ? words[6] : 'no extra info provided';
            var newPool = {
              poolOwnerID: msg.author.id,
              poolOwner: msg.author.username,
              poolName: Name.trim(),
              poolURL: SiteURL.trim(),
              poolFee: Fee.trim(),
              poolStratum: Stratum.trim(),
              poolPort: Port.trim(),
              poolInfo: Info.trim()
            };
            var newPool = new pools(newPool);
            newPool
              .save()
              .then(newPool => {
                bot.channels
                  .get(logChannel)
                  .send('Saved New pool: ' + msg.author.username);
                msg.channel.send('Pool info Saved');
              })
              .catch(err => {
                var time = moment()
                  .tz('America/Los_Angeles')
                  .format('MM-DD-YYYY hh:mm a');
                bot.channels
                  .get(logChannel)
                  .send(
                    '[' +
                      time +
                      ' PST][' +
                      pm2Name +
                      '] ERROR saving Pool:\n' +
                      err
                  );
                console.log(
                  '[' +
                    time +
                    ' PST][' +
                    pm2Name +
                    '] ERROR saving Pool:\n' +
                    err
                );
              });
          } else {
            if (docs[0].poolOwnerID != msg.author.id) {
              msg.channel.send(
                'only the entry creator can edit this pools info!'
              );
              return;
            }
            var OwnerID = docs[0].poolOwnerID;
            var Owner = docs[0].poolOwner;
            if (words[1].trim() == 'd') {
              var Name = docs[0].poolName;
            } else {
              var Name = words[1];
            }
            if (words[2].trim() == 'd') {
              var SiteURL = docs[0].poolURL;
            } else {
              var SiteURL = words[2];
            }
            if (words[3].trim() == 'd') {
              var Fee = docs[0].poolFee;
            } else {
              var Fee = words[3];
            }
            if (words[4].trim() == 'd') {
              var Stratum = docs[0].poolStratum;
            } else {
              var Stratum = words[4];
            }
            if (words[5].trim() == 'd') {
              var Port = docs[0].poolPort;
            } else {
              var Port = words[5];
            }
            if (words[6].trim() == 'd') {
              var Info = docs[0].poolInfo;
            } else {
              var Info = words[6];
            }
            var newPool = {
              poolOwnerID: OwnerID,
              poolOwner: Owner,
              poolName: Name.trim(),
              poolURL: SiteURL.trim(),
              poolFee: Fee.trim(),
              poolStratum: Stratum.trim(),
              poolPort: Port.trim(),
              poolInfo: Info.trim()
            };
            pools
              .updateOne({ poolOwnerID: msg.author.id }, { $set: newPool })
              .then(pools => {
                bot.channels
                  .get(logChannel)
                  .send('Updated pool: ' + msg.author.username);
                msg.channel.send('Pool info Updated');
              })
              .catch(err => {
                var time = moment()
                  .tz('America/Los_Angeles')
                  .format('MM-DD-YYYY hh:mm a');
                bot.channels
                  .get(logChannel)
                  .send(
                    '[' +
                      time +
                      ' PST][' +
                      pm2Name +
                      '] ERROR Updating Pool:\n' +
                      err
                  );
                console.log(
                  '[' +
                    time +
                    ' PST][' +
                    pm2Name +
                    '] ERROR Updating Pool:\n' +
                    err
                );
              });
          }
        });
      });
    }
  }
};
