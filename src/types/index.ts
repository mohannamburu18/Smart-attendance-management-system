// User roles in the system
export type UserRole = 'admin' | 'teacher' | 'hr' | 'student' | 'employee';

// User interface representing all users in the system
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

// Attendance status options
export type AttendanceStatus = 'present' | 'absent' | 'late';

// Attendance record for tracking daily attendance
export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time of marking (HH:mm:ss)
  status: AttendanceStatus;
  markedBy: string; // ID of who marked the attendance
  notes?: string;
}

// Engagement metrics tracked per user
export interface EngagementMetrics {
  id: string;
  userId: string;
  date: string;
  loginCount: number;
  timeSpentMinutes: number;
  interactionCount: number; // button clicks, submissions, etc.
  tasksCompleted: number;
  responsesSubmitted: number;
}

// Calculated engagement score with breakdown
export interface EngagementScore {
  userId: string;
  userName: string;
  overallScore: number; // 0-100
  loginScore: number;
  timeScore: number;
  interactionScore: number;
  consistencyScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

// User consistency classification
export type ConsistencyLevel = 'consistent' | 'irregular' | 'at-risk' | 'dropped-off';

// Consistency tracking data
export interface ConsistencyData {
  userId: string;
  userName: string;
  level: ConsistencyLevel;
  attendanceStreak: number;
  longestStreak: number;
  missedDays: number;
  lastActiveDate: string;
  weeklyTrend: number[]; // Last 4 weeks attendance %
}

// Dashboard statistics for admin view
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  averageAttendance: number;
  averageEngagement: number;
  topEngagedUsers: { userId: string; name: string; score: number }[];
  attendanceToday: { present: number; absent: number; late: number };
}

// Report data structure
export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  period: { start: string; end: string };
  data: {
    totalRecords: number;
    averageAttendance: number;
    averageEngagement: number;
    userStats: {
      userId: string;
      name: string;
      attendancePercentage: number;
      engagementScore: number;
    }[];
  };
}

// Auth context state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
}

// Theme type
export type Theme = 'light' | 'dark';

// Navigation item structure
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}
