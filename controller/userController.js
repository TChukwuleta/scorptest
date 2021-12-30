const Joi = require('joi')
const fileSystem = require("fs");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userProfile = require('../models/userModel')

// Validation schema for the registration      
const registerSchema = Joi.object({
    userName: Joi.string().required(), 
    firstName: Joi.string().required(), 
    lastName: Joi.string().required(), 
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    bio: Joi.string().required()
}) 

// Validation schema for the login
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8)
})

// token
const createToken = async (payload) => {
    return jwt.sign(payload, `${process.env.jkeys}`, {
        expiresIn: 6 * 60 * 60
    })
} 

// Sign Up
const registerUser = async (req, res) => {
    let coverPhoto = ""
    const { error } = registerSchema.validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message) 
    }
    const userExist = await userProfile.findOne({ email: req.body.email })
    if (userExist){
        return res.status(400).json({ "message": "A user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const files = req.files
    const images = files.map((file) => file.filename)

    await userProfile.create({
        username: req.body.userName,
        full_name: req.body.firstName + " " + req.body.lastName,
        email: req.body.email,
        password: hashPassword, 
        bio: req.body.bio,
        profile_picture: images,
        posts: [],
        follows: [],
        followers: [],
        following: [],
        created_at: new Date().getTime()
    })
    return res.status(201).json({ message: "User created successfully" })
}

// Login
const loginUser = async (req, res) => {
    const { error } = loginSchema.validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message)
    }
    const user = await userProfile.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({"message": "This email is not registered"})
    }
    const confirmPassword = await bcrypt.compare(req.body.password, user.password)
    if(!confirmPassword){
        return res.status(400).json({"message": "You entered an incorrect password"})
    }
    const signature = await createToken({
        _id: user._id, 
        email: user.email
    })
    return res.status(201).json({ signature: signature }) 
}

// Function to allow a user follow another user
const userFollow = async (req, res) => {
    const person = req.user
    if(person){
        const user = await userProfile.findById(person._id)
        if(user){
            const personTwoId = req.body.personTwoId
            userProfile.updateOne({_id: personTwoId}, {
                $push: {
                    "followers": user._id,
                    "follows": {
                        "_id": user._id,
                        "follower_id": user._id,
                        "created_at": new Date().getTime()
                    }
                }
            }, (error, data) => {
                if(error){
                    console.log(error)
                    return res.status(422).json({ message: error })
                }
                console.log(data)
                userProfile.updateOne({_id: user._id}, {
                    $push: {
                        "following": personTwoId,
                        "follows": {
                            "_id": personTwoId,
                            "following_id": personTwoId,
                            "created_at": new Date().getTime()
                        }
                    }
                }, (error, data) => {
                    if(error) {
                        console.log(error)
                        return res.status(422).json({ message: error })
                    }
                    console.log(data)
                })
                return res.status(201).json({ message: "Followed Successfully" })
            })
        }
    }
}

// Function to allow a user unfollow another user
const userUnfollow = async (req, res) => {
    const person = req.user
    if(person){
        const user = await userProfile.findById(person._id)
        if(user){
            const personTwoId = req.body.personTwoId
            userProfile.updateOne({_id: personTwoId}, {
                $pull: {
                    "followers": user._id,
                    "follows": {
                        "_id": user._id,
                        "follower_id": user._id
                    }
                }
            }, (error, data) => {
                if(error){
                    console.log(error)
                    return res.status(422).json({ message: error })
                }
                userProfile.updateOne({_id: user._id}, {
                    $pull: {
                        "following": personTwoId,
                        "follows": {
                            "_id": personTwoId,
                            "following_id": personTwoId
                        }
                    }
                }, (error, data) => {
                    if(error){
                        return res.status(422).json({ message: error })
                    }
                })
                return res.status(201).json({ message: "Unfollowed Successfully" })
            })
        }
    }
}

module.exports = {
    loginUser,
    registerUser,
    userFollow,
    userUnfollow
}