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

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: Priority;
  location: string;
  dateOccurred: Date;
  reportedBy: string; // officer id
  reporterName: string;
  status: IncidentStatus;
  evidence?: Evidence[];
  witnesses?: Witness[];
  followUpRequired: boolean;
  relatedCaseId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum IncidentType {
  PATROL_OBSERVATION = 'patrol_observation',
  CITIZEN_COMPLAINT = 'citizen_complaint',
  TRAFFIC_INCIDENT = 'traffic_incident',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PROPERTY_DAMAGE = 'property_damage',
  NOISE_COMPLAINT = 'noise_complaint',
  PUBLIC_DISTURBANCE = 'public_disturbance',
  EMERGENCY_RESPONSE = 'emergency_response',
  OTHER = 'other'
}

export enum IncidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  description: string;
  tags?: string[];
  caseId?: string;
  incidentId?: string;
  uploadedAt: Date;
  isSecure: boolean;
}

export interface PatrolLog {
  id: string;
  officerId: string;
  officerName: string;
  shift: ShiftType;
  startTime: Date;
  endTime?: Date;
  route: string;
  area: string;
  status: PatrolStatus;
  activities: PatrolActivity[];
  incidents?: string[]; // incident report ids
  notes?: string;
  mileageStart?: number;
  mileageEnd?: number;
  vehicleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  OVERTIME = 'overtime'
}

export enum PatrolStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended'
}

export interface PatrolActivity {
  id: string;
  time: Date;
  activity: string;
  location: string;
  description?: string;
  type: ActivityType;
}

export enum ActivityType {
  CHECKPOINT = 'checkpoint',
  PATROL = 'patrol',
  RESPONSE = 'response',
  BREAK = 'break',
  REPORT = 'report',
  OTHER = 'other'
}

export interface CriminalRecord {
  id: string;
  personalInfo: {
    fullName: string;
    aliases?: string[];
    dateOfBirth?: Date;
    nationalId?: string;
    address?: string;
    phone?: string;
    photo?: string;
  };
  physicalDescription: {
    height?: number;
    weight?: number;
    eyeColor?: string;
    hairColor?: string;
    distinguishingMarks?: string[];
  };
  criminalHistory: {
    convictions: Conviction[];
    arrests: ArrestRecord[];
    warrants: Warrant[];
    associates?: string[];
  };
  riskLevel: RiskLevel;
  isActive: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

export interface Conviction {
  id: string;
  crimeType: CrimeCategory;
  description: string;
  date: Date;
  sentence: string;
  court: string;
  caseNumber: string;
}

export interface ArrestRecord {
  id: string;
  date: Date;
  charges: string[];
  arrestingOfficer: string;
  location: string;
  disposition: string;
}

export interface Warrant {
  id: string;
  type: WarrantType;
  issueDate: Date;
  expiryDate?: Date;
  issuingCourt: string;
  charges: string[];
  status: WarrantStatus;
}

export enum WarrantType {
  ARREST = 'arrest',
  SEARCH = 'search',
  BENCH = 'bench'
}

export enum WarrantStatus {
  ACTIVE = 'active',
  EXECUTED = 'executed',
  EXPIRED = 'expired',
  RECALLED = 'recalled'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface InvestigationReport {
  id: string;
  caseId: string;
  title: string;
  investigatorId: string;
  investigatorName: string;
  reportType: ReportType;
  summary: string;
  findings: string;
  recommendations: string;
  evidence: Evidence[];
  interviews: Interview[];
  timeline: TimelineEvent[];
  status: ReportStatus;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export enum ReportType {
  PRELIMINARY = 'preliminary',
  PROGRESS = 'progress',
  FINAL = 'final',
  SUPPLEMENTAL = 'supplemental'
}

export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Interview {
  id: string;
  intervieweeType: IntervieweeType;
  intervieweeName: string;
  date: Date;
  location: string;
  duration: number; // minutes
  summary: string;
  keyPoints: string[];
  conductedBy: string;
}

export enum IntervieweeType {
  WITNESS = 'witness',
  SUSPECT = 'suspect',
  VICTIM = 'victim',
  EXPERT = 'expert',
  OTHER = 'other'
}

export interface TimelineEvent {
  id: string;
  date: Date;
  time?: Date;
  event: string;
  location?: string;
  source: string;
  verified: boolean;
}
