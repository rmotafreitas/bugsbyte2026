import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";

// Simple password hashing (good enough for hackathon)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export const authRoutes = async (app: FastifyInstance) => {
  // ===== REGISTER =====
  app.post("/auth/register", async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(4),
      username: z.string().min(2),
    });

    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password, username } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return reply
        .status(409)
        .send({ error: `User with this ${field} already exists` });
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashPassword(password),
      },
    });

    const token = request.jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    reply.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: false,
    });

    return reply.status(201).send({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        dateOfCreation: user.dateOfCreation,
      },
    });
  });

  // ===== LOGIN =====
  app.post("/auth/login", async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== hashPassword(password)) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const token = request.jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    reply.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: false,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        dateOfCreation: user.dateOfCreation,
      },
    });
  });
};