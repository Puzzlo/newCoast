//      registration.js

var bcrypt = require('bcrypt-nodejs')
    , mongo = require('mongodb').MongoClient
    , config = require('config');

//console.log(config);

var validData = function (user, password) {
//var validData = function () {
    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db){
        if(err) throw err;
        var col = db.collection(config.get('mongodb:collection'));
        col.findOne({username: user}, function (error, user) {
            if(error) throw error;
            console.log('user in valid = ' + user);
            if(user != null ) {
                // we find the same user, call error page
                // TODO
                res.render('error', {errorText: 'есть уже такой пользователь :( , '});
            } else {
                // user not found - add him to mongoDb
                var salt = bcrypt.genSaltSync();
                var passwordHash = bcrypt.hashSync(password, salt);
                col.insert({username: user, password: passwordHash});
                res.redirect('/');
            }
        })
    })
};

module.exports = validData;