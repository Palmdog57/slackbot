// Grab requirements
require('dotenv').config();
const express = require('express');
//const request = require('request');
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

/* ---------------------------- Messaging engine ---------------------------- */
var messages = require("./Controllers/messageController.js");
messages.ping(app);
messages.joke(app);
messages.quote(app);
messages.simpsons(app);
messages.klingon(app);

/* ------------------------------- Media Engine ------------------------------- */
var media = require("./Controllers/mediaController.js")
media.lolcats(app);
media.morning(app);
media.youtube(app);
media.spotify(app);

/* ------------------------------ Admin Engine ------------------------------ */
var admin = require("./Controllers/adminController.js")
admin.help(app);
admin.uptime(app);