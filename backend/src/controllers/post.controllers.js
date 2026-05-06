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
      author: user._id,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getPosts(req, res) {
  try {
    const posts = await Post.find().populate("author", "name");
    res.status(200).json({ posts });
  } catch (error) {
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
        posts: [],
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
    if (!q || q.trim().length < 2) return res.json({ users: [] }); // minimum 2 chars

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeQuery = escapeRegex(q.trim());

    const users = await User.find({
      $or: [
        { name: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } }
      ]
    })
    .select("_id name email avatar")
    .limit(10)
    .lean(); // faster, returns plain objects

    res.json({ users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
}
async function anotheruserprofile(req, res) {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
async function Getpostsofaspecificuser(req, res) {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    // ✅ Get userId safely from token
    const userId = req.user._id || req.user.id;
    console.log("Token user ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("User ID:", userId);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } }, // prevents duplicate likes
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      likesCount: updatedPost.likes.length,
      message: "Post liked",
    });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      likesCount: updatedPost.likes.length,
      message: "Post unliked",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if current user has liked the post
const checkIfLiked = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId).select("likes");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const liked = post.likes.includes(userId);
    res.status(200).json({ liked, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get like count only
const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).select("likes");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get user posts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// const getUserPosts = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Optional: check if user exists
//     const User = require("../models/User");
//     const userExists = await User.findById(userId);
//     if (!userExists) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const posts = await Post.find({ author: userId })
//       .populate("author", "name email avatar") // include author details
//       .sort({ createdAt: -1 }); // newest first

//     res.json(posts);
//   } catch (err) {
//     console.error("Get user posts error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

module.exports = {
  createpost,
  getPosts,
  getMyPosts,
  getUserPosts,
  search,
  anotheruserprofile,
  Getpostsofaspecificuser,
  likePost,
  unlikePost,
  checkIfLiked,
  getLikeCount,
};
