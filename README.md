# Agent SDK Comparison

<div align="center">

**A comprehensive benchmark comparing AI Agent SDKs using Claude Opus 4.5 on AWS Bedrock**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)

*Built by [Agentive](https://agentive.au) | AI That Builds and Improves Itself*

[Website](https://agentive.au) | [Research Paper](./PAPER.md) | [Results](./results/)

</div>

---

## Overview

This repository provides a rigorous, reproducible framework for comparing AI agent SDKs. The initial comparison evaluates:

- **[Pi Agent SDK](https://github.com/badlogic/pi-mono)** (TypeScript) by Mario Zechner
- **[Anthropic Python SDK](https://github.com/anthropics/anthropic-sdk-python)** (Python) by Anthropic

Both SDKs were tested using identical conditions: same model (Claude Opus 4.5), same infrastructure (AWS Bedrock), and identical test prompts across 10 real-world software engineering tasks.

### Why This Matters

Selecting the right AI agent SDK is a critical architectural decision. This benchmark provides empirical data to inform that choice, measuring real-world performance across diverse tasks rather than synthetic benchmarks.

---

## Key Findings

| Metric | Pi Agent SDK | Anthropic Python SDK | Winner |
|--------|-------------|---------------------|--------|
| **Total Duration** | 377.1s | 303.5s | Anthropic (20% faster) |
| **Total Cost** | $2.76 | $2.18 | Anthropic (21% cheaper) |
| **Output Tokens** | 36,313 | 28,525 | Pi (27% more detailed) |
| **Success Rate** | 100% | 100% | Tie |
| **Speed Wins** | 3 | 4 | Anthropic |

### Per-Test Results

| Test | Pi SDK | Anthropic SDK | Winner |
|------|--------|---------------|--------|
| Bug Detection | 7.3s | 8.2s | **Pi** |
| Code Refactoring | 14.7s | 14.4s | Tie |
| Algorithm Implementation | 27.8s | 22.5s | **Anthropic** |
| Complex Reasoning | 20.5s | 27.2s | **Pi** |
| Multi-step Task | 26.3s | 27.4s | Tie |
| Code Review | 9.9s | 10.1s | Tie |
| SQL Optimisation | 14.2s | 17.1s | **Pi** |
| API Design | 82.4s | 68.5s | **Anthropic** |
| Security Audit | 25.0s | 21.3s | **Anthropic** |
| Architecture Decision | 149.0s | 86.9s | **Anthropic** |

---

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Python 3.12+
- AWS account with Bedrock access (Claude Opus 4.5 enabled)
- AWS CLI configured with appropriate credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/AgentiveAU/agent-sdk-comparison
cd agent-sdk-comparison

# Install Node.js dependencies
npm install

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r tests/requirements.txt
```

### Running the Tests

```bash
# Set your AWS profile and region
export AWS_PROFILE=YourProfile
export AWS_REGION=us-east-1

# Run Pi Agent SDK tests (TypeScript)
npm run test:pi

# Run Anthropic Python SDK tests
npm run test:anthropic

# Generate comparison report
npm run compare
```

### Run Everything at Once

```bash
./run-comparison.sh
```

---

## Project Structure

```
agent-sdk-comparison/
├── README.md                 # This file
├── PAPER.md                  # Detailed research paper
├── LICENSE                   # MIT License
├── package.json              # Node.js project configuration
├── compare-results.ts        # Comparison report generator
├── run-comparison.sh         # All-in-one runner script
│
├── tests/
│   ├── pi-tests.ts                  # Pi Agent SDK test suite
│   ├── anthropic-bedrock-tests.py   # Anthropic SDK test suite
│   └── requirements.txt             # Python dependencies
│
├── sample-code/
│   ├── buggy-calculator.ts          # Test input: buggy code
│   └── api-endpoint.ts              # Test input: code to refactor
│
└── results/
    ├── pi-sdk-results.json          # Pi SDK test results
    ├── anthropic-bedrock-results.json   # Anthropic SDK results
    └── comparison-report.json       # Final comparison data
```

---

## Test Cases

The benchmark includes 10 diverse software engineering tasks:

| # | Test | Description | Thinking |
|---|------|-------------|----------|
| 1 | **Bug Detection** | Find bugs in TypeScript code | No |
| 2 | **Code Refactoring** | Improve poorly designed code | No |
| 3 | **Algorithm Implementation** | Implement longest palindromic substring | No |
| 4 | **Complex Reasoning** | Solve river crossing puzzle | Yes |
| 5 | **Multi-step Task** | Create priority task queue module | No |
| 6 | **Code Review** | Review JavaScript for issues | No |
| 7 | **SQL Optimisation** | Optimise slow database query | No |
| 8 | **API Design** | Design RESTful task management API | No |
| 9 | **Security Audit** | Find vulnerabilities in Express app | No |
| 10 | **Architecture Decision** | Recommend real-time collaboration architecture | No |

---

## Methodology

### Fair Comparison Principles

1. **Same Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
2. **Same Infrastructure**: AWS Bedrock (us-east-1)
3. **Same Prompts**: Identical test prompts for both SDKs
4. **Same Pricing**: Bedrock pricing ($15/1M input, $75/1M output)
5. **Same Parameters**: max_tokens=8192, thinking_budget=4096

### Metrics Collected

- **Duration**: Wall-clock time from request to completion
- **Input Tokens**: Tokens consumed by prompt
- **Output Tokens**: Tokens generated in response
- **Cost**: Calculated using consistent Bedrock pricing
- **Success**: Whether test completed without errors

---

## SDK Configuration

### Pi Agent SDK (TypeScript)

```typescript
import { getModel, complete } from "@mariozechner/pi-ai";

const model = getModel("amazon-bedrock", "global.anthropic.claude-opus-4-5-20251101-v1:0");

const result = await complete(model, context, {
  reasoning: "medium",           // Enable thinking
  thinkingBudgets: { medium: 4096 }
});
```

### Anthropic Python SDK

```python
import anthropic

client = anthropic.AnthropicBedrock(
    aws_region="us-east-1",
    aws_access_key=credentials.access_key,
    aws_secret_key=credentials.secret_key,
)

response = client.messages.create(
    model="us.anthropic.claude-opus-4-5-20251101-v1:0",
    max_tokens=8192,
    thinking={"type": "enabled", "budget_tokens": 4096}
)
```

---

## When to Choose Each SDK

### Choose Pi Agent SDK when:

- You need **comprehensive, detailed responses**
- Your stack is **TypeScript/Node.js**
- You want **multi-provider flexibility** (Anthropic, OpenAI, Google, Bedrock)
- You need **agent orchestration features** (tools, state management)

### Choose Anthropic Python SDK when:

- **Speed** is your top priority
- **Cost optimisation** matters (more concise = cheaper)
- Your stack is **Python**
- You prefer **simpler, direct API access**

---

## Adding New Frameworks

This benchmark is designed to be extensible. To add a new SDK:

1. Create a test file in `tests/` following the existing patterns
2. Implement the same 10 test cases with identical prompts
3. Output results in JSON format matching the schema
4. Add an npm script to `package.json`
5. Update `compare-results.ts` to include the new SDK
6. Submit a pull request

We welcome contributions comparing additional frameworks such as:
- LangChain
- LlamaIndex
- AutoGen
- CrewAI
- OpenAI Agents SDK

---

## Documentation

- **[PAPER.md](./PAPER.md)**: Full research paper with methodology, analysis, and conclusions
- **[results/comparison-report.json](./results/comparison-report.json)**: Raw comparison data
- **[tests/](./tests/)**: Complete test implementations

---

## Reproducing Results

Results may vary slightly due to LLM non-determinism. To reproduce:

1. Ensure AWS Bedrock access in us-east-1
2. Use the same model versions
3. Run tests sequentially (not in parallel)
4. Compare aggregate metrics rather than individual runs

---

## Contributing

Contributions welcome! Areas of interest:

- Additional test cases
- Support for other SDKs (LangChain, LlamaIndex, etc.)
- Qualitative response analysis
- Multi-model comparisons
- Streaming performance benchmarks

Please open an issue to discuss before submitting PRs.

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Citation

If you use this benchmark in your research, please cite:

```bibtex
@misc{agentive2026sdkcomparison,
  title={Comparative Analysis of AI Agent SDKs: Pi Agent SDK vs Anthropic Python SDK},
  author={Agentive Research Team},
  year={2026},
  publisher={GitHub},
  url={https://github.com/AgentiveAU/agent-sdk-comparison}
}
```

---

## Acknowledgements

- [Mario Zechner](https://github.com/badlogic) for the Pi Agent SDK
- [Anthropic](https://www.anthropic.com) for Claude and the Python SDK
- [AWS](https://aws.amazon.com/bedrock) for Bedrock infrastructure

---

<div align="center">

**Built by [Agentive](https://agentive.au)** | Enterprise AI Solutions for Australian Businesses

*AI That Builds and Improves Itself*

[agentive.au](https://agentive.au) | [agentive.is](https://agentive.is)

</div>
