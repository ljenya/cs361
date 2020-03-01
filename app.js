//Use express and handlebars
var PORT = process.env.PORT || 8000;
var express = require('express');
var mysql = require('./dbcon.js');
var morgan = require('morgan');
var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('public'));
app.use('/', express.static('public'));
app.set('mysql', mysql);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

//Render the home page
app.get('/', function(req, res, next) {
    res.render('index');
});

//Page rendering
app.use('/tickets', require('./public/js/tickets.js'));
app.use('/new_ticket', require('./public/js/new_ticket.js'));
app.use('/my_tickets', require('./public/js/my_tickets.js'));
app.use('/client_login', require('./public/js/client_login.js'));
app.use('/admin_login', require('./public/js/admin_login.js'));
app.use('/members', require('./public/js/members.js'));
//app.use('/invoices', require('./public/js/invoices.js'));
//app.use('/client_activities', require('./public/js/client_activities.js'));

//Not found error page rendering
app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

//listen on specified port
app.listen(PORT, function() {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.');
});