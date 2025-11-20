import prisma from '../config/database.js';

// Get checkout summary
export const getCheckoutSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    // Get shopping list with all selections
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        buyerId,
        status: 'draft'
      },
      include: {
        items: {
          include: {
            product: true,
            selections: {
              include: {
                vendorProduct: {
                  include: {
                    product: true
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

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of shoppingList.items) {
      if (item.selections.length === 0) {
        return res.status(400).json({
          error: `Please select a vendor option for ${item.product.name}`
        });
      }

      const selection = item.selections[0]; // User should have selected one
      const vendorProduct = selection.vendorProduct;

      // Calculate price for the quantity user needs
      // vendorProduct.price is now stored as price per unit (vendor's unit)
      const itemGrams = item.unit === 'kg' 
        ? parseFloat(item.quantity) * 1000 
        : parseFloat(item.quantity);
      
      // Convert vendor's price per unit to price per gram
      const vpUnitGrams = vendorProduct.unit === 'kg' ? 1000 : 1;
      const pricePerGram = parseFloat(vendorProduct.price) / vpUnitGrams;
      const itemTotal = pricePerGram * itemGrams;
      
      // Calculate unit price for display (per buyer's unit)
      const buyerUnitGrams = item.unit === 'kg' ? 1000 : 1;
      const unitPrice = pricePerGram * buyerUnitGrams;

      subtotal += itemTotal;

      orderItems.push({
        product: item.product,
        vendorProduct: {
          id: vendorProduct.id,
          origin: vendorProduct.origin,
          imageUrl: vendorProduct.imageUrl
        },
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: unitPrice,
        totalPrice: itemTotal
      });
    }

    // Calculate commission (5% of subtotal)
    const platformCommission = subtotal * 0.05;
    const grandTotal = subtotal + platformCommission;

    res.json({
      shoppingList: {
        id: shoppingList.id,
        items: orderItems
      },
      subtotal: parseFloat(subtotal.toFixed(2)),
      platformCommission: parseFloat(platformCommission.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

// Complete checkout (create order)
export const completeCheckout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    // Get checkout summary first
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id,
        buyerId,
        status: 'draft'
      },
      include: {
        items: {
          include: {
            product: true,
            selections: {
              include: {
                vendorProduct: true
              }
            }
          }
        }
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    // Verify all items have selections
    for (const item of shoppingList.items) {
      if (item.selections.length === 0) {
        return res.status(400).json({
          error: `Please select a vendor option for ${item.product.name}`
        });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of shoppingList.items) {
      const selection = item.selections[0];
      const vendorProduct = selection.vendorProduct;

      // Calculate price for the quantity user needs
      // vendorProduct.price is now stored as price per unit (vendor's unit)
      const itemGrams = item.unit === 'kg' 
        ? parseFloat(item.quantity) * 1000 
        : parseFloat(item.quantity);
      
      // Convert vendor's price per unit to price per gram
      const vpUnitGrams = vendorProduct.unit === 'kg' ? 1000 : 1;
      const pricePerGram = parseFloat(vendorProduct.price) / vpUnitGrams;
      const itemTotal = pricePerGram * itemGrams;
      
      // Calculate unit price for display (per buyer's unit)
      const buyerUnitGrams = item.unit === 'kg' ? 1000 : 1;
      const unitPrice = pricePerGram * buyerUnitGrams;

      subtotal += itemTotal;

      orderItemsData.push({
        vendorProductId: vendorProduct.id,
        quantity: parseFloat(item.quantity),
        unitPrice: unitPrice,
        totalPrice: itemTotal
      });
    }

    const platformCommission = subtotal * 0.05;
    const grandTotal = subtotal + platformCommission;

    // Create order
    const order = await prisma.order.create({
      data: {
        shoppingListId: id,
        buyerId,
        subtotal: subtotal,
        platformCommission: platformCommission,
        grandTotal: grandTotal,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
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
    });

    // Update shopping list status
    await prisma.shoppingList.update({
      where: { id },
      data: { status: 'completed' }
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        subtotal: parseFloat(order.subtotal.toFixed(2)),
        grandTotal: parseFloat(order.grandTotal.toFixed(2)),
        items: order.items.map(item => ({
          product: item.vendorProduct.product.name,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice.toFixed(2)),
          totalPrice: parseFloat(item.totalPrice.toFixed(2))
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

