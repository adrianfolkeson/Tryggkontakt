# DB-restore runbook

Hur vi återställer TryggKontakts produktionsdatabas från en
Supabase-backup. Skriven på svenska för att matcha övrig produktion-
och support­dokumentation.

---

## 1. När använder vi det här

- Produktionsdatabasen är korrupt eller har inkonsekvent data
- Oavsiktlig mass­radering (t.ex. en migration som körde fel mot
  remote)
- Vi vill verifiera att en backup faktiskt fungerar innan vi
  förlitar oss på den

Om du är osäker — börja med att läsa
[incident-response.md](./incident-response.md).

---

## 2. Förutsättningar

- Admin-åtkomst till Supabase-projektet (Aurora Ecom AB konto)
- Lokalt installerad Supabase CLI (`brew install supabase/tap/supabase`)
- Aurora Ecom AB-betalkortet aktivt — ett scratch-projekt för
  verifiering kostar i regel 0–25 USD/månad medan det är igång
- Tillgång till `.env.local` med `SUPABASE_SERVICE_ROLE_KEY` (för
  efterkontroll med admin-klient)

---

## 3. Steg-för-steg — återställning till **ny instans** (för verifiering)

Använd den här ordningen när vi *inte* har en akut incident utan
bara vill verifiera en backup.

1. Skapa ett scratch Supabase-projekt i samma region (`eu-central-1`).
2. Notera scratch-projektets URL och anon-key.
3. I Supabase dashboard på produktionsprojektet:
   *Database → Backups → Point in Time Recovery* → välj önskad
   tidpunkt → *Restore to a new project* → välj scratch-projektet.
4. Vänta tills Supabase signalerar att återställningen är klar
   (5–30 minuter beroende på data­volym).
5. Verifiera att data är intakt:

   ```sql
   select count(*) from public.circle_member where valid_to is null;
   select count(*) from public.daily_update;
   select count(*) from auth.users;
   ```

   Siffrorna ska ligga nära produktionsvärdena (mindre avvikelser OK
   beroende på återställningspunkten).

6. Verifiera RLS — logga in som en känd test­användare i scratch-
   projektet och bekräfta att de bara ser sin egen krets.
7. Verifiera nyckelflöden manuellt: skapa en daglig uppdatering,
   exportera PDF, bjud in en testanvändare. Allt ska fungera.

---

## 4. Steg-för-steg — återställning av **produktionen** (riktigt nödläge)

> **VARNING — destruktiv operation.** Allt skrivande mellan
> återställnings­punkten och nu går förlorat. Bekräfta i incident-
> response.md-loggen att detta är rätt åtgärd innan du fortsätter.

1. Bekräfta SEV-klassning (se incident-response.md §2). Återställ­ning
   av produktion är minst SEV1.
2. Stäng skrivningar mot produktion om möjligt:
   - Skicka kort statusmejl till support­listan
   - Uppdatera `/status`-sidan med en manuell incident-banner
     (just nu manuell process — automatisk avstängning är inte
     byggd)
3. I Supabase dashboard på produktions­projektet:
   *Database → Backups* → välj backup → **Restore in place**.
4. Bekräfta varnings­dialogen.
5. Vänta tills återställningen är klar. Supabase visar status­indikator.
6. Kör verifierings­queries enligt §3 punkt 5.
7. Verifiera nyckelflöden enligt §3 punkt 7.
8. Informera påverkade användare via mejl om eventuell dataförlust
   (incident-response.md §4 har mallar).
9. Skriv kort post-mortem i `docs/ops/incidents/YYYY-MM-DD-kort-titel.md`
   (incident-response.md §5).

---

## 5. Efter återställning

- Stäng scratch-projektet om du skapade ett — annars rullande Pro-
  faktura.
- Dokumentera incidenten i `docs/ops/incidents/`.
- Uppdatera den här runbooken med ev. lärdomar (felaktiga steg,
  saknade förkontroller, manöver som tog längre tid än väntat).

---

## 6. Backup-policy (referens)

- **Supabase Pro:** Point-in-Time Recovery 7 dagar bakåt + dagliga
  fysiska backuper i 30 dagar.
- Backupperna lagras inom EU (`eu-central-1`, Frankfurt) per
  Supabase EU-projekt­val.
- Inga manuella exports görs idag — Supabase hanterar hela
  backup­cykeln. Vi gör en *eldövning* per kvartal genom att köra
  §3-flödet mot ett scratch-projekt.

Senast verifierad backup: *(fyll i datum efter nästa eldövning)*
