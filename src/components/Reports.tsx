import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, isAdmin } from '../context/AuthContext';
import { generateReport, exportReportAsJSON, exportReportAsCSV } from '../services/analytics';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Calendar,
  FileJson,
  FileSpreadsheet,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

type ReportType = 'daily' | 'weekly' | 'monthly';

export const Reports: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [selectedType, setSelectedType] = useState<ReportType>('weekly');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ReturnType<typeof generateReport> | null>(null);

  const isAdminUser = user && isAdmin(user.role);

  const handlePreview = () => {
    const report = generateReport(selectedType);
    setPreviewData(report);
    setShowPreview(true);
  };

  const handleExportJSON = () => {
    exportReportAsJSON(selectedType);
  };

  const handleExportCSV = () => {
    exportReportAsCSV(selectedType);
  };

  const getConsistencyIcon = (level: string) => {
    switch (level) {
      case 'consistent':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'irregular':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'at-risk':
        return <AlertTriangle className="text-orange-500" size={16} />;
      case 'dropped-off':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  const getConsistencyBadge = (level: string) => {
    const styles = {
      consistent: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      irregular: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      'at-risk': isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
      'dropped-off': isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    };
    return styles[level as keyof typeof styles] || styles.irregular;
  };

  if (!isAdminUser) {
    return (
      <div className={`rounded-xl p-8 text-center ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
      }`}>
        <FileText className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Reports
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Report generation is only available for administrators, teachers, and HR managers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Reports
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Generate and download attendance and engagement reports
        </p>
      </div>

      {/* Report Generator */}
      <div className={`rounded-xl p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Calendar className="text-indigo-500" size={20} />
          Generate Report
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Report Type
            </label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setShowPreview(false); }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePreview}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isDark 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye size={18} />
            Preview Report
          </button>
          
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
          >
            <FileJson size={18} />
            Download JSON
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && previewData && (
        <div className={`rounded-xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          {/* Preview Header */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {previewData.type} Report Preview
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Period: {previewData.period.start} to {previewData.period.end}
                </p>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Generated: {format(new Date(previewData.generatedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {previewData.summary.totalUsers}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average Attendance</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {previewData.summary.averageAttendance}%
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average Engagement</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {previewData.summary.averageEngagement}
              </p>
            </div>
          </div>

          {/* User Data Table */}
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
                  }`}>Attendance</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Engagement</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.userStats.map((stat) => (
                  <tr key={stat.userId} className={`transition-colors ${
                    isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {stat.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stat.email}
                        </p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {stat.department}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-full rounded-full ${
                              stat.attendancePercentage >= 80 ? 'bg-green-500' : 
                              stat.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stat.attendancePercentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {stat.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${stat.engagementScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {stat.engagementScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        getConsistencyBadge(stat.consistencyLevel)
                      }`}>
                        {getConsistencyIcon(stat.consistencyLevel)}
                        <span className="capitalize">{stat.consistencyLevel.replace('-', ' ')}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Reports (placeholder) */}
      <div className={`rounded-xl p-6 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Download className="text-green-500" size={20} />
          Quick Export Options
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['daily', 'weekly', 'monthly'] as ReportType[]).map((type) => (
            <div 
              key={type}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h3 className={`font-medium capitalize mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {type} Report
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {type === 'daily' && 'Last 24 hours data'}
                {type === 'weekly' && 'Last 7 days data'}
                {type === 'monthly' && 'Last 30 days data'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReportAsJSON(type)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => exportReportAsCSV(type)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
