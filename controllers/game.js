// Import Dependencies
const express = require('express')
const Game = require('../models/game')
const User = require('../models/user')
require('dotenv').config()
const axios = require('axios')

// Create router
const router = express.Router()

// Router Middleware
// Authorization middleware
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

// Routes

// index ALL
router.get('/', (req, res) => {
	Game.find({})
		.then(games => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			
			res.render('games/index', { games, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Index that shows the user's game
router.get('/store', async (req, res) => {
    // console.log('url', process.env.STEAM_STORE_URL)
    // filtered search result from 
    const searchResult = await axios(`${process.env.STEAM_STORE_URL}?filter=category3=39&tags=3841&ignore_preferences=1&sort_by=Reviews_DESC&supportedlang=english&json=1`)
    // console.log('storeGames', searchResult.data.items)
    const storeGames = searchResult.data.items
    // let numApp = 0
    // extract app id from the logo url & exclude bundles
    console.log(storeGames)
    for (let i=0; i < storeGames.length; i++) {
        let logoArray = storeGames[i].logo.split('/')
        storeGames[i].storeId = logoArray[5]
        if (logoArray[4] != 'apps') {
            storeGames[i].apps = false
        } else {
            storeGames[i].apps = true
            // numApp++
        }
    }   
    // console.log('storeGames', storeGames)
    // console.log("numApp", numApp)
    // Remove any items that are not apps
    for (let i=0; i < storeGames.length; i++) {
        if (storeGames[i].apps != true) {
            storeGames.splice(i, 1)
            i=0
        }
    }
    // console.log('after storeGames', storeGames)
    // console.log('length', storeGames.length)
    res.render('games/store', { storeGames, ...req.session })
})

// index that shows only the user's games
router.get('/mine', (req, res) => {
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Game.find({ owner: userId })
		.then(games => {
			res.render('games/index', { games, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/:id/new', async (req, res) => {
    if (req.params.id) {
        const storeId = req.params.id
        const storeInfo = await axios(`${process.env.STEAM_APP_URL}${storeId}&origin=https:%2F%2Fstore.steampowered.com`)
        const gameInfo = storeInfo.data.apps[0]
        console.log(gameInfo)
        res.render(`games/new`, { storeId, gameInfo, ...req.session })
    } else {
	    res.render('games/new', { ...req.session })
    }
})

// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	res.render('games/new', { ...req.session })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	req.body.owner = req.session.userId
    // req.body.hasPlayed = req.body.hasPlayed === 'on' ? true : false
    // const savedGameData = req.body
    // console.log(req.body)
	Game.create(req.body)
        // .then(game =>  { console.log('this was returned from create', game)})
        // .then(game => {
        //     User.findById(savedGameData.owner)
        //         .populate('savedGame')
        //         .then(user => {
        //             // user.savedGame.gameId = game.id
        //                 // user.savedGame.author = req.body.owner
        //             // user.savedGame.hasPlayed = savedGameData.hasPlayed
        //             console.log('this was returned user update', user.savedGame)
        //             // res.render(`/savedGames/${game.id}`)
        //             return user.save()
        //         })
        //         .then(user => {
        //             res.redirect('/games')
        //         })
        //         .catch(error => {
        //             res.redirect(`/error?error=${error}`)
        //         })
        //     // next()
        // })
        .then(game => {
            console.log('session', req.session)
            res.render('auth/savedGame', { game, ...req.session })
        })
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const gameId = req.params.id
	Game.findById(gameId)
		.then(game => {
			res.render('games/edit', { game })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// update route
router.put('/:id', (req, res) => {
	const gameId = req.params.id
	req.body.ready = req.body.ready === 'on' ? true : false

	Game.findByIdAndUpdate(gameId, req.body, { new: true })
		.then(game => {
			res.redirect(`/games/${game.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route
router.get('/:id', (req, res) => {
	const gameId = req.params.id
	Game.findById(gameId)
		.then(game => {
            const {username, loggedIn, userId} = req.session
			res.render('games/show', { game, username, loggedIn, userId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/:id', (req, res) => {
	const gameId = req.params.id
	Game.findByIdAndRemove(gameId)
		.then(game => {
			res.redirect('/games')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
