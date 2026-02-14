import { FastifyInstance } from "fastify";
import { z } from "zod";

export const createCompletionRoute = async (app: FastifyInstance) => {
  app.post("/ai/completion", async (request, reply) => {
    const bodySchema = z.object({
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    });

    const { prompt, temperature } = bodySchema.parse(request.body);
  });
};
