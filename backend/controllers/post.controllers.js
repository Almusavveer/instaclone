const User = require("../model/user");
const Post = require("../model/post"); // assuming you have this

async function createpost(req, res) {
    try {
        const { title, content } = req.body;

        // 🔥 Find user using email from token
        const user = await User.findOne({ email: req.user });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔥 Create post with user ID
        const post = await Post.create({
            title,
            content,
            author: user._id
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getPosts(req, res) {
    try {
        const posts = await Post.find().populate("author", "email");
        res.status(200).json({ posts });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = { createpost, getPosts };