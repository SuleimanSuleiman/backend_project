const express = require('express')
const app = express()
const routingArticle = require('./routes/articles')
const mongoose = require('mongoose')
const Article = require('./models/Article')
const methodOverride = require('method-override')


mongoose.connect('mongodb://localhost/blog')


app.use(express.static('./public'))
app.set('view engine' , 'pug')
app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'))


app.get('/articles' ,async (req , res) =>{

    const articles =await Article.find()

    res.render('index',{articles:articles})
})

app.use('/articles',routingArticle)

app.listen(5000,() =>{
    console.log('server running')
})