// showTodaySimpleMessages.js 

var   config = require('config')
    , async = require('async')
    , mongo = require('mongodb').MongoClient;

var showTodaySimpleMessages = function () {

    var arrayOfMessages = [];
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

    async.waterfall([
        function (callback) {
            mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
                if (err) throw err;
                var col = db.collection(config.get('mongodb:history'));
                var mess = {};

                //col.find({_id: { $gte: midnight}}).forEach(function (err, res) {
                col.find({_id: {$gt: midnight}}).forEach(function (res) {
                    if(res.priv.length == 0 && res.confirm.length == 0) {
                        console.log('res.message = ' + JSON.stringify(res));
                        mess = res.whoSend + ': ' + res.message;
                        arrayOfMessages.push(mess);
                        //console.log('arrayOfMessages =' + arrayOfMessages);
                    }
                });

                //db.disconnect();

            });
            callback(null, arrayOfMessages);
        }
    ], function (err, result) {
        if ( err ) throw err;
        console.log('arrayOfMessages =' + result);
        return result;
    });


    return arrayOfMessages;
    //console.log('in ' + new Date() + ' array = ' + arrayOfMessages);
};
//console.log('showTodaySimpleMessages = ' + showTodaySimpleMessages());
module.exports = showTodaySimpleMessages;