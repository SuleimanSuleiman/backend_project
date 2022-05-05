const mongoose = require('mongoose')
const slugify = require('slugify')
const marked = require('marked')
// const createdompurify = require('dompurify')
// const {JSDOM} = require('jsdom')
// const dompurify = createdompurify(new JSDOM().window)


const articleSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: () => Date.now()
    },
    markdown:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true,
        unique: true
    },
    // sanitizeHtml:{
    //     type: String,
    //     required: true
    // }

})


articleSchema.pre('validate',function(next){

    if(this.title){
        this.slug = slugify(this.title,{
            lower: true,
            strict: true
        })
    }
    // if(this.markdown){
    //     this.sanitizeHtml = dompurify.sanitize(marked(this.markdown))
    // }
    next()
})


module.exports = mongoose.model('art' , articleSchema)
