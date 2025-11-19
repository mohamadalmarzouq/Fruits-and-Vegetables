import prisma from '../config/database.js';

// Get all orders
export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: {
          select: {
            id: true,
            email: true
          }
        },
        items: {
          include: {
            vendorProduct: {
              include: {
                product: {
                  select: {
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
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            email: true
          }
        },
        items: {
          include: {
            vendorProduct: {
              include: {
                product: {
                  select: {
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
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

// Get commission summary
export const getCommissionSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalCommission, orderCount, averageOrder] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: {
          platformCommission: true
        }
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _avg: {
          platformCommission: true
        }
      })
    ]);

    res.json({
      summary: {
        totalCommission: totalCommission._sum.platformCommission || 0,
        orderCount,
        averageCommission: averageOrder._avg.platformCommission || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

