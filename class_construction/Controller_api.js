const chalk = require('chalk');
class api_response{

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
            TEAPOT:"I'm a Teapot",

            INTERNAL_SERVER_ERROR:"Internal Server Error",
            UNKNOWN_ERR0R:"Unknown Error"
        });
    }

    verbose(message, head="VERBOSE:"){
        console.log(head, chalk.bold.white(message));
    }

    trace(message, head="TRACE:"){
        console.log(head, chalk.bold.cyan(message));
    }

    debug(message, head="DEBUG:"){
        console.log(head, chalk.bold.magenta(message));
    }

    info(message, head="INFO:"){
        console.log(head, chalk.bold.blue(message));
    }

    warning(message, head="WARNING:"){
        console.log(head, chalk.bold.yellow(message));
    }

    error(message, head="VERBOSE:"){
        console.log(head, chalk.bold.red(message));
    }

    critical(message, head="CRITICAL:"){
        console.log(chalk.bold.bgRed(head, message));
    }


}

module.exports = api_response;