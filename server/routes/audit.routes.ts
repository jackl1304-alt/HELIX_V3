import { Router, Request, Response } from "express";
import { immutableAuditService } from "../services/immutableAuditService.js";

const router = Router();

/**
 * GET /api/audit/recent – Recent audit events
 */
router.get("/audit/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const events = await immutableAuditService.getRecentEvents(limit);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit events", message: error.message });
  }
});

/**
 * GET /api/audit/stats – Audit statistics
 */
router.get("/audit/stats", async (req: Request, res: Response) => {
  try {
    const stats = await immutableAuditService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit stats", message: error.message });
  }
});

/**
 * GET /api/audit/validate – Validate audit trail integrity
 */
router.get("/audit/validate", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 500;
    const result = await immutableAuditService.validateIntegrity({ limit });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to validate audit trail", message: error.message });
  }
});

/**
 * GET /api/audit/entity/:type/:id – Entity history
 */
router.get("/audit/entity/:type/:id", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const entityType = String(req.params.type);
    const entityId = String(req.params.id);
    const events = await immutableAuditService.getEntityHistory(
      entityType,
      entityId,
      limit
    );
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch entity history", message: error.message });
  }
});

/**
 * GET /api/audit/type/:eventType – Events by type
 */
router.get("/audit/type/:eventType", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const eventType = String(req.params.eventType);
    const events = await immutableAuditService.getEventsByType(
      eventType as any,
      limit
    );
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch events by type", message: error.message });
  }
});

/**
 * GET /api/audit/verify/:chainHash – Verify chain hash integrity
 */
router.get("/audit/verify/:chainHash", async (req: Request, res: Response) => {
  try {
    const chainHash = String(req.params.chainHash);
    const result = await immutableAuditService.verifyChain(chainHash);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to verify chain", message: error.message });
  }
});

export default router;
