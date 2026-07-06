function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function onRequestPost(context) {
  let input;
  try {
    input = await context.request.json();
  } catch {
    return json({ error: "Solicitud no valida." }, 400);
  }

  if (input.company) return json({ ok: true });
  const email = String(input.email || "").trim().toLowerCase();
  const name = String(input.name || "").trim().slice(0, 80);
  const profile = String(input.profile || "professional").slice(0, 40);
  const consent = input.consent === "on" || input.consent === true;
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 180) return json({ error: "Introduce un email valido." }, 400);
  if (!consent) return json({ error: "Necesitamos tu consentimiento para incluirte en la lista." }, 400);
  if (!context.env.DB) return json({ error: "La lista privada se esta configurando. Intentalo de nuevo en breve." }, 503);

  const existing = await context.env.DB.prepare("SELECT id FROM waitlist WHERE email = ?").bind(email).first();
  if (existing) return json({ ok: true, alreadyRegistered: true });

  const country = context.request.cf?.country || "";
  const source = new URL(context.request.url).hostname;
  await context.env.DB.prepare(
    "INSERT INTO waitlist (email, name, profile, consent_at, country, source) VALUES (?, ?, ?, datetime('now'), ?, ?)",
  ).bind(email, name, profile, country, source).run();
  return json({ ok: true, alreadyRegistered: false }, 201);
}

export function onRequestGet() {
  return json({ error: "Metodo no permitido." }, 405);
}
