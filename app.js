// app.js 

var express = require('express');
var config = require('config');
var path = require('path');
var app = express();
var favicon = require('serve-favicon');
var cors = require('cors');
var async = require('async');


app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(path.join(__dirname, 'public')));

// favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// parse cookies to req.cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// parse forms
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// use req.session as data store
var session = require('cookie-session');
app.use(session({ keys: config.get('keys') } ));


//app.use(cors());

// add reaction app to redirect on any pages
require('routes')(app);

// add message to db
var addToHistory = require('routes/addToHistory');

// add reaction for confirm message
var updateConfirmMessage = require('routes/updateConfirmMessage');

// add old messages in different windows
var showTodaySimpleMessages = require('routes/showTodaySimpleMessages');
var showTodayConfirmMessages = require('routes/showTodayConfirmMessages');

var http = require('http').Server(app);
var io = require('socket.io')(http);
var server = http.listen(config.get('port'));
console.log('application running on port ' + config.get('port'));


var users = {};


io.sockets.on('connection', function(client){



    client.on('hello', function (data) {
        //if(Object.keys(users).indexOf(data.name)!= -1) {
        //    //client.emit('closeNow', {});
        //    io.sockets.connected[users[data.name]].emit('disconnect', {});
        //} else {
            console.log('hello client ' + data.name + ' event');
            //getSimpleMess = showTodaySimpleMessages;
            showTodaySimpleMessages().then(
                function (arr) {
                    for ( var i=0; i < arr.length; i++) {
                        client.emit('simpleMessage', {message: arr[i]});
                    }
                },
                function (err) {
                    console.log(' error in app in showTodaySimpleMessages ' + err);
                }
            );
            showTodayConfirmMessages(data.name).then(
                function (arr) {
                    for(mess in arr) {
                        //console.log('mess to conf = ' + arr[mess].toConf);
                        //console.log('mess = ' + JSON.stringify(arr[mess]));
                        if(arr[mess].toConf) {  // need to confirmed
                            client.emit('noResponce', arr[mess]);
                        } else { // deja confirmed
                            client.emit('yesResponce', arr[mess]);
                        }
                    }
                }  ,
                function (err) {
                    console.log(' error in app in showTodayConfirmMessages ' + err);
                }
            );


            var getConfirmMessages = showTodayConfirmMessages(data.name);
            //console.log('getConfirmMessages =' +  getConfirmMessages);

            client.emit('simpleMessage', {message: 'Привет, ' + data.name + ', мы тебя ждали'});
            client.broadcast.emit('simpleMessage', {message: 'К нам присоединилось ' + data.name});
            users[data.name] = client.id;
            io.sockets.emit('drawUsers', users);
        //}
    });

    client.on('sendMessageToServer', function(data){

        console.log('add='+addToHistory(data));

        if(data.message == "") return;
        console.log(JSON.stringify(data));
        console.log(JSON.stringify(users));

        if(Object.keys(users).indexOf(data.whoSend)== -1) {
            io.sockets.connected[data.whoSend].emit('close');
        } else {
             // big else, We handle all possible messages
            if(data.confirm.length) {

                data.confirm.forEach(function(receiver) {
                    io.sockets.connected[users[receiver]].emit('forConfirm',
                        {
                            messageId: data.idDate,
                            whoSend: data.whoSend,
                            message: data.message
                        }
                    );
                });

            } else if ( data.priv.length ) {
                    // send private message to some ppl
                        //client.emit('privateMessage', {whoSend: data.whoSend,  message: 'To '
                        // + data.priv + ' : ' + data.message});
                        data.priv.forEach(function(ppl){
                            //console.log(ppl);
                            io.sockets.connected[users[ppl]].emit('privateMessage',
                                  {time: data.idDate, whoSend: data.whoSend, message: data.message});
                        });
            } else {
                        // just simple message
                    io.sockets.emit('simpleMessage', {message: data.whoSend + ' : ' + data.message});
                }
        }
    });

    client.on('accept', function (data) {
        updateConfirmMessage(data);
       io.sockets.connected[users[data.senderOfMessage]].emit('iConfirm',
           {
               messageId: data.id,
               whoConfirm: data.whoAskConfirm
           }
       );
    });
    client.on('disconnect', function(){
        console.log('disconnect client event....');
        var a = findNameById(client.id.toString());
        if(!a) {
            var bb = new Date();
            console.log('in false , time = ' + bb);
            app.render('index', {title: 'res vs app render'}, function(err, html) {
                console.log(html)
            });
        }
        delete users[a];
        if(Object.keys(users).length > 0 ) {
            client.broadcast.emit('simpleMessage', {message: 'Нас покидает ' + a});
            io.sockets.emit('drawUsers', users);
        }
    });

    client.on('close', function () {
        console.log('close client event....');
        //io.sockets.connected[users[findNameById(client.id.toString())]].emit('disconnect');
        //setTimeout(reconnect, 500);
    });












});

io.sockets.on('close', function (client) {
    console.log('socket in close');
    res.redirect('/login');
});
io.sockets.on('disconnect', function (req, res) {
    console.log('socket in disconnect');
    res.redirect('/login');
});


function findNameById(id){
    for ( pers in users){
        if( users[pers] == id ) {
            return pers;
        }
    }
    return false;
}

