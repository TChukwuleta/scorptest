const express = require('express')
const userController = require('../controller/userController')
const postController = require('../controller/postController')
const questionController = require('../controller/questionController')
const multer = require('multer')
const router = express.Router()
const { validateAuth } = require('../middleware/auth')

// Multer handling (using for handling the image uploads)
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const uploadImage = multer({ storage: imageStorage }).array('images', 10)

router.get('/', (req, res) => {
    res.send('Welcome User') 
}) 

// ROUTES
// User registration and login routes   
router.post('/register', uploadImage, userController.registerUser)
router.post('/login', userController.loginUser)

// Create post routes
router.post('/createpost', validateAuth, uploadImage, postController.createPost)

// Routes for liking another user's post
router.post('/togglelike', validateAuth, postController.toggleLikePost)

// Routes to follow and unfollow another user 
router.post('/follow', validateAuth, userController.userFollow)
router.post('/unfollow', validateAuth, userController.userUnfollow)


// QUESTION 1
router.get('/getposts', questionController.getPosts)
// QUESTION 2
router.get('/mergeposts', questionController.mergePosts)


module.exports = router