const router = require('express').Router()
const User = require('../models/auth')
const Token = require('../models/token')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const session = require('express-session')
const {
    sendEmail
} = require('../utils/email')

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
        let newUser = new User(req.body)
        const token_em = new Token({
            userId: newUser.id,
            token: generateToken(),
        })
        const message = `${process.env.BASE_URL}/auth/verify/${newUser.id}/${token_em.token}`;
        await sendEmail(newUser.email, "Verify Email", message)
        await newUser.save()
        await token_em.save()
        return res.json({
            newUser,
            message: 'An Email send to you to verity'
        })
    } catch (error) {
        console.log(error.message)
        res.json(error)
    }
})

router.get('/verify/:userId/:token', async (req, res) => {
    try {
        let theUser = await User.findById(req.params.userId)
        if (!theUser) return res.status(400).send("Invalid link")
        const theToken = await Token.findOne({
            userId: theUser.id,
            token: req.params.token
        })
        if (!theToken) return res.status(400).send("Invalid link")

        theUser = await User.findOneAndUpdate({
            _id: theUser._id
        }, {
            $set: {
                vefity: true
            }
        }, {
            new: true
        })
        if (theUser.vefity) {
            await Token.findByIdAndRemove(theToken.id)
        }
        const token = jwt.sign({
            id: theUser.id,
            verify: theUser.vefity
        }, 'secret', {
            expiresIn: '24h'
        })
        res.cookie('jwt', token, {
            httpOnly: true
        })
        res.send("email verified sucessfully");
    } catch (error) {
        res.status(400).send("An error occured");
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

function generateToken() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCEFGHIJUVWXYZ0123456789"
    let theString = new String;
    for (let i = 0; i < charset.length; i++) {
        theString += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return theString
}

module.exports = router