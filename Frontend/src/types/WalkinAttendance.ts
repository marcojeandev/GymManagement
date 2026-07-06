import type { WalkinInfo } from './WalkinInfo';
import type { Member } from './Members';

export interface WalkinAttendance {
  id: number;
  walk_in_id: number | null;
  members_id: number | null;
  time_in: string;
  fee_paid: number;
  created_at: string;
  updated_at: string;
  walkin_info?: WalkinInfo | null;
  member?: Member | null;
  person_name?: string; // computed
}

export interface WalkinAttendanceFilters {
  search?: string;
  per_page?: number;
  page?: number;
}