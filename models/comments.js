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
const commentSchema = new Schema ({
    note: {
        type: String, 
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
module.exports = commentSchema