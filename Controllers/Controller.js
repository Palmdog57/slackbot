const chalk = require('chalk');
class Controller{

    constructor(){
        this.codes = Object.freeze({
            SUCCESS: 200,

            BAD_REQUEST: 400,
            ACCESS_DENIED:401,
            RESOURCE_NOT_FOUND:404,
            TEAPOT:418,

            INTERNAL_SERVER_ERROR:500,
            UNKNOWN_ERR0R:501
        });

        this.msg = Object.freeze({
            SUCCESS: "OK",

            BAD_REQUEST: "Bad Request",
            ACCESS_DENIED:"Unauthorized",
            RESOURCE_NOT_FOUND:"Resource Not Found",
            TEAPOT:"I'm a teapot",

            INTERNAL_SERVER_ERROR:"Internal Server Error",
            UNKNOWN_ERR0R:"Unknown Error"
        });
    }

    verbose(head, message){
        console.log(head, chalk.bold.white(message));
    }

    trace(head, message){
        console.log(head, chalk.bold.cyan(message));
    }

    debug(head, message){
        console.log("DEBUG: ", head, chalk.bold.magenta(message));
    }

    info(head, message){
        console.log(head, chalk.bold.blue(message));
    }

    warning(head, message){
        console.log(head, chalk.bold.yellow(message));
    }

    error(head, message){
        console.log(head, chalk.bold.red(message));
    }

    critical(head, message){
        console.log(chalk.bold.bgRed(head, message));
    }

    success(head, message){
        console.log(head, chalk.bold.green(message));
    }

    debugToJSON(head, message){
        let TBC = `{"${head}":"${message}"}`
        console.log("DEBUG: ");
        console.log(JSON.parse(TBC));
    }

}

module.exports = Controller;