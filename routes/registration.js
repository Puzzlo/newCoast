//      registration.js

var bcrypt = require('bcrypt-nodejs')
    , mongo = require('mongodb').MongoClient
    , config = require('config');

//console.log(config);

var registrationValid = function (user, password, result) {

    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db){
        if(err) throw err;
        var col = db.collection(config.get('mongodb:collection'));
        col.findOne({username: user}, function (error, detectedUser) {
            if(error) throw error;
            console.log('find user __ ' + JSON.stringify(detectedUser));
            if(detectedUser != null ) {
                // we find the same user, call error page
                result.render('error', {errorText: 'есть уже такой пользователь :( , '});
                //return false;
            } else {
                // user not found - add him to mongoDb
                var salt = bcrypt.genSaltSync();
                var passwordHash = bcrypt.hashSync(password, salt);
                col.insert({username: user, password: passwordHash});
                result.redirect('/');
                //return true;
            }
        })
    })
};

module.exports = registrationValid;