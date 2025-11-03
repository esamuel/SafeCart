const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['recipe', 'tip', 'success_story', 'meal_plan', 'shopping_list'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  attachments: {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    mealPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    images: [{
      type: String
    }]
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  likes: [{
    type: String  // User IDs who liked
  }],
  bookmarks: [{
    type: String  // User IDs who bookmarked
  }],
  comments: [commentSchema],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ 'likes': 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for bookmark count
postSchema.virtual('bookmarkCount').get(function() {
  return this.bookmarks.length;
});

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // unliked
  } else {
    this.likes.push(userId);
    return true; // liked
  }
};

// Method to toggle bookmark
postSchema.methods.toggleBookmark = function(userId) {
  const index = this.bookmarks.indexOf(userId);
  if (index > -1) {
    this.bookmarks.splice(index, 1);
    return false; // unbookmarked
  } else {
    this.bookmarks.push(userId);
    return true; // bookmarked
  }
};

// Method to add comment
postSchema.methods.addComment = function(userId, userName, content, userAvatar = null) {
  this.comments.push({
    userId,
    userName,
    userAvatar,
    content,
    createdAt: new Date()
  });
  return this.comments[this.comments.length - 1];
};

// Method to check if user liked
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Method to check if user bookmarked
postSchema.methods.isBookmarkedBy = function(userId) {
  return this.bookmarks.includes(userId);
};

// Increment view count
postSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  await this.save();
};

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
