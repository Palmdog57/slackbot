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
        res.end(); // Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /cat");
        var channel = req.body.channel_name;

        // Query the cat API and set the body of the response as our slack message
        request('http://edgecats.net/random', function (error, response, body) {
            // @IMPORTANT - If the "random" part of the URL is not specified, a GIF stream will be returned
            // Unless you wanna crash the script and dump out some _pure garbage_ to slack, leave this here!!!
            if( response.headers['content-length'] > 200){
                console.error(chalk.red("413 - Payload Too Large"));
                console.error(chalk.red("Going for shutdown"));
                var msgToSend = "Error occurred while trying to find the cats :crying_cat_face:"
            }else{
                if (response.statusCode !== 200) {
                    console.error("CAT RECEIPT:", chalk.red(response.statusCode));
                    console.error(error);

                    var msgToSend = "Error occurred while trying to find the cats :crying_cat_face:"
                }else{
                    console.log("CAT RECEIPT:", chalk.green(response.statusCode));
                    var msgToSend = body
                }
            }

            sendSlackMessage(channel, msgToSend);

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
        res.end(); // Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /morning");
        var channel = req.body.channel_name;

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

        var msgToSend = `*${greeting}*\n${morning_gif.gifs[number]}`;

        sendSlackMessage(channel, msgToSend);

    }); // End app.post
}; // Close function

/** Connect to YouTube search API and return first result
 *  @require request
 *  @require process.env
 */
function youtube(app){
    app.post('/youtube', (req, res) => {
        res.end(); // Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /youtube");
        var channel = req.body.channel_name;
        
        // If no text was sent, make them pay
        if (!req.body.text) search = "rick roll";
        var search = encodeURIComponent(req.body.text);
        var youtubeKey = process.env.YOUTUBE_KEY;

        const options = {
            url: `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${search}&type=video&key=${youtubeKey}`,
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

            sendSlackMessage(channel, msgToSend);

        }); //End request to edgecats
    }); //End app.post
}; //Close function

/** Connect to YouTube search API and return first result
 *  @require request
 *  @require process.env
 */
function spotify(app){
    app.post('/spotify', (req, res) => {
        res.end(); // Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /spotify");
        var channel = req.body.channel_name;
        
        // If no text was sent, make them pay
        if (!req.body.text) search = "rick roll";
        var search = encodeURIComponent(req.body.text);
        var spotifyKey = process.env.SPOTIFY_CLIENT_SECRET;

        const options = {
            url: `https://api.spotify.com/v1/search?q=${search}&type=track&market=US&limit=1`,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer BQCguQE_EfraZyEk1wby4wVvLqxkCjRFwv2DiqBiZZg5m26f5wpdBdYXa0gGQvM94_u3mV55TnY0qQ4iNUoRcJ_aZLgxfcr6x8-D2vaNKCQw9aZIg16U_gnV3_7IiB3jC9FbBZiZ3J4vpB0'
            }
          };

        // Query the cat API and set the body of the response as our slack message
        request(options, function (error, response, body) {
            var resp = JSON.parse(body);
            if (response.statusCode !== 200) {
                console.error("SPOTIFY RECEIPT:", chalk.red(response.statusCode));
                console.error("SPOTIFY RECEIPT:", chalk.red(resp.error.message));

                var msgToSend = "A problem occurred contacting Spotify :crying_cat_face:"
            }else{
                console.log("SPOTIFY RECEIPT:", chalk.green(response.statusCode));
                var tracks = resp.tracks.items[0];
                var msgToSend = tracks.external_urls.spotify;
            }

            sendSlackMessage(channel, msgToSend);

        }); //End request to edgecats
    }); //End app.post
}; //Close function

module.exports = {
    lolcats,
    morning,
    youtube,
    spotify
};

// Send the data via a slack message.
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