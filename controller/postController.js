const Post = require('../models/postModel')
const userProfile = require('../models/userModel')
const Joi = require('joi')

// Product Validation schema
const productSchema = Joi.object({
    description: Joi.string().required()
})

const createProduct = async (req, res) => {
    const person = req.user
    if(person){
        const user = await userProfile.findById(person._id)  
        if(user){
            const { error } = productSchema.validate(req.body)
            if (error){
                return res.status(400).send(error.details[0].message)
            }
            const existingPost = await Post.findOne({ description: req.body.description })
            if(existingPost){
                return res.json({ "Message": "Post with exacts words already exist "})
            }
            const newPost = await Post.create({
                description: req.body.description, 
                postNum: Math.floor((Math.random() * 1000000) + 1),
                user_id: user._id, 
                image: req.file.path,
                likes: [],
                created_at: new Date().getTime()
            })
            user.posts.push(newPost)
            const result = await user.save() 
            return res.json({nessage: "Your Post creation was successfull"})
        }
        return res.status(400).json({ message: "User does not exist to create post"})
    }
} 

// Create a new Post and save it to the database
// Update also the user of the post so that the new post reflects
const createPost = async (req, res) => {
    const person = req.user
    if(person){
        const user = await userProfile.findById(person._id)
        if(user){
            const files = req.files
            const images = files.map((file) => file.filename)

            const newPost = await Post.create({
                description: req.body.description, 
                postNum: Math.floor((Math.random() * 1000000) + 1),
                user_id: user._id, 
                image: images,
                likers: [],
                created_at: new Date().getTime(),
                user: {
                    _id: user._id,
                    username: user.username,
                    profile_picture: user.profile_picture,
                    full_name: user.full_name
                }
            })

            userProfile.updateOne({username: user.username}, {
                $push: {
                    "posts": {
                        "_id": newPost._id,
                        "description": req.body.description,
                        "postNum": newPost.postNum,
                        "image": images,
                        "created_at": new Date().getTime(),
                        "likers": []
                    }
                } 
            }, (error, data) => {
                console.log("Updated")
                console.log(data)
            })
            return res.status(201).json({nessage: "Your Post creation was successfull"})
        }
        return  res.status(400).json({ message: "User has been logged out. Please log in to continueee"})
    }
    return  res.status(400).json({ message: "User has been logged out. Please log in to continue"})
}

// function to enable users like/unlike another user's post
const toggleLikePost = async (req, res) => {
    const person = req.user
    if(person){
        const user = await userProfile.findById(person._id)
        if(user){
            const findPost = await Post.findOne({ postNum: req.body.postNum })
            if(!findPost){
                return res.status(400).json({ message: "Post does not exist" })
            }
            let isLiked = false;
            for(let a = 0; a < findPost.likers.length; a++){
                let liker = findPost.likers[a]
                if(liker._id.toString() == user._id.toString()){
                    isLiked = true
                    break
                }
            }
            if(isLiked){
                Post.updateOne({postNum: req.body.postNum}, { 
                    $pull: {
                            "likers": {
                            "_id": user._id,
                        } 
                    }
                }, (error, data) => {
                    userProfile.updateOne({ 
                        $and: [{
                            "_id": findPost.user_id
                        }, {
                            "posts._id": findPost._id
                        }]
                    }, {
                        $pull: {
                            "posts.$[].likers": {
                                "_id": user._id,
                            }
                        }
                    })
                })
                return res.status(201).json({ message: "Post has been unliked" })
            }
            else {
                Post.updateOne({postNum: req.body.postNum}, {
                    $push: {
                        "likers": {
                            "post_id": findPost._id,
                            "_id": user._id,
                            "created_at": new Date().getTime()
                        }
                    }
                }, (error, data) => {
                    userProfile.updateOne({
                        $and: [{
                            "_id": findPost.user_id
                        }, {
                            "posts._id": findPost._id
                        }]
                    }, {
                        $push: {
                            "posts.$[].likers": {
                                "post_id": findPost._id,
                                "user_id": user._id,
                                "created_at": new Date().getTime()
                            }
                        }
                    }, (error, data) => {
                        console.log("Good to go")
                    })
                })
                return res.status(201).json({ message: "Post has been liked" })
            }
        }
        return  res.status(400).json({ message: "User has been logged out. Please log in to continueee"})
    }
    return  res.status(400).json({ message: "User has been logged out. Please log in to continue"})
}

module.exports = {
    createPost,
    toggleLikePost
}