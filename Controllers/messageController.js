// Initialise the required packages & debug mode
const request = require("request-promise-native");
let Controller = require("./Controller");
Controller = new Controller;
const debug = true;

/** 
 *  When the server receives a ping, it replies with "pong"
 *  Simple method of ensuring the bot is up & responses are working
 *  @require none
 */
function ping(app){
    app.post('/ping', (req, res) => {
        const name = "ping"
        res.end();  // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;
        const msgToSend = "pong!";

        if (debug === true) Controller.debugToJSON("Message we're sending", msgToSend);

        sendSlackMessage(channel, msgToSend);
    }); //End app.post
}; //Close function

/** 
 *  Ping jokes API & send response to user 
 *  @require request
 *  @URL https://icanhazdadjoke.com/
*/
function joke(app){
    app.post('/joke', async (req, res) => {
        const name = "joke"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;

        const options = {
            url: 'https://icanhazdadjoke.com/',
            headers: {'Accept': 'application/json'},
            resolveWithFullResponse: true
        };

        await RequestGet(options).then(response => {
            const info = JSON.parse(response);
            let msgToSend = `${info.joke} :joy_cat:`;

            if (info.status !== 200){
                Controller.error("JOKE STATUS:", info.status);
                msgToSend = "Error contacting the joke API :crying_cat_face:";
            }else {
                Controller.success("JOKE RECEIPT:", info.status);
            }

            sendSlackMessage(channel, msgToSend);
        });
    }); //End app.post
}; //Close function

/** 
 *  Ping "quote of the day" API & send response to user 
 *  API is throttled to 10 requests an hour
 *  @require request
 *  @URL https://quotes.rest/
*/
function quote(app){
    app.post('/quote', async (req, res) => {
        const name = "quote"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;

        const options = {
            url: 'https://quotes.rest/qod?language=en',
            headers: {'Accept': 'application/json'},
            resolveWithFullResponse: true
        };

        let msgToSend = "";

        await RequestGet(options).then(response => {
            const info = JSON.parse(response);
            if (debug === true) console.log("DEBUG: ", info);

            if(typeof info.error !== 'undefined' && info.error){
                Controller.error("QUOTE STATUS:", info.error.code);
                msgToSend = "Error contacting the quotes API :crying_cat_face:";
            }else{
                Controller.success("QUOTE RECEIPT:", Controller.codes.SUCCESS);
                msgToSend = `*"${info.contents.quotes[0].quote}"*\n-${info.contents.quotes[0].author}`;
            }

            sendSlackMessage(channel, msgToSend);
        });
    }); //End app.post
}; //Close function

/** Ping a "Simpsons Quotes" API & return the quote & author to the user 
 *  API does not return true response; hence the body include
 *  @require request
 *  @URL https://thesimpsonsquoteapi.glitch.me/quotes
*/
function simpsons(app){
    app.post('/simpsons', (req, res) => {
        const name = "simpsons"
        res.end();  // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;

        const options = {
            url: 'https://thesimpsonsquoteapi.glitch.me/quotes',
            headers: {'Accept': 'application/json'},
            resolveWithFullResponse: true
        };

       let msgToSend = "";

        request.get(options, function (error, response, body) {
            const info = JSON.parse(body);

            if (body.includes("D'oh!")) {
                Controller.error("SIMPSONS RECEIPT:", Controller.codes.INTERNAL_SERVER_ERROR);
                Controller.error("SIMPSONS RECEIPT:", Controller.msg.INTERNAL_SERVER_ERROR);

                msgToSend = "Error contacting The Simpsons quote API :crying_cat_face:";
            }else{
                Controller.success("SIMPSONS RECEIPT:", response.statusCode);
                msgToSend = `*"${info[0].quote}"*\n-${info[0].character}`;
            }

            sendSlackMessage(channel, msgToSend);
        }); //End request to joke API
    }); //End app.post
}; //Close function

/** 
 *  Ping a "Klingon translation" API & return the quote & author to the user 
 *  API does not return true response; hence the body include
 *  @require request
 *  @URL https://api.funtranslations.com/translate/klingon.json
*/
function klingon(app){
    app.post('/klingon', async (req, res) => {
        const name = "klingon"
        res.end(); // Send 200 OK to avoid timeout error.
        Controller.info("\nCOMMAND:",  `/${name}`);
        const channel = req.body.channel_name;

        let msgToTranslate = "";
        let msgToSend = "";

        if ( typeof req.body.text !== "undefined" && req.body.text ) msgToTranslate = req.body.text;

        const options = {
            url: 'https://api.funtranslations.com/translate/klingon.json?text='+msgToTranslate,
            headers: {'Accept': 'application/json'},
            resolveWithFullResponse: true
        };

        await RequestGet(options).then(response => {
            const info = JSON.parse(response);
            if (typeof info.error !== 'undefined' && info.error) {
                msgToSend = "Error contacting the klingon API :crying_cat_face:"
                Controller.error("QUOTE STATUS:", info.error.code)
            }else {
                msgToSend = `*"${info.contents.translated}"*\n-Klingon translation of "${info.contents.text}"`
                Controller.success("QUOTE RECEIPT:", info.error);
            }

            sendSlackMessage(channel, msgToSend);

        }); //End request to klingon API
    }); //End app.post
}; //Close function

module.exports = {
    ping,
    joke,
    quote,
    simpsons,
    klingon
}


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

    // Send constructed data
    request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
        var msg = JSON.parse(response.body);
        if (msg.ok === true){
            msg.statusCode = 200;
            Controller.success("SLACK RECEIPT:", msg.statusCode);
            console.log("MESSAGE SENT:", msg.message.text);
        } else{
            msg.statusCode = 500;
            Controller.error("SLACK RECEIPT:", msg.statusCode);
            Controller.error("ERROR:", msg.error);
        }
    }); //End request to slack API
};

// Ping API with specified data
async function RequestGet(options) {
    return request(options).then(res => {
        if(debug === true) Controller.debug("Status:", res.statusCode);
        return res.body;
    }).catch(error => {
        ( typeof error.error !== 'undefined' && error.error ) ? err = error.error : err = error;
        // if (debug === true) Controller.debug(`Returning ${err}`);
        return err;
    });
};