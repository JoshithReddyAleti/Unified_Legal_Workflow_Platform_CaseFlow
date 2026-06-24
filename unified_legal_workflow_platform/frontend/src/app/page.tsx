"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMatters, getIntakeStats, getDeadlines, getTasks } from "@/lib/api";
import { Matter, Deadline, Task } from "@/types";
import { format, differenceInDays } from "date-fns";
import {
  AlertTriangle, Clock, CheckSquare, Inbox,
  FolderOpen, ArrowRight, Zap, ChevronRight,
  Activity, BarChart2, Plus, ExternalLink,
} from "lucide-react";

interface IntakeStats {
  total_communications: number;
  untriaged: number;
  by_urgency: Record<string, number>;
  by_category: Record<string, number>;
}

const MATTER_TYPE_CONFIG: Record<string, { color: string; bgClass: string; avatarClass: string; icon: string; label: string }> = {
  litigation:  { color: "#EF4444", bgClass: "matter-accent-litigation",  avatarClass: "avatar-litigation",  icon: "⚖️", label: "Litigation" },
  employment:  { color: "#F59E0B", bgClass: "matter-accent-employment",  avatarClass: "avatar-employment",  icon: "👥", label: "Employment" },
  ip:          { color: "#A78BFA", bgClass: "matter-accent-ip",          avatarClass: "avatar-ip",          icon: "💡", label: "IP" },
  corporate:   { color: "#60A5FA", bgClass: "matter-accent-corporate",   avatarClass: "avatar-corporate",   icon: "🏢", label: "Corporate" },
  real_estate: { color: "#34D399", bgClass: "matter-accent-real_estate", avatarClass: "avatar-real_estate", icon: "🏛️", label: "Real Estate" },
  regulatory:  { color: "#FB923C", bgClass: "matter-accent-regulatory",  avatarClass: "avatar-regulatory",  icon: "📋", label: "Regulatory" },
  general:     { color: "#94A3B8", bgClass: "matter-accent-general",     avatarClass: "avatar-general",     icon: "📁", label: "General" },
};

const CAT_COLORS = [
  "linear-gradient(90deg,#4F6AF5,#7C3AED)",
  "linear-gradient(90deg,#10B981,#059669)",
  "linear-gradient(90deg,#F59E0B,#F97316)",
  "linear-gradient(90deg,#EF4444,#DC2626)",
  "linear-gradient(90deg,#60A5FA,#4F6AF5)",
  "linear-gradient(90deg,#A78BFA,#7C3AED)",
];

