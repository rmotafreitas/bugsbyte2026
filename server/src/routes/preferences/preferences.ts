


// export const preferencesRoute = async (app: FastifyInstance) => {
//   app.get("/preferences", async (request, reply) => {
//     try {
//       const user_id = request.query.user_id as string;
//       if (!user_id) {
//         return reply.status(400).send({ error: "user_id query parameter is required" });
//       }

//       const preferences = await prisma.preference.findUnique({
//         where: { userId: user_id },
//       })