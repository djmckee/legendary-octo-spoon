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
  let messageText = payload.message.text;
  console.log("payload:" + JSON.stringify(payload));

  bot.getProfile(payload.sender.id, (err, profile) => {
      if (err) {
          console.log("error:" + JSON.stringify(err));
      }
      console.log('the person is: ' +  JSON.stringify(profile));

    var openBars = getOpenBars();

    var replyString = "";

    var date = new Date();
    var hour = date.getHours();

    let helpCommand = "help";
    let allCommand = "all";
    let everyCommand = "everything";

    var isTextMessage = (messageText != null);

    if (isTextMessage && messageText.toLowerCase().indexOf(helpCommand) > -1) {
        // Help...
        replyString = 'This is the trebles bot; commands are:\n\'help\' - displays this menu\n\'all\' - all open bars\n\'everything\' - every bar (even closed ones!)';

    } else if (isTextMessage && messageText.toLowerCase().indexOf(allCommand) > -1) {
        // Return all open bars
        replyString = '🍻';
        sendOpenBars(payload.sender.id);

    } else if (isTextMessage && messageText.toLowerCase().indexOf(everyCommand) > -1){
        // Return every bar, even closed ones
        replyString = '🍻';
        sendAllBars(payload.sender.id);

    } else if (hour > 3 && hour < 7) {
        replyString = 'Go home ' + profile.first_name + ' - you\'re drunk!';
    } else if (openBars.length == 0) {
        // :'(
        replyString = 'Hey ' + profile.first_name + '! Sorry, nothing\'s open right now - come back later for some tasty trebs...';

    } else {
        console.log('openbars = ' + openBars);
        var bar = getRandomFromArray(openBars);
        replyString = 'Hey ' + profile.first_name + '! I recommend ' + bar.name + '. It\'s pretty ' + bar.price + '. You can find it at ' + bar.location + '.';

    }

    console.log('gonna send back: ' + replyString);

    reply({ text: replyString }, (err) => {
      if (err) {
          console.log("error:" + JSON.stringify(err));
      }

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${replyString}`);
  });
  });
});

// Sends all open bars as a formatted string in inidiviual messages
function sendOpenBars(userId) {
    var openBars = getOpenBars();

    for (var i = 0; i < openBars.length; i++) {
        var bar = openBars[i];
        var string = '' + bar.name + ' (' + bar.price + ') - ' + bar.location;

        bot.sendMessage(userId, { text: string }, function(err, info){
            if (err) {
                console.log("message send error:" + JSON.stringify(err));
            }
        });
    }

}

// Sends all bars as a formatted string in inidiviual messages
function sendAllBars(userId) {
    for (var i = 0; i < bars.length; i++) {
        var bar = bars[i];
        var string = '' + bar.name + ' (' + bar.price + ') - ' + bar.location;
        bot.sendMessage(userId, { text: string }, function(err, info){
            if (err) {
                console.log("message send error:" + JSON.stringify(err));
            }
        });

    }

}

//this function just returns a random object from the array
function getRandomFromArray(array){
  console.log(array);
  var randomIndex = Math.random() * array.length;
  randomIndex = parseInt(randomIndex);
  return array[randomIndex];
}

//this function gets just the open bars and returns the array
function getOpenBars(){
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();

  if(minutes < 10){
    //for padding (e.g. so 4:02 = 402, not 42)
    var currentTime = hour + "0" + minutes;
  }
  else{
    var currentTime = hour + "" + minutes;
  }
  currentTime = parseInt(currentTime);

  var openBars = [];

  //itterate through the bars array
  for(var i=0; i < bars.length; i++){
    //if we're past the openTime and before the closeTime
    if(isOpen(bars[i].openFrom, bars[i].closeAt, currentTime)){
        console.log("open: " + bars[i].name);
       openBars.push(bars[i]);
   } else {
       console.log("closed: " + bars[i].name);
   }
  }

  return openBars;
}

function isOpen(startTime, endTime, currentTime){
  console.log("currentTime: " + currentTime);
  //to handle the midnight to 4am slot (best time for drinking trebles responsibly...)
  if(currentTime > 0 && currentTime < 400){
    console.log("midnight handler executed")
    currentTime = currentTime + 2400;
    endTime = endTime + 2400;
  }

  if(endTime < 400){
    endTime = endTime + 2400;
  }

  if(currentTime > startTime && currentTime < endTime){
    return true;
  }
  else{
    return false;
  }
}

http.createServer(bot.middleware()).listen(3000);
console.log('Echo bot server running at port 3000.');
