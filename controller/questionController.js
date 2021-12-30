const Post = require('../models/postModel')
const userProfile = require('../models/userModel')

// Controller configuration for question 1.
// Getting all information for a given post Id, following the datastructure that was provided in the question
const getPosts = async (req, res) => {
    const { userId, postId } = req.body

    const post = await Post.find({ _id: postId, user_id: userId });
    if(post){
        let liked
        if(!post.likers){
            liked = false
        }
        else{
            liked = true
        }

        const user = await userProfile.find({ _id: userId })
        if(user){ 
            let followed
            if(!user.followers){
                followed = false
            }
            else{
                liked = true
            }

            console.log(post)
            console.log(user)
            var data = {
                'status': 200,
                'User': user.map(function (person) {
                    return {
                        id: person._id,
                        username: person.username,
                        full_name: person.full_name,
                        profile_picture: person.profile_picture,
                        followed: followed
                    }
                }),
                'Post': post.map(function (value) {
                    return {
                        id: value._id,
                        description: value.description,
                        owner: value.user_id,
                        image: value.image,
                        created_at: value.created_at,
                        liked: liked
                    }
                })
            };
            return res.status(200).json({ message: data })
        }
    }
    else{
        const user = await userProfile.find({ _id: userId })
        if(user){
            var data = {
                'status': 200,
                'User': user.map(function (person) {
                    return {
                        id: person._id,
                        username: person.username,
                        full_name: person.full_name,
                        profile_picture: person.profile_picture,
                        followed: false
                    }
                }),
                'Post': null
            };
            return res.status(200).json({ message: data })
        }
        return res.status(400).json({ message: "This user does not exist. Try signing up" })
    } 
}

// Controller configuration for question 2.
// Merge function that merges lists in lists of post into a single post.
const mergePosts = async (req, res) => {
    let arrs = req.body.newData
    
    let newData = arrs.map(function(x) { 
      return { 
        id: x[0], 
        description: x[1],
        image: x[2],
        created_at: x[3]
      }; 
    });
    const data = newData

    function compare(a, b){
        const bandA = a.created_at
        const bandB = b.created_at

        let comparison = 0
        if (bandA > bandB) {
            comparison = -1
        } else if (bandA < bandB) {
            comparison = 1
        }
        return comparison
    }

    const sortedData = data.sort(compare)
    return res.status(200).json({ message: sortedData })
}

module.exports = {
    getPosts,
    mergePosts
}