//start the server with express
module.exports = function() {
    var express = require('express');
    var router = express.Router();
    //Allow for multiple tables
    var async = require('async');

    //render the new_ticket page
    router.get('/', function(req, res) {

        var mysql = req.app.get('mysql');
        async.parallel({
                //new_ticket: getnew_ticket(mysql),
                //clients: getClients(mysql)
            },

            function(err, results) {
                if (err) {
                    console.log(err.message);
                }
                res.render('admin_login', results);
            }
        );
    });

/*
    //Add function to add into the tickets table
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO tickets (`category`, `member_name`, `phone`, `title`, `issue`) VALUES (?, ?, ?, ?, ?)";
        var inserts = [req.body.new_category, req.body.new_name, req.body.new_phone, req.body.new_title, req.body.new_issue];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/new_ticket');
            }
        });
    });
/*
    //add to new_ticket table by selecting client first and last name
    router.post('/add', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT IGNORE INTO tickets (`client_id`, `pay_due`, `sign_date`, `trip_start`, `trip_end`, `pay_due_date`, `paid`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        var inserts = [req.body.new_client_id, req.body.new_pay_due, req.body.new_sign_date, req.body.new_trip_start, req.body.new_trip_end, req.body.new_pay_due_date, req.body.new_paid];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('new_ticket');
            }
        });
    });
*/
/*
    //update client invoice
    router.post('/update', function(req, res) {
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE new_ticket SET pay_due = ?, sign_date = ?, trip_start = ?, trip_end = ?, pay_due_date = ?, paid = ? WHERE client_id = ?";
        var inserts = [req.body.editpay_due, req.body.editsign_date, req.body.edittrip_start, req.body.edittrip_end, req.body.editpay_due_date, req.body.editpaid, req.body.updateclient_id];
        sql = mysql.pool.query(sql, inserts, function(err, results) {
            if (err) {
                console.log(JSON.stringify(err))
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.redirect('new_ticket');
            }
        });
    });
    */
    return router;
}();