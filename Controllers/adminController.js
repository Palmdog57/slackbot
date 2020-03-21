// Import && initialise the required packages 
//const help_msg = require('../model/help.json');
const request = require("request-promise-native");
const chalk = require('chalk');
const loadDB = require('../db');
const debug = true;

/** 
 *  Return a help message for the specified command
 *  If no command was specified, return help on all commands
 *  @require help.json
 */
function command(app){
    app.post('/command', async (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /command");
        const channel = req.body.channel_name;
        let cmdToSearch = "";
        let msgToSend = "There was a problem getting your command :crying_cat_face:";

        if(typeof req.body.text !== 'undefined' && req.body.text){
            cmdToSearch = req.body.text;
            if (debug === true) console.log('cmdToSearch: ', verbose(cmdToSearch));

            await findCommand(cmdToSearch).then(function(description){
                if (debug === true) console.log("FIND_COMMAND_RETURNED: ", description);
                msgToSend = description[0].cmd_desc;
            });
        }

        console.log("Sending to slack: ", msgToSend);
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
        const uptime = convertHMS(sec);
        const msgToSend = `Mittens has been up for ${uptime}`;
        
        sendSlackMessage(channel, msgToSend);
    }); //End app.post
}; //Close function

module.exports = {
    command,
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

/** Query the mongoDB database */
async function findCommand(cmdToSearch) {
    const db = await loadDB();
    //var dbo = db.db("slackbot");
    return await db.collection("commands").find({"cmd_name":cmdToSearch}).toArray();
}