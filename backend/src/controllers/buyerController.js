import prisma from '../config/database.js';

// Create shopping list
export const createShoppingList = async (req, res, next) => {
  try {
    const buyerId = req.user.userId;

    const shoppingList = await prisma.shoppingList.create({
      data: {
        buyerId,
        status: 'draft'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Shopping list created',
      shoppingList
    });
  } catch (error) {
    next(error);
  }
};

// Get user's shopping lists
export const getShoppingLists = async (req, res, next) => {
  try {
    const buyerId = req.user.userId;

    const shoppingLists = await prisma.shoppingList.findMany({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ shoppingLists });
  } catch (error) {
    next(error);
  }
};

// Get shopping list by ID
export const getShoppingList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        buyerId
      },
      include: {
        items: {
          include: {
            product: true,
            selections: {
              include: {
                vendorProduct: {
                  include: {
                    product: true,
                    vendor: {
                      select: {
                        id: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json({ shoppingList });
  } catch (error) {
    next(error);
  }
};

// Add item to shopping list
export const addItemToShoppingList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, quantity, unit, originPreference } = req.body;
    const buyerId = req.user.userId;

    // Verify shopping list belongs to user
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        buyerId
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found in catalog' });
    }

    const item = await prisma.shoppingListItem.create({
      data: {
        shoppingListId: id,
        productId,
        quantity: parseFloat(quantity),
        unit,
        originPreference: originPreference || null
      },
      include: {
        product: true
      }
    });

    res.status(201).json({
      message: 'Item added to shopping list',
      item
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from shopping list
export const removeItemFromShoppingList = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const buyerId = req.user.userId;

    // Verify shopping list belongs to user
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        buyerId
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    // Verify item belongs to shopping list
    const item = await prisma.shoppingListItem.findFirst({
      where: {
        id: itemId,
        shoppingListId: id
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete selections first (if cascade isn't working yet)
    await prisma.shoppingListSelection.deleteMany({
      where: { shoppingListItemId: itemId }
    });

    // Then delete the item
    await prisma.shoppingListItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item removed from shopping list' });
  } catch (error) {
    next(error);
  }
};

// Delete shopping list
export const deleteShoppingList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        buyerId
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    // Delete all related records first (in case cascade isn't working yet)
    // 1. Delete all selections
    await prisma.shoppingListSelection.deleteMany({
      where: { shoppingListId: id }
    });

    // 2. Delete all items
    await prisma.shoppingListItem.deleteMany({
      where: { shoppingListId: id }
    });

    // 3. Finally delete the shopping list
    await prisma.shoppingList.delete({
      where: { id }
    });

    res.json({ message: 'Shopping list deleted' });
  } catch (error) {
    next(error);
  }
};

