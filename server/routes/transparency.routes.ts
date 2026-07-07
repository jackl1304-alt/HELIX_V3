import { Router, Request, Response } from "express";
import { aiTransparencyService } from "../services/aiTransparencyService.js";

const router = Router();

/**
 * GET /api/transparency/stats – AI/ML transparency statistics
 */
router.get("/transparency/stats", async (req: Request, res: Response) => {
  try {
    const stats = await aiTransparencyService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transparency stats", message: error.message });
  }
});

/**
 * GET /api/transparency/recent – Recent AI inferences
 */
router.get("/transparency/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await aiTransparencyService.getRecentLogs(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transparency logs", message: error.message });
  }
});

/**
 * GET /api/transparency/output/:outputId – Transparency for specific output
 */
router.get("/transparency/output/:outputId", async (req: Request, res: Response) => {
  try {
    const outputId = String(req.params.outputId);
    const record = await aiTransparencyService.getOutputTransparency(outputId);
    if (!record) return res.status(404).json({ error: "Transparency record not found" });
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transparency record", message: error.message });
  }
});

export default router;
