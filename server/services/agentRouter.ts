import OpenAI from "openai";
import { db } from "../storage";
import { regulatoryUpdates, dataSources } from "../../shared/schema";
import { Logger } from "./logger.service";
import { sql, inArray, and, or, ilike } from "drizzle-orm";
import { callGroqChatStreaming } from "./groqService";

const logger = new Logger("AgentRouter");

// Zentrales Modell: per Replit Secret/Env überschreibbar
const MODEL =
  process.env.OPENROUTER_MODEL ||
  "poolside/laguna-m.1:free";

// Backup-Modell: wird automatisch genutzt, wenn das primäre Modell fehlschlägt
// (z.B. Rate-Limit bei kostenlosen Modellen)
const BACKUP_MODEL =
  process.env.OPENROUTER_BACKUP_MODEL ||
  "nvidia/nemotron-3-ultra-550b-a55b:free";

// Optionaler Fallback
const ENABLE_GROQ_FALLBACK = process.env.ENABLE_GROQ_FALLBACK !== "0";

// Basis-Systemprompt: hochspezialisierter Regulatory-Intelligence-Agent
// Wird jedem Agenten-spezifischen Prompt vorangestellt.
const REGULATORY_INTELLIGENCE_SYSTEM_PROMPT = `Du bist ein hochspezialisierter Regulatory-Intelligence-Agent mit tiefgreifender Expertise in sämtlichen internationalen Normen, Standards und regulatorischen Anforderungen im Bereich Healthcare und Pharma — darunter ISO 13485, ISO 14971, ISO 62304, IEC 60601, FDA 21 CFR Parts 820/210/211, EU MDR 2017/745, EU IVDR 2017/746, ICH-Leitlinien (Q1–Q14, E6, S1–S12), GMP, GCP, GLP, sowie alle relevanten DIN-, EN- und ISO-Normen weltweit. Du kennst alle zuständigen Behörden (FDA, EMA, BfArM, Swissmedic, TGA, MHRA, Health Canada, PMDA, NMPA, ANVISA, IMDRF, WHO).

**Deine einzige Aufgabe:** Für jede Anfrage führst du eine vollständige, quellenbasierte Analyse durch — keine Halluzinationen, keine erfundenen Daten, keine Mock- oder Demodaten, keine unbelegten Behauptungen. Jede Information, die du lieferst, muss einer realen, nachvollziehbaren Quelle zugeordnet sein oder explizit als allgemeines Fachwissen ohne konkrete Quelle gekennzeichnet werden.

**Verhaltensregeln — strikt einzuhalten:**
- **Kein Halluzinieren:** Erfinde keine Normnummern, Patente, Studienergebnisse, Behördenentscheidungen oder Dokument-IDs. Wenn eine Information nicht in den bereitgestellten Daten enthalten oder dir nicht sicher bekannt ist, sage das explizit und benenne die Lücke.
- **Nutze primär die bereitgestellten Datenbank-Einträge** (falls vorhanden) als Quellenbasis und zitiere sie konkret (Titel, Quelle, Datum). Ergänze sie durch dein Fachwissen zu Normen/Verordnungen — kennzeichne dabei klar, was aus der Datenbank stammt und was allgemeines regulatorisches Fachwissen ist.
- **Transparenz über Wissensgrenzen:** Du hast keinen Live-Internetzugriff. Unterscheide klar zwischen gesicherter Information aus den bereitgestellten Daten, deinem Trainingswissen (mit Hinweis auf möglichen Wissensstand-Cutoff) und Bereichen, die eine Recherche in externen Datenbanken (z.B. FDA MAUDE, EUDAMED, PubMed, Espacenet, WIPO PATENTSCOPE) erfordern würden.
- **Aktualität kennzeichnen:** Weise bei regulatorischen Fristen oder laufenden Konsultationen auf mögliche Änderungen hin und empfehle die Prüfung der Primärquelle.
- **Tiefe vor Breite:** Gehe in die fachliche Tiefe, strukturiere nach Themenbereich, und liste kritische Fristen oder bevorstehende Änderungen gesondert hervor.
- **Ausgabeformat:** Antworte auf Deutsch, strukturiert mit Überschriften/Absätzen, und mit expliziten Quellenangaben wo verfügbar.`;

// OpenAI-kompatibler Client (OpenRouter nutzt OpenAI API Format)
let client: OpenAI | null = null;
let usingOpenRouter = false;

