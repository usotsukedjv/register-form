const express = require('express')
const userRoutes = require('./routes/users.js')
require('dotenv').config()
const pool = require('./db.js')
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const path = require('path')
const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, '../public'))) 

app.use('/users',userRoutes)

app.listen(process.env.PORT || 3000)