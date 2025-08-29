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
  SUPER_ADMIN = "super_admin",
  POLICE_HEAD = "police_head",
  HR_MANAGER = "hr_manager",
  PREVENTIVE_OFFICER = "preventive_officer",
  DETECTIVE_OFFICER = "detective_officer",
  CITIZEN = "citizen",
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
  THEFT = "theft",
  ASSAULT = "assault",
  BURGLARY = "burglary",
  FRAUD = "fraud",
  VANDALISM = "vandalism",
  DRUG_OFFENSE = "drug_offense",
  DOMESTIC_VIOLENCE = "domestic_violence",
  TRAFFIC_VIOLATION = "traffic_violation",
  OTHER = "other",
}

export enum CrimeStatus {
  REPORTED = "reported",
  UNDER_INVESTIGATION = "under_investigation",
  ASSIGNED = "assigned",
  RESOLVED = "resolved",
  CLOSED = "closed",
  REJECTED = "rejected",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
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
  PATROL_OBSERVATION = "patrol_observation",
  CITIZEN_COMPLAINT = "citizen_complaint",
  TRAFFIC_INCIDENT = "traffic_incident",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  PROPERTY_DAMAGE = "property_damage",
  NOISE_COMPLAINT = "noise_complaint",
  PUBLIC_DISTURBANCE = "public_disturbance",
  EMERGENCY_RESPONSE = "emergency_response",
  OTHER = "other",
}

export enum IncidentStatus {
  REPORTED = "reported",
  INVESTIGATING = "investigating",
  ESCALATED = "escalated",
  RESOLVED = "resolved",
  CLOSED = "closed",
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
  MORNING = "morning",
  AFTERNOON = "afternoon",
  NIGHT = "night",
  OVERTIME = "overtime",
}

export enum PatrolStatus {
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  COMPLETED = "completed",
  SUSPENDED = "suspended",
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
  CHECKPOINT = "checkpoint",
  PATROL = "patrol",
  RESPONSE = "response",
  BREAK = "break",
  REPORT = "report",
  OTHER = "other",
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
  ARREST = "arrest",
  SEARCH = "search",
  BENCH = "bench",
}

export enum WarrantStatus {
  ACTIVE = "active",
  EXECUTED = "executed",
  EXPIRED = "expired",
  RECALLED = "recalled",
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
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
  PRELIMINARY = "preliminary",
  PROGRESS = "progress",
  FINAL = "final",
  SUPPLEMENTAL = "supplemental",
}

export enum ReportStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
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
  WITNESS = "witness",
  SUSPECT = "suspect",
  VICTIM = "victim",
  EXPERT = "expert",
  OTHER = "other",
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

// HR Manager Types
export interface OfficerProfile {
  id: string;
  employeeId: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: Date;
    nationalId: string;
    address: string;
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  professionalInfo: {
    badgeNumber: string;
    rank: OfficerRank;
    department: Department;
    startDate: Date;
    status: EmploymentStatus;
    supervisor?: string;
    specializations: string[];
    certifications: Certification[];
  };
  photo?: string;
  documents: Document[];
  performanceReviews: PerformanceReview[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum OfficerRank {
  CONSTABLE = "constable",
  CORPORAL = "corporal",
  SERGEANT = "sergeant",
  LIEUTENANT = "lieutenant",
  CAPTAIN = "captain",
  MAJOR = "major",
  COLONEL = "colonel",
  INSPECTOR = "inspector",
  CHIEF = "chief",
}

export enum Department {
  PATROL = "patrol",
  CRIMINAL_INVESTIGATION = "criminal_investigation",
  TRAFFIC = "traffic",
  CYBER_CRIME = "cyber_crime",
  NARCOTICS = "narcotics",
  FORENSICS = "forensics",
  ADMINISTRATION = "administration",
  TRAINING = "training",
  INTERNAL_AFFAIRS = "internal_affairs",
}

export enum EmploymentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
  RETIRED = "retired",
  ON_LEAVE = "on_leave",
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateNumber: string;
  status: CertificationStatus;
}

export enum CertificationStatus {
  VALID = "valid",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
  REVOKED = "revoked",
}

export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  isConfidential: boolean;
}

export enum DocumentType {
  RESUME = "resume",
  ID_COPY = "id_copy",
  CERTIFICATE = "certificate",
  CONTRACT = "contract",
  MEDICAL_REPORT = "medical_report",
  BACKGROUND_CHECK = "background_check",
  TRAINING_RECORD = "training_record",
  OTHER = "other",
}

export interface PerformanceReview {
  id: string;
  officerId: string;
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
  };
  reviewer: string;
  reviewerName: string;
  overallRating: Rating;
  competencies: Competency[];
  achievements: string[];
  areasForImprovement: string[];
  goals: string[];
  comments: string;
  reviewDate: Date;
  status: ReviewStatus;
}

export enum Rating {
  EXCELLENT = "excellent",
  GOOD = "good",
  SATISFACTORY = "satisfactory",
  NEEDS_IMPROVEMENT = "needs_improvement",
  UNSATISFACTORY = "unsatisfactory",
}

