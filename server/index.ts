import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleLogout, handleGetProfile } from "./routes/auth";
import {
  handleGetCrimes,
  handleGetCrime,
  handleCreateCrime,
  handleUpdateCrime,
  handleDeleteCrime
} from "./routes/crimes";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/profile", handleGetProfile);

  // Crime management routes
  app.get("/api/crimes", handleGetCrimes);
  app.get("/api/crimes/:id", handleGetCrime);
  app.post("/api/crimes", handleCreateCrime);
  app.put("/api/crimes/:id", handleUpdateCrime);
  app.delete("/api/crimes/:id", handleDeleteCrime);

  return app;
}
