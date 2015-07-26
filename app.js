// app.js 

var express = require('express');
var config = require('config');
var path = require('path');
var app = express();

// parse cookies to req.cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser);

// parse forms
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// use req.session as data store
var session = require('cookie-session');
app.use(session({ keys: config.get('keys') } ));

app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// not work yet   require('routes')(app);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var server = http.listen(config.get('port'));
console.log(' application running on port ' + config.get('port'));