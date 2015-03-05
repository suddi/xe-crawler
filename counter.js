var Counter = function() {
    this.printer    = require('./printer');
    this.settings   = require('./settings').general_settings;
};


Counter.prototype.initCounter = function(payload) {
    if (!('success' in payload) && !('fail' in payload)) {
        payload.success = 0;
        payload.fail    = 0;
    }
};


Counter.prototype.getSuccess = function(payload, is_success, callback) {
    callback(payload.success < this.settings.success_limit);
};


Counter.prototype.increment = function(payload, is_success, callback) {
    var self = this;

    var is_run = false;
    var print_string = ' attempts made for ' + payload.from + ' => ' +
        payload.to;
    if (is_success) {
        payload.success++;
        is_run = (payload.success === self.settings.success_limit);
        print_string = payload.success + ' successful' + print_string;
    }
    else {
        payload.fail++;
        is_run = (payload.fail === self.settings.fail_limit);
        print_string = payload.fail + ' failed' + print_string;
    }

    self.printer(print_string);
    callback(is_run);
};


Counter.prototype.printValue = function(payload) {
    this.printer('Number of successful attempts for ' + payload.from +
        ' => ' + payload.to + ': ' + payload.success);
    this.printer('Number of failed attempts for ' + payload.from +
        ' => ' + payload.to + ': ' + payload.fail);
};


module.exports = Counter;
