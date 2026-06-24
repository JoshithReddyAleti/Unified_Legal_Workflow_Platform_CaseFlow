"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCommunication } from "@/lib/api";
import { Communication } from "@/types";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import { ArrowLeft, AlertTriangle, Sparkles } from "lucide-react";

const URGENCY_VARIANTS: Record<string, "critical" | "high" | "medium" | "low"> = { critical: "critical", high: "high", medium: "medium", low: "low" };
const CATEGORY_LABELS: Record<string, string> = {
  contract_review: "Contract Review", litigation_support: "Litigation",
  privacy_data: "Privacy/Data", employment: "Employment",
  commercial_dispute: "Commercial Dispute", compliance: "Compliance",
  policy_question: "Policy Q", general_inquiry: "General", unclassified: "Unclassified",
};

function SectionLabel({ text }: { text: string }) {
  return <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{text}</div>;
}

export default function CommunicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [comm, setComm] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCommunication(id).then(setComm).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px" }}>
      <div className="spinner" />
    </div>
  );

  if (!comm) return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Communication not found</div>
  );

  return (
    <div style={{ padding: "24px 28px", maxWidth: "980px" }}>
      <Link href="/intake" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--text-3)", textDecoration: "none", marginBottom: "18px", transition: "color 0.15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)"}
      >
        <ArrowLeft size={13} /> Intake Queue
      </Link>

      {/* Header card */}
      <div className="card animate-fade-in-up" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ marginBottom: "12px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-1)", marginBottom: "5px" }}>
            {comm.subject || "(no subject)"}
          </h1>
          <div style={{ fontSize: "12.5px", color: "var(--text-3)" }}>
            From: <strong style={{ color: "var(--text-2)" }}>{comm.sender || "Unknown"}</strong>
            {comm.received_at && <> · {format(new Date(comm.received_at), "MMM d, yyyy h:mm a")}</>}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px", alignItems: "center" }}>
          <Badge variant={URGENCY_VARIANTS[comm.urgency] || "default"}>{comm.urgency}</Badge>
          <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
            {CATEGORY_LABELS[comm.category] || comm.category}
          </span>
          <span className="badge badge-default" style={{ textTransform: "capitalize" as const }}>{comm.source_type}</span>
          {comm.is_triaged && <span className="badge badge-low">Triaged</span>}
          {comm.matter_id && (
            <Link href={`/matters/${comm.matter_id}`} style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              View Matter →
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" }}>
        {/* Left: AI analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {comm.summary && (
            <div className="ai-answer animate-fade-in-up" style={{ animationDelay: "80ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <Sparkles size={14} style={{ color: "var(--accent-light)" }} />
                <SectionLabel text="AI Summary" />
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.7 }}>{comm.summary}</p>
            </div>
          )}

          {comm.key_facts?.length > 0 && (
            <div className="card animate-fade-in-up" style={{ padding: "16px", animationDelay: "120ms" }}>
              <SectionLabel text="Key Facts" />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {comm.key_facts.map((f, i) => (
                  <div key={i} style={{ fontSize: "13px", color: "var(--text-2)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }}>•</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {comm.action_items?.length > 0 && (
            <div className="card animate-fade-in-up" style={{ padding: "16px", animationDelay: "160ms" }}>
              <SectionLabel text="Action Items" />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {comm.action_items.map((a, i) => (
                  <div key={i} style={{ fontSize: "13px", color: "var(--text-2)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--accent-light)", flexShrink: 0 }}>→</span> {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {comm.legal_issues?.length > 0 && (
            <div className="card animate-fade-in-up" style={{ padding: "16px", animationDelay: "200ms" }}>
              <SectionLabel text="Legal Issues" />
              {comm.legal_issues.map((iss, i) => (
                <div key={i} className="alert-warn" style={{ marginBottom: "5px" }}>
                  <AlertTriangle size={12} style={{ color: "var(--warn)" }} />
                  <span style={{ fontSize: "12.5px", color: "#FCD34D" }}>{iss}</span>
                </div>
              ))}
            </div>
          )}

          {comm.open_questions?.length > 0 && (
            <div className="card animate-fade-in-up" style={{ padding: "16px", animationDelay: "240ms" }}>
              <SectionLabel text="Open Questions" />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {comm.open_questions.map((q, i) => (
                  <div key={i} style={{ fontSize: "13px", color: "var(--text-2)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--text-3)", flexShrink: 0 }}>?</span> {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {comm.body && (
            <div className="card animate-fade-in-up" style={{ padding: "16px", animationDelay: "280ms" }}>
              <SectionLabel text="Original Message" />
              <pre style={{
                fontSize: "12px", color: "var(--text-3)", whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)",
                lineHeight: 1.6, maxHeight: "300px", overflowY: "auto", background: "var(--bg-glass)",
                borderRadius: "6px", padding: "12px", border: "1px solid var(--border)",
              }}>
                {comm.body}
              </pre>
            </div>
          )}
        </div>

        {/* Right: metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {comm.owner_recommendation && (
            <div className="card animate-fade-in-up" style={{ padding: "14px", animationDelay: "100ms" }}>
              <SectionLabel text="Recommended Owner" />
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--accent-light)" }}>{comm.owner_recommendation}</div>
            </div>
          )}

          <div className="card animate-fade-in-up" style={{ padding: "14px", animationDelay: "140ms" }}>
            <SectionLabel text="Details" />
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                { label: "Source", value: comm.source_type, style: { textTransform: "capitalize" as const } },
                { label: "Processed", value: comm.is_processed ? "Yes" : "No", style: { color: comm.is_processed ? "var(--success)" : "var(--text-3)" } },
                { label: "Triaged", value: comm.is_triaged ? "Yes" : "Pending", style: { color: comm.is_triaged ? "var(--success)" : "var(--warn)" } },
                { label: "Received", value: comm.received_at ? format(new Date(comm.received_at), "MMM d, yyyy") : "—", style: {} },
              ].map(({ label, value, style }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--text-3)" }}>{label}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-2)", ...style }}>{value}</span>
                </div>
              ))}
              {comm.recipients?.length > 0 && (
                <div>
                  <span style={{ fontSize: "11.5px", color: "var(--text-3)", display: "block", marginBottom: "3px" }}>Recipients</span>
                  {comm.recipients.map((r, i) => (
                    <div key={i} style={{ fontSize: "12px", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
