var EventEmitter = require('events').EventEmitter,
    util_inherit = require('util').inherits;


var BeanstalkdClient = function() {
    var Fivebeans           = require('fivebeans').client,

        fivebeans_settings  = require('./settings').fivebeans_settings;
    this.printer = require('./printer');


    this.client = new Fivebeans(
        fivebeans_settings.host_name, fivebeans_settings.port_address
    );

    this.is_connected = false;
    this.tube = fivebeans_settings.tube;
};


util_inherit(BeanstalkdClient, EventEmitter);


BeanstalkdClient.prototype.createClient = function() {
    var self = this;

    if (self.is_connected)
        self.emit('connected');
    else {
        self.client
            .on('connect', function() {
                // Client can now be used
                self.is_connected = true;
                self.printer('Beanstalkd client created');
                self.emit('connected');
            })
            .on('error', function(error) {
                // Connection failure
                self.printer('', error);
                self.emit('failed', 'createClient');
            })
            .on('close', function() {
                // Underlying connection has closed
            })
            .connect();
    }
};


BeanstalkdClient.prototype.endClient = function() {
    var self = this;

    self.client.end();
    self.is_connected = false;
    self.printer('Beanstalkd client ended');
};


BeanstalkdClient.prototype.consumeJob = function(callback) {
    var self = this;

    if (self.is_connected) {
        self.client.reserve(function(error, jobid, payload) {
            if (!self.printer('Reserving jobid: ' + jobid, error))
                callback(jobid, payload);
            else
                self.emit('failed');
        });
    }
    else
        self.printer('', 'There are 0 active beanstalkd clients');
};


BeanstalkdClient.prototype.produceJob = function(priority, delay, ttr, payloads) {
    var self = this;

    if (self.is_connected) {
        var each = require('async').each;

        each(payloads, function(payload, callback) {
            if (typeof payload == 'object')
                payload = JSON.stringify(payload);

            self.client.put(priority, delay, ttr, payload,
                function(error, jobid) {
                self.printer('Added jobid: ' + jobid + ' to queue', error);
                if (!error)
                    self.emit('produced');
                else
                    self.emit('failed', 'produceJob');
            });
            callback();
        }, function(error) {
            if (self.printer('Sent payload(s) to beanstalkd server', error))
                self.emit('failed', 'produceJob');
        });
    }
    else
        self.printer('', 'There are 0 active beanstalkd clients');
};


BeanstalkdClient.prototype.destroyJob = function(jobid, forward_value) {
    var self = this;

    if (self.is_connected) {
        self.client.destroy(jobid, function(error) {
            if (!self.printer('Deleted jobid: ' + jobid, error))
                self.emit('destroyed', forward_value);
            else
                self.emit('failed', 'destroyJob');
        });
    }
    else
        self.printer('There are 0 active beanstalkd clients');
};


BeanstalkdClient.prototype.useTube = function() {
    var self = this;

    if (self.is_connected) {
        self.client.use(self.tube, function(error, tubename) {
            if (!self.printer('Using tube: ' + tubename, error))
                self.emit('used');
            else
                self.emit('failed', 'useTube');
        });
    }
    else
        self.printer('', 'There are 0 active beanstalkd clients');
};


BeanstalkdClient.prototype.watchTube = function() {
    var self = this;

    if (self.is_connected) {
        self.client.watch(self.tube, function(error, numwatched) {
            if (!self.printer('This client is now watching ' + numwatched +
                ' tubes which includes: default and ' + self.tube, error))
                self.emit('watched');
            else
                self.emit('failed', 'watchTube');
        });
    }
    else
        self.printer('', 'There are 0 active beanstalkd clients');
};


module.exports = BeanstalkdClient;
