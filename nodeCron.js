var cron = require('node-cron');
const request = require('request');
require('dotenv').config();
const chalk = require('chalk');

console.log("===NodeCron.js is Running===");
 
cron.schedule('* 21 * * *', () => {
  console.log("===Time trigger activated.===");
  console.log("\nCOMMAND: /ping");

  // Query the cat API and set the body of the response as our slack message
  request('http://edgecats.net/random', function (error, response, body) {
      if( response.headers['content-length'] > 200){
          console.error(chalk.red("413 - Payload Too Large"));
          console.error(chalk.red("Going for shutdown"));
          process.exit();
      }
      if (response.statusCode != 200) {
          console.error("CAT RECEIPT:", chalk.red(response.statusCode));
          console.error(error);

          var msgToSend = "Error occurred while trying to find the cats :crying_cat_face:"
      }else{
          console.log("CAT RECEIPT:", chalk.green(response.statusCode));
          var msgToSend = `*Good morning Tom!*\n${body}`
      }

      // Construct the data for our slack response
      const data = {
          form: {
              token: process.env.SLACK_AUTH_TOKEN,
              channel: "UV1BT6JAG",
              text: msgToSend
          }
      };
            
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
  }); //End app.post
}); //End app.post