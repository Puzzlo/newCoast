//      index.js in routes

module.exports = function (app) {
    app.get('/', function(req, res) {
        res.render('index');
    });
    //app.post('/registration', require('./registration').post);

 };

