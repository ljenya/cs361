//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();

    //Allow for multiple functions
    var async = require('async');

    function getClient_activities(mysql) {
        return function(callback) {
            mysql.pool.query("select cid, last_name, first_name, aid, activity_name FROM clients INNER JOIN client_activities ON clients.id = client_activities.cid INNER JOIN activities ON activities.id = aid", function(err, tb1) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb1);
            });
        }
    }


    //Get activities table
    function getActivities(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT id, activity_name FROM activities", function(err, tb2) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb2);
            });
        }
    }


    //Get clients table
    function getClients(mysql) {
        return function(callback) {
            mysql.pool.query("SELECT clients.id, last_name, first_name FROM clients", function(err, tb3) {
                if (err) {
                    return callback(err, []);
                }
                return callback(null, tb3);
            });
        }
    }

    //Search cid and aid, also search from clients by last name and first name
    function searchFunction(req, res, mysql, context, complete) {
        var query = "select cid, last_name, first_name, aid, activity_name FROM clients INNER JOIN client_activities ON clients.id = client_activities.cid INNER JOIN activities ON activities.id = aid WHERE " + req.query.filter + " LIKE " + mysql.pool.escape(req.query.search + '%');
        console.log(query)
        mysql.pool.query(query, function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.client_activities = results;
            complete();
        });
    };

    //Render the client activities page
    router.get('/', function(req, res) {

        var mysql = req.app.get('mysql');
        async.parallel({
                client_activities: getClient_activities(mysql),
                activities: getActivities(mysql),
                clients: getClients(mysql)
            },

            function(err, results) {
                if (err) {
                    console.log(err.message);
                }
                res.render('client_activities', results);
            }
        );
    });

    //Render search page with selected filter results
    router.get('/search', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        searchFunction(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('client_activities', context);
            };
        };
    });

    //Add to client activities by selecting client and exisiting activity
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT IGNORE INTO client_activities (`cid`, `aid`) VALUES (?, ?)";
        var inserts = [req.body.new_cid, req.body.new_aid];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/client_activities');
            }
        });
    });

    //update client activities by selecting a new activity for each client
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE IGNORE client_activities SET aid = ? WHERE cid = ? AND aid = ?";
        var inserts = [req.body.editaid, req.body.updatecid, req.body.updateaid];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/client_activities');
            }
        });
    });

    //delete a client activity for a client
    router.post('/delete', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM client_activities WHERE cid = ? AND aid = ?";
        var inserts = [req.body.deletecid, req.body.deleteaid];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/client_activities');
            }
        });
    });
    return router;
}();