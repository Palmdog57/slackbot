// Initialise the required packages 
// Include gif && greeting data
const request = require('request');
const morning_gif = require('./data.json');
const chalk = require('chalk');
const debug = false;

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
            // @IMPORTANT - If the "random" part of the URL is not specified, a GIF stream will be returned
            // Unless you wanna crash the script and dump out some _pure garbage_ to slack, leave this here!!!
            if( response.headers['content-length'] > 200){
                console.error(chalk.red("413 - Payload Too Large"));
                console.error(chalk.red("Going for shutdown"));
                process.exit();
            }
            if (response.statusCode !== 200) {
                console.error("CAT RECEIPT:", chalk.red(response.statusCode));
                console.error(error);

                var msgToSend = "Error occurred while trying to find the cats :crying_cat_face:"
            }else{
                console.log("CAT RECEIPT:", chalk.green(response.statusCode));
                var msgToSend = body
            }

            // Construct the data for our slack response
            const data = {
                form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: msgToSend
                }
            };

            sendSlackMessage(data);

        }); //End request to edgecats
    }); //End app.post
}; //Close function

/** Returns a message to the channel && a good morning GIF
 *  Picks the GIF from a JSON object specifed in ./data.json
 *  Displays a message sent by the user. If none exist, a JSON array of greetings is called
 *  If no greeting is found, the message displayed is 'Good morning'
 *  @require ./data.json
 */
function morning(app){
    app.post('/morning', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /morning");

        // Random number to use for selecting gif & greeting
        var number = Math.floor(Math.random() * 26);
        if (debug === true) console.log("NUMBER: ", number);

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

/** Connect to YouTube search API and return first result
 *  @require request
 *  @require process.env
 */
function youtube(app){
    app.post('/youtube', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /youtube");
        
        // If no text was sent, make them pay
        if (!req.body.text) search = "rick roll";
        var search = encodeURIComponent(req.body.text);
        var youtubeKey = process.env.YOUTUBE_KEY;

        const options = {
            url: `https://www.googleapis.com/youtube/v3/search?part=snipet&q=${search}&key=${youtubeKey}`,
            headers: {'Accept': 'application/json'}
          };

        // Query the cat API and set the body of the response as our slack message
        request(options, function (error, response, body) {
            var resp = JSON.parse(body);
            if (response.statusCode !== 200) {
                console.error("YOUTUBE RECEIPT:", chalk.red(response.statusCode));
                console.error(resp.error.message);

                var msgToSend = "A problem occurred contacting YouTube :crying_cat_face:"
            }else{
                console.log("YOUTUBE RECEIPT:", chalk.green(response.statusCode));
                var videoId = resp.items[0].id.videoId;
                var msgToSend = `https://www.youtube.com/watch?v=${videoId}`;
            }

            // Construct the data for our slack response
            const data = {
                form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: msgToSend
                }
            };

            sendSlackMessage(data);

        }); //End request to edgecats
    }); //End app.post
}; //Close function

module.exports = {
    lolcats,
    morning,
    youtube
};

function sendSlackMessage(data) {
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