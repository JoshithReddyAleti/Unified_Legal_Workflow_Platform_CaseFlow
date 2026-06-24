"use client";
import { useEffect, useState } from "react";
import { getKnowledge, queryKnowledge, addKnowledgeItem } from "@/lib/api";
import { KnowledgeItem } from "@/types";
import { BookOpen, Plus, Send, FileText, ExternalLink, AlertCircle, X, Sparkles } from "lucide-react";

interface QueryResult {
  query: string;
  answer: string;
  citations: Array<{ knowledge_item_id: string; title: string; source_type: string; source_url?: string; relevant_excerpt: string; relevance_score: number }>;
  is_complete: boolean;
  uncertainty_notes?: string;
  model_used: string;
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [tab, setTab] = useState<"qa" | "library">("qa");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", content: "", source_type: "uploaded", practice_area: "", tags: "" });
  const [adding, setAdding] = useState(false);

  const loadItems = () => {
    getKnowledge({}).then(setItems);
  };

  useEffect(() => { loadItems(); }, []);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setQuerying(true);
    setResult(null);
    try {
      const r = await queryKnowledge({ query });
      setResult(r);
    } catch (e) {
      setResult({ query, answer: "Error processing query. Check API connection.", citations: [], is_complete: false, model_used: "" });
    } finally {
      setQuerying(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.title || !addForm.content) return;
    setAdding(true);
    try {
      await addKnowledgeItem({
        ...addForm,
        tags: addForm.tags ? addForm.tags.split(",").map(t => t.trim()) : [],
        is_approved: "true",
      });
      setShowAdd(false);
      setAddForm({ title: "", content: "", source_type: "uploaded", practice_area: "", tags: "" });
      loadItems();
    } finally {
      setAdding(false);
    }
  };

