import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// Helvetica (React-PDF default) has no emoji glyphs, so emoji
// would render as broken stubs in the PDF. Use Swedish labels only.
//
// Legacy mood values from pre-F5 rows (`happy`/`calm`/`tired`/`worried`)
// get translated to a human-readable label. New rows store arbitrary
// free text in `mood`, which renders unchanged.
const LEGACY_MOOD: Record<string, string> = {
  happy: "glad",
  calm: "lugn",
  tired: "trött",
  worried: "orolig",
};

const SLOT_LABEL: Record<string, string> = {
  morgon: "Morgon",
  lunch: "Lunch",
  eftermiddag: "Eftermiddag",
  snabbnotering: "Anteckning",
};
const SLOT_ORDER: Record<string, number> = {
  morgon: 0,
  lunch: 1,
  eftermiddag: 2,
  snabbnotering: 3,
};

const SLOT_FIELD_LABELS: Record<
  "morgon" | "lunch" | "eftermiddag",
  { period: string; meal: string }
> = {
  morgon: { period: "Sömn", meal: "Frukost" },
  lunch: { period: "Förmiddagen", meal: "Lunch" },
  eftermiddag: { period: "Eftermiddagen", meal: "Mellanmål" },
};

type DailyUpdate = {
  id: string;
  slot: string;
  period_note: string | null;
  meal_note: string | null;
  mood: string | null;
  energy: string | null;
  free_text: string | null;
  created_at: string;
  authorName: string;
};
type ScheduleItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
};
type Reminder = {
  id: string;
  title: string;
  due_at: string;
  is_urgent: boolean;
};

type Member = {
  user_id: string;
  role: string;
  name: string;
  phone: string | null;
};

const ROLE_PDF_LABEL: Record<string, string> = {
  relative: "Anhörig",
  staff: "Personal",
  coordinator: "Samordnare",
};

