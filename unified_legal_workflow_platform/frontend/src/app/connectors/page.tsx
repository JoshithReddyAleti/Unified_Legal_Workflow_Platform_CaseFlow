"use client";
import { useEffect, useState } from "react";
import { getConnectors } from "@/lib/api";
import { Connector } from "@/types";
import { Plug, ExternalLink, Zap, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const ICON_MAP: Record<string, string> = {
  outlook: "📧",
  gmail: "📬",
  teams: "💬",
  slack: "🟣",
  drive: "📂",
  sharepoint: "🗂️",
};

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; badgeVariant: string }> = {
  connected: { label: "Connected", dotClass: "connected", badgeVariant: "badge-low" },
  disconnected: { label: "Disconnected", dotClass: "disconnected", badgeVariant: "badge-default" },
  error: { label: "Error", dotClass: "critical", badgeVariant: "badge-critical" },
  syncing: { label: "Syncing", dotClass: "warning", badgeVariant: "badge-high" },
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnectors().then(setConnectors).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1000px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: "28px" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Plug size={20} style={{ color: "var(--accent)" }} /> Connector Hub
        </h1>
        <p className="page-subtitle">Connect your communication channels for automatic intake</p>
      </div>

      {/* Status summary */}
      <div className="card animate-fade-in-up" style={{ padding: "16px 20px", marginBottom: "24px", animationDelay: "60ms", background: "var(--accent-dim)", borderColor: "var(--border-accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Zap size={16} style={{ color: "var(--accent-light)" }} />
          <span style={{ fontSize: "13px", color: "var(--text-2)" }}>
            <strong style={{ color: "var(--accent-light)" }}>v1 — Manual intake enabled.</strong>{" "}
            Connect Outlook, Gmail, Teams, or Slack for automatic ingestion. OAuth2 connectors coming in v2.
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card skeleton" style={{ height: "180px" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {connectors.map((c, i) => {
            const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.disconnected;
            return (
              <div
                key={c.id}
                className={`connector-card animate-fade-in-up`}
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "11px",
                      background: "var(--bg-elevated)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "20px",
                    }}>
                      {ICON_MAP[c.icon] || "🔌"}
                    </div>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-1)" }}>{c.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                        <div className={`status-dot ${sc.dotClass}`} />
                        <span className={`badge ${sc.badgeVariant}`} style={{ fontSize: "10px" }}>{sc.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.5, marginBottom: "12px" }}>
                  {c.description}
                </p>

                <div style={{ marginBottom: "14px" }}>
                  {c.features.slice(0, 3).map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontSize: "11.5px", color: "var(--text-3)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: "center", fontSize: "12px", padding: "7px 10px", opacity: 0.7, cursor: "not-allowed" }}
                    disabled
                  >
                    {c.status === "connected" ? <><CheckCircle size={13} /> Connected</> : "Connect (v2)"}
                  </button>
                  <a
                    href={c.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                    style={{ textDecoration: "none" }}
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual intake note */}
      <div className="card animate-fade-in-up" style={{ marginTop: "24px", padding: "18px", animationDelay: "500ms" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <AlertCircle size={16} style={{ color: "var(--accent-light)", flexShrink: 0, marginTop: "1px" }} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>
              Using manual intake while connectors are pending
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-3)", lineHeight: 1.6 }}>
              Use the <strong style={{ color: "var(--text-2)" }}>Intake Queue</strong> to paste email/message text directly.
              The AI pipeline (classify → summarize → extract → link) runs on all submitted communications
              regardless of source connector.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
