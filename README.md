# Documentation #

This program was developed on and for `Node.js 0.10.25` on `Ubuntu 14.04 LTS 64 bit`.

The program stores key-value pairs in `Redis`, for this you will need to install `redis-server`.

---
### Installation ###
---

To install the necessary `node_modules`, type in from the project directory:

    $ npm install

---
### Settings ###
---

We may change the settings for the program by amending `settings.js`. The following settings are provided:

* `fivebeans_settings` - settings pertaining to the creation of a beanstalkd client using the fivebeans library.
* `mongo_settings` - settings pertaining to the creation of a MongoDB connection using the mongoose library.
* `queue_settings` - settings for jobs to be created to the tube in beanstalkd.
* `payload_settings` - a list of payloads to be run, more payloads can be added by appending objects to the list.
* `general_settings` - general settings such as success_limit and fail_limit which provide a threshold to end the program.

---
### Seed a Job ###
---

After setting the `payload_settings` in `settings.js`, we may seed a job by:

    $ node seeder.js

---
### Consuming Jobs ###
---

Once a job has been seeded, we may run the worker with the following:

    $ node worker.js

---
### Destroying Jobs ###
---

Currently, if the beanstalkd client reports an error, the program will shut down.
If this happens, some jobs may be left behind in the tube, to remove these we can run:

	$ node destroy.js

---
### Remove Program Relevant Key-Value Pairs ###
---

In the scenario that a program is stopped mid-run, it may be necessary to remove program relevant key-value pairs from redis.
To do this:

	$ node clear_redis.js
