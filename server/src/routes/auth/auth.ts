import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import { fastifyMultipart } from "@fastify/multipart";
import { processImage } from "../../lib/image";

// Simple password hashing (good enough for hackathon)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function parseUserImages(
  imagesStr: string,
): Array<{ imageUrl: string; width: number; height: number }> {
  try {
    return JSON.parse(imagesStr || "[]");
  } catch {
    return [];
  }
}

export const authRoutes = async (app: FastifyInstance) => {
  // Register multipart support for this scope
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 10, // 10MB per file
      files: 6,
    },
    attachFieldsToBody: false,
  });

  // ===== REGISTER (multipart) =====
  app.post("/auth/register", async (request, reply) => {
    const parts = request.parts();
    const fields: Record<string, string> = {};
    const uploadedImages: Array<{
      imageUrl: string;
      width: number;
      height: number;
    }> = [];

    for await (const part of parts) {
      if (part.type === "file") {
        // Collect file buffer, then crop/compress with sharp
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const processed = await processImage(buffer);
        uploadedImages.push(processed);
      } else {
        // It's a regular field
        fields[part.fieldname] = (part as any).value as string;
      }
    }

    // Parse preferences from JSON string
    let preferences: string[] = [];
    try {
      preferences = JSON.parse(fields.preferences || "[]");
    } catch {
      preferences = [];
    }

    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(4),
      username: z.string().min(2),
      name: z.string().min(1),
      gender: z.string().min(1),
      dateOfBirth: z.string().min(1),
    });

    const parsed = bodySchema.safeParse(fields);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    if (preferences.length < 1) {
      return reply.status(400).send({
        error: "At least 1 style preference is required",
      });
    }

    const { email, password, username, name, gender, dateOfBirth } =
      parsed.data;

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
        name,
        gender,
        dateOfBirth,
        preferences: JSON.stringify(preferences),
        images: JSON.stringify(uploadedImages),
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
        name: user.name,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        preferences: JSON.parse(user.preferences || "[]"),
        images: parseUserImages(user.images),
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
        name: user.name,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        preferences: JSON.parse(user.preferences || "[]"),
        images: parseUserImages(user.images),
        role: user.role,
        dateOfCreation: user.dateOfCreation,
      },
    });
  });
};
