type SendInviteEmailParams = {
  to: string;
  inviterFirstName: string;
  personName: string;
  roleLabel: string;
  inviteUrl: string;
  // Stockholm-local date string ("5 juni" / "5 juni 2026"). Appended
  // to the subject so resends look like a fresh email in Gmail
  // (Gmail threads identical-subject messages — adding the date
  // breaks the collapse without changing the visible content).
  sentAtLabel: string;
};

export async function sendInviteEmail(p: SendInviteEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ??
    "TryggKontakt <invites@tryggkontakt.vercel.app>";

  const subject = `Du är inbjuden till ${p.personName}s krets på TryggKontakt (skickad ${p.sentAtLabel})`;

  if (!apiKey) {
    // Dev fallback: log instead of send so the local flow still works
    // without a Resend key. Remove or replace once the env is set.
    console.log("[invite email — RESEND_API_KEY missing, logging]", {
      ...p,
      subject,
    });
    return;
  }

  const text = [
    "Hej.",
    "",
    `${p.inviterFirstName} har bjudit in dig till ${p.personName}s krets på TryggKontakt som ${p.roleLabel}.`,
    "",
    "Klicka på länken nedan för att acceptera:",
    p.inviteUrl,
    "",
    "Länken är giltig i 7 dagar.",
  ].join("\n");

  const html = `<p>Hej.</p>
<p>${p.inviterFirstName} har bjudit in dig till ${p.personName}s krets på TryggKontakt som ${p.roleLabel}.</p>
<p><a href="${p.inviteUrl}">Acceptera inbjudan</a></p>
<p>Länken är giltig i 7 dagar.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: p.to, subject, text, html }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
