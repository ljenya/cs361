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
/*
    //Get flight table
    function getFlight(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT flight_no FROM flight", function(err, tb2) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb2);
            });
        }
    }
*/
    //Get the destination table
    function getMembers(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT * FROM team_members", function(err, tb3) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb3);
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

    //Search trough the tickets table based on given filters in handlebars
    function searchFunction(req, res, mysql, context, complete) {
        var query = "SELECT * FROM tickets WHERE " + req.query.filter + " LIKE " + mysql.pool.escape(req.query.search + '%');
        console.log(query)
        mysql.pool.query(query, function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.tickets = results;
            complete();
        });
    };

    //Render the page with the loaded tables
    router.get('/', function(req, res) {

        var mysql = req.app.get('mysql');
        async.parallel({
                members: getMembers(mysql),
                categories: getCategories(mysql),
                tickets: gettickets(mysql)
            },

            function(err, results) {
                if (err) {
                    console.log(err.message);
                }
                res.render('members', results);
            }
        );
    });

    //Render the search results based on selected criteria
    router.get('/search', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        searchFunction(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('members', context);
            };
        };
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
        var sql = "UPDATE tickets SET priority = ?, member_name = ?, updates = ? WHERE id = ?";
        var inserts = [req.body.editPriority, req.body.editMember, req.body.editUpdates, req.body.updateID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/tickets');
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
                res.redirect('/tickets');
            }
        });
    });

    //Delete an entry from the table based on client id
    router.post('/delete', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM tickets WHERE id = ?";
        var inserts = [req.body.deleteGID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/tickets');
            }
        });
    });
    return router;
}()