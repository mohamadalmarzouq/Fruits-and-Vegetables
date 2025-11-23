import prisma from '../config/database.js';
import { analyzeProductImage } from '../services/openaiService.js';

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
        role: true,
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
        },
        _count: {
          select: {
            vendorProducts: true
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

// Refresh AI quality analysis for a vendor product
export const refreshProductAnalysis = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Get the vendor product with product name
    const vendorProduct = await prisma.vendorProduct.findUnique({
      where: { id: productId },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    if (!vendorProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Analyze the image
    let aiQualityReport = null;
    try {
      aiQualityReport = await analyzeProductImage(vendorProduct.imageUrl, vendorProduct.product.name);
    } catch (error) {
      console.error('Failed to analyze product image:', error);
      return res.status(500).json({ 
        error: 'Failed to analyze image', 
        message: error.message 
      });
    }

    // Update the product with new analysis
    const updatedProduct = await prisma.vendorProduct.update({
      where: { id: productId },
      data: { aiQualityReport },
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
      message: 'Quality analysis refreshed successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

