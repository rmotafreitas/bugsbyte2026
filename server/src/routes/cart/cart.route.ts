import { FastifyInstance } from "fastify";
import { cartService } from "../../services/cart.services";

// Define Types for Request Bodies
interface AddToCartBody {
  productId: string;
  quantity?: number;
}

interface UpdateCartBody {
  quantity: number;
}

export const cartRoutes = async (app: FastifyInstance) => {
  // GET /cart - Fetch user's cart
  app.get("/cart",
     {
      preHandler: [app.authenticate],
    },
     async (request, reply) => {
    try {
        // Assuming you have an authentication middleware populating request.user
        console.log(request.cookies);
        console.log(request.headers.authorization);
        console.log(request.user);
        const userId = request.user?.id; 
        if(!userId) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const cart = await cartService.getCart(userId);
        return reply.send(cart);
    } catch (error) {
        await cartService.createCart(request.user?.id || ""); // Create cart if not exists 
        const cart = await cartService.getCart(request.user?.id || "");
        return reply.send(cart);
        app.log.error(error);
        return reply.status(500).send({ error: "Failed to fetch cart" });
    }
  });

  // POST /cart - Add item to cart
  app.post<{ Body: AddToCartBody }>("/cart",
     {
      preHandler: [app.authenticate],
    }, async (request, reply) => {
    try {
        const userId = request.user?.id;
        if(!userId) return reply.status(401).send({ error: "Unauthorized" });

        const { productId, quantity } = request.body;

        if (!productId) {
            return reply.status(400).send({ error: "Product ID is required" });
        }

        const item = await cartService.addToCart(userId, productId, quantity || 1);
        return reply.status(201).send(item);
    } catch (error: any) {
        if (error.message === "Product not found") {
            return reply.status(404).send({ error: "Product not found" });
        }
        app.log.error(error);
        return reply.status(500).send({ error: "Failed to add to cart" });
    }
  });

  // PATCH /cart/:id - Update quantity
  app.patch<{ Params: { id: string }, Body: UpdateCartBody }>("/cart/:id",
  { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
        const userId = request.user?.id;
        if(!userId) return reply.status(401).send({ error: "Unauthorized" });

        const { quantity } = request.body;
        const cartItemId = request.params.id;

        const updatedItem = await cartService.updateQuantity(userId, cartItemId, quantity);
        return reply.send(updatedItem);
    } catch (error) {
        return reply.status(400).send({ error: "Could not update item" });
    }
  });

  // DELETE /cart/:id - Remove single item
  app.delete<{ Params: { id: string } }>("/cart/:id",
  { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
        const userId = request.user?.id;
        if(!userId) return reply.status(401).send({ error: "Unauthorized" });

        const cartItemId = request.params.id;

        await cartService.removeFromCart(userId, cartItemId);
        return reply.send({ message: "Item removed" });
    } catch (error) {
        return reply.status(400).send({ error: "Could not remove item" });
    }
  });
  
  // DELETE /cart - Clear entire cart
  app.delete("/cart",
  { preHandler: [app.authenticate] }, async (request, reply) => {
      try {
        const userId = request.user?.id;
        if(!userId) return reply.status(401).send({ error: "Unauthorized" });

        await cartService.clearCart(userId);
        return reply.send({ message: "Cart cleared" });
      } catch (error) {
          return reply.status(500).send({ error: "Could not clear cart" });
      }
  });
};