# Repository Split

KAIZEN7, THE FOCUX, Flowmatik and Mr. Kaizen are separate responsibilities and
should live in separate repositories or clearly exported project packs.

## KAIZEN7

Local path:

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7
```

GitHub:

```text
https://github.com/lucianople7/kaizen7
```

Role:

- agent coordination kernel,
- metaskills and skills,
- routing,
- memory contracts,
- verification receipts,
- project handoff contracts,
- reusable decision engine.

This repo should not own public brand sites, video factories, ecommerce,
content libraries, project IP, rendered assets or external publishing surfaces.

Allowed KAIZEN7 changes:

- route definitions,
- skill and metaskill definitions,
- Mission Brief and Mission Outcome Receipt contracts,
- memory governance,
- verification gates,
- project handoff contracts,
- small adapters that reduce agent context or execution errors.

Not allowed as KAIZEN7 growth:

- THE FOCUX public app implementation,
- Flowmatik render/video implementation,
- Mr. Kaizen channel content,
- NEUROCITY/project IP,
- ecommerce, checkout, claims or supplement copy,
- generated media or private source libraries.

## THE FOCUX

Local path:

```text
C:\Users\lucia\OneDrive\Documentos\thefocux
```

Expected GitHub remote:

```text
https://github.com/Lucianople7/thefocux.git
```

Role:

- public web project,
- brand assets,
- THE FOCUX OS,
- AI layer,
- public MCP,
- Cloudflare Pages,
- newsletter/waitlist,
- future ecommerce.

## Flowmatik

Expected role:

- creative production pipeline,
- video/content factories,
- templates,
- render manifests,
- distribution packets,
- media assets.

KAIZEN7 can store Flowmatik contracts and receipts, but Flowmatik implementation
belongs in its own repo.

## Mr. Kaizen

Expected role:

- persona and content channel,
- voice rules,
- scripts,
- hooks,
- audience learning loops.

KAIZEN7 can store route and verification rules, but channel content belongs
outside the KAIZEN7 repo.

## Rule

```text
KAIZEN7 coordinates projects.
Projects do not define KAIZEN7.
Projects connect back through contracts, receipts and memory recommendations.
```

## Split Decision

Use this rule before committing:

```text
If the file ships a public surface, creative pipeline, channel asset or product
IP, it belongs to the product repo.

If the file improves routing, context reduction, verification, receipts or
agent handoff, it belongs to KAIZEN7.
```

## Current Migration State

- THE FOCUX has been copied to `C:\Users\lucia\OneDrive\Documentos\thefocux`.
- Flowmatik has been copied to `C:\Users\lucia\OneDrive\Documentos\flowmatik`.
- Mr. Kaizen has been copied to `C:\Users\lucia\OneDrive\Documentos\mr-kaizen`.
- Product material extracted from this repo is staged under `_kaizen7_import/`
  in each target repo so existing product work is not overwritten.
- The old `site/thefocux/` inside KAIZEN7 is temporary and ignored by the KAIZEN7 repo.
- Do not publish KAIZEN7 with THE FOCUX web assets inside it.
- Cloudflare should connect to the THE FOCUX repo, not to KAIZEN7.
- Flowmatik and Mr. Kaizen implementation material should stay in their repos.
- New work in this repo should focus on KAIZEN7 kernel, repo contracts,
  routing, verification and memory.

