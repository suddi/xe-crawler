var BeanstalkdClient    = require('./client'),
    queue               = require('./settings').queue_settings,
    payloads            = require('./settings').payload_settings,
    printer             = require('./printer');


var client = new BeanstalkdClient();

var num_payloads = payloads.length;
var counter = 0;


function onceConnected() {
    client.useTube();
}


function onceUsed() {
    client.produceJob(queue.priority, queue.init_delay, queue.ttr, payloads);
}


function onceProduced() {
    counter++;
    if (counter === num_payloads)
        client.endClient();
}


function onceFailed(method) {
    printer('', 'The BeanstalkdClient method ' + method + ' has stopped');
    client.endClient();
}


client.createClient();
client
    .on('connected', onceConnected)
    .on('used', onceUsed)
    .on('produced', onceProduced)
    .on('failed', onceFailed);
