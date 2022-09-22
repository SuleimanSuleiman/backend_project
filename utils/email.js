const nodemailer = require('nodemailer')
const User = require('../models/auth')

module.exports.sendEmail = async (email, subject, message) => {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'zmamznan66@gmail.com', 
                pass: process.env.PASSWORD, 
            },
        });

        await transporter.sendMail({
            from: '"Soso 👻" <zmamznan66@gmail.com>',
            to: email,
            subject: subject,
            text:  message,
        });
        console.log("email sent sucessfully");
    } catch (err) {
        const user = new Object
        user = await User.findOne({email: email})
        if(user) await User.findOneAndRemove({email: email})
        console.log("email not sent");
        console.log(err);
    }
}