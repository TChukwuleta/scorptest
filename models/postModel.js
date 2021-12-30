const mongoose = require('mongoose')
const schema = mongoose.Schema

const postSchema = new schema({
    description: {
        type: String,
        required: true
    }, 
    postNum: {
        type: Number
    },
    user_id: {
        type: String,
        required: true
    },
    image: [{
        type: String
    }],
    created_at: {
        type: Number
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    likers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "likes"
    }],
}, {
    timestamps: true
})

const postProfile = mongoose.model('post', postSchema)

module.exports = postProfile