"use client";
import { useEffect, useState } from "react";
import { getTasks, getDeadlines, updateTask, confirmDeadline, dismissDeadline } from "@/lib/api";
import { Task, Deadline } from "@/types";
import Badge from "@/components/ui/Badge";
import { format, differenceInDays, isPast } from "date-fns";
import { CheckSquare, Clock, AlertTriangle, Check, X, Calendar } from "lucide-react";

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_VARIANTS: Record<string, "critical" | "high" | "medium" | "low"> = { critical: "critical", high: "high", medium: "medium", low: "low" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [tab, setTab] = useState<"deadlines" | "tasks">("deadlines");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  const load = () => {
    setLoading(true);
    Promise.all([getTasks({ status: statusFilter }), getDeadlines({})]).then(([t, dl]) => {
      setTasks([...t].sort((a: Task, b: Task) => (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3)));
      setDeadlines(dl);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleTaskStatus = async (id: string, status: string) => { await updateTask(id, { status }); load(); };
  const handleConfirm = async (id: string) => { await confirmDeadline(id); load(); };
  const handleDismiss = async (id: string) => { await dismissDeadline(id); load(); };

  const suggested = deadlines.filter(d => d.status === "suggested");
  const confirmed = deadlines.filter(d => d.status === "confirmed" && !isPast(new Date(d.deadline_date)));

  return (
    <div style={{ padding: "24px 28px", maxWidth: "900px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckSquare size={20} style={{ color: "var(--accent)" }} /> Tasks & Deadlines
        </h1>
        <p className="page-subtitle">
          {confirmed.length} confirmed · {tasks.length} tasks · {suggested.length} awaiting confirmation
        </p>
      </div>

      {/* Suggested deadlines alert */}
      {suggested.length > 0 && (
        <div className="animate-fade-in-up" style={{ marginBottom: "18px", animationDelay: "50ms" }}>
          <div className="alert-warn" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={15} style={{ color: "var(--warn)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FCD34D" }}>
                {suggested.length} AI-extracted deadline{suggested.length > 1 ? "s" : ""} need your confirmation
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
              {suggested.map((dl) => (
                <div key={dl.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{dl.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
                      {format(new Date(dl.deadline_date), "MMM d, yyyy")}
                      {dl.source_snippet && <span style={{ fontStyle: "italic", marginLeft: "6px" }}>"{dl.source_snippet.slice(0, 50)}…"</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginLeft: "10px" }}>
                    <button className="btn-success" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleConfirm(dl.id)}>
                      <Check size={12} /> Confirm
                    </button>
                    <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleDismiss(dl.id)}>
                      <X size={12} /> Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {[
          { key: "deadlines", label: `Deadlines (${confirmed.length})` },
          { key: "tasks", label: `Tasks (${tasks.length})` },
        ].map(({ key, label }) => (
          <button key={key} className={`tab${tab === key ? " active" : ""}`} onClick={() => setTab(key as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "deadlines" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {confirmed.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon"><Calendar size={20} style={{ color: "var(--text-3)" }} /></div>
              <div style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: 600 }}>No confirmed deadlines</div>
              <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "4px" }}>Confirm AI-extracted deadlines above to track them here</div>
            </div>
          ) : [...confirmed]
            .sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime())
            .map((dl, i) => {
              const days = differenceInDays(new Date(dl.deadline_date), new Date());
              const isUrgent = days <= 3;
              return (
                <div key={dl.id} className={`card animate-fade-in-up${isUrgent ? " animate-pulse-glow" : ""}`}
                  style={{ padding: "16px", animationDelay: `${i * 50}ms`, border: isUrgent ? "1px solid rgba(239,68,68,0.3)" : undefined }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className={`priority-bar priority-${days <= 3 ? "critical" : days <= 7 ? "high" : "medium"}`} style={{ height: "20px" }} />
                        <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{dl.title}</span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-3)", marginTop: "4px", marginLeft: "11px" }}>
                        {format(new Date(dl.deadline_date), "EEEE, MMMM d, yyyy")}
                        {dl.deadline_type && <span style={{ marginLeft: "8px", textTransform: "capitalize" }}>· {dl.deadline_type}</span>}
                      </div>
                      {dl.source_snippet && (
                        <div style={{
                          fontSize: "11px", color: "var(--text-3)", marginTop: "6px", marginLeft: "11px",
                          fontStyle: "italic", background: "var(--bg-glass)", borderRadius: "5px", padding: "6px 8px",
                          border: "1px solid var(--border)",
                        }}>
                          "{dl.source_snippet}"
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: "4px 12px", borderRadius: "8px", marginLeft: "12px", flexShrink: 0,
                      fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700,
                      background: days <= 0 ? "var(--danger)" : days <= 3 ? "var(--danger-dim)" : days <= 7 ? "var(--warn-dim)" : "var(--bg-glass)",
                      color: days <= 0 ? "white" : days <= 3 ? "#FCA5A5" : days <= 7 ? "#FCD34D" : "var(--text-3)",
                      border: `1px solid ${days <= 3 ? "rgba(239,68,68,0.3)" : days <= 7 ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
                    }}>
                      {days <= 0 ? "OVERDUE" : `${days}d`}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {tab === "tasks" && (
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {["pending", "in_progress", "completed"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? "btn-primary" : "btn-secondary"}
                style={{ padding: "6px 14px", fontSize: "12px", textTransform: "capitalize" }}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card" style={{ padding: "32px", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon"><CheckSquare size={20} style={{ color: "var(--text-3)" }} /></div>
              <div style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: 600 }}>No {statusFilter.replace(/_/g, " ")} tasks</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tasks.map((t, i) => (
                <div key={t.id} className="card card-hover animate-fade-in-up" style={{ padding: "14px 16px", animationDelay: `${i * 40}ms` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Badge variant={PRIORITY_VARIANTS[t.priority] || "default"}>{t.priority}</Badge>
                        <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{t.title}</span>
                      </div>
                      {t.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                          {t.description}
                        </p>
                      )}
                      <div style={{ fontSize: "11px", color: "var(--text-3)", display: "flex", gap: "10px" }}>
                        {t.assigned_to && <span>{t.assigned_to}</span>}
                        {t.due_date && <span>Due: {format(new Date(t.due_date), "MMM d, yyyy")}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginLeft: "12px", flexShrink: 0 }}>
                      {t.status === "pending" && (
                        <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleTaskStatus(t.id, "in_progress")}>
                          Start
                        </button>
                      )}
                      {t.status !== "completed" && (
                        <button className="btn-success" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleTaskStatus(t.id, "completed")}>
                          <Check size={12} /> Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
