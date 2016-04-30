var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs");

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//import the JSON file, and it give an array of bars
var bars = JSON.parse(fs.readFileSync("data.json"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const http = require('http');
const Bot = require('messenger-bot');

let bot = new Bot({
  token: 'PAGE_TOKEN',
  verify: 'VERIFY_TOKEN',
  app_secret: 'APP_SECRET'
});

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('message', (payload, reply) => {
  let text = payload.message.text;

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err

    reply({ text }, (err) => {
      if (err) throw err

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
  });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

//this function just returns a random bar object
function getRandomBar(){
  var randomIndex = Math.random(bars.length);
  return bars[randomIndex]; 
}

http.createServer(bot.middleware()).listen(3000);
console.log('Echo bot server running at port 3000.');