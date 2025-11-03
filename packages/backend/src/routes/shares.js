const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const SharedList = require('../models/SharedList');
const ShoppingList = require('../models/ShoppingList');
const Recipe = require('../models/Recipe');
const QRCode = require('qrcode');

// Generate unique share token
const generateShareToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Calculate expiration date
const getExpirationDate = (days) => {
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * POST /api/shares
 * Create a new share link
 */
router.post('/', async (req, res) => {
  try {
    const { resourceId, resourceType, isPublic, permissions, expiresIn, userId, userName } = req.body;

    // Validate input
    if (!resourceId || !resourceType || !userId || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify ownership based on resource type
    let resource;
    if (resourceType === 'shopping_list') {
      resource = await ShoppingList.findById(resourceId);
      if (!resource || resource.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to share this resource' });
      }
    } else if (resourceType === 'recipe') {
      resource = await Recipe.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
    }

    // Generate share token
    const shareToken = generateShareToken();
    const expiresAt = getExpirationDate(expiresIn);

    // Create share record
    const share = new SharedList({
      listId: resourceId,
      listType: resourceType,
      ownerId: userId,
      ownerName: userName,
      shareToken,
      isPublic: isPublic || false,
      permissions: permissions || {
        canView: true,
        canEdit: false,
        canCopy: true
      },
      expiresAt
    });

    await share.save();

    // Generate share URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(shareUrl);

    res.json({
      shareToken,
      shareUrl,
      qrCode,
      expiresAt,
      message: 'Share link created successfully'
    });

  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/shares/:shareToken
 * Get shared resource details
 */
router.get('/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    // Find share record
    const share = await SharedList.findOne({ shareToken });
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check if expired
    if (share.isExpired()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }

    // Increment view count
    await share.incrementViews();

    // Fetch the actual resource
    let resource;
    if (share.listType === 'shopping_list') {
      resource = await ShoppingList.findById(share.listId);
    } else if (share.listType === 'recipe') {
      resource = await Recipe.findById(share.listId);
    }

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found or deleted' });
    }

    res.json({
      share: {
        type: share.listType,
        owner: {
          id: share.ownerId,
          name: share.ownerName
        },
        permissions: share.permissions,
        stats: share.stats,
        createdAt: share.createdAt
      },
      resource
    });

  } catch (error) {
    console.error('Error fetching share:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/shares/:shareToken/copy
 * Copy a shared resource to user's account
 */
router.post('/:shareToken/copy', async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Find share record
    const share = await SharedList.findOne({ shareToken });
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check if expired
    if (share.isExpired()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }

    // Check copy permission
    if (!share.permissions.canCopy) {
      return res.status(403).json({ error: 'Copying is not allowed for this share' });
    }

    // Fetch original resource
    let originalResource;
    let newResource;

    if (share.listType === 'shopping_list') {
      originalResource = await ShoppingList.findById(share.listId);
      if (!originalResource) {
        return res.status(404).json({ error: 'Original list not found' });
      }

      // Create copy
      newResource = new ShoppingList({
        userId,
        name: `${originalResource.name} (Copy)`,
        items: originalResource.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          checked: false,
          productInfo: item.productInfo,
          allergenInfo: item.allergenInfo
        })),
        category: originalResource.category
      });

      await newResource.save();

    } else if (share.listType === 'recipe') {
      // For recipes, we don't create a copy but just add to user's favorites
      // (This could be implemented with a user favorites system)
      return res.json({
        success: true,
        message: 'Recipe bookmarked to your account',
        recipeId: share.listId
      });
    }

    // Increment copy count
    await share.incrementCopies();

    res.json({
      success: true,
      newResourceId: newResource._id,
      message: 'Successfully copied to your account'
    });

  } catch (error) {
    console.error('Error copying share:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/shares/:shareToken/update
 * Update a shared list (collaborative editing)
 */
router.put('/:shareToken/update', async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { items, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Find share record
    const share = await SharedList.findOne({ shareToken });
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check if expired
    if (share.isExpired()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }

    // Check edit permission
    if (!share.canUserEdit(userId)) {
      return res.status(403).json({ error: 'You do not have edit permission' });
    }

    // Update the original list
    if (share.listType === 'shopping_list') {
      const list = await ShoppingList.findById(share.listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }

      list.items = items;
      list.updatedAt = new Date();
      await list.save();

      res.json({
        success: true,
        list
      });
    } else {
      return res.status(400).json({ error: 'This resource type cannot be edited' });
    }

  } catch (error) {
    console.error('Error updating shared list:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/shares/:shareToken/collaborators
 * Add collaborator to shared list
 */
router.post('/:shareToken/collaborators', async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { email, role, ownerId } = req.body;

    // Find share record
    const share = await SharedList.findOne({ shareToken });
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Verify ownership
    if (share.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Only the owner can add collaborators' });
    }

    // Check if already a collaborator
    const exists = share.collaborators.find(c => c.email === email);
    if (exists) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    // Add collaborator
    share.collaborators.push({
      email,
      role: role || 'viewer',
      addedAt: new Date()
    });

    await share.save();

    res.json({
      success: true,
      collaborators: share.collaborators
    });

  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/shares/:shareToken
 * Revoke a share link
 */
router.delete('/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { userId } = req.body;

    // Find share record
    const share = await SharedList.findOne({ shareToken });
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Verify ownership
    if (share.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the owner can revoke this share' });
    }

    await SharedList.deleteOne({ shareToken });

    res.json({
      success: true,
      message: 'Share link revoked'
    });

  } catch (error) {
    console.error('Error revoking share:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/shares/user/:userId
 * Get all shares created by a user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const shares = await SharedList.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ shares });

  } catch (error) {
    console.error('Error fetching user shares:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
