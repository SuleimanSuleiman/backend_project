const express = require('express')
const router = express.Router()
const Article = require('./../models/Article')
const passport = require('passport')
require('../utils/auth')(passport)

router.get('/new' ,
passport.authenticate('jwt',{
    session: false
})
,(req,res) =>{
    res.render('./../views/articles/new.pug')
})

router.post('/' , async (req,res) =>{

    let articles = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown
    })
    try{
        articles = await articles.save()
        res.redirect(`/articles/${articles.slug}`)
    }catch(e){
        res.render('new',{articles:articles})
        
    }
})

router.get('/:slug' ,async (req , res) =>{
    let article  = await Article.findOne({slug:req.params.slug})
    if(article === null){
        res.redirect('/articles')
    }
    res.render('./../views/articles/show.pug',{article:article})
})


router.delete('/:id', async(req , res) =>{
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/articles')
})

router.get('/edit/:id', async (req,res) =>{
    let article = await Article.findById(req.params.id)
    res.render('./../views/articles/edit.pug',{article:article})
})

router.put('/:id',async (req, res) =>{
    req.article = await Article.findById(req.params.id)
    let article = req.article
    article.title= req.body.title,
    article.description= req.body.description,
    article.markdown= req.body.markdown
    try{
        article = await article.save()
        res.redirect(`/articles/${req.params.id}`)
    }catch(e){
        // res.render('edit',{article:article})
        res.redirect(`/articles/${req.params.id}`)
    }
})


module.exports = router

