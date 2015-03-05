var ExchangeScraper = function() {
    var reader      = require('fs').readFileSync;
    this.url_format = require('url').format;
    this.js_scraper = require('jsdom').env;
    this.request    = require('request');

    this.printer    = require('./printer');


    this.xe = {
        protocol:   'http:',
        host:       'www.xe.com',
        pathname:   '/currencyconverter/convert/',
    };
    this.jquery = [reader('./lib/jquery-2.1.3.min.js', 'utf-8')];
};


ExchangeScraper.prototype.getRate = function(payload, callback) {
    var self = this;

    self.xe.query = {
        'Amount':   1,
        'From':     payload.from,
        'To':       payload.to
    };
    var xe_url = self.url_format(self.xe);

    self.printer('Scraping URL: ' + xe_url);
    self.request(xe_url, function(error, response, body) {
        var data = {};
        if (error || response.statusCode !== 200)
            callback(false, data);
        else {
            self.js_scraper({
                html:   body,
                src:    self.jquery,
                done:   function(error, window) {
                            var $ = window.$;
                            var query = $('tr.uccRes td.rightCol');
                            var rate = parseFloat(query
                                .text()
                                .match(/\d[\d\.\,]*/)[0]
                                .replace(',', ''))
                                .toFixed(2)
                                .toString();

                            if (!isNaN(rate)) {
                                data.from =         payload.from;
                                data.to =           payload.to;
                                data.created_at =   new Date();
                                data.rate =         rate;
                            }
                            callback(true, data);
                        }
            });
        }
    });
};


module.exports = ExchangeScraper;
