// Beanstalkd client parameters
var fivebeans_settings = {
    host_name:      'localhost',
    port_address:   11300,
    tube:           'xe',
};


// MongoDB parameters
var mongoose_settings = {
    host_name:      'localhost',
    port_address:   27017,
    username:       '',
    password:       '',
    database:       'xe',
    collection:     'rates',
};


// Default queue parameters
var queue_settings = {
    priority:       0,
    init_delay:     0,
    fail_delay:     3,
    success_delay:  60,
    ttr:            60,
};


// Payload parameters
var payload_settings = [
    {
        from:       'HKD',
        to:         'USD'
    },

    // {
    //     from:       'HKD',
    //     to:         'GBP'
    // },

    // {
    //     from:       'HKD',
    //     to:         'EUR'
    // },

    // {
    //     from:       'HKD',
    //     to:         'AUD'
    // },

    // {
    //     from:       'HKD',
    //     to:         'CAD'
    // },

    // {
    //     from:       'HKD',
    //     to:         'INR'
    // },

    // {
    //     from:       'HKD',
    //     to:         'ZAR'
    // },

    // {
    //     from:       'HKD',
    //     to:         'NZD'
    // },

    // {
    //     from:       'HKD',
    //     to:         'JPY'
    // },

    // {
    //     from:       'HKD',
    //     to:         'CNY'
    // },
];


var general_settings = {
    success_limit:  10,
    fail_limit:     3,
};


exports.fivebeans_settings  = fivebeans_settings;
exports.mongoose_settings   = mongoose_settings;
exports.queue_settings      = queue_settings;
exports.payload_settings    = payload_settings;
exports.general_settings    = general_settings;