export type RenderExportParams = {
  personName: string;
  fromStr: string;
  toStr: string;
  members: Member[];
  updates: DailyUpdate[];
  scheduleItems: ScheduleItem[];
  reminders: Reminder[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingLeft: 50,
    paddingRight: 50,
    fontSize: 10,
    color: "#1F2A2E",
    fontFamily: "Helvetica",
  },
  header: {
    position: "absolute",
    top: 24,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#5B6770",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 50,
    right: 50,
    fontSize: 9,
    color: "#5B6770",
    textAlign: "center",
  },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#5B6770", marginBottom: 8 },
  summary: { fontSize: 11, marginBottom: 24 },
  sectionHeading: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  entry: { marginBottom: 12 },
  entryMeta: { fontSize: 9, color: "#5B6770", marginBottom: 2 },
  entryDetail: { fontSize: 10, marginBottom: 2 },
  body: { fontSize: 10, lineHeight: 1.4 },
  emptyData: { fontSize: 10, color: "#5B6770", fontStyle: "italic" },
});

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function formatDateOnly(yyyymmdd: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${yyyymmdd}T12:00:00Z`));
}

function formatTimeOnly(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function formatDateGroup(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

type SlotLine = { label: string; value: string };

function slotLines(u: DailyUpdate): SlotLine[] {
  if (
    u.slot !== "morgon" &&
    u.slot !== "lunch" &&
    u.slot !== "eftermiddag"
  ) {
    return [];
  }
  const labels = SLOT_FIELD_LABELS[u.slot];
  const lines: SlotLine[] = [];
  if (u.period_note) lines.push({ label: labels.period, value: u.period_note });
  if (u.meal_note) lines.push({ label: labels.meal, value: u.meal_note });
  if (u.mood) {
    lines.push({ label: "Humör", value: LEGACY_MOOD[u.mood] ?? u.mood });
  }
  if (u.energy) lines.push({ label: "Energi", value: u.energy });
  return lines;
}

function groupUpdatesByDate(
  rows: DailyUpdate[],
): Array<[string, DailyUpdate[]]> {
  const byDate = new Map<string, DailyUpdate[]>();
  for (const r of rows) {
    const dKey = formatDateGroup(r.created_at);
    if (!byDate.has(dKey)) byDate.set(dKey, []);
    byDate.get(dKey)!.push(r);
  }
  for (const arr of byDate.values()) {
    arr.sort(
      (a, b) =>
        (SLOT_ORDER[a.slot] ?? 99) - (SLOT_ORDER[b.slot] ?? 99) ||
        a.created_at.localeCompare(b.created_at),
    );
  }
  return Array.from(byDate.entries());
}

export async function renderExportPdf(p: RenderExportParams): Promise<Buffer> {
  const fromLabel = formatDateOnly(p.fromStr);
  const toLabel = formatDateOnly(p.toStr);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.header}>
          <Text>TryggKontakt – {p.personName}</Text>
          <Text>
            {fromLabel} – {toLabel}
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Kontakter</Text>
        {p.members.length === 0 ? (
          <Text style={styles.emptyData}>(ingen data)</Text>
        ) : (
          p.members.map((m) => (
            <View key={m.user_id} style={styles.entry} wrap={false}>
              <Text style={styles.entryDetail}>
                {m.name} · {ROLE_PDF_LABEL[m.role] ?? m.role}
                {m.phone ? ` · ${m.phone}` : ""}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.title}>Sammanfattning</Text>
        <Text style={styles.subtitle}>
          {fromLabel} – {toLabel}
        </Text>
        <Text style={styles.summary}>
          {p.updates.length} uppdateringar, {p.scheduleItems.length}{" "}
          aktiviteter, {p.reminders.length} påminnelser under perioden.
        </Text>

        <Text style={styles.sectionHeading}>Dagliga uppdateringar</Text>
        {p.updates.length === 0 ? (
          <Text style={styles.emptyData}>(ingen data)</Text>
        ) : (
          groupUpdatesByDate(p.updates).map(([dateLabel, rows]) => (
            <View key={dateLabel} style={styles.entry}>
              <Text style={styles.entryMeta}>{dateLabel}</Text>
              {rows.map((u) => {
                const slotLabel = SLOT_LABEL[u.slot] ?? u.slot;
                const lines = slotLines(u);
                return (
                  <View key={u.id} style={styles.entry} wrap={false}>
                    <Text style={styles.entryMeta}>
                      {slotLabel} · {formatTimeOnly(u.created_at)} ·{" "}
                      {u.authorName}
                    </Text>
                    {lines.length > 0
                      ? lines.map((l) => (
                          <Text key={l.label} style={styles.entryDetail}>
                            {l.label} · {l.value}
                          </Text>
                        ))
                      : null}
                    {u.free_text ? (
                      <Text style={styles.body}>{u.free_text}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))
        )}

        <Text style={styles.sectionHeading} break>
          Aktiviteter
        </Text>
        {p.scheduleItems.length === 0 ? (
          <Text style={styles.emptyData}>(ingen data)</Text>
        ) : (
          p.scheduleItems.map((s) => (
            <View key={s.id} style={styles.entry} wrap={false}>
              <Text style={styles.entryMeta}>
                {formatDateTime(s.starts_at)}
                {s.ends_at ? ` – ${formatDateTime(s.ends_at)}` : ""}
              </Text>
              <Text style={styles.entryDetail}>{s.title}</Text>
              {s.notes ? <Text style={styles.body}>{s.notes}</Text> : null}
            </View>
          ))
        )}

        <Text style={styles.sectionHeading} break>
          Påminnelser
        </Text>
        {p.reminders.length === 0 ? (
          <Text style={styles.emptyData}>(ingen data)</Text>
        ) : (
          p.reminders.map((r) => (
            <View key={r.id} style={styles.entry} wrap={false}>
              <Text style={styles.entryMeta}>
                {formatDateTime(r.due_at)}
                {r.is_urgent ? " · Akut" : ""}
              </Text>
              <Text style={styles.entryDetail}>{r.title}</Text>
            </View>
          ))
        )}

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Sida ${pageNumber} av ${totalPages}`
          }
        />
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
