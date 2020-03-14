// Import && initialise the required packages 
const help_msg = require('../model/help.json');
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
        const channel = req.body.channel_name;

        // If there are no arguments, return help on all commands
        var helpCmd = req.body.text;
        let msgToSend = help_msg[helpCmd];

        // Send list of all commands with markdown
        if (!msgToSend) {
            msgToSend += "*Here are all the commands and what they do: *\n";
            for (const [key, value] of Object.entries(help_msg)) {
                msgToSend += `*${key}*- ${value}\n`;
            }
        }

        sendSlackMessage(channel, msgToSend);

    }); //End app.post
}; //End help function

/** 
 *  When the server receives a ping, it replies with "pong"
 *  Simple method of ensuring the bot is up & responses are working
 *  @require none
 */
function uptime(app){
    app.post('/uptime', (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /uptime");
        const channel = req.body.channel_name;
        const sec = process.uptime();
        const yourTime = convertHMS(sec);
        const msgToSend = `Mittens has been up for ${yourTime}`;
        
        sendSlackMessage(channel, msgToSend);
    }); //End app.post
}; //Close function

module.exports = {
    help,
    uptime
};

// Send constructed data to slack
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
        const msg = JSON.parse(response.body);
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

/** Convert seconds to ISO format */
function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+' hours '+minutes+' minutes '+seconds+' seconds '; // Return is HH : MM : SS
}