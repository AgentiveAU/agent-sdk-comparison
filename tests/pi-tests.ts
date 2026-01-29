/**
 * Pi Agent SDK Test Suite
 * Tests various capabilities using Claude Opus 4.5
 */

import { Agent, type AgentTool } from "@mariozechner/pi-agent-core";
import { getModel, complete, stream, Type, type Context, type Tool } from "@mariozechner/pi-ai";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const RESULTS_DIR = join(import.meta.dirname, "../results");
mkdirSync(RESULTS_DIR, { recursive: true });

interface TestResult {
  testName: string;
  framework: "pi-agent-sdk";
  model: string;
  prompt: string;
  response: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

const results: TestResult[] = [];

// Get Opus 4.5 model via AWS Bedrock
// Using global inference profile for cross-region access
const model = getModel("amazon-bedrock", "global.anthropic.claude-opus-4-5-20251101-v1:0");

console.log("=".repeat(60));
console.log("Pi Agent SDK Test Suite");
console.log(`Model: ${model.name} (${model.id})`);
console.log("=".repeat(60));

async function runTest(
  testName: string,
  prompt: string,
  options?: { thinking?: boolean }
): Promise<TestResult> {
  console.log(`\n[TEST] ${testName}`);
  console.log("-".repeat(40));

  const startTime = Date.now();
  let response = "";
  let tokensIn = 0;
  let tokensOut = 0;
  let cost = 0;
  let success = true;
  let error: string | undefined;

  try {
    const context: Context = {
      systemPrompt: "You are a helpful coding assistant. Be concise and precise.",
      messages: [{ role: "user", content: prompt }],
    };

    // For Bedrock, use 'reasoning' parameter instead of 'thinkingEnabled'
    const result = await complete(model, context, {
      reasoning: options?.thinking ? "medium" : undefined,
      thinkingBudgets: options?.thinking ? { medium: 4096 } : undefined,
    });

    for (const block of result.content) {
      if (block.type === "text") {
        response += block.text;
      } else if (block.type === "thinking") {
        response += `[THINKING]\n${block.thinking}\n[/THINKING]\n`;
      }
    }

    tokensIn = result.usage.input;
    tokensOut = result.usage.output;
    cost = result.usage.cost.total;
  } catch (e) {
    success = false;
    error = e instanceof Error ? e.message : String(e);
    response = `ERROR: ${error}`;
  }

  const durationMs = Date.now() - startTime;

  console.log(`Duration: ${durationMs}ms`);
  console.log(`Tokens: ${tokensIn} in / ${tokensOut} out`);
  console.log(`Cost: $${cost.toFixed(4)}`);
  console.log(`Response preview: ${response.slice(0, 200)}...`);

  return {
    testName,
    framework: "pi-agent-sdk",
    model: model.id,
    prompt,
    response,
    tokensIn,
    tokensOut,
    cost,
    durationMs,
    success,
    error,
  };
}

// ============================================
// TEST 1: Bug Detection
// ============================================
async function testBugDetection() {
  const code = readFileSync(
    join(import.meta.dirname, "../sample-code/buggy-calculator.ts"),
    "utf-8"
  );

  return runTest(
    "Bug Detection",
    `Analyse this TypeScript code and identify all bugs. List each bug with line number and explanation:\n\n\`\`\`typescript\n${code}\n\`\`\``
  );
}

// ============================================
// TEST 2: Code Refactoring
// ============================================
async function testCodeRefactoring() {
  const code = readFileSync(
    join(import.meta.dirname, "../sample-code/api-endpoint.ts"),
    "utf-8"
  );

  return runTest(
    "Code Refactoring",
    `Refactor this TypeScript code to fix the issues listed in the comments. Provide the improved code:\n\n\`\`\`typescript\n${code}\n\`\`\``
  );
}

// ============================================
// TEST 3: Algorithm Implementation
// ============================================
async function testAlgorithmImplementation() {
  return runTest(
    "Algorithm Implementation",
    `Implement a TypeScript function that finds the longest palindromic substring in a string. Include:
1. The implementation using dynamic programming
2. Time and space complexity analysis
3. Example usage with test cases`
  );
}

// ============================================
// TEST 4: Complex Reasoning (with thinking)
// ============================================
async function testComplexReasoning() {
  return runTest(
    "Complex Reasoning",
    `A farmer needs to transport a wolf, a goat, and a cabbage across a river. The boat can only carry the farmer and one item at a time. If left alone:
- The wolf will eat the goat
- The goat will eat the cabbage

Find the minimum number of crossings and explain each step.`,
    { thinking: true }
  );
}

// ============================================
// TEST 5: Multi-step Task
// ============================================
async function testMultiStepTask() {
  return runTest(
    "Multi-step Task",
    `Create a complete TypeScript module for a simple task queue with these features:
1. Add tasks with priority (1-5)
2. Process tasks in priority order (highest first)
3. Support async task execution
4. Track task status (pending, running, completed, failed)
5. Include proper TypeScript types
6. Add JSDoc comments

Provide the complete, working code.`
  );
}

// ============================================
// TEST 6: Code Review
// ============================================
async function testCodeReview() {
  const code = `
async function fetchUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = response.json();
  return data;
}

function processUsers(users) {
  let result = [];
  for (let i = 0; i <= users.length; i++) {
    if (users[i].active == true) {
      result.push(users[i].name.toUpperCase());
    }
  }
  return result;
}

class DataProcessor {
  data = null;

  async load(url) {
    this.data = await fetch(url).then(r => r.json());
  }

  process() {
    return this.data.map(item => {
      item.processed = true;
      return item;
    });
  }
}`;

  return runTest(
    "Code Review",
    `Review this JavaScript code and identify all issues (bugs, bad practices, potential errors). Rate severity (high/medium/low) for each:\n\n\`\`\`javascript\n${code}\n\`\`\``
  );
}

// ============================================
// TEST 7: SQL Optimisation
// ============================================
async function testSqlOptimisation() {
  const sql = `
-- Slow query that needs optimisation
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent,
    (SELECT MAX(created_at) FROM orders WHERE user_id = u.id) as last_order_date
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
AND u.status = 'active'
AND (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND status = 'completed') > 5
GROUP BY u.id, u.name, u.email
HAVING SUM(o.total) > 1000
ORDER BY total_spent DESC
LIMIT 100;
`;

  return runTest(
    "SQL Optimisation",
    `Analyse this SQL query and optimise it for better performance. Explain the issues and provide the optimised query with index recommendations:\n\n\`\`\`sql\n${sql}\n\`\`\``
  );
}

// ============================================
// TEST 8: API Design
// ============================================
async function testApiDesign() {
  return runTest(
    "API Design",
    `Design a RESTful API for a task management system with the following requirements:
1. Users can create, read, update, delete tasks
2. Tasks have: title, description, status, priority, due date, assignee
3. Tasks can have comments and attachments
4. Support filtering, sorting, and pagination
5. Include authentication and authorisation

Provide:
- API endpoint specifications (method, path, request/response)
- Authentication approach
- Error handling strategy
- Rate limiting recommendations`
  );
}

// ============================================
// TEST 9: Security Audit
// ============================================
async function testSecurityAudit() {
  const code = `
const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'users'
});

app.get('/user', (req, res) => {
  const userId = req.query.id;
  db.query(\`SELECT * FROM users WHERE id = \${userId}\`, (err, results) => {
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(\`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`, (err, results) => {
    if (results.length > 0) {
      res.cookie('user', username);
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false });
    }
  });
});

