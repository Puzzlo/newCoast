//      updateConfirmMessage.js

var   config = require('config')
    , mongo = require('mongodb').MongoClient;

var updateConfirmMessage = function (data) {
    console.log('data='+JSON.stringify(data));
    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db) {
        if (err) throw err;
        var conf = {};
        var col = db.collection(config.get('mongodb:history'));
        col.findOne({_id: data.id}, {fields: {confirmed: 1}}, function (err, res) {
            if(err) throw err;

            if(Object.keys(res).indexOf("confirmed") != -1)
                conf = res['confirmed'];
            conf[data.whoAskConfirm] = new Date().getTime().toString();
            col.update(
                {_id: data.id},
                { $set: { confirmed: conf}},
                { upsert: true}

                , function(err, result){
                    if(err) throw err;
                });
        });
    });
};

module.exports = updateConfirmMessage;

