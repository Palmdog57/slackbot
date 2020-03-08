//const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

function ping(app){
    app.post('/ping', (req, res) => {
        var data = {form: {
                token: process.env.SLACK_AUTH_TOKEN,
                channel: "#general",
                text: "pong"
            }};
        request.post('https://slack.com/api/chat.postMessage', data, function (error, response, body) {
            // Sends welcome message
            var msg = res.json();
            if (msg.statusCode != 200) {
                console.log("An error has ocurred: ", error);
            }else{
                console.log(JSON.parse(body));
            }
        });
    });
};

function billie(app){
    app.post('/billie', function(req, res) {
        console.log("BILLIE EILISH COMMAND");
    });
};

module.exports = {
    ping,
    billie
 }