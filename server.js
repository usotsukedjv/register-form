const express = require('express')
require('dotenv').config()
const jwt = require("jsonwebtoken");
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
app.post('/registerSubmit', async (req, res)=>{
   const {name, password} = req.body
   const hash = await bcrypt.hash(password, 12)
   const result = await pool.query("INSERT INTO users (name, password_hash) VALUES ($1, $2) RETURNING *", [name, hash])
   const user = result.rows[0]
   console.log(user)
   res.json(user)
})
app.get('/login', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/loginForm.html'))
})
app.post('/loginSubmit', async (req, res)=>{
  try {
     const {name, password} = req.body
     const {rows} = await pool.query("SELECT id, password_hash FROM users WHERE name=$1", [name])
     const {id, password_hash} = rows[0]
     if(!password_hash) throw new Error('user not found')
     const match = await bcrypt.compare(password, password_hash)
    if(!match) throw new Error('Wrong password')
    const token = jwt.sign({id}, process.env.JWT_SECRET)

  } catch (error) {
    console.log(error)

  }
})

app.get('/profile', requireAuth, async (req, res)=>{

})

function requireAuth  (req, res, next)  {
  
};

app.listen(process.env.PORT || 3000)