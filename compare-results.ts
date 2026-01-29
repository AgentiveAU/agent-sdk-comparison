/**
 * SDK Comparison Results Generator
 * Compares Pi Agent SDK vs Claude Agent SDK test results
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

interface TestResult {
  testName: string;
  test_name?: string; // Python uses snake_case
  framework: string;
  model: string;
  prompt: string;
  response: string;
  tokensIn: number;
  tokens_in?: number;
  tokensOut: number;
  tokens_out?: number;
  cost: number;
  durationMs: number;
  duration_ms?: number;
  success: boolean;
  error?: string;
}

// Bedrock pricing for Claude Opus 4.5 (per 1M tokens)
const BEDROCK_INPUT_PRICE = 15.0;
const BEDROCK_OUTPUT_PRICE = 75.0;

function calculateBedrockCost(tokensIn: number, tokensOut: number): number {
  return (tokensIn / 1_000_000) * BEDROCK_INPUT_PRICE +
         (tokensOut / 1_000_000) * BEDROCK_OUTPUT_PRICE;
}

interface ComparisonResult {
  testName: string;
  piSdk: {
    duration: number;
    tokensIn: number;
    tokensOut: number;
    cost: number;
    success: boolean;
  };
  claudeSdk: {
    duration: number;
    tokensIn: number;
    tokensOut: number;
    cost: number;
    success: boolean;
  };
  winner: {
    speed: "pi" | "claude" | "tie";
    cost: "pi" | "claude" | "tie" | "unknown";
  };
}

const RESULTS_DIR = join(import.meta.dirname, "results");

function normaliseResult(r: TestResult): TestResult {
  const tokensIn = r.tokensIn || r.tokens_in || 0;
  const tokensOut = r.tokensOut || r.tokens_out || 0;
  // Always recalculate cost using consistent Bedrock pricing
  const cost = calculateBedrockCost(tokensIn, tokensOut);

  return {
    testName: r.testName || r.test_name || "Unknown",
    framework: r.framework,
    model: r.model,
    prompt: r.prompt,
    response: r.response,
    tokensIn,
    tokensOut,
    cost,
    durationMs: r.durationMs || r.duration_ms || 0,
    success: r.success,
    error: r.error,
  };
}

function loadResults(filename: string): TestResult[] | null {
  const path = join(RESULTS_DIR, filename);
  if (!existsSync(path)) {
    console.log(`Warning: ${filename} not found`);
    return null;
  }
  const data = JSON.parse(readFileSync(path, "utf-8"));
  return data.map(normaliseResult);
}

function compareResults(): void {
  console.log("\n" + "=".repeat(70));
  console.log("SDK COMPARISON RESULTS");
  console.log("Pi Agent SDK vs Anthropic Python SDK (both via Bedrock)");
  console.log("=".repeat(70));

  const piResults = loadResults("pi-sdk-results.json");
  const claudeResults = loadResults("anthropic-bedrock-results.json");

  if (!piResults && !claudeResults) {
    console.log("\nNo results found. Run the tests first:");
    console.log("  npm run test:pi");
    console.log("  npm run test:claude");
    return;
  }

  // Build comparison table
  const comparisons: ComparisonResult[] = [];
  const testNames = new Set<string>();

  piResults?.forEach((r) => testNames.add(r.testName));
  claudeResults?.forEach((r) => testNames.add(r.testName));

  for (const testName of testNames) {
    const piResult = piResults?.find((r) => r.testName === testName);
    const claudeResult = claudeResults?.find((r) => r.testName === testName);

    const comparison: ComparisonResult = {
      testName,
      piSdk: {
        duration: piResult?.durationMs || 0,
        tokensIn: piResult?.tokensIn || 0,
        tokensOut: piResult?.tokensOut || 0,
        cost: piResult?.cost || 0,
        success: piResult?.success || false,
      },
      claudeSdk: {
        duration: claudeResult?.durationMs || 0,
        tokensIn: claudeResult?.tokensIn || 0,
        tokensOut: claudeResult?.tokensOut || 0,
        cost: claudeResult?.cost || 0,
        success: claudeResult?.success || false,
      },
      winner: {
        speed: "tie",
        cost: "unknown",
      },
    };

    // Determine winners
    if (comparison.piSdk.duration && comparison.claudeSdk.duration) {
      if (comparison.piSdk.duration < comparison.claudeSdk.duration * 0.9) {
        comparison.winner.speed = "pi";
      } else if (
        comparison.claudeSdk.duration <
        comparison.piSdk.duration * 0.9
      ) {
        comparison.winner.speed = "claude";
      }
    }

    if (comparison.piSdk.cost > 0 && comparison.claudeSdk.cost > 0) {
      if (comparison.piSdk.cost < comparison.claudeSdk.cost * 0.9) {
        comparison.winner.cost = "pi";
      } else if (comparison.claudeSdk.cost < comparison.piSdk.cost * 0.9) {
        comparison.winner.cost = "claude";
      } else {
        comparison.winner.cost = "tie";
      }
    }

    comparisons.push(comparison);
  }

  // Print results
  for (const c of comparisons) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`Test: ${c.testName}`);
    console.log(`${"─".repeat(70)}`);

    // Pi SDK row
    const piTokens =
      c.piSdk.tokensIn > 0 ? `${c.piSdk.tokensIn}/${c.piSdk.tokensOut}` : "N/A";
    const piCost = c.piSdk.cost > 0 ? `$${c.piSdk.cost.toFixed(4)}` : "N/A";
    const piStatus = c.piSdk.success ? "✓" : "✗";
    console.log(
      `  Pi SDK:     ${(c.piSdk.duration / 1000).toFixed(2)}s | ${piTokens} tokens | ${piCost} | ${piStatus}`
    );

    // Claude SDK row
    const claudeTokens =
      c.claudeSdk.tokensIn > 0
        ? `${c.claudeSdk.tokensIn}/${c.claudeSdk.tokensOut}`
        : "N/A";
    const claudeCost =
      c.claudeSdk.cost > 0 ? `$${c.claudeSdk.cost.toFixed(4)}` : "N/A";
    const claudeStatus = c.claudeSdk.success ? "✓" : "✗";
    console.log(
      `  Claude SDK: ${(c.claudeSdk.duration / 1000).toFixed(2)}s | ${claudeTokens} tokens | ${claudeCost} | ${claudeStatus}`
    );

    // Winner
    const speedWinner =
      c.winner.speed === "tie"
        ? "Tie"
        : c.winner.speed === "pi"
          ? "Pi SDK (faster)"
          : "Claude SDK (faster)";
    console.log(`  Speed: ${speedWinner}`);
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));

  const piTotals = {
    duration: comparisons.reduce((sum, c) => sum + c.piSdk.duration, 0),
    tokensIn: comparisons.reduce((sum, c) => sum + c.piSdk.tokensIn, 0),
    tokensOut: comparisons.reduce((sum, c) => sum + c.piSdk.tokensOut, 0),
    cost: comparisons.reduce((sum, c) => sum + c.piSdk.cost, 0),
    passed: comparisons.filter((c) => c.piSdk.success).length,
  };

  const claudeTotals = {
    duration: comparisons.reduce((sum, c) => sum + c.claudeSdk.duration, 0),
    tokensIn: comparisons.reduce((sum, c) => sum + c.claudeSdk.tokensIn, 0),
    tokensOut: comparisons.reduce((sum, c) => sum + c.claudeSdk.tokensOut, 0),
    cost: comparisons.reduce((sum, c) => sum + c.claudeSdk.cost, 0),
    passed: comparisons.filter((c) => c.claudeSdk.success).length,
  };

  const speedWins = {
    pi: comparisons.filter((c) => c.winner.speed === "pi").length,
    claude: comparisons.filter((c) => c.winner.speed === "claude").length,
    tie: comparisons.filter((c) => c.winner.speed === "tie").length,
  };

  console.log("\nTotal Duration:");
  console.log(`  Pi SDK:     ${(piTotals.duration / 1000).toFixed(2)}s`);
  console.log(`  Claude SDK: ${(claudeTotals.duration / 1000).toFixed(2)}s`);

  console.log("\nTotal Tokens (in/out):");
  console.log(`  Pi SDK:     ${piTotals.tokensIn} / ${piTotals.tokensOut}`);
  console.log(
    `  Claude SDK: ${claudeTotals.tokensIn} / ${claudeTotals.tokensOut}`
  );

  console.log("\nTotal Cost:");
  console.log(`  Pi SDK:     $${piTotals.cost.toFixed(4)}`);
  console.log(`  Claude SDK: $${claudeTotals.cost.toFixed(4)}`);

  console.log("\nTests Passed:");
  console.log(`  Pi SDK:     ${piTotals.passed}/${comparisons.length}`);
  console.log(`  Claude SDK: ${claudeTotals.passed}/${comparisons.length}`);

  console.log("\nSpeed Wins:");
  console.log(
    `  Pi SDK: ${speedWins.pi} | Claude SDK: ${speedWins.claude} | Tie: ${speedWins.tie}`
  );

  // Overall winner
  console.log("\n" + "=".repeat(70));
  if (piTotals.duration < claudeTotals.duration * 0.9) {
    console.log("OVERALL SPEED WINNER: Pi Agent SDK");
  } else if (claudeTotals.duration < piTotals.duration * 0.9) {
    console.log("OVERALL SPEED WINNER: Claude Agent SDK");
  } else {
    console.log("OVERALL SPEED: Too close to call");
  }
  console.log("=".repeat(70) + "\n");

  // Save comparison report
  const reportPath = join(RESULTS_DIR, "comparison-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        comparisons,
        summary: {
          piTotals,
          claudeTotals,
          speedWins,
        },
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`Comparison report saved to: ${reportPath}`);
}

compareResults();
