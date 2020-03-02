//Connect to database
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b950c6f62810d0',
    password: 'f31c75be',
    database: 'heroku_4a0c02c5c06b0e0'
    user_table: 'users'
});
module.exports.pool = pool;
