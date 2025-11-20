import prisma from '../config/database.js';
import path from 'path';

export const createProduct = async (req, res, next) => {
  try {
    const { productId, unit, pricePerUnit, origin, quantity } = req.body;
    const vendorId = req.user.userId;

    if (!productId || !unit || !pricePerUnit || !origin) {
      return res.status(400).json({ 
        error: 'Product ID, unit, price per unit, and origin are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    // Verify product exists in catalog
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found in catalog' });
    }

    // Verify vendor is approved
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId }
    });

    if (vendor.role !== 'vendor' || vendor.vendorStatus !== 'approved') {
      return res.status(403).json({ error: 'Vendor account not approved' });
    }

    // Create image URL (relative path)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Set default quantity if not provided (for stock tracking)
    // We use a large number to indicate "available" - vendors can update this later
    const stockQuantity = quantity ? parseFloat(quantity) : (unit === 'kg' ? 1000 : 1000000);

    // Create vendor product
    // Note: We store pricePerUnit in the price field, and quantity for stock tracking
    const vendorProduct = await prisma.vendorProduct.create({
      data: {
        vendorId,
        productId,
        quantity: stockQuantity, // Stock quantity (hidden from form, but needed for availability)
        unit,
        price: parseFloat(pricePerUnit), // This is now price per unit
        origin,
        imageUrl
      },
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

    res.status(201).json({
      message: 'Product uploaded successfully',
      product: vendorProduct
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProducts = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { active } = req.query;

    const where = { vendorId };
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const products = await prisma.vendorProduct.findMany({
      where,
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
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.userId;

    const product = await prisma.vendorProduct.findFirst({
      where: {
        id,
        vendorId
      },
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

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.userId;
    const { unit, pricePerUnit, origin, isActive, quantity } = req.body;

    // Verify product belongs to vendor
    const existingProduct = await prisma.vendorProduct.findFirst({
      where: {
        id,
        vendorId
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Prepare update data
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (pricePerUnit !== undefined) updateData.price = parseFloat(pricePerUnit); // Store as price per unit
    if (origin !== undefined) updateData.origin = origin;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    // Handle image update if provided
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await prisma.vendorProduct.update({
      where: { id },
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
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.userId;

    // Verify product belongs to vendor
    const product = await prisma.vendorProduct.findFirst({
      where: {
        id,
        vendorId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete (set isActive to false)
    await prisma.vendorProduct.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

