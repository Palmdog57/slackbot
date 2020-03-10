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

        console.log("BODY: ", req.body);

        // Construct the data for our slack response
        var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                channel: req.body.channel_name,
                text: "pong"
            }};
        
        sendSlackMessage(data);
    }); //End app.post
}; //Close function

/** Ping a jokes API & return the joke to the user 
 *  @require request
 *  @URL https://icanhazdadjoke.com/
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

/** Ping a "quote of the day" API & return the quote & author to the user 
 *  API is throttled to 10 requests an hour
 *  @require request
 *  @URL https://quotes.rest/
*/
function quote(app){
    app.post('/quote', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /quote");

        const options = {
            url: 'https://quotes.rest/qod?language=en',
            headers: {'Accept': 'application/json'}
        };

        // Query a jokes API and sends response in slack message
        request.get(options, function (error, response, body) {
            const info = JSON.parse(body);
            if (response.statusCode != 200){
                console.error("QUOTE RECEIPT:", chalk.red(response.statusCode));
                console.error("QUOTE RECEIPT:", chalk.red(info.error.message));

                var msgToSend = "Error contacting the quote API :crying_cat_face:";
            }else {
                console.log("QUOTE RECEIPT:", chalk.green(response.statusCode));
                var msgToSend = `*"${info.contents.quotes[0].quote}"*\n-${info.contents.quotes[0].author}`;
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

/** Ping a "Simpsons Quotes" API & return the quote & author to the user 
 *  API does not return true response; hence the body include
 *  @require request
 *  @URL https://thesimpsonsquoteapi.glitch.me/quotes
*/
function simpsons(app){
    app.post('/simpsons', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /simpsons");

        const options = {
            url: 'https://thesimpsonsquoteapi.glitch.me/quotes',
            headers: {'Accept': 'application/json'}
        };

        // Query a jokes API and sends response in slack message
        request.get(options, function (error, response, body) {
            const info = JSON.parse(body);
            if (body.includes("D'oh!")) {
                console.error("SIMPSONS RECEIPT:", chalk.red(500));
                console.error("SIMPSONS RECEIPT:", chalk.red("Internal Server Error"));

                var msgToSend = "Error contacting The Simpsons quote API :crying_cat_face:";
            }else {
                console.log("SIMPSONS RECEIPT:", chalk.green(response.statusCode));
                var msgToSend = `*"${info[0].quote}"*\n-${info[0].character}`;
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

/** Ping a "Klingon translation" API & return the quote & author to the user 
 *  API does not return true response; hence the body include
 *  @require request
 *  @URL https://api.funtranslations.com/translate/klingon.json
*/
function klingon(app){
    app.post('/klingon', (req, res) => {
        res.end(); //Send a 200 okay message to slack to avoid timeout error being displayed to the user
        console.log("\nCOMMAND: /klingon");
        var msgToTranslate = req.body.text;
        const options = {
            url: 'https://api.funtranslations.com/translate/klingon.json?text='+msgToTranslate,
            headers: {'Accept': 'application/json'}
        };

        // Query a jokes API and sends response in slack message
        request.get(options, function (error, response, body) {
            const info = JSON.parse(body);
            if (body.statusCode != 200) {
                console.error("KLINGON RECEIPT:", chalk.red(info.error.code));
                console.error("KLINGON RECEIPT:", chalk.red(info.error.message));

                var msgToSend = "Error contacting the klingon translations API :crying_cat_face:";
            }else {
                console.log("KLINGON RECEIPT:", chalk.green(response.statusCode));
                var msgToSend = `*"${info.contents.translated}"*\n-Klingon translation of "${info.contents.text}"`;
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
    joke,
    quote,
    simpsons,
    klingon
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