const {Pool} = require('pg')
require('dotenv').config()
const pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'admin',
        password: process.env.PGPASSWORD || 'admin',
        database: process.env.PGDATABASE || 'mydatabase'
    })
module.exports = pool