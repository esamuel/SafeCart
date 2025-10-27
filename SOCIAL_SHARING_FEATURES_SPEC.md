# 🤝 Social & Sharing Features - Specification

## Overview

This document outlines the Social & Sharing Features implementation for SafeCart, enabling users to share recipes, shopping lists, tips, and success stories with friends, family, and the community.

---

## 🎯 Goals

1. **Enable Sharing**: Allow users to share shopping lists, recipes, and meal plans
2. **Build Community**: Create a social feed for tips, recipes, and success stories
3. **Increase Engagement**: Encourage users to connect and learn from each other
4. **Safety First**: Ensure shared content respects allergen warnings and privacy
5. **Simple UX**: Make sharing as easy as one tap

---

## 📋 Features to Implement

### 1. Shopping List Sharing
- Share shopping lists with family/friends via link
- Collaborative shopping lists (multiple users can edit)
- Real-time sync when shared list is updated
- Copy someone's shared list to your account

### 2. Recipe Sharing
- Share recipes via link or social media
- Copy shared recipes to your meal planner
- Like and save community recipes
- Comment on shared recipes

### 3. Social Feed
- Community feed showing shared recipes and tips
- Filter by dietary tags (diabetic-friendly, allergen-free, etc.)
- Like and bookmark posts
- Follow other users

### 4. Success Stories
- Share weight loss, health improvements, streak achievements
- Include before/after stats (optional)
- Inspire and motivate the community

### 5. Share Buttons
- Native share API integration
- Share via SMS, Email, WhatsApp, etc.
- Copy link to clipboard
- QR code generation for easy sharing

---

## 🗄️ Database Schema

### SharedList Model
```javascript
{
  _id: ObjectId,
  listId: ObjectId,              // Reference to original shopping list
  ownerId: String,                // User who shared
  ownerName: String,              // Display name
  type: 'shopping_list' | 'recipe' | 'meal_plan',
  shareToken: String,             // Unique share token
  isPublic: Boolean,              // Public feed vs. private link
  permissions: {
    canView: Boolean,
    canEdit: Boolean,
    canCopy: Boolean
  },
  collaborators: [
    {
      userId: String,
      email: String,
      role: 'viewer' | 'editor'
    }
  ],
  stats: {
    views: Number,
    copies: Number,
    likes: Number
  },
  createdAt: Date,
  expiresAt: Date                 // Optional expiration
}
```

### Post Model (Social Feed)
```javascript
{
  _id: ObjectId,
  userId: String,
  userName: String,
  userAvatar: String,
  type: 'recipe' | 'tip' | 'success_story' | 'meal_plan',
  title: String,
  content: String,
  attachments: {
    recipeId: ObjectId,           // If sharing a recipe
    listId: ObjectId,             // If sharing a list
    images: [String]              // Image URLs
  },
  tags: [String],                 // e.g., ['diabetic', 'gluten-free']
  likes: [String],                // Array of user IDs who liked
  bookmarks: [String],            // Array of user IDs who bookmarked
  comments: [
    {
      userId: String,
      userName: String,
      content: String,
      createdAt: Date
    }
  ],
  visibility: 'public' | 'followers' | 'private',
  createdAt: Date,
  updatedAt: Date
}
```

