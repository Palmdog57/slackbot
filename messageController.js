// Initialise the required packages & debug mode
const request = require('request');
const debug = true;

/** When the server receives a ping, it replies with "pong"
 *  Simple method of ensuring the bot is up & responses are working
 *  @require none
 */
function ping(app){
    app.post('/ping', (req, res) => {
        res.end();
        console.log("\nCOMMAND: /ping");

        var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                channel: req.body.channel_name,
                text: "pong"
            }};
        request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
            var responseData = response.body;
            var msg = JSON.parse(responseData);
            if (msg.ok == true){
                msg.statusCode = 200;
                console.log("STATUS: ", msg.statusCode);
                console.log("MESSAGE: ", msg.message.text);
            }else{
                msg.statusCode = 500;
                console.log("STATUS: ", msg.statusCode);
                console.log("ERROR: ", msg);
            }
        });
    });
};

/** Ping a jokes API & return the value to the user 
 *  Joke API is throttled to 10 requests an hour
 *  @require none
*/
function joke(app){
    app.post('/joke', (req, res) => {
        res.end();
        console.log("\nCOMMAND: /joke");

        request('https://api.jokes.one/jod', function (error, response, body) {
            var msg = JSON.parse(response.body);
            var joke = msg.contents.jokes;
            var jod = joke[0].joke.text;

            if(debug == true){
                console.log("DEBUG - message response: ", msg);
                console.log("DEBUG - joke body response: ", joke);
                console.log("DEBUG - joke of the day response: ", jod);
            }


            var data = {form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: jod
                }};
            request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
                var responseData = response.body;
                var msg = JSON.parse(responseData);
                if (msg.ok == true){
                    msg.statusCode = 200;
                    console.log("STATUS: ", msg.statusCode);
                    console.log("MESSAGE: ", msg.message.text);
                }else{
                    msg.statusCode = 500;
                    console.log("STATUS: ", msg.statusCode);
                    console.log("ERROR: ", msg);
                }
            });
        });
    });
};

module.exports = {
    ping,
    joke
 }