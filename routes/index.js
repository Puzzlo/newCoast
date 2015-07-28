//      index.js in routes

module.exports = function (app) {
    app.get('/', function(req, res) {
        res.render('index');
    });
    app.get('/registration', function(req, res) {
        res.render('registration');
    });
    //app.post('/registration', require('./registration').post);

    app.post('/registration', function (req, res) {
        console.log(req.body);
        require('./registration').validDate(req.body.user, req.body.pass);
        //res.redirect('/');
    });

 };