export interface Competency {
  name: string;
  rating: Rating;
  comments?: string;
}

export enum ReviewStatus {
  DRAFT = "draft",
  COMPLETED = "completed",
  APPROVED = "approved",
}

export interface StaffSchedule {
  id: string;
  officerId: string;
  officerName: string;
  shift: ShiftType;
  startDate: Date;
  endDate: Date;
  assignment: Assignment;
  status: ScheduleStatus;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  type: AssignmentType;
  location: string;
  description: string;
  supervisorId?: string;
  requiredCertifications?: string[];
}

export enum AssignmentType {
  PATROL = "patrol",
  INVESTIGATION = "investigation",
  TRAFFIC_CONTROL = "traffic_control",
  SECURITY_DETAIL = "security_detail",
  COURT_DUTY = "court_duty",
  TRAINING = "training",
  ADMINISTRATIVE = "administrative",
  SPECIAL_OPERATIONS = "special_operations",
}

export enum ScheduleStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export interface HRReport {
  id: string;
  type: HRReportType;
  title: string;
  description: string;
  parameters: ReportParameters;
  generatedBy: string;
  generatedAt: Date;
  fileUrl?: string;
  status: HRReportStatus;
}

export enum HRReportType {
  ATTENDANCE = "attendance",
  PERFORMANCE = "performance",
  STAFFING_LEVELS = "staffing_levels",
  CERTIFICATION_STATUS = "certification_status",
  PAYROLL = "payroll",
  TRAINING_COMPLETION = "training_completion",
  EMPLOYEE_DEMOGRAPHICS = "employee_demographics",
  DISCIPLINARY_ACTIONS = "disciplinary_actions",
}

export interface ReportParameters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  departments?: Department[];
  ranks?: OfficerRank[];
  includeInactive?: boolean;
  [key: string]: any;
}

export enum HRReportStatus {
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Citizen Types
export interface CitizenFeedback {
  id: string;
  citizenId: string;
  citizenName: string;
  email?: string;
  phone?: string;
  feedbackType: FeedbackType;
  category: FeedbackCategory;
  subject: string;
  message: string;
  relatedCaseId?: string;
  priority: Priority;
  status: FeedbackStatus;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  attachments?: string[];
  isAnonymous: boolean;
  submittedAt: Date;
  updatedAt: Date;
}

export enum FeedbackType {
  COMPLAINT = "complaint",
  SUGGESTION = "suggestion",
  COMPLIMENT = "compliment",
  INQUIRY = "inquiry",
  SERVICE_REQUEST = "service_request",
}

export enum FeedbackCategory {
  OFFICER_CONDUCT = "officer_conduct",
  SERVICE_QUALITY = "service_quality",
  RESPONSE_TIME = "response_time",
  FACILITY_CONDITIONS = "facility_conditions",
  SAFETY_CONCERNS = "safety_concerns",
  GENERAL = "general",
}

export enum FeedbackStatus {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export interface EmergencyContact {
  id: string;
  name: string;
  type: EmergencyType;
  phoneNumber: string;
  description: string;
  isActive: boolean;
  priority: number;
  availableHours: string;
  location?: string;
}

export enum EmergencyType {
  POLICE = "police",
  FIRE = "fire",
  MEDICAL = "medical",
  AMBULANCE = "ambulance",
  DISASTER_RESPONSE = "disaster_response",
  POISON_CONTROL = "poison_control",
  MENTAL_HEALTH = "mental_health",
  DOMESTIC_VIOLENCE = "domestic_violence",
}

export interface SafetyInformation {
  id: string;
  title: string;
  category: SafetyCategory;
  content: string;
  tips: string[];
  resources: SafetyResource[];
  isPublished: boolean;
  publishedAt?: Date;
  lastUpdated: Date;
  updatedBy: string;
  priority: Priority;
  tags: string[];
}

export enum SafetyCategory {
  CRIME_PREVENTION = "crime_prevention",
  HOME_SECURITY = "home_security",
  PERSONAL_SAFETY = "personal_safety",
  CYBER_SECURITY = "cyber_security",
  TRAFFIC_SAFETY = "traffic_safety",
  EMERGENCY_PREPAREDNESS = "emergency_preparedness",
  COMMUNITY_PROGRAMS = "community_programs",
  AWARENESS_CAMPAIGNS = "awareness_campaigns",
}

export interface SafetyResource {
  title: string;
  type: ResourceType;
  url?: string;
  downloadUrl?: string;
  description: string;
}

export enum ResourceType {
  ARTICLE = "article",
  VIDEO = "video",
  PDF = "pdf",
  WEBSITE = "website",
  HOTLINE = "hotline",
  APP = "app",
}

export interface CitizenReportStatus {
  reportId: string;
  currentStatus: CrimeStatus;
  statusHistory: StatusUpdate[];
  assignedOfficer?: {
    id: string;
    name: string;
    badgeNumber: string;
    contactInfo?: string;
  };
  lastUpdate: Date;
  estimatedResolution?: Date;
  canProvideUpdates: boolean;
}

export interface StatusUpdate {
  status: CrimeStatus;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
  isVisibleToCitizen: boolean;
}
