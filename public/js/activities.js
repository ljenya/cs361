//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();

    //get activities table
    function getActivities(res, mysql, context, complete) {
        mysql.pool.query("SELECT id, activity_name FROM activities", function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.activities = results;
            complete();
        });
    };
    //search activities based on activity name
    function searchFunction(req, res, mysql, context, complete) {
        var query = "SELECT id, activity_name FROM activities WHERE " + req.query.filter + " LIKE " + mysql.pool.escape(req.query.search + '%');
        console.log(query)
        mysql.pool.query(query, function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.activities = results;
            complete();
        });
    };

    //render activities page
    router.get('/', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getActivities(res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('activities', context);
            };
        };
    });

    //render search results for activities
    router.get('/search', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        searchFunction(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('activities', context);
            };
        };
    });

    //add a new activity by activities name
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO activities (`activity_name`) VALUES (?)";
        var inserts = [req.body.new_activity_name];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/activities');
            }
        });
    });

    //update activities name
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE activities SET activity_name = ? WHERE id = ?";
        var inserts = [req.body.editactivity_name, req.body.updateID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/activities');
            }
        });
    });

    //delete an activity
    router.post('/delete', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM activities WHERE id = ?";
        var inserts = [req.body.deleteGID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/activities');
            }
        });
    });
    return router;
}();