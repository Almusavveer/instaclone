const User = require("../model/user");
const Post = require("../model/post"); // assuming you have this

async function createpost(req, res) {
    try {
        const { title, content } = req.body;

        // 🔥 Find user using email from token
        const user = await User.findOne({ email: req.user.email });

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
        const posts = await Post.find().populate("author", "name");
        res.status(200).json({ posts });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getMyPosts(req, res) {
  try {
    const user = await User.findOne({ email: req.user.email });
    const userId = user._id;
    const posts = await Post.find({ author: userId });

    if (posts.length === 0) {
      return res.status(200).json({
        message: "No posts yet",
        posts: []
      });
    }

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function search(req, res) {
     try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('_id name email avatar');  // exclude password
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function anotheruserprofile(req, res) {
    try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function Getpostsofaspecificuser(req, res) {
     try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
module.exports = { createpost, getPosts, getMyPosts ,search,anotheruserprofile,Getpostsofaspecificuser };