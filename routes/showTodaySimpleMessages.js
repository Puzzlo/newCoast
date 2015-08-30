// showTodaySimpleMessages.js 

var   config = require('config')
    , mongo = require('mongodb').MongoClient;

var showTodaySimpleMessages = function () {

    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();
    console.log(today);

    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
        if (err) throw err;
        var col = db.collection(config.get('mongodb:history'));

    });


    var res = { message: "1: bla-bla-bla"};
    return res;
};

module.exports = showTodaySimpleMessages;