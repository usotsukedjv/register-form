const express = require('express')
const path = require('path')
const app = express()
const port = 3000
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))


const allPosts = [
  { title: 'Пост 1' },
  { title: 'Пост 2' },
  { title: 'Пост 3' },
  { title: 'Пост 4' },
  { title: 'Пост 5' },
  { title: 'Пост 6' },
  { title: 'Пост 7' },
  { title: 'Пост 8' },
  { title: 'Пост 9' },
  { title: 'Пост 10' }
];

app.use('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public'))
})
app.use('/form-submit', (req, res)=>{
    const {email, password, name} = req.body
    console.log('your name is', name)
    console.log('your email is', email)
    res.send(`hello, ${name}`)
})
app.use('/posts', (req, res)=>{
    const page = parseInt(req.query.page) || 1
    const perPage = 3
    const start = (page - 1) * perPage
    const end = start + perPage
    res.json(allPosts.slice(start, end))
})
app.listen(port,()=> console.log(`Server is running on port ${port}`))