const User = require("../model/user");
const Post = require("../model/post");

// Add Comment

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    // ✅ Find logged-in user
    const user = await User.findOne({
      email: req.user.email,
    });

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // ✅ Create comment
    const newComment = {
      text,
      author: user._id,
    };

    // ✅ Push comment
    post.comments.push(newComment);

    await post.save();

    // ✅ Populate latest comment
    await post.populate(
      "comments.author",
      "name avatar"
    );

    res.status(201).json({
      success: true,
      message: "Comment added",
      comments: post.comments,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// Get All Comments

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate(
        "comments.author",
        "name avatar"
      );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      comments: post.comments,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Comment

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const user = await User.findOne({
      email: req.user.email,
    });

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // ✅ Find comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // ✅ Allow only owner
    if (
      comment.author.toString() !==
      user._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // ✅ Remove comment
    comment.deleteOne();

    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = { getComments, addComment, deleteComment };