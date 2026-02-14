import path from "path";
import { fileURLToPath } from "url";
import { fastifyCors } from "@fastify/cors";
import fastifystatic from "@fastify/static";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import "dotenv/config";
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { authRoutes } from "./routes/auth/auth";
import { meUserRoute } from "./routes/auth/me";
import { updateUserRoute } from "./routes/auth/update";
import { logoutUserRoute } from "./routes/auth/logout";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = process.env.HOST || "0.0.0.0";

const app = fastify();

// CORS
app.register(fastifyCors, {
  origin: "*",
  credentials: true,
});

// JWT
app.register(fjwt, { secret: process.env.JWT_SECRET || "supersecret" });

app.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token =
      req.cookies.access_token || req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return reply.status(401).send({ message: "Authentication required" });
    }

    try {
      const decoded = req.jwt.verify<FastifyJWT["user"]>(token);
      req.user = decoded;
    } catch (error) {
      return reply.status(401).send({ message: "Invalid or expired token" });
    }
  },
);

app.addHook("preHandler", (req, _res, next) => {
  req.jwt = app.jwt;
  return next();
});

// Cookies
app.register(fCookie, {
  secret: process.env.JWT_SECRET_COOKIE || "cookie-secret",
  hook: "preHandler",
});

// ===== ROUTES =====

// Ping / Hello World
app.get("/ping", async (_request, _reply) => {
  return {
    message: "pong",
    status: "alive",
    timestamp: new Date().toISOString(),
  };
});

// Secure route (requires auth)
app.get(
  "/secure",
  { preHandler: [app.authenticate] },
  async (request, _reply) => {
    return {
      message: "You have access to this secure route!",
      user: request.user,
      timestamp: new Date().toISOString(),
    };
  },
);

// Auth routes
app.register(authRoutes);
app.register(meUserRoute);
app.register(updateUserRoute);
app.register(logoutUserRoute);

// Static files
app.register(fastifystatic, {
  root: path.join(__dirname, "..", "uploads"),
  prefix: "/uploads/",
});

// Start
app
  .listen({
    host,
    port: Number(process.env.PORT) || 3000,
  })
  .then((address) => {
    console.log(`Spread Hunters API listening on ${address}`);
    console.log(`   GET  ${address}/ping`);
    console.log(`   POST ${address}/auth/register`);
    console.log(`   POST ${address}/auth/login`);
    console.log(`   GET  ${address}/auth/me`);
    console.log(`   GET  ${address}/secure`);
  });
