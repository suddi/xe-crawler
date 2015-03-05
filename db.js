var MongoHandler = function() {
    var util_format = require('util').format;
    this.mongoose   = require('mongoose');

    var db_settings = require('./settings').mongoose_settings;
    this.printer    = require('./printer');


    this.mongo_host = db_settings.host_name;
    this.uri = util_format('mongodb://%s:%s@%s:%d/%s',
        db_settings.username, db_settings.password,
        db_settings.host_name, db_settings.port_address,
        db_settings.database
    );

    this.Rates = this.mongoose.model(db_settings.collection, {
        from:       String,
        to:         String,
        created_at: Date,
        rate:       String
    });
};


MongoHandler.prototype.establishConnection = function(callback) {
    this.mongoose.connect(this.uri);
    this.printer('Connected to MongoDB instance at ' + this.mongo_host);
    callback();
};


MongoHandler.prototype.endConnection = function(callback) {
    this.mongoose.disconnect();
    callback();
};


MongoHandler.prototype.saveRecord = function(data) {
    var self = this;

    if  (self.mongoose.connection.readyState) {
        var record = new self.Rates(data);
        record.save(function(error) {
            self.printer('Saved record with id: ' + record.id, error);
            if (error)
                self.printer('', 'Failed to save record: ' + data);
        });
    }
};


module.exports = MongoHandler;
