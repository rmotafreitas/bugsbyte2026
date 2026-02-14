import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";

import path from "node:path";
import fs from "node:fs";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";

const pump = promisify(pipeline);

export const uploadExampleRoute = async (app: FastifyInstance) => {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_556 * 25, // 25MB
    },
  });
  app.post("/screenshots", async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const extension = path.extname(data.filename);

    if (extension !== ".png" && extension !== ".jpg") {
      return reply
        .status(400)
        .send({ error: "Invalid file type, only (.png, .jpg)" });
    }

    const fileBaseName = "screenshot";
    const filename = `${fileBaseName}-${randomUUID()}${extension}`;

    const uploadDir = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      filename,
    );

    await pump(data.file, fs.createWriteStream(uploadDir));

    return reply.send({ filename });
  });
};
