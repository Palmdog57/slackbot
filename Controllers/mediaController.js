// Initialise the required packages 
// Include gif && greeting data
const request = require("request-promise-native");
const SpotifyWebApi = require('spotify-web-api-node');
const chalk = require('chalk');

const morning_gif = require('../model/data.json');
const loadDB = require('../db');

let Controller = require("./Controller");
Controller = new Controller;
const debug = false;

// // credentials are optional
// const spotifyApi = new SpotifyWebApi({
//     clientId: `${process.env.SPOTIFY_CLIENT_ID}`,
//     clientSecret: `${process.env.SPOTIFY_CLIENT_SECRET}`
// });

/** 
 *  Return a random cat GIF to the channel the message originated from
 *  @todo Cleanup 200 OK request on line 12 
 *  @require request
 */
function lolcats(app){
    app.post('/cat', (req, res) => {
        const name = "lolcats"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
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
    app.post('/morning', async (req, res) => {
        const name = "morning"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        Controller.debug("REQUEST BODY: ", req.body);
        const channel = req.body.channel_name;

        // Random number generator
        const number = Math.floor(Math.random() * 10);
        const num_to_search = number.toString();
        Controller.debug("Number to search: ", num_to_search);

        let greeting = "";
        let gif = "";

        await findGreetingAndGif(num_to_search).then(function(res){
            greeting = res[0][0]['gtn_value'];
            gif = res[1][0]['gif_url']
        });

        const msgToSend = `*${greeting}*\n${gif}`;
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
        const name = "youtube"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;
        const youtubeKey = process.env.YOUTUBE_KEY;
        let search = "";

        (!req.body.text) ? search = "rick roll" : search = encodeURIComponent(req.body.text);

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
    app.post('/spotify', async (req, res) => {
        const name = "spotify"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;
        let search = "";

        (!req.body.text) ? search = "never gonna give you up" : search = encodeURIComponent(req.body.text);

        
        // Authorization is Base64 encoded client:secret as per env
        var options = {
            'method': 'POST',
            'url': 'https://accounts.spotify.com/api/token',
            'headers': {
              'Authorization': 'Basic ZGVkNmIxZTRlMDVmNDM5MTllN2E5ZDg1Y2JiM2Q0ZWM6M2UwY2YzMGI2YmI2NDRmN2FlMzcxZGNlYzIwOGU2ZmY=',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
              'grant_type': 'client_credentials'
            }
          };
          
          request(options, function (error, response) { 
              if (error) throw new Error(error);
              const res = JSON.parse(response.body);
              var access_token = res.access_token;
              
              var trackOpts = {
                  'url': `https://api.spotify.com/v1/search?q=${search}&type=track&market=US&limit=1`,
                  'headers': {
                      'Accept': 'application/json',
                      'Authorization': `Bearer ${access_token}`
                  }
              };
          
              request(trackOpts, function (error, response) { 
                if (error) throw new Error(error);
                var info = JSON.parse(response.body);
                const msgToSend = info.tracks.items[0].external_urls.spotify;

                sendSlackMessage(channel, msgToSend);

              });
          });

        }); //End request to Spotify
}; //Close function

/** 
 * Send constructed data to slack
 * @require Environment variables
 * @require STRING channel
 * @require STRING msgToSend
 */
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
            console.log("\nSLACK RECEIPT:", chalk.green(msg.statusCode));
            console.log("MESSAGE SENT:", msg.message.text);
        } else{
            msg.statusCode = 500;
            console.log("SLACK RECEIPT:", chalk.red(msg.statusCode));
            console.log("ERROR:", chalk.red(msg.error));
        }
    }); //End request to slack API
};

/**
 * Ping API with specified data
 * @require ARRAY options [method, URL, headers]
 */
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

/**
 * Query our mongoDB database for a greeting and a gif
 * @require DATABASE_CONTROLLER
 * @require INT num_to_search
 */
async function findGreetingAndGif(num_to_search) {
    const db = await loadDB();
    let gtn_to_return = await db.collection("greetings").find({"gtn_id":num_to_search}).toArray();
    let gif_to_return = await db.collection("gifs").find({"gif_id":num_to_search}).toArray(); 
    
    // console.log("FIND GREETING OBJECT: ", gtn_to_return);
    // console.log("FIND GIF OBJECT: ", gif_to_return);

    return [gtn_to_return, gif_to_return]
}


module.exports = {
    lolcats,
    morning,
    youtube,
    spotify
};