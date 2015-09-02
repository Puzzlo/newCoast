// showTodaySimpleMessages.js 

var   config = require('config')
    , mongo = require('mongodb').MongoClient;

var showTodaySimpleMessages = function () {

    var arrayOfMessages = [];
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
        if (err) throw err;
        var col = db.collection(config.get('mongodb:history'));
        var mess = {};

        //col.find({_id: { $gte: midnight}}).forEach(function (err, res) {
        col.find({_id: {$gt: midnight}}).forEach(function (res) {
            //console.log('res.message = ' + res.message);
            if(res.priv.length == 0 && res.confirm.length == 0) {
                mess = res.whoSend + ': ' + res.message;
                arrayOfMessages.push(mess);
                //console.log('arrayOfMessages =' + arrayOfMessages);
            };
            db.close();
        });

        //db.disconnect();

    });
    console.log('in ' + new Date() + ' array = ' + arrayOfMessages);
    return arrayOfMessages;
};
//console.log('showTodaySimpleMessages = ' + showTodaySimpleMessages());
module.exports = showTodaySimpleMessages();