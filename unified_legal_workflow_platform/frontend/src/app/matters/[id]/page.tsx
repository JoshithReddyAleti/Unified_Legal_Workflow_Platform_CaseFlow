"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMatter, getMatterStats, getAllCommunications, getTasks, getDeadlines, getTimeline, getNotes, createNote, deleteNote } from "@/lib/api";
import { Matter, Communication, Task, Deadline, TimelineEvent, MatterNote, NoteType } from "@/types";
import Badge from "@/components/ui/Badge";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, Clock, CheckSquare, MessageSquare, FileText, Plus, Trash2, StickyNote } from "lucide-react";

const TIMELINE_ICON: Record<string, string> = {
  communication: "💬", deadline: "⏰", filing: "📄", hearing: "⚖️",
  contract_signed: "✍️", breach_notice: "🚨", client_contact: "👤",
  document_received: "📁", trigger_event: "🔔", other: "●",
};

export default function MatterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [comms, setComms] = useState<Communication[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [notes, setNotes] = useState<MatterNote[]>([]);
  const [tab, setTab] = useState<"overview" | "timeline" | "tasks" | "comms" | "notes">("overview");
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getMatter(id),
      getMatterStats(id),
      getAllCommunications({ matter_id: id, limit: 20 }),
      getTasks({ matter_id: id }),
      getDeadlines({ matter_id: id }),
      getTimeline(id),
      getNotes(id),
    ]).then(([m, s, c, t, dl, tl, n]) => {
      setMatter(m);
      setStats(s);
      setComms(c);
      setTasks(t);
      setDeadlines(dl);
      setTimeline(tl.events || []);
      setNotes(n || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddNote = async () => {
    if (!noteContent.trim() || !id) return;
    setSavingNote(true);
    try {
      const note = await createNote(id, { content: noteContent.trim(), note_type: noteType, created_by: "attorney" });
      setNotes(prev => [note, ...prev]);
      setNoteContent("");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const PRIO_V: Record<string, "critical" | "high" | "medium" | "low"> = { critical: "critical", high: "high", medium: "medium", low: "low" };
  const URG_V: Record<string, "critical" | "high" | "medium" | "low"> = { critical: "critical", high: "high", medium: "medium", low: "low" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px" }}>
      <div className="spinner" />
    </div>
  );

  if (!matter) return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Matter not found</div>
  );

  const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; badgeClass: string; color: string }> = {
    general:     { label: "General",     badgeClass: "badge-default", color: "var(--text-3)" },
    strategy:    { label: "Strategy",    badgeClass: "badge-info",    color: "var(--accent-light)" },
    observation: { label: "Observation", badgeClass: "badge-purple",  color: "#A78BFA" },
    risk:        { label: "Risk",        badgeClass: "badge-high",    color: "#FCD34D" },
  };

  const tabList = [
    { key: "overview",  label: "Overview" },
    { key: "timeline",  label: `Timeline (${timeline.length})` },
    { key: "tasks",     label: `Tasks (${tasks.length})` },
    { key: "comms",     label: `Communications (${comms.length})` },
    { key: "notes",     label: `Notes (${notes.length})` },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1000px" }}>
      <Link href="/matters" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--text-3)", textDecoration: "none", marginBottom: "18px", transition: "color 0.15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)"}
      >
        <ArrowLeft size={13} /> Matters
      </Link>

      {/* Header */}
      <div className="card animate-fade-in-up" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="mono" style={{ fontSize: "11px", color: "var(--text-3)" }}>{matter.matter_number || "—"}</span>
              <span className={`badge ${matter.status === "active" ? "badge-low" : "badge-default"}`} style={{ textTransform: "capitalize" }}>{matter.status}</span>
              <span className="badge badge-info" style={{ textTransform: "capitalize" }}>{matter.matter_type.replace(/_/g, " ")}</span>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>{matter.title}</h1>
            <div style={{ fontSize: "12.5px", color: "var(--text-3)", marginTop: "4px" }}>
              {matter.client?.name || matter.client_name || "No client"} · {matter.assigned_to || "Unassigned"}
            </div>
            {matter.description && (
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "8px", lineHeight: 1.6, maxWidth: "600px" }}>{matter.description}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { label: "Open Tasks", value: stats.open_tasks || 0, icon: CheckSquare, colorVar: "var(--accent)" },
              { label: "Deadlines", value: stats.upcoming_deadlines || 0, icon: Clock, colorVar: "var(--danger)" },
              { label: "Messages", value: stats.total_communications || 0, icon: MessageSquare, colorVar: "var(--text-3)" },
            ].map(({ label, value, icon: Icon, colorVar }) => (
              <div key={label} style={{ textAlign: "center", padding: "12px 14px", background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "10px", minWidth: "70px" }}>
                <Icon size={15} style={{ color: colorVar, margin: "0 auto 5px" }} />
                <div className="num" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-1)" }}>{value}</div>
                <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        {tabList.map(({ key, label }) => (
          <button key={key} className={`tab${tab === key ? " active" : ""}`} onClick={() => setTab(key as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="card animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <div className="card-header">
              <Clock size={14} style={{ color: "#FCA5A5", marginRight: "6px" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>Deadlines</span>
            </div>
            <div>
              {deadlines.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-3)" }}>No deadlines</div>
              ) : deadlines.slice(0, 5).map((dl) => {
                const days = differenceInDays(new Date(dl.deadline_date), new Date());
                return (
                  <div key={dl.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dl.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>{format(new Date(dl.deadline_date), "MMM d, yyyy")}</div>
                    </div>
                    <span className="num" style={{
                      fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", marginLeft: "8px", flexShrink: 0,
                      background: days <= 0 ? "var(--danger-dim)" : days <= 7 ? "var(--warn-dim)" : "var(--bg-glass)",
                      color: days <= 0 ? "#FCA5A5" : days <= 7 ? "#FCD34D" : "var(--text-3)",
                      border: `1px solid ${days <= 3 ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                    }}>
                      {days <= 0 ? "OVERDUE" : `${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: "130ms" }}>
            <div className="card-header">
              <CheckSquare size={14} style={{ color: "var(--accent)", marginRight: "6px" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>Open Tasks</span>
            </div>
            <div>
              {tasks.filter(t => t.status !== "completed").length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-3)" }}>No open tasks</div>
              ) : tasks.filter(t => t.status !== "completed").slice(0, 5).map((t) => (
                <div key={t.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
                      {t.assigned_to || "Unassigned"}{t.due_date && ` · Due ${format(new Date(t.due_date), "MMM d")}`}
                    </div>
                  </div>
                  <Badge variant={PRIO_V[t.priority] || "default"} className="ml-2">{t.priority}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div style={{ position: "relative" }}>
          <div className="timeline-line" />
          {timeline.length === 0 ? (
            <div className="card empty-state" style={{ marginLeft: "52px" }}>No timeline events yet</div>
          ) : (
            <div style={{ paddingLeft: "52px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {timeline.map((ev, i) => (
                <div key={ev.id} className="animate-fade-in-up" style={{ position: "relative", animationDelay: `${i * 40}ms` }}>
                  <div className="timeline-dot" style={{ position: "absolute", left: "-52px", top: "0", fontSize: "14px" }}>
                    {TIMELINE_ICON[ev.event_type] || "●"}
                  </div>
                  <div className="card" style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{ev.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
                          {format(new Date(ev.event_date), "MMM d, yyyy")} · {ev.event_type.replace(/_/g, " ")}
                        </div>
                      </div>
                      {ev.is_confirmed === "true" && <span className="badge badge-low">confirmed</span>}
                    </div>
                    {ev.summary && <p style={{ fontSize: "12.5px", color: "var(--text-2)", marginTop: "6px", lineHeight: 1.6 }}>{ev.summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div className="card animate-fade-in-up" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead><tr>
              {["Task", "Assignee", "Priority", "Status", "Due Date"].map(h => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={t.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <td>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{t.title}</div>
                    {t.description && <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}>{t.description}</div>}
                  </td>
                  <td><span style={{ fontSize: "12.5px", color: "var(--text-2)" }}>{t.assigned_to || "—"}</span></td>
                  <td><Badge variant={PRIO_V[t.priority] || "default"}>{t.priority}</Badge></td>
                  <td>
                    <span className={`badge ${t.status === "completed" ? "badge-low" : t.status === "in_progress" ? "badge-info" : "badge-default"}`} style={{ textTransform: "capitalize" }}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td><span style={{ fontSize: "12px", color: "var(--text-3)" }}>{t.due_date ? format(new Date(t.due_date), "MMM d, yyyy") : "—"}</span></td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)", fontSize: "13px" }}>No tasks</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "comms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {comms.length === 0 ? (
            <div className="card empty-state">No communications</div>
          ) : comms.map((c, i) => (
            <Link key={c.id} href={`/intake/${c.id}`} style={{ textDecoration: "none" }}>
              <div className="card card-hover animate-fade-in-up" style={{ padding: "14px 16px", animationDelay: `${i * 40}ms` }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px", flexWrap: "wrap" as const }}>
                  <span className="badge badge-default" style={{ textTransform: "capitalize" as const }}>{c.source_type}</span>
                  <Badge variant={URG_V[c.urgency] || "default"}>{c.urgency}</Badge>
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)", marginBottom: "3px" }}>{c.subject || "(no subject)"}</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-3)" }}>From: {c.sender} · {c.received_at ? format(new Date(c.received_at), "MMM d, h:mm a") : "Unknown"}</div>
                {c.summary && <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "5px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{c.summary}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Add note form */}
          <div className="card animate-fade-in-up" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <StickyNote size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>Add Note</span>
            </div>
            <textarea
              className="input"
              placeholder="Write a note about this matter — strategy, observations, risks…"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              rows={3}
              style={{ width: "100%", resize: "vertical", fontFamily: "inherit", marginBottom: "10px", minHeight: "80px" }}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select className="input" value={noteType} onChange={e => setNoteType(e.target.value as NoteType)} style={{ width: "140px" }}>
                <option value="general">General</option>
                <option value="strategy">Strategy</option>
                <option value="observation">Observation</option>
                <option value="risk">Risk</option>
              </select>
              <button className="btn-primary" onClick={handleAddNote} disabled={savingNote || !noteContent.trim()} style={{ gap: "6px" }}>
                {savingNote ? <span className="spinner-sm" /> : <Plus size={13} />}
                {savingNote ? "Saving…" : "Add Note"}
              </button>
              <span style={{ fontSize: "11px", color: "var(--text-4)", marginLeft: "auto" }}>⌘ + Enter to save</span>
            </div>
          </div>

          {/* Notes list */}
          {notes.length === 0 ? (
            <div className="card empty-state animate-fade-in-up" style={{ animationDelay: "60ms" }}>
              <div className="empty-state-icon"><StickyNote size={18} style={{ color: "var(--text-3)" }} /></div>
              <div style={{ color: "var(--text-2)", fontSize: "13.5px", fontWeight: 600 }}>No notes yet</div>
              <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "3px" }}>Add strategy notes, observations, or risks above</div>
            </div>
          ) : notes.map((note, i) => {
            const cfg = NOTE_TYPE_CONFIG[note.note_type as NoteType] || NOTE_TYPE_CONFIG.general;
            return (
              <div key={note.id} className="card animate-fade-in-up" style={{ padding: "14px 16px", animationDelay: `${i * 40}ms`, borderLeft: `3px solid ${cfg.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                      <span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-4)" }}>
                        {note.created_by || "attorney"} · {note.created_at ? format(new Date(note.created_at), "MMM d, yyyy h:mm a") : ""}
                      </span>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-4)", borderRadius: "5px", flexShrink: 0, transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-4)"}
                    title="Delete note"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
