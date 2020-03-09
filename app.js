// Grab requirements
require('dotenv').config();
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

// Initialise the listener
const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Starts server & broadcast to admin
app.listen(process.env.PORT || PORT, function() {
  console.log(`=== LISTENING ON PORT ${PORT} ===`);
  // var data = {form: {
  //   token: process.env.SLACK_AUTH_TOKEN,
  //   channel: "UV1BT6JAG",
  //   text: "=== Mittens is now running ==="
  // }};

  // request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
  //   // Sends welcome message
  //   //var msg = JSON.parse(response);
  //   if (response.statusCode != 200) {
  //       console.log("An error has ocurred: ", error);
  //   }else{
  //       console.log(JSON.parse(body));
  //   }
  // });

});

/* ---------------------------- Messaging engine ---------------------------- */
var messages = require("./messageController.js");
messages.ping(app);
messages.joke(app);
messages.quote(app);
messages.simpsons(app);

/* ------------------------------- GIF Engine ------------------------------- */
var tenor = require("./gifController.js")
tenor.lolcats(app);
tenor.morning(app);