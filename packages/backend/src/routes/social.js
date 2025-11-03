const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Follow = require('../models/Follow');

/**
 * GET /api/social/feed
 * Get social feed posts
 */
router.get('/feed', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20, filter = 'all', tags } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { visibility: 'public' };

    // Filter by type
    if (filter && filter !== 'all') {
      if (filter === 'following' && userId) {
        // Get users that the current user follows
        const following = await Follow.getFollowing(userId);
        query.userId = { $in: following };
      } else if (['recipe', 'tip', 'success_story', 'meal_plan'].includes(filter)) {
        query.type = filter;
      }
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Fetch posts
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Check if user has liked/bookmarked each post
    if (userId) {
      posts.forEach(post => {
        post.isLiked = post.likes.includes(userId);
        post.isBookmarked = post.bookmarks.includes(userId);
        post.likeCount = post.likes.length;
        post.commentCount = post.comments.length;
        post.bookmarkCount = post.bookmarks.length;
      });
    }

    // Check if there are more posts
    const total = await Post.countDocuments(query);
    const hasMore = skip + posts.length < total;

    res.json({
      posts,
      page: pageNum,
      limit: limitNum,
      total,
      hasMore
    });

  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/social/posts
 * Create a new post
 */
router.post('/posts', async (req, res) => {
  try {
    const { userId, userName, userAvatar, type, title, content, attachments, tags, visibility } = req.body;

    if (!userId || !userName || !type || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = new Post({
      userId,
      userName,
      userAvatar,
      type,
      title,
      content,
      attachments: attachments || {},
      tags: tags || [],
      visibility: visibility || 'public'
    });

    await post.save();

    res.json({
      success: true,
      postId: post._id,
      post
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/social/posts/:postId
 * Get a single post
 */
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await post.incrementViews();

    const postData = post.toObject();

    if (userId) {
      postData.isLiked = post.isLikedBy(userId);
      postData.isBookmarked = post.isBookmarkedBy(userId);
    }

    postData.likeCount = post.likes.length;
    postData.commentCount = post.comments.length;
    postData.bookmarkCount = post.bookmarks.length;

    res.json({ post: postData });

  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/social/posts/:postId/like
 * Like/unlike a post
 */
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const liked = post.toggleLike(userId);
    await post.save();

    res.json({
      success: true,
      liked,
      likeCount: post.likes.length
    });

  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/social/posts/:postId/bookmark
 * Bookmark/unbookmark a post
 */
router.post('/posts/:postId/bookmark', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const bookmarked = post.toggleBookmark(userId);
    await post.save();

    res.json({
      success: true,
      bookmarked,
      bookmarkCount: post.bookmarks.length
    });

  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/social/posts/:postId/comments
 * Add a comment to a post
 */
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, userName, content, userAvatar } = req.body;

    if (!userId || !userName || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.addComment(userId, userName, content, userAvatar);
    await post.save();

    res.json({
      success: true,
      comment,
      commentCount: post.comments.length
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/social/posts/:postId
 * Delete a post
 */
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: postId });

    res.json({
      success: true,
      message: 'Post deleted'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/social/users/:userId/posts
 * Get posts by a specific user
 */
router.get('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments({ userId });
    const hasMore = skip + posts.length < total;

    res.json({
      posts,
      page: pageNum,
      total,
      hasMore
    });

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/social/users/:userId/bookmarks
 * Get user's bookmarked posts
 */
router.get('/users/:userId/bookmarks', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find({ bookmarks: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments({ bookmarks: userId });
    const hasMore = skip + posts.length < total;

    res.json({
      posts,
      page: pageNum,
      total,
      hasMore
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/social/follow
 * Follow a user
 */
router.post('/follow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await Follow.followUser(followerId, followingId);

    res.json({
      success: true,
      message: 'Successfully followed user'
    });

  } catch (error) {
    console.error('Error following user:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/social/follow
 * Unfollow a user
 */
router.delete('/follow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await Follow.unfollowUser(followerId, followingId);

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/social/users/:userId/stats
 * Get user's social stats
 */
router.get('/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { viewerId } = req.query;

    const [followers, following, posts, isFollowing] = await Promise.all([
      Follow.getFollowerCount(userId),
      Follow.getFollowingCount(userId),
      Post.countDocuments({ userId }),
      viewerId ? Follow.isFollowing(viewerId, userId) : false
    ]);

    res.json({
      followers,
      following,
      posts,
      isFollowing
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
