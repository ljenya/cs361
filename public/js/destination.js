//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();

    //get destinations table
    function getDestination(res, mysql, context, complete) {
        mysql.pool.query("SELECT id, city, state, country, hotel, stay FROM destination", function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.destination = results;
            complete();
        });
    };

    //search destinations based the filter
    function searchFunction(req, res, mysql, context, complete) {
        var query = "SELECT id, city, state, country, hotel, stay FROM destination WHERE " + req.query.filter + " LIKE " + mysql.pool.escape(req.query.search + '%');
        console.log(query)
        mysql.pool.query(query, function(err, results) {
            if (err) {
                res.write(JSON.stringify(err));
                res.end();
            }
            context.destination = results;
            complete();
        });
    };

    //Render the destination page
    router.get('/', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getDestination(res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('destination', context);
            };
        };
    });

    //Render the search results
    router.get('/search', function(req, res) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        searchFunction(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('destination', context);
            };
        };
    });

    //Add to destination table from the modal
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO destination (`city`, `state`, `country`, `hotel`, `stay`) VALUES (?, ?, ?, ?, ?)";
        var inserts = [req.body.new_city, req.body.new_state, req.body.new_country, req.body.new_hotel, req.body.new_stay];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/destination');
            }
        });
    });

    //update destination based on id
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE destination SET city = ?, state = ?, country = ?, hotel = ?, stay =? WHERE id = ?";
        var inserts = [req.body.editcity, req.body.editstate, req.body.editcountry, req.body.edithotel, req.body.editstay, req.body.updateID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('/destination');
            }
        });
    });

    //Delete destination table based on id
    router.post('/delete', function(req, res) {
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM destination WHERE id = ?";
        var inserts = [req.body.deleteGID];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(err)
                res.write(JSON.stringify(err));
                res.status(400);
                res.end();
            } else {
                res.redirect('/destination');
            }
        });
    });
    return router;
}();