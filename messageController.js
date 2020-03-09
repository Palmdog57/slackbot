// Initialise the required packages & debug mode
const request = require('request');
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
        
        // Query the slack web API using the above form data
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
        }); //End request to slack API
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

        // Query a jokes API and extract the joke contained within ten million objects
        request('https://api.jokes.one/jod', function (error, response, body) {
            if (response.statusCode != 200){
                console.error("JOKE RECEIPT:", response.statusCode);
                var catError = JSON.parse(response.body);
                var errorFromCat = catError.error.message;
                console.log("ERROR:", errorFromCat);

                var data = {form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: "Error contacting the joke API :crying_cat_face:"
                }};

            }else {
                var msg = JSON.parse(response.body);
                var joke = msg.contents.jokes;
                var jod = joke[0].joke.text;

                console.log("JOKE RECEIPT:", response.statusCode);

                var data = {form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: `${jod} :joy_cat:`
                }};
            }

            request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
                var responseData = response.body;
                var msg = JSON.parse(responseData);
                if (msg.ok == true){
                    msg.statusCode = 200;
                    console.log("SLACK RECEIPT:", msg.statusCode);
                    console.log("MESSAGE SENT:", msg.message.text);
                }else{
                    msg.statusCode = 500;
                    console.log("SLACK RECEIPT:", msg.statusCode);
                    console.log("ERROR:", msg);
                }
            }); //End request to slack API
        }); //End request to joke API
    }); //End app.post
}; //Close function

module.exports = {
    ping,
    joke
 }