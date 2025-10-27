'use client'

import { useState, useEffect } from 'react'
import { Heart, Bookmark, MessageCircle, Send, User } from 'lucide-react'
import { socialAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'

interface Post {
  _id: string
  userId: string
  userName: string
  userAvatar?: string
  type: string
  title: string
  content: string
  tags: string[]
  isLiked?: boolean
  isBookmarked?: boolean
  likeCount: number
  commentCount: number
  bookmarkCount: number
  comments: Comment[]
  createdAt: string
}

interface Comment {
  _id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState({
    type: 'tip',
    title: '',
    content: '',
    tags: ''
  })

  const user = auth.currentUser

  useEffect(() => {
    loadFeed()
  }, [filter])

  const loadFeed = async () => {
    setLoading(true)
    try {
      const response = await socialAPI.getFeed(user?.uid, 1, 20, filter)
      setPosts(response.posts)
      setHasMore(response.hasMore)
      setPage(1)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    try {
      const nextPage = page + 1
      const response = await socialAPI.getFeed(user?.uid, nextPage, 20, filter)
      setPosts([...posts, ...response.posts])
      setHasMore(response.hasMore)
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more posts:', error)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const response = await socialAPI.likePost(postId, user.uid)

      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, isLiked: response.liked, likeCount: response.likeCount }
          : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleBookmark = async (postId: string) => {
    if (!user) return

    try {
      const response = await socialAPI.bookmarkPost(postId, user.uid)

      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, isBookmarked: response.bookmarked, bookmarkCount: response.bookmarkCount }
          : post
      ))
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const handleComment = async (postId: string) => {
    if (!user || !commentText.trim()) return

    try {
      await socialAPI.addComment(
        postId,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        commentText.trim()
      )

      setCommentText('')

      // Refresh the post to get updated comments
      const response = await socialAPI.getPost(postId, user.uid)
      setPosts(posts.map(post =>
        post._id === postId ? response.post : post
      ))
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    try {
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(t => t)

      await socialAPI.createPost({
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        type: newPost.type as any,
        title: newPost.title,
        content: newPost.content,
        tags,
        visibility: 'public'
      })

      setShowNewPost(false)
      setNewPost({ type: 'tip', title: '', content: '', tags: '' })
      loadFeed()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'recipe': return '🍳'
      case 'tip': return '💡'
      case 'success_story': return '🎉'
      case 'meal_plan': return '📅'
      case 'shopping_list': return '🛒'
      default: return '📝'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recipe': return 'bg-orange-100 text-orange-800'
      case 'tip': return 'bg-blue-100 text-blue-800'
      case 'success_story': return 'bg-green-100 text-green-800'
      case 'meal_plan': return 'bg-purple-100 text-purple-800'
      case 'shopping_list': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Community Feed</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {['all', 'recipe', 'tip', 'success_story', 'following'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>

        {/* Create post button */}
        <button
          onClick={() => setShowNewPost(true)}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition"
        >
          Share something with the community
        </button>
      </div>

      {/* New post modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Post</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="tip">Tip</option>
                  <option value="recipe">Recipe</option>
                  <option value="success_story">Success Story</option>
                  <option value="meal_plan">Meal Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Give your post a catchy title..."
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
                  placeholder="Share your thoughts, tips, or success story..."
                  maxLength={2000}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="diabetic, low-carb, gluten-free..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreatePost}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
                >
                  Post
                </button>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading community posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No posts yet in this category.</p>
          <p className="text-gray-500">Be the first to share something!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-xl shadow-md p-6 mb-4">
              {/* Post header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{post.userName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(post.type)}`}>
                  {getTypeEmoji(post.type)} {post.type.replace('_', ' ')}
                </span>
              </div>

              {/* Post content */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-2 transition ${
                    post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{post.likeCount}</span>
                </button>

                <button
                  onClick={() => setShowComments(showComments === post._id ? null : post._id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.commentCount}</span>
                </button>

                <button
                  onClick={() => handleBookmark(post._id)}
                  className={`flex items-center gap-2 transition ${
                    post.isBookmarked ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Comments section */}
              {showComments === post._id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Existing comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-800">{comment.userName}</p>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post._id)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Load more button */}
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              Load More
            </button>
          )}
        </>
      )}
    </div>
  )
}
