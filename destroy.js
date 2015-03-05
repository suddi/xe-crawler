var BeanstalkdClient = require('./client'),
    printer = require('./printer');


var client = new BeanstalkdClient();


function onceConnected() {
	client.watchTube();
}


function onceWatched() {
	client.consumeJob(function(jobid, payload) {
		client.destroyJob(jobid);
	});
}


function onceFailed(method) {
	printer('', 'The BeanstalkdClient method ' + method +
		'has failed (please check settings.js that the input is accurate ' +
		'and that you are not experiencing network issues)'
	);
	printer('Please run destroy.js to remove jobs built up in the queue');
	client.endClient();
}


printer('Please CTRL + C to stop destroy.js after process has completed');
client.createClient();
client
	.on('connected', onceConnected)
	.on('watched', onceWatched)
	.on('destroyed', onceWatched)
	.on('failed', onceFailed);
