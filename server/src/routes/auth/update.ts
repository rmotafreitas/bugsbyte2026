import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";

export const updateUserRoute = async (app: FastifyInstance) => {
  app.put(
    "/auth/me",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      const bodySchema = z.object({
        username: z.string().min(2).optional(),
        email: z.string().email().optional(),
      });

      const parsed = bodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: request.user.id,
        },
        data: parsed.data,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          dateOfCreation: true,
        },
      });

      return reply.send(updatedUser);
    },
  );
};
