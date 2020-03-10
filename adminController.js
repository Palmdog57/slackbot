// Import && initialise the required packages 
const request = require('request');
const chalk = require('chalk');
const help_msg = require('./help.json');
const debug = false;

function help(app){
    app.post('/help', (req, res) => {
        res.end(); // Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /help");
        var channel = req.body.channel_name;

        // If there are no arguments, return help on all commands
        var helpCmd = req.body.text;
        var msgToSend = help_msg[helpCmd];

        if(!msgToSend){
            var msgToSend = "";
            msgToSend += "*Here are all the commands and what they do: *\n";
            for (const [key, value] of Object.entries(help_msg)) {
                msgToSend += `*${key}*- ${value}\n`;
            }
        }

        sendSlackMessage(channel, msgToSend);

    }); //End request to edgecats
}; //End app.post

module.exports = {
    help
};

function sendSlackMessage(channel, msgToSend) {

    // Construct the data for our slack response
    var data = {
        form: {
            token: process.env.SLACK_AUTH_TOKEN,
            channel: channel,
            text: msgToSend
        }
    };
    
    // Send the previously constructed data
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        var responseData = response.body;
        var msg = JSON.parse(responseData);
        if (msg.ok === true){
            msg.statusCode = 200;
            console.log("SLACK RECEIPT:", chalk.green(msg.statusCode));
            console.log("MESSAGE SENT:", msg.message.text);
        } else{
            msg.statusCode = 500;
            console.log("SLACK RECEIPT:", chalk.red(msg.statusCode));
            console.log("ERROR:", chalk.red(msg.error));
        }
    }); //End request to slack API
};