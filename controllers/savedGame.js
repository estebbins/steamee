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
    // Find owner of games
	SavedGame.find({ owner: req.session.userId })
        // populate subdoc
        .populate('savedGameRef')
		.then(savedGames => {
            // create array
            const userCollections = []
            savedGames.forEach(savedGame => {
                // If user collections does not already have the collection name contained, then push the collection name to ensure only unique collections are sent
                if(!userCollections.includes(savedGame.userCollection)) {
                    userCollections.push(savedGame.userCollection)
                }
            })
            // console.log(games)
            // let game = savedGame.savedGameRef
            console.log(savedGames)
            res.render('savedGames/index', { savedGames, userCollections, ...req.session })
		})
		.catch(error => {
            console.log('saved game error', error)
			res.redirect(`/error?error=${error}`)
		})
})

// NEW - GET
// new route -> GET route that renders our page with the form to get additional details from user
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
    req.body.owner = req.session.userId
    // If box is checked then send true, otherwise send false
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
router.get('/:savedGameId/edit', (req, res) => {
	// we need to get the id
	const savedGameId = req.params.savedGameId
    // Find the game
	SavedGame.findById(savedGameId)
        .populate('savedGameRef')
		.then(savedGame => {
            // console.log(savedGame)
            const game = savedGame.savedGameRef
            // Render the edit page
			res.render(`savedGames/edit`, { savedGame, game, ...req.session })
		})
		.catch((error) => {
            console.log(error)
			res.redirect(`/error?error=${error}`)
		})
})


// UPDATE - PUT
// update route
router.put('/:savedGameId', (req, res) => {
	const savedGameId = req.params.savedGameId
    // Find the game and update it using the req.body
        // If box is checked then send true, otherwise send false
    req.body.hasPlayed = req.body.hasPlayed === 'on' ? true : false
	SavedGame.findByIdAndUpdate(savedGameId, req.body, { new: true })
		.then(savedGame => {
            // Redirect to show route after game updated
			res.redirect(`/savedGames/${savedGame.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// SHOW - GET
// show route to show one game
router.get('/:gameId', (req, res) => {
	const gameId = req.params.gameId
	SavedGame.findById(gameId)
        .populate('savedGameRef')
        .populate('savedGameRef.comments', 'author.username')
		.then(savedGame => {
            // Create variable for game for ease of use in liquid
            const game = savedGame.savedGameRef
            // Render show.liquid, and include the game & session data destructured
            res.render(`savedGames/show`, { savedGame, game, ...req.session })
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
	SavedGame.findByIdAndRemove(gameId)
		.then(game => {
            // Redirect to index
			res.redirect('/savedGames/mine')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

/////////////////////////////////////////////////////
//// Create router                               ////
/////////////////////////////////////////////////////
module.exports = router
