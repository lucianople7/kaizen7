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

## Current Migration State

- THE FOCUX has been copied to `C:\Users\lucia\OneDrive\Documentos\thefocux`.
- The old `site/thefocux/` inside KAIZEN7 is temporary and ignored by the KAIZEN7 repo.
- Do not publish KAIZEN7 with THE FOCUX web assets inside it.
- Cloudflare should connect to the THE FOCUX repo, not to KAIZEN7.
- Flowmatik and Mr. Kaizen material still present in this working tree should be
  treated as extraction backlog.
- New work in this repo should focus on KAIZEN7 kernel, repo contracts,
  routing, verification and memory.

