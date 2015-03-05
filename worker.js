var BeanstalkdClient = require('./client'),
    Counter = require('./counter'),
    ExchangeScraper = require('./scraper'),
    MongoHandler = require('./db'),
    queue = require('./settings').queue_settings,
    printer = require('./printer');


var client = new BeanstalkdClient();
var count = new Counter();
var scraper = new ExchangeScraper();
var mongo = new MongoHandler();

var success_counter = {};
var fail_counter = {};


function onceConnected() {
	mongo.establishConnection(function() {
		client.watchTube();
	});
}


function onceWatched() {
	client.consumeJob(function(jobid, payload) {
		printer('Performing jobid: ' + jobid + ' with payload: ' + payload);

		count.contains(payload, function(does_contain) {
			if (!does_contain) {
				count.initCounter(payload);
			}
		});

		var parsed_payload = JSON.parse(payload);
		scraper.getRate(parsed_payload, function(is_success, rate) {
			count.getSuccess(payload, is_success, function(is_save) {
				if (is_save)
					mongo.saveRecord(rate);
				client.destroyJob(jobid, [payload, is_success]);
			});
		});
	});
}


function onceDestroyed(forwarded_value) {
	var payload = forwarded_value[0],
		is_success = forwarded_value[1];

	count.increment(payload, is_success, function(is_run) {
		if (is_run) {
			if (is_success) {
				printer('10 successful attempts have been made for the ' +
					'payload: ' + payload);
			}
			else {
				printer('3 failed attempts have been made for the payload: ' +
					payload);
			}

			count.remove(payload, function(complete) {
				if (complete) {
					printer('All payloads have been run to completion');
					mongo.endConnection(function() {
						count.endClient();
						client.endClient();
					});
				}
				else {
					onceWatched();
				}
			});
		}
		else {
			var delay = queue.success_delay;
			if (!is_success)
				delay = queue.fail_delay;

			client.produceJob(queue.priority, delay, queue.ttr,
				[payload.toString()]
			);
		}
	});
}


function onceFailed(method) {
	printer('', 'The BeanstalkdClient method ' + method +
		'has failed (please check settings.js that the input is accurate ' +
		'and that you are not experiencing network issues)'
	);
	printer('Please run destroy.js to remove jobs built up in the queue');
	mongo.endConnection(function() {
		client.endClient();
	});
}


client.createClient();
client
	.on('connected', onceConnected)
	.on('watched', onceWatched)
	.on('destroyed', onceDestroyed)
	.on('produced', onceWatched)
	.on('failed', onceFailed);
