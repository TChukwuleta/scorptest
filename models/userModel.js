const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema = new schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    }, 
    full_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile_picture: [{
        type: String
    }],
    bio: {
        type: String
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts"
    }],
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "follows"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    created_at: {
        type: Number
    }
}, {
    timestamps: true
})

const userProfile = mongoose.model('user', userSchema)

module.exports = userProfile