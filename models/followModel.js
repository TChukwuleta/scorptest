const mongoose = require('mongoose')
const schema = mongoose.Schema

const followSchema = new schema({
    // follower_id: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "users"
    // }],
    // following_id: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "users"
    // }],
    follower_id: [{
        type: String
    }],
    following_id: [{
        type: String
    }],
    created_at: { 
        type: Date
    }
}, {
    timestamps: true
})

const followProfile = mongoose.model('follow', followSchema)

module.exports = followProfile