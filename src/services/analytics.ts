import { 
  EngagementScore, 
  ConsistencyData, 
  ConsistencyLevel,
  DashboardStats 
} from '../types';
import { getUsers, getAttendance, getEngagement } from './mockData';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';

/**
 * Calculate attendance percentage for a user
 * @param userId - The user ID to calculate for
 * @param days - Number of days to look back (default 30)
 */
export const calculateAttendancePercentage = (userId: string, days: number = 30): number => {
  const attendance = getAttendance();
  const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  
  const userRecords = attendance.filter(
    record => record.userId === userId && record.date >= cutoffDate
  );
  
  if (userRecords.length === 0) return 0;
  
  const presentDays = userRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  return Math.round((presentDays / userRecords.length) * 100);
};

/**
 * Calculate engagement score for a user (0-100)
 * Score is based on:
 * - Login frequency (25%)
 * - Time spent (25%)
 * - Interaction count (25%)
 * - Consistency/streak (25%)
 */
export const calculateEngagementScore = (userId: string, days: number = 30): EngagementScore => {
  const engagement = getEngagement();
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  
  const userMetrics = engagement.filter(
    m => m.userId === userId && m.date >= cutoffDate
  );
  
  if (userMetrics.length === 0) {
    return {
      userId,
      userName: user?.name || 'Unknown',
      overallScore: 0,
      loginScore: 0,
      timeScore: 0,
      interactionScore: 0,
      consistencyScore: 0,
      trend: 'stable',
    };
  }
  
  // Calculate individual scores (normalized to 0-100)
  const avgLogins = userMetrics.reduce((sum, m) => sum + m.loginCount, 0) / userMetrics.length;
  const loginScore = Math.min(100, avgLogins * 20); // 5 logins = 100
  
  const avgTime = userMetrics.reduce((sum, m) => sum + m.timeSpentMinutes, 0) / userMetrics.length;
  const timeScore = Math.min(100, avgTime / 1.2); // 120 minutes = 100
  
  const avgInteractions = userMetrics.reduce((sum, m) => sum + m.interactionCount, 0) / userMetrics.length;
  const interactionScore = Math.min(100, avgInteractions * 2); // 50 interactions = 100
  
  // Consistency score based on how many days have metrics
  const consistencyScore = Math.min(100, (userMetrics.length / days) * 100);
  
  // Overall weighted score
  const overallScore = Math.round(
    loginScore * 0.25 + timeScore * 0.25 + interactionScore * 0.25 + consistencyScore * 0.25
  );
  
  // Calculate trend by comparing first half to second half
  const midpoint = Math.floor(userMetrics.length / 2);
  const firstHalfAvg = userMetrics.slice(0, midpoint).reduce((sum, m) => 
    sum + m.loginCount + m.interactionCount, 0) / (midpoint || 1);
  const secondHalfAvg = userMetrics.slice(midpoint).reduce((sum, m) => 
    sum + m.loginCount + m.interactionCount, 0) / (userMetrics.length - midpoint || 1);
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'improving';
  else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'declining';
  
  return {
    userId,
    userName: user?.name || 'Unknown',
    overallScore,
    loginScore: Math.round(loginScore),
    timeScore: Math.round(timeScore),
    interactionScore: Math.round(interactionScore),
    consistencyScore: Math.round(consistencyScore),
    trend,
  };
};

/**
 * Determine consistency level based on attendance patterns
 */
