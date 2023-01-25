/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const express = require('express')
const Game = require('../models/game')
const User = require('../models/user')
require('dotenv').config()
const axios = require('axios')

/////////////////////////////////////////////////////
//// Create router                               ////
/////////////////////////////////////////////////////
const router = express.Router()

// Router Middleware
// Authorization middleware
// If you have some resources that should be accessible to everyone regardless of loggedIn status, this middleware can be moved, commented out, or deleted. 
// !Same middleware as controllers/middleware.js. Can move if needed
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
		.then(games => {
			res.render('games/index', { games, ...req.session })
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
    // console.log('storeGames after id & item type extracted from logo url', storeGames)

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
// !MOVE THIS TO SAVED GAMES
// index that shows only the user's games
router.get('/mine', (req, res) => {
    // Find owner of game
	Game.find({ owner: req.session.userId })
        // !Might need to populate (below from class app)
        // !.populate('owner', 'username')
        // !.populate('comments.author', '-password')
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
// ! Need to handle duplicate/error message is confusing
router.get('/:storeId/new', async (req, res) => {
    // Save store id (from store.liquid via store index route)
    const storeId = req.params.storeId
    // API call to steam to get other relevant app details specific to the app selected on store screen.
    const storeInfo = await axios(`${process.env.STEAM_APP_URL}${storeId}&origin=https:%2F%2Fstore.steampowered.com`)
    // gameInfo within data.apps[0] - 1:1 relationship from all testing
    const gameInfo = storeInfo.data.apps[0]
    // console.log('game info', gameInfo)
    // render games/new with the store Id, game info and session info destructured
    res.render(`games/new`, { storeId, gameInfo, ...req.session })
})

// NEW - GET
// new route -> GET route that renders our page with the form for recommending a game that was not found on the store page.
router.get('/new', (req, res) => {
	res.render('games/new', { ...req.session })
})

// CREATE - POST
// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
    // !Set the owner equal to the session userID
	req.body.owner = req.session.userId
	Game.create(req.body)
        .then(game => {
            // console.log('session', req.session)
            // console.log('game', game)
            // Redirect to savedGames including a paramater of the game's id
            res.redirect(`/savedGames/${game.id}/new`)
        })
		.catch(error => {
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
