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
// Subdocuments are not mongoose models. That means they don't have their own collection, they don't come with the same model methods that we're used to (they have some their own built in)
// this also means, that a subdoc is never going to be viewed without it's parent document. We'll never see a comment without seeing the game it was commented on first.

// This also means, that when we make a subdocumrnt, we must MUST refer to the parent so that mongoose knows where in mongodb to store this subdocument.

// POST
// only loggedin users can post comments
// bc we have to refer to a game, we'll do that in the simplest way via the route
router.post('/:gameId', (req, res) => {
    // first we get the game ID and save to a variable
    const gameId = req.params.gameId
    // then we'll protect this route against non-logged-in users
    // console.log('this is the session\n', req.session)
    if (req.session.loggedIn) {
        // if logged in, make the logged in user the author of the comment
        // this is exactly like how we added the owner to our games
        req.body.author = req.session.userId
        const theComment = req.body
        // find a sepcific game
        Game.findById(gameId)
        // response with a 201 and the game itself
            .then(game => {
                // create the comment (with a req.body)
                game.comments.push(theComment)
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
        res.redirect(`/error?error=You%20are%20not%20allowed%20to%20comment%20on%20this%20game`)
    }

})

// DELETE -> /comments/delete/<someFriutId>/<someCommentId>
// make sure only the author of the comment can delete the comment
router.delete('/delete/:gameId/:commId', (req, res) => {
    // isolete the ids and save to variables so we don't have to keep typing req.params
    // const gameId = req.params.gameId
    // const commId = req.params.commId
    const { gameId, commId } = req.params

    Game.findById(gameId)
        .then(game => {
            // get comment, we'll use the build in subdoc method called .id()
            const theComment = game.comments.id(commId)
            console.log('this is the comment to be delete: \n', theComment)
            // then we want to make sure the user is logged in, and that they are the author of the comment.
            if (req.session.loggedIn) {
                // if they are, allow them to delete
                if (theComment.author == req.session.userId) {
                    // we can use another built in method, remove()
                    theComment.remove()
                    game.save()
                    // res.sendStatus(204) //send 204 no content
                    res.redirect(`/games/${game.id}`)
                } else {
                    // res.sendStatus(401) // send a 401-unauthorized
                    res.redirect(`/error?error=You%20are%20not%20allowed%20to%20edit%20this%20game`)
                }
            } else{
            // otherwise, send a 401 unauthorized status
                // res.sendStatus(401)
                res.redirect(`/error?error=You%20are%20not%20allowed%20to%20edit%20this%20game`)
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