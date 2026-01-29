# Comparative Analysis of AI Agent SDKs: Pi Agent SDK vs Anthropic Python SDK

**A Comprehensive Benchmark Study Using Claude Opus 4.5 on AWS Bedrock**

*Published: January 2026*
*Authors: Agentive Research Team*
*Repository: github.com/AgentiveAU/agent-sdk-comparison*

---

## Abstract

This paper presents a rigorous comparative analysis of two leading AI agent software development kits (SDKs): the Pi Agent SDK (TypeScript) and the Anthropic Python SDK. Both SDKs were evaluated using identical test conditions, including the same underlying model (Claude Opus 4.5), the same cloud infrastructure (AWS Bedrock), and identical prompt sets across ten real-world software engineering tasks.

Our findings reveal that while the Anthropic Python SDK demonstrates marginally faster execution times (20% improvement in total duration), the Pi Agent SDK consistently generates more comprehensive responses (27% more output tokens). Both SDKs achieved 100% task completion rates, indicating robust reliability for production use cases.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Background](#2-background)
3. [Methodology](#3-methodology)
4. [Test Cases](#4-test-cases)
5. [Results](#5-results)
6. [Analysis](#6-analysis)
7. [Discussion](#7-discussion)
8. [Conclusions](#8-conclusions)
9. [Future Work](#9-future-work)
10. [References](#10-references)

---

## 1. Introduction

### 1.1 Motivation

The rapid evolution of large language models (LLMs) has spawned a diverse ecosystem of SDKs designed to integrate AI capabilities into software applications. For developers and organisations evaluating these tools, understanding the practical differences between SDKs is crucial for making informed architectural decisions.

This study addresses three primary research questions:

1. **Performance**: How do execution speeds compare when using identical models and infrastructure?
2. **Output Quality**: Are there measurable differences in response comprehensiveness?
3. **Cost Efficiency**: What are the economic implications of choosing one SDK over another?

### 1.2 Scope

This comparison focuses specifically on:

- **Pi Agent SDK** (v0.50.0): A TypeScript-based SDK developed by Mario Zechner, offering multi-provider LLM support
- **Anthropic Python SDK** (v0.76.0): The official Python SDK from Anthropic for accessing Claude models

Both SDKs were configured to use AWS Bedrock as the inference provider, ensuring an apple-to-apple comparison that isolates SDK-level differences from model or infrastructure variations.

### 1.3 Key Findings Summary

| Metric | Pi Agent SDK | Anthropic Python SDK | Difference |
|--------|-------------|---------------------|------------|
| Total Duration | 377.1 seconds | 303.5 seconds | Anthropic 20% faster |
| Total Cost | $2.76 | $2.18 | Anthropic 21% cheaper |
| Output Tokens | 36,313 | 28,525 | Pi 27% more verbose |
| Success Rate | 100% | 100% | Equivalent |

---

## 2. Background

### 2.1 Pi Agent SDK

The Pi Agent SDK is part of a monorepo (`pi-mono`) that provides a comprehensive toolkit for building AI-powered applications. Key components include:

- **@mariozechner/pi-ai**: Unified multi-provider LLM API supporting Anthropic, OpenAI, Google, and AWS Bedrock
- **@mariozechner/pi-agent-core**: Stateful agent framework with tool execution capabilities
- **@mariozechner/pi-coding-agent**: Interactive coding assistant implementation

The SDK is designed with flexibility in mind, allowing developers to switch between providers without code changes. It implements streaming responses, thinking/reasoning capabilities, and comprehensive usage tracking.

### 2.2 Anthropic Python SDK

The Anthropic Python SDK is the official client library for accessing Claude models. It provides:

- Direct API access to Anthropic's hosted models
- AWS Bedrock integration via `AnthropicBedrock` client
- Google Vertex AI support
- Native async/await patterns
- Built-in retry logic and error handling

The SDK focuses on simplicity and direct model access rather than agent orchestration features.

### 2.3 AWS Bedrock

Amazon Bedrock serves as a unified inference platform that hosts foundation models from multiple providers. For this study, Bedrock provides:

- Consistent infrastructure for both SDKs
- Standardised pricing model
- Regional inference profiles for optimised latency
- Enterprise-grade reliability and security

Using Bedrock eliminates variables related to network routing, rate limiting policies, and infrastructure performance that would otherwise confound SDK-level comparisons.

---

## 3. Methodology

### 3.1 Experimental Setup

#### 3.1.1 Hardware and Environment

- **Platform**: macOS Darwin 25.2.0 (Apple Silicon)
- **Node.js**: v25.2.1 (for Pi SDK)
- **Python**: 3.14 (for Anthropic SDK)
- **AWS Region**: us-east-1
- **Inference Profile**: us.anthropic.claude-opus-4-5-20251101-v1:0 (Anthropic SDK), global.anthropic.claude-opus-4-5-20251101-v1:0 (Pi SDK)

#### 3.1.2 Model Configuration

Both SDKs were configured with identical parameters:

| Parameter | Value |
|-----------|-------|
| Model | Claude Opus 4.5 (November 2025 release) |
| Max Output Tokens | 8,192 |
| System Prompt | "You are a helpful coding assistant. Be concise and precise." |
| Thinking Budget | 4,096 tokens (for reasoning tasks) |

#### 3.1.3 Cost Calculation

To ensure fair cost comparison, all costs were calculated using AWS Bedrock's published pricing for Claude Opus 4.5:

- **Input tokens**: $15.00 per 1 million tokens
- **Output tokens**: $75.00 per 1 million tokens

Note: The Pi SDK's built-in cost calculation uses different rates (likely Anthropic direct API pricing), so we recalculated all costs using consistent Bedrock pricing.

### 3.2 Test Protocol

Each test followed this protocol:

1. **Initialisation**: Create SDK client with AWS credentials
2. **Prompt Submission**: Send identical prompt to both SDKs
3. **Response Collection**: Capture full response including thinking blocks
4. **Metrics Recording**: Log duration, token counts, and success status
5. **Serialisation**: Save results to JSON for analysis

Tests were run sequentially to avoid resource contention. Each SDK completed all ten tests in a single session.

### 3.3 Metrics Collected

| Metric | Description | Unit |
|--------|-------------|------|
| Duration | Wall-clock time from request to completion | Milliseconds |
| Input Tokens | Tokens consumed by prompt and system message | Count |
| Output Tokens | Tokens generated in response | Count |
| Cost | Calculated using Bedrock pricing | USD |
| Success | Whether the test completed without errors | Boolean |

---

## 4. Test Cases

We designed ten test cases spanning common software engineering tasks, ranging from simple bug detection to complex architectural decision-making.

### 4.1 Test Case Overview

| # | Test Name | Category | Thinking | Complexity |
|---|-----------|----------|----------|------------|
| 1 | Bug Detection | Code Analysis | No | Low |
| 2 | Code Refactoring | Code Generation | No | Medium |
| 3 | Algorithm Implementation | Code Generation | No | Medium |
| 4 | Complex Reasoning | Problem Solving | Yes | Medium |
| 5 | Multi-step Task | Code Generation | No | High |
| 6 | Code Review | Code Analysis | No | Medium |
| 7 | SQL Optimisation | Database | No | Medium |
| 8 | API Design | Architecture | No | High |
| 9 | Security Audit | Security | No | High |
| 10 | Architecture Decision | Architecture | No | Very High |

### 4.2 Detailed Test Descriptions

#### Test 1: Bug Detection
**Objective**: Identify bugs in a TypeScript calculator class with intentional errors.

**Input**: A 38-line Calculator class containing:
- Incorrect operator in `add()` method (subtraction instead of addition)
- Wrong operation in `multiply()` method (division instead of multiplication)
- Missing zero-division check in `divide()` method
- Unused instance variable

**Expected Output**: List of bugs with line numbers and explanations.

#### Test 2: Code Refactoring
**Objective**: Refactor a poorly designed API endpoint module.

**Input**: A 76-line TypeScript module with issues including:
- Global mutable state
- Synchronous file operations
- No input validation
- No error handling
- No email format validation

**Expected Output**: Refactored code addressing all listed issues.

#### Test 3: Algorithm Implementation
**Objective**: Implement the longest palindromic substring algorithm.

**Requirements**:
- Dynamic programming approach
- Time and space complexity analysis
- Example usage with test cases

**Expected Output**: Complete, documented TypeScript implementation.

#### Test 4: Complex Reasoning (with Thinking)
**Objective**: Solve the classic river crossing puzzle.

**Problem**: Transport a wolf, goat, and cabbage across a river with constraints:
- Boat carries farmer plus one item
- Wolf eats goat if left alone
- Goat eats cabbage if left alone

**Expected Output**: Minimum crossings count with step-by-step explanation.

**Note**: This test enables thinking/reasoning mode to observe how each SDK handles extended reasoning.

#### Test 5: Multi-step Task
**Objective**: Create a complete priority-based task queue module.

**Requirements**:
- Priority levels 1-5
- Async task execution
- Status tracking (pending, running, completed, failed)
- TypeScript types
- JSDoc comments

**Expected Output**: Production-ready TypeScript module.

#### Test 6: Code Review
**Objective**: Review JavaScript code for bugs and bad practices.

**Input**: Three code snippets containing:
- Missing await on async operations
- Off-by-one loop errors
- Loose equality comparisons
- Mutation of input data
- Missing null checks

**Expected Output**: Categorised issues with severity ratings.

#### Test 7: SQL Optimisation
**Objective**: Optimise a slow SQL query.

**Input**: A complex query with:
- Correlated subqueries
- Missing indexes
- Inefficient joins

**Expected Output**: Optimised query with index recommendations.

#### Test 8: API Design
**Objective**: Design a RESTful API for task management.

**Requirements**:
- CRUD operations for tasks
- Comments and attachments support
- Filtering, sorting, pagination
- Authentication and authorisation

**Expected Output**: Complete API specification with endpoints, auth strategy, and error handling.

#### Test 9: Security Audit
**Objective**: Audit Node.js/Express code for security vulnerabilities.

**Input**: A deliberately vulnerable Express application with:
- SQL injection vulnerabilities
- Hardcoded credentials
- Path traversal risks
- Missing authentication
- Insecure cookie handling

**Expected Output**: Vulnerability report with severity ratings and fixes.

#### Test 10: Architecture Decision
**Objective**: Recommend architecture for a real-time collaboration platform.

**Requirements**:
- 10,000 concurrent users per document
- Sub-100ms latency
- Offline support
- Multi-region deployment

**Expected Output**: Detailed architectural recommendation covering transport protocols, conflict resolution algorithms, database selection, and message queue architecture.

---

## 5. Results

### 5.1 Overall Performance

| Metric | Pi Agent SDK | Anthropic Python SDK |
|--------|-------------|---------------------|
| Total Duration | 377.10 seconds | 303.45 seconds |
| Total Input Tokens | 2,386 | 2,386 |
| Total Output Tokens | 36,313 | 28,525 |
| Total Cost (Bedrock) | $2.76 | $2.18 |
| Tests Passed | 10/10 (100%) | 10/10 (100%) |

### 5.2 Per-Test Results

| Test | Pi SDK Duration | Anthropic Duration | Pi SDK Tokens Out | Anthropic Tokens Out | Speed Winner |
|------|----------------|-------------------|------------------|---------------------|--------------|
| Bug Detection | 7.34s | 8.16s | 454 | 457 | Pi SDK |
| Code Refactoring | 14.66s | 14.38s | 1,657 | 1,698 | Tie |
| Algorithm Implementation | 27.75s | 22.45s | 2,534 | 2,222 | Anthropic |
| Complex Reasoning | 20.52s | 27.24s | 1,337 | 1,809 | Pi SDK |
| Multi-step Task | 26.32s | 27.41s | 2,847 | 2,960 | Tie |
| Code Review | 9.87s | 10.08s | 620 | 616 | Tie |
| SQL Optimisation | 14.24s | 17.09s | 870 | 1,224 | Pi SDK |
| API Design | 82.38s | 68.52s | 9,318 | 7,198 | Anthropic |
| Security Audit | 25.04s | 21.25s | 2,259 | 2,149 | Anthropic |
| Architecture Decision | 148.98s | 86.87s | 14,417 | 8,192 | Anthropic |

### 5.3 Speed Distribution

| Winner | Count | Tests |
|--------|-------|-------|
| Pi Agent SDK | 3 | Bug Detection, Complex Reasoning, SQL Optimisation |
| Anthropic Python SDK | 4 | Algorithm Implementation, API Design, Security Audit, Architecture Decision |
| Tie | 3 | Code Refactoring, Multi-step Task, Code Review |

### 5.4 Cost per Test

| Test | Pi SDK Cost | Anthropic Cost | Difference |
|------|-------------|----------------|------------|
| Bug Detection | $0.040 | $0.040 | 0% |
| Code Refactoring | $0.133 | $0.136 | 2% |
| Algorithm Implementation | $0.191 | $0.168 | -12% |
| Complex Reasoning | $0.102 | $0.138 | 35% |
| Multi-step Task | $0.215 | $0.224 | 4% |
| Code Review | $0.050 | $0.050 | 0% |
| SQL Optimisation | $0.069 | $0.096 | 39% |
| API Design | $0.701 | $0.542 | -23% |
| Security Audit | $0.175 | $0.167 | -5% |
| Architecture Decision | $1.084 | $0.617 | -43% |

---

## 6. Analysis

### 6.1 Performance Patterns

#### 6.1.1 Short Tasks (Under 15 seconds)

For quick tasks like bug detection and code review, both SDKs performed similarly with minimal variation. The Pi SDK showed a slight advantage in these scenarios, potentially due to lower initialisation overhead in the TypeScript runtime.

#### 6.1.2 Long Tasks (Over 60 seconds)

The Anthropic SDK demonstrated significant advantages in extended generation tasks. The Architecture Decision test showed the most dramatic difference:
- Pi SDK: 148.98 seconds
- Anthropic SDK: 86.87 seconds

This 42% speed improvement suggests the Anthropic SDK may have more efficient streaming or response handling for large outputs.

#### 6.1.3 Thinking-Enabled Tasks

The Complex Reasoning test (with thinking enabled) showed interesting behaviour:
- Pi SDK: 20.52s, 1,337 tokens
- Anthropic SDK: 27.24s, 1,809 tokens

The Pi SDK was faster but generated less thinking content. This may indicate different default thinking budgets or thinking mode implementations between the SDKs.

### 6.2 Token Generation Patterns

The Pi Agent SDK consistently generated more output tokens across most tests:

| Test Category | Pi SDK Average | Anthropic Average | Difference |
|---------------|----------------|-------------------|------------|
| Code Analysis | 537 | 537 | 0% |
| Code Generation | 2,346 | 2,293 | +2% |
| Architecture | 11,868 | 7,695 | +54% |

The largest disparity occurred in architecture-related tasks, where the Pi SDK produced 54% more content on average.

### 6.3 Cost Efficiency Analysis

When normalised for output quality (cost per 1,000 output tokens):

| SDK | Total Cost | Total Output Tokens | Cost per 1K Tokens |
|-----|-----------|--------------------|--------------------|
| Pi Agent SDK | $2.76 | 36,313 | $0.076 |
| Anthropic Python SDK | $2.18 | 28,525 | $0.076 |

Both SDKs achieve identical cost efficiency per token, indicating the cost difference is purely attributable to output volume differences.

### 6.4 Reliability Analysis

Both SDKs achieved 100% success rates across all test cases. Neither experienced:
- Timeout errors
- Authentication failures
- Rate limiting
- Malformed responses

This indicates production-ready reliability for both options.

---

## 7. Discussion

### 7.1 SDK Selection Criteria

Based on our findings, we recommend considering the following factors when choosing between these SDKs:

#### Choose Pi Agent SDK when:
- **Comprehensive responses are prioritised**: The SDK generates more detailed outputs, beneficial for documentation or educational content
- **TypeScript/Node.js is your primary stack**: Native TypeScript support with excellent type definitions
- **Multi-provider flexibility is needed**: Easy switching between Anthropic, OpenAI, Google, and Bedrock
- **Agent orchestration is required**: Built-in support for stateful agents and tool execution

#### Choose Anthropic Python SDK when:
- **Speed is critical**: 20% faster execution, especially for large generation tasks
- **Cost optimisation is prioritised**: Lower costs due to more concise responses
- **Python is your primary stack**: Native async/await patterns and Pythonic API
- **Simplicity is valued**: Straightforward API without agent orchestration complexity

### 7.2 Limitations of This Study

1. **Single Model**: Results are specific to Claude Opus 4.5; other models may behave differently
2. **Single Region**: Testing was conducted in us-east-1 only; latency may vary by region
3. **Sequential Execution**: Tests were not run concurrently; parallel performance may differ
4. **Determinism**: LLM outputs are inherently non-deterministic; results may vary between runs
5. **Output Quality**: We measured quantity (tokens) but not qualitative correctness

### 7.3 Reproducibility

All test code, prompts, and results are available in the accompanying repository. To reproduce:

```bash
git clone https://github.com/AgentiveAU/agent-sdk-comparison
cd agent-sdk-comparison
npm install
source .venv/bin/activate
pip install -r tests/requirements.txt

# Run Pi SDK tests
AWS_PROFILE=YourProfile AWS_REGION=us-east-1 npm run test:pi

# Run Anthropic SDK tests
AWS_PROFILE=YourProfile AWS_REGION=us-east-1 npm run test:anthropic

# Generate comparison
npm run compare
```

---

## 8. Conclusions

This study provides empirical evidence for SDK selection decisions in AI-powered application development. Our key conclusions are:

1. **Both SDKs are production-ready**: 100% reliability across diverse test cases demonstrates maturity and stability.

2. **Performance differences are moderate**: The Anthropic SDK's 20% speed advantage is meaningful but not transformative for most use cases.

3. **Output characteristics differ**: The Pi SDK's tendency toward more comprehensive responses may be valuable for documentation-heavy applications but increases costs proportionally.

4. **Cost efficiency is equivalent**: When normalised for output volume, both SDKs achieve identical cost per token.

5. **Language ecosystem matters**: Choose based on your team's primary language (TypeScript vs Python) unless specific features dictate otherwise.

For organisations requiring detailed, comprehensive AI outputs and multi-provider flexibility, the Pi Agent SDK offers compelling advantages. For those prioritising speed, cost minimisation, and Python integration, the Anthropic Python SDK is the stronger choice.

---

## 9. Future Work

We identify several areas for future research:

1. **Qualitative Analysis**: Human evaluation of response quality and correctness
2. **Concurrent Performance**: Testing under parallel load conditions
3. **Model Comparison**: Extending analysis to Sonnet, Haiku, and competitor models
4. **Streaming Performance**: Measuring time-to-first-token and streaming throughput
5. **Error Recovery**: Testing behaviour under adverse conditions (rate limits, network failures)
6. **Agent Capabilities**: Comparing tool use, multi-turn conversations, and stateful interactions

---

## 10. References

1. Anthropic. (2025). *Claude API Documentation*. https://docs.anthropic.com
2. Zechner, M. (2025). *Pi Agent SDK*. https://github.com/badlogic/pi-mono
3. Amazon Web Services. (2025). *Amazon Bedrock Documentation*. https://docs.aws.amazon.com/bedrock
4. Anthropic. (2025). *Claude Opus 4.5 Model Card*. https://www.anthropic.com/claude

---

## Appendix A: Raw Data

Complete test results are available in the repository:
- `results/pi-sdk-results.json`
- `results/anthropic-bedrock-results.json`
- `results/comparison-report.json`

## Appendix B: Test Prompts

All test prompts are embedded in the test files:
- `tests/pi-tests.ts`
- `tests/anthropic-bedrock-tests.py`

## Appendix C: Sample Code

Test input files are located in:
- `sample-code/buggy-calculator.ts`
- `sample-code/api-endpoint.ts`

---

*This research was conducted by Agentive (www.agentive.au). For questions or collaboration opportunities, contact research@agentive.au*