### Follow Model
```javascript
{
  _id: ObjectId,
  followerId: String,             // User who follows
  followingId: String,            // User being followed
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Sharing Endpoints

#### 1. Create Share Link
```
POST /api/shares
Body: {
  resourceId: String,
  resourceType: 'shopping_list' | 'recipe' | 'meal_plan',
  isPublic: Boolean,
  permissions: { canView, canEdit, canCopy },
  expiresIn: Number (days)
}
Response: {
  shareToken: String,
  shareUrl: String,
  qrCode: String (base64)
}
```

#### 2. Get Shared Resource
```
GET /api/shares/:shareToken
Response: {
  resource: Object,
  owner: { id, name },
  permissions: Object,
  canEdit: Boolean
}
```

#### 3. Copy Shared Resource
```
POST /api/shares/:shareToken/copy
Body: { userId: String }
Response: {
  newResourceId: String,
  message: "Copied to your account"
}
```

#### 4. Update Shared List (Collaborative)
```
PUT /api/shares/:shareToken/update
Body: { items: Array }
Response: { success: Boolean }
```

#### 5. Revoke Share
```
DELETE /api/shares/:shareToken
Response: { success: Boolean }
```

### Social Feed Endpoints

#### 6. Get Feed
```
GET /api/social/feed?userId=:userId&page=1&limit=20
Query: {
  filter: 'all' | 'following' | 'recipes' | 'tips',
  tags: String (comma-separated)
}
Response: {
  posts: [Post],
  hasMore: Boolean,
  page: Number
}
```

#### 7. Create Post
```
POST /api/social/posts
Body: {
  userId: String,
  type: String,
  title: String,
  content: String,
  attachments: Object,
  tags: [String],
  visibility: String
}
Response: { postId: String }
```

#### 8. Like Post
```
POST /api/social/posts/:postId/like
Body: { userId: String }
Response: { likes: Number }
```

#### 9. Bookmark Post
```
POST /api/social/posts/:postId/bookmark
Body: { userId: String }
Response: { success: Boolean }
```

#### 10. Comment on Post
```
POST /api/social/posts/:postId/comments
Body: {
  userId: String,
  userName: String,
  content: String
}
Response: { commentId: String }
```

#### 11. Follow User
```
POST /api/social/follow
Body: {
  followerId: String,
  followingId: String
}
Response: { success: Boolean }
```

#### 12. Get User's Posts
```
GET /api/social/users/:userId/posts
Response: { posts: [Post] }
```

---

## 🎨 UI Components

### 1. ShareButton Component
- Floating share button on relevant screens
- Native share sheet on mobile
- Copy link option
- QR code modal

### 2. SocialFeed Component
- Infinite scroll feed
- Post cards with like/bookmark/comment
- Filter tabs (All, Following, Recipes, Tips)
- Tag filters

### 3. SharedListViewer Component
- View-only or editable mode based on permissions
- Real-time collaboration indicator
- Copy to my account button
- Add collaborators button (owner only)

### 4. PostComposer Component
- Create new post modal
- Type selector (recipe/tip/success)
- Attach recipe or meal plan
- Tag selector
- Visibility options

### 5. UserProfile Component
- Show user's shared posts
- Follower/following counts
- Follow button
- View shared recipes and lists

---

## 🔐 Security & Privacy

### Share Token Generation
```javascript
const crypto = require('crypto');
const shareToken = crypto.randomBytes(16).toString('hex');
```

### Permission Checks
- Verify user owns resource before sharing
- Check permissions before allowing edits
- Validate share token on every request
- Respect expiration dates

### Privacy Controls
- Users can make profiles private
- Control who can see shared content
- Option to share anonymously
- Report inappropriate content

---

## 📱 User Flows

### Flow 1: Share Shopping List with Family

1. User opens shopping list
2. Taps share button
3. Selects "Share with family"
4. Chooses "Can edit" permission
5. System generates link
6. User sends link via SMS/WhatsApp
7. Recipient opens link
8. Sees list and can edit items
9. Changes sync in real-time

### Flow 2: Share Recipe to Community

1. User creates or finds a recipe
2. Taps "Share to Community"
3. Adds title and description
4. Selects tags (diabetic-friendly, low-carb)
5. Posts to public feed
6. Community members can:
   - Like the recipe
   - Bookmark for later
   - Comment with questions
   - Copy to their meal planner

### Flow 3: Copy Someone's Shared List

1. User receives share link
2. Opens link in app
3. Views the shared list
4. Taps "Copy to my account"
5. System creates duplicate in user's lists
6. User can now edit their copy

---

## 🎯 Success Metrics

### Engagement Metrics
- Number of shares created per user
- Share link click-through rate
- Collaborative list usage
- Post engagement (likes, comments, bookmarks)
- Active community members

### Growth Metrics
- Viral coefficient (new users from shares)
- Retention of users who engage socially
- Average network size per user
- Content creation rate

---

## 🚀 Implementation Plan

### Phase 1: Basic Sharing (Week 1)
- [x] Design database schema
- [ ] Create SharedList and Post models
- [ ] Implement share token generation
- [ ] Build sharing API endpoints
- [ ] Create ShareButton component
- [ ] Test shopping list sharing

### Phase 2: Social Feed (Week 2)
- [ ] Create Post model and routes
- [ ] Build SocialFeed component
- [ ] Implement like/bookmark functionality
- [ ] Add comment system
- [ ] Create post composer
- [ ] Test feed with sample data

### Phase 3: Collaboration (Week 3)
- [ ] Real-time sync for shared lists
- [ ] Collaborator management UI
- [ ] Conflict resolution
- [ ] Notification system
- [ ] Test with multiple users

### Phase 4: Polish & Analytics (Week 4)
- [ ] QR code generation
- [ ] Share analytics dashboard
- [ ] Native share API integration
- [ ] Privacy controls
- [ ] Content moderation tools

---

## 🎨 UI Mockups

### Share Button Locations
- Shopping Lists page: Floating action button
- Recipe detail page: Share icon in header
- Meal Plan page: Share button next to plan name
- Success stats: Share achievement button

### Social Feed Layout
```
┌─────────────────────────────────┐
│  Social Feed          🔍 Filter  │
├─────────────────────────────────┤
│  [All] [Following] [Recipes]    │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 👤 Sarah Johnson         │  │
│  │ Shared a diabetic recipe │  │
│  │                          │  │
│  │ Low-Carb Chicken Bowl    │  │
│  │ ⭐⭐⭐⭐⭐ (4.8)             │  │
│  │ Net Carbs: 12g           │  │
│  │                          │  │
│  │ 👍 24  💬 5  🔖 8        │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 👤 Mike Chen              │  │
│  │ Shared a tip              │  │
│  │                          │  │
│  │ "Use this app at Whole   │  │
│  │ Foods - saved so much    │  │
│  │ time! No more reading    │  │
│  │ every label."            │  │
│  │                          │  │
│  │ 👍 12  💬 2              │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Unit Tests
- Share token generation and validation
- Permission checking logic
- Post creation and filtering
- Like/bookmark toggling

