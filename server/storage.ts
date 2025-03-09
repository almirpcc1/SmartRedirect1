import { User, InsertUser, Domain, InsertDomain } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDomains(): Promise<Domain[]>;
  getDomain(id: number): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, domain: Partial<Domain>): Promise<Domain>;
  deleteDomain(id: number): Promise<void>;
  getRandomEnabledDomain(): Promise<Domain | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private domains: Map<number, Domain>;
  private currentUserId: number;
  private currentDomainId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.domains = new Map();
    this.currentUserId = 1;
    this.currentDomainId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }

  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const id = this.currentDomainId++;
    const newDomain: Domain = { 
      id,
      url: domain.url,
      enabled: domain.enabled ?? false
    };
    this.domains.set(id, newDomain);
    return newDomain;
  }

  async updateDomain(id: number, updates: Partial<Domain>): Promise<Domain> {
    const domain = await this.getDomain(id);
    if (!domain) throw new Error("Domain not found");

    const updatedDomain = { 
      ...domain,
      ...updates,
      enabled: updates.enabled ?? domain.enabled
    };
    this.domains.set(id, updatedDomain);
    return updatedDomain;
  }

  async deleteDomain(id: number): Promise<void> {
    this.domains.delete(id);
  }

  async getRandomEnabledDomain(): Promise<Domain | undefined> {
    const enabledDomains = Array.from(this.domains.values()).filter(
      (domain) => domain.enabled
    );
    if (enabledDomains.length === 0) return undefined;
    return enabledDomains[Math.floor(Math.random() * enabledDomains.length)];
  }
}

export const storage = new MemStorage();