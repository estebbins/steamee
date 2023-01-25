/////////////////////////////////////////////////////
//// Import Dependencies                         ////
/////////////////////////////////////////////////////
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose
const ratingSchema = require('./ratings')
const commentSchema = require('./comments')

const gameSchema = new Schema({
		title: { 
            type: String, 
            required: true 
        },
		logo: { 
            type: String, 
        },
        type: {
            type: String,
            required: true,
            default: 'video game'
        },
        steamId: {
            type: Number,
            unique: true
        },
        ratings: [ratingSchema],
        comments: [commentSchema],
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		}
	}, { 
        timestamps: true, 
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
})

gameSchema.virtual('avgRating').get(function () {
    let average
    if (this.ratings.length > 0) {
        let total = 0
        let count = this.ratings.length
        this.ratings.forEach(rating => {
            total += rating.score
        })
        average = total/count
    } else {
        average = 0
    }     
    return average.toFixed(1)
})

const Game = model('Game', gameSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Game
