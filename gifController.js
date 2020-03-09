// Initialise the required packages 
// Include gif && greeting data
const request = require('request');
const morning_gif = require('./data.json');
const chalk = require('chalk');
const debug = true;

/** Return a random cat GIF to the channel the message originated from
 *  @todo Cleanup 200 OK request on line 12 
 *  @require request
 */
function lolcats(app){
    app.post('/cat', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /cat");

        // Query the cat API and set the body of the response as our slack message
        request('http://edgecats.net/random', function (error, response, body) {
            if (response.statusCode != 200) console.error(error);

            // Construct the data for our slack response
            const data = {
                form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: body
                }
            };

            sendSlackMessage(data);

        }); //End request to edgecats
    }); //End app.post
}; //Close function

/** Returns a message to the channel && a good morning GIF
 *  Picks the GIF from a JSON object specifed in ./data.json
 *  Displays a message sent by the user. If none exist, a JSON array of greetings is called
 *  If all else fails, the message displayed is 'Good morning'
 *  @require ./data.json
 */
function morning(app){
    app.post('/morning', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /morning");

        // Random number to use for selecting gif & greeting
        var number = Math.floor(Math.random() * 26);
        if (debug == true) console.log("NUMBER: ", number);

        // If no text was sent from slack and the random number is higher than 10, set a default message
        if (!req.body.text){
            if (!morning_gif.greetings[number]){
                var greeting = "Good Morning!";
            }else{
                var greeting = morning_gif.greetings[number];
            }
        }else{
            var greeting = req.body.text;
        }

        var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                type: "mrkdwn",
                channel: req.body.channel_name,
                text: `*${greeting}*\n${morning_gif.gifs[number]}`
            }};

        sendSlackMessage(data);

    }); // End app.post
}; // Close function

module.exports = {
    lolcats,
    morning
}

function sendSlackMessage(data) {
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        var responseData = response.body;
        var msg = JSON.parse(responseData);
        if (msg.ok == true){
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