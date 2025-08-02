const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const path = require('path')
const {Pool} = require('pg')
const app = express()
app.use(cookieParser())
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
app.post('/registerSubmit', async (req, res)=>{
   try {
        const {name, password} = req.body
        const hash = await bcrypt.hash(password, 12)
        const result = await pool.query("INSERT INTO users (name, password_hash) VALUES ($1, $2) RETURNING id, name", [name, hash])
        const {rows} = result
        res.json(rows[0])
   } catch (error) {
    console.log(error)
   }
})
app.get('/login', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/loginForm.html'))
})
app.post('/loginSubmit', async (req, res)=>{
  try {
    const {name, password} = req.body
    if(!name) {throw new Error('no name')}
    if(!password) {throw new Error('no password')}
    const result = await pool.query("SELECT * FROM users WHERE name=$1", [name])
    const {rows} = result
    const { id, password_hash} = rows[0]
    const match = await bcrypt.compare(password, password_hash)
    if(!match) throw new Error('Wrong password')
    const token = jwt.sign({id}, process.env.JWT_SECRET)
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 
    })
    res.json({ message: "Login successful" });
  } catch (error) {
    return res.send(error)
  }
})

app.get('/profile', requireAuth, async (req, res)=>{
    const result = await pool.query("SELECT name FROM users WHERE id=$1",[req.userId])
    const {rows} = result
    const {name} = rows[0]
    res.send(`Hello ${name}, here is your profile`)
})

function requireAuth  (req, res, next)  {
//    const authHeader = req.headers.authorization
//     const hToken = authHeader.split(" ")[1]
    const cToken = req.cookies.token
    const payload = jwt.verify(cToken, process.env.JWT_SECRET,  { expiresIn: "1h" })
    console.log(payload)
    if(!payload) return res.status(403).send('Invalid token')
    req.userId = payload.id
    next()
};

app.listen(process.env.PORT || 3000)