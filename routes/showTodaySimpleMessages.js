// showTodaySimpleMessages.js 

var   config = require('config')
    , mongo = require('mongodb').MongoClient;
var when = require('when');

var showTodaySimpleMessages = function () {
    return when.promise(function(resolve, reject){
        var arrayOfMessages = [] ;
        var now = new Date();
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

        mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function (err, db) {
            if (err) { reject(err); return }

            var col = db.collection(config.get('mongodb:history'));
            var cursor;
            cursor = col.find({_id: {$gt: midnight}});
            cursor.forEach(function (res) {
                if (res.priv.length == 0 && res.confirm.length == 0) {
                    //console.log('res.message = ' + JSON.stringify(res));
                    mess = res.whoSend + ': ' + res.message;
                    arrayOfMessages.push(mess);
                    resolve(arrayOfMessages);
                }
            });
            //console.log('arrayOfMessages in func =' + arrayOfMessages);
        });
    });
};
//console.log('showTodaySimpleMessages = ' + showTodaySimpleMessages());
module.exports = showTodaySimpleMessages;