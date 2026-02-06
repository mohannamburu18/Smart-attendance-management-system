import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, isAdmin } from '../context/AuthContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  getAttendanceTrend, 
  getEngagementTrend, 
  getUserComparison,
  getConsistencyData,
  getDashboardStats
} from '../services/analytics';
import { getUsers } from '../services/mockData';
import { ConsistencyLevel } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  PieChart,
  Activity
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [attendanceTrend, setAttendanceTrend] = useState<{ dates: string[]; present: number[]; absent: number[] } | null>(null);
  const [engagementTrend, setEngagementTrend] = useState<{ dates: string[]; scores: number[] } | null>(null);
  const [userComparison, setUserComparison] = useState<{ names: string[]; attendance: number[]; engagement: number[] } | null>(null);
  const [consistencyBreakdown, setConsistencyBreakdown] = useState<Record<ConsistencyLevel, number>>({
    consistent: 0,
    irregular: 0,
    'at-risk': 0,
    'dropped-off': 0,
  });

  const isAdminUser = user && isAdmin(user.role);

  useEffect(() => {
    // Load analytics data
    setAttendanceTrend(getAttendanceTrend(14));
    setEngagementTrend(getEngagementTrend(14));
    setUserComparison(getUserComparison());
    
    // Calculate consistency breakdown
    const users = getUsers();
    const trackableUsers = users.filter(u => u.role === 'student' || u.role === 'employee');
    const breakdown: Record<ConsistencyLevel, number> = {
      consistent: 0,
      irregular: 0,
      'at-risk': 0,
      'dropped-off': 0,
    };
    
    trackableUsers.forEach(u => {
      const consistency = getConsistencyData(u.id);
      breakdown[consistency.level]++;
    });
    
    setConsistencyBreakdown(breakdown);
  }, []);

  const stats = getDashboardStats();

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        },
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          padding: 20,
        },
      },
    },
  };

  // Attendance Trend Chart Data
  const attendanceChartData = attendanceTrend ? {
    labels: attendanceTrend.dates,
    datasets: [
      {
        label: 'Present',
        data: attendanceTrend.present,
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Absent',
        data: attendanceTrend.absent,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  // Engagement Trend Chart Data
  const engagementChartData = engagementTrend ? {
    labels: engagementTrend.dates,
    datasets: [
      {
        label: 'Average Engagement Score',
        data: engagementTrend.scores,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  // User Comparison Chart Data
  const comparisonChartData = userComparison ? {
    labels: userComparison.names,
    datasets: [
      {
        label: 'Attendance %',
        data: userComparison.attendance,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Engagement Score',
        data: userComparison.engagement,
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  } : null;

  // Consistency Breakdown Chart Data
  const consistencyChartData = {
    labels: ['Consistent', 'Irregular', 'At Risk', 'Inactive'],
    datasets: [
      {
        data: [
          consistencyBreakdown.consistent,
          consistencyBreakdown.irregular,
          consistencyBreakdown['at-risk'],
          consistencyBreakdown['dropped-off'],
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          '#22C55E',
          '#EAB308',
          '#F97316',
          '#EF4444',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (!isAdminUser) {
    return (
      <div className={`rounded-xl p-8 text-center ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
      }`}>
        <BarChart3 className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Analytics Dashboard
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Analytics are only available for administrators, teachers, and HR managers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Analytics Dashboard
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Comprehensive insights into attendance and engagement patterns
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-xl p-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Users className={isDark ? 'text-blue-400' : 'text-blue-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Activity className={isDark ? 'text-green-400' : 'text-green-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Attendance</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.averageAttendance}%</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <TrendingUp className={isDark ? 'text-purple-400' : 'text-purple-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Engagement</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.averageEngagement}</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-4 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
              <PieChart className={isDark ? 'text-orange-400' : 'text-orange-600'} size={20} />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</p>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Attendance Trend (Last 14 Days)
          </h3>
          <div className="h-72">
            {attendanceChartData && (
              <Line data={attendanceChartData} options={lineChartOptions} />
            )}
          </div>
        </div>

        {/* Engagement Trend */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Engagement Trend (Last 14 Days)
          </h3>
          <div className="h-72">
            {engagementChartData && (
              <Line data={engagementChartData} options={lineChartOptions} />
            )}
          </div>
        </div>

        {/* User Comparison */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User-wise Comparison
          </h3>
          <div className="h-72">
            {comparisonChartData && (
              <Bar data={comparisonChartData} options={barChartOptions} />
            )}
          </div>
        </div>

        {/* Consistency Breakdown */}
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User Consistency Breakdown
          </h3>
          <div className="h-72">
            <Doughnut data={consistencyChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className={`rounded-xl p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Consistent Users
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {consistencyBreakdown.consistent}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {stats.totalUsers > 0 
                ? `${Math.round((consistencyBreakdown.consistent / stats.totalUsers) * 100)}% of total users`
                : '0% of total users'
              }
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                At Risk
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {consistencyBreakdown['at-risk']}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Users needing attention
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Drop-off Pattern
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {consistencyBreakdown['dropped-off']}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Inactive for 14+ days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
