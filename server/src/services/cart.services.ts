import { create } from "domain";
import { prisma } from "../lib/prisma"; // Adjust path to your prisma client

export const cartService = {
  // Get all items in a user's cart
  getCart: async (userId: string) => {
    const cart = await prisma.cart.findMany({
      where: { user_id: userId },
      include: {
        product: true, // Fetch product details (name, price, image)
      },
    });

    if (!cart) { 
      throw new Error("Cart not found");
    }

    return cart;
  },

  createCart: async (userId: string, productId: string, quantity: number = 1) => {
    return await prisma.cart.create({
      data: {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
      },
    });
  },

  // Add item: If it exists, increase quantity. If not, create it.
  addToCart: async (userId: string, productId: string, quantity: number = 1) => {
    // 1. Check if product exists first
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // 2. Check if item is already in cart
    const existingItem = await prisma.cart.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existingItem) {
      // 3a. Update existing quantity
      return await prisma.cart.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: { product: true },
      });
    } else {
      // 3b. Create new cart entry
      return await prisma.cart.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity: quantity,
        },
        include: { product: true },
      });
    }
  },

  // Update specific quantity (e.g. setting it to exactly 5)
  updateQuantity: async (userId: string, cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      return await prisma.cart.delete({
        where: { id: cartItemId },
      });
    }

    // Ensure the cart item belongs to the user
    const cartItem = await prisma.cart.findFirst({
        where: { id: cartItemId, user_id: userId }
    });

    if(!cartItem) throw new Error("Item not found in cart");

    return await prisma.cart.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });
  },

  // Remove item completely
  removeFromCart: async (userId: string, cartItemId: string) => {
    // Verify ownership before deleting
    const cartItem = await prisma.cart.findFirst({
        where: { id: cartItemId, user_id: userId }
    });

    if(!cartItem) throw new Error("Item not found in cart");

    return await prisma.cart.delete({
      where: { id: cartItemId },
    });
  },
  
  // Clear entire cart
  clearCart: async (userId: string) => {
    return await prisma.cart.deleteMany({
      where: { user_id: userId }
    });
  }
};