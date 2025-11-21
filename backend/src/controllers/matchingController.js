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
    // Show ALL origins for the product, not filtered by origin preference
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

    // Note: Origin preference is saved but does NOT filter the available options
    // Buyers can see all origins and choose based on price and preference

    // Filter by quantity availability (vendor must have enough)
    vendorProducts = vendorProducts.filter(vp =>
      areUnitsCompatible(item.unit, vp.unit, item.quantity, vp.quantity)
    );

    // Calculate total price based on price per unit
    // vp.price is now stored as price per unit (in the vendor's unit)
    const productsWithPricePerUnit = vendorProducts.map(vp => {
      const itemGrams = convertToGrams(item.quantity, item.unit);
      const vpUnitGrams = vp.unit === 'kg' ? 1000 : 1;
      
      // Price per unit is stored in vp.price (per vendor's unit)
      // Convert to price per gram
      const pricePerGram = parseFloat(vp.price) / vpUnitGrams;
      
      // Calculate total price for buyer's quantity
      const totalPrice = pricePerGram * itemGrams;

      return {
        ...vp,
        pricePerUnit: parseFloat(vp.price), // Price per vendor's unit
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

