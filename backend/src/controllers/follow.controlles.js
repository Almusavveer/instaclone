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
    count:followers.length,
    followers});
};

const getFollowing = async (req, res) => {
//   const userId = req.user._id; // logged-in user
  const find = await User.findOne({ email: req.user.email });
  const userId = find._id;
  try {
    const following = await Follow.find({ follower: userId })
      .populate("following", "name email"); // get user details

    res.status(200).json({
      count: following.length,
      following
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
      following: userId
    });

    const following = await Follow.countDocuments({
      follower: userId
    });

    res.json({
      followers,
      following
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { followUser, getFollowers ,getFollowing , countStats};
