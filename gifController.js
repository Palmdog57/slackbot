const request = require('request');
const morning_gif = require('./data.json');

/** Return a random cat GIF to the channel the message originated from
 * @require request
 */
function lolcats(app){
    app.post('/cat', (req, res) => {
        res.end();
        console.log("\nCOMMAND: /cat");

        request('http://edgecats.net/random', function (error, response, body) {
            if (response.statusCode != 200) console.error(error);

            const data = {
                form: {
                    token: process.env.SLACK_AUTH_TOKEN,
                    channel: req.body.channel_name,
                    text: body
                }
            };

            request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
                var responseData = response.body;
                var msg = JSON.parse(responseData);
                if (msg.ok == true){
                    msg.statusCode = 200;
                    console.log("STATUS: ", msg.statusCode);
                    console.log("MESSAGE: ", msg.message.text);
                }else{
                    msg.statusCode = 500;
                    console.error("STATUS: ", msg.statusCode);
                    console.error("ERROR: ", msg);
                }
            });
        });
    });
};

/** Returns a message to the channel && a good morning GIF
 *  Picks the GIF from a JSON object specifed in ./data.json
 *  Displays a message sent by the user. If none exist, a JSON array of greetings is called
 *  If all else fails, the message displayed is 'Good morning'
 *  @require ./data.json
 */
function morning(app){
    app.post('/morning', (req, res) => {
        res.end();

        console.log("\nCOMMAND: /morning");

        var number = Math.floor(Math.random() * 26);
        console.log("NUMBER: ", number);

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
            
        request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
            var responseData = response.body;
            var msg = JSON.parse(responseData);
            if (msg.ok == true){
                msg.statusCode = 200;
                console.log("STATUS: ", msg.statusCode);
                console.log("MESSAGE: ", msg.message.text);
            }else{
                msg.statusCode = 500;
                console.error("STATUS: ", msg.statusCode);
                console.error("ERROR: ", msg);
            }
        });
    });        
};

module.exports = {
    lolcats,
    morning
}
