import { Router, Request, Response } from "express";
import { regulatoryPipelineService } from "../services/regulatoryPipelineService.js";

const router = Router();

/**
 * POST /api/pipeline/run – Run full Detect→Triage→Validate→Propagate
 */
router.post("/pipeline/run", async (req: Request, res: Response) => {
  try {
    const { sources, dryRun } = req.body;
    const report = await regulatoryPipelineService.runFullPipeline({
      sources: Array.isArray(sources) ? sources : undefined,
      dryRun: dryRun === true,
    });
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: "Pipeline execution failed", message: error.message });
  }
});

/**
 * POST /api/pipeline/detect – Run only detection phase
 */
router.post("/pipeline/detect", async (req: Request, res: Response) => {
  try {
    const { sources, dryRun } = req.body;
    const result = await regulatoryPipelineService.runDetection({
      sources: Array.isArray(sources) ? sources : undefined,
      dryRun: dryRun === true,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Detection failed", message: error.message });
  }
});

/**
 * POST /api/pipeline/triage – Run only triage phase
 */
router.post("/pipeline/triage", async (req: Request, res: Response) => {
  try {
    const { dryRun } = req.body;
    const result = await regulatoryPipelineService.runTriage({ dryRun: dryRun === true });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Triage failed", message: error.message });
  }
});

/**
 * POST /api/pipeline/validate – Run validation phase
 */
router.post("/pipeline/validate", async (req: Request, res: Response) => {
  try {
    const { updateIds, validatedBy, dryRun } = req.body;
    const result = await regulatoryPipelineService.runValidation({
      updateIds: Array.isArray(updateIds) ? updateIds : undefined,
      validatedBy: validatedBy || "api_user",
      dryRun: dryRun === true,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Validation failed", message: error.message });
  }
});

/**
 * POST /api/pipeline/propagate – Run propagation phase
 */
router.post("/pipeline/propagate", async (req: Request, res: Response) => {
  try {
    const { dryRun } = req.body;
    const result = await regulatoryPipelineService.runPropagation({ dryRun: dryRun === true });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Propagation failed", message: error.message });
  }
});

/**
 * GET /api/pipeline/history – Pipeline execution history
 */
router.get("/pipeline/history", (req: Request, res: Response) => {
  try {
    const history = regulatoryPipelineService.getPipelineHistory();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch pipeline history", message: error.message });
  }
});

/**
 * GET /api/pipeline/latest – Latest pipeline report
 */
router.get("/pipeline/latest", (req: Request, res: Response) => {
  try {
    const latest = regulatoryPipelineService.getLatestPipeline();
    if (!latest) return res.status(404).json({ error: "No pipeline runs yet" });
    res.json(latest);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch latest pipeline", message: error.message });
  }
});

/**
 * GET /api/pipeline/sources – Detection source configuration
 */
router.get("/pipeline/sources", (req: Request, res: Response) => {
  try {
    const sources = regulatoryPipelineService.getSourceConfig();
    res.json(sources);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch sources", message: error.message });
  }
});

/**
 * PUT /api/pipeline/sources/:sourceId – Enable/disable a source
 */
router.put("/pipeline/sources/:sourceId", (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be boolean" });
    }
    const sourceId = String(req.params.sourceId);
    const success = regulatoryPipelineService.setSourceEnabled(sourceId, enabled);
    if (!success) return res.status(404).json({ error: "Source not found" });
    res.json({ success: true, sourceId: req.params.sourceId, enabled });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update source", message: error.message });
  }
});

export default router;
