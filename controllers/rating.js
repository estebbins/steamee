/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const express = require('express')
const Game = require('../models/game')

/////////////////////////////////////////////////////
//// Create Router                               ////
/////////////////////////////////////////////////////
const router = express.Router()

/////////////////////////////////////////////////////
//// Routes                                      ////
/////////////////////////////////////////////////////
// Rating route
// POST -> only loggedin users can post ratings
router.post('/:gameId', (req, res) => {
    // first we get the game ID and save to a variable
    const gameId = req.params.gameId
    // then we'll protect this route against non-logged-in users
    // console.log('this is the session\n', req.session)
    if (req.session.loggedIn) {
        // if logged in, make the logged in user the author of the rating
        req.body.author = req.session.userId
        const theRating = req.body
        // find a specific game
        Game.findById(gameId)
        // response with a 201 and the game
            .then(game => {
                // create the rating
                game.ratings.push(theRating)
                // save the game
                return game.save()
            })
            .then(game => {
                // res.status(201).json({ game: game })
                res.redirect(`/games/${game.id}`)
            })
            // catch and handle any errors 
            .catch(err => {
                console.log(err)
                // res.status(400).json(err)
                res.redirect(`/error?error=${err}`)
            })
    } else {
        // res.sendStatus(401) // send a 401-unauthorized
        res.redirect(`/error?error=You%20Are%20not%20allowed%20to%20rate%20this%20game`)
    }

})

// UPDATE - PUT
// update route
router.put('/:gameId', (req, res) => {
	const gameId = req.params.gameId
    // Find the game and update it using the req.body
    const ratingId = req.body.id
	Game.findById(gameId)
		.then(game => {
            // only update the original rating from the user
            game.ratings.forEach(rating => {
                if(rating.id == ratingId) {
                    rating.score = req.body.score
                }
            })
            return game.save()
        })
        .then(game => {
            // Redirect to show route after game updated
			res.redirect(`/games/${game.id}`)
		})
		.catch((error) => {
            console.log(error)
			res.redirect(`/error?error=${error}`)
		})
})

// Delete rating route
// DELETE -> /ratings/delete/<someGameId>/<someRatingId>
router.delete('/delete/:gameId/:ratingId', (req, res) => {
    // Destructure the req params
    const { gameId, ratingId } = req.params

    Game.findById(gameId)
        .then(game => {
            // get rating, we'll use the built in subdoc method called .id()
            const theRating = game.ratings.id(ratingId)
            console.log('this is the rating to be delete: \n', theRating)
            // then we want to make sure the user is logged in, and that they are the author of the rating.
            if (req.session.loggedIn) {
                // if they are, allow them to delete
                if (theRating.author == req.session.userId) {
                    // remove the rating
                    theRating.remove()
                    game.save()
                    // res.sendStatus(204) //send 204 no content
                    res.redirect(`/games/${game.id}`)
                } else {
                    // res.sendStatus(401) // send a 401-unauthorized
                    res.redirect(`/error?error=You%20Are%20not%20allowed%20to%20delete%20this%20rating`)
                }
            } else {
                // otherwise, send a 401 unauthorized status
                // res.sendStatus(401)
                res.redirect(`/error?error=You%20Are%20not%20allowed%20to%20delete%20this%20rating`)
            }    
        })
        .catch(err => {
            console.log(err)
            // res.status(400).json(err)
            res.redirect(`/error?error=${err}`)
        })

})

/////////////////////////////////////////////////////
//// Export Router                               ////
/////////////////////////////////////////////////////
module.exports = router