// Grab requirements
require('dotenv').config();
const express = require('express');
const request = require('request');

// Initialise the listener
const app = express();
const PORT = 3000;

// Starts server & broadcast to admin
app.listen(process.env.PORT || PORT, function() {
  console.log('Bot is listening on port ' + PORT);
  var data = {form: {
    token: process.env.SLACK_AUTH_TOKEN,
    channel: "UV1BT6JAG",
    text: "=== Mittens is now running ==="
  }};

  request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
    // Sends welcome message
    //var msg = JSON.parse(response);
    if (response.statusCode != 200) {
        console.log("An error has ocurred: ", error);
    }else{
        console.log(JSON.parse(body));
    }
  });

});

/* ---------------------------- Messaging engine ---------------------------- */
var messages = require("./messageController.js")
messages.ping(app);