import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";

import path from "node:path";
import fs from "node:fs";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";

const pump = promisify(pipeline);

export const uploadFileRoute = async (app: FastifyInstance) => {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_556 * 25, // 25MB
      files: 6,
    },
  });
  app.post("/screenshots",
    {
      preHandler: [app.authenticate],
    }, async (request, reply) => {
    // Ensure uploads dir exists
    const uploadDir = path.resolve(__dirname, "..", "..", "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 1. Fetch User
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.status(404).send({
        error: "User not found",
        details: request.user?.id,
      });
    }

    // 2. Read multipart parts (up to 6 files)
    const partsAsync = (request as any).files ? (request as any).files() : null;
    if (!partsAsync) {
      return reply.status(400).send({ error: "No files uploaded" });
    }

    const savedImages: any[] = [];
    let count = 0;
    for await (const part of partsAsync) {
      // Skip non-file parts
      if (!part || !part.file || !part.filename) continue;

      count += 1;
      if (count > 6) {
        return reply.status(400).send({ error: "Too many files. Maximum is 6." });
      }

      const extension = path.extname(part.filename) || "";
      const filename = `screenshot-${randomUUID()}${extension}`;
      const uploadPath = path.join(uploadDir, filename);

      // Save file to disk
      await pump(part.file, fs.createWriteStream(uploadPath));

      // Save to DB (use `userId` to match schema)
      const created = await prisma.image.create({
        data: {
          user_id: user.id,
          url: filename,
        },
      });

      savedImages.push(created);
    }

    if (savedImages.length === 0) {
      return reply.status(400).send({ error: "No valid files uploaded" });
    }

    return reply.status(201).send({ message: "Upload successful", images: savedImages });
  });
};
