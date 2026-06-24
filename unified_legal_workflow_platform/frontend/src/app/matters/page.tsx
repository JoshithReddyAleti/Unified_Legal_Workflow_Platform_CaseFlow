"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMatters, createMatter } from "@/lib/api";
import { Matter } from "@/types";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import { Plus, Search, FolderOpen, Clock, CheckSquare, ChevronRight, X } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: string; dotColor: string }> = {
  open: { label: "Open", variant: "badge-info", dotColor: "var(--accent)" },
  active: { label: "Active", variant: "badge-low", dotColor: "var(--success)" },
  on_hold: { label: "On Hold", variant: "badge-high", dotColor: "var(--warn)" },
  closed: { label: "Closed", variant: "badge-default", dotColor: "var(--text-3)" },
};

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("general");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    getMatters(params).then(setMatters).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, search]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createMatter({ title: newTitle, matter_type: newType });
      setNewTitle(""); setNewType("general");
      setShowCreate(false);
      load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1100px" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderOpen size={20} style={{ color: "var(--accent)" }} /> Matters
          </h1>
          <p className="page-subtitle">{matters.length} total matters</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Matter
        </button>
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up" style={{ display: "flex", gap: "10px", marginBottom: "20px", animationDelay: "60ms" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            type="text" placeholder="Search matters…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input input-search"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input" style={{ width: "150px" }}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="card animate-fade-in-up" style={{ marginBottom: "18px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>New Matter</span>
            <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text" placeholder="Matter title…"
              value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="input" onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="input">
              <option value="general">General</option>
              <option value="litigation">Litigation</option>
              <option value="corporate">Corporate</option>
              <option value="employment">Employment</option>
              <option value="ip">Intellectual Property</option>
              <option value="real_estate">Real Estate</option>
              <option value="regulatory">Regulatory</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? <><span className="spinner-sm" /> Creating…</> : "Create Matter"}
            </button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 10px" }} />
          <div style={{ fontSize: "13px", color: "var(--text-3)" }}>Loading matters…</div>
        </div>
      ) : (
        <div className="card animate-fade-in-up" style={{ overflow: "hidden", animationDelay: "120ms" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "20px" }}>Matter</th>
                <th>Status</th>
                <th>Type</th>
                <th>Assigned</th>
                <th>Tasks / Deadlines</th>
                <th>Activity</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {matters.map((m, i) => {
                const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.open;
                return (
                  <tr key={m.id} className="animate-fade-in-up" style={{ animationDelay: `${150 + i * 50}ms` }}>
                    <td style={{ paddingLeft: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                          background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: 700, color: "var(--accent-light)",
                        }}>
                          {m.title.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)" }}>{m.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>
                            {m.matter_number || "—"} · {m.client_name || "No client"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }} className={`badge ${sc.variant}`}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dotColor, flexShrink: 0 }} />
                        {sc.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-2)", textTransform: "capitalize" }}>
                        {m.matter_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-2)" }}>{m.assigned_to || "—"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {(m.open_tasks || 0) > 0 && (
                          <span style={{ fontSize: "11px", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "3px" }}>
                            <CheckSquare size={10} /> {m.open_tasks}
                          </span>
                        )}
                        {(m.upcoming_deadlines || 0) > 0 && (
                          <span style={{ fontSize: "11px", color: "#FCA5A5", display: "flex", alignItems: "center", gap: "3px", fontWeight: 600 }}>
                            <Clock size={10} /> {m.upcoming_deadlines}
                          </span>
                        )}
                        {!m.open_tasks && !m.upcoming_deadlines && (
                          <span style={{ fontSize: "11px", color: "var(--text-4)" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                        {m.last_activity
                          ? format(new Date(m.last_activity), "MMM d")
                          : format(new Date(m.created_at), "MMM d")}
                      </span>
                    </td>
                    <td>
                      <Link href={`/matters/${m.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)"}
                      >
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {matters.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--text-3)", fontSize: "13px" }}>
                    No matters found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
