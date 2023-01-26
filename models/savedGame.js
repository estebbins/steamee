/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const mongoose = require ('./connection')

const User = require('./user')
const Game = require('./game')

/////////////////////////////////////////////////////
//// Our Schema for the Rating subdocument       ////
/////////////////////////////////////////////////////
// We'll destructure the schema function from mongoose
const { Schema, model } = mongoose

// saved game schema
const savedGameSchema = new Schema ({
    owner: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    savedGameRef: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    userCollection: {
        type: String, 
        default: 'My Saved Games',
        required: true
    },
    hasPlayed: {
        type: Boolean,
        required: true,
    },
    }, {
    timestamps: true
})

// create the model
const SavedGame = model('SavedGame', savedGameSchema)

/////////////////////////////////////////////////////
//// Export our schema                           ////
/////////////////////////////////////////////////////
module.exports = SavedGame