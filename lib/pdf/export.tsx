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
const MOOD_LABEL: Record<string, string> = {
  happy: "glad",
  calm: "lugn",
  tired: "trött",
  worried: "orolig",
};
const SLEEP_LABEL: Record<string, string> = {
  good: "bra",
  okay: "okej",
  poor: "dålig",
};
const ENERGY_LABEL: Record<string, string> = {
  high: "hög",
  medium: "medel",
  low: "låg",
};

type DailyUpdate = {
  id: string;
  mood: string;
  sleep: string;
  energy: string;
  free_text: string;
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
          p.updates.map((u) => (
            <View key={u.id} style={styles.entry} wrap={false}>
              <Text style={styles.entryMeta}>
                {formatDateTime(u.created_at)} · {u.authorName}
              </Text>
              <Text style={styles.entryDetail}>
                {MOOD_LABEL[u.mood] ?? u.mood} · Sömn{" "}
                {SLEEP_LABEL[u.sleep] ?? u.sleep} · Energi{" "}
                {ENERGY_LABEL[u.energy] ?? u.energy}
              </Text>
              <Text style={styles.body}>{u.free_text}</Text>
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
