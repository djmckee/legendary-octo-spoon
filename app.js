const http = require('http');
const Bot = require('messenger-bot');
const constants = require("./constants");
const fs = require("fs");

//import the JSON file, and it give an array of bars
var bars = JSON.parse(fs.readFileSync("data.json"));

let bot = new Bot({
  token: constants.PAGE_TOKEN,
  verify: constants.APP_VERIFY,
  app_secret: constants.APP_SECRET
});

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('message', (payload, reply) => {
  let text = payload.message.text;

  bot.getProfile(payload.sender.id, (err, profile) => {
      if (err) {
          console.log("error:" + err.toString());
      }

    var bar = getRandomBar();
    var replyString = 'Hey! I recommend ' + bar.name + '. It\'s pretty ' + bar.price + '. You can find it at ' + bar.location + '.';
    console.log('gonna send back: ' + replyString);


    reply({ replyString }, (err) => {
      if (err) {
          console.log("error:" + err.toString());
      }

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${replyString}`);
  });
  });
});

//this function just returns a random bar object
function getRandomBar(){
  var randomIndex = Math.random() * bars.length;
  randomIndex = parseInt(randomIndex);
  return bars[randomIndex];
}

http.createServer(bot.middleware()).listen(3000);
console.log('Echo bot server running at port 3000.');
