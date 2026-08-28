export type RiskLevel = 'SAFE' | 'WATCH' | 'HIGH_RISK' | 'CRITICAL';
export type AssessmentType = 'CT' | 'MIDTERM' | 'FINAL_EXAM' | 'ASSIGNMENT' | 'LAB' | 'QUIZ' | 'PROJECT';
export type AssignmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type EventType = 'EXAM' | 'CT' | 'ASSIGNMENT' | 'PROJECT' | 'HOLIDAY' | 'OTHER';
export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'dark' | 'light' | 'system';
  attendanceTarget: number; // default e.g. 85
  minimumAttendance: number; // default e.g. 75
  gradingSystem: '10_POINT' | '4_POINT';
  notificationPreferences: {
    attendanceAlerts: boolean;
    assignmentReminders: boolean;
    examAlerts: boolean;
    weeklySummary: boolean;
  };
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  minimumAttendance: number; // e.g. 75
  targetAttendance?: number; // e.g. 85
  color: string;
  instructor?: string;
  room?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'CANCELLED';
  classType: 'LECTURE' | 'LAB' | 'TUTORIAL';
  notes?: string;
  createdAt: string;
}

export interface Mark {
  id: string;
  subjectId: string;
  userId: string;
  assessmentName: string;
  assessmentType: AssessmentType;
  obtainedMarks: number;
  maximumMarks: number;
  date: string;
  weightage?: number;
  notes?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description?: string;
  deadline: string; // ISO or YYYY-MM-DDTHH:mm
  priority: AssignmentPriority;
  status: AssignmentStatus;
  estimatedHours?: number;
  completedAt?: string;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  userId: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string; // HH:mm (24hr)
  endTime: string; // HH:mm (24hr)
  room?: string;
  instructor?: string;
  classType?: 'LECTURE' | 'LAB' | 'TUTORIAL';
}

export interface AcademicEvent {
  id: string;
  userId: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  description?: string;
  subjectId?: string;
  location?: string;
  createdAt: string;
}

// Attendance Intelligence Types
export interface SubjectAttendanceIntelligence {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: string;
  credits: number;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  excusedClasses: number;
  attendancePercentage: number | null;
  targetPercentage: number;
  minimumRequiredPercentage: number;
  classesNeededForTarget: number;
  classesCanMiss: number;
  isTargetImpossible: boolean;
  projectedIfAttendNext: number | null;
  projectedIfMissNext: number | null;
  riskLevel: RiskLevel;
  riskMessage: string;
  statusSummary: string;
  recentTrend: TrendDirection;
}

export interface OverallAttendanceIntelligence {
  totalClasses: number;
  totalAttended: number;
  overallPercentage: number | null;
  targetPercentage: number;
  minimumPercentage: number;
  safeSubjectsCount: number;
  watchSubjectsCount: number;
  riskSubjectsCount: number;
  criticalSubjectsCount: number;
  overallRisk: RiskLevel;
}

// Academic Performance & Forecast Types
export interface SubjectPerformanceAnalytics {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: string;
  credits: number;
  assessmentsCount: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  trend: TrendDirection;
  trendPercentageChange: number; // e.g. +7.5%
  isWeakSubject: boolean;
  weakReason?: string;
  gradeEstimate?: string;
  gradePointEstimate?: number;
}

export interface SGPASimulationInput {
  subjectId: string;
  subjectName: string;
  credits: number;
  currentGradePoint: number;
  simulatedGradePoint: number;
  simulatedGrade: string;
}

export interface SemesterRecord {
  semesterNumber: number;
  semesterName: string;
  sgpa: number;
  totalCredits: number;
}

// Recommendation & Priority Types
export interface ActionRecommendation {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'ATTENDANCE' | 'ASSIGNMENT' | 'ACADEMIC' | 'EXAM_PREP' | 'SCHEDULE';
  title: string;
  reason: string;
  action: string;
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
  deadline?: string;
  urgencyScore: number;
}

export interface DailyActionItem {
  id: string;
  title: string;
  subtitle: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  timeContext?: string;
  badgeText: string;
  badgeColor: 'red' | 'amber' | 'blue' | 'emerald' | 'purple';
  actionType: 'ATTEND' | 'SUBMIT' | 'STUDY' | 'PREPARE';
  targetRoute?: string;
}

export interface WeeklyAcademicSummary {
  attendanceChangePercent: number; // e.g. +1.8%
  attendanceDirection: 'UP' | 'DOWN' | 'STABLE';
  assignmentsCompletedCount: number;
  assignmentsPendingCount: number;
  upcomingExamsCount: number;
  highestRiskSubjectName?: string;
  topPrioritySubjectName?: string;
  highlightMessage: string;
  detailedPoints: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'WARNING' | 'ALERT' | 'INFO' | 'SUCCESS';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface DashboardData {
  user: User;
  overallAttendance: {
    overallPercentage: number | null;
    totalAttended: number;
    totalHeld: number;
    isAboveTarget: boolean;
    isAboveMinimum: boolean;
    subjects: SubjectAttendanceIntelligence[];
  };
  academicPerformance: {
    estimatedSGPA: number | null;
    estimatedCGPA: number | null;
    academicRisk: RiskLevel;
    trend: TrendDirection;
    completedCredits: number;
    semesters: SemesterRecord[];
    subjects: SubjectPerformanceAnalytics[];
  };
  recommendations: ActionRecommendation[];
  pendingTasks: {
    pendingCount: number;
    urgentDueNext24Hours: number;
    dueThisWeekCount: number;
  };
  riskAnalysis: {
    riskLevel: RiskLevel;
    inDangerCount: number;
    borderlineCount: number;
    riskScore: number;
  };
  whatShouldIDoToday: DailyActionItem[];
  todaySchedule: {
    dayOfWeek: DayOfWeek;
    dateFormatted: string;
    classes: Array<{
      id: string;
      subjectName: string;
      subjectCode: string;
      color: string;
      startTime: string;
      endTime: string;
      room?: string;
      instructor?: string;
      isNext?: boolean;
    }>;
  };
  weeklySummary: WeeklyAcademicSummary;
  subjects: Subject[];
  recentNotifications: AppNotification[];
}

export interface CareerProfile {
  interests: string[];
  skills: string[];
  workStyles: string[];
  careerPreferences: string[];
  favoriteSubjects: string[];
}

export interface CareerRecommendation {
  id: string;
  name: string;
  matchScore: number;
  reason: string;
  description: string;
}

export interface CareerRoadmapTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CareerRoadmapPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  tasks: CareerRoadmapTask[];
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  targetCareer: string;
  phases: CareerRoadmapPhase[];
}
