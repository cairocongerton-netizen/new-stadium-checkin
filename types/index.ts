/**
 * Core type definitions for the New Stadium Check-in Application
 */

export type Discipline =
  | 'Software'
  | 'Art'
  | 'Hardware'
  | 'Design'
  | 'Fashion'
  | 'AI/ML'
  | 'Other'
  | 'Photographer/Videographer';

export interface User {
  id: string;
  email: string;
  name: string;
  disciplines: Discipline[];
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  user_id: string;
  timestamp: string;
  reason_for_visit: string;
  disciplines_at_visit: Discipline[];
}

export interface UserWithVisits extends User {
  visits: Visit[];
}

export interface CheckInFormData {
  email: string;
  name: string;
  disciplines: Discipline[];
  reason: string;
}

export interface EmailLookupResult {
  exists: boolean;
  user?: User;
  lastVisit?: Visit;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AnalyticsData {
  totalCheckIns: {
    today: number;
    week: number;
    month: number;
  };
  disciplineBreakdown: {
    discipline: Discipline;
    count: number;
  }[];
  recentActivity: Visit[];
}

export interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  discipline?: Discipline;
  searchTerm?: string;
}
