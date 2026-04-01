require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require("@aws-sdk/client-bedrock-runtime");
const { NodeHttpHandler } = require("@smithy/node-http-handler");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
app.use(cors({
  origin: "http://localhost:60558", // or "*"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

/* =========================
   Bedrock Client
========================= */
const client = new BedrockRuntimeClient({
  region: "us-east-1",
  requestHandler: new NodeHttpHandler(),
  credentials: { accessKeyId: "dummy", secretAccessKey: "dummy" },
  middlewareStack: {
    add: (next) => async (args) => {
      args.request.headers["Authorization"] =
        `Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK}`;
      return next(args);
    }
  }
});

/* =========================
   Llama Call
========================= */
async function callLlama(system, user, maxLen = 1200) {
  const prompt = [
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>",
    system,
    "<|eot_id|><|start_header_id|>user<|end_header_id|>",
    user,
    "<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
  ].join("\n");

  const command = new InvokeModelCommand({
    modelId:
      "arn:aws:bedrock:us-east-1:434702088658:inference-profile/us.meta.llama3-3-70b-instruct-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt,
      max_gen_len: maxLen,
      temperature: 0.1,
      top_p: 0.9
    })
  });

  const response = await client.send(command);
  const decoded = new TextDecoder().decode(response.body);
  const result = JSON.parse(decoded);
  return (result.generation || "").trim();
}

/* =========================
   Safe JSON Parse
   Tries strict parse first, then trims surrounding noise.
========================= */
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {}
    }
    return null;
  }
}