export const getConsistencyData = (userId: string): ConsistencyData => {
  const attendance = getAttendance();
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  const userRecords = attendance
    .filter(r => r.userId === userId)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (userRecords.length === 0) {
    return {
      userId,
      userName: user?.name || 'Unknown',
      level: 'dropped-off',
      attendanceStreak: 0,
      longestStreak: 0,
      missedDays: 0,
      lastActiveDate: 'Never',
      weeklyTrend: [0, 0, 0, 0],
    };
  }
  
  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let missedDays = 0;
  
  for (const record of userRecords) {
    if (record.status === 'present' || record.status === 'late') {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
      missedDays++;
    }
  }
  currentStreak = tempStreak;
  
  // Calculate weekly trends (last 4 weeks)
  const weeklyTrend: number[] = [];
  for (let week = 3; week >= 0; week--) {
    const weekStart = format(subDays(new Date(), (week + 1) * 7), 'yyyy-MM-dd');
    const weekEnd = format(subDays(new Date(), week * 7), 'yyyy-MM-dd');
    
    const weekRecords = userRecords.filter(
      r => r.date >= weekStart && r.date < weekEnd
    );
    
    if (weekRecords.length === 0) {
      weeklyTrend.push(0);
    } else {
      const present = weekRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      weeklyTrend.push(Math.round((present / weekRecords.length) * 100));
    }
  }
  
  // Determine consistency level
  const lastRecord = userRecords[userRecords.length - 1];
  const daysSinceLastActive = differenceInDays(new Date(), parseISO(lastRecord.date));
  const attendanceRate = calculateAttendancePercentage(userId, 30);
  
  let level: ConsistencyLevel;
  if (daysSinceLastActive > 14) {
    level = 'dropped-off';
  } else if (attendanceRate >= 90 && currentStreak >= 5) {
    level = 'consistent';
  } else if (attendanceRate >= 70) {
    level = 'irregular';
  } else {
    level = 'at-risk';
  }
  
  return {
    userId,
    userName: user?.name || 'Unknown',
    level,
    attendanceStreak: currentStreak,
    longestStreak,
    missedDays,
    lastActiveDate: lastRecord.date,
    weeklyTrend,
  };
};

/**
 * Get dashboard statistics for admin view
 */
export const getDashboardStats = (): DashboardStats => {
  const users = getUsers();
  const attendance = getAttendance();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Filter to only students and employees
  const trackableUsers = users.filter(u => u.role === 'student' || u.role === 'employee');
  
  // Calculate average attendance
  const attendancePercentages = trackableUsers.map(u => calculateAttendancePercentage(u.id, 30));
  const avgAttendance = attendancePercentages.length > 0 
    ? Math.round(attendancePercentages.reduce((a, b) => a + b, 0) / attendancePercentages.length)
    : 0;
  
  // Calculate average engagement
  const engagementScores = trackableUsers.map(u => calculateEngagementScore(u.id, 30));
  const avgEngagement = engagementScores.length > 0
    ? Math.round(engagementScores.reduce((a, b) => a + b.overallScore, 0) / engagementScores.length)
    : 0;
  
  // Get top engaged users
  const topEngagedUsers = engagementScores
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 5)
    .map(s => ({ userId: s.userId, name: s.userName, score: s.overallScore }));
  
  // Today's attendance
  const todayRecords = attendance.filter(r => r.date === today);
  const attendanceToday = {
    present: todayRecords.filter(r => r.status === 'present').length,
    absent: todayRecords.filter(r => r.status === 'absent').length,
    late: todayRecords.filter(r => r.status === 'late').length,
  };
  
  // Active users (logged in within last 7 days)
  const activeUsers = trackableUsers.filter(u => {
    const lastActive = getConsistencyData(u.id).lastActiveDate;
    if (lastActive === 'Never') return false;
    return differenceInDays(new Date(), parseISO(lastActive)) <= 7;
  }).length;
  
  return {
    totalUsers: trackableUsers.length,
    activeUsers,
    averageAttendance: avgAttendance,
    averageEngagement: avgEngagement,
    topEngagedUsers,
    attendanceToday,
  };
};

/**
 * Get attendance data for charts (last N days)
 */
