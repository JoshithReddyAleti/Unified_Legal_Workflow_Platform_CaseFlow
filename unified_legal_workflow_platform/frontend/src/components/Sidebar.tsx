"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Inbox,
  Clock,
  CheckSquare,
  BookOpen,
  Activity,
  Plug,
  FileText,
  Zap,
  ChevronRight,
  Cpu,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/matters", icon: FolderOpen, label: "Matters" },
    ],
  },
  {
    label: "Workflow",
    items: [
      { href: "/intake", icon: Inbox, label: "Intake Queue", badge: "AI" },
      { href: "/tasks", icon: CheckSquare, label: "Tasks & Deadlines" },
      { href: "/timeline", icon: Clock, label: "Timeline" },
      { href: "/drafts", icon: FileText, label: "Draft Replies" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
      { href: "/connectors", icon: Plug, label: "Connectors" },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/audit", icon: Activity, label: "Audit Log" },
    ],
  },
];

function SidebarClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  if (!time) return null;

  return (
    <div style={{
      padding: "8px 14px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text-2)",
        letterSpacing: "0.03em",
      }}>
        {time}
      </div>
      <div style={{ fontSize: "10px", color: "var(--text-4)", fontWeight: 500 }}>
        {date}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="sidebar-logo-icon">
            <Zap size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              CaseFlow
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 500, letterSpacing: "0.04em" }}>
              LEGAL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Status row */}
        <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 8px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "6px",
          }}>
            <div className="status-dot connected" />
            <span style={{ fontSize: "10.5px", color: "#6EE7B7", fontWeight: 600 }}>Connected</span>
            <div style={{ marginLeft: "auto", fontSize: "9.5px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>MCP v1</div>
          </div>

          {/* AI indicator pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 8px",
            background: "linear-gradient(135deg, rgba(79,106,245,0.12), rgba(124,58,237,0.08))",
            border: "1px solid var(--border-accent)",
            borderRadius: "6px",
          }}>
            <Cpu size={11} style={{ color: "var(--accent-light)" }} />
            <span style={{ fontSize: "10px", color: "var(--accent-light)", fontWeight: 600, letterSpacing: "0.02em" }}>AI</span>
          </div>
        </div>
      </div>

      {/* Live clock strip */}
      <SidebarClock />

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link${active ? " active" : ""}`}
                >
                  <Icon className="sidebar-link-icon" size={16} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "1px 5px",
                      background: "var(--accent-dim)",
                      color: "var(--accent-light)",
                      border: "1px solid var(--border-accent)",
                      borderRadius: "4px",
                      letterSpacing: "0.04em",
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <ChevronRight size={12} style={{ color: "var(--accent)", opacity: 0.7, flexShrink: 0 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        {/* MCP tools count */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 10px", marginBottom: "8px",
          background: "var(--bg-glass)", border: "1px solid var(--border)",
          borderRadius: "6px",
        }}>
          <span style={{ fontSize: "10.5px", color: "var(--text-4)", fontWeight: 500 }}>MCP Tools</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
            color: "var(--accent-light)",
          }}>16 active</span>
        </div>

        <div style={{
          padding: "9px 11px",
          background: "var(--bg-glass)",
          border: "1px solid var(--border-accent)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4F6AF5, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 700,
            color: "white",
            boxShadow: "0 0 12px rgba(79,106,245,0.3)",
          }}>
            A
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>Attorney Demo</div>
            <div style={{ fontSize: "10px", color: "var(--text-3)" }}>v1.0.0 · MIT License</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
