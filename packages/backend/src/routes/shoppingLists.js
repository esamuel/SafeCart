const express = require('express')
const router = express.Router()
const ShoppingList = require('../models/ShoppingList')

// Get shopping lists for user
router.get('/user/:userId', async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
    res.json(lists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single shopping list
router.get('/:listId', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.listId)
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' })
    }
    res.json(list)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create shopping list
router.post('/', async (req, res) => {
  try {
    const { userId, name, description } = req.body
    const list = new ShoppingList({
      userId,
      name: name || 'New Shopping List',
      description,
      items: [],
    })
    await list.save()
    res.status(201).json(list)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Add item to list
router.post('/:listId/items', async (req, res) => {
  try {
    const { name, quantity, unit, productId } = req.body
    const list = await ShoppingList.findById(req.params.listId)
    
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' })
    }

    const item = {
      productId,
      name,
      quantity: quantity || 1,
      unit: unit || 'unit',
      checked: false,
      addedAt: new Date(),
    }

    list.items.push(item)
    list.updatedAt = new Date()
    await list.save()

    res.status(201).json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update item in list (toggle checked, update quantity)
router.put('/:listId/items/:itemIndex', async (req, res) => {
  try {
    const { checked, quantity } = req.body
    const list = await ShoppingList.findById(req.params.listId)
    
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' })
    }

    const itemIndex = parseInt(req.params.itemIndex)
    if (itemIndex < 0 || itemIndex >= list.items.length) {
      return res.status(400).json({ error: 'Invalid item index' })
    }

    if (checked !== undefined) list.items[itemIndex].checked = checked
    if (quantity !== undefined) list.items[itemIndex].quantity = quantity

    list.updatedAt = new Date()
    await list.save()

    res.json(list.items[itemIndex])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete item from list
router.delete('/:listId/items/:itemIndex', async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.listId)
    
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' })
    }

    const itemIndex = parseInt(req.params.itemIndex)
    if (itemIndex < 0 || itemIndex >= list.items.length) {
      return res.status(400).json({ error: 'Invalid item index' })
    }

    list.items.splice(itemIndex, 1)
    list.updatedAt = new Date()
    await list.save()

    res.json({ message: 'Item deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete shopping list
router.delete('/:listId', async (req, res) => {
  try {
    await ShoppingList.findByIdAndDelete(req.params.listId)
    res.json({ message: 'Shopping list deleted' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
