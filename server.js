////////////////////
//  Dependencies  //
////////////////////
require("dotenv").config() // make env variables available
const express = require("express")
const middleware = require('./utils/middleware')
const UserRouter = require('./controllers/user')
const GameRouter = require('./controllers/game')
const CommentRouter = require('./controllers/comment')
const RatingRouter = require('./controllers/rating')
const SavedGameRouter = require('./controllers/savedGame')
const User = require("./models/user")
// SEE MORE DEPENDENCIES IN ./utils/middleware.js
// user and resource routes linked in ./utils/middleware.js

//////////////////////////////
// Middleware + App Object  //
//////////////////////////////
const app = require("liquid-express-views")(express())

middleware(app)

////////////////////
//    Routes      //
////////////////////

app.use('/auth', UserRouter)
app.use('/games', GameRouter)
app.use('/comments', CommentRouter)
app.use('/ratings', RatingRouter)
app.use('/savedGames', SavedGameRouter)

app.get('/', (req, res) => {
    // const steamMovie = document.getElementById('background-video')
    // steamMovie.load()
    // steamMovie.play()
    // steamMovie.autoplay = true
    // steamMovie.loop = true
    const steamMovie = "./public/vecteezy_smoke-bonfire-with-alpha-channel_1935874.mov"
	res.render('home.liquid', { steamMovie, ...req.session })
})

app.get('/error', (req, res) => {
	const error = req.query.error || 'This Page Does Not Exist'
	res.render('error.liquid', { error, ...req.session })
})

// if page is not found, send to error page
app.all('*', (req, res) => {
	res.redirect('/error')
})



//////////////////////////////
//      App Listener        //
//////////////////////////////
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
})