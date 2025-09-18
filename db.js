const mariadb = require('mariadb');
require('dotenv').config()

const pool = mariadb.createPool({
    host: process.env.host, 
    user: process.env.user, 
    password: process.env.password,
    database: process.env.database,
    port: process.env.db_port,
    dateStrings: true,
    connectionLimit: 10
});

module.exports = pool;