app.get('/file', (req, res) => {
  const filename = req.query.name;
  res.sendFile('/uploads/' + filename);
});

app.listen(3000);
`;

  return runTest(
    "Security Audit",
    `Perform a security audit on this Node.js/Express code. Identify all security vulnerabilities, rate their severity (Critical/High/Medium/Low), and provide fixes:\n\n\`\`\`javascript\n${code}\n\`\`\``
  );
}

// ============================================
// TEST 10: Architecture Decision
// ============================================
async function testArchitectureDecision() {
  return runTest(
    "Architecture Decision",
    `A startup is building a real-time collaboration platform (like Google Docs) with these requirements:
- Support 10,000 concurrent users per document
- Sub-100ms latency for edits
- Offline support with sync
- Version history and conflict resolution
- Multi-region deployment

Compare and recommend architectures:
1. WebSocket vs Server-Sent Events vs WebRTC
2. CRDT vs Operational Transformation
3. Database choice (PostgreSQL vs MongoDB vs custom)
4. Message queue selection

Provide a detailed recommendation with trade-offs.`
  );
}

// ============================================
// RUN ALL TESTS
// ============================================
async function main() {
  console.log("\nStarting tests...\n");

  results.push(await testBugDetection());
  results.push(await testCodeRefactoring());
  results.push(await testAlgorithmImplementation());
  results.push(await testComplexReasoning());
  results.push(await testMultiStepTask());
  results.push(await testCodeReview());
  results.push(await testSqlOptimisation());
  results.push(await testApiDesign());
  results.push(await testSecurityAudit());
  results.push(await testArchitectureDecision());

  // Save results
  const outputPath = join(RESULTS_DIR, "pi-sdk-results.json");
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY - Pi Agent SDK");
  console.log("=".repeat(60));

  let totalCost = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalDuration = 0;

  for (const r of results) {
    console.log(`\n${r.testName}:`);
    console.log(`  Status: ${r.success ? "PASS" : "FAIL"}`);
    console.log(`  Duration: ${r.durationMs}ms`);
    console.log(`  Tokens: ${r.tokensIn} / ${r.tokensOut}`);
    console.log(`  Cost: $${r.cost.toFixed(4)}`);

    totalCost += r.cost;
    totalTokensIn += r.tokensIn;
    totalTokensOut += r.tokensOut;
    totalDuration += r.durationMs;
  }

  console.log("\n" + "-".repeat(40));
  console.log(`Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`Total Tokens: ${totalTokensIn} in / ${totalTokensOut} out`);
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log(`Tests Passed: ${results.filter((r) => r.success).length}/${results.length}`);
}

main().catch(console.error);