### Integration Tests
- Share link creation end-to-end
- Collaborative list editing
- Social feed loading and pagination
- Comment system

### User Testing
- Share flow with real users
- Collaboration with family members
- Community engagement
- Privacy controls

---

## 💡 Future Enhancements

### Phase 2 Features
- [ ] Direct messaging between users
- [ ] Group discussions/forums
- [ ] Recipe contests and challenges
- [ ] User badges and achievements
- [ ] Verified users (nutritionists, chefs)
- [ ] Recipe reviews and ratings
- [ ] Shopping list templates
- [ ] Meal plan recommendations from community

### Advanced Features
- [ ] Video recipe tutorials
- [ ] Live cooking sessions
- [ ] Ingredient substitution suggestions from community
- [ ] Local community meetups
- [ ] Integration with meal kit delivery services

---

## 📊 Analytics Dashboard

Track sharing metrics:
- Most shared recipes
- Most active users
- Engagement trends
- Viral loops
- Conversion from shares

---

## ✅ Definition of Done

- [ ] Users can share shopping lists via link
- [ ] Collaborative editing works in real-time
- [ ] Social feed displays community posts
- [ ] Users can like, comment, and bookmark posts
- [ ] Share buttons present on all shareable content
- [ ] QR codes generated for easy sharing
- [ ] Privacy controls functional
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Analytics tracking implemented

---

## 🎉 Success Stories

Example posts we expect to see:
- "Lost 15 lbs using this app's meal plans!"
- "My family loves this chicken recipe - 12g net carbs"
- "30-day streak! Feeling great!"
- "Found 20 safe products at Trader Joe's using this app"

---

**Ready to build a thriving SafeCart community! 🚀**
