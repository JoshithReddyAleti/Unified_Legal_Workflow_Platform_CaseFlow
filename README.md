<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                  ║
║    ██████╗ █████╗ ███████╗███████╗███████╗██╗      ██████╗ ██╗    ██╗           ║
║   ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██║     ██╔═══██╗██║    ██║           ║
║   ██║     ███████║███████╗█████╗  █████╗  ██║     ██║   ██║██║ █╗ ██║           ║
║   ██║     ██╔══██║╚════██║██╔══╝  ██╔══╝  ██║     ██║   ██║██║███╗██║           ║
║   ╚██████╗██║  ██║███████║███████╗██║     ███████╗╚██████╔╝╚███╔███╔╝           ║
║    ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝           ║
║                                                                                  ║
║                ◈  M C P  E D I T I O N  ·  v 1 . 0  ◈                           ║
║          ─────────────────────────────────────────────────                       ║
║           A I - N A T I V E   L E G A L   O P E R A T I O N S                   ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

<br/>

### **Turn fragmented legal communications into structured, trackable, AI-powered work**
#### *The platform law firms reach for when a missed deadline is not an option.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4.6-CC785C?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com)
[![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-7C3AED?style=for-the-badge)](https://modelcontextprotocol.io)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=python&logoColor=white)](https://sqlalchemy.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<br/>

<table>
<tr>
<td align="center"><b>⚡ 5-Stage AI Pipeline</b><br/><sub>Classify → Link → Summarize → Extract → Timeline</sub></td>
<td align="center"><b>🤖 16 MCP Tools</b><br/><sub>Native Claude Desktop Integration</sub></td>
<td align="center"><b>🔒 Approval-First</b><br/><sub>AI proposes. Attorneys decide.</sub></td>
<td align="center"><b>🚀 Zero-Config Demo</b><br/><sub>Works without an API key</sub></td>
</tr>
</table>

<br/>

> ***"Instead of helping lawyers reply faster, we help them never lose track of what actually needs to be done."***

<br/>

[**⚡ Quick Start**](#-quick-start) · [**🤖 MCP Server**](#-mcp-server--claude-desktop-integration) · [**🏗️ Architecture**](#%EF%B8%8F-architecture) · [**✨ Features**](#-feature-modules) · [**🛣️ Roadmap**](#%EF%B8%8F-roadmap)

</div>

<br/>

---

<br/>

## ⚖️ The Problem Every Law Firm Has

<br/>

<table>
<tr>
<th align="center" width="50%">❌ &nbsp; Before CaseFlow</th>
<th align="center" width="50%">✅ &nbsp; After CaseFlow</th>
</tr>
<tr>
<td>

```
📧 Email arrives from opposing counsel
        ↓
Attorney reads it manually
        ↓
Copies deadline to a sticky note
        ↓
Adds "respond" task to personal to-do list
        ↓
Cc's paralegal who starts a separate thread
        ↓
Deadline buried in inbox
        ↓
        ↓
        ↓
  ⚠️  Three weeks later...
  "What was that deadline again?"
```

</td>
<td>

```
📧 Email arrives from opposing counsel
        ↓
Paste into CaseFlow Intake (10 seconds)
        ↓
✦ Category: litigation_support (critical)
✦ Linked to: Meridian Tech matter
✦ Summary: 3 key facts extracted
✦ Deadline: July 4 — "respond within 10 days"
✦ Tasks: ["Preserve communications", "File response"]
✦ Parties: ["Meridian Tech", "CompetitorX"]
✦ Timeline: Event created automatically
✦ Audit: Logged with Claude model version
        ↓
  🟢  Nothing slips. Ever.
```

</td>
</tr>
</table>

<br/>

> [!IMPORTANT]
> **Every email in legal practice is a potential legal event.** CaseFlow treats it that way — extracting every deadline, party, task, and trigger automatically, linking it to the right matter, and creating a permanent source-linked record.

<br/>

---

<br/>

## 🧠 What Is CaseFlow MCP?

CaseFlow MCP is a **full-stack, AI-native legal operations platform** built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io). It transforms the chaos of inbound legal communications — emails, Slack threads, contract reviews, dispute notices — into a fully structured, searchable, and actionable legal workspace.

It does **two things simultaneously**:

<table>
<tr>
<td width="50%" valign="top">

### 🖥️ Web Application
A full enterprise legal workspace with dark-themed dashboard, matter management, intake queue, deadline tracking, task management, timeline visualization, legal knowledge Q&A, and audit logging.

</td>
<td width="50%" valign="top">

### 🤖 Claude Desktop Tools
A 16-tool MCP server that lets attorneys talk to their matter database in plain English via Claude Desktop — *"What are the deadlines on Meridian?"* → live answer from the database.

</td>
</tr>
</table>

Both interfaces run against the **same database**, in real-time.

<br/>

---

<br/>

## 🏗️ Architecture

```mermaid
graph TB
    subgraph FE ["🖥️  FRONTEND  ·  Next.js 14 + TypeScript"]
        direction LR
        D[Dashboard]
        M[Matters]
        IQ[Intake Queue]
        T[Tasks & Deadlines]
        TL[Timeline]
        KB[Knowledge Q&A]
        AU[Audit Log]
        DR[Draft Generator]
        CN[Connector Hub]
    end

    subgraph BE ["⚙️  BACKEND  ·  FastAPI + Python 3.11"]
        direction TB
        API["REST API  /api/matters · /api/intake · /api/tasks\n/api/timelines · /api/knowledge · /api/audit\n/api/notes · /api/drafts · /api/connectors"]

        subgraph AI ["🧠  Intelligence Layer  ·  claude-sonnet-4-6"]
            direction LR
            IC["⚡ Intake\nClassifier"]
            CS["📝 Comm\nSummarizer"]
            EE["⛏️ Entity\nExtractor"]
            ML["🔗 Matter\nLinker"]
            TB2["📅 Timeline\nBuilder"]
            QA["🔍 Legal\nQ&A RAG"]
            DG["✍️ Draft\nGenerator"]
        end

        SVC["Services Layer\nIngestionService · AuditService · MockDataService"]
        ORM["SQLAlchemy ORM\nMatter · Communication · Task · Deadline\nTimelineEvent · KnowledgeItem · AuditLog · MatterNote"]
    end

    subgraph DATA ["💾  DATA LAYER"]
        DB[("SQLite  dev\nPostgreSQL  prod")]
    end

    subgraph MCPS ["🤖  MCP SERVER  ·  stdio transport"]
        T16["16 AI Tools\nlist_matters · get_matter · create_matter\nprocess_intake · classify · summarize · extract\nget_timeline · add_event · list_tasks · create_task\nlist_deadlines · confirm_deadline\nquery_knowledge · list_sources · get_audit_trail"]
    end

    CLAUDE["☁️  Anthropic API\nclaude-sonnet-4-6"]

    FE -->|"REST / JSON\nAxios"| BE
    API --> AI
    API --> SVC
    SVC --> ORM
    ORM --> DB
    AI -->|"API calls"| CLAUDE
    MCPS --> ORM
    MCPS -->|"API calls"| CLAUDE
```

<br/>

### 🔄 The Intake Pipeline — Step by Step

```mermaid
flowchart LR
    A["📧 Raw\nCommunication"] --> B

    subgraph PIPE ["  ⚡  5-Stage AI Intelligence Pipeline  "]
        direction LR
        B["1️⃣ CLASSIFY\nCategory · Urgency\nOwner · Next Action"] --> C
        C["2️⃣ LINK\nSearch Matters\nby name/subject/\nparties"] --> D
        D["3️⃣ SUMMARIZE\nKey Facts\nLegal Issues\nAction Items"] --> E
        E["4️⃣ EXTRACT\nDates · Deadlines\nTasks · Parties\nDocuments"] --> F
        F["5️⃣ TIMELINE\nCreate Events\nLink to Source\nBuild Chronology"]
    end

    F --> G["✅ Structured\nLegal Record"]

    A:::input
    G:::output
```

<br/>

> [!NOTE]
> **Fallback mode:** When no `ANTHROPIC_API_KEY` is set, every stage falls back to a rule-based demo response. The platform is fully explorable without any API key.

<br/>

---

<br/>

## ✨ Feature Modules

<br/>

<details open>
<summary>
<h3>⚡ &nbsp;1. &nbsp;AI Intake &amp; Triage Engine</h3>
</summary>

<br/>

The beating heart of CaseFlow. Every inbound communication runs through a 5-stage AI pipeline powered by `claude-sonnet-4-6`.

**Classification categories:**

<table>
<tr>
<td>📜 Contract Review</td>
<td>⚖️ Litigation Support</td>
<td>🔒 Privacy / Data</td>
<td>👥 Employment</td>
</tr>
<tr>
<td>💰 Commercial Dispute</td>
<td>📋 Compliance</td>
<td>❓ Policy Question</td>
<td>📬 General Inquiry</td>
</tr>
</table>

**Urgency levels and their SLA expectations:**

| Level | Indicator | Meaning | Typical SLA |
|-------|-----------|---------|-------------|
| 🔴 **Critical** | Pulsing red glow | Filed deadline / same-day legal trigger | < 4 hours |
| 🟠 **High** | Amber badge | Time-sensitive legal event | < 24 hours |
| 🟡 **Medium** | Yellow badge | Action required, not immediate | < 72 hours |
| 🟢 **Low** | Green badge | Informational / advisory | < 1 week |

> [!WARNING]
> **Critical urgency items trigger an alert banner** across the dashboard. They are never silently queued — they surface immediately in the intake queue with a pulsing indicator.

<br/>
</details>

---

<details>
<summary>
<h3>📂 &nbsp;2. &nbsp;Matter Management &amp; Legal Memory</h3>
</summary>

<br/>

A **Matter** is the central organizing unit in CaseFlow. Every object in the system anchors to a matter.

```
MATTER  ──────────────────────────────────────────────────────────────────────
│
├── 📋  Metadata          matter_number · type · status · client · attorney
│
├── 📧  Communications    every linked inbound message + AI analysis
│
├── ⏰  Deadlines         suggested (AI) → confirmed (attorney) → completed
│
├── ✅  Tasks             priority · assignee · due date · source snippet
│
├── 📅  Timeline          auto-built chronological event graph
│
└── 📝  Notes             general · strategy · observation · risk
```

**Matter types:** Litigation · Corporate · Employment · IP · Real Estate · Regulatory · General

**Matter lifecycle:**

```
  OPEN  ──────►  ACTIVE  ──────►  ON HOLD  ──────►  CLOSED
```

<br/>
</details>

---

<details>
<summary>
<h3>⏰ &nbsp;3. &nbsp;Deadline Tracking — Approval-First</h3>
</summary>

<br/>

> [!CAUTION]
> **All AI-extracted deadlines start as `suggested` and require explicit attorney confirmation before they appear in active deadline views.** This is non-negotiable — AI assists, attorneys decide.

```mermaid
flowchart LR
    A["🤖 AI extracts deadline\nfrom communication"] --> B

    B{"Status:\nSUGGESTED\n⚠️ flagged in UI"}

    B --> C["Attorney reviews\nsource snippet"]
    C --> D{Decision}

    D -->|"✅ Confirm"| E["Status: CONFIRMED\nAppears in active\ndeadline views\nAudit logged"]
    D -->|"❌ Dismiss"| F["Status: DISMISSED\nArchived with reason\nAudit logged"]
```

**Every AI-extracted deadline shows its source quote** — the exact sentence from the communication that triggered it. Attorneys verify the AI's reasoning before confirming.

**Countdown badge colors:**

| Days Remaining | Visual |
|----------------|--------|
| 14+ days | Neutral grey badge |
| 7 days | 🟡 Amber warning badge |
| 3 days | 🔴 Red alert badge |
| Overdue | 💀 Pulsing red glow — `OVERDUE` |

<br/>
</details>

---

<details>
<summary>
<h3>📋 &nbsp;4. &nbsp;Task Management</h3>
</summary>

<br/>

Tasks are created in three ways:

<table>
<tr>
<th>Source</th>
<th>How</th>
<th>Example</th>
</tr>
<tr>
<td>🤖 <b>AI Extraction</b></td>
<td>Pulled from communication text automatically</td>
<td><em>"please review and respond by Friday"</em> → task created</td>
</tr>
<tr>
<td>🖱️ <b>Manual Creation</b></td>
<td>Via Tasks page or Matter detail tab</td>
<td>Attorney adds a research task</td>
</tr>
<tr>
<td>💬 <b>MCP Tool</b></td>
<td><code>create_task</code> from Claude Desktop</td>
<td><em>"Claude, add a task to draft a response on Meridian"</em></td>
</tr>
</table>

**Task lifecycle:**
```
  PENDING  ──►  IN_PROGRESS  ──►  COMPLETED
                             ──►  CANCELLED
```

**Priority visual system — the priority bar:**

| Priority | Color | Meaning |
|----------|-------|---------|
| 🔴 **Critical** | Glowing red | Drop everything |
| 🟠 **High** | Amber | Address today |
| 🟡 **Medium** | Yellow | This week |
| 🟢 **Low** | Green | When available |

<br/>
</details>

---

<details>
<summary>
<h3>📅 &nbsp;5. &nbsp;Timeline Builder</h3>
</summary>

<br/>

The timeline is a **source-linked chronological graph** of everything that happened in a matter. It assembles itself automatically as communications are processed.

**Event types and their triggers:**

| Event | Icon | Created Automatically When |
|-------|------|---------------------------|
| `communication` | 💬 | Any message is processed |
| `deadline` | ⏰ | AI extracts a deadline date |
| `filing` | 📄 | Filing date detected in text |
| `hearing` | ⚖️ | Court date extracted |
| `contract_signed` | ✍️ | Signature date mentioned |
| `breach_notice` | 🚨 | Notice of breach detected |
| `client_contact` | 👤 | Client communication processed |
| `document_received` | 📁 | Document receipt mentioned |
| `trigger_event` | 🔔 | Legal trigger detected |
| `other` | ● | Manual / uncategorized |

> [!TIP]
> Every timeline event links back to its source communication. You can always answer *"Why is this event on the timeline?"* by clicking through to the original message.

<br/>
</details>

---

<details>
<summary>
<h3>🔍 &nbsp;6. &nbsp;Legal Knowledge Q&amp;A — Grounded RAG</h3>
</summary>

<br/>

Ask natural-language legal questions against your **approved internal knowledge base**.

```mermaid
sequenceDiagram
    participant A as 👨‍💼 Attorney
    participant CF as ⚙️ CaseFlow
    participant KB as 📚 Knowledge Base
    participant CL as 🤖 Claude API

    A->>CF: "What's our NDA breach response procedure?"
    CF->>KB: Search approved sources (playbooks, policies, templates)
    KB-->>CF: 3 relevant source excerpts found
    CF->>CL: Answer question using ONLY these excerpts
    CL-->>CF: Answer with [1][2][3] citations
    CF-->>A: Answer + exact paragraph citations + source names
```

> [!CAUTION]
> **Zero hallucination by design.** The Q&A engine is instructed to: cite every claim with numbered references, flag when sources are insufficient, and **never fabricate legal guidance**. If the knowledge base doesn't have the answer, it says so explicitly.

**Knowledge source types supported:**

`playbook` · `policy` · `template` · `prior_matter` · `sharepoint` · `google_drive` · `manual_upload`

**Included in demo knowledge base:**
- 📖 NDA Breach Response Playbook v2.1
- 📖 EEOC Response Framework 2024
- 📖 Force Majeure Analysis Template

<br/>
</details>

---

<details>
<summary>
<h3>✍️ &nbsp;7. &nbsp;Draft Reply Generator — Approval-First</h3>
</summary>

<br/>

> [!WARNING]
> **Every draft carries `requires_review: true` permanently.** The platform never sends anything. CaseFlow generates; attorneys review, edit, and send.

```
Select communication  →  Choose tone  →  Generate  →  Review  →  Copy & Send

Tone options:
  ◆ Professional   ◆ Formal   ◆ Concise   ◆ Empathetic
```

**Each generated draft returns:**

| Field | Content |
|-------|---------|
| `subject` | Professionally rewritten subject line |
| `body` | Complete reply in chosen tone |
| `tone` | Confirmed tone applied |
| `warnings[]` | Attorney review checklist — flags to verify before sending |
| `suggested_actions[]` | Follow-up tasks recommended after sending |
| `requires_review` | Always `true` — hardcoded |

<br/>
</details>

---

<details>
<summary>
<h3>🔌 &nbsp;8. &nbsp;Connector Hub</h3>
</summary>

<br/>

The connector hub defines the v2 integration surface. **Manual intake is fully functional in v1.**

<table>
<tr>
<th>Connector</th>
<th>Type</th>
<th>Auth</th>
<th>Status</th>
</tr>
<tr>
<td>📧 Microsoft Outlook</td>
<td>Email</td>
<td>OAuth2 / Graph API</td>
<td><code>v2</code></td>
</tr>
<tr>
<td>📬 Gmail</td>
<td>Email</td>
<td>Google OAuth2</td>
<td><code>v2</code></td>
</tr>
<tr>
<td>💬 Microsoft Teams</td>
<td>Chat + Channels</td>
<td>OAuth2 / Graph API</td>
<td><code>v2</code></td>
</tr>
<tr>
<td>🟣 Slack</td>
<td>Channels + DMs</td>
<td>Slack OAuth2</td>
<td><code>v2</code></td>
</tr>
<tr>
<td>📂 Google Drive</td>
<td>Document sync</td>
<td>Google OAuth2</td>
<td><code>v2</code></td>
</tr>
<tr>
<td>🗂️ SharePoint</td>
<td>Document library</td>
<td>Microsoft Graph</td>
<td><code>v2</code></td>
</tr>
</table>

> [!NOTE]
> Connectors only change *how* messages arrive — the AI pipeline is identical regardless of source. Manual intake already runs the full 5-stage intelligence pipeline.

<br/>
</details>

---

<details>
<summary>
<h3>🛡️ &nbsp;9. &nbsp;Audit Log &amp; Governance</h3>
</summary>

<br/>

Every action in CaseFlow writes to an **immutable audit trail**.

```
AuditLog
  ├── event_type       intake_submitted · matter_created · deadline_confirmed
  │                   task_created · communication_triaged · knowledge_query
  ├── entity_type      communication · matter · task · deadline · knowledge
  ├── entity_id        UUID of the affected record
  ├── matter_id        matter context (for cross-filtering)
  ├── action           create · update · confirm · query · triage
  ├── ai_model_used    "claude-sonnet-4-6"  ← tagged on every AI call
  ├── details          JSON: source, confirmed_by, query text, etc.
  └── created_at       UTC timestamp — immutable
```

> [!IMPORTANT]
> **Every AI model call is tagged with the model version.** If AI behavior changes between `claude-sonnet-4-6` versions, you can audit exactly which model made which decision on which date.

<br/>
</details>

<br/>

---

<br/>

## 🤖 MCP Server & Claude Desktop Integration

```
╔════════════════════════════════════════════════════════════════════════════╗
║  Ask Claude:  "What are the upcoming deadlines on Meridian litigation?"    ║
║                                    ↓                                       ║
║  Claude calls:  list_deadlines(matter_id="...", upcoming_days=30)          ║
║                                    ↓                                       ║
║  CaseFlow queries your live SQLite database                                ║
║                                    ↓                                       ║
║  Claude responds:  "You have 3 upcoming deadlines: ..."                   ║
╚════════════════════════════════════════════════════════════════════════════╝
```

The MCP server runs as a **stdio process** — Claude Desktop spawns it and communicates over stdin/stdout. It reads from the same database as the web app, in real time.

<br/>

### Setup in 3 Steps

**Step 1** — Install the MCP package

```bash
pip install mcp
```

**Step 2** — Add CaseFlow to your Claude Desktop config

```jsonc
// Windows:  %APPDATA%/Claude/claude_desktop_config.json
// Mac:       ~/Library/Application Support/Claude/claude_desktop_config.json

{
  "mcpServers": {
    "caseflow": {
      "command": "python",
      "args": ["C:/path/to/unified_legal_workflow_platform/mcp-server/server.py"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-your-key-here"
      }
    }
  }
}
```

**Step 3** — Restart Claude Desktop

> ✅ CaseFlow tools appear in Claude's tool panel. You're live.

<br/>

### 🛠️ All 16 MCP Tools

<br/>

<details open>
<summary><strong>⚖️ Matter Management — 3 tools</strong></summary>

<br/>

| Tool | Required Input | Returns |
|------|---------------|---------|
| `list_matters` | `status?` `matter_type?` `search?` `limit?` | Matters with open task + deadline counts |
| `get_matter` | `matter_id` | Full detail + stats + 5 recent communications |
| `create_matter` | `title` + optional fields | Created matter ID and number |

**Example:**
> *"Show me all active litigation matters assigned to Sarah."*
```
→ Claude calls: list_matters(status="active", matter_type="litigation")
→ Filters results by assigned_to
→ Returns formatted list with open tasks and deadlines per matter
```

<br/>
</details>

<details>
<summary><strong>🧠 AI Intelligence Pipeline — 4 tools</strong></summary>

<br/>

| Tool | What It Does | Stores Data? |
|------|-------------|:------------:|
| `process_intake` | **Full 5-stage pipeline** — classify + link + summarize + extract + timeline | ✅ Yes |
| `classify_communication` | Category + urgency + owner + next action only | ❌ No |
| `summarize_communication` | Key facts + action items + legal issues | ❌ No |
| `extract_entities` | Deadlines + tasks + parties + documents + hearings | ❌ No |

**The workhorse call:**
```json
process_intake({
  "subject": "RE: Breach of NDA Agreement — Meridian Tech",
  "body": "Dear Counsel, We write to inform you...",
  "sender": "opposing.counsel@lawfirm.com"
})

// Returns:
{
  "communication_id": "uuid",
  "matter_id": "auto-linked",
  "category": "litigation_support",
  "urgency": "critical",
  "summary": "Opposing counsel alleges breach of 2023 NDA...",
  "key_facts": ["NDA signed March 2023", "Alleged disclosure to CompetitorX"],
  "action_items": ["Respond within 10 days", "Preserve all communications"],
  "legal_issues": ["Potential damages claim under §12(b)"],
  "extracted_entities": {
    "deadlines": [{ "title": "Response deadline", "date": "2026-07-04",
                    "source_snippet": "...respond within ten (10) days..." }],
    "parties": ["Meridian Tech", "CompetitorX"]
  }
}
```

<br/>
</details>

<details>
<summary><strong>📅 Timeline — 2 tools</strong></summary>

<br/>

| Tool | Input | Output |
|------|-------|--------|
| `get_matter_timeline` | `matter_id` `event_type?` | Chronological events with source references |
| `add_timeline_event` | `matter_id` `event_date` `event_type` `title` `summary?` | Created event ID |

<br/>
</details>

<details>
<summary><strong>✅ Tasks &amp; Deadlines — 4 tools</strong></summary>

<br/>

| Tool | Key Behavior |
|------|-------------|
| `list_tasks` | Filter by matter, status, assignee, priority |
| `create_task` | Creates with title, description, assignee, priority, due date |
| `list_deadlines` | Use `status="suggested"` to see all unconfirmed AI-extracted deadlines |
| `confirm_deadline` | Moves `suggested → confirmed`. Immutable audit entry created. |

**Deadline confirmation workflow:**
```
User:   "What deadlines need my review?"
Claude: calls list_deadlines(status="suggested")
        → Returns 3 AI-extracted deadlines awaiting confirmation

User:   "Confirm the July 4th response deadline."
Claude: calls confirm_deadline(deadline_id="...", confirmed_by="Sarah Chen")
        → Status: CONFIRMED · Audit logged
```

<br/>
</details>

<details>
<summary><strong>🔍 Knowledge Q&amp;A — 2 tools</strong></summary>

<br/>

| Tool | Description |
|------|-------------|
| `query_legal_knowledge` | Grounded Q&A with numbered citations against approved knowledge base |
| `list_knowledge_sources` | Browse approved playbooks, policies, templates |

```json
query_legal_knowledge({
  "query": "standard procedure when we receive a breach notice",
  "practice_area": "litigation"
})

// Returns:
{
  "answer": "Per the Breach Response Playbook [1], upon receipt of any breach notice...",
  "citations": [{
    "source": "NDA Breach Response Playbook v2.1",
    "excerpt": "Upon receipt of any breach notice, counsel shall..."
  }],
  "is_complete": true,
  "sources_searched": 12,
  "sources_used": 2
}
```

<br/>
</details>

<details>
<summary><strong>🛡️ Audit Trail — 1 tool</strong></summary>

<br/>

| Tool | Description |
|------|-------------|
| `get_audit_trail` | Full event log filtered by matter, event type — AI model attributed per entry |

<br/>
</details>

<br/>

---

<br/>

## 🚀 Quick Start

<br/>

### Prerequisites

<table>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/npm-9+-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm"/>
</td>
</tr>
</table>

<br/>

### ⚡ One-Command Launch (Windows PowerShell)

```powershell
# Terminal 1 — Backend API
.\scripts\start_backend.ps1

# Terminal 2 — Frontend
.\scripts\start_frontend.ps1
```

<br/>

### 🔧 Manual Setup

<details>
<summary><strong>Backend (FastAPI)</strong></summary>

<br/>

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate           # Windows
# source venv/bin/activate      # Mac / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY (optional — platform works without it)

# 4. Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Endpoint | URL |
|----------|-----|
| 🌐 API | `http://localhost:8000` |
| 📚 Swagger UI | `http://localhost:8000/docs` |
| 📖 ReDoc | `http://localhost:8000/redoc` |

</details>

<details>
<summary><strong>Frontend (Next.js)</strong></summary>

<br/>

```bash
cd frontend

npm install
npm run dev
```

**Frontend:** `http://localhost:3000`

</details>

<details>
<summary><strong>MCP Server (Claude Desktop)</strong></summary>

<br/>

```bash
pip install mcp

cd mcp-server
python server.py
# Starts silently — waits for stdio from Claude Desktop
```

Then configure Claude Desktop per the [setup guide above](#-mcp-server--claude-desktop-integration).

</details>

<br/>

### Environment Configuration

```bash
# backend/.env

# ─── AI Intelligence (optional — platform works without this) ────────────────
ANTHROPIC_API_KEY=sk-ant-your-key-here

# ─── Database ────────────────────────────────────────────────────────────────
DATABASE_URL=sqlite:///./caseflow.db      # dev default
# DATABASE_URL=postgresql://user:pass@host/db   # production

# ─── App Settings ────────────────────────────────────────────────────────────
SECRET_KEY=change-me-in-production
ENVIRONMENT=development
SEED_DEMO_DATA=true                        # seeds realistic data on first launch
```

> [!TIP]
> **Demo Mode works out of the box.** Without `ANTHROPIC_API_KEY`, every AI feature returns realistic demo responses and the database is pre-seeded with complete test data. You can fully evaluate every feature in under 2 minutes.

<br/>

---

<br/>

## 🗃️ Demo Data

On first launch, CaseFlow automatically seeds a complete realistic legal workspace:

<br/>

**Three Active Matters**

| # | Matter | Type | Status |
|---|--------|------|--------|
| M-2024-0001 | ⚖️ Meridian Tech v. NovaStar Industries | Litigation | 🟢 Active |
| M-2024-0002 | 👥 Employee Termination — Richardson | Employment | 🟢 Active |
| M-2024-0003 | 💡 SynthCore AI Patent Portfolio Review | IP | 🟢 Active |

<br/>

**Four Pre-Processed Communications** *(with full AI analysis)*

| Communication | Matter | Urgency |
|---------------|--------|---------|
| NDA Breach Notice — opposing counsel alleges confidentiality violation | Meridian Tech | 🔴 Critical |
| Harassment Settlement Demand — $450K demanded | Richardson | 🟠 High |
| Patent Infringement Warning — 3 ML patents allegedly infringed | SynthCore | 🔴 Critical |
| Termination Documentation Request — Senior VP | Richardson | 🟡 Medium |

<br/>

**Knowledge Base** *(3 approved sources)*

- 📖 NDA Breach Response Playbook v2.1
- 📖 EEOC Response Framework 2024
- 📖 Force Majeure Analysis Template

Each communication includes pre-generated summaries, extracted deadlines, tasks, parties, timeline events, and audit entries — no API calls needed.

<br/>

---

<br/>

## 📁 Project Structure

```
unified_legal_workflow_platform/
│
├── 📂 backend/
│   └── app/
│       ├── main.py                     ← App entrypoint, router registration
│       ├── config.py                   ← Settings via Pydantic BaseSettings
│       ├── database.py                 ← SQLAlchemy engine + session factory
│       │
│       ├── 📂 models/                  ← SQLAlchemy ORM models
│       │   ├── matter.py               ← Matter, Client (+ enums)
│       │   ├── communication.py        ← Communication, SourceType, LegalCategory, UrgencyLevel
│       │   ├── task.py                 ← Task, Deadline, TaskStatus, TaskPriority, DeadlineStatus
│       │   ├── timeline.py             ← TimelineEvent, EventType
│       │   ├── knowledge.py            ← KnowledgeItem
│       │   ├── audit.py                ← AuditLog
│       │   ├── note.py                 ← MatterNote, NoteType
│       │   └── user.py                 ← User (RBAC — v1.5)
│       │
│       ├── 📂 schemas/                 ← Pydantic v2 request/response schemas
│       │
│       ├── 📂 api/                     ← FastAPI routers (one file per domain)
│       │   ├── matters.py              ← GET/POST/PUT /matters
│       │   ├── intake.py               ← POST /intake/submit  GET /intake/queue
│       │   ├── tasks.py                ← Tasks + Deadlines CRUD
│       │   ├── timelines.py            ← Timeline per matter
│       │   ├── knowledge.py            ← Knowledge base + Q&A
│       │   ├── audit.py                ← Audit log
│       │   ├── notes.py                ← Matter notes
│       │   ├── drafts.py               ← AI draft generation
│       │   └── connectors.py           ← Connector hub metadata
│       │
│       ├── 📂 intelligence/            ← Claude-powered AI modules
│       │   ├── intake_classifier.py    ← Category + urgency classification
│       │   ├── summarizer.py           ← Key facts + issues extraction
│       │   ├── extractor.py            ← Dates + tasks + parties extraction
│       │   ├── matter_linker.py        ← Auto-link communications to matters
│       │   ├── timeline_builder.py     ← Build timeline events from comms
│       │   ├── legal_qa.py             ← Grounded RAG Q&A with citations
│       │   └── draft_generator.py      ← AI reply draft generation
│       │
│       └── 📂 services/
│           ├── ingestion.py            ← Orchestrates the full intake pipeline
│           ├── audit.py                ← AuditService helper
│           └── mock_data.py            ← Demo data seeder
│
├── 📂 frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                ← Dashboard
│       │   ├── layout.tsx              ← Root layout + sidebar
│       │   ├── globals.css             ← Enterprise dark theme design system
│       │   ├── matters/                ← Matter list + detail pages
│       │   ├── intake/                 ← Intake queue + communication detail
│       │   ├── tasks/                  ← Tasks + Deadlines
│       │   ├── timeline/               ← Global timeline view
│       │   ├── knowledge/              ← Knowledge Q&A
│       │   ├── audit/                  ← Audit log
│       │   ├── drafts/                 ← AI draft generator
│       │   └── connectors/             ← Connector hub
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   └── ui/Badge.tsx
│       ├── lib/api.ts                  ← All API calls via Axios
│       └── types/index.ts              ← TypeScript interfaces
│
├── 📂 mcp-server/
│   ├── server.py                       ← Full MCP server — 16 tools over stdio
│   ├── claude_desktop_config.json      ← Ready-to-paste Claude Desktop config
│   └── start_mcp_server.ps1
│
├── 📂 scripts/
│   ├── setup.ps1                       ← Full first-time setup
│   ├── start_backend.ps1
│   └── start_frontend.ps1
│
└── README.md
```

<br/>

---

<br/>

## 🔌 API Reference

<details>
<summary><strong>⚖️ Matters API</strong></summary>

```
GET    /api/matters                     List all matters (filter: status, type, search)
POST   /api/matters                     Create matter
GET    /api/matters/{id}                Get matter detail
PUT    /api/matters/{id}                Update matter
GET    /api/matters/{id}/stats          Open tasks · upcoming deadlines · total comms
GET    /api/matters/{id}/timeline       Get matter timeline events
```

</details>

<details>
<summary><strong>⚡ Intake API</strong></summary>

```
POST   /api/intake/submit               Submit + process communication (full AI pipeline)
GET    /api/intake/queue                Get intake queue (unprocessed communications)
GET    /api/communications              List all communications
GET    /api/communications/{id}         Get communication + full AI analysis
```

</details>

<details>
<summary><strong>✅ Tasks &amp; Deadlines API</strong></summary>

```
GET    /api/tasks                       List tasks (filter: matter_id, status, priority)
POST   /api/tasks                       Create task
GET    /api/deadlines                   List deadlines (filter: matter_id, status)
POST   /api/deadlines/{id}/confirm      Confirm a suggested deadline (approval-first)
```

</details>

<details>
<summary><strong>🔍 Knowledge API</strong></summary>

```
GET    /api/knowledge                   List knowledge sources
POST   /api/knowledge                   Add knowledge source
POST   /api/knowledge/query             Run grounded Q&A with citations
```

</details>

<details>
<summary><strong>🛡️ Supporting APIs</strong></summary>

```
GET    /api/audit                       Audit log (filter: event_type, matter_id)
GET    /api/notes/matters/{id}          Get matter notes
POST   /api/notes/matters/{id}          Create matter note
DELETE /api/notes/{id}                  Delete note
POST   /api/drafts/generate             Generate AI draft reply
GET    /api/connectors/                 List connectors and their status
```

</details>

<br/>

---

<br/>

## 🛣️ Roadmap

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v 1 . 0   —   C U R R E N T   R E L E A S E
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- ✅ Manual intake + full AI pipeline (classify / summarize / extract / link)
- ✅ Matter management (create / list / detail / notes)
- ✅ Deadline tracking — approval-first confirmation lifecycle
- ✅ Task management — priority / status / assignee / due date
- ✅ Source-linked timeline builder (10 event types)
- ✅ Grounded legal Q&A with numbered citations
- ✅ AI draft reply generator (approval-first)
- ✅ Connector Hub UI (v2 connectors scoped)
- ✅ Full immutable audit log with AI model attribution
- ✅ 16-tool MCP server — Claude Desktop integration
- ✅ Enterprise dark UI (glassmorphism + 3D cards + animations)
- ✅ Full demo mode — zero config required

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v 1 . 5   —   N E X T
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- 🔲 Microsoft Outlook connector (Graph API + OAuth2)
- 🔲 Gmail connector (Google OAuth2)
- 🔲 Teams / Slack webhook receivers
- 🔲 Vector embeddings for semantic knowledge search (pgvector)
- 🔲 Batch intake — drag-drop `.eml` / `.msg` files
- 🔲 Role-based access control — attorney / paralegal / admin
- 🔲 Email notifications for critical urgency items

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v 2 . 0   —   F U T U R E
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- 🔲 Google Drive / SharePoint document sync
- 🔲 Multi-workspace / multi-firm support
- 🔲 PDF contract analysis — deadline + obligation extraction
- 🔲 Federal docket integration (PACER)
- 🔲 Matter-to-matter conflict detection
- 🔲 Billing code suggestion
- 🔲 Client portal — read-only matter status
- 🔲 SOC 2 compliance hardening

<br/>

---

<br/>

## ⚙️ Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| 🤖 **AI Engine** | Anthropic Claude `sonnet-4-6` | Best legal reasoning, structured output, minimal hallucination |
| 🔗 **Protocol** | Model Context Protocol (MCP) | Native Claude Desktop tool integration over stdio |
| ⚙️ **Backend** | FastAPI + Python 3.11 | Async, fast, auto-OpenAPI, type-safe |
| 🗄️ **ORM** | SQLAlchemy 2.0 | Type-safe, SQLite → PostgreSQL with zero code changes |
| ✅ **Validation** | Pydantic v2 | Ultra-fast schema validation, `from_attributes` ORM mode |
| 💾 **Database** | SQLite (dev) → PostgreSQL (prod) | Zero-config dev, enterprise-ready prod |
| 🖥️ **Frontend** | Next.js 14 (App Router) | Server components, file-based routing, TypeScript native |
| 📡 **HTTP Client** | Axios + TypeScript interfaces | Type-safe API calls, interceptors for auth |
| 🎨 **Styling** | CSS custom properties + glassmorphism | Enterprise dark theme, 3D effects — no Tailwind lock-in |
| 🔤 **Fonts** | Inter + JetBrains Mono | Premium readability for dense legal data |

<br/>

---

<br/>

## 🧩 Design Principles

<br/>

<table>
<tr>
<td width="50%" valign="top">

### ⚖️ Approval-First
AI extracts and suggests. Attorneys confirm. Deadlines start as `suggested`. Drafts are never sent automatically. Every AI output is a proposal — not a decision.

### 🔗 Source-Linked Everything
Every deadline, task, and timeline event carries the exact text snippet from the communication that generated it. AI reasoning is always traceable to its source.

### 🚀 Demo-Mode First
Fully demonstrable without an API key. Realistic seeded data + fallback responses mean anyone can evaluate the platform in under 2 minutes.

</td>
<td width="50%" valign="top">

### 🔄 Dual-Interface
The same data layer powers both the web app and Claude Desktop integration. Attorneys choose their workflow: structured UI or natural-language conversation.

### 🛡️ Immutable Audit
Nothing is deleted from the audit log. Every AI model call, confirmation, and action is permanently attributed to a model version and a user.

### 🎯 Legal-Domain First
Every design decision — urgency levels, deadline lifecycle, approval gates — is modeled on how legal teams actually work, not generic project management.

</td>
</tr>
</table>

<br/>

---

<br/>

## 🤝 Contributing

Contributions are welcome across all layers:

```
Areas open for contribution
│
├── 🔌  New connector adapters     Microsoft Graph · Gmail · Slack Events API
│
├── ⛏️  New entity extractors      PACER docket items · contract clauses · billing codes
│
├── ⚡  New workflow actions        Conflict detection · e-discovery · cost estimates
│
├── 🔍  RAG improvements           Vector embeddings · hybrid search · re-ranking
│
├── 🖥️  UI components              Calendar view · Kanban for tasks · matter graph viz
│
└── 🤖  New MCP tools              Any new backend capability exposed as a tool
```

```bash
# Fork · Clone · Branch
git checkout -b feature/outlook-connector

# Make your changes
# Ensure backend is importable
cd backend && python -c "from app.main import app; print('OK')"

# PR description should include:
# ◆ What feature / fix
# ◆ Which MCP tools are affected (if any)
# ◆ How to test it (demo steps or test data)
```

<br/>

---

<br/>

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE).

<br/>

---

<br/>

<div align="center">

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by MCP · Made for Legal Teams · Author : Joshith Reddy Aleti
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**CaseFlow MCP — because every deadline matters.**

<br/>

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Anthropic](https://img.shields.io/badge/Claude-CC785C?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![MCP](https://img.shields.io/badge/MCP-7C3AED?style=flat-square)](https://modelcontextprotocol.io)

</div>