function IntelStatCard({
  label, value, sub, icon: Icon, variant, bgNum, delay = 0,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; variant: "blue" | "amber" | "red" | "green"; bgNum?: string; delay?: number;
}) {
  const iconColors = { blue: "var(--accent)", amber: "#F59E0B", red: "#EF4444", green: "#10B981" };
  return (
    <div className={`intel-stat ${variant} animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <div className="num" style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginTop: "4px" }}>{label}</div>
          {sub && <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "3px" }}>{sub}</div>}
        </div>
        <div className="intel-stat-icon">
          <Icon size={17} style={{ color: iconColors[variant] }} />
        </div>
      </div>
      {bgNum && <div className="intel-stat-bg-num">{bgNum}</div>}
    </div>
  );
}

function DeadlineChip({ days }: { days: number }) {
  if (days < 0) return <div className="dl-chip dl-chip-overdue">OVERDUE</div>;
  if (days <= 3) return <div className="dl-chip dl-chip-overdue">{days}d LEFT</div>;
  if (days <= 7) return <div className="dl-chip dl-chip-urgent">{days}d</div>;
  if (days <= 14) return <div className="dl-chip dl-chip-soon">{days}d</div>;
  return <div className="dl-chip dl-chip-normal">{days}d</div>;
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="clock-display">
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </span>
  );
}

export default function Dashboard() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [intakeStats, setIntakeStats] = useState<IntakeStats | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMatters({ status: "active", limit: "6" }),
      getIntakeStats(),
      getDeadlines({ upcoming_days: 30, status: "confirmed" }),
      getTasks({ status: "pending", limit: "5" }),
    ]).then(([m, stats, dl, t]) => {
      setMatters(m);
      setIntakeStats(stats);
      setDeadlines(dl.slice(0, 6));
      setTasks(t.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 12px", width: "32px", height: "32px" }} />
          <div style={{ fontSize: "13px", color: "var(--text-3)", letterSpacing: "0.05em" }}>Initializing intelligence…</div>
        </div>
      </div>
    );
  }

  const criticalCount = intakeStats?.by_urgency?.critical || 0;
  const untriagedCount = intakeStats?.untriaged || 0;
  const showAlert = criticalCount > 0 || untriagedCount > 2;

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1240px" }}>

      {/* ── HERO COMMAND CARD ─────────────────────────────────────────────── */}
      <div className="hero-card animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <div className="hero-scan-line" />
        <div className="hero-glow-corner" />
        <div className="hero-glow-corner-2" />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 8px var(--success-glow)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {format(new Date(), "EEEE · MMMM d, yyyy")}
              </span>
              <LiveClock />
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
              background: "linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 60%, #94A3B8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              marginBottom: "6px",
            }}>
              Legal Command Center
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--text-3)", fontWeight: 400, maxWidth: "480px", lineHeight: 1.5 }}>
              All matters, deadlines, and communications — unified into a single real-time intelligence view.
            </p>

            {/* Pills row */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
              <div className="ai-status-pill">
                <span className="ai-pulse-dot" />
                AI Engine Active
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "100px", fontSize: "11.5px", color: "var(--text-3)", fontWeight: 500,
              }}>
                <Activity size={11} />
                MCP v1 · 16 tools
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                borderRadius: "100px", fontSize: "11.5px", color: "var(--text-3)", fontWeight: 500,
              }}>
                <Zap size={11} />
                {matters.length} active matters
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, paddingTop: "4px" }}>
            <Link href="/intake" style={{ textDecoration: "none" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "10px 18px", borderRadius: "9px", cursor: "pointer",
                background: "linear-gradient(135deg, #4F6AF5 0%, #7C3AED 100%)",
                border: "1px solid rgba(79,106,245,0.4)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                boxShadow: "0 8px 24px rgba(79,106,245,0.3)",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}>
                <Plus size={14} /> New Intake
              </button>
            </Link>
            <Link href="/matters" style={{ textDecoration: "none" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "10px 18px", borderRadius: "9px", cursor: "pointer",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                color: "var(--text-2)", fontSize: "13px", fontWeight: 500,
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}>
                <ExternalLink size={14} /> All Matters
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── CRITICAL ALERT ────────────────────────────────────────────────── */}
      {showAlert && (
        <div className="critical-command animate-fade-in-up" style={{ marginBottom: "20px", animationDelay: "80ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="critical-ring" style={{
              width: "34px", height: "34px", flexShrink: 0,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={16} style={{ color: "#FCA5A5" }} className="crit-blink" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#FCA5A5", letterSpacing: "-0.01em" }}>
                Immediate Attention Required
              </div>
              <div style={{ fontSize: "12px", color: "rgba(252,165,165,0.65)", marginTop: "2px", lineHeight: 1.4 }}>
                {criticalCount > 0 && `${criticalCount} critical item${criticalCount > 1 ? "s" : ""} flagged in intake queue. `}
                {untriagedCount > 0 && `${untriagedCount} communication${untriagedCount > 1 ? "s" : ""} awaiting triage.`}
              </div>
            </div>
            <Link href="/intake" style={{ textDecoration: "none" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 14px", borderRadius: "7px", cursor: "pointer",
                background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
                color: "#FCA5A5", fontSize: "12px", fontWeight: 600,
                transition: "all 0.2s ease",
              }}>
                Review Now <ArrowRight size={12} />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── INTEL STAT CARDS ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        <IntelStatCard
          label="Active Matters" value={matters.length} sub="open + active"
          icon={FolderOpen} variant="blue" bgNum={String(matters.length)} delay={60}
        />
        <IntelStatCard
          label="Untriaged" value={untriagedCount} sub="need review"
          icon={Inbox} variant="amber" bgNum={String(untriagedCount)} delay={130}
        />
        <IntelStatCard
          label="Deadlines" value={deadlines.length} sub="next 30 days"
          icon={Clock} variant="red" bgNum={String(deadlines.length)} delay={200}
        />
        <IntelStatCard
          label="Open Tasks" value={tasks.length} sub="pending action"
          icon={CheckSquare} variant="green" bgNum={String(tasks.length)} delay={270}
        />
      </div>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px" }}>

        {/* Active Matters */}
        <div className="card animate-fade-in-up" style={{ animationDelay: "220ms", padding: 0 }}>
          <div className="card-header" style={{ justifyContent: "space-between", padding: "16px 20px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderOpen size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>Active Matters</span>
              <span style={{
                fontSize: "10.5px", fontWeight: 600, padding: "1px 7px",
                background: "var(--accent-dim)", color: "var(--accent-light)",
                border: "1px solid var(--border-accent)", borderRadius: "100px",
              }}>{matters.length}</span>
            </div>
            <Link href="/matters" style={{
              display: "flex", alignItems: "center", gap: "4px",
              fontSize: "12px", color: "var(--accent)", textDecoration: "none", fontWeight: 500,
              padding: "4px 10px", background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
              borderRadius: "6px", transition: "all 0.15s ease",
            }}>
              View all <ChevronRight size={11} />
            </Link>
          </div>

          {matters.length === 0 ? (
            <div className="empty-state-enhanced" style={{ padding: "40px 20px" }}>
              <div className="icon-wrap">
                <FolderOpen size={22} style={{ color: "var(--text-3)" }} />
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-2)", marginBottom: "5px" }}>No active matters</div>
              <div style={{ fontSize: "12px", color: "var(--text-4)" }}>Create a new matter or open an intake to get started.</div>
            </div>
          ) : (
            matters.map((m, i) => {
              const cfg = MATTER_TYPE_CONFIG[m.matter_type] || MATTER_TYPE_CONFIG.general;
              return (
                <Link key={m.id} href={`/matters/${m.id}`} style={{ textDecoration: "none" }} className="matter-row">
                  <div
                    className={`animate-fade-in-up ${cfg.bgClass}`}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "13px",
                      padding: "14px 20px 14px 16px",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s ease",
                      animationDelay: `${260 + i * 55}ms`,
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-glass-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Type avatar */}
                    <div className={cfg.avatarClass} style={{
                      width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px",
                    }}>
                      {cfg.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.title}
                        </span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-3)", marginBottom: "7px" }}>
                        {m.matter_number || "—"} · {m.client_name || "No client"} · {m.assigned_to || "Unassigned"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        {/* Type badge */}
                        <span style={{
                          fontSize: "10.5px", fontWeight: 700, padding: "2px 7px",
                          borderRadius: "100px", letterSpacing: "0.03em",
                          background: `${cfg.color}18`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}30`,
                        }}>
                          {cfg.label.toUpperCase()}
                        </span>
                        {(m.open_tasks || 0) > 0 && (
                          <span style={{
                            fontSize: "10.5px", fontWeight: 600, padding: "2px 7px",
                            borderRadius: "100px",
                            background: "var(--bg-glass)", color: "var(--text-2)",
                            border: "1px solid var(--border)",
                            display: "flex", alignItems: "center", gap: "3px",
                          }}>
                            <CheckSquare size={9} /> {m.open_tasks} task{(m.open_tasks || 0) > 1 ? "s" : ""}
                          </span>
                        )}
                        {(m.upcoming_deadlines || 0) > 0 && (
                          <span style={{
                            fontSize: "10.5px", fontWeight: 700, padding: "2px 7px",
                            borderRadius: "100px",
                            background: "var(--danger-dim)", color: "#FCA5A5",
                            border: "1px solid rgba(239,68,68,0.25)",
                            display: "flex", alignItems: "center", gap: "3px",
                          }}>
                            <Clock size={9} /> {m.upcoming_deadlines} deadline{(m.upcoming_deadlines || 0) > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={14} style={{ color: "var(--text-4)", flexShrink: 0, marginTop: "3px" }} />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Upcoming Deadlines */}
          <div className="card animate-fade-in-up" style={{ animationDelay: "300ms", padding: 0 }}>
            <div className="card-header" style={{ justifyContent: "space-between", padding: "15px 16px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={13} style={{ color: "#FCA5A5" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Deadlines</span>
                {deadlines.length > 0 && (
                  <span style={{
                    fontSize: "10.5px", fontWeight: 600, padding: "1px 6px",
                    background: "var(--danger-dim)", color: "#FCA5A5",
                    border: "1px solid rgba(239,68,68,0.25)", borderRadius: "100px",
                  }}>{deadlines.length}</span>
                )}
              </div>
              <Link href="/tasks" style={{ fontSize: "11.5px", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                All tasks
              </Link>
            </div>

            <div style={{ padding: "0 16px 12px" }}>
              {deadlines.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", fontSize: "12px", color: "var(--text-3)" }}>
                  No upcoming deadlines
                </div>
              ) : deadlines.map((dl, i) => {
                const days = differenceInDays(new Date(dl.deadline_date), new Date());
                return (
                  <div key={dl.id} className="animate-fade-in-up" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid var(--border)",
                    animationDelay: `${340 + i * 55}ms`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dl.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
                        {format(new Date(dl.deadline_date), "MMM d, yyyy")}
                      </div>
                    </div>
                    <DeadlineChip days={days} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intake by Category */}
          {intakeStats && Object.keys(intakeStats.by_category || {}).length > 0 && (
            <div className="card animate-fade-in-up" style={{ animationDelay: "380ms", padding: 0 }}>
              <div className="card-header" style={{ padding: "15px 16px 13px" }}>
                <BarChart2 size={13} style={{ color: "var(--accent)", marginRight: "6px" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Intake by Category</span>
              </div>
              <div style={{ padding: "4px 16px 14px" }}>
                {Object.entries(intakeStats.by_category || {})
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([cat, count], i) => {
                    const total = intakeStats.total_communications || 1;
                    const pct = Math.round(((count as number) / total) * 100);
                    return (
                      <div key={cat} className="animate-fade-in-up" style={{ marginBottom: "11px", animationDelay: `${410 + i * 45}ms` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                          <span style={{ fontSize: "11.5px", color: "var(--text-2)", textTransform: "capitalize", fontWeight: 500 }}>
                            {cat.replace(/_/g, " ")}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-4)", fontWeight: 500 }}>{pct}%</span>
                            <span className="num" style={{ fontSize: "12px", color: "var(--text-1)", fontWeight: 700 }}>{count as number}</span>
                          </div>
                        </div>
                        <div style={{ height: "3px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: CAT_COLORS[i % CAT_COLORS.length],
                            borderRadius: "3px",
                            transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Open Tasks mini-list */}
          {tasks.length > 0 && (
            <div className="card animate-fade-in-up" style={{ animationDelay: "450ms", padding: 0 }}>
              <div className="card-header" style={{ padding: "15px 16px 13px", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckSquare size={13} style={{ color: "#10B981" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>Open Tasks</span>
                </div>
                <Link href="/tasks" style={{ fontSize: "11.5px", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                  View all
                </Link>
              </div>
              <div style={{ padding: "0 16px 12px" }}>
                {tasks.map((task, i) => (
                  <div key={task.id} className="animate-fade-in-up" style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 0", borderBottom: "1px solid var(--border)",
                    animationDelay: `${480 + i * 50}ms`,
                  }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                      background: task.priority === "high" ? "#EF4444" : task.priority === "medium" ? "#F59E0B" : "#10B981",
                      boxShadow: `0 0 6px ${task.priority === "high" ? "rgba(239,68,68,0.5)" : "transparent"}`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.title}
                      </div>
                      {task.assigned_to && (
                        <div style={{ fontSize: "10.5px", color: "var(--text-4)", marginTop: "1px" }}>
                          {task.assigned_to}
                        </div>
                      )}
                    </div>
                    {task.priority === "high" && (
                      <span style={{ fontSize: "9.5px", fontWeight: 700, padding: "2px 6px", borderRadius: "100px", background: "var(--danger-dim)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.25)", letterSpacing: "0.04em" }}>
                        HIGH
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
