import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

export const meUserRoute = async (app: FastifyInstance) => {
  app.get(
    "/auth/me",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          dateOfCreation: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      return reply.send(user);
    },
  );
};
