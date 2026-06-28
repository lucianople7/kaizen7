# KAIZEN7 Model Gateway

KAIZEN7 must stay open to the strongest available models without locking the product to one vendor.

```text
KAIZEN7 core = memory, judgment, activation, verification and writeback
Model Gateway = interchangeable runtime for model calls
```

## Supported Provider Shapes

- OpenAI Responses API.
- OpenAI-compatible chat APIs.
- Anthropic Messages API.
- Google Gemini generateContent API.
- Local or self-hosted OpenAI-compatible runtimes such as Ollama.
- Aggregators such as OpenRouter.

## Commands

```powershell
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openai "objective"
npm.cmd run k7:models -- --provider anthropic "objective"
npm.cmd run k7:models -- --provider google "objective"
npm.cmd run k7:models -- --provider openrouter "objective"
npm.cmd run k7:models -- --provider ollama "objective"
```

## API

```http
GET /api/k7/models
POST /api/k7/models
POST /api/chat
```

Example:

```json
{
  "provider": "openrouter",
  "model": "openai/gpt-5.5",
  "goal": "activate this project with the best next action"
}
```

`/api/chat` also accepts `provider` and `model`.

## Environment Variables

```text
K7_MODEL_PROVIDER=openai
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OPENROUTER_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1
```

Ollama/local mode can work without an API key if the local server is running.

## Rule

```text
Model Gateway != KAIZEN7 core
Model Gateway = swappable execution layer
```

KAIZEN7 should choose models by task:

- planning and coding: strongest reasoning model available,
- fast classification: cheap low-latency model,
- privacy-sensitive work: local model,
- broad comparison: aggregator provider,
- production assistant: provider with stable uptime and tracing.

Every provider remains optional. Missing keys warn or return `unavailable`; they do not break the KAIZEN7 core.
