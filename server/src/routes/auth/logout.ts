import { FastifyInstance } from "fastify";

export const logoutUserRoute = async (app: FastifyInstance) => {
  app.delete(
    "/auth/me",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      reply.clearCookie("access_token");

      return reply.send({ message: "Logout successful" });
    }
  );
};
