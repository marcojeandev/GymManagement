import type { Member } from './Members';

export interface Attendance {
  id: number;
  members_id: number;
  time_in: string;
  time_out: string | null;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface AttendanceFilters {
  search?: string;
  member_id?: number; // new
  date?: string;
  per_page?: number;
  page?: number;
}