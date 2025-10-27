const mongoose = require('mongoose');

const sharedListSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  listType: {
    type: String,
    enum: ['shopping_list', 'recipe', 'meal_plan'],
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  shareToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  permissions: {
    canView: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canCopy: {
      type: Boolean,
      default: true
    }
  },
  collaborators: [
    {
      userId: String,
      email: String,
      role: {
        type: String,
        enum: ['viewer', 'editor'],
        default: 'viewer'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    copies: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  expiresAt: {
    type: Date,
    default: null
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

// Index for faster lookups
sharedListSchema.index({ shareToken: 1 });
sharedListSchema.index({ ownerId: 1 });
sharedListSchema.index({ isPublic: 1, createdAt: -1 });

// Method to check if share has expired
sharedListSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to check user permissions
sharedListSchema.methods.canUserEdit = function(userId) {
  if (this.ownerId === userId) return true;
  if (!this.permissions.canEdit) return false;

  const collaborator = this.collaborators.find(c => c.userId === userId);
  return collaborator && collaborator.role === 'editor';
};

// Increment view count
sharedListSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  await this.save();
};

// Increment copy count
sharedListSchema.methods.incrementCopies = async function() {
  this.stats.copies += 1;
  await this.save();
};

module.exports = mongoose.model('SharedList', sharedListSchema);
