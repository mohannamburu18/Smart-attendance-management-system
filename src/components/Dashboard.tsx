import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, isAdmin } from '../context/AuthContext';
import { getDashboardStats, calculateAttendancePercentage, calculateEngagementScore, getConsistencyData } from '../services/analytics';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Award,
  AlertTriangle,
  Clock,
  Target,
  Zap
} from 'lucide-react';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, isDark }) => {
  const colorClasses = {
    blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600',
    green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600',
    purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600',
    orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600',
    red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600',
  };

  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  isDark: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size = 80, 
  strokeWidth = 8, 
  color,
  isDark 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#374151' : '#E5E7EB'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className={`absolute text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {progress}%
      </span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const isAdminUser = user && isAdmin(user.role);
  const stats = getDashboardStats();

  // For non-admin users, show their personal stats
  const personalAttendance = user ? calculateAttendancePercentage(user.id, 30) : 0;
  const personalEngagement = user ? calculateEngagementScore(user.id, 30) : null;
  const personalConsistency = user ? getConsistencyData(user.id) : null;

  const getConsistencyBadge = (level: string) => {
    const badges = {
      consistent: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Consistent' },
      irregular: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Irregular' },
      'at-risk': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'At Risk' },
      'dropped-off': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Inactive' },
    };
    return badges[level as keyof typeof badges] || badges.irregular;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`rounded-xl p-6 ${
        isDark 
          ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-800/50' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
      }`}>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-indigo-100">
          {isAdminUser 
            ? 'Here\'s an overview of your organization\'s attendance and engagement metrics.' 
            : 'Track your attendance, engagement, and see how you\'re progressing.'}
        </p>
      </div>

      {/* Admin Stats */}
      {isAdminUser && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`${stats.activeUsers} active`}
              icon={<Users size={24} />}
              color="blue"
              isDark={isDark}
            />
            <StatCard
              title="Average Attendance"
              value={`${stats.averageAttendance}%`}
              subtitle="Last 30 days"
              icon={<UserCheck size={24} />}
              color="green"
              isDark={isDark}
            />
            <StatCard
              title="Average Engagement"
              value={`${stats.averageEngagement}`}
              subtitle="Score out of 100"
              icon={<TrendingUp size={24} />}
              color="purple"
              isDark={isDark}
            />
            <StatCard
              title="Today's Attendance"
              value={stats.attendanceToday.present}
              subtitle={`${stats.attendanceToday.absent} absent, ${stats.attendanceToday.late} late`}
              icon={<Clock size={24} />}
              color="orange"
              isDark={isDark}
            />
          </div>

          {/* Top Engaged Users */}
          <div className={`rounded-xl p-6 transition-all duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Award className="text-yellow-500" size={20} />
              Top Engaged Users
            </h2>
            <div className="space-y-3">
              {stats.topEngagedUsers.map((user, index) => (
                <div 
                  key={user.userId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${user.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Personal Stats (for all users) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Progress */}
        <div className={`rounded-xl p-6 transition-all duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your Attendance (30 days)
          </h3>
          <div className="flex items-center justify-center">
            <ProgressRing 
              progress={personalAttendance} 
              color={personalAttendance >= 80 ? '#22C55E' : personalAttendance >= 60 ? '#F59E0B' : '#EF4444'}
              isDark={isDark}
            />
          </div>
          <p className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {personalAttendance >= 80 ? 'Excellent attendance!' : 
             personalAttendance >= 60 ? 'Room for improvement' : 
             'Needs attention'}
          </p>
        </div>

        {/* Engagement Score */}
        <div className={`rounded-xl p-6 transition-all duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your Engagement Score
          </h3>
          <div className="flex items-center justify-center">
            <ProgressRing 
              progress={personalEngagement?.overallScore || 0} 
              color="#8B5CF6"
              isDark={isDark}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            {personalEngagement?.trend === 'improving' && (
              <span className="flex items-center gap-1 text-sm text-green-500">
                <TrendingUp size={16} /> Improving
              </span>
            )}
            {personalEngagement?.trend === 'declining' && (
              <span className="flex items-center gap-1 text-sm text-red-500">
                <AlertTriangle size={16} /> Declining
              </span>
            )}
            {personalEngagement?.trend === 'stable' && (
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Stable
              </span>
            )}
          </div>
        </div>

        {/* Consistency Status */}
        <div className={`rounded-xl p-6 transition-all duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Consistency Status
          </h3>
          {personalConsistency && (
            <div className="text-center">
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                getConsistencyBadge(personalConsistency.level).bg
              } ${getConsistencyBadge(personalConsistency.level).text}`}>
                {getConsistencyBadge(personalConsistency.level).label}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Current Streak</span>
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {personalConsistency.attendanceStreak} days
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Longest Streak</span>
                  <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {personalConsistency.longestStreak} days
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Breakdown */}
      {personalEngagement && (
        <div className={`rounded-xl p-6 transition-all duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Zap className="text-purple-500" size={20} />
            Engagement Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Login Score', value: personalEngagement.loginScore, icon: <Clock size={18} /> },
              { label: 'Time Score', value: personalEngagement.timeScore, icon: <Target size={18} /> },
              { label: 'Interaction Score', value: personalEngagement.interactionScore, icon: <Zap size={18} /> },
              { label: 'Consistency Score', value: personalEngagement.consistencyScore, icon: <Award size={18} /> },
            ].map((item) => (
              <div 
                key={item.label}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
              >
                <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </div>
                <div className={`mt-2 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
