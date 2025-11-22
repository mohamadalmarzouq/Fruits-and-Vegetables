import prisma from '../config/database.js';

export const getCatalog = async (req, res, next) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

// Get public vendor products for homepage (only active products from approved vendors)
export const getPublicVendorProducts = async (req, res, next) => {
  try {
    const vendorProducts = await prisma.vendorProduct.findMany({
      where: {
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
            vendorStatus: true
          }
        }
      },
      orderBy: {
        price: 'asc'
      }
    });

    res.json({ products: vendorProducts });
  } catch (error) {
    next(error);
  }
};

