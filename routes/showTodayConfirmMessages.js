//      showTodayConfirmMessages.js

var   config = require('config')
    , when = require('when')
    , mongo = require('mongodb').MongoClient;
var Promise = require('promise');

//var Promise = require('promise');

require('trace');
require('clarify');

var showTodayConfirmMessages = function(name) {
    //console.log('in confirm_message------------>');
    var pr = new Promise(function (resolve, reject) {
        var now = new Date();
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

        mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
            if (err) {
                reject(err);
                //return
            }


            var arrayOfMessages = [];

            var col = db.collection(config.get('mongodb:history'));
            var cursor;
            col.find({_id: {$gt: midnight}}).toArray(function (err, data) {
                if(err) {
                    return reject(err);
                }
                console.log('promise data 1 = ' + JSON.stringify(data));
                resolve(data);
            });
        });
    });
    pr.then(function (data) {
        console.log('promise data 2 = ' + JSON.stringify(data));
        return data;
    });

    //return when.promise(function (resolve, reject) {
    //
    //    var now = new Date();
    //    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();
    //
    //    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
    //        if (err) { reject(err); return }
    //
    //
    //        var arrayOfMessages = [];
    //
    //        var col = db.collection(config.get('mongodb:history'));
    //        var cursor;
    //        cursor = col.find({_id: {$gt: midnight}});
    //
    //        var mess = {};
    //        var arr = [];
    //        cursor.forEach(function (res) {
    //            if(res.priv.length == 0 && res.confirm.length > 0) {
    //                if(res.confirm.indexOf(name)!= -1) {
    //                    if(res.confirmed == undefined || Object.keys(res.confirmed).indexOf(name) == -1) {
    //                        mess.toConf = true; // need to confirmed
    //                        mess.whoSend = res.whoSend;
    //                        mess.message = res.message;
    //                        mess.id = res._id;
    //                    } else {
    //                        mess.toConf = false; // deja confirmed
    //                        mess.whoSend = res.whoSend;
    //                        mess.message = res.message;
    //                        mess.id = res._id;
    //                    }
    //                    arrayOfMessages.push(mess);
    //                    console.log('messss arr = ' + arr);
    //                }
    //            }
    //        });
    //        console.log(arrayOfMessages.length);
    //        resolve(arrayOfMessages);
    //
    //    });
    //});


};

//console.log('showTodayConfirmMessages = ' + showTodayConfirmMessages());

module.exports = showTodayConfirmMessages;