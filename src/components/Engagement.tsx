import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, isAdmin } from '../context/AuthContext';
import { getUsers, getEngagement, saveEngagement, generateId } from '../services/mockData';
import { calculateEngagementScore } from '../services/analytics';
import { User, EngagementMetrics, EngagementScore } from '../types';
import { format } from 'date-fns';
import { 
  Zap, 
  MousePointer, 
  Clock, 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Send,
  FileCheck
} from 'lucide-react';

export const Engagement: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [engagementScores, setEngagementScores] = useState<EngagementScore[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [interactions, setInteractions] = useState(0);
  const [tasks, setTasks] = useState(0);
  const [responses, setResponses] = useState(0);

  const isAdminUser = user && isAdmin(user.role);

  // Load data and start session timer
  useEffect(() => {
    const allUsers = getUsers();
    const trackableUsers = allUsers.filter(u => u.role === 'student' || u.role === 'employee');
    setUsers(trackableUsers);
    
    // Calculate engagement scores for all trackable users
    const scores = trackableUsers.map(u => calculateEngagementScore(u.id, 30));
    setEngagementScores(scores);
    
    // Start session timer for current user
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Simulate interactions
  const simulateInteraction = (type: 'click' | 'task' | 'response') => {
    if (!user) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const allEngagement = getEngagement();
    
    // Find or create today's engagement record
    let todayRecord = allEngagement.find(e => e.userId === user.id && e.date === today);
    
    if (todayRecord) {
      // Update existing record
      const updatedEngagement = allEngagement.map(e => {
        if (e.id === todayRecord!.id) {
          return {
            ...e,
            interactionCount: e.interactionCount + (type === 'click' ? 1 : 0),
            tasksCompleted: e.tasksCompleted + (type === 'task' ? 1 : 0),
            responsesSubmitted: e.responsesSubmitted + (type === 'response' ? 1 : 0),
            timeSpentMinutes: e.timeSpentMinutes + 1,
          };
        }
        return e;
      });
      saveEngagement(updatedEngagement);
    } else {
      // Create new record
      const newRecord: EngagementMetrics = {
        id: generateId(),
        userId: user.id,
        date: today,
        loginCount: 1,
        timeSpentMinutes: sessionTime + 1,
        interactionCount: type === 'click' ? 1 : 0,
        tasksCompleted: type === 'task' ? 1 : 0,
        responsesSubmitted: type === 'response' ? 1 : 0,
      };
      saveEngagement([...allEngagement, newRecord]);
    }
    
    // Update local state
    if (type === 'click') setInteractions(prev => prev + 1);
    if (type === 'task') setTasks(prev => prev + 1);
    if (type === 'response') setResponses(prev => prev + 1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return isDark ? 'bg-green-900/30' : 'bg-green-100';
    if (score >= 60) return isDark ? 'bg-blue-900/30' : 'bg-blue-100';
    if (score >= 40) return isDark ? 'bg-yellow-900/30' : 'bg-yellow-100';
    return isDark ? 'bg-red-900/30' : 'bg-red-100';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'declining':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <Activity className={isDark ? 'text-gray-400' : 'text-gray-500'} size={16} />;
    }
  };

  // Sort users by engagement score
  const sortedScores = [...engagementScores].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Engagement Tracking
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {isAdminUser 
            ? 'Monitor user engagement metrics and identify patterns' 
            : 'Track your engagement and interact with the platform'}
        </p>
      </div>

      {/* Interaction Simulator for non-admin */}
      {!isAdminUser && (
        <div className={`rounded-xl p-6 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Zap className="text-purple-500" size={20} />
            Interactive Session
          </h2>
          
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Simulate engagement activities to increase your score. These interactions are tracked and contribute to your overall engagement metrics.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Session Time</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sessionTime} min
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Interactions</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {interactions}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tasks Done</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {tasks}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Send className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Responses</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {responses}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => simulateInteraction('click')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            >
              <MousePointer size={18} />
              Record Interaction
            </button>
            
            <button
              onClick={() => simulateInteraction('task')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileCheck size={18} />
              Complete Task
            </button>
            
            <button
              onClick={() => simulateInteraction('response')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Send size={18} />
              Submit Response
            </button>
          </div>
        </div>
      )}

      {/* Personal Engagement Score */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Overview */}
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Target className="text-indigo-500" size={20} />
              Your Engagement Score
            </h2>
            
            {(() => {
              const score = calculateEngagementScore(user.id, 30);
              return (
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${getScoreBg(score.overallScore)}`}>
                    <span className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
                      {score.overallScore}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {getTrendIcon(score.trend)}
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {score.trend === 'improving' ? 'Improving' : 
                       score.trend === 'declining' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {score.overallScore >= 80 ? 'Outstanding engagement! Keep it up!' :
                     score.overallScore >= 60 ? 'Good engagement. Room for improvement.' :
                     score.overallScore >= 40 ? 'Average engagement. Try to be more active.' :
                     'Low engagement. Consider participating more.'}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Score Breakdown */}
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Award className="text-yellow-500" size={20} />
              Score Breakdown
            </h2>
            
            {(() => {
              const score = calculateEngagementScore(user.id, 30);
              const metrics = [
                { label: 'Login Frequency', value: score.loginScore, icon: <Clock size={16} />, desc: 'How often you log in' },
                { label: 'Time Spent', value: score.timeScore, icon: <Target size={16} />, desc: 'Duration on platform' },
                { label: 'Interactions', value: score.interactionScore, icon: <Zap size={16} />, desc: 'Clicks and activities' },
                { label: 'Consistency', value: score.consistencyScore, icon: <TrendingUp size={16} />, desc: 'Regular participation' },
              ];
              
              return (
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{metric.icon}</span>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {metric.label}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                          {metric.value}
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            metric.value >= 80 ? 'bg-green-500' :
                            metric.value >= 60 ? 'bg-blue-500' :
                            metric.value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {metric.desc}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Admin: All Users Engagement Table */}
      {isAdminUser && (
        <div className={`rounded-xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              All Users Engagement
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Rank</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>User</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Overall</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Login</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Time</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Interaction</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedScores.map((score, index) => {
                  const u = users.find(usr => usr.id === score.userId);
                  
                  return (
                    <tr key={score.userId} className={`transition-colors ${
                      isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-indigo-500 to-purple-500`}>
                            {score.userName.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {score.userName}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {u?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(score.overallScore)}`}>
                            <span className={`text-lg font-bold ${getScoreColor(score.overallScore)}`}>
                              {score.overallScore}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {score.loginScore}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {score.timeScore}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {score.interactionScore}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(score.trend)}
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {score.trend}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