  const SOURCE_VARIANTS: Record<string, string> = {
    playbook: "badge-purple", policy: "badge-info",
    uploaded: "badge-default", template: "badge-low",
    prior_matter: "badge-high", manual: "badge-default",
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "860px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={20} style={{ color: "var(--accent)" }} /> Knowledge Base
          </h1>
          <p className="page-subtitle">Grounded answers from {items.length} approved sources</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={15} /> Add Source
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        {[{ key: "qa", label: "Ask a Question" }, { key: "library", label: `Library (${items.length})` }].map(({ key, label }) => (
          <button key={key} className={`tab${tab === key ? " active" : ""}`} onClick={() => setTab(key as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {/* Add source */}
      {showAdd && (
        <div className="card animate-fade-in-up" style={{ marginBottom: "18px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>Add Knowledge Source</span>
            <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={14} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input className="input" placeholder="Title" value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} style={{ gridColumn: "1 / -1" }} />
              <select className="input" value={addForm.source_type} onChange={(e) => setAddForm({ ...addForm, source_type: e.target.value })}>
                <option value="uploaded">Uploaded</option>
                <option value="playbook">Playbook</option>
                <option value="policy">Policy</option>
                <option value="template">Template</option>
                <option value="prior_matter">Prior Matter</option>
              </select>
              <input className="input" placeholder="Practice area (e.g., litigation)" value={addForm.practice_area}
                onChange={(e) => setAddForm({ ...addForm, practice_area: e.target.value })} />
              <input className="input" placeholder="Tags (comma separated)" value={addForm.tags}
                onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} style={{ gridColumn: "1 / -1" }} />
            </div>
            <textarea className="input" placeholder="Paste document text, policy, playbook content…" value={addForm.content}
              onChange={(e) => setAddForm({ ...addForm, content: e.target.value })} rows={5} />
            <button className="btn-primary" onClick={handleAdd} disabled={adding || !addForm.title || !addForm.content}>
              {adding ? <><span className="spinner-sm" /> Adding…</> : "Add to Knowledge Base"}
            </button>
          </div>
        </div>
      )}

      {tab === "qa" && (
        <div>
          {/* Query */}
          <div className="card animate-fade-in-up" style={{ padding: "18px", marginBottom: "18px", animationDelay: "100ms" }}>
            <div style={{ fontSize: "11.5px", color: "var(--text-3)", marginBottom: "10px" }}>
              Example: "What is our NDA position on indemnity caps?" or "How should we respond to an EEOC charge?"
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input className="input" placeholder="Ask a legal question…"
                value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={handleQuery} disabled={querying || !query.trim()}>
                {querying ? <><span className="spinner-sm" /> Searching…</> : <><Send size={14} /> Ask</>}
              </button>
            </div>
          </div>

          {querying && (
            <div className="card" style={{ padding: "36px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div className="spinner" />
                <span style={{ fontSize: "13px", color: "var(--text-3)" }}>Searching knowledge base…</span>
              </div>
            </div>
          )}

          {result && !querying && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="ai-answer animate-fade-in-up">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Sparkles size={15} style={{ color: "var(--accent-light)" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-light)" }}>Grounded Answer</span>
                  {!result.is_complete && <span className="badge badge-high">Incomplete</span>}
                </div>
                <div style={{ fontSize: "13.5px", color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.answer}</div>
                {result.uncertainty_notes && (
                  <div className="alert-warn" style={{ marginTop: "12px" }}>
                    <AlertCircle size={13} style={{ color: "var(--warn)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "#FCD34D" }}>{result.uncertainty_notes}</span>
                  </div>
                )}
                <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                  {result.model_used || "claude-sonnet-4-6"} · {result.citations.length} source{result.citations.length !== 1 ? "s" : ""} cited
                </div>
              </div>

              {result.citations.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Sources Used
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.citations.map((c, i) => (
                      <div key={i} className="citation-card animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <span className="mono" style={{ fontSize: "11px", padding: "1px 6px", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "4px", color: "var(--accent-light)" }}>
                                [{i + 1}]
                              </span>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{c.title}</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span className={`badge ${SOURCE_VARIANTS[c.source_type] || "badge-default"}`} style={{ textTransform: "capitalize" }}>
                                {c.source_type.replace(/_/g, " ")}
                              </span>
                              {c.relevance_score > 0 && (
                                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{Math.round(c.relevance_score * 100)}% relevant</span>
                              )}
                            </div>
                          </div>
                          {c.source_url && (
                            <a href={c.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: "8px", flexShrink: 0 }}>
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        {c.relevant_excerpt && (
                          <div style={{
                            marginTop: "8px", fontSize: "12px", color: "var(--text-3)",
                            fontStyle: "italic", background: "var(--bg-glass)", borderRadius: "5px",
                            padding: "8px 10px", border: "1px solid var(--border)",
                          }}>
                            "{c.relevant_excerpt.slice(0, 200)}{c.relevant_excerpt.length > 200 ? "…" : ""}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "library" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon"><FileText size={20} style={{ color: "var(--text-3)" }} /></div>
              <div style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: 600 }}>No knowledge sources</div>
              <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "4px" }}>Add playbooks, policies, or templates above</div>
            </div>
          ) : items.map((item, i) => (
            <div key={item.id} className="card card-hover animate-fade-in-up" style={{ padding: "14px 16px", animationDelay: `${i * 40}ms` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-glass)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={14} style={{ color: "var(--text-3)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{item.title}</span>
                    {item.is_approved === "true" && <span className="badge badge-low">approved</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span className={`badge ${SOURCE_VARIANTS[item.source_type] || "badge-default"}`} style={{ textTransform: "capitalize" }}>
                      {item.source_type.replace(/_/g, " ")}
                    </span>
                    {item.practice_area && (
                      <span style={{ fontSize: "11.5px", color: "var(--text-3)", textTransform: "capitalize" }}>{item.practice_area}</span>
                    )}
                  </div>
                  {item.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
                      {item.tags.map((tag, j) => (
                        <span key={j} className="badge badge-default" style={{ fontSize: "10px" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
