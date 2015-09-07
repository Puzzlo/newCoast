// showTodaySimpleMessages.js 

var   config = require('config')
    , async = require('async')
    , mongo = require('mongodb').MongoClient;
var otvet;

var showTodaySimpleMessages = function () {

    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

    async.waterfall([
        function (callback) {
            mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function (err, db) {
                if (err) throw err;
                var col = db.collection(config.get('mongodb:history'));
                var cursor;

                //col.find({_id: { $gte: midnight}}).forEach(function (err, res) {
                cursor = col.find({_id: {$gt: midnight}});
                callback(null, cursor);
            });
        },
        function (cur) {
            var arrayOfMessages = [];
            cur.forEach(function (res) {
                if(res.priv.length == 0 && res.confirm.length == 0) {
                    console.log('res.message = ' + JSON.stringify(res));
                    mess = res.whoSend + ': ' + res.message;
                    arrayOfMessages.push(mess);
                    console.log('arrayOfMessages in func =' + arrayOfMessages);
                }
            });
            //callback(null, arrayOfMessages);
            return arrayOfMessages;
        }
    ]);
    //    , function (err, resp) {
    //    if ( err ) throw err;
    //    console.log('resp = ' + resp);
    //    return resp;
    //});

    //console.log('arrayOfMessages outside =' + arrayOfMessages);
    //console.log('in ' + new Date() + ' array = ' + arrayOfMessages);
};
console.log('showTodaySimpleMessages = ' + showTodaySimpleMessages());
module.exports = showTodaySimpleMessages;