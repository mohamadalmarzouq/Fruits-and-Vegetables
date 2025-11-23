import prisma from '../config/database.js';

// Get inventory summary for all vendor products
export const getInventorySummary = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // Get all vendor products
    const vendorProducts = await prisma.vendorProduct.findMany({
      where: { vendorId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        orderItems: {
          where: {
            status: {
              in: ['pending', 'preparing', 'ready', 'completed']
            }
          },
          select: {
            quantity: true,
            status: true
          }
        }
      }
    });

    // Calculate inventory stats for each product
    const inventory = vendorProducts.map(vp => {
      // Calculate total sold (completed orders)
      const soldQuantity = vp.orderItems
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + parseFloat(item.quantity), 0);

      // Calculate pending orders (not yet completed)
      const pendingQuantity = vp.orderItems
        .filter(item => item.status !== 'completed')
        .reduce((sum, item) => sum + parseFloat(item.quantity), 0);

      // Current stock
      const currentStock = parseFloat(vp.quantity);

      // Initial stock (if set, otherwise use current stock as initial)
      const initialStock = vp.initialStock ? parseFloat(vp.initialStock) : currentStock + soldQuantity;

      // Ending inventory (current stock - pending orders)
      const endingInventory = currentStock - pendingQuantity;

      return {
        id: vp.id,
        product: vp.product,
        origin: vp.origin,
        unit: vp.unit,
        initialStock,
        currentStock,
        soldQuantity,
        pendingQuantity,
        endingInventory,
        isActive: vp.isActive
      };
    });

    res.json({ inventory });
  } catch (error) {
    next(error);
  }
};

// Update product stock
export const updateProductStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, initialStock } = req.body;
    const vendorId = req.user.userId;

    // Verify product belongs to vendor
    const vendorProduct = await prisma.vendorProduct.findFirst({
      where: {
        id: productId,
        vendorId
      }
    });

    if (!vendorProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update stock
    const updateData = {
      quantity: parseFloat(quantity)
    };

    // Update initial stock if provided (only set once or when explicitly updated)
    if (initialStock !== undefined) {
      updateData.initialStock = parseFloat(initialStock);
    } else if (!vendorProduct.initialStock) {
      // If initial stock not set, set it to current quantity
      updateData.initialStock = parseFloat(quantity);
    }

    const updatedProduct = await prisma.vendorProduct.update({
      where: { id: productId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    res.json({
      message: 'Stock updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

