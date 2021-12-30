const mongoose = require('mongoose')
const schema = mongoose.Schema

const likeSchema = new schema({
    post_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    created_at: {
        type: Number
    }
}, {
    timestamps: true
})

const likeProfile = mongoose.model('like', likeSchema)

module.exports = likeProfile