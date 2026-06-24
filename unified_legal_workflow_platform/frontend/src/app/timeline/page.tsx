"use client";
import { useEffect, useState } from "react";
import { getMatters, getTimeline } from "@/lib/api";
import { Matter, TimelineEvent } from "@/types";
import { format } from "date-fns";
import { Clock } from "lucide-react";

const EVENT_CONFIG: Record<string, { emoji: string; accent: string }> = {
  communication: { emoji: "💬", accent: "var(--accent)" },
  deadline:      { emoji: "⏰", accent: "var(--danger)" },
  filing:        { emoji: "📄", accent: "#A78BFA" },
  hearing:       { emoji: "⚖️", accent: "#818CF8" },
  contract_signed: { emoji: "✍️", accent: "var(--success)" },
  breach_notice: { emoji: "🚨", accent: "var(--danger)" },
  client_contact: { emoji: "👤", accent: "var(--text-2)" },
  document_received: { emoji: "📁", accent: "var(--warn)" },
  trigger_event: { emoji: "🔔", accent: "var(--warn)" },
  other:         { emoji: "●", accent: "var(--text-3)" },
};

export default function TimelinePage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<string>("");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [matterTitle, setMatterTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    getMatters({}).then((m) => {
      setMatters(m);
      if (m.length > 0) { setSelectedMatter(m[0].id); setMatterTitle(m[0].title); }
    });
  }, []);

  useEffect(() => {
    if (!selectedMatter) return;
    setLoading(true);
    getTimeline(selectedMatter, typeFilter ? { event_type: typeFilter } : {})
      .then((data) => { setEvents(data.events || []); setMatterTitle(data.matter_title || ""); })
      .finally(() => setLoading(false));
  }, [selectedMatter, typeFilter]);

  const filtered = typeFilter ? events.filter(e => e.event_type === typeFilter) : events;

  return (
    <div style={{ padding: "24px 28px", maxWidth: "800px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={20} style={{ color: "var(--accent)" }} /> Matter Timeline
        </h1>
        <p className="page-subtitle">Source-linked chronology of all legal events</p>
      </div>

      {/* Controls */}
      <div className="animate-fade-in-up" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" as const, animationDelay: "60ms" }}>
        <select className="input" style={{ maxWidth: "280px" }} value={selectedMatter} onChange={(e) => {
          setSelectedMatter(e.target.value);
          setMatterTitle(matters.find(m => m.id === e.target.value)?.title || "");
        }}>
          {matters.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select className="input" style={{ width: "160px" }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="communication">Communications</option>
          <option value="deadline">Deadlines</option>
          <option value="filing">Filings</option>
          <option value="hearing">Hearings</option>
          <option value="contract_signed">Contract Signed</option>
          <option value="breach_notice">Breach Notices</option>
          <option value="trigger_event">Trigger Events</option>
        </select>
      </div>

      {/* Matter banner */}
      {matterTitle && (
        <div className="card animate-fade-in-up" style={{
          marginBottom: "20px", padding: "14px 18px",
          background: "var(--accent-dim)", borderColor: "var(--border-accent)",
          animationDelay: "100ms",
        }}>
          <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--accent-light)" }}>{matterTitle}</div>
          <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
            {filtered.length} events on record
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <div className="spinner" style={{ margin: "0 auto 10px" }} />
          <div style={{ fontSize: "13px", color: "var(--text-3)" }}>Building timeline…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><Clock size={20} style={{ color: "var(--text-3)" }} /></div>
          <div style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: 600 }}>No timeline events</div>
          <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "4px" }}>
            Submit communications to automatically build the timeline
          </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div className="timeline-line" />
          <div style={{ paddingLeft: "52px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.map((ev, idx) => {
              const cfg = EVENT_CONFIG[ev.event_type] || EVENT_CONFIG.other;
              const prevDate = idx > 0 ? filtered[idx - 1].event_date : null;
              const showMonth = !prevDate || format(new Date(ev.event_date), "MMM yyyy") !== format(new Date(prevDate), "MMM yyyy");

              return (
                <div key={ev.id}>
                  {showMonth && (
                    <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0 10px -52px" }}>
                      <span className="num" style={{ fontSize: "11px", color: "var(--text-3)", width: "40px", textAlign: "right", flexShrink: 0 }}>
                        {format(new Date(ev.event_date), "MMM")}
                      </span>
                      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                      <span style={{ fontSize: "11px", color: "var(--text-4)", fontFamily: "var(--font-mono)" }}>
                        {format(new Date(ev.event_date), "yyyy")}
                      </span>
                    </div>
                  )}
                  <div style={{ position: "relative" }}>
                    {/* Dot */}
                    <div className="timeline-dot" style={{
                      position: "absolute", left: "-52px", top: "0",
                      background: `${cfg.accent}20`,
                      borderColor: `${cfg.accent}60`,
                    }}>
                      <span style={{ fontSize: "15px" }}>{cfg.emoji}</span>
                    </div>

                    <div className="card card-hover animate-fade-in-up" style={{ padding: "14px 16px", animationDelay: `${idx * 40}ms` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{ev.title}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                            <span style={{ fontSize: "11px", color: cfg.accent, textTransform: "capitalize", fontWeight: 500 }}>
                              {ev.event_type.replace(/_/g, " ")}
                            </span>
                            <span style={{ color: "var(--border)" }}>·</span>
                            <span className="mono" style={{ fontSize: "11px", color: "var(--text-3)" }}>
                              {format(new Date(ev.event_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        {ev.is_confirmed === "true" && (
                          <span className="badge badge-low" style={{ flexShrink: 0, marginLeft: "8px" }}>confirmed</span>
                        )}
                      </div>

                      {ev.summary && (
                        <p style={{ fontSize: "12.5px", color: "var(--text-2)", marginTop: "8px", lineHeight: 1.6 }}>{ev.summary}</p>
                      )}

                      {ev.source_references?.length > 0 && (
                        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
                          {ev.source_references.map((ref, i) => (
                            <span key={i} className="badge badge-default">
                              {ref.type} · {ref.description || ref.id?.slice(0, 8)}
                            </span>
                          ))}
                        </div>
                      )}

                      {ev.associated_contacts?.filter(Boolean).length > 0 && (
                        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
                          {ev.associated_contacts.filter(Boolean).map((c, i) => (
                            <span key={i} className="badge badge-info">👤 {c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
