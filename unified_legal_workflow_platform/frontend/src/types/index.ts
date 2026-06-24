export type MatterStatus = "open" | "active" | "on_hold" | "closed";
export type MatterType = "litigation" | "corporate" | "employment" | "ip" | "real_estate" | "regulatory" | "general";
export type Urgency = "low" | "medium" | "high" | "critical";
export type LegalCategory =
  | "contract_review" | "litigation_support" | "privacy_data"
  | "employment" | "commercial_dispute" | "compliance"
  | "policy_question" | "general_inquiry" | "unclassified";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type DeadlineStatus = "suggested" | "confirmed" | "dismissed" | "completed" | "overdue";

export interface Matter {
  id: string;
  title: string;
  matter_number?: string;
  status: MatterStatus;
  matter_type: MatterType;
  description?: string;
  assigned_to?: string;
  client?: { id: string; name: string; organization?: string };
  tags: string[];
  open_tasks?: number;
  upcoming_deadlines?: number;
  last_activity?: string;
  client_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Communication {
  id: string;
  matter_id?: string;
  source_type: string;
  subject?: string;
  body?: string;
  sender?: string;
  recipients: string[];
  received_at?: string;
  category: LegalCategory;
  urgency: Urgency;
  summary?: string;
  key_facts: string[];
  open_questions: string[];
  legal_issues: string[];
  action_items: string[];
  extracted_entities?: Record<string, unknown>;
  owner_recommendation?: string;
  is_processed: boolean;
  is_triaged: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  matter_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  source_snippet?: string;
  tags: string[];
  communication_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  matter_id: string;
  title: string;
  description?: string;
  deadline_date: string;
  status: DeadlineStatus;
  deadline_type?: string;
  source_snippet?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  communication_id?: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  matter_id: string;
  event_date: string;
  event_type: string;
  title: string;
  summary?: string;
  source_references: Array<{ type: string; id: string; description?: string }>;
  linked_documents: string[];
  associated_contacts: string[];
  is_confirmed: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  source_type: string;
  source_url?: string;
  tags: string[];
  practice_area?: string;
  is_approved: string;
  content_summary?: string;
  created_at: string;
}

export type NoteType = "general" | "strategy" | "observation" | "risk";

export interface MatterNote {
  id: string;
  matter_id: string;
  content: string;
  note_type: NoteType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DraftReply {
  subject: string;
  body: string;
  tone: string;
  warnings: string[];
  suggested_actions: string[];
  requires_review: boolean;
}

export interface Connector {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  icon: string;
  auth_type: string;
  features: string[];
  last_sync: string | null;
  messages_synced: number;
}
