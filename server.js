const express = require('express')
require('dotenv').config()
const bcrypt = require('bcrypt')
const path = require('path')
const {Pool} = require('pg')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public'))) 

const pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'admin',
        password: process.env.PGPASSWORD || 'admin',
        database: process.env.PGDATABASE || 'mydatabase'
    })
app.get('/register', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/registerForm.html'))
})
app.get('/login', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/loginForm.html'))
})
app.post('/loginSubmit', async (req, res)=>{
    try {
        const {name, password} = req.body
        console.log(`loginSubmit req.body: ${name}, ${password}`)
        const user = await pool.query("SELECT * FROM users WHERE name=$1", [name])
        console.log(`loginSubmit pool.query: ${user.rows[0].password_hash}`)
        const match = await bcrypt.compare(password, user.rows[0].password_hash)
        if(!match) throw new Error("Invalid credentials")
        res.send('You are logged in')
    } catch (error) {
        console.log(error)
    }
})
app.post('/registerSubmit', async (req, res)=>{
    try {
        const {name, password} = req.body
        const hash = await bcrypt.hash(password, 12)
        const user = await pool.query("INSERT INTO users (name, password_hash) VALUES ($1, $2) RETURNING *", [name, hash])
        res.status(201).json({id: user.rows[0].id, name: user.rows[0].name})
    } catch (error) {
        console.log(error)
    }
})


app.listen(process.env.PORT)