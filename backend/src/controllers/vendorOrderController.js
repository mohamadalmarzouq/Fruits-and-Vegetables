import prisma from '../config/database.js';

// Get all orders for a vendor (only their items)
export const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // Get all order items that belong to this vendor's products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        vendorProduct: {
          vendorId
        }
      },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            subtotal: true,
            grandTotal: true
          }
        },
        vendorProduct: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group order items by order
    const ordersMap = new Map();
    
    orderItems.forEach(item => {
      const orderId = item.orderId;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderId: orderId,
          orderDate: item.order.createdAt,
          items: [],
          totalAmount: 0
        });
      }
      
      const order = ordersMap.get(orderId);
      order.items.push({
        id: item.id,
        product: item.vendorProduct.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        status: item.status,
        origin: item.vendorProduct.origin,
        imageUrl: item.vendorProduct.imageUrl
      });
      order.totalAmount += parseFloat(item.totalPrice);
    });

    // Convert map to array
    const orders = Array.from(ordersMap.values());

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

// Update order item status
export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const vendorId = req.user.userId;

    // Validate status
    if (!['pending', 'preparing', 'ready', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify the order item belongs to this vendor
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: itemId,
        vendorProduct: {
          vendorId
        }
      }
    });

    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    // Update status
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        order: {
          select: {
            id: true
          }
        },
        vendorProduct: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Order status updated successfully',
      orderItem: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

