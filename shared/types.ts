export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  POLICE_HEAD = 'police_head',
  HR_MANAGER = 'hr_manager',
  PREVENTIVE_OFFICER = 'preventive_officer',
  DETECTIVE_OFFICER = 'detective_officer',
  CITIZEN = 'citizen'
}

export interface CrimeReport {
  id: string;
  title: string;
  description: string;
  category: CrimeCategory;
  status: CrimeStatus;
  priority: Priority;
  location: string;
  dateReported: Date;
  dateIncident: Date;
  reportedBy: string; // user id
  assignedTo?: string; // officer id
  evidence?: string[];
  witnesses?: Witness[];
  createdAt: Date;
  updatedAt: Date;
}

export enum CrimeCategory {
  THEFT = 'theft',
  ASSAULT = 'assault',
  BURGLARY = 'burglary',
  FRAUD = 'fraud',
  VANDALISM = 'vandalism',
  DRUG_OFFENSE = 'drug_offense',
  DOMESTIC_VIOLENCE = 'domestic_violence',
  TRAFFIC_VIOLATION = 'traffic_violation',
  OTHER = 'other'
}

export enum CrimeStatus {
  REPORTED = 'reported',
  UNDER_INVESTIGATION = 'under_investigation',
  ASSIGNED = 'assigned',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REJECTED = 'rejected'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Witness {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  statement: string;
  reportId: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface CreateAccountRequest {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
