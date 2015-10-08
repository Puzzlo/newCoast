//      sTCM.js

var   config = require('config')
    , mongo = require('mongodb').MongoClient;

require('trace');
require('clarify');

exports.sTCM = function(gname, callback){
    console.log('in confirm_message------------>');
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
        var mess = {};
        var arrayOfMessages = [];
        var col = db.collection(config.get('mongodb:history'));
        col.find({_id: {$gt: midnight}}).toArray(function(err, res){
            if(err) {
                console.log('err in toarray');
                throw err;
            } else {
                var len = res.length;
                if(len == 0) callback(null, "");  // TODO
                for(var i=0; i<len; i++){
                    if(res.priv.length == 0 && res.confirm.length > 0) {
                        if(res.confirm.indexOf(name)!= -1) {
                            if(res.confirmed == undefined || Object.keys(res.confirmed).indexOf(gname) == -1) {
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
                        }
                    }
                    arrayOfMessages.push(mess);
                }
            }
        });
        callback(arrayOfMessages);
    });

};