try {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (openRouterKey) {
    usingOpenRouter = true;
    client = new OpenAI({
      apiKey: openRouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://helix.deltaways.de",
        "X-Title": "Helix Regulatory Intelligence",
      },
    });
    logger.info("Using OpenRouter via OpenAI-compatible SDK", { model: MODEL });
  } else {
    logger.warn("OPENROUTER_API_KEY not set — AI features disabled");
  }
} catch (error: any) {
  logger.warn("Failed to initialize OpenRouter client", { error: error?.message });
}

/**
 * Führt einen Chat-Completion-Aufruf aus. Bei Fehler (z.B. Rate-Limit des
 * primären kostenlosen Modells) wird automatisch auf das Backup-Modell
 * umgeschaltet.
 */
async function createChatCompletion(params: {
  messages: { role: "system" | "user"; content: string }[];
  max_tokens: number;
}) {
  try {
    const response = await client!.chat.completions.create({
      model: MODEL,
      max_tokens: params.max_tokens,
      messages: params.messages,
    });
    return { response, modelUsed: MODEL };
  } catch (error: any) {
    logger.warn("Primary model failed, trying backup model", {
      primaryModel: MODEL,
      backupModel: BACKUP_MODEL,
      error: error?.message,
    });

    const response = await client!.chat.completions.create({
      model: BACKUP_MODEL,
      max_tokens: params.max_tokens,
      messages: params.messages,
    });
    return { response, modelUsed: BACKUP_MODEL };
  }
}

/**
 * Multi-Agent Router Service for RAG-based Regulatory Intelligence
 * Routes queries to specialized agents (FDA, EMA, Compliance, Analytics)
 */

interface RoutingDecision {
  agent:
    | "fda"
    | "ema"
    | "health_canada"
    | "compliance"
    | "analytics"
    | "general";
  confidence: number;
  reasoning: string;
  parameters: Record<string, any>;
}

interface AgentResponse {
  agent: string;
  response: string;
  sources: Array<{
    title: string;
    source: string;
    date: string;
    relevanceScore: number;
  }>;
  metadata: {
    totalResultsFound: number;
    processingTimeMs: number;
  };
}

/**
 * Route user query to appropriate agent using LLM
 */
async function routeQuery(userQuery: string): Promise<RoutingDecision> {
  if (!client) {
    logger.info("Anthropic/OpenRouter client not available");
    return {
      agent: "general",
      confidence: 0.8,
      reasoning: "No Anthropic/OpenRouter client available",
      parameters: {},
    };
  }

  const systemPrompt = `You are an intelligent query router for a regulatory intelligence platform.
Analyze the user's query and determine which specialized agent should handle it.

Agents available:
1. "fda" - FDA 510(k), PMA, recalls, device classification
2. "ema" - European Medical Device Approvals (EPAR), product authorizations
3. "health_canada" - Canadian medical device licenses and approvals
4. "compliance" - Risk assessment, compliance monitoring, regulatory gaps
5. "analytics" - Financial impact, market trends, ROI analysis
6. "general" - General regulatory information, multi-source queries

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "agent": "agent_name",
  "confidence": 0.95,
  "reasoning": "Brief explanation",
  "parameters": {
    "deviceType": "optional_device_category",
    "dateRange": "optional_date_filter"
  }
}`;

  try {
    const { response, modelUsed } = await createChatCompletion({
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
    });

    let jsonText = (response.choices[0].message.content || "").trim();
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);

    const routing = JSON.parse(jsonText) as RoutingDecision;

    logger.info("Query routed", {
      agent: routing.agent,
      confidence: routing.confidence,
      model: modelUsed,
      usingOpenRouter,
    });

    return routing;
  } catch (error: any) {
    logger.error("Routing error", { error: error.message });

    return {
      agent: "general",
      confidence: 0.5,
      reasoning: "Routing error - fallback to general agent",
      parameters: {},
    };
  }
}

/**
 * FDA Agent - Handle FDA-specific queries
 */
