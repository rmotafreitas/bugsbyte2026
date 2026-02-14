import Replicate from "replicate";
import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import { prisma } from "../../lib/prisma";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface MultipartValue {
  value: string;
}

export const tryOnRoute = async (app: FastifyInstance) => {
  app.register(fastifyMultipart, {
    limits: { 
      fileSize: 1024 * 1024 * 25, // 25MB
      files: 1 // Only 1 garment image expected
    },
  });

  app.post("/try-on",
    // {
    //   preHandler: [app.authenticate],
    // },
     async (request, reply) => {
    try {
      const parts = request.files();
      
      let user_id: string | undefined;
      let garmentDescription = "upper_body";
      let category = "upper_body";
      let garmentImageUrl: string | null = null;

      // Parse multipart data
      for await (const part of parts) {
        if (part.type === 'file') {
          if (!part.mimetype?.startsWith('image/')) {
            return reply.status(400).send({ 
              error: "Invalid file type. Only images are allowed." 
            });
          }
          
          if (part.fieldname === "garment") {
            // Convert to data URL for Replicate
            const buffer = await part.toBuffer();
            garmentImageUrl = `data:${part.mimetype};base64,${buffer.toString("base64")}`;
          }
        } else {
          const field = part as unknown as MultipartValue;
          if (part.fieldname === 'user_id') user_id = field.value;
          if (part.fieldname === 'garment_description') garmentDescription = field.value;
          if (part.fieldname === 'category') category = field.value;
        }
      }

      // Validation
      if (!user_id) {
        return reply.status(400).send({ error: "user_id is required" });
      }

      if (!garmentImageUrl) {
        return reply.status(400).send({ error: "garment image is required" });
      }

      // Fetch user with their images
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        include: { images: true },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      if (user.images.length === 0) {
        return reply.status(400).send({ 
          error: "User has no images uploaded" 
        });
      }

      if (user.images.length !== 6) {
        app.log.warn(`User ${user_id} has ${user.images.length} images instead of 6`);
      }

      // Process garment on all user images (up to 6)
      const imagesToProcess = user.images.slice(0, 6);
      
      const processPromises = imagesToProcess.map(async (image, index) => {
        try {
          const result = await replicate.run(
            "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
            {
              input: {
                human_img: image.url, // Assuming url is either a URL or data URI
                garm_img: garmentImageUrl,
                garment_des: garmentDescription,
                category: category,
                steps: 30,
              }
            }
          );
          
          return { 
            success: true, 
            imageId: image.id,
            index,
            result 
          };
        } catch (error) {
          app.log.error(`Failed to process image ${image.id}:${error}`);
          return { 
            success: false, 
            imageId: image.id,
            index,
            error: error instanceof Error ? error.message : "Unknown error" 
          };
        }
      });

      const results = await Promise.all(processPromises);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length === 0) {
        return reply.status(500).send({ 
          error: "All image processing failed",
          failures: failed
        });
      }

      return reply.send({ 
        results: successful.map(r => ({
          imageId: r.imageId,
          output: r.result
        })),
        processed: successful.length,
        failed: failed.length,
        ...(failed.length > 0 && { failures: failed })
      });

    } catch (error) {
      app.log.error("Try-on route error:"+error);
      return reply.status(500).send({ 
        error: "Processing failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
};