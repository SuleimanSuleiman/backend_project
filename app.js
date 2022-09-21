require('dotenv').config()

const express = require('express')
const app = express()
const routingArticle = require('./routes/articles')
const mongoose = require('mongoose')
const Article = require('./models/Article')
const methodOverride = require('method-override')
const authRouting = require('./routes/auth')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const jwt = require('jsonwebtoken')


const connect = async () => {
    try {
        await mongoose.connect('mongodb://localhost/testing')
        console.log('connect with database')
    } catch {
        throw Error('incurrect connect')
    }
}

mongoose.connection.on('disconnected', () => {
    console.log(`mongodb disconnected`)
})

mongoose.connection.on('connected', () => {
    console.log(`mongodb connected`)
})



app.use(express.static('./public'))
app.set('view engine', 'pug')
app.use(express.urlencoded({
    extended: false
}))
app.use(methodOverride('_method'))
app.use(cookieParser())

app.get('/articles', async (req, res) => {

    const articles = await Article.find()

    res.render('index', {
        articles: articles
    })
})

app.use('/articles', routingArticle)
app.use('/auth', authRouting)


app.get('/google/callback',
    passport.authenticate('google', {
        session: false
    }),
    (req, res) => {
        const token = jwt.sign({
            user: req.user
        }, 'secret', {
            expiresIn: '2h'
        })
        res.cookie('jwt', token, {
            httpOnly: true
        })
        res.redirect('/articles')
    }
);

app.use('/test',
    passport.authenticate('jwt', {
        session: false
    }),
    function (req, res) {
        res.redirect('/articles/new')
    })


app.listen(4000, () => {
    connect()
    console.log('server running')
})