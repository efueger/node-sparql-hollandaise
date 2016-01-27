'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var http = require('http'),
    url = require('url'),
    Promise = require('bluebird'),
    SparqlResult = require('./result');

var SparqlTransport = function () {
    function SparqlTransport(endpoint) {
        _classCallCheck(this, SparqlTransport);

        this._endpoint = endpoint;
    }

    _createClass(SparqlTransport, [{
        key: 'submit',
        value: function submit(queryString) {
            var instance = this;
            return new Promise(function (resolve, reject) {
                var data = '',
                    parsedUri = url.parse(instance._endpoint),
                    encodedQuery = 'query=' + encodeURIComponent(queryString),
                    request = http.request({
                    method: 'POST',
                    hostname: parsedUri.hostname,
                    port: parsedUri.port,
                    path: parsedUri.path,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/sparql-results+json',
                        'Content-Length': encodedQuery.length
                    }
                }, function (response) {
                    response.setEncoding('utf8');
                    response.on('data', function (chunk) {
                        data += chunk;
                    });
                    response.on('end', function () {
                        if (response.statusCode === 200) {
                            resolve(data);
                        } else {
                            reject(new Error(data));
                        }
                    });
                });

                request.on('error', reject);

                request.write(encodedQuery);
                request.end();
            }).then(function (data) {
                var result = new SparqlResult(JSON.parse(data));
                return result;
            }).catch(function (err) {
                throw new Error('QBuilder query failed: ' + err.message);
            });
        }
    }]);

    return SparqlTransport;
}();

module.exports = SparqlTransport;