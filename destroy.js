var exit                = require('process').exit,

    BeanstalkdClient    = require('./client'),
    queue               = require('./settings').queue_settings,
    printer             = require('./printer');


var client = new BeanstalkdClient();


function onceConnected() {
    client.useTube();
}


function onceUsed() {
    client.watchTube();
}


function onceWatched() {
    client.peekJob(function(is_available) {
        if (is_available) {
            client.consumeJob(function(jobid, payload) {
                client.destroyJob(jobid);
            });
        }
        else {
            client.endClient();
        }
    });
}


function onceFailed(method) {
    printer('', 'The BeanstalkdClient method ' + method + ' has stopped');
    client.endClient();
}

client.createClient();
client
    .on('connected', onceConnected)
    .on('used', onceUsed)
    .on('watched', onceWatched)
    .on('destroyed', onceWatched)
    .on('failed', onceFailed);
