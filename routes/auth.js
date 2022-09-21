const router = require('express').Router()
const User = require('../models/auth')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const session = require('express-session')


router.get('/register', (req, res) => {
    try {
        res.render('auth/sigup.ejs', {
            user: new User()
        })
    } catch (Err) {
        console.log(Err)
        res.redirect('/')
    }
})

router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body)
        await newUser.save()
        const token = jwt.sign({
            id: newUser.id
        }, 'secret', {
            expiresIn: '24h'
        })
        res.cookie('jwt', token, {
            httpOnly: true
        })
        res.json(newUser)
    } catch (error) {
        res.json(error)
    }
})

router.get('/login', (req, res) => {
    try {
        res.render('auth/login.ejs', {
            user: new User()
        })
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
})

router.post('/login', async (req, res) => {
    try {
        const theUser = await User.login(req.body.email, req.body.password)
        const token = jwt.sign({
            id: theUser.id
        }, 'secret', {
            expiresIn: '24h'
        })
        res.cookie('jwt', token, {
            httpOnly: true
        })
        res.redirect('/articles')
    } catch (err) {
        console.log(err)
        res.render('auth/login.ejs', {
            user: req.body
        })
    }
})

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', {
        maxAge: 1
    })
    res.redirect('/auth/login')
})

//AUTH WITH GOOGLE USING PASSPORT
router.use(session({
    secret: 'secret'
}));
router.use(passport.initialize())
router.use(passport.session())


require('../utils/auth')(passport)

router.get('/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }))



module.exports = router