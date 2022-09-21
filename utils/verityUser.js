const jwt = require('jsonwebtoken')
const User = require('../models/auth')




/////////////////////////////////////////////////////////////////////////////////
// we will not use this function beacuse we used passport jwt to verify the token/
/////////////////////////////////////////////////////////////////////////////////
module.exports.verfityUser = async (req,res,next) =>{
    const token = req.cookies.jwt
    if(token){
        await jwt.verify(token,'secret',(err,user) =>{
            if(err){
                res.status(403).render('auth/sigup.ejs',{user: new User()})
            }
            req.user = user
            next()
        })
    }else res.status(403).render('auth/sigup.ejs',{user: new User()})
}