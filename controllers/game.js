/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const express = require('express')
const Game = require('../models/game')
const User = require('../models/user')
require('dotenv').config()
const axios = require('axios')
const SavedGame = require('../models/savedGame')
const ratingSchema = require('../models/ratings')

/////////////////////////////////////////////////////
//// Create router                               ////
/////////////////////////////////////////////////////
const router = express.Router()

// Router Middleware
// If you have some resources that should be accessible to everyone regardless of loggedIn status, this middleware can be moved, commented out, or deleted. 
router.use((req, res, next) => {
	// checking the loggedIn boolean of our session
	if (req.session.loggedIn) {
		// if they're logged in, go to the next thing(thats the controller)
		next()
	} else {
		// if they're not logged in, send them to the login page
		res.redirect('/auth/login')
	}
})

/////////////////////////////////////////////////////
//// Routes                                      ////
/////////////////////////////////////////////////////

// INDEX - GET - Steamee Recommendations
// Index ALL recommended games stored to database
router.get('/', (req, res) => {
	Game.find({})
        // populate the subdocuments
        .populate('owner', '-password')
        .populate('comments.author', '-password')
        .populate('ratings', '-password')
		.then(games => {
            console.log(games)
            // find games the user has saved already
            SavedGame.find({owner: req.session.userId})
                .populate('savedGameRef')
                .then(savedGames => {
                    res.render('games/index', { games, savedGames, ...req.session })
                })
                .catch(error => {
                    res.redirect(`/error?error=${error}`)
                })
        })
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// INDEX - GET - Game Store Query
// Index ALL games from Steam API Call
router.get('/store', async (req, res) => {
    // Steam API call (filtered search results)
    const searchResult = await axios(`${process.env.STEAM_STORE_URL}`)
    // console.log('Search Results - data.items', searchResult.data.items)

    // Save the results to a variable
    const storeGames = searchResult.data.items
    // console.log('Store Games', storeGames)

    // Search results contain name & logo url. Logo url naming convention appears to be consistent
    // Identification of apps, vs bundles/other products in search results needed
    // Then, extract app id from the logo url
    for (let i=0; i < storeGames.length; i++) {
        // Split logo URL into array
        let logoArray = storeGames[i].logo.split('/')
        // Target the appid (Steam's store ID), which is consistently 5th item in array, add the appId to storeGames to use later
        storeGames[i].storeId = logoArray[5]
        // If item type identified as anything other than "apps" in the logo URL, set a new property of apps within the StoreGame objects to false
        if (logoArray[4] != 'apps') {
            storeGames[i].apps = false
        } else {
            // Otherise set to true
            storeGames[i].apps = true
        }
    }   
    // Remove any items that are not apps
    for (let i=0; i < storeGames.length; i++) {
        if (storeGames[i].apps != true) {
            storeGames.splice(i, 1)
            // restart for loop each time to ensure array is properly combed for non-apps
            i = 0
        }
    }
    // console.log('storeGames after splice', storeGames)
    // Render the games/store page with the storeGames array & destructured session info
    res.render('games/store', { storeGames, ...req.session })
})

// INDEX - GET
//! Not user facing
// index that shows only the user's games
router.get('/mine', (req, res) => {
    // Find owner of game
	Game.find({ owner: req.session.userId })
        .populate('owner', 'username')
        .populate('comments.author', '-password')
		.then(games => {
            // Render games/index liquid view, and include destructured session info
			res.render('games/index', { games, ...req.session })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// NEW - GET - With Steam Info
// New route that renders that feeds additional information from a separate API Call to the new form when recommending from the store page
router.get('/:storeId/new', async (req, res) => {
    // Save store id (from store.liquid via store index route)
    const storeId = req.params.storeId
    // API call to steam to get other relevant app details specific to the app selected on store screen.
    const storeInfo = await axios(`${process.env.STEAM_APP_URL}${storeId}&origin=https:%2F%2Fstore.steampowered.com`)
    // gameInfo within data.apps[0] - 1:1 relationship from all testing
    const gameInfo = storeInfo.data.apps[0]
    Game.findOne({ steamId: storeId })
        .then(game => {
            // If a game with the same steam Id is already found, then redirect to saved games
            res.redirect(`/savedGames/${game.id}/new`)
        })
        .catch(error => {
            // console.log(error)
            // If no game was found, create a new one
            res.render(`games/new`, { storeId, gameInfo, ...req.session })
        })
})

// NEW - GET
// new route -> GET route that renders our page with the form for recommending a game that was not found on the store page.
router.post('/newForm/getInfo', (req, res) => {
    res.redirect(`/games/${req.body.steamId}/new`)
	// res.render('games/newForm', { ...req.session })
})

// NEW - GET
// new route -> GET route that renders our page with the form for recommending a game that was not found on the store page.
router.get('/newForm', (req, res) => {
	res.render('games/newForm', { ...req.session })
})

// CREATE - POST
// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	req.body.owner = req.session.userId
	Game.create(req.body)
        .then(game => {
            // console.log('session', req.session)
            // console.log('game', game)
            // Redirect to savedGames including a paramater of the game's id
            res.redirect(`/savedGames/${game.id}/new`)
        })
		.catch(error => {
            console.log(error)
			res.redirect(`/error?error=${error}`)
		})
})

// EDIT - GET
// edit route -> GET that takes us to the edit form view
// !Route is not user-facing
router.get('/:gameId/edit', (req, res) => {
	// we need to get the id
	const gameId = req.params.gameId
    // Find the game
	Game.findById(gameId)
		.then(game => {
            // Render the edit page
			res.render('games/edit', { game })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})


// UPDATE - PUT
// update route
// !Route is not user-facing
router.put('/:gameId', (req, res) => {
	const gameId = req.params.gameId
    // Find the game and update it using the req.body
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
        .populate('comments', '-password')
        .populate('comments.author', '-password')
        .populate('ratings', '-password')
        .populate('ratings.author', '-password')
		.then(game => {
            // Determine if user has rated this game previously to avoid multiple ratings per user on the same game.
            let userRateHistory
            let userScore
            if (game.ratings.some(score => score.author.id == req.session.userId)) {
                userRateHistory = true
                userScore = game.ratings.find(score => score.author.id == req.session.userId)
            } else {
                userRateHistory = false
            }
            console.log('userscore', userScore)
            // If user history is true, a different form will render.
            res.render('games/show', { game, userRateHistory, userScore, ...req.session })
		})
		.catch((error) => {
            console.log(error)
			res.redirect(`/error?error=${error}`)
		})
})

// DELETE - DELETE
// delete route to delete a single game
// ! Not intended to be user facing, still needed for db management
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