export const getAttendanceTrend = (days: number = 14): { dates: string[]; present: number[]; absent: number[] } => {
  const attendance = getAttendance();
  const dates: string[] = [];
  const present: number[] = [];
  const absent: number[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayRecords = attendance.filter(r => r.date === date);
    
    dates.push(format(subDays(new Date(), i), 'MMM dd'));
    present.push(dayRecords.filter(r => r.status === 'present' || r.status === 'late').length);
    absent.push(dayRecords.filter(r => r.status === 'absent').length);
  }
  
  return { dates, present, absent };
};

/**
 * Get engagement trend for charts
 */
export const getEngagementTrend = (days: number = 14): { dates: string[]; scores: number[] } => {
  const engagement = getEngagement();
  
  const dates: string[] = [];
  const scores: number[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayMetrics = engagement.filter(m => m.date === date);
    
    if (dayMetrics.length > 0) {
      // Calculate average engagement for the day
      const avgScore = dayMetrics.reduce((sum, m) => {
        const loginScore = Math.min(100, m.loginCount * 20);
        const timeScore = Math.min(100, m.timeSpentMinutes / 1.2);
        const interactionScore = Math.min(100, m.interactionCount * 2);
        return sum + (loginScore + timeScore + interactionScore) / 3;
      }, 0) / dayMetrics.length;
      
      scores.push(Math.round(avgScore));
    } else {
      scores.push(0);
    }
    
    dates.push(format(subDays(new Date(), i), 'MMM dd'));
  }
  
  return { dates, scores };
};

/**
 * Get user comparison data for charts
 */
export const getUserComparison = (): { names: string[]; attendance: number[]; engagement: number[] } => {
  const users = getUsers();
  const trackableUsers = users.filter(u => u.role === 'student' || u.role === 'employee').slice(0, 7);
  
  const names = trackableUsers.map(u => u.name.split(' ')[0]);
  const attendance = trackableUsers.map(u => calculateAttendancePercentage(u.id, 30));
  const engagement = trackableUsers.map(u => calculateEngagementScore(u.id, 30).overallScore);
  
  return { names, attendance, engagement };
};

/**
 * Generate report data
 */
export const generateReport = (type: 'daily' | 'weekly' | 'monthly') => {
  const users = getUsers();
  const trackableUsers = users.filter(u => u.role === 'student' || u.role === 'employee');
  
  const daysMap = { daily: 1, weekly: 7, monthly: 30 };
  const days = daysMap[type];
  
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  const userStats = trackableUsers.map(u => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    department: u.department || 'N/A',
    attendancePercentage: calculateAttendancePercentage(u.id, days),
    engagementScore: calculateEngagementScore(u.id, days).overallScore,
    consistencyLevel: getConsistencyData(u.id).level,
  }));
  
  return {
    id: `report-${Date.now()}`,
    type,
    generatedAt: new Date().toISOString(),
    period: {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
    },
    summary: {
      totalUsers: trackableUsers.length,
      averageAttendance: Math.round(
        userStats.reduce((sum, u) => sum + u.attendancePercentage, 0) / userStats.length
      ),
      averageEngagement: Math.round(
        userStats.reduce((sum, u) => sum + u.engagementScore, 0) / userStats.length
      ),
    },
    userStats,
  };
};

/**
 * Export report as JSON
 */
export const exportReportAsJSON = (type: 'daily' | 'weekly' | 'monthly') => {
  const report = generateReport(type);
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-report-${type}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export report as CSV
 */
export const exportReportAsCSV = (type: 'daily' | 'weekly' | 'monthly') => {
  const report = generateReport(type);
  
  const headers = ['User ID', 'Name', 'Email', 'Department', 'Attendance %', 'Engagement Score', 'Consistency'];
  const rows = report.userStats.map(u => [
    u.userId,
    u.name,
    u.email,
    u.department,
    u.attendancePercentage.toString(),
    u.engagementScore.toString(),
    u.consistencyLevel,
  ]);
  
  const csv = [
    `Report Type: ${type}`,
    `Period: ${report.period.start} to ${report.period.end}`,
    `Generated: ${report.generatedAt}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-report-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
