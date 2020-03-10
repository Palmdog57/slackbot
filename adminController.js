// Import && initialise the required packages 
const request = require('request');
const chalk = require('chalk');
const help_msg = require('./help.json');
const debug = false;

/** 
 *  Return a help message for the specified command
 *  If no command was specified, return help on all commands
 *  @require help.json
 */
function help(app){
    app.post('/help', (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /help");
        var channel = req.body.channel_name;

        // If there are no arguments, return help on all commands
        var helpCmd = req.body.text;
        var msgToSend = help_msg[helpCmd];

        // Send list of all commands with markdown
        if (!msgToSend) {
            var msgToSend = "";
            msgToSend += "*Here are all the commands and what they do: *\n";
            for (const [key, value] of Object.entries(help_msg)) {
                msgToSend += `*${key}*- ${value}\n`;
            }
        }

        sendSlackMessage(channel, msgToSend);

    }); //End app.post
}; //End help function

module.exports = {
    help
};

// Send constructed data to your slack channel
function sendSlackMessage(channel, msgToSend) {

    // Build slack requirements
    var data = {
        form: {
            token: process.env.SLACK_AUTH_TOKEN,
            channel: channel,
            text: msgToSend
        }
    };

    // Send constructed data
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        var msg = JSON.parse(response.body);
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