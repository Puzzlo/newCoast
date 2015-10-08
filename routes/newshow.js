//      newshow.js

// модуль showTodayConfirmMessages.js
var mongo = require('mongodb');

var showTodayConfirmMessages = function (name) {
    return new Promise(function (resolve, reject) {
        var now = new Date();
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime().toString();

        mongo.connect('mongodb://localhost:27017/local', function (err, db) {
            if (err) {
                return reject(err);
            }

            var col = db.collection('Test1');
            return resolve(col.find({_id: { $gt: midnight }, whoSend: name }).toArray());
        });
    });
};

module.exports = showTodayConfirmMessages;

// основной скрипт
var stcm = require('./showTodayConfirmMessages');
stcm('2').then(function (msgs) {
    for (var i = 0; i < msgs.length; i++) {
        // msgs etc etc
    }
});