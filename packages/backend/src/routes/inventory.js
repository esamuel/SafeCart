const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');
const Product = require('../models/Product');
const ShoppingList = require('../models/ShoppingList');

/**
 * POST /api/inventory
 * Add item to inventory
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      productId,
      name,
      barcode,
      category,
      brand,
      quantity,
      unit,
      location,
      expirationDate,
      minThreshold,
      autoAddToList,
      allergens,
      nutritionInfo,
      notes
    } = req.body;

    if (!userId || !name || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If productId provided, fetch product details
    let productData = {};
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productData = {
          barcode: product.barcode,
          category: product.category,
          brand: product.brand,
          allergens: product.allergens?.contains || [],
          nutritionInfo: product.nutrition
        };
      }
    }

    // Create inventory item
    const item = new InventoryItem({
      userId,
      productId: productId || null,
      name,
      barcode: barcode || productData.barcode,
      category: category || productData.category || 'Other',
      brand: brand || productData.brand,
      quantity,
      unit: unit || 'pieces',
      location: location || 'pantry',
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      minThreshold: minThreshold || 1,
      autoAddToList: autoAddToList || false,
      allergens: allergens || productData.allergens || [],
      nutritionInfo: nutritionInfo || productData.nutritionInfo || {},
      notes: notes || ''
    });

    await item.save();

    res.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:userId
 * Get user's inventory with optional filters
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { location, category, status, search } = req.query;

    // Build query
    let query = { userId };

    if (location && location !== 'all') {
      query.location = location;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status) {
      switch (status) {
        case 'expiring':
          query.isExpiring = true;
          break;
        case 'expired':
          query.isExpired = true;
          break;
        case 'low':
          query.isLow = true;
          break;
      }
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Fetch items
    const items = await InventoryItem.find(query).sort({ addedAt: -1 });

    // Get stats
    const stats = await InventoryItem.getStats(userId);

    res.json({
      items,
      stats,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:userId/:itemId
 * Get single item details
 */
router.get('/:userId/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await InventoryItem.findById(itemId).populate('productId');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });

  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/inventory/:itemId
 * Update inventory item
 */
router.put('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;

    const item = await InventoryItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== '_id' && key !== 'userId') {
        item[key] = updates[key];
      }
    });

    await item.save();

    res.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/inventory/:itemId
 * Remove item from inventory
 */
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    const item = await InventoryItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Verify ownership
    if (item.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await InventoryItem.deleteOne({ _id: itemId });

    res.json({
      success: true,
      message: 'Item removed from inventory'
    });

  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/inventory/batch
 * Add multiple items at once
 */
router.post('/batch', async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid batch data' });
    }

    const createdItems = [];

    for (const itemData of items) {
      const item = new InventoryItem({
        userId,
        ...itemData
      });
      await item.save();
      createdItems.push(item);
    }

    res.json({
      success: true,
      added: createdItems.length,
      items: createdItems
    });

  } catch (error) {
    console.error('Error batch adding items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:userId/expiring
 * Get items expiring soon
 */
router.get('/:userId/expiring', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 3 } = req.query;

    const items = await InventoryItem.getExpiring(userId, parseInt(days));

    res.json({
      items,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:userId/expired
 * Get expired items
 */
router.get('/:userId/expired', async (req, res) => {
  try {
    const { userId } = req.params;

    const items = await InventoryItem.getExpired(userId);

    res.json({
      items,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching expired items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:userId/low-stock
 * Get low stock items
 */
router.get('/:userId/low-stock', async (req, res) => {
  try {
    const { userId } = req.params;

    const items = await InventoryItem.getLowStock(userId);

    res.json({
      items,
      count: items.length
    });

  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/inventory/:userId/restock-list
 * Generate shopping list from low stock items
 */
router.post('/:userId/restock-list', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get low stock items that should be restocked
    const lowStockItems = await InventoryItem.find({
      userId,
      isLow: true,
      isExpired: false,
      autoAddToList: true
    });

    if (lowStockItems.length === 0) {
      return res.json({
        success: true,
        message: 'No items need restocking',
        shoppingList: null
      });
    }

    // Create shopping list
    const listName = `Restock - ${new Date().toLocaleDateString()}`;

    const shoppingList = new ShoppingList({
      userId,
      name: listName,
      items: lowStockItems.map(item => ({
        name: item.name,
        quantity: Math.max(1, item.minThreshold - item.quantity + 1),
        unit: item.unit,
        category: item.category,
        checked: false,
        productInfo: {
          productId: item.productId,
          barcode: item.barcode
        }
      })),
      category: 'Restock'
    });

    await shoppingList.save();

    res.json({
      success: true,
      shoppingList,
      itemsAdded: lowStockItems.length
    });

  } catch (error) {
    console.error('Error generating restock list:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/:userId/stats
 * Get inventory statistics
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await InventoryItem.getStats(userId);

    res.json({ stats });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/inventory/scan
 * Scan barcode and add to inventory
 */
router.post('/scan', async (req, res) => {
  try {
    const { userId, barcode, quantity, location } = req.body;

    if (!userId || !barcode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find product by barcode
    const product = await Product.findOne({ barcode });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create inventory item
    const item = new InventoryItem({
      userId,
      productId: product._id,
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      quantity: quantity || 1,
      unit: 'pieces',
      location: location || 'pantry',
      allergens: product.allergens?.contains || [],
      nutritionInfo: product.nutrition || {}
    });

    await item.save();

    res.json({
      success: true,
      item,
      product
    });

  } catch (error) {
    console.error('Error scanning item:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
