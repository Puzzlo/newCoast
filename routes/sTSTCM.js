// sTSTCM.js 
//showTodaySendToConfirmMessages

var   config = require('config')
    , when = require('when')
    , mongo = require('mongodb').MongoClient
    , Promise = require('promise');

require('trace');
require('clarify');

var sTSTCM = function(name) {
    return new Promise(function (resolve, reject) {
        var now = new Date();
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

        mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function (err, db) {
            if (err) {
                reject(err);
            }
            var col = db.collection(config.get('mongodb:history'));
            return resolve(col.find({_id: {$gt: midnight}, whoSend: name}).toArray());
        });
    });

};

module.exports = sTSTCM;