var redis   = require('redis').createClient(),

    pre     = require('./settings').general_settings.redis_prefix,
    printer = require('./printer');


printer('Please CTRL + C to stop clear_redis.js after process has completed');
redis.keys(pre + '*', function(error, key) {
    if (key.length) {
        redis.del(key, function(error) {
            printer('Removed ' + key, error);
        });
    }
});
