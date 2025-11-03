const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: {
    type: String,
    required: true,
    index: true
  },
  followingId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate follows and optimize queries
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followingId: 1, createdAt: -1 });

// Static method to follow a user
followSchema.statics.followUser = async function(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  try {
    const follow = await this.create({ followerId, followingId });
    return follow;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Already following this user');
    }
    throw error;
  }
};

// Static method to unfollow a user
followSchema.statics.unfollowUser = async function(followerId, followingId) {
  const result = await this.deleteOne({ followerId, followingId });
  if (result.deletedCount === 0) {
    throw new Error('Not following this user');
  }
  return result;
};

// Static method to check if user A follows user B
followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({ followerId, followingId });
  return !!follow;
};

// Static method to get follower count
followSchema.statics.getFollowerCount = async function(userId) {
  return await this.countDocuments({ followingId: userId });
};

// Static method to get following count
followSchema.statics.getFollowingCount = async function(userId) {
  return await this.countDocuments({ followerId: userId });
};

// Static method to get list of followers
followSchema.statics.getFollowers = async function(userId, limit = 50) {
  const follows = await this.find({ followingId: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return follows.map(f => f.followerId);
};

// Static method to get list of following
followSchema.statics.getFollowing = async function(userId, limit = 50) {
  const follows = await this.find({ followerId: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return follows.map(f => f.followingId);
};

module.exports = mongoose.model('Follow', followSchema);
