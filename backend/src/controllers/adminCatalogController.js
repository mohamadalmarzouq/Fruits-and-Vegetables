import prisma from '../config/database.js';

// Get all products in catalog
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
      },
      include: {
        _count: {
          select: {
            vendorProducts: true
          }
        }
      }
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// Create new product in catalog
export const createProduct = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(400).json({ error: 'Product already exists in catalog' });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category
      }
    });

    res.status(201).json({
      message: 'Product added to catalog',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Update product in catalog
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (category) updateData.category = category;

    // Check for duplicate name if changing name
    if (name && name.trim() !== product.name) {
      const existing = await prisma.product.findUnique({
        where: { name: name.trim() }
      });
      if (existing) {
        return res.status(400).json({ error: 'Product name already exists' });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Product updated',
      product: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete product from catalog
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            vendorProducts: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is being used by vendors
    if (product._count.vendorProducts > 0) {
      return res.status(400).json({
        error: `Cannot delete product. It is being used by ${product._count.vendorProducts} vendor(s)`
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted from catalog' });
  } catch (error) {
    next(error);
  }
};