/* =========================
   JSON Truncation Recovery
   When Llama hits max_gen_len mid-JSON, this closes all open
   strings / arrays / objects so JSON.parse can still succeed.
========================= */
function attemptJsonRecovery(raw) {
  const start = raw.indexOf("{");
  if (start === -1) return null;

  let text = raw.slice(start);

  // Close an open string — count unescaped double-quotes
  const quoteCount = (text.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) text += '"';

  // Count open braces and brackets
  let braces = 0, brackets = 0;
  for (const ch of text) {
    if      (ch === "{") braces++;
    else if (ch === "}") braces--;
    else if (ch === "[") brackets++;
    else if (ch === "]") brackets--;
  }

  // Strip trailing comma before closing containers
  text = text.trimEnd();
  if (text.endsWith(",")) text = text.slice(0, -1);

  text += "]".repeat(Math.max(0, brackets));
  text += "}".repeat(Math.max(0, braces));

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/* =========================
   Mermaid Sanitizer
========================= */
function sanitizeMermaid(raw) {
  if (!raw) return "";
  return raw
    .replace(/```mermaid/gi, "")
    .replace(/```/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\u00A0/g, " ")         // strip non-breaking spaces
    .replace(/\n{3,}/g, "\n\n")      // condense blank lines
    .replace(/-->[^\S\n]*\|([^|]+)\|/g, "-->|$1|")  // normalise edge labels
    .trim();
}

/* =========================
   GENERATE ARCHITECTURE
========================= */
app.post("/generate", async (req, res) => {
  try {
    const { idea, users, budget, features } = req.body;

    if (!idea || !users) {
      return res.status(400).json({ success: false, message: "Missing idea or users" });
    }

    // ─── STEP 1: Scale & Complexity Classifier ───────────────────────────────
    const step1System = `
You are a Senior Cloud Architect performing a system requirements analysis.

TASK: Classify the project along 4 dimensions so the next stage can choose the right AWS services.

OUTPUT FORMAT — return exactly these 4 labeled lines, nothing else:

SCALE: <tier>
COMPUTE_INTENSITY: <low|medium|high>
DATA_COMPLEXITY: <low|medium|high>
REALTIME_NEEDS: <none|low|high>

SCALE TIERS:
  free_tier      → < 1,000 concurrent users
  growth         → 1,000 – 10,000
  scale          → 10,000 – 100,000
  large_scale    → 100,000 – 1,000,000
  distributed    → > 1,000,000

COMPUTE_INTENSITY rules:
  low    → simple CRUD, content reads
  medium → file processing, moderate logic, payment webhooks
  high   → ML inference, video transcoding, code compilation, heavy aggregations

DATA_COMPLEXITY rules:
  low    → one or two simple entities, no search
  medium → multiple entities, moderate relations, some filtering
  high   → complex relations, full-text search, analytics, graph queries

REALTIME_NEEDS rules:
  none   → fully request/response, no live updates
  low    → polling acceptable (dashboard refresh every 30s)
  high   → live chat, collaborative editing, presence, live scores

CRITICAL RULES:
- Features override user count for REALTIME_NEEDS (chat always → high)
- Code compilation → COMPUTE_INTENSITY high
- Payments alone do NOT raise COMPUTE_INTENSITY above medium
`;

    const step1User = `
Idea: ${idea}
Users: ${users}
Budget: ${budget || "not specified"}
Features: ${(features || []).join(", ") || "not specified"}
`;

    const analysis = await callLlama(step1System, step1User, 200);
    console.log("STEP 1:\n", analysis);

    // ─── STEP 2: Service Selection ────────────────────────────────────────────
    const step2System = `
You are a Principal AWS Solutions Architect.
Select ONLY the AWS services this project actually needs. Output feeds directly into a JSON builder.

MANDATORY BASELINE (always included):
  - Amazon Cognito                 [authentication]
  - Amazon API Gateway (REST)      [HTTP API layer]
  - AWS Lambda (API Handler)       [REST compute, unless scale = large_scale/distributed]
  - Amazon DynamoDB                [primary database]

CONDITIONAL — add ONLY when the classification says so:

IF REALTIME_NEEDS = high:
  + Amazon API Gateway (WebSocket)
  + AWS Lambda (WebSocket Handler)
  + Amazon ElastiCache (Redis)

IF COMPUTE_INTENSITY = high OR features include background jobs:
  + Amazon SQS
  + AWS Lambda (Background Worker)

IF DATA_COMPLEXITY = high OR features include "search":
  + Amazon OpenSearch Service

IF features include "files", "images", "video", "uploads", "documents", "storage":
  + Amazon S3
  + Amazon CloudFront

IF scale = large_scale OR scale = distributed:
  REPLACE AWS Lambda (API Handler) with Amazon ECS (Fargate)
  Keep Lambda only for WebSocket Handler and Background Worker

IF features include heavy analytics:
  + Amazon Redshift
ELSE IF features include light analytics:
  + Amazon Athena  (requires S3)

IF features include payments:
  + AWS Lambda (Payment Webhook Handler)
  + Amazon SQS (Payment Queue)

NEVER add: Kinesis, Step Functions, SNS, RDS, Glue — unless they are the ONLY correct choice.

OUTPUT FORMAT — plain text:

## Architecture Strategy
<2-4 sentences of rationale specific to THIS project>

## Selected AWS Services
(repeat the block below for each service, no numbering)

SERVICE: <exact AWS service name>
ROLE: <specific technical role in this system>
JUSTIFICATION: <which feature or scale requirement forces inclusion>
DATA_FLOW: <one sentence: what enters and what leaves>
`;

    const step2User = `
Classification:
${analysis}

Project:
Idea: ${idea}
Features: ${(features || []).join(", ") || "none specified"}
Users: ${users}
Budget: ${budget || "not specified"}
`;

    const serviceStack = await callLlama(step2System, step2User, 1200);
    console.log("STEP 2:\n", serviceStack);

    // ─── STEP 3: JSON Assembly ────────────────────────────────────────────────
    // NOTE: max_gen_len raised to 2500 to prevent truncation on large service lists.
    // A recovery function handles any remaining truncation as a safety net.
    const step3System = `
You output ONLY a single valid JSON object. No markdown. No backticks. No comments. No text outside the JSON.

PRODUCE THIS EXACT SCHEMA — fill every field:
{
  "scale_analysis": "2 sentences: scale tier and key drivers",
  "architecture_overview": {
    "strategy": "2-3 sentences of overall design rationale",
    "read_flow": "User → Cognito → API Gateway → Lambda/ECS → [Cache] → DynamoDB",
    "write_flow": "User → API Gateway → Lambda/ECS → DynamoDB → [SQS → Worker]",
    "realtime_flow": "WebSocket path OR exactly the string: N/A - no real-time features",
    "async_flow": "SQS→Worker path OR exactly the string: N/A - no async processing"
  },
  "aws_services": [
    {
      "name": "exact AWS service name",
      "role": "specific technical role",
      "justification": "which feature or scale requirement forces inclusion",
      "data_flow": "what enters and what leaves",
      "estimated_monthly_cost": "realistic USD range for stated scale"
    }
  ],
  "cost_breakdown": {
    "monthly_estimate": "$X – $Y/month",
    "per_service": [
      { "service": "name", "cost": "$X – $Y" }
    ],
    "cost_notes": "key cost drivers and reduction strategies"
  },
  "implementation_steps": [
    {
      "phase": "Phase N — Title",
      "duration": "X weeks",
      "tasks": ["task 1", "task 2", "task 3"]
    }
  ],
  "mermaid": ""
}

COST CALIBRATION BY SCALE:
  free_tier   → $50 – $500/month
  growth      → $500 – $3,000/month
  scale       → $3,000 – $15,000/month
  large_scale → $15,000 – $80,000/month
  distributed → $80,000+/month

STRICT RULES:
- "mermaid" must always be empty string "" — filled in next step
- Every service in aws_services must appear in at least one architecture_overview flow
- No service in aws_services that was not in the Step 2 input
- Be concise in strings to avoid hitting length limits
- All JSON strings must be properly escaped
`;

    const step3User = `
Step 1 Classification:
${analysis}

Step 2 Service Selection:
${serviceStack}

Project: ${idea}
Users: ${users}, Budget: ${budget || "not specified"}
`;

    const jsonRaw = await callLlama(step3System, step3User, 2500);

    let parsed = safeParse(jsonRaw);

    if (!parsed) {
      console.warn("Step 3: clean parse failed — attempting truncation recovery");
      parsed = attemptJsonRecovery(jsonRaw);
    }

    if (!parsed) {
      return res.status(500).json({
        success: false,
        error: "Invalid JSON from Step 3 — even recovery failed",
        raw: jsonRaw
      });
    }

    // Ensure required keys exist (defensive defaults for truncated responses)
    parsed.aws_services        = parsed.aws_services        || [];
    parsed.architecture_overview = parsed.architecture_overview || {};
    parsed.cost_breakdown      = parsed.cost_breakdown      || {};
    parsed.implementation_steps = parsed.implementation_steps || [];

    console.log("STEP 3 OK. Services:", parsed.aws_services.map(s => s.name));

    // ─── STEP 4: Mermaid Diagram Generator ───────────────────────────────────
    const serviceNames   = parsed.aws_services.map(s => s.name);
    const hasWebSocket   = serviceNames.some(n => /websocket/i.test(n));
    const hasElastiCache = serviceNames.some(n => /elasticache/i.test(n));
    const hasSQS         = serviceNames.some(n => /\bsqs\b/i.test(n));
    const hasS3          = serviceNames.some(n => /\bS3\b/i.test(n));
    const hasOpenSearch  = serviceNames.some(n => /opensearch/i.test(n));
    const hasCloudFront  = serviceNames.some(n => /cloudfront/i.test(n));
    const hasWorker      = serviceNames.some(n => /worker/i.test(n));
    const hasECS         = serviceNames.some(n => /\becs\b/i.test(n));
    const computeNode    = hasECS ? 'ECS' : 'LambdaAPI';
    const computeLabel   = hasECS ? 'Amazon ECS Fargate' : 'Lambda API Handler';

    // Pre-build only the subgraph lines and edges that apply —
    // injecting them directly removes all model guesswork.
    const apiSubgraphLines = [
      `  APIGateway["API Gateway REST"]`,
      hasWebSocket ? `  WebSocketGW["API Gateway WebSocket"]` : ""
    ].filter(Boolean).join("\n");

    const computeSubgraphLines = [
      `  ${computeNode}["${computeLabel}"]`,
      hasWebSocket ? `  LambdaWS["Lambda WebSocket Handler"]` : "",
      hasWorker    ? `  LambdaWorker["Lambda Background Worker"]` : ""
    ].filter(Boolean).join("\n");

    const messagingSubgraphLines = hasSQS
      ? `  SQS["Amazon SQS"]`
      : "  %% no async messaging";

    const dataSubgraphLines = [
      `  DynamoDB["Amazon DynamoDB"]`,
      hasElastiCache ? `  ElastiCache["ElastiCache Redis"]` : "",
      hasOpenSearch  ? `  OpenSearch["Amazon OpenSearch"]` : ""
    ].filter(Boolean).join("\n");

    const storageSubgraphLines = (hasS3 || hasCloudFront)
      ? [
          hasS3         ? `  S3["Amazon S3"]` : "",
          hasCloudFront ? `  CloudFront["Amazon CloudFront"]` : ""
        ].filter(Boolean).join("\n")
      : "  %% no storage";

    const coreEdges = [
      `User --> Cognito`,
      `Cognito -->|"JWT"| APIGateway`,
      `APIGateway -->|"request"| ${computeNode}`,
      `${computeNode} -->|"read/write"| DynamoDB`
    ].join("\n");

    const wsEdges = hasWebSocket ? [
      `User -->|"WS upgrade"| WebSocketGW`,
      `WebSocketGW --> LambdaWS`,
      `LambdaWS -->|"pub/sub"| ElastiCache`,
      `ElastiCache -->|"fan-out"| LambdaWS`
    ].join("\n") : "";

    const cacheRestEdge = (hasElastiCache && !hasWebSocket)
      ? `${computeNode} -->|"cache"| ElastiCache`
      : (hasElastiCache ? `${computeNode} -->|"cache"| ElastiCache` : "");

    const sqsEdges = hasSQS ? [
      `${computeNode} -->|"enqueue"| SQS`,
      `SQS -->|"trigger"| LambdaWorker`
    ].join("\n") : "";

    const s3Edge        = hasS3         ? `${computeNode} -->|"upload/fetch"| S3`   : "";
    const cdnEdge       = hasCloudFront ? `CloudFront -->|"origin"| S3`              : "";
    const searchEdges   = hasOpenSearch ? [
      `LambdaWorker -->|"index"| OpenSearch`,
      `${computeNode} -->|"search"| OpenSearch`
    ].join("\n") : "";

    const allEdges = [coreEdges, wsEdges, cacheRestEdge, sqsEdges, s3Edge, cdnEdge, searchEdges]
      .filter(Boolean).join("\n");

    // The full diagram is pre-built in JS — the model only needs to OUTPUT it verbatim.
    // This eliminates virtually all Mermaid syntax errors.
    const preBuildDiagram = `graph TD

subgraph Client["Client Layer"]
  User["End User"]
end

subgraph Auth["Authentication"]
  Cognito["Amazon Cognito"]
end

subgraph API["API Layer"]
${apiSubgraphLines}
end

subgraph Compute["Compute Layer"]
${computeSubgraphLines}
end

subgraph Messaging["Async Messaging"]
${messagingSubgraphLines}
end

subgraph Data["Data Layer"]
${dataSubgraphLines}
end

subgraph Storage["Storage and CDN"]
${storageSubgraphLines}
end

${allEdges}`;

    // Ask Llama to validate and lightly correct — not invent from scratch
    const step4System = `
You are a Mermaid.js syntax validator.

You will receive a pre-built Mermaid flowchart. Your job is to:
1. Verify every line is syntactically correct Mermaid
2. Fix any issues ONLY — do NOT add or remove nodes or edges
3. Output the corrected diagram and NOTHING else

MERMAID SYNTAX RULES:
- First line must be exactly: graph TD
- Node format: NodeID["Label in double quotes"]
  Correct:   APIGateway["API Gateway REST"]
  Wrong:     APIGateway[API Gateway (REST)]
  Wrong:     APIGateway["API Gateway (REST)"]  ← parens in labels cause parse errors, remove them
- Edge format: A --> B  or  A -->|"label"| B
- One edge per line — never chain: A --> B --> C
- No duplicate edges
- subgraph must close with end
- No triple backticks, no prose, no comments except %% style

OUTPUT: raw Mermaid code only, starting with graph TD
`;

    const step4User = `Validate and fix this diagram:\n\n${preBuildDiagram}`;

    const rawMermaid  = await callLlama(step4System, step4User, 1200);
    parsed.mermaid    = sanitizeMermaid(rawMermaid);

    // Fallback: if Llama garbled it, use the pre-built diagram directly
    if (!parsed.mermaid.startsWith("graph")) {
      console.warn("Step 4: Llama output invalid — using pre-built diagram as fallback");
      parsed.mermaid = sanitizeMermaid(preBuildDiagram);
    }

    console.log("STEP 4 MERMAID:\n", parsed.mermaid);

    // ─── STEP 5: Gemini Validation & Refinement ───────────────────────────────
    console.log("STEP 5 (Gemini) START");
    let finalData;
    try {
      finalData = await refineWithGemini(parsed);
      console.log("STEP 5 DONE");
    } catch (e) {
      console.error("Gemini failed — using Step 4 output:", e.message);
      finalData = parsed;
    }

    res.json({ success: true, data: finalData });

  } catch (err) {
    console.error("Pipeline Error:", err);
    res.status(500).json({ success: false, error: err.name, message: err.message });
  }
});

/* =========================
   Gemini Refinement (Step 5)
========================= */
async function refineWithGemini(data) {
  const prompt = `
You are a strict AWS architecture validator. Validate the JSON below and return a corrected version.

INPUT JSON:
${JSON.stringify(data, null, 2)}

VALIDATION CHECKS:

1. MERMAID SYNTAX
   - First line must be exactly: graph TD
   - Every node: NodeID["Label"] — double-quoted labels, NO parentheses inside labels
     WRONG:  ECS["Amazon ECS (Fargate)"]
     RIGHT:  ECS["Amazon ECS Fargate"]
   - No backticks or markdown fences anywhere
   - No chained edges (A --> B --> C) — must be split into two lines
   - No duplicate edges
   - All subgraphs must close with end

2. SERVICE CONSISTENCY
   - Every service in aws_services must appear in at least one architecture_overview flow
   - Every node in the mermaid diagram must map to a service in aws_services
   - If a node has no matching service, remove the node and its edges

3. COST SANITY
   - per_service costs must sum to approximately monthly_estimate
   - Costs must be realistic for the stated scale

4. FLOW LOGIC
   - ElastiCache must NOT connect directly to DynamoDB
   - SQS must always point to a Lambda Worker
   - User must connect to Cognito before API Gateway

OUTPUT RULES:
- Return ONLY valid JSON, no markdown, no backticks, no explanatory text
- Preserve the exact schema structure of the input
- mermaid field must use literal newlines, not \\n escape sequences
- All JSON strings must be properly escaped
`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-pro"];
  let text = "";

  for (const modelName of modelsToTry) {
    try {
      console.log(`Gemini trying: ${modelName}`);
      const model  = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      text = result.response.text();
      console.log(`Gemini OK: ${modelName}`);
      break;
    } catch (err) {
      console.warn(`Gemini ${modelName} failed:`, err.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        throw new Error("All Gemini fallback attempts failed.");
      }
    }
  }

  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd   = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON in Gemini response");
    const refined = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    if (refined.mermaid) refined.mermaid = sanitizeMermaid(refined.mermaid);
    return refined;
  } catch (err) {
    console.error("Gemini parse failed:", err.message);
    return data;
  }
}

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AWS Architect Agent running on port ${PORT}`);
});