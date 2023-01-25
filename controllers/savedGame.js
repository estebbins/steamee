/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const express = require('express')
const Game = require('../models/game')
const User = require('../models/user')

/////////////////////////////////////////////////////
//// Create Router                               ////
/////////////////////////////////////////////////////
const router = express.Router()

/////////////////////////////////////////////////////
//// Routes                                      ////
/////////////////////////////////////////////////////
// This also means, that when we make a subdocumrnt, we must MUST refer to the parent so that mongoose knows where in mongodb to store this subdocument.

router.post('/addGame', (res, req) => {
    console.log('session', req.session)
    console.log(userId)
    console.log(game.title)
    // req.body.author = userId
    console.log('add game req body', req.body)
    User.findById(req.body.owner)
        .then(user => {
            user.savedGame.push(req.body)
            return user.save()
        })
        .then(user => {
            console.log(user.savedGame)
        })
        .catch((error) => {
			console.log('the error', error);
			
			res.redirect(`/error?error=${error}`)
		})
})

// POST
// only loggedin users can save games
// router.post('/:gameId', (res, req) => {
//     const gameId = req.params.gameId
//     // then we'll protect this route against non-logged-in users
//     // console.log('this is the session\n', req.session)
//     if (req.session.loggedIn) {
//         // if logged in, make the logged in user the author of the comment
//         // this is exactly like how we added the owner to our fruits
//         req.body.author = req.session.userId
//         const savedGameBody = req.body
//         // find a sepcific fruit
//         User.findById(req.body.owner)
//         // response with a 201 and the fruit itself
//             .then(user => {
//                 // create the comment (with a req.body)
//                 user.savedGame.push(savedGameBody)
//                 // save the fruit
//                 return user.save()
//             })
//             .then(user => {
//                 res.redirect(`/games`)
//             })
//             // catch and handle any errors 
//             .catch(err => {
//                 console.log(err)
//                 // res.status(400).json(err)
//                 res.redirect(`/error?error=${err}`)
//             })
//     } else {
//         // res.sendStatus(401) // send a 401-unauthorized
//         res.redirect(`/error?error=You%20are%20not%20allowed%20to%20save%20this%20game`)
//     }
// })

// router.post('/:fruitId', (req, res) => {
//     // first we get the fruit ID and save to a variable
//     const fruitId = req.params.fruitId
//     // then we'll protect this route against non-logged-in users
//     // console.log('this is the session\n', req.session)
//     if (req.session.loggedIn) {
//         // if logged in, make the logged in user the author of the comment
//         // this is exactly like how we added the owner to our fruits
//         req.body.author = req.session.userId
//         const theComment = req.body
//         // find a sepcific fruit
//         Fruit.findById(fruitId)
//         // response with a 201 and the fruit itself
//             .then(fruit => {
//                 // create the comment (with a req.body)
//                 fruit.comments.push(theComment)
//                 // save the fruit
//                 return fruit.save()
//             })
//             .then(fruit => {
//                 // res.status(201).json({ fruit: fruit })
//                 res.redirect(`/fruits/${fruit.id}`)
//             })
//             // catch and handle any errors 
//             .catch(err => {
//                 console.log(err)
//                 // res.status(400).json(err)
//                 res.redirect(`/error?error=${err}`)
//             })
//     } else {
//         // res.sendStatus(401) // send a 401-unauthorized
//         res.redirect(`/error?error=You%20are%20not%20allowed%20to%20comment%20on%20this%20fruit`)
//     }

// })

// // DELETE -> /comments/delete/<someFriutId>/<someCommentId>
// // make sure only the author of the comment can delete the comment
// router.delete('/delete/:fruitId/:commId', (req, res) => {
//     // isolete the ids and save to variables so we don't have to keep typing req.params
//     // const fruitId = req.params.fruitId
//     // const commId = req.params.commId
//     const { fruitId, commId } = req.params

//     Fruit.findById(fruitId)
//         .then(fruit => {
//             // get comment, we'll use the build in subdoc method called .id()
//             const theComment = fruit.comments.id(commId)
//             console.log('this is the comment to be delete: \n', theComment)
//             // then we want to make sure the user is logged in, and that they are the author of the comment.
//             if (req.session.loggedIn) {
//                 // if they are, allow them to delete
//                 if (theComment.author == req.session.userId) {
//                     // we can use another built in method, remove()
//                     theComment.remove()
//                     fruit.save()
//                     // res.sendStatus(204) //send 204 no content
//                     res.redirect(`/fruits/${fruit.id}`)
//                 } else {
//                     // res.sendStatus(401) // send a 401-unauthorized
//                     res.redirect(`/error?error=You%20are%20not%20allowed%20to%20edit%20this%20fruit`)
//                 }
//             } else{
//             // otherwise, send a 401 unauthorized status
//                 // res.sendStatus(401)
//                 res.redirect(`/error?error=You%20are%20not%20allowed%20to%20edit%20this%20fruit`)
//             }
            
//         })
//         .catch(err => {
//             console.log(err)
//             // res.status(400).json(err)
//             res.redirect(`/error?error=${err}`)
//         })

// })

/////////////////////////////////////////////////////
//// Export Router                               ////
/////////////////////////////////////////////////////
module.exports = router