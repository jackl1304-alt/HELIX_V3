import { Router, Request, Response } from "express";
import { agentRegistry20 } from "../services/agentRegistry20.js";
import { threeRingMediator } from "../services/threeRingMediator.js";

const router = Router();

/**
 * GET /api/agents – List all 20 agents with their roles and rings
 */
router.get("/agents", (req: Request, res: Response) => {
  try {
    const ring = parseInt(req.query.ring as string) as 1 | 2 | 3 | undefined;
    const jurisdiction = req.query.jurisdiction as string | undefined;
    const domain = req.query.domain as string | undefined;

    let agents = agentRegistry20.getAllAgents();

    if (ring && [1, 2, 3].includes(ring)) {
      agents = agentRegistry20.getAgentsByRing(ring);
    }
    if (jurisdiction) {
      agents = agentRegistry20.getAgentsByJurisdiction(jurisdiction);
    }
    if (domain) {
      agents = agentRegistry20.getAgentsByDomain(domain);
    }

    res.json({
      total: agents.length,
      agents,
      routing: agentRegistry20.getRoutingConfig(),
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch agents", message: error.message });
  }
});

/**
 * GET /api/agents/ring/:ring – Get agents by ring (1, 2, or 3)
 */
router.get("/agents/ring/:ring", (req: Request, res: Response) => {
  try {
    const ring = parseInt(String(req.params.ring)) as 1 | 2 | 3;
    if (![1, 2, 3].includes(ring)) {
      return res.status(400).json({ error: "Invalid ring. Must be 1, 2, or 3." });
    }
    const agents = agentRegistry20.getAgentsByRing(ring);
    const routingConfig = agentRegistry20.getRoutingConfig();
    const ringConfig: Record<number, unknown> = {
      1: routingConfig.ring1,
      2: routingConfig.ring2,
      3: routingConfig.ring3,
    };
    res.json({
      ring,
      total: agents.length,
      gateLogic: ringConfig[ring],
      agents,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch ring agents", message: error.message });
  }
});

/**
 * GET /api/agents/:number – Get specific agent by number
 */
router.get("/agents/:number", (req: Request, res: Response) => {
  try {
    const agentNum = parseInt(String(req.params.number));
    const agent = agentRegistry20.getAgent(agentNum);
    if (!agent) return res.status(404).json({ error: `Agent ${agentNum} not found` });
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch agent", message: error.message });
  }
});

/**
 * GET /api/agents/config/routing – Get routing configuration
 */
router.get("/agents/config/routing", (req: Request, res: Response) => {
  try {
    const config = agentRegistry20.getRoutingConfig();
    const mediatorConfig = threeRingMediator.getConfig();
    res.json({ routingConfig: config, mediatorConfig });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch routing config", message: error.message });
  }
});

/**
 * PUT /api/agents/config/mediator – Update mediator configuration
 */
router.put("/agents/config/mediator", (req: Request, res: Response) => {
  try {
    const { requireAllRing1Pass, ring2ConsensusThreshold, ring2DissentLimit, requireCCOSignature, allowVetoOverride } = req.body;
    threeRingMediator.updateConfig({
      ...(requireAllRing1Pass !== undefined && { requireAllRing1Pass }),
      ...(ring2ConsensusThreshold !== undefined && { ring2ConsensusThreshold }),
      ...(ring2DissentLimit !== undefined && { ring2DissentLimit }),
      ...(requireCCOSignature !== undefined && { requireCCOSignature }),
      ...(allowVetoOverride !== undefined && { allowVetoOverride }),
    });
    res.json({ success: true, config: threeRingMediator.getConfig() });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update config", message: error.message });
  }
});

export default router;
