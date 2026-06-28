# THE FOCUX website

Evidence-led editorial and curated commerce website for nootropics, peptide science and human performance. Static Cloudflare Pages site with a Pages Function and D1-backed founding list.

## Local

```powershell
npm install
npm run db:migrate:local
npm run dev
```

## First deployment

1. Authenticate Wrangler with `npx wrangler login`.
2. Create the database with `npm run db:create`.
3. Put the returned database ID in `wrangler.toml`.
4. Apply the schema with `npm run db:migrate:remote`.
5. Deploy with `npm run deploy`.
6. In Cloudflare Pages, attach `thefocux.com` as the custom domain.

The public site contains no advertising cookies or third-party analytics.

## AI and MCP

Public AI surfaces:

- `https://thefocux.com/llms.txt`
- `https://thefocux.com/ai-index.json`
- `https://thefocux.com/.well-known/mcp.json`
- `https://thefocux.com/mcp`

The MCP endpoint is public and read-only. It exposes brand context, AI index, public guardrails and a small content search map. Private actions, ecommerce writes, payments, user data and waitlist access must stay behind a future OAuth-protected MCP server.

Example local JSON-RPC check after starting the site:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8788/mcp -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
