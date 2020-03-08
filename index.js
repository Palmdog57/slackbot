// Grab requirements
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");

// Initialise the listener
const app = express();
const PORT = 3000;

// Starts server
app.listen(process.env.PORT || PORT, function() {
  console.log('Bot is listening on port ' + PORT);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* --------------------- Test that everything is working -------------------- */
app.post('/test', (req, res) => {
  var data = {form: {
        token: process.env.SLACK_AUTH_TOKEN,
        channel: "#general",
        text: "Hi! :wave: \n I'm your new bot."
      }};
      console.log(data);
  request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        // Sends welcome message
        var msg = res.json();
        if (msg.statusCode != 200) {
          console.log("An error has ocurred: ", error);
        }else{
          console.log(body);
        }
        
      });
});

/* ----------------------- Legit ping command is legit ---------------------- */
app.post('/ping', (req, res) => {
  var data = {form: {
        token: process.env.SLACK_AUTH_TOKEN,
        channel: "#general",
        text: "pong"
      }};
  request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        // Sends welcome message
        var msg = res.json();
        if (msg.statusCode != 200) {
          console.log("An error has ocurred: ", error);
        }else{
          console.log(JSON.parse(body));
        }

      });
});