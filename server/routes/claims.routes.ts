import { Router, Request, Response } from "express";
import { claimRegistryService } from "../services/claimRegistryService.js";
import { claimExtractor } from "../services/claimExtractor.js";
import { provenanceChainService } from "../services/provenanceChainService.js";
import { insertClaimSchema, insertClaimVerificationSchema, insertOutputClaimSchema } from "../../shared/schema.js";

const router = Router();

/**
 * GET /api/claims/dashboard – Aggregierte Claim-Statistiken
 */
router.get("/claims/dashboard", async (req: Request, res: Response) => {
  try {
    const dashboard = await claimRegistryService.getDashboard();
    res.json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get dashboard", message: error.message });
  }
});

/**
 * GET /api/claims – Claims mit Filterung und Pagination
 */
router.get("/claims", async (req: Request, res: Response) => {
  try {
    const query = req.query as Record<string, string>;
    const { search, status, claimType, jurisdiction, limit, offset } = query;
    const result = await claimRegistryService.searchClaims({
      search,
      status,
      claimType,
      jurisdiction,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to search claims", message: error.message });
  }
});

/**
 * GET /api/claims/:id – Einzelner Claim mit Provenance
 */
router.get("/claims/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await claimRegistryService.getClaimWithProvenance(id);
    if (!result) return res.status(404).json({ error: "Claim not found" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get claim", message: error.message });
  }
});

/**
 * GET /api/claims/:id/provenance – Provenance-Chain für Claim
 */
router.get("/claims/:id/provenance", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const chain = await provenanceChainService.getChain(`chain_${id}`);
    if (chain.length === 0) return res.status(404).json({ error: "No provenance chain found" });
    const validation = await provenanceChainService.validateChain(`chain_${id}`);
    res.json({ chain, validation });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get provenance", message: error.message });
  }
});

/**
 * POST /api/claims – Neuen Claim erstellen
 */
router.post("/claims", async (req: Request, res: Response) => {
  try {
    const parsed = insertClaimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }
    const claim = await claimRegistryService.createClaim(parsed.data);
    res.status(201).json(claim);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create claim", message: error.message });
  }
});

/**
 * POST /api/claims/:id/verify – Claim prüfen (Verification hinzufügen)
 */
router.post("/claims/:id/verify", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const payload = { ...req.body, claimId: id };
    const parsed = insertClaimVerificationSchema.safeParse(payload);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }
    const result = await claimRegistryService.verifyClaim(parsed.data);

    // Determine next linkIndex dynamically
    const existingChain = await provenanceChainService.getChain(`chain_${id}`);
    const nextLinkIndex = existingChain.length > 0
      ? Math.max(...existingChain.map((item) => item.linkIndex)) + 1
      : 0;

    // Create provenance chain item for verification
    await provenanceChainService.createChainItem({
      chainId: `chain_${id}`,
      linkIndex: nextLinkIndex,
      linkType: "verification",
      claimId: id,
      verificationId: result.verification.id,
      generator: `reviewer:${parsed.data.reviewerRole}`,
      contentPayload: `${parsed.data.verdict}:${parsed.data.comment || ""}`,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to verify claim", message: error.message });
  }
});

/**
 * POST /api/claims/extract – Batch-Extraktion aus unprocessed Updates
 */
router.post("/claims/extract", async (req: Request, res: Response) => {
  try {
    const result = await claimExtractor.processAllUnprocessedUpdates();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to extract claims", message: error.message });
  }
});

/**
 * POST /api/claims/extract/:updateId – Einzelnes Update extrahieren
 */
router.post("/claims/extract/:updateId", async (req: Request, res: Response) => {
  try {
    const updateId = String(req.params.updateId);
    const count = await claimExtractor.extractFromRegulatoryUpdate(updateId);
    res.json({ extracted: count });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to extract claims from update", message: error.message });
  }
});

/**
 * GET /api/provenance/:outputId – Provenance-Chain für Output
 */
router.get("/provenance/:outputId", async (req: Request, res: Response) => {
  try {
    const outputId = String(req.params.outputId);
    const chain = await provenanceChainService.getChainByOutput(outputId);
    if (chain.length === 0) return res.status(404).json({ error: "No provenance chain found for output" });

    const validation = await provenanceChainService.validateChain(chain[0].chainId);
    res.json({
      outputId,
      chain,
      validation,
      isValid: validation.isValid,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get provenance", message: error.message });
  }
});

/**
 * POST /api/provenance/validate/:chainId – Chain validieren
 */
router.post("/provenance/validate/:chainId", async (req: Request, res: Response) => {
  try {
    const chainId = String(req.params.chainId);
    const validation = await provenanceChainService.validateChain(chainId);
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to validate chain", message: error.message });
  }
});

export default router;
