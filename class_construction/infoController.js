const ControllerAPI = require('./Controller_api');

class infoController extends ControllerAPI {
    constructor() {
        super();
        this.counter = 0;
    }

    ping(app) {
        app.post('/command', async (req, res) => {
            res.end(); // Send 200 OK to avoid timeout error.
            console.log("\nCOMMAND: /command");
            const channel = req.body.channel_name;
            let cmdToSearch = "";
            let msgToSend = "There was a problem getting your command :crying_cat_face:";

            if(typeof req.body.text !== 'undefined' && req.body.text){
                cmdToSearch = req.body.text;
                if (debug === true) console.log('cmdToSearch: ', verbose(cmdToSearch));

                await findCommand(cmdToSearch).then(function(description){
                    if (debug === true) console.log("FIND_COMMAND_RETURNED: ", description);
                    msgToSend = description[0].cmd_desc;
                });
            }

            console.log("Sending to slack: ", msgToSend);
            sendSlackMessage(channel, msgToSend);
        }); //End app.post
    }
}

module.exports = infoController;