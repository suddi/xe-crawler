var exit                = require('process').exit,

    BeanstalkdClient    = require('./client'),
    Counter             = require('./counter'),
    ExchangeScraper     = require('./scraper'),
    MongoHandler        = require('./db'),
    general             = require('./settings').general_settings,
    queue               = require('./settings').queue_settings,
    printer             = require('./printer');


var client  = new BeanstalkdClient();
var count   = new Counter();
var scraper = new ExchangeScraper();
var mongo   = new MongoHandler();

var success_counter = {};
var fail_counter = {};


function onceConnected() {
    client.useTube();
}


function onceUsed() {
    mongo.establishConnection(function() {
        client.watchTube();
    });
}


function onceWatched() {
    client.peekJob(function(is_available) {
        if (is_available) {
            client.consumeJob(function(jobid, payload) {
                payload = JSON.parse(payload);

                printer('Performing jobid: ' + jobid + ' with payload: ' +
                    payload.from + ' => ' + payload.to);
                count.initCounter(payload);

                scraper.getRate(payload, function(is_success, rate) {
                    count.getSuccess(payload, is_success, function(is_save) {
                        if (is_save)
                            mongo.saveRecord(rate);
                        client.destroyJob(jobid, [payload, is_success]);
                    });
                });
            });
        }
        else {
            client.endClient();
            exit();
        }
    });
}


function onceDestroyed(forwarded_value) {
    var payload = forwarded_value[0],
        is_success = forwarded_value[1];

    count.increment(payload, is_success, function(is_run) {
        if (is_run) {
            onceWatched();
        }
        else {
            console.log('\n\n\n');
            var delay = queue.success_delay;
            if (!is_success)
                delay = queue.fail_delay;

            client.produceJob(queue.priority, delay, queue.ttr,
                [payload]
            );
        }
    });
}


function onceFailed(method) {
    printer('', 'The BeanstalkdClient method ' + method + ' has stopped');
    mongo.endConnection(function() {
        client.endClient();
    });
}


client.createClient();
client
    .on('connected', onceConnected)
    .on('used', onceUsed)
    .on('watched', onceWatched)
    .on('destroyed', onceDestroyed)
    .on('produced', onceWatched)
    .on('failed', onceFailed);
