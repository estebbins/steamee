/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const mongoose = require ('./connection')

/////////////////////////////////////////////////////
//// Our Schema for the Rating subdocument       ////
/////////////////////////////////////////////////////
// We'll destructure the schema function from mongoose
const { Schema } = mongoose

// rating schema
const savedGameSchema = new Schema ({
    gameId: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    hasPlayed: {
        type: Boolean,
        required: true,
    }, 
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    }
    }, {
    timestamps: true
})

/////////////////////////////////////////////////////
//// Export our schema                           ////
/////////////////////////////////////////////////////
module.exports = savedGameSchema