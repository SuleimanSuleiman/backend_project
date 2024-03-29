const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
    },
    password:{
        type: String
    },
    email:{
        type:String
    },
    vefity:{
        type: Boolean,
    },
    google:{
        id:{
            type:String
        },
        email:{
            type: String
        },
        name:{
            type: String
        }
    }
})

UserSchema.pre('save',async function(){
    if(this.password){
        const salt = await bcryptjs.genSalt()
        this.password = await bcryptjs.hash(this.password,salt)
    }
})

UserSchema.statics.login = async function(email,password){
    const theUser = await this.findOne({email: email})
    if(theUser){
        const comparePassword = await bcryptjs.compare(password,theUser.password)
        if(comparePassword){
            return theUser
        }else{
            throw Error('incurrect password')
        }
    }else{
        throw Error('not found')
    }
}

module.exports = mongoose.model("User",UserSchema)