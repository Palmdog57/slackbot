const chalk = require('chalk');

let all = chalk.bold.white;
let trace = chalk.bold.cyan;
let debug = chalk.bold.magenta;
let info = chalk.bold.blue;
let warning = chalk.bold.yellow;
let error = chalk.bold.red;
let critical = chalk.bold.bgred;

module.exports={
    all,
    trace,
    debug,
    info,
    warning,
    error,
    critical
}