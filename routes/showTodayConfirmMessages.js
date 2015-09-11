//      showTodayConfirmMessages.js

var   config = require('config')
    , when = require('when')
    , mongo = require('mongodb').MongoClient;

require('trace');
require('clarify');

var showTodayConfirmMessages = function (name) {
    var arrayOfMessages = [];
    //console.log('in confirm_message------------>');
    return when.promise(function (resolve, reject) {



        var now = new Date();
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

        mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
            if (err) { reject(err); return }

            var mess = {};
            var col = db.collection(config.get('mongodb:history'));
            var cursor;
            cursor = col.find({_id: {$gt: midnight}});
            cursor.forEach(function (res) {
                //console.log(res.confirmed || 'none');
                if(res.priv.length == 0 && res.confirm.length > 0) {
                    //console.log('res.priv.length = ' + res.priv.length + '&& res.confirm.length = ' + res.confirm.length);
                    //console.log('res.confirmed = ' + res.confirmed);
                    //+ ' && res.confirmed.indexOf(name) = ' + res.confirmed.indexOf(name));
                    if(res.confirm.indexOf(name)!= -1) {
                        //console.log('res.confirmed = ' + res.confirmed);
                        if(res.confirmed == undefined || Object.keys(res.confirmed).indexOf(name) == -1) {
                            mess.toConf = true; // need to confirmed
                            mess.whoSend = res.whoSend;
                            mess.message = res.message;
                            mess.id = res._id;
                        } else {
                            mess.toConf = false; // deja confirmed
                            mess.whoSend = res.whoSend;
                            mess.message = res.message;
                            mess.id = res._id;
                        }
                        arrayOfMessages.push(mess);
                        //console.log('confirm = ' + JSON.stringify(arrayOfMessages));
                        resolve(arrayOfMessages);
                    }
                }
            });
            //console.log('after_resolve, resolve = --->>>' + JSON.stringify(arrayOfMessages));
            //return;




        });
    });

};

//console.log('showTodayConfirmMessages = ' + showTodayConfirmMessages());

module.exports = showTodayConfirmMessages;
