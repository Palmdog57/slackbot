const request = require('request');

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

module.exports = {
    ping
 }