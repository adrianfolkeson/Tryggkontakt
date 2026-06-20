# Incident-response runbook

Vad vi gör när något går sönder i produktion. Läs igenom när du har
lugn så du känner igen flödet i pressat läge.

---

## 1. Kontaktinformation

- **Adrian Folkeson** (huvudkontakt): `adrian.folkeson11@gmail.com` ·
  telefon i 1Password
- **Teknisk partner** (backup): *fyll i namn + telefon innan launch*
- **Aurora Ecom AB support**: `info@auroraecom.se` /
  `support@tryggkontakt.se`

Externa tjänsters statusvyer:
- Vercel: https://www.vercel-status.com/
- Supabase: https://status.supabase.com/
- Resend: https://status.resend.com/

---

## 2. Klassificering

| Nivå | Definition | Svarstid |
|------|------------|----------|
| **SEV1** | Tjänsten helt nere för alla, dataläcka, säkerhetsincident, oavsiktlig massradering | 15 min |
| **SEV2** | En funktion bruten, en delmängd användare påverkade | 2 h |
| **SEV3** | Kosmetiska fel, ej blockerande | 24 h |

Vid tveksamhet — klassa en nivå högre.

---

## 3. Scenarier och åtgärder

### 3.1 Om Vercel är nere

1. Kontrollera vercel-status.com.
2. Är det bekräftat: gör en manuell uppdatering av `/status`-sidan
   (lägg in en incident-banner) och vänta.
3. Vi kan inte påverka Vercel direkt.
4. Skicka kort mejl till support-listan om läget pågår > 30 min.

### 3.2 Om Supabase är nere

1. Kontrollera status.supabase.com.
2. Verifiera via curl mot Supabase-URL eller via `/status`-sidan
   (databas­raden visar rött automatiskt).
3. Vänta — vi kan inte påverka Supabase.
4. Skicka mejl om läget pågår > 30 min.

### 3.3 Om data verkar förlorad

1. **SKRIV INTE TILL PRODUKTION.**
2. Verifiera omfattningen — vad saknas, sedan när, hur upptäcktes
   det.
3. Identifiera senaste rena backup-punkten i Supabase-dashboard.
4. Följ [db-restore.md](./db-restore.md). Återställ först till
   scratch-projekt för verifiering, *sedan* till produktion.
5. Informera påverkade användare via mejl när omfattningen är
   bekräftad.
6. Dokumentera root cause i `docs/ops/incidents/` efteråt.

### 3.4 Om en användare rapporterar säkerhetshål

1. Bekräfta mottagandet inom 24 h utan att lova en fixtidpunkt.
2. Be om så mycket detaljer som möjligt — utan att be om PoC mot
   produktionsdata.
3. Återskapa lokalt.
4. Bedöm allvar (SEV-klassning ovan).
5. Patcha först, kommunikation efter patch är på produktion.
6. Överväg om incidenten utgör en personuppgifts­incident — i så
   fall: anmäl till IMY inom **72 h** enligt GDPR art 33.

### 3.5 Om en användare rapporterar dataläcka

> **SEV1 — agera omedelbart.**

1. Identifiera omfattning: vilka användare, vilken data, hur länge
   exponerat.
2. Stäng läckan — ta bort åtkomst, patcha, lägg på `valid_to`
   manuellt om så krävs.
3. **Anmäl till IMY inom 72 h** enligt GDPR art 33.
4. **Informera påverkade användare** direkt enligt GDPR art 34.
5. Dokumentera fullständigt i `docs/ops/incidents/`.

### 3.6 Om en användare rapporterar kritisk bugg

1. Bekräfta mottagandet.
2. Återskapa lokalt med exakta steg.
3. Bedöm SEV-nivå.
4. Patcha + push. Vercel deployar automatiskt.
5. Bekräfta till rapportören när fixet är ute.
6. Skriv ett test så buggen inte återkommer (RLS-smoke, server-
   action-test, eller manuellt smoke-protokoll).

---

## 4. Kommunikationsmallar

### Initial bekräftelse

> Hej, tack för att du hörde av dig. Vi har identifierat ett
> problem och arbetar på en lösning. Vi återkommer så snart vi vet
> mer.
>
> Hälsningar,
> TryggKontakt-supporten

### Resolved

> Hej, problemet är nu löst. Tack för ditt tålamod. Om du fortfarande
> ser problem — svara på det här mejlet.

### Säkerhetsincident (skarpt läge)

> Hej,
>
> Vi har upptäckt en säkerhetsincident som påverkat ditt konto.
> Här är vad vi vet:
>
> - Vad som hände: *(kort, faktisk beskrivning)*
> - När: *(datum/tid)*
> - Vilken data berördes: *(specifikt)*
> - Vad vi har gjort: *(patch, åtkomst stängd, etc.)*
> - Vad vi rekommenderar att du gör: *(om något)*
>
> Vi har anmält incidenten till Integritetsskyddsmyndigheten i
> enlighet med GDPR.
>
> Frågor? Svara på det här mejlet eller skriv till
> `support@tryggkontakt.se`.

---

## 5. Post-incident

1. Skriv en kort rapport: *vad hände, varför, vad gör vi annorlunda*.
2. Spara som `docs/ops/incidents/YYYY-MM-DD-kort-titel.md`.
3. Efter en SEV1: ta paus, gå igenom om processen eller arkitekturen
   behöver ändras strukturellt.
4. Uppdatera relevant runbook (den här filen, db-restore.md) med
   lärdomar.

Mall för incident-rapport:

```markdown
# YYYY-MM-DD — Kort titel

**Klassning:** SEV1 / SEV2 / SEV3
**Påverkan:** *(antal användare, varaktighet)*

## Vad hände
…

## Tidslinje
- HH:MM — upptäckt
- HH:MM — diagnos
- HH:MM — åtgärd
- HH:MM — bekräftat löst

## Root cause
…

## Vad vi gör annorlunda
- …
```
