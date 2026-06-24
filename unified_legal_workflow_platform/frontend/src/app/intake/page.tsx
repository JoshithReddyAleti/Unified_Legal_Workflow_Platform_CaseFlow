"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getIntakeQueue, getIntakeStats, submitIntake, triageCommunication } from "@/lib/api";
import { Communication } from "@/types";
import Badge, { urgencyBadge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { Inbox, Plus, CheckCircle, AlertTriangle, X, Send, ChevronRight, Zap } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  contract_review: "Contract Review", litigation_support: "Litigation",
  privacy_data: "Privacy/Data", employment: "Employment",
  commercial_dispute: "Commercial Dispute", compliance: "Compliance",
  policy_question: "Policy Q", general_inquiry: "General", unclassified: "Unclassified",
};

const URGENCY_VARIANTS: Record<string, "critical" | "high" | "medium" | "low"> = {
  critical: "critical", high: "high", medium: "medium", low: "low",
};

export default function IntakePage() {
  const [queue, setQueue] = useState<Communication[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selected, setSelected] = useState<Communication | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [form, setForm] = useState({ source_type: "manual", subject: "", body: "", sender: "", recipients: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<Communication | null>(null);

  const load = async () => {
    setLoading(true);
    const [q, s] = await Promise.all([
      getIntakeQueue({ urgency: urgencyFilter || undefined }),
      getIntakeStats(),
    ]);
    setQueue(q); setStats(s); setLoading(false);
  };

  useEffect(() => { load(); }, [urgencyFilter]);

  const handleSubmit = async () => {
    if (!form.body.trim()) return;
    setSubmitting(true);
    try {
      const result = await submitIntake({ ...form, recipients: form.recipients ? [form.recipients] : [] });
      setSubmitResult(result); load();
    } finally { setSubmitting(false); }
  };

  const handleTriage = async (id: string) => {
    await triageCommunication(id); setSelected(null); load();
  };

  const urgencyFilters = [
    { label: "Critical", key: "critical" },
    { label: "High", key: "high" },
    { label: "Medium", key: "medium" },
    { label: "Low", key: "low" },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1100px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Inbox size={20} style={{ color: "var(--accent)" }} /> Intake Queue
          </h1>
          <p className="page-subtitle">
            {(stats.untriaged as number) || 0} untriaged · {(stats.total_communications as number) || 0} total communications
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowSubmit(!showSubmit)}>
          <Plus size={15} /> Submit Communication
        </button>
      </div>

      {/* Urgency filters */}
      <div className="animate-fade-in-up" style={{ display: "flex", gap: "8px", marginBottom: "18px", animationDelay: "60ms" }}>
        {urgencyFilters.map(({ label, key }) => {
          const count = ((stats.by_urgency as Record<string, number>) || {})[key] || 0;
          const active = urgencyFilter === key;
          return (
            <button
              key={key}
              onClick={() => setUrgencyFilter(active ? "" : key)}
              className={`badge badge-${URGENCY_VARIANTS[key]}`}
              style={{
                padding: "5px 12px", cursor: "pointer", border: "1px solid",
                outline: active ? "2px solid var(--accent)" : "none",
                outlineOffset: "1px",
                transition: "all 0.15s",
              }}
            >
              {label} {count > 0 && <span className="num" style={{ marginLeft: "4px" }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Submit form */}
      {showSubmit && (
        <div className="card animate-slide-right" style={{ marginBottom: "18px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={14} style={{ color: "var(--accent)" }} />
              </div>
              <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>Submit for AI Analysis</span>
            </div>
            <button className="btn-icon" onClick={() => { setShowSubmit(false); setSubmitResult(null); }}><X size={14} /></button>
          </div>

          {submitResult ? (
            <div className="alert-success" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={15} style={{ color: "var(--success)" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#6EE7B7" }}>Processed successfully</span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>Category: <strong style={{ textTransform: "capitalize" as const }}>{submitResult.category?.replace(/_/g, " ")}</strong></span>
                <Badge variant={URGENCY_VARIANTS[submitResult.urgency] || "default"}>{submitResult.urgency}</Badge>
              </div>
              {submitResult.summary && (
                <div style={{ fontSize: "12px", color: "var(--text-2)", background: "var(--bg-glass)", padding: "10px", borderRadius: "6px", width: "100%" }}>
                  {submitResult.summary}
                </div>
              )}
              <button className="btn-secondary" style={{ fontSize: "12px" }} onClick={() => { setSubmitResult(null); setForm({ source_type: "manual", subject: "", body: "", sender: "", recipients: "" }); }}>
                Submit Another
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select className="input" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
                  <option value="manual">Manual Entry</option>
                  <option value="outlook">Outlook/Email</option>
                  <option value="slack">Slack</option>
                  <option value="teams">Teams</option>
                </select>
                <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <input className="input" placeholder="Sender email" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} />
                <input className="input" placeholder="Recipients" value={form.recipients} onChange={(e) => setForm({ ...form, recipients: e.target.value })} />
              </div>
              <textarea className="input" placeholder="Communication body / message content…" value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} />
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !form.body.trim()}>
                {submitting ? <><span className="spinner-sm" /> Analyzing with AI…</> : <><Send size={14} /> Submit & Analyze</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Queue grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {loading ? (
          <div className="card" style={{ gridColumn: "1 / -1", padding: "48px", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: "13px", color: "var(--text-3)" }}>Loading queue…</div>
          </div>
        ) : queue.length === 0 ? (
          <div className="card empty-state" style={{ gridColumn: "1 / -1" }}>
            <div className="empty-state-icon"><Inbox size={20} style={{ color: "var(--text-3)" }} /></div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>No items in queue</div>
            <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
              {urgencyFilter ? `No ${urgencyFilter} items` : "Submit a communication above to get started"}
            </div>
          </div>
        ) : queue.map((comm, i) => (
          <div
            key={comm.id}
            className={`card card-hover animate-fade-in-up`}
            style={{
              padding: "16px", cursor: "pointer",
              border: selected?.id === comm.id ? "1px solid var(--accent)" : undefined,
              boxShadow: selected?.id === comm.id ? "0 0 0 2px var(--accent-dim)" : undefined,
              animationDelay: `${i * 50}ms`,
            }}
            onClick={() => setSelected(comm)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const }}>
                <Badge variant={URGENCY_VARIANTS[comm.urgency] || "default"}>{comm.urgency}</Badge>
                <span className="badge badge-info" style={{ fontSize: "11px" }}>
                  {CATEGORY_LABELS[comm.category] || comm.category}
                </span>
              </div>
              {!comm.is_triaged && (
                <span className="badge badge-high" style={{ fontSize: "10px" }}>Untriaged</span>
              )}
            </div>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>
              {comm.subject || "(no subject)"}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-3)", marginBottom: "8px" }}>
              {comm.sender} · {comm.received_at ? format(new Date(comm.received_at), "MMM d, h:mm a") : "Unknown time"}
            </div>
            {comm.summary && (
              <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                {comm.summary}
              </p>
            )}
            {comm.action_items?.length > 0 && (
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
                {comm.action_items.slice(0, 2).map((item, j) => (
                  <span key={j} className="badge badge-info" style={{ fontSize: "10px" }}>
                    → {item.length > 40 ? item.slice(0, 40) + "…" : item}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <>
          <div className="modal-overlay" onClick={() => setSelected(null)} />
          <div className="panel" style={{ width: "420px" }}>
            <div className="panel-header">
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>Communication Detail</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>AI-analyzed intake item</div>
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{selected.subject || "(no subject)"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-2)", textTransform: "capitalize" }}>{selected.category?.replace(/_/g, " ")}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Urgency</div>
                  <Badge variant={URGENCY_VARIANTS[selected.urgency] || "default"}>{selected.urgency}</Badge>
                </div>
              </div>
              {selected.summary && (
                <div className="ai-answer">
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-light)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Summary</div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.6 }}>{selected.summary}</div>
                </div>
              )}
              {selected.key_facts?.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Key Facts</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {selected.key_facts.map((f, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "var(--text-2)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "1px" }}>•</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.action_items?.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Action Items</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {selected.action_items.map((a, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "var(--text-2)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--accent-light)", flexShrink: 0 }}>→</span> {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.legal_issues?.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Legal Issues</div>
                  {selected.legal_issues.map((iss, i) => (
                    <div key={i} className="alert-warn" style={{ marginBottom: "6px", fontSize: "12px" }}>
                      <AlertTriangle size={12} style={{ color: "var(--warn)", flexShrink: 0 }} />
                      <span style={{ color: "#FCD34D" }}>{iss}</span>
                    </div>
                  ))}
                </div>
              )}
              {selected.owner_recommendation && (
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recommended Owner</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{selected.owner_recommendation}</div>
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {!selected.is_triaged && (
                  <button className="btn-success" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleTriage(selected.id)}>
                    <CheckCircle size={14} /> Mark as Triaged
                  </button>
                )}
                {selected.matter_id && (
                  <Link href={`/matters/${selected.matter_id}`} className="btn-secondary" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                    View Matter <ChevronRight size={13} />
                  </Link>
                )}
                <Link href={`/intake/${selected.id}`} className="btn-ghost" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                  Full Detail View
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
