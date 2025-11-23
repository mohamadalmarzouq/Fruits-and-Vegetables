import prisma from '../config/database.js';

// Get all vendors (pending, approved, rejected)
export const getVendors = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = { role: 'vendor' };
    if (status) {
      where.vendorStatus = status;
    }

    const vendors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        vendorStatus: true,
        createdAt: true,
        _count: {
          select: {
            vendorProducts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ vendors });
  } catch (error) {
    next(error);
  }
};

// Get vendor details
export const getVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        vendorStatus: true,
        createdAt: true,
        vendorProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    next(error);
  }
};

// Approve vendor
export const approveVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.user.findUnique({
      where: { id }
    });

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { vendorStatus: 'approved' },
      select: {
        id: true,
        email: true,
        vendorStatus: true
      }
    });

    res.json({
      message: 'Vendor approved successfully',
      vendor: updated
    });
  } catch (error) {
    next(error);
  }
};

// Reject vendor
export const rejectVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.user.findUnique({
      where: { id }
    });

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { vendorStatus: 'rejected' },
      select: {
        id: true,
        email: true,
        vendorStatus: true
      }
    });

    res.json({
      message: 'Vendor rejected',
      vendor: updated
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalVendors,
      pendingVendors,
      approvedVendors,
      totalProducts,
      totalOrders,
      totalCommission
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'vendor' } }),
      prisma.user.count({ where: { role: 'vendor', vendorStatus: 'pending' } }),
      prisma.user.count({ where: { role: 'vendor', vendorStatus: 'approved' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          platformCommission: true
        }
      })
    ]);

    res.json({
      stats: {
        totalVendors,
        pendingVendors,
        approvedVendors,
        totalProducts,
        totalOrders,
        totalCommission: totalCommission._sum.platformCommission || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

