// Initialise the required packages & debug mode
const request = require('request');
const chalk = require('chalk');
const debug = true;

/** When the server receives a ping, it replies with "pong"
 *  Simple method of ensuring the bot is up & responses are working
 *  @require none
 */
function ping(app){
    app.post('/ping', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /ping");

        // Construct the data for our slack response
        var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                channel: req.body.channel_name,
                text: "pong"
            }};
        
        sendSlackMessage(data);
    }); //End app.post
}; //Close function

/** Ping a jokes API & return the value to the user 
 *  Joke API is throttled to 10 requests an hour
 *  @require none
*/
function joke(app){
    app.post('/joke', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /joke");

        const options = {
            url: 'https://icanhazdadjoke.com/',
            headers: {'Accept': 'application/json'}
        };

        // Query a jokes API and sends response in slack message
        request.get(options, function (error, response, body) {
            const info = JSON.parse(body);
            if (response.statusCode != 200){
                console.error("JOKE RECEIPT:", chalk.red(response.statusCode));
                console.error("JOKE RECEIPT:", chalk.red(info.message));

                var msgToSend = "Error contacting the joke API :crying_cat_face:";
            }else {
                console.log("JOKE RECEIPT:", chalk.green(response.statusCode));
                var msgToSend = `${info.joke} :joy_cat:`;
            }

            var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                channel: req.body.channel_name,
                text: `${msgToSend}`
            }};

            sendSlackMessage(data);
        }); //End request to joke API
    }); //End app.post
}; //Close function

module.exports = {
    ping,
    joke
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