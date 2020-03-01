//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();

    //Allow for multiple functions
    var async = require('async');

    //Get the tickets table
    function gettickets(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT * FROM tickets", function(err, tb1) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb1);
            });
        }
    }

    //Get flight table
    function getCategories(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT * FROM categories", function(err, tb2) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb2);
            });
        }
    }
/*
    //Get the destination table
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
*/

    //Render the page with the loaded tables
    router.get('/', function(req, res) {

        var mysql = req.app.get('mysql');
        async.parallel({
                categories: getCategories(mysql),
                //flight: getFlight(mysql),
                tickets: gettickets(mysql)
            },

            function(err, results) {
                if (err) {
                    console.log(err.message);
                }
                res.render('my_tickets', results);
            }
        );
    });
/*
    //Add function to add into the tickets table
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO tickets (`last_name`, `first_name`, `phone`, `destination`, `flight`) VALUES (?, ?, ?, ?, ?)";
        var inserts = [req.body.new_last_name, req.body.new_first_name, req.body.new_phone, req.body.new_destination, req.body.new_flight];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/tickets');
            }
        });
    });
*/
    //Update a row from tickets table baed on id
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tickets SET category = ?, status = ?, issue = ? WHERE id = ?";
        var inserts = [req.body.editCategory, req.body.editStatus, req.body.editIssue, req.body.updateID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/my_tickets');
            }
        });
    });



    //Update a row from tickets table baed on id
    router.post('/chat', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tickets SET note = concat(ifnull(note,''), '\n'?) WHERE id = ?";
        var inserts = [req.body.editNote, req.body.updateID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/my_tickets');
            }
        });
    });

    //Delete an entry from the table based on client id
    router.post('/status', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tickets SET status = 'Closed' WHERE id = ?";
        var inserts = [req.body.editStatus];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/my_tickets');
            }
        });
    });
    return router;
}()