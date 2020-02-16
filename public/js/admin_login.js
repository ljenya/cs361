//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();
    //Allow for multiple functions
    var async = require('async');

    //get flight table
    function getFlight(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT airline, flight_no, city, ticket_price, flight_date FROM flight INNER JOIN destination ON flight.flight_destination = destination.id", function(err, tb1) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb1);
            });
        }
    }

    //get destination table
    function getDestination(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT id, city FROM destination", function(err, tb3) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb3);
            });
        }
    }

    //search flight by outlined filters in handlebars
    function searchFunction(req, res, mysql, context, complete) {
        var query = "SELECT airline, flight_no, city, ticket_price, flight_date FROM flight INNER JOIN destination ON flight.flight_destination = destination.id WHERE " + req.query.filter + " LIKE " + mysql.pool.escape(req.query.search + '%');
        console.log(query)
        mysql.pool.query(query, function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.flight = results;
            complete();
        });
    };

    //render flight table
    router.get('/', function(req, res) {

        var mysql = req.app.get('mysql');
        async.parallel({
                flight: getFlight(mysql),
                destination: getDestination(mysql)
            },

            function(err, results) {
                if (err) {
                    console.log(err.message);
                }
                res.render('flight', results);
            }
        );
    });

    //render search results based on search
    router.get('/search', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        searchFunction(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('flight', context);
            };
        };
    });

    //add a new flight to flight table
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT IGNORE INTO flight (`airline`, `flight_no`, `flight_destination`, `ticket_price`, `flight_date`) VALUES (?, ?, ?, ?, ?)";
        var inserts = [req.body.new_airline, req.body.new_flight_no, req.body.new_flight_destination, req.body.new_ticket_price, req.body.new_flight_date];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/flight');
            }
        });
    });

    //update flight based on flight number
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE flight SET airline = ?, flight_no = ?, flight_destination = ?, ticket_price = ?, flight_date =? WHERE flight_no = ?";
        var inserts = [req.body.editairline, req.body.editflight_no, req.body.editflight_destination, req.body.editticket_price, req.body.editflight_date, req.body.update_flight_no];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/flight');
            }
        });
    });

    //delete flight by getting flight number
    router.post('/delete', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM flight WHERE flight_no = ?";
        var inserts = [req.body.deleteGID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/flight');
            }
        });
    });
    return router;
}();