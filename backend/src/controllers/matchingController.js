import prisma from '../config/database.js';

// Helper function to convert units to a common base (grams)
const convertToGrams = (quantity, unit) => {
  if (unit === 'kg') {
    return quantity * 1000;
  }
  return quantity; // already in grams
};

// Helper function to check if units are compatible
const areUnitsCompatible = (userUnit, vendorUnit, userQuantity, vendorQuantity) => {
  const userGrams = convertToGrams(userQuantity, userUnit);
  const vendorGrams = convertToGrams(vendorQuantity, vendorUnit);
  
  // Vendor must have at least the quantity user needs
  return vendorGrams >= userGrams;
};

// Get matching vendor products for a shopping list item
export const getMatchingProducts = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Get shopping list item
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        shoppingList: {
          select: {
            buyerId: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    // Find all active vendor products matching the product
    let vendorProducts = await prisma.vendorProduct.findMany({
      where: {
        productId: item.productId,
        isActive: true,
        vendor: {
          vendorStatus: 'approved'
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        vendor: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Filter by origin preference if specified
    if (item.originPreference) {
      vendorProducts = vendorProducts.filter(
        vp => vp.origin.toLowerCase() === item.originPreference.toLowerCase()
      );
    }

    // Filter by quantity availability (vendor must have enough)
    vendorProducts = vendorProducts.filter(vp =>
      areUnitsCompatible(item.unit, vp.unit, item.quantity, vp.quantity)
    );

    // Calculate price per unit for comparison
    const productsWithPricePerUnit = vendorProducts.map(vp => {
      const vpGrams = convertToGrams(vp.quantity, vp.unit);
      const itemGrams = convertToGrams(item.quantity, item.unit);
      const pricePerGram = parseFloat(vp.price) / vpGrams;
      const totalPrice = pricePerGram * itemGrams;

      return {
        ...vp,
        pricePerGram,
        totalPrice,
        availableQuantity: vp.quantity,
        availableUnit: vp.unit
      };
    });

    // Sort by price (lowest first)
    productsWithPricePerUnit.sort((a, b) => a.totalPrice - b.totalPrice);

    // Deduplication: Group by product, origin, quantity, and price
    const deduplicated = [];
    const seen = new Set();

    for (const product of productsWithPricePerUnit) {
      const key = `${product.productId}-${product.origin}-${product.quantity}-${product.price}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push({
          ...product,
          vendorCount: productsWithPricePerUnit.filter(
            p => `${p.productId}-${p.origin}-${p.quantity}-${p.price}` === key
          ).length
        });
      }
    }

    // Mark best price (first one after sorting and deduplication)
    if (deduplicated.length > 0) {
      deduplicated[0].isBestPrice = true;
    }

    res.json({
      item: {
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unit: item.unit,
        originPreference: item.originPreference
      },
      options: deduplicated
    });
  } catch (error) {
    next(error);
  }
};

// Save user's selection for a shopping list item
export const saveSelection = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { vendorProductId } = req.body;

    // Get shopping list item
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: {
        shoppingList: {
          select: {
            id: true,
            buyerId: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    // Verify vendor product exists and is active
    const vendorProduct = await prisma.vendorProduct.findFirst({
      where: {
        id: vendorProductId,
        isActive: true
      }
    });

    if (!vendorProduct) {
      return res.status(404).json({ error: 'Vendor product not found or inactive' });
    }

    // Remove existing selection for this item if any
    await prisma.shoppingListSelection.deleteMany({
      where: {
        shoppingListItemId: itemId
      }
    });

    // Create new selection
    const selection = await prisma.shoppingListSelection.create({
      data: {
        shoppingListId: item.shoppingList.id,
        shoppingListItemId: itemId,
        vendorProductId
      },
      include: {
        vendorProduct: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      message: 'Selection saved',
      selection
    });
  } catch (error) {
    next(error);
  }
};

