"""
Anthropic Python SDK Test Suite (via AWS Bedrock)
Tests various capabilities using Claude Opus 4.5 on Bedrock
For apple-to-apple comparison with Pi Agent SDK
"""

import asyncio
import json
import os
import time
import boto3
from dataclasses import dataclass, asdict
from pathlib import Path

import anthropic

RESULTS_DIR = Path(__file__).parent.parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)

SAMPLE_CODE_DIR = Path(__file__).parent.parent / "sample-code"


@dataclass
class TestResult:
    test_name: str
    framework: str
    model: str
    prompt: str
    response: str
    tokens_in: int
    tokens_out: int
    cost: float
    duration_ms: int
    success: bool
    error: str | None = None


results: list[TestResult] = []

# Model to use (Opus 4.5 on Bedrock via global inference profile)
# Must use inference profile, not direct model ID
MODEL = "us.anthropic.claude-opus-4-5-20251101-v1:0"

# Bedrock pricing for Opus 4.5 (per 1M tokens)
INPUT_PRICE_PER_1M = 15.00
OUTPUT_PRICE_PER_1M = 75.00

print("=" * 60)
print("Anthropic Python SDK Test Suite (Bedrock)")
print(f"Model: {MODEL}")
print("=" * 60)


def calculate_cost(input_tokens: int, output_tokens: int) -> float:
    """Calculate cost based on Bedrock pricing."""
    input_cost = (input_tokens / 1_000_000) * INPUT_PRICE_PER_1M
    output_cost = (output_tokens / 1_000_000) * OUTPUT_PRICE_PER_1M
    return input_cost + output_cost


def run_test(
    client: anthropic.AnthropicBedrock,
    test_name: str,
    prompt: str,
    thinking: bool = False,
) -> TestResult:
    """Run a single test with the Anthropic SDK via Bedrock."""
    print(f"\n[TEST] {test_name}")
    print("-" * 40)

    start_time = time.time()
    response_text = ""
    tokens_in = 0
    tokens_out = 0
    cost = 0.0
    success = True
    error: str | None = None

    try:
        # Build request parameters
        params = {
            "model": MODEL,
            "max_tokens": 8192,
            "system": "You are a helpful coding assistant. Be concise and precise.",
            "messages": [{"role": "user", "content": prompt}],
        }

        # Add thinking if requested
        if thinking:
            params["thinking"] = {
                "type": "enabled",
                "budget_tokens": 4096
            }

        response = client.messages.create(**params)

        # Extract response content
        for block in response.content:
            if block.type == "text":
                response_text += block.text
            elif block.type == "thinking":
                response_text += f"[THINKING]\n{block.thinking}\n[/THINKING]\n"

        # Extract usage
        tokens_in = response.usage.input_tokens
        tokens_out = response.usage.output_tokens
        cost = calculate_cost(tokens_in, tokens_out)

    except Exception as e:
        success = False
        error = str(e)
        response_text = f"ERROR: {error}"

    duration_ms = int((time.time() - start_time) * 1000)

    print(f"Duration: {duration_ms}ms")
    print(f"Tokens: {tokens_in} in / {tokens_out} out")
    print(f"Cost: ${cost:.4f}")
    print(f"Response preview: {response_text[:200]}...")

    return TestResult(
        test_name=test_name,
        framework="anthropic-sdk-bedrock",
        model=MODEL,
        prompt=prompt,
        response=response_text,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        cost=cost,
        duration_ms=duration_ms,
        success=success,
        error=error,
    )


# ============================================
# TEST 1: Bug Detection
# ============================================
def test_bug_detection(client: anthropic.AnthropicBedrock) -> TestResult:
    code = (SAMPLE_CODE_DIR / "buggy-calculator.ts").read_text()
    return run_test(
        client,
        "Bug Detection",
        f"Analyse this TypeScript code and identify all bugs. List each bug with line number and explanation:\n\n```typescript\n{code}\n```",
    )


# ============================================
# TEST 2: Code Refactoring
# ============================================
def test_code_refactoring(client: anthropic.AnthropicBedrock) -> TestResult:
    code = (SAMPLE_CODE_DIR / "api-endpoint.ts").read_text()
    return run_test(
        client,
        "Code Refactoring",
        f"Refactor this TypeScript code to fix the issues listed in the comments. Provide the improved code:\n\n```typescript\n{code}\n```",
    )


# ============================================
# TEST 3: Algorithm Implementation
# ============================================
def test_algorithm_implementation(client: anthropic.AnthropicBedrock) -> TestResult:
    return run_test(
        client,
        "Algorithm Implementation",
        """Implement a TypeScript function that finds the longest palindromic substring in a string. Include:
1. The implementation using dynamic programming
2. Time and space complexity analysis
3. Example usage with test cases""",
    )


# ============================================
# TEST 4: Complex Reasoning (with thinking)
# ============================================
def test_complex_reasoning(client: anthropic.AnthropicBedrock) -> TestResult:
    return run_test(
        client,
        "Complex Reasoning",
        """A farmer needs to transport a wolf, a goat, and a cabbage across a river. The boat can only carry the farmer and one item at a time. If left alone:
- The wolf will eat the goat
- The goat will eat the cabbage

Find the minimum number of crossings and explain each step.""",
        thinking=True,
    )


