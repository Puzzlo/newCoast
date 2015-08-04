// app.js 

var express = require('express');
var config = require('config');
var path = require('path');
var app = express();
var favicon = require('serve-favicon');
var cors = require('cors');


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

var http = require('http').Server(app);
var io = require('socket.io')(http);
var server = http.listen(config.get('port'));
console.log('application running on port ' + config.get('port'));

var users = {};

function findNameById(id){
    if( Object.keys(users).length == 0 ) return null;
    for ( pers in users){
        if( users.pers == id ) {
            var result = pers;
            break;
        }
    }
    return pers;
}

io.sockets.on('connection', function(client){



    client.on('hello', function (data) {
        console.log('index='+Object.keys(users).indexOf(data.name));
        if(Object.keys(users).indexOf(data.name)!= -1) {
            client.emit('closeNow', {});
        } else {
            client.emit('simpleMessage', {message: 'Привет, ' + data.name + ', мы тебя ждали'});
            client.broadcast.emit('simpleMessage', {message: 'К нам присоединилось ' + data.name});
            users[data.name] = client.id;
            io.sockets.emit('drawUsers', users);
            //client.id = data.name;
            console.log('users = ' + JSON.stringify(users));
            console.log('client = ' + client);
        }
    });

    client.on('sendMessageToServer', function(data){

        console.log(JSON.stringify(data));
           // console.log('clisent =' + findClientsSocket(null, '/chat'));


        //if(users.indexOf(data.whoSend)== -1) {
        //    // TODO close connect of sender this message
        //} else {
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
                    client.emit('privateMessage', { message: 'To ' + data.priv + ' : ' + data.message});
                    data.priv.forEach(function(ppl){
                        //console.log(ppl);
                        io.sockets.connected[users[ppl]].emit('privateMessage',
                              {message: 'from ' + data.whoSend + ' : ' + data.message});
                    });
        } else {
                    // just simple message
                io.sockets.emit('simpleMessage', {message: data.whoSend + ' : ' + data.message});
            }
        //}
    });

    client.on('accept', function (data) {
       io.sockets.connected[users[data.senderOfMessage]].emit('iConfirm',
           {
               messageId: data.id,
               whoConfirm: data.whoAskConfirm
           }
       );
    });
    client.on('disconnect', function(data){
        var a = findNameById(client.id);
        delete users[a];
        if(Object.keys(users).length > 0 ) {
            client.broadcast.emit('simpleMessage', {message: 'Нас покидает ' + a});
            io.sockets.emit('drawUsers', users);
        }
    });











    function findClientsSocket(roomId, namespace) {
        var res = []
            , ns = io.of(namespace ||"/");    // the default namespace is "/"

        if (ns) {
            for (var id in ns.connected) {
                if(roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId) ;
                    if(index !== -1) {
                        res.push(ns.connected[id]);
                    }
                } else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    }

});



