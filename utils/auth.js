const passport = require("passport")
const User = require('../models/auth')
const GoogleStrategy = require("passport-google-oauth2").Strategy
const JwtStratery = require('passport-jwt').Strategy


module.exports = (passport) => {
    passport.use(
        new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:4000/google/callback",
                passReqToCallback: true,
            },
            async (request, accessToken, refreshToken, profile, done) => {
                try {
                    const user = await User.findOne({
                        'google.id': profile.id
                    })
                    if (user) return done(null, user)
                    console.log('create new user')
                    const newUser = new User({
                        'google.id': profile.id,
                        'google.name': profile.displayName,
                        'google.email': profile.email
                    })
                    await newUser.save()
                    done(null, newUser)
                } catch (err) {
                    done(err, false)
                }
            })
    )
    passport.use(
        new JwtStratery({
                jwtFromRequest: (req) => {
                    let token = new String()
                    if (req.cookies.jwt) {
                        token = req.cookies.jwt
                    }
                    return token
                },
                secretOrKey: 'secret'
            },
            async (jwtPayload, done) => {
                try {
                    let theUser = new Object()
                    if (jwtPayload.user) {
                        theUser = await User.findOne({
                            'google.id': jwtPayload.user.google.id
                        })
                    } else {
                        theUser = await User.aggregate([{
                            $match: {
                                _id: jwtPayload.id,
                                vefity: true
                            }
                        }])
                    }
                    if (theUser) return done(null, theUser)
                    return done(null, false)
                } catch (err) {
                    return done(err, false)
                }
            })
    )
}
passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})