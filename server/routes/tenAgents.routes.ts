import { Router, Request, Response } from "express";
import { tenAgentOrchestrator } from "../services/tenAgentOrchestrator.js";
import { z } from "zod";

const router = Router();

// Validation schema for review requests
const reviewSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters"),
  query: z.string().min(5, "Query must be at least 5 characters"),
  sources: z.array(z.string()).optional().default([]),
  jurisdiction: z.string().optional().default("Global"),
  claimIds: z.array(z.string()).optional().default([]),
});

const singleAgentSchema = z.object({
  content: z.string().min(10),
  query: z.string().min(5),
  sources: z.array(z.string()).optional().default([]),
  jurisdiction: z.string().optional().default("Global"),
  claimIds: z.array(z.string()).optional().default([]),
});

/**
 * GET /api/ten-agents — List all 10 selected agents
 */
router.get("/ten-agents", (req: Request, res: Response) => {
  try {
    const agents = tenAgentOrchestrator.getSelectedAgents();
    res.json({
      total: agents.length,
      description: "10 ausgewählte Agenten aus dem 20-Agent-System (3-Ring-Architektur)",
      rings: {
        ring1_automated: agents.filter((a) => a.ring === 1),
        ring2_domain: agents.filter((a) => a.ring === 2),
        ring3_authoritative: agents.filter((a) => a.ring === 3),
      },
      agents,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list agents", message: error.message });
  }
});

/**
 * GET /api/ten-agents/:number — Get specific agent details
 */
router.get("/ten-agents/:number", (req: Request, res: Response) => {
  try {
    const num = parseInt(String(req.params.number));
    const agent = tenAgentOrchestrator.getAgentStatus(num);
    if (!agent) return res.status(404).json({ error: `Agent ${num} not in selected 10` });
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get agent", message: error.message });
  }
});

/**
 * POST /api/ten-agents/review — Run full 10-agent review pipeline
 * 
 * This is the main endpoint. It runs all 10 agents through the 3-ring pipeline:
 * - Ring 1 (Agents 1,3,5): Automated Pre-Check — ALL must pass
 * - Ring 2 (Agents 7,8,9,10,14): Domain Expert Review — Consensus-based
 * - Ring 3 (Agents 17,20): Authoritative Validation — CCO signs, Auditor can veto
 */
router.post("/ten-agents/review", async (req: Request, res: Response) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }

    const report = await tenAgentOrchestrator.runFullReview(parsed.data);

    // Set status code based on verdict
    const statusCode = report.overallVerdict === "rejected" ? 422 : 200;

    res.status(statusCode).json(report);
  } catch (error: any) {
    res.status(500).json({ error: "Review pipeline failed", message: error.message });
  }
});

/**
 * POST /api/ten-agents/review/:agentNumber — Run single agent review
 */
router.post("/ten-agents/review/:agentNumber", async (req: Request, res: Response) => {
  try {
    const agentNumber = parseInt(String(req.params.agentNumber));
    const parsed = singleAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }

    const { content, query, sources, jurisdiction, claimIds } = parsed.data;
    const result = await tenAgentOrchestrator.runSingleAgentReview(
      agentNumber,
      content,
      query,
      {
        sources: sources || [],
        jurisdiction: jurisdiction || 'Global',
        claimIds: claimIds || [],
      }
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Agent review failed", message: error.message });
  }
});

/**
 * POST /api/ten-agents/quick-check — Quick format-only check (Ring 1 only)
 * Useful for fast pre-validation before full review
 */
router.post("/ten-agents/quick-check", async (req: Request, res: Response) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }

    // Run only Ring 1 agents (fast, automated)
    const ring1Result = await tenAgentOrchestrator.runSingleAgentReview(
      1, // Format Validator
      parsed.data.content,
      parsed.data.query,
      {
        sources: parsed.data.sources,
        jurisdiction: parsed.data.jurisdiction,
      }
    );

    const ring3Result = await tenAgentOrchestrator.runSingleAgentReview(
      5, // ALCOA+ Scanner
      parsed.data.content,
      parsed.data.query,
      {
        sources: parsed.data.sources,
        jurisdiction: parsed.data.jurisdiction,
      }
    );

    res.json({
      quickCheck: true,
      agents: [ring1Result, ring3Result],
      passed: ring1Result.verdict !== "fail" && ring3Result.verdict !== "fail",
      recommendation:
        ring1Result.verdict === "fail" || ring3Result.verdict === "fail"
          ? "Format/Data-Integrity Issues detected — full review recommended"
          : "Quick check passed — ready for full 10-agent review",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Quick check failed", message: error.message });
  }
});

export default router;
