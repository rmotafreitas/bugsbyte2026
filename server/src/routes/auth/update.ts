import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { fastifyMultipart } from "@fastify/multipart";
import { processImage, deleteImages } from "../../lib/image";

function parseUserImages(
  imagesStr: string,
): Array<{ imageUrl: string; width: number; height: number }> {
  try {
    return JSON.parse(imagesStr || "[]");
  } catch {
    return [];
  }
}

export const updateUserRoute = async (app: FastifyInstance) => {
  // Register multipart support for this scope
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 10, // 10MB per file
      files: 6,
    },
    attachFieldsToBody: false,
  });

  app.put(
    "/auth/me",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Parse multipart data
      const parts = request.parts();
      const fields: Record<string, string> = {};
      const newUploadedImages: Array<{
        imageUrl: string;
        width: number;
        height: number;
      }> = [];
      let hasNewPhotos = false;

      for await (const part of parts) {
        if (part.type === "file") {
          hasNewPhotos = true;
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          const processed = await processImage(buffer);
          newUploadedImages.push(processed);
        } else {
          fields[part.fieldname] = (part as any).value as string;
        }
      }

      // Validate fields
      const bodySchema = z.object({
        name: z.string().min(1).optional(),
        gender: z.string().min(1).optional(),
        dateOfBirth: z.string().min(1).optional(),
        preferences: z.string().optional(),
      });

      const parsed = bodySchema.safeParse(fields);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const updateData: Record<string, any> = {};

      if (parsed.data.name) updateData.name = parsed.data.name;
      if (parsed.data.gender) updateData.gender = parsed.data.gender;
      if (parsed.data.dateOfBirth)
        updateData.dateOfBirth = parsed.data.dateOfBirth;

      if (parsed.data.preferences) {
        try {
          const prefs = JSON.parse(parsed.data.preferences);
          updateData.preferences = JSON.stringify(prefs);
        } catch {
          // ignore invalid JSON
        }
      }

      // If new photos uploaded, replace old ones
      if (hasNewPhotos) {
        const oldImages = parseUserImages(user.images);
        deleteImages(oldImages);
        updateData.images = JSON.stringify(newUploadedImages);
      }

      const updatedUser = await prisma.user.update({
        where: { id: request.user.id },
        data: updateData,
      });

      return reply.send({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        gender: updatedUser.gender,
        dateOfBirth: updatedUser.dateOfBirth,
        preferences: JSON.parse(updatedUser.preferences || "[]"),
        images: parseUserImages(updatedUser.images),
        role: updatedUser.role,
        dateOfCreation: updatedUser.dateOfCreation,
      });
    },
  );
};
