const path = require('path')
const bcrypt = require('bcrypt')
const pool = require('../db.js')
const jwt = require('jsonwebtoken')
exports.register =  (req, res, next) => {
   res.sendFile(path.join(__dirname, '../../public/registerForm.html'))
}
exports.registerSubmit = async (req, res)=>{
   try {
        const {name, password}= req.body
        const hash = await bcrypt.hash(password, 12)
        const result = await pool.query("INSERT INTO users (name, password_hash) VALUES ($1, $2) RETURNING id",[name, hash])
        const {rows} = result
        const {id} = rows[0]
        res.json({id, name})
   } catch (error) {
    console.log(error)
   }
}
exports.login = (req, res)=>{
    res.sendFile(path.join(__dirname, '../../public/loginForm.html'))
}
exports.loginSubmit = async (req, res)=>{
  try {
    const {name, password} = req.body
    const result = await pool.query("SELECT * FROM users WHERE name=$1",[name])
    const {rows} = result
    const {id, password_hash} = rows[0]
    const match = await bcrypt.compare(password, password_hash)
    if(!match) return res.status(401).send('Wrong credentials')
    const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'})
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60
    })
    res.send("login successful")
  } catch (error) {
    return res.send(error)
  }
}
exports.getProfile = async (req, res)=>{
   const result = await pool.query("SELECT id, name FROM users WHERE id=$1",[req.userId])
   const {rows} = result
   const {id, name} = rows[0]
   res.send(`Your name is ${name}, your id is ${id}`)
}
exports.requireAuth = (req, res, next)  => {
    const token = req.cookies.token
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.id
    next()
};