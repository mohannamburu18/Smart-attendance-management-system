import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, isAdmin } from '../context/AuthContext';
import { getUsers, getAttendance, saveAttendance, generateId } from '../services/mockData';
import { calculateAttendancePercentage } from '../services/analytics';
import { User, AttendanceRecord, AttendanceStatus } from '../types';
import { format } from 'date-fns';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  UserCheck,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdminUser = user && isAdmin(user.role);

  // Load data on mount
  useEffect(() => {
    const allUsers = getUsers();
    const trackableUsers = allUsers.filter(u => u.role === 'student' || u.role === 'employee');
    setUsers(trackableUsers);
    setAttendance(getAttendance());
  }, []);

  // Get attendance for selected date
  const getAttendanceForDate = (userId: string) => {
    return attendance.find(a => a.userId === userId && a.date === selectedDate);
  };

  // Mark attendance
  const markAttendance = (userId: string, status: AttendanceStatus) => {
    if (!user) return;
    
    const existingRecord = getAttendanceForDate(userId);
    let newAttendance: AttendanceRecord[];
    
    if (existingRecord) {
      // Update existing record
      newAttendance = attendance.map(a => 
        a.id === existingRecord.id 
          ? { ...a, status, time: format(new Date(), 'HH:mm:ss'), markedBy: user.id }
          : a
      );
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: generateId(),
        userId,
        date: selectedDate,
        time: format(new Date(), 'HH:mm:ss'),
        status,
        markedBy: user.id,
      };
      newAttendance = [...attendance, newRecord];
    }
    
    setAttendance(newAttendance);
    saveAttendance(newAttendance);
    setMessage({ type: 'success', text: 'Attendance marked successfully!' });
    setTimeout(() => setMessage(null), 2000);
  };

  // Mark self attendance (for students/employees)
  const markSelfAttendance = () => {
    if (!user) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingRecord = attendance.find(a => a.userId === user.id && a.date === today);
    
    if (existingRecord) {
      setMessage({ type: 'error', text: 'You have already marked attendance for today!' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    const newRecord: AttendanceRecord = {
      id: generateId(),
      userId: user.id,
      date: today,
      time: format(new Date(), 'HH:mm:ss'),
      status: 'present',
      markedBy: user.id,
    };
    
    const newAttendance = [...attendance, newRecord];
    setAttendance(newAttendance);
    saveAttendance(newAttendance);
    setMessage({ type: 'success', text: 'Attendance marked successfully!' });
    setTimeout(() => setMessage(null), 2000);
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const record = getAttendanceForDate(u.id);
    if (filterStatus === 'present' || filterStatus === 'late') {
      return matchesSearch && record?.status === filterStatus;
    }
    if (filterStatus === 'absent') {
      return matchesSearch && (!record || record.status === 'absent');
    }
    return matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status?: AttendanceStatus) => {
    if (!status) {
      return {
        bg: isDark ? 'bg-gray-700' : 'bg-gray-100',
        text: isDark ? 'text-gray-400' : 'text-gray-500',
        label: 'Not Marked',
      };
    }
    
    switch (status) {
      case 'present':
        return {
          bg: isDark ? 'bg-green-900/30' : 'bg-green-100',
          text: isDark ? 'text-green-400' : 'text-green-700',
          label: 'Present',
        };
      case 'absent':
        return {
          bg: isDark ? 'bg-red-900/30' : 'bg-red-100',
          text: isDark ? 'text-red-400' : 'text-red-700',
          label: 'Absent',
        };
      case 'late':
        return {
          bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100',
          text: isDark ? 'text-yellow-400' : 'text-yellow-700',
          label: 'Late',
        };
    }
  };

  // Calculate today's stats
  const todayRecords = attendance.filter(a => a.date === selectedDate);
  const presentCount = todayRecords.filter(a => a.status === 'present').length;
  const absentCount = users.length - todayRecords.length + todayRecords.filter(a => a.status === 'absent').length;
  const lateCount = todayRecords.filter(a => a.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Attendance Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isAdminUser ? 'Mark and manage attendance for all users' : 'View and mark your attendance'}
          </p>
        </div>
        
        {/* Date Picker */}
        <div className="flex items-center gap-3">
          <Calendar className={isDark ? 'text-gray-400' : 'text-gray-500'} size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            disabled={!isAdminUser}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
            : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      {isAdminUser && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <UserCheck className={isDark ? 'text-blue-400' : 'text-blue-600'} size={20} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Check className={isDark ? 'text-green-400' : 'text-green-600'} size={20} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{presentCount}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <X className={isDark ? 'text-red-400' : 'text-red-600'} size={20} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Absent</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{absentCount}</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                <Clock className={isDark ? 'text-yellow-400' : 'text-yellow-600'} size={20} />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Late</p>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lateCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self Attendance for non-admin */}
      {!isAdminUser && (
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Mark Your Attendance
          </h2>
          
          {(() => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const todayRecord = attendance.find(a => a.userId === user?.id && a.date === today);
            
            if (todayRecord) {
              const badge = getStatusBadge(todayRecord.status);
              return (
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg ${badge.bg} ${badge.text}`}>
                    {badge.label} at {todayRecord.time}
                  </div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Your attendance for today has been recorded.
                  </p>
                </div>
              );
            }
            
            return (
              <button
                onClick={markSelfAttendance}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                <Check size={20} />
                Mark Present for Today
              </button>
            );
          })()}
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Your attendance rate (last 30 days): 
              <span className={`ml-2 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user ? calculateAttendancePercentage(user.id, 30) : 0}%
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Admin Attendance Table */}
      {isAdminUser && (
        <div className={`rounded-xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`} size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | 'all')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>User</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Department</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Rate (30d)</th>
                  <th className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((u) => {
                  const record = getAttendanceForDate(u.id);
                  const badge = getStatusBadge(record?.status);
                  const attendanceRate = calculateAttendancePercentage(u.id, 30);
                  
                  return (
                    <tr key={u.id} className={`transition-colors ${
                      isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            u.role === 'student' ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {u.name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {u.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-full rounded-full ${
                                attendanceRate >= 80 ? 'bg-green-500' : 
                                attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${attendanceRate}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {attendanceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => markAttendance(u.id, 'present')}
                            className={`p-2 rounded-lg transition-colors ${
                              record?.status === 'present'
                                ? 'bg-green-500 text-white'
                                : isDark 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-500 hover:text-white'
                            }`}
                            title="Mark Present"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => markAttendance(u.id, 'late')}
                            className={`p-2 rounded-lg transition-colors ${
                              record?.status === 'late'
                                ? 'bg-yellow-500 text-white'
                                : isDark 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-500 hover:text-white'
                            }`}
                            title="Mark Late"
                          >
                            <Clock size={18} />
                          </button>
                          <button
                            onClick={() => markAttendance(u.id, 'absent')}
                            className={`p-2 rounded-lg transition-colors ${
                              record?.status === 'absent'
                                ? 'bg-red-500 text-white'
                                : isDark 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                            }`}
                            title="Mark Absent"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No users found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
