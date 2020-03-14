// Initialise the required packages 
// Include gif && greeting data
const request = require("request-promise-native");
const morning_gif = require('../model/data.json');
const chalk = require('chalk');
const debug = false;

/** 
 *  Return a random cat GIF to the channel the message originated from
 *  @todo Cleanup 200 OK request on line 12 
 *  @require request
 */
function lolcats(app){
    app.post('/cat', (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /cat");
        const channel = req.body.channel_name;

        // Query cat API and construct message from response
        request('http://edgecats.net/random', function (error, response, body) {
            let msgToSend = "Error occurred while trying to find the cats :crying_cat_face:"

            // @IMPORTANT - If the "random" part of the URL is not specified, a GIF stream will be returned
            // Unless you wanna crash the script and dump out some _pure garbage_ to slack, leave this here!!!
            if( response.headers['content-length'] > 200){
                console.error(chalk.red("413 - Payload Too Large"));
                console.error(chalk.red("Aborting"));
            }else{
                if (response.statusCode !== 200) {
                    console.error("CAT RECEIPT:", chalk.red(response.statusCode));
                    console.error(error);
                    msgToSend = "Error occurred while trying to find the cats :crying_cat_face:"
                }else{
                    console.log("CAT RECEIPT:", chalk.green(response.statusCode));
                    msgToSend = body
                }
            }

            sendSlackMessage(channel, msgToSend);

        }); //End request to edgecats
    }); //End app.post
}; //Close function

/** 
 *  Returns a message to the channel && a good morning GIF
 *  Picks the GIF from a JSON object specifed in ./data.json
 *  Displays a message sent by the user. If none exist, a JSON array of greetings is called
 *  If no greeting is found, the message displayed is 'Good morning'
 *  @require ./data.json
 */
function morning(app){
    app.post('/morning', (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /morning");
        const channel = req.body.channel_name;

        // Random number generator
        const number = Math.floor(Math.random() * 26);
        if (debug === true) console.log("NUMBER: ", number);

        let greeting = "";
        if (!req.body.text){
            ( !morning_gif.greetings[number] ) ? greeting = "Good Morning!" : greeting = morning_gif.greetings[number];
        }else{
            const greeting = req.body.text;
        }

        const msgToSend = `*${greeting}*\n${morning_gif.gifs[number]}`;
        sendSlackMessage(channel, msgToSend);

    }); // End app.post
}; // Close function

/** 
 *  Connect to YouTube search API and return first result
 *  @require request
 *  @require process.env
 */
function youtube(app){
    app.post('/youtube', async (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /youtube");
        const channel = req.body.channel_name;
        let search = "";


        // If no text was sent, make them pay
        (!req.body.text) ? search = "rick roll" : search = encodeURIComponent(req.body.text);
        const youtubeKey = process.env.YOUTUBE_KEY;

        // Construct YouTube request
        const options = {
            url: `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${search}&type=video&key=${youtubeKey}`,
            headers: {'Accept': 'application/json'},
            resolveWithFullResponse: true
          };

        await RequestGet(options).then(response => {
            const info = JSON.parse(response);
            let msgToSend = "A problem occurred contacting YouTube :crying_cat_face:";

            if (typeof info.error !== "undefined" && info.error) {
                console.error("YOUTUBE RECEIPT:", chalk.red(info.error.code));
                console.error("YOUTUBE RECEIPT:", chalk.red(info.error.message));
            }else{
                console.error("YOUTUBE RECEIPT:", chalk.green(200));
                msgToSend = `https://www.youtube.com/watch?v=${info.items[0].id.videoId}`;
            }

            sendSlackMessage(channel, msgToSend);

           });
    }); //End app.post
}; //Close function

/** 
 *  Connect to Spotify search API and return first result
 *  @require request
 *  @require process.env
 */
function spotify(app){
    app.post('/spotify', (req, res) => {
        res.end(); // Send 200 OK to avoid timeout error.
        console.log("\nCOMMAND: /spotify");
        const channel = req.body.channel_name;
        
        // If no text was specified, send the inevitable
        if (!req.body.text) search = "rick roll";
        const search = encodeURIComponent(req.body.text);
        const spotifyKey = process.env.SPOTIFY_CLIENT_SECRET;

        // Construct Spotify request
        const options = {
            url: `https://api.spotify.com/v1/search?q=${search}&type=track&market=US&limit=1`,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer BQCguQE_EfraZyEk1wby4wVvLqxkCjRFwv2DiqBiZZg5m26f5wpdBdYXa0gGQvM94_u3mV55TnY0qQ4iNUoRcJ_aZLgxfcr6x8-D2vaNKCQw9aZIg16U_gnV3_7IiB3jC9FbBZiZ3J4vpB0'
            }
          };

        // Send request with constructed operators
        request(options, function (error, response, body) {
            const resp = JSON.parse(body);
            if (response.statusCode !== 200) {
                console.error("SPOTIFY RECEIPT:", chalk.red(response.statusCode));
                console.error("SPOTIFY RECEIPT:", chalk.red(resp.error.message));
                msgToSend = "A problem occurred contacting Spotify :crying_cat_face:"
            }else{
                console.log("SPOTIFY RECEIPT:", chalk.green(response.statusCode));
                const tracks = resp.tracks.items[0];
                msgToSend = tracks.external_urls.spotify;
            }

            sendSlackMessage(channel, msgToSend);

        }); //End request to Spotify
    }); //End app.post
}; //Close function

module.exports = {
    lolcats,
    morning,
    youtube,
    spotify
};

// Send constructed data to slack
function sendSlackMessage(channel, msgToSend) {

    // Build slack requirements
    const data = {
        form: {
            token: process.env.SLACK_AUTH_TOKEN,
            channel: channel,
            text: msgToSend
        }
    };

    // Run the request using constructed operators
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

// Ping API with specified data
async function RequestGet(options) {
    return request(options).then(res => {
        if(debug === true) console.log("Status:", res.statusCode);
        return res.body;
    }).catch(error => {
        ( typeof error.error !== 'undefined' && error.error ) ? err = error.error : err = error;
        if (debug === true) console.log(`Returning ${err}`);
        return err;
    });
};