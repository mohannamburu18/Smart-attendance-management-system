import { User, AttendanceRecord, EngagementMetrics } from '../types';
import { format, subDays } from 'date-fns';

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Default admin and sample users
export const defaultUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@school.edu',
    password: 'admin123',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    department: 'Administration',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'teacher-001',
    email: 'teacher@school.edu',
    password: 'teacher123',
    name: 'Prof. Michael Chen',
    role: 'teacher',
    department: 'Computer Science',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'hr-001',
    email: 'hr@company.com',
    password: 'hr123',
    name: 'Emily Rodriguez',
    role: 'hr',
    department: 'Human Resources',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'student-001',
    email: 'alice@student.edu',
    password: 'student123',
    name: 'Alice Thompson',
    role: 'student',
    department: 'Computer Science',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'student-002',
    email: 'bob@student.edu',
    password: 'student123',
    name: 'Bob Martinez',
    role: 'student',
    department: 'Computer Science',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'student-003',
    email: 'charlie@student.edu',
    password: 'student123',
    name: 'Charlie Wilson',
    role: 'student',
    department: 'Mathematics',
    createdAt: '2024-02-05T00:00:00.000Z',
  },
  {
    id: 'student-004',
    email: 'diana@student.edu',
    password: 'student123',
    name: 'Diana Lee',
    role: 'student',
    department: 'Physics',
    createdAt: '2024-02-10T00:00:00.000Z',
  },
  {
    id: 'student-005',
    email: 'evan@student.edu',
    password: 'student123',
    name: 'Evan Brown',
    role: 'student',
    department: 'Computer Science',
    createdAt: '2024-02-15T00:00:00.000Z',
  },
  {
    id: 'employee-001',
    email: 'frank@company.com',
    password: 'employee123',
    name: 'Frank Miller',
    role: 'employee',
    department: 'Engineering',
    createdAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: 'employee-002',
    email: 'grace@company.com',
    password: 'employee123',
    name: 'Grace Kim',
    role: 'employee',
    department: 'Marketing',
    createdAt: '2024-01-25T00:00:00.000Z',
  },
];

// Generate sample attendance data for the last 30 days
export const generateSampleAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const studentIds = defaultUsers.filter(u => u.role === 'student' || u.role === 'employee').map(u => u.id);
  
  for (let i = 30; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    
    // Skip weekends
    const dayOfWeek = subDays(new Date(), i).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    studentIds.forEach(userId => {
      // Random attendance with weighted probability
      const rand = Math.random();
      let status: 'present' | 'absent' | 'late';
      
      // Different attendance patterns for different users
      if (userId === 'student-001') {
        // Alice is very consistent
        status = rand < 0.95 ? 'present' : rand < 0.98 ? 'late' : 'absent';
      } else if (userId === 'student-005') {
        // Evan has poor attendance
        status = rand < 0.6 ? 'present' : rand < 0.75 ? 'late' : 'absent';
      } else {
        // Others are average
        status = rand < 0.85 ? 'present' : rand < 0.93 ? 'late' : 'absent';
      }
      
      records.push({
        id: generateId(),
        userId,
        date,
        time: `0${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
        status,
        markedBy: 'admin-001',
      });
    });
  }
  
  return records;
};

// Generate sample engagement data for the last 30 days
export const generateSampleEngagement = (): EngagementMetrics[] => {
  const metrics: EngagementMetrics[] = [];
  const userIds = defaultUsers.filter(u => u.role === 'student' || u.role === 'employee').map(u => u.id);
  
  for (let i = 30; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    
    userIds.forEach(userId => {
      // Different engagement patterns for different users
      let baseEngagement = 50;
      
      if (userId === 'student-001') {
        baseEngagement = 85; // Alice is highly engaged
      } else if (userId === 'student-003') {
        baseEngagement = 75; // Charlie is above average
      } else if (userId === 'student-005') {
        baseEngagement = 30; // Evan has low engagement
      }
      
      const variance = (Math.random() - 0.5) * 30;
      const engagement = Math.max(0, Math.min(100, baseEngagement + variance));
      
      metrics.push({
        id: generateId(),
        userId,
        date,
        loginCount: Math.floor(1 + Math.random() * 5 * (engagement / 50)),
        timeSpentMinutes: Math.floor(15 + Math.random() * 120 * (engagement / 50)),
        interactionCount: Math.floor(5 + Math.random() * 50 * (engagement / 50)),
        tasksCompleted: Math.floor(Math.random() * 5 * (engagement / 50)),
        responsesSubmitted: Math.floor(Math.random() * 10 * (engagement / 50)),
      });
    });
  }
  
  return metrics;
};

// Initialize localStorage with sample data if empty
export const initializeData = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify(generateSampleAttendance()));
  }
  if (!localStorage.getItem('engagement')) {
    localStorage.setItem('engagement', JSON.stringify(generateSampleEngagement()));
  }
};

// Get data from localStorage
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getAttendance = (): AttendanceRecord[] => {
  return JSON.parse(localStorage.getItem('attendance') || '[]');
};

export const getEngagement = (): EngagementMetrics[] => {
  return JSON.parse(localStorage.getItem('engagement') || '[]');
};

// Save data to localStorage
export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const saveAttendance = (attendance: AttendanceRecord[]) => {
  localStorage.setItem('attendance', JSON.stringify(attendance));
};

export const saveEngagement = (engagement: EngagementMetrics[]) => {
  localStorage.setItem('engagement', JSON.stringify(engagement));
};
