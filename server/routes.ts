import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertDomainSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Domains CRUD
  app.get("/api/domains", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const domains = await storage.getDomains();
    res.json(domains);
  });

  app.post("/api/domains", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertDomainSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const domain = await storage.createDomain(result.data);
    res.status(201).json(domain);
  });

  app.patch("/api/domains/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const domain = await storage.getDomain(id);
    if (!domain) return res.status(404).send("Domain not found");

    const updates = req.body;
    const updatedDomain = await storage.updateDomain(id, updates);
    res.json(updatedDomain);
  });

  app.delete("/api/domains/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const domain = await storage.getDomain(id);
    if (!domain) return res.status(404).send("Domain not found");

    await storage.deleteDomain(id);
    res.sendStatus(204);
  });

  // Redirect endpoint
  app.get("/api/redirect", async (_req, res) => {
    const domain = await storage.getRandomEnabledDomain();
    if (!domain) {
      return res.status(404).send("No enabled domains found");
    }
    res.json({ url: domain.url });
  });

  const httpServer = createServer(app);
  return httpServer;
}
