// showTodaySimpleMessages.js 

var   config = require('config')
    , mongo = require('mongodb').MongoClient;

var showTodaySimpleMessages = function () {
    var res = { message: "1: bla-bla-bla"};
    return res;
};

module.exports = showTodaySimpleMessages;