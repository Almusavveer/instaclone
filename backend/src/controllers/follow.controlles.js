const User = require("../model/user");
const Follow = require("../model/followSchema");

const followUser = async (req, res) => {
  const find = await User.findOne({ email: req.user.email });

  const follower = find._id;
  //   console.log("userID",userId)
  const { followingId } = req.body;

  //   if (userId === targetUserId) {
  //     return res.status(400).json({ message: "You can't follow yourself" });
  //   }

  //   const user = await User.findById(userId);
  //   const targetUser = await User.findById(targetUserId);

  //   if (!targetUser) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   // already following
  //   if (user.following.includes(targetUserId)) {
  //     return res.status(400).json({ message: "Already following" });
  //   }

  //   user.following.push(targetUserId);
  //   targetUser.followers.push(userId);

  //   await user.save();
  //   await targetUser.save();

  //   res.json({ message: "Followed successfully" });

  if (follower.toString() === followingId) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  const targetUser = await User.findById(followingId);
  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const alreadyFollow = await Follow.findOne({
    follower,
    following: followingId,
  });

  if (alreadyFollow) {
    return res.status(400).json({ message: "Already following" });
  }

  await Follow.create({
    follower,
    following: followingId,
  });

  res.json({ message: "Followed successfully" });
};

const getFollowers = async (req, res) => {
  const find = await User.findOne({ email: req.user.email });
  const userId = find._id;

  const followers = await Follow.find({ following: userId }).populate(
    "follower",
    "name email",
  );

  res.status(200).json({
    count: followers.length,
    followers,
  });
};

const getFollowing = async (req, res) => {
  //   const userId = req.user._id; // logged-in user
  const find = await User.findOne({ email: req.user.email });
  const userId = find._id;
  try {
    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "name email",
    ); // get user details

    res.status(200).json({
      count: following.length,
      following,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const countStats = async (req, res) => {
  const find = await User.findOne({ email: req.user.email });
  const userId = find._id;

  try {
    const followers = await Follow.countDocuments({
      following: userId,
    });

    const following = await Follow.countDocuments({
      follower: userId,
    });

    res.json({
      followers,
      following,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

async function unfollowUser(req, res) {
  try {
    const currentUser = await User.findOne({ email: req.user.email });
    const { followingId } = req.body; // ID of the user to unfollow

    if (!followingId) {
      return res.status(400).json({ message: "followingId is required" });
    }

    const deleted = await Follow.findOneAndDelete({
      follower: currentUser._id,
      following: followingId,
    });

    if (!deleted) {
      return res.status(400).json({ message: "Not following this user" });
    }

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const getFollowStatus = async (req, res) => {
  try {
    const currentUser = await User.findOne({ email: req.user.email });
    const { followingId } = req.query;

    if (!followingId) {
      return res.status(400).json({ message: "followingId required" });
    }
    
    const followRecord = await Follow.findOne({
      follower: currentUser._id,
      following: followingId,
    });

    res.json({ isFollowing: !!followRecord });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getFollowersAndFollowing(req, res) {
  try {
    // ✅ Get email from query
    const { email } = req.query;

    // ✅ Find user
    const user = await User.findOne({ email });

    console.log("User for Follow Data:", user);

    // ❌ User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = user._id;

    // 👥 Followers
    const followers = await Follow.find({
      following: userId,
    }).populate(
      "follower",
      "name  email"
    );

    // ➡️ Following
    const following = await Follow.find({
      follower: userId,
    }).populate(
      "following",
      "name  email"
    );

    // 📊 Counts
    const followersCount = followers.length;
    const followingCount = following.length;

    res.status(200).json({
      success: true,

      counts: {
        followers: followersCount,
        following: followingCount,
      },

      followers: followers.map(
        (f) => f.follower
      ),

      following: following.map(
        (f) => f.following
      ),
    });
  } catch (error) {
    console.error(
      "Followers/Following Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

const getFollowData = async (req, res) => {
  try {
    const { userId } = req.params;

    // 👥 Followers
    const followers = await Follow.find({
      following: userId,
    }).populate(
      "follower",
      "name username avatar email"
    );

    // 👤 Following
    const following = await Follow.find({
      follower: userId,
    }).populate(
      "following",
      "name username avatar email"
    );

    res.status(200).json({
      success: true,

      followersCount: followers.length,
      followingCount: following.length,
    });
  } catch (error) {
    console.log("Follow Data Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch follow data",
    });
  }
};

module.exports = {
  followUser,
  getFollowers,
  getFollowing,
  countStats,
  unfollowUser,
  getFollowStatus,
  getFollowersAndFollowing,
  getFollowData
};
