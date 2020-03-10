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
});

// app.post('/status', (req, res) => {
//   res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
//   console.log("\nCOMMAND: /ping");

//   var channel = req.body.channel_name;
//   var msgToSend = "pong";
  
//   sendSlackMessage(channel, msgToSend);
// }); //End app.post

/* ---------------------------- Messaging engine ---------------------------- */
var messages = require("./messageController.js");
messages.ping(app);
messages.joke(app);
messages.quote(app);
messages.simpsons(app);
messages.klingon(app);

/* ------------------------------- Media Engine ------------------------------- */
var media = require("./mediaController.js")
media.lolcats(app);
media.morning(app);
media.youtube(app);
media.spotify(app);

/* ------------------------------ Admin Engine ------------------------------ */
var admin = require("./adminController.js")
admin.help(app);