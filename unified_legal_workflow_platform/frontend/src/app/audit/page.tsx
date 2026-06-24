"use client";
import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api";
import { format } from "date-fns";
import { Activity, Shield } from "lucide-react";

interface AuditEntry {
  id: string; event_type: string; entity_type?: string; entity_id?: string;
  matter_id?: string; action?: string; details?: Record<string, unknown>;
  ai_model_used?: string; created_at: string;
}

const EVENT_VARIANT: Record<string, string> = {
  intake_submitted: "badge-info",
  matter_created: "badge-low",
  matter_updated: "badge-default",
  task_created: "badge-purple",
  task_updated: "badge-default",
  deadline_created: "badge-high",
  deadline_confirmed: "badge-low",
  communication_triaged: "badge-info",
  knowledge_query: "badge-purple",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ event_type: eventFilter || undefined, limit: 100 })
      .then(setLogs).finally(() => setLoading(false));
  }, [eventFilter]);

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1000px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Activity size={20} style={{ color: "var(--accent)" }} /> Audit Log
        </h1>
        <p className="page-subtitle">Persistent trail of all system events, AI outputs, and actions</p>
      </div>

      <div className="animate-fade-in-up" style={{ marginBottom: "18px", animationDelay: "60ms" }}>
        <select className="input" style={{ width: "220px" }} value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="">All Events</option>
          <option value="intake_submitted">Intake Submitted</option>
          <option value="matter_created">Matter Created</option>
          <option value="task_created">Task Created</option>
          <option value="deadline_confirmed">Deadline Confirmed</option>
          <option value="knowledge_query">Knowledge Query</option>
          <option value="communication_triaged">Communication Triaged</option>
        </select>
      </div>

      <div className="card animate-fade-in-up" style={{ overflow: "hidden", animationDelay: "120ms" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: "48px" }}>
            <div className="empty-state-icon"><Shield size={20} style={{ color: "var(--text-3)" }} /></div>
            <div style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: 600 }}>No audit entries</div>
            <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "4px" }}>Activity will appear here as you use the platform</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {["Timestamp", "Event", "Entity", "Action", "AI Model"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 20}ms` }}>
                  <td>
                    <span className="mono" style={{ fontSize: "11.5px", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {log.created_at ? format(new Date(log.created_at), "MMM d HH:mm:ss") : "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${EVENT_VARIANT[log.event_type] || "badge-default"}`} style={{ textTransform: "capitalize" }}>
                      {log.event_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "12.5px", color: "var(--text-2)", textTransform: "capitalize" }}>{log.entity_type || "—"}</div>
                    {log.entity_id && (
                      <div className="mono" style={{ fontSize: "10.5px", color: "var(--text-4)" }}>{log.entity_id.slice(0, 8)}…</div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: "12.5px", color: "var(--text-2)" }}>{log.action || "—"}</span>
                  </td>
                  <td>
                    {log.ai_model_used ? (
                      <span className="mono badge badge-purple" style={{ fontSize: "10px" }}>{log.ai_model_used}</span>
                    ) : <span style={{ color: "var(--text-4)", fontSize: "12px" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
