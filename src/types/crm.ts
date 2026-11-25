export type FieldType = 'text' | 'num' | 'date' | 'list' | 'bool' | 'ref';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  bold?: boolean;
  due?: boolean;
  hiddenInGrid?: boolean;
  filterable?: boolean;
  options?: string[];
  refTable?: 'apps';
}

export interface TableDef {
  id: TableId;
  name: string;
  group: 'subscriptions' | 'apps' | 'finance';
  description: string;
  fields: FieldDef[];
}

export type TableId =
  | 'telecom_lines'
  | 'domains'
  | 'wanted_domains'
  | 'providers'
  | 'api_keys'
  | 'sites'
  | 'payments'
  | 'apps'
  | 'deliverables'
  | 'team';

export interface DueRow {
  cat: string;
  item: string;
  amount: number | null;
  due_date: string;
  days_left: number;
}

export interface AppRecord {
  id: string;
  created_at?: string;
  name: string;
  description: string | null;
  platforms: string | null;
  start_date: string | null;
  launch_date: string | null;
  status: string | null;
}

export interface DeliverableRecord {
  id: string;
  created_at?: string;
  app_id: string;
  stage: string | null;
  item: string;
  owner: string | null;
  start_date: string | null;
  end_date: string | null;
  received_on: string | null;
  status: string | null;
  acceptance: string | null;
  notes: string | null;
}

export interface TeamRecord {
  id: string;
  created_at?: string;
  app_id: string;
  level: string | null;
  title: string;
  person: string | null;
  party: string | null;
  job_status: string | null;
  reports_to: string | null;
  contact: string | null;
  duties: string | null;
}

export type AnyRecord = Record<string, any> & { id: string; created_at?: string };

export type ViewId =
  | 'dash'
  | 'rack'
  | 'ecosystem'
  | 'app-workspace'
  | 'joint-tasks'
  | 'handover'
  | 'master-registry'
  | TableId;

