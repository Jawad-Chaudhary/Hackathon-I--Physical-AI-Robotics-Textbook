/**
 * Better-Auth configuration
 * Handles authentication with custom user profile fields
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import * as schema from "./schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Simplified for hackathon
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      pythonKnowledge: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      hasNvidiaGpu: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      experienceLevel: {
        type: "string",
        required: false,
        defaultValue: "beginner",
        input: true,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "https://hackathon-i-physical-ai-robotics-te.vercel.app",
    "https://clever-respect-production-5202.up.railway.app"
  ],
});

// Export types for use in other files
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
