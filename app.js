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
  //let text = payload.message.text;

  bot.getProfile(payload.sender.id, (err, profile) => {
      if (err) {
          console.log("error:" + JSON.stringify(err));
      }
      console.log('the person is: ' +  JSON.stringify(profile));

    var bar = getRandomBar();
    let text = 'Hey! I recommend ' + bar.name + '. It\'s pretty ' + bar.price + '. You can find it at ' + bar.location + '.';
    console.log('gonna send back: ' + text);


    reply({ text }, (err) => {
      if (err) {
          console.log("error:" + JSON.stringify(err));
      }

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
  });
  });
});

//this function just returns a random bar object
function getRandomBar(){
  var randomIndex = Math.random() * bars.length;
  randomIndex = parseInt(randomIndex);
  return bars[randomIndex];
}

//this function gets just the open bars and returns the array
function getOpenBars(){
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var currentTime = hour + "" + minutes;
  var openBars;
  
  //itterate through the bars array
  for(var i=0; i < bars.length; i++){
    //if we're past the openTime and before the closeTime
    if(isOpen(bars[i].startTime, bars[i].endTime, currentTime)){
       openBars.push(bars[i]);
    }
  }
  
  return openBars;
}

function isOpen(startTime, endTime, currentTime){
  //to handle the midnight to 4am slot (best time for drinking trebles responsibly...)
  if(currentTime > 0 && currentTime < 4){
    currentTime = currentTime + 24;
    endTime = endTime + 24;
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
