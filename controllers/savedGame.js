/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const express = require('express')
const SavedGame = require('../models/savedGame')
const Game = require('../models/game')
const User = require('../models/user')

/////////////////////////////////////////////////////
//// Create Router                               ////
/////////////////////////////////////////////////////
const router = express.Router()

/////////////////////////////////////////////////////
//// Routes                                      ////
/////////////////////////////////////////////////////

// INDEX - GET
// index that shows only the user's saved games
router.get('/mine', (req, res) => {
    // Find owner of game
    // const myGames = []
	SavedGame.find({ owner: req.session.userId })
        // !Might need to populate (below from class app)
        // !.populate('comments.author', '-password')
        // .populate('title')
		.then(games => {
            console.log(games)
            res.render('savedGames/index', { games, ...req.session })
            // Render games/index liquid view, and include destructured session info
            // console.log('saved games', savedGames)
            // // for(let i = 0; i < savedGames.length; i++) {
            //     Game.find({ id: savedGames.savedGameId })
            //         .then(games => {
            //             // console.log('game', games)
            //             // myGames.push(game)
            //             // next()
            //             console.log('saved games', savedGames)
            //             console.log('games', games)
            //             res.render('games/index', { savedGames, games, ...req.session })
            //         })
            //         .catch(error => {
            //             console.log('game error', error)
            //             res.redirect(`/error?error=${error}`)
            //         })
            // }
            // return myGames
		})
        // .then(savedGames => {
        //     // console.log(myGames)    
			
        // })
		.catch(error => {
            console.log('saved game error', error)
			res.redirect(`/error?error=${error}`)
		})
})

// NEW - GET
// new route -> GET route that renders our page with the form to get details from user
router.get('/:gameId/new', (req, res) => {
    const gameId = req.params.gameId
    Game.findById(gameId)
        .then(game=> {
            res.render('savedGames/new', { game, gameId, ...req.session })
        })
        .catch(error => {
			res.redirect(`/error?error=${error}`)
		})
    
})

// CREATE - POST
// create -> POST route that actually calls the db and makes a new document
router.post('/new', (req, res) => {
    // console.log('session', req.session)
    // console.log(userId)
    // console.log(game.title)
    req.body.owner = req.session.userId
    req.body.hasPlayed = req.body.hasPlayed === 'on' ? true : false
    console.log('add saved game req body', req.body)
    SavedGame.create(req.body)
        .then(savedGame => {
            // console.log(savedGame)
            res.redirect(`/savedGames/${savedGame.id}`)
        })
        .catch((error) => {
			console.log('the error', error)
			
			res.redirect(`/error?error=${error}`)
		})
})

// EDIT - GET
// edit route -> GET that takes us to the edit form view
router.get('/:gameId/edit', (req, res) => {
	// we need to get the id
	const gameId = req.params.gameId
    // Find the game
	Game.findById(gameId)
		.then(game => {
            // Render the edit page
            // !Do we need the req.session info?
			res.render('games/edit', { game })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})


// UPDATE - PUT
// update route
router.put('/:gameId', (req, res) => {
	const gameId = req.params.gameId
    // Find the game and update it using the req.body
    // ! Might need to duplicate within saved games controller as well/put parameters on this
	Game.findByIdAndUpdate(gameId, req.body, { new: true })
		.then(game => {
            // Redirect to show route after game updated
			res.redirect(`/games/${game.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// SHOW - GET
// show route to show one game
router.get('/:gameId', (req, res) => {
	const gameId = req.params.gameId
	Game.findById(gameId)
		.then(game => {
            // Render show.liquid, and include the game & session data destructured
			res.render('games/show', { game, ...req.session })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// DELETE - DELETE
// delete route to delete a single game
router.delete('/:gameId', (req, res) => {
	const gameId = req.params.gameId
    // Find game & delete
	Game.findByIdAndRemove(gameId)
		.then(game => {
            // Redirect to index
			res.redirect('/games')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

/////////////////////////////////////////////////////
//// Create router                               ////
/////////////////////////////////////////////////////
module.exports = router
