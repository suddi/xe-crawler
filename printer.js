var util = require('util');


function printOutput(output, error) {
    var timestamp = new Date();
    var error_found = false;

    if (typeof error !== 'undefined' && error !== null) {
        output = util.format('%s [aftership] ERROR: %s', timestamp, error);
        error_found = true;
    }
    else
        output = util.format('%s [aftership] INFO: %s', timestamp, output);

    console.log(output);
    return error_found;
}


module.exports = printOutput;
