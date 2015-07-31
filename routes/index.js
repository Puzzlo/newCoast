//      index.js in routes

var regValid = require('./registration');
var logValid = require('./login');

module.exports = function (app) {
    app.get('/', function(req, res) {
        res.render('index');
    });


    app.get('/registration', function(req, res) {
        res.render('registration');
    });
    //app.post('/registration', require('./registration').post);
    app.post('/registration', function (req, res) {
        regValid(req.body.regUser, req.body.regPass, res);
    });


    app.get('/login', function (req, res) {
       res.render('login');
    });
    app.post('/login', function (req, res) {
        logValid(req.body.loginUser, req.body.loginPass, res);
        //console.log(req.body);
    });

    app.get('/chat', function (req, res) {
        res.render('chat');
    })
 };

