//      showTodayConfirmMessages.js

var   config = require('config')
    , mongo = require('mongodb').MongoClient;

var showTodayConfirmMessages = function (name) {

    var arrayOfMessages = [];
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
        if (err) throw err;
        var col = db.collection(config.get('mongodb:history'));
        col.find({_id: {$gt: midnight}}).forEach(function (res) {
            //console.log(res.confirmed || 'none');
            if(res.priv.length == 0 && res.confirm.length > 0) {
                var mess = {};
                //console.log('res.priv.length = ' + res.priv.length + '&& res.confirm.length = ' + res.confirm.length);
                //console.log('res.confirmed = ' + res.confirmed);
                //+ ' && res.confirmed.indexOf(name) = ' + res.confirmed.indexOf(name));
                if(res.confirm.indexOf(name)!= -1) {
                    //console.log('res.confirmed = ' + res.confirmed);
                    if(res.confirmed == undefined || Object.keys(res.confirmed).indexOf(name) == -1) {
                        mess[res._id] = 1; // need to confirmed
                    } else {
                        mess[res._id] = 0; // deja confirmed
                    }
                    arrayOfMessages.push(mess);
                }
                //console.log('arr = ' + JSON.stringify(arrayOfMessages));
            }
        });



    });

    return arrayOfMessages;

};

//console.log('showTodayConfirmMessages = ' + showTodayConfirmMessages());

module.exports = showTodayConfirmMessages;
