//      addToHistory.js


var   config = require('config')
    , mongo = require('mongodb').MongoClient;

var addToHistory = function (data) {
    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
        if (err) throw err;
        var col = db.collection(config.get('mongodb:history'));
        col.insert({  _id: data.idDate
                    , whoSend: data.whoSend
                    , message: data.message
                    , priv: data.priv
                    , confirm: data.confirm
        }, function(err, result){
            if(err) throw err;
        });
    });
};

module.exports = addToHistory;