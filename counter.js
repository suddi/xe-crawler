var Counter = function() {
    this.redis      = require('redis').createClient();

    this.printer    = require('./printer');
    this.settings   = require('./settings').general_settings;


    this.pre = this.settings.redis_prefix;
    this.success = '_success_';
    this.fail = '_fail_';
};


Counter.prototype.initCounter = function(payload) {
    var self = this;

    var key_success = self.pre + self.success + payload;
    var key_fail    = self.pre + self.fail + payload;
    self.redis.set(key_success, 0, function(error) {});
    self.redis.set(key_fail, 0, function(error) {});
};


Counter.prototype.contains = function(payload, callback) {
    var self = this;

    var key = self.pre + self.success + payload;
    self.redis.exists(key, function(error, reply) {
        callback(reply);
    });
};


Counter.prototype.getSuccess = function(payload, is_success, callback) {
    if (is_success) {
        var self = this;

        var key = self.pre + self.success + payload;
        self.redis.get(key, function(error, reply) {
            callback(parseInt(reply, 10) < self.settings.success_limit);
        });
    }
    else
        callback(false);
};


Counter.prototype.increment = function(payload, is_success, callback) {
    var self = this;

    var key = self.pre;
    if (is_success) {
        key += self.success + payload;
        self.redis.exists(key, function(error, reply) {
            if (reply) {
                self.redis.incr(key, function(error, reply) {
                    var is_run = reply >= self.settings.success_limit;
                    if (is_run)
                        reply = self.settings.success_limit;
                    self.printer(reply + ' successful attempts made for ' +
                        payload, error);
                    callback(is_run);
                });
            }
        });
    }
    else {
        key += self.fail + payload;
        self.redis.exists(key, function(error, reply) {
            if (reply) {
                self.redis.incr(key, function(error, reply) {
                    var is_run = reply >= self.settings.fail_limit;
                    if(is_run)
                        reply = self.settings.fail_limit;
                    self.printer(reply + ' failed attempts made for ' +
                        payload, error);
                    callback(is_run);
                });
            }
        });
    }
};


Counter.prototype.remove = function(payload, callback) {
    var self = this;

    var key_success = self.pre + self.success + payload;
    var key_fail    = self.pre + self.fail + payload;
    self.redis.del(key_success, function(error, reply) {
        self.redis.del(key_fail, function(error, reply) {
            self.redis.keys(self.pre + '*', function(error, key) {
                callback(!(key.length));
            });
        });
    });
};


Counter.prototype.printValue = function(payload) {
    var self = this;

    var key_success = self.pre + self.success + payload;
    var key_fail    = self.pre + self.fail + payload;

    self.redis.get(key_success, function(error, reply) {
        self.printer('Number of successes for ' + payload + ' = ' + reply);
    });
    self.redis.get(key_fail, function(error, reply) {
        self.printer('Number of fails for ' + payload + ' = ' + reply);
    });
};


Counter.prototype.endClient = function() {
    this.redis.quit();
};


module.exports = Counter;
