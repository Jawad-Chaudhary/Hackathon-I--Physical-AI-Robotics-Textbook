/**
 * Better-Auth Express Server
 * Handles authentication for Smart Textbook Platform
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { db } from "./db";
import { session, user } from "./schema";
import { eq } from "drizzle-orm";

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8000"],
    credentials: true,
  })
);

// Parse JSON bodies for custom endpoints
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "auth-server" });
});

// Better-Auth handles all /api/auth/* routes
app.all("/api/auth/*", toNodeHandler(auth));

// Custom endpoint to get user profile via cookies
app.get("/api/user/profile", async (req, res) => {
  try {
    const authSession = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!authSession) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      id: authSession.user.id,
      email: authSession.user.email,
      name: authSession.user.name,
      pythonKnowledge: (authSession.user as any).pythonKnowledge || false,
      hasNvidiaGpu: (authSession.user as any).hasNvidiaGpu || false,
      experienceLevel: (authSession.user as any).experienceLevel || "beginner",
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Validate token endpoint for FastAPI - looks up token directly in database
app.get("/api/validate-token/:token", async (req, res) => {
  try {
    const token = req.params.token;
    
    // Look up session by token in database
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ valid: false, error: "Session not found" });
    }

    const sess = sessions[0];
    
    // Check if session is expired
    if (new Date(sess.expiresAt) < new Date()) {
      return res.status(401).json({ valid: false, error: "Session expired" });
    }

    // Get user data
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, sess.userId))
      .limit(1);

    if (!users || users.length === 0) {
      return res.status(401).json({ valid: false, error: "User not found" });
    }

    const userData = users[0];

    res.json({
      valid: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        pythonKnowledge: userData.pythonKnowledge || false,
        hasNvidiaGpu: userData.hasNvidiaGpu || false,
        experienceLevel: userData.experienceLevel || "beginner",
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ valid: false, error: "Validation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`Better-Auth endpoints: http://localhost:${PORT}/api/auth/*`);
});