async function fdaAgent(
  query: string,
  _parameters: Record<string, any>,
): Promise<AgentResponse> {
  const startTime = Date.now();

  const fdaUpdates = await db
    .select({
      id: regulatoryUpdates.id,
      title: regulatoryUpdates.title,
      description: regulatoryUpdates.description,
      sourceId: regulatoryUpdates.sourceId,
      publishedDate: regulatoryUpdates.publishedDate,
    })
    .from(regulatoryUpdates)
    .where(
      sql`LOWER(title) LIKE LOWER(${`%${query}%`}) OR LOWER(description) LIKE LOWER(${`%${query}%`})`,
    )
    .orderBy(sql`published_date DESC`)
    .limit(10);

  const sourceIds = fdaUpdates.map((u) => u.sourceId).filter(Boolean);
  const sourceInfo =
    sourceIds.length > 0
      ? await db
          .select()
          .from(dataSources)
          .where(inArray(dataSources.id, sourceIds as string[]))
      : [];

  const sourceMap = Object.fromEntries(
    sourceInfo.map((s: any) => [s.id, s.name]),
  );

  const systemPrompt = `${REGULATORY_INTELLIGENCE_SYSTEM_PROMPT}

**Fokusbereich für diese Anfrage:** FDA-Regularien — 510(k), PMA, Device-Klassifizierung, Rückrufe, 21 CFR Part 820, Zulassungswege und Compliance-Anforderungen für den US-Markt.`;

  const prompt = `User query: "${query}"

FDA Updates found: ${fdaUpdates.length}
${fdaUpdates
  .map(
    (row) =>
      `- ${row.title} (${sourceMap[row.sourceId || ""] || row.sourceId || "Unknown"}) - ${row.publishedDate}`,
  )
  .join("\n")}

Provide a concise, helpful analysis.`;

  if (!client && ENABLE_GROQ_FALLBACK) {
    logger.info("FDA Agent: Using Groq fallback");
    const analysis = await callGroqChatStreaming(prompt, systemPrompt);

    return {
      agent: "FDA",
      response: analysis,
      sources: fdaUpdates
        .map((row) => ({
          title: row.title,
          source: sourceMap[row.sourceId || ""] || row.sourceId || "Unknown",
          date: row.publishedDate?.toISOString() || new Date().toISOString(),
          relevanceScore: 0.85,
        }))
        .slice(0, 3),
      metadata: {
        totalResultsFound: fdaUpdates.length,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  const { response, modelUsed } = await createChatCompletion({
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const analysis = response.choices[0].message.content || "Unable to analyze FDA updates";

  return {
    agent: "FDA",
    response: analysis,
    sources: fdaUpdates
      .map((row: any) => ({
        title: row.title,
        source: sourceMap[row.sourceId] || row.sourceId || "Unknown",
        date: row.publishedDate?.toISOString() || new Date().toISOString(),
        relevanceScore: 0.9,
      }))
      .slice(0, 3),
    metadata: {
      totalResultsFound: fdaUpdates.length,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * EMA Agent - Handle European approval queries
 */
async function emaAgent(
  query: string,
  _parameters: Record<string, any>,
): Promise<AgentResponse> {
  const startTime = Date.now();

  const emaUpdates = await db
    .select({
      id: regulatoryUpdates.id,
      title: regulatoryUpdates.title,
      description: regulatoryUpdates.description,
      sourceId: regulatoryUpdates.sourceId,
      publishedDate: regulatoryUpdates.publishedDate,
    })
    .from(regulatoryUpdates)
    .where(
      sql`LOWER(title) LIKE LOWER(${`%${query}%`}) OR LOWER(description) LIKE LOWER(${`%${query}%`})`,
    )
    .orderBy(sql`published_date DESC`)
    .limit(10);

  const systemPrompt = `${REGULATORY_INTELLIGENCE_SYSTEM_PROMPT}

**Fokusbereich für diese Anfrage:** Europäische Regularien — EMA-Zulassungen, EPAR-Verfahren, EU MDR 2017/745, EU IVDR 2017/746, CE-Kennzeichnung, EUDAMED und Compliance-Anforderungen für den europäischen Markt.`;

  const prompt = `User query: "${query}"

EMA Updates found: ${emaUpdates.length}
${emaUpdates
  .map(
    (row) => `- ${row.title} (Source: ${row.sourceId}) - ${row.publishedDate}`,
  )
  .join("\n")}

Provide a focused analysis.`;

  if (!client && ENABLE_GROQ_FALLBACK) {
    logger.info("EMA Agent: Using Groq fallback");
    const analysis = await callGroqChatStreaming(prompt, systemPrompt);

    return {
      agent: "EMA",
      response: analysis,
      sources: emaUpdates
        .map((row) => ({
          title: row.title,
          source: row.sourceId || "EMA",
          date: row.publishedDate?.toISOString() || new Date().toISOString(),
          relevanceScore: 0.8,
        }))
        .slice(0, 3),
      metadata: {
        totalResultsFound: emaUpdates.length,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  const { response, modelUsed } = await createChatCompletion({
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const analysis = response.choices[0].message.content || "Unable to analyze EMA updates";

  return {
    agent: "EMA",
    response: analysis,
    sources: emaUpdates
      .map((row: any) => ({
        title: row.title,
        source: row.sourceId || "Unknown",
        date: row.publishedDate?.toISOString() || new Date().toISOString(),
        relevanceScore: 0.85,
      }))
      .slice(0, 3),
    metadata: {
      totalResultsFound: emaUpdates.length,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * Compliance Agent - Risk and compliance analysis
 */
async function complianceAgent(
  query: string,
  _parameters: Record<string, any>,
): Promise<AgentResponse> {
  const startTime = Date.now();

  const allUpdates = await db
    .select({
      id: regulatoryUpdates.id,
      title: regulatoryUpdates.title,
      sourceId: regulatoryUpdates.sourceId,
      publishedDate: regulatoryUpdates.publishedDate,
    })
    .from(regulatoryUpdates)
    .orderBy(sql`published_date DESC`)
    .limit(20);

  const systemPrompt = `${REGULATORY_INTELLIGENCE_SYSTEM_PROMPT}

**Fokusbereich für diese Anfrage:** Compliance- und Risikoanalyse — ISO 13485, ISO 14971, regulatorische Trends, Compliance-Lücken und konkrete Handlungsempfehlungen für Medizinprodukte-Hersteller.`;

  const prompt = `User compliance query: "${query}"

Recent regulatory updates (last 20):
${allUpdates
  .map((u: any) => `- ${u.title} (Source: ${u.sourceId}) - ${u.publishedDate}`)
  .join("\n")}

Analyze compliance implications and provide recommendations.`;

  if (!client && ENABLE_GROQ_FALLBACK) {
    logger.info("Compliance Agent: Using Groq fallback");
    const analysis = await callGroqChatStreaming(prompt, systemPrompt);

    return {
      agent: "Compliance",
      response: analysis,
      sources: allUpdates
        .map((u: any) => ({
          title: u.title,
          source: u.sourceId || "Unknown",
          date: u.publishedDate?.toISOString() || new Date().toISOString(),
          relevanceScore: 0.75,
        }))
        .slice(0, 3),
      metadata: {
        totalResultsFound: allUpdates.length,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  const { response, modelUsed } = await createChatCompletion({
    max_tokens: 3000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const analysis = response.choices[0].message.content || "Unable to perform compliance analysis";

  return {
    agent: "Compliance",
    response: analysis,
    sources: allUpdates
      .map((u: any) => ({
        title: u.title,
        source: u.sourceId || "Unknown",
        date: u.publishedDate?.toISOString() || new Date().toISOString(),
        relevanceScore: 0.8,
      }))
      .slice(0, 3),
    metadata: {
      totalResultsFound: allUpdates.length,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * General Agent - Multi-source regulatory queries
 */
async function generalAgent(
  query: string,
  _parameters: Record<string, any>,
): Promise<AgentResponse> {
  const startTime = Date.now();

  const keywords = query.toLowerCase().match(/[a-zäöüß]{4,}/gi) || [];
  const searchTerms = keywords.filter(
    (k) =>
      ![
        "what",
        "when",
        "where",
        "which",
        "latest",
        "sind",
        "über",
        "neuesten",
        "gibt",
        "neues",
        "oder",
      ].includes(k),
  );

  const translations: Record<string, string[]> = {
    beinschrauben: ["screw", "bone", "orthopedic", "leg"],
    knieschrauben: ["screw", "knee", "orthopedic"],
    hüftimplantat: ["implant", "hip", "orthopedic"],
    knieimplantat: ["implant", "knee", "orthopedic"],
    orthopädische: ["orthopedic", "orthopaedic"],
    implantate: ["implant"],
    schrauben: ["screw"],
    platte: ["plate"],
    nagel: ["nail", "rod"],
    knochen: ["bone"],
  };

  const expandedTerms: string[] = [...searchTerms];
  searchTerms.forEach((term) => {
    if (translations[term]) expandedTerms.push(...translations[term]);
    if (term.includes("schrauben")) expandedTerms.push("screw");
    if (term.includes("implantat")) expandedTerms.push("implant");
    if (term.includes("platte")) expandedTerms.push("plate");
    if (term.includes("nagel")) expandedTerms.push("nail", "rod");
  });

  let allUpdates: any[] = [];
  if (expandedTerms.length > 0) {
    const keywordConditions = expandedTerms.map((term) =>
      or(
        ilike(regulatoryUpdates.title, `%${term}%`),
        ilike(regulatoryUpdates.description, `%${term}%`),
      ),
    );

    const keywordFilter = or(...keywordConditions);
    const deviceSources = [
      "fda_510k",
      "fda_pma",
      "health_canada_mdall",
      "ema_epar",
    ];

    allUpdates = await db
      .select({
        id: regulatoryUpdates.id,
        title: regulatoryUpdates.title,
        description: regulatoryUpdates.description,
        sourceId: regulatoryUpdates.sourceId,
        publishedDate: regulatoryUpdates.publishedDate,
      })
      .from(regulatoryUpdates)
      .where(
        and(keywordFilter, inArray(regulatoryUpdates.sourceId, deviceSources)),
      )
      .orderBy(sql`published_date DESC`)
      .limit(30);

    if (allUpdates.length === 0) {
      allUpdates = await db
        .select({
          id: regulatoryUpdates.id,
          title: regulatoryUpdates.title,
          description: regulatoryUpdates.description,
          sourceId: regulatoryUpdates.sourceId,
          publishedDate: regulatoryUpdates.publishedDate,
        })
        .from(regulatoryUpdates)
        .where(keywordFilter)
        .orderBy(sql`published_date DESC`)
        .limit(30);
    }
  }

  if (allUpdates.length === 0) {
    allUpdates = await db
      .select({
        id: regulatoryUpdates.id,
        title: regulatoryUpdates.title,
        description: regulatoryUpdates.description,
        sourceId: regulatoryUpdates.sourceId,
        publishedDate: regulatoryUpdates.publishedDate,
      })
      .from(regulatoryUpdates)
      .orderBy(sql`published_date DESC`)
      .limit(15);
  }

  const systemPrompt = `${REGULATORY_INTELLIGENCE_SYSTEM_PROMPT}

**Fokusbereich für diese Anfrage:** Allgemeine, regionenübergreifende regulatorische Auskunft zu Medizinprodukten — kombiniert Erkenntnisse aus allen verfügbaren Quellen und Regionen.`;

  const prompt = `User query: "${query}"

Available regulatory updates (from all sources):
${allUpdates
  .map(
    (u: any) =>
      `- ${u.title} (${u.sourceId})\n  ${u.description?.substring(0, 100) || "No description"}`,
  )
  .join("\n")}

Provide a helpful, comprehensive response.`;

  if (!client && ENABLE_GROQ_FALLBACK) {
    logger.info("General Agent: Using Groq fallback");
    const analysis = await callGroqChatStreaming(prompt, systemPrompt);

    return {
      agent: "General",
      response: analysis,
      sources: allUpdates
        .map((u: any) => ({
          title: u.title,
          source: u.sourceId || "Unknown",
          date: u.publishedDate?.toISOString() || new Date().toISOString(),
          relevanceScore: 0.75,
        }))
        .slice(0, 3),
      metadata: {
        totalResultsFound: allUpdates.length,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  const { response, modelUsed } = await createChatCompletion({
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const analysis = response.choices[0].message.content || "Unable to process query";

  return {
    agent: "General",
    response: analysis,
    sources: allUpdates
      .map((u: any) => ({
        title: u.title,
        source: u.sourceId || "Unknown",
        date: u.publishedDate?.toISOString() || new Date().toISOString(),
        relevanceScore: 0.75,
      }))
      .slice(0, 3),
    metadata: {
      totalResultsFound: allUpdates.length,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * Main RAG pipeline with agent routing
 */
export async function processRegulatoryQuery(
  userQuery: string,
): Promise<AgentResponse> {
  logger.info("Processing regulatory query", { query: userQuery });

  try {
    const routing = await routeQuery(userQuery);
    let response: AgentResponse;

    switch (routing.agent) {
      case "fda":
        response = await fdaAgent(userQuery, routing.parameters);
        break;
      case "ema":
        response = await emaAgent(userQuery, routing.parameters);
        break;
      case "compliance":
        response = await complianceAgent(userQuery, routing.parameters);
        break;
      case "general":
      default:
        response = await generalAgent(userQuery, routing.parameters);
    }

    logger.info("Query processed successfully", {
      agent: routing.agent,
      sources: response.sources.length,
      model: MODEL,
      usingOpenRouter,
    });

    return response;
  } catch (error: any) {
    logger.error("Error processing regulatory query", {
      error: error.message,
      stack: error.stack,
    });

    return {
      agent: "General",
      response: `Entschuldigung, ich konnte Ihre Anfrage nicht vollständig verarbeiten.

Ihre Frage: "${userQuery}"

Bitte versuchen Sie es mit einer spezifischeren Frage zu regulatorischen Themen wie FDA-Zulassungen, EMA-Freigaben oder Compliance-Anforderungen.

Technischer Hinweis: ${error.message}`,
      sources: [],
      metadata: {
        totalResultsFound: 0,
        processingTimeMs: 0,
      },
    };
  }
}

export { routeQuery };
