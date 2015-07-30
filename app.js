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

io.sockets.on('connection', function(client){

    client.on('hello', function (data) {
        client.emit('simpleMessage', {message: 'Привет, ' + data.name + ', мы тебя ждали'});
        client.broadcast.emit('simpleMessage', {message: 'К нам присоединилось ' + data.name});
        users[data.name] = client.id;
        io.sockets.emit('drawUsers', users);
        //client.id = data.name;
        console.log('users = ' + JSON.stringify(users));

    });

    client.on('sendMessageToServer', function(data){


           // console.log('clisent =' + findClientsSocket(null, '/chat'));


        //if(users.indexOf(data.whoSend)== -1) {
        //    // TODO close connect of sender this message
        //} else {
            // big else, We handle all possible messages
            console.log(data.priv);
            if ( data.priv.length ) {
                // send private message to some ppl
                data.priv.forEach(function(ppl){
                    //console.log(ppl);
                    io.sockets.connected[users[ppl]].emit('privateMessage',
                          {message: 'from ' + data.whoSend + ' : ' + data.message});
                });
            } else {
                io.sockets.emit('simpleMessage', {message: data.whoSend + ' : ' + data.message});
            }
        //}
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



