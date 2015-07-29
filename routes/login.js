//      login.js

var bcrypt = require('bcrypt-nodejs')
    , mongo = require('mongodb').MongoClient
    , config = require('config');


var loginValid = function ( name, password, res ) {
    mongo.connect(config.get('mongodb:uri') + config.get('mongodb:dbName'), function(err, db){
        if(err) throw err;
        var col = db.collection(config.get('mongodb:collection'));
        col.findOne({username: name}, function (error, user) {
            if ( error ) res.render('error', {errorText: 'Ошибка при поиске в базе данного логина'});
            if ( user == null ) res.render('error', {errorText: 'нет такого логина, перепридумайте заного.'})
            else {
                bcrypt.compare(password, user.password, function (err, result) {
                    if ( err ) throw err;
                    if ( result ) {
                        res.cookie('nameOfUser', user.username, {} ); // httpOnly: true
                        res.redirect('chat');
                    } else {
                        res.render('error', { errorText: 'пароль не совпал, извините. '});
                    }
                });
            }

        });
    });
};

module.exports = loginValid;