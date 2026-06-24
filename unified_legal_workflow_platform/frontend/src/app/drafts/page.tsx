"use client";
import { useEffect, useState } from "react";
import { getAllCommunications, generateDraft } from "@/lib/api";
import { Communication, DraftReply } from "@/types";
import { format } from "date-fns";
import { FileText, Zap, AlertTriangle, Copy, Check, ChevronDown, Info } from "lucide-react";

export default function DraftsPage() {
  const [comms, setComms] = useState<Communication[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tone, setTone] = useState<string>("professional");
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<DraftReply | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllCommunications({ limit: 50 }).then((r: Communication[]) => {
      const sorted = r.sort((a, b) => (b.received_at || b.created_at) > (a.received_at || a.created_at) ? 1 : -1);
      setComms(sorted);
      if (sorted.length > 0) setSelectedId(sorted[0].id);
    });
  }, []);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    setDraft(null);
    setError(null);
    try {
      const result = await generateDraft({ communication_id: selectedId, tone });
      setDraft(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to generate draft. Check backend connection.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    const text = `Subject: ${draft.subject}\n\n${draft.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedComm = comms.find(c => c.id === selectedId);

  return (
    <div style={{ padding: "24px 28px", maxWidth: "900px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={20} style={{ color: "var(--accent)" }} /> Draft Replies
        </h1>
        <p className="page-subtitle">AI-generated reply drafts — always requires attorney review before sending</p>
      </div>

      {/* Review warning */}
      <div className="alert-warn animate-fade-in-up" style={{ marginBottom: "20px", animationDelay: "50ms" }}>
        <AlertTriangle size={15} style={{ color: "var(--warn)", flexShrink: 0 }} />
        <span style={{ fontSize: "12.5px", color: "#FCD34D" }}>
          <strong>Approval-first:</strong> All drafts are AI-generated and must be reviewed, edited, and approved by an attorney before sending.
          Never send without review.
        </span>
      </div>

      {/* Generator */}
      <div className="card animate-fade-in-up" style={{ padding: "20px", marginBottom: "20px", animationDelay: "100ms" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} style={{ color: "var(--accent)" }} />
          </div>
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>Generate Draft</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "10px", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px", display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Communication
            </label>
            <select
              className="input"
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setDraft(null); }}
            >
              {comms.map(c => (
                <option key={c.id} value={c.id}>
                  {c.subject || "(no subject)"} · {c.sender || "unknown"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px", display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tone
            </label>
            <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="formal">Formal</option>
              <option value="concise">Concise</option>
              <option value="empathetic">Empathetic</option>
            </select>
          </div>
        </div>

        {selectedComm && (
          <div style={{
            padding: "10px 14px", background: "var(--bg-glass)", border: "1px solid var(--border)",
            borderRadius: "8px", marginBottom: "12px",
          }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                From: <strong style={{ color: "var(--text-2)" }}>{selectedComm.sender || "—"}</strong>
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                Category: <strong style={{ color: "var(--text-2)", textTransform: "capitalize" as const }}>{selectedComm.category?.replace(/_/g, " ")}</strong>
              </span>
              {selectedComm.received_at && (
                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                  Received: <strong style={{ color: "var(--text-2)" }}>{format(new Date(selectedComm.received_at), "MMM d, yyyy")}</strong>
                </span>
              )}
            </div>
            {selectedComm.summary && (
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px", lineHeight: 1.5 }}>
                {selectedComm.summary.slice(0, 150)}{selectedComm.summary.length > 150 ? "…" : ""}
              </div>
            )}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={generating || !selectedId}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {generating ? (
            <><span className="spinner-sm" /> Generating with AI…</>
          ) : (
            <><Zap size={15} /> Generate Draft Reply</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-critical animate-fade-in-up" style={{ marginBottom: "16px" }}>
          <AlertTriangle size={14} style={{ color: "#FCA5A5" }} />
          <span style={{ fontSize: "12.5px", color: "#FCA5A5" }}>{error}</span>
        </div>
      )}

      {/* Draft output */}
      {draft && (
        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          {/* Warnings */}
          {draft.warnings?.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Attorney Review Checklist
              </div>
              {draft.warnings.map((w, i) => (
                <div key={i} className="alert-warn" style={{ marginBottom: "6px" }}>
                  <Info size={12} style={{ color: "var(--warn)", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#FCD34D" }}>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Draft text */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(90deg, var(--accent-dim), transparent)",
            }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-light)" }}>AI DRAFT — REQUIRES REVIEW</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>Tone: {draft.tone}</div>
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize: "12px", padding: "5px 12px" }}
                onClick={handleCopy}
              >
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{draft.subject}</div>
              </div>
              <div style={{
                fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.8, whiteSpace: "pre-wrap",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "16px 18px",
                fontFamily: "var(--font-mono)",
              }}>
                {draft.body}
              </div>
            </div>
          </div>

          {/* Suggested actions */}
          {draft.suggested_actions?.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Suggested Follow-up Actions
              </div>
              {draft.suggested_actions.map((a, i) => (
                <div key={i} style={{
                  fontSize: "12.5px", color: "var(--text-2)", display: "flex", gap: "8px",
                  padding: "7px 12px", background: "var(--bg-glass)", border: "1px solid var(--border)",
                  borderRadius: "6px", marginBottom: "4px",
                }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>→</span>
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