# ============================================
# TEST 5: Multi-step Task
# ============================================
def test_multi_step_task(client: anthropic.AnthropicBedrock) -> TestResult:
    return run_test(
        client,
        "Multi-step Task",
        """Create a complete TypeScript module for a simple task queue with these features:
1. Add tasks with priority (1-5)
2. Process tasks in priority order (highest first)
3. Support async task execution
4. Track task status (pending, running, completed, failed)
5. Include proper TypeScript types
6. Add JSDoc comments

Provide the complete, working code.""",
    )


# ============================================
# TEST 6: Code Review
# ============================================
def test_code_review(client: anthropic.AnthropicBedrock) -> TestResult:
    code = """
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
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
}"""
    return run_test(
        client,
        "Code Review",
        f"Review this JavaScript code and identify all issues (bugs, bad practices, potential errors). Rate severity (high/medium/low) for each:\n\n```javascript\n{code}\n```",
    )


# ============================================
# NEW TEST 7: SQL Query Optimisation
# ============================================
def test_sql_optimisation(client: anthropic.AnthropicBedrock) -> TestResult:
    sql = """
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
"""
    return run_test(
        client,
        "SQL Optimisation",
        f"""Analyse this SQL query and optimise it for better performance. Explain the issues and provide the optimised query with index recommendations:

```sql
{sql}
```""",
    )


# ============================================
# NEW TEST 8: API Design
# ============================================
def test_api_design(client: anthropic.AnthropicBedrock) -> TestResult:
    return run_test(
        client,
        "API Design",
        """Design a RESTful API for a task management system with the following requirements:
1. Users can create, read, update, delete tasks
2. Tasks have: title, description, status, priority, due date, assignee
3. Tasks can have comments and attachments
4. Support filtering, sorting, and pagination
5. Include authentication and authorisation

Provide:
- API endpoint specifications (method, path, request/response)
- Authentication approach
- Error handling strategy
- Rate limiting recommendations""",
    )


# ============================================
# NEW TEST 9: Security Audit
# ============================================
def test_security_audit(client: anthropic.AnthropicBedrock) -> TestResult:
    code = """
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
  db.query(`SELECT * FROM users WHERE id = ${userId}`, (err, results) => {
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, results) => {
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
"""
    return run_test(
        client,
        "Security Audit",
        f"""Perform a security audit on this Node.js/Express code. Identify all security vulnerabilities, rate their severity (Critical/High/Medium/Low), and provide fixes:

```javascript
{code}
```""",
    )


# ============================================
# NEW TEST 10: Architecture Decision
# ============================================
def test_architecture_decision(client: anthropic.AnthropicBedrock) -> TestResult:
    return run_test(
        client,
        "Architecture Decision",
        """A startup is building a real-time collaboration platform (like Google Docs) with these requirements:
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

Provide a detailed recommendation with trade-offs.""",
    )


# ============================================
# RUN ALL TESTS
# ============================================
def main() -> None:
    print("\nInitialising Anthropic Bedrock client...")

    # Get AWS profile from environment or use default
    aws_profile = os.environ.get("AWS_PROFILE", "default")
    aws_region = os.environ.get("AWS_REGION", "us-east-1")

    print(f"Using AWS Profile: {aws_profile}")
    print(f"Using AWS Region: {aws_region}")

    # Create boto3 session with profile
    session = boto3.Session(profile_name=aws_profile, region_name=aws_region)
    credentials = session.get_credentials()

    # Create Bedrock client with explicit credentials
    client = anthropic.AnthropicBedrock(
        aws_region=aws_region,
        aws_access_key=credentials.access_key,
        aws_secret_key=credentials.secret_key,
        aws_session_token=credentials.token,
    )

    print("Starting tests...\n")

    results.append(test_bug_detection(client))
    results.append(test_code_refactoring(client))
    results.append(test_algorithm_implementation(client))
    results.append(test_complex_reasoning(client))
    results.append(test_multi_step_task(client))
    results.append(test_code_review(client))
    results.append(test_sql_optimisation(client))
    results.append(test_api_design(client))
    results.append(test_security_audit(client))
    results.append(test_architecture_decision(client))

    # Save results
    output_path = RESULTS_DIR / "anthropic-bedrock-results.json"
    with open(output_path, "w") as f:
        json.dump([asdict(r) for r in results], f, indent=2)
    print(f"\nResults saved to: {output_path}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY - Anthropic Python SDK (Bedrock)")
    print("=" * 60)

    total_cost = 0.0
    total_tokens_in = 0
    total_tokens_out = 0
    total_duration = 0

    for r in results:
        print(f"\n{r.test_name}:")
        print(f"  Status: {'PASS' if r.success else 'FAIL'}")
        print(f"  Duration: {r.duration_ms}ms")
        print(f"  Tokens: {r.tokens_in} / {r.tokens_out}")
        print(f"  Cost: ${r.cost:.4f}")

        total_cost += r.cost
        total_tokens_in += r.tokens_in
        total_tokens_out += r.tokens_out
        total_duration += r.duration_ms

    print("\n" + "-" * 40)
    print(f"Total Cost: ${total_cost:.4f}")
    print(f"Total Tokens: {total_tokens_in} in / {total_tokens_out} out")
    print(f"Total Duration: {total_duration}ms")
    print(f"Tests Passed: {len([r for r in results if r.success])}/{len(results)}")


if __name__ == "__main__":
    main()
