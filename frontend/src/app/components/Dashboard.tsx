import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, TrendingUp, History, Settings, User, LogOut, Award, Target, Clock, FileText, Upload, CheckCircle } from 'lucide-react';
import { LogoIQ } from './Logo';
import ResumeAnalysis from './ResumeAnalysis';
import SettingsModal from './SettingsModal';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [showResumeAnalysis, setShowResumeAnalysis] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const interviewsRes = await fetch('/api/interviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (interviewsRes.ok) {
          const data = await interviewsRes.json();
          setRecentInterviews(data.interviews || []);
        }

        const resumesRes = await fetch('/api/resumes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resumesRes.ok) {
          const data = await resumesRes.json();
          if (data.resumes && data.resumes.length > 0) {
            setHasResume(true);
            setResumeData(data.resumes[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clearHistory = async () => {
    try {
      await Promise.all([
        fetch('/api/interviews/all', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/resumes/all', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      // Reset state
      setRecentInterviews([]);
      setHasResume(false);
      setResumeData(null);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (showResumeAnalysis) {
    return <ResumeAnalysis onClose={() => {
      setShowResumeAnalysis(false);
      setHasResume(true);
    }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIQ className="w-8 h-8" />
              <span className="text-xl font-bold text-[#06162B]">InterviewIQ</span>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 text-sm font-medium text-[#4F46E5] bg-indigo-50 rounded-lg"
              >
                Overview
              </button>
              <Link 
                to="/history"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                History
              </Link>
              <button 
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Settings
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.first_name || 'User'}</span>
              </button>
              <button onClick={() => logout()} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-[#06162B] via-[#0f1f35] to-[#1D4D7A] rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || 'User'}! 👋</h1>
              <p className="text-slate-300 text-lg">Ready to ace your next interview?</p>
            </div>
            <button
              onClick={() => navigate('/configure')}
              className="flex items-center gap-2 bg-[#4F46E5] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#4338CA] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5" />
              Start New Interview
            </button>
          </div>
        </div>

        {/* Resume Upload Card */}
        {!hasResume && (
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 rounded-2xl p-6 mb-6 border-2 border-[#4F46E5]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#06162B] mb-1">Upload Your Resume for AI Analysis</h3>
                  <p className="text-sm text-slate-600">Get personalized interview questions based on your experience and skills</p>
                </div>
              </div>
              <button
                onClick={() => setShowResumeAnalysis(true)}
                className="flex items-center gap-2 bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4338CA] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
            </div>
          </div>
        )}

        {/* Resume Insights Card */}
        {hasResume && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#06162B]">Resume Analyzed</h3>
                  <p className="text-sm text-slate-600">{resumeData?.file_name} • Score: {resumeData?.overall_score || 'N/A'}/100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowResumeAnalysis(true)}
                  className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
                >
                  View Full Analysis
                </button>
                <button 
                  onClick={() => setShowResumeAnalysis(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Update Resume
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-[#F8FAFC] rounded-lg">
                <div className="text-2xl font-bold text-[#06162B] mb-1">
                  {resumeData?.skills_detected?.total_detected || 0}
                </div>
                <div className="text-xs text-slate-600">Skills Found</div>
              </div>
              <div className="text-center p-3 bg-[#F8FAFC] rounded-lg">
                <div className="text-2xl font-bold text-[#06162B] mb-1">
                  {resumeData?.experience_data?.total_years || 0}
                </div>
                <div className="text-xs text-slate-600">Years Exp</div>
              </div>
              <div className="text-center p-3 bg-[#F8FAFC] rounded-lg">
                <div className="text-2xl font-bold text-[#06162B] mb-1">
                  {resumeData?.ats_score ? Math.round(resumeData.ats_score) + '%' : 'N/A'}
                </div>
                <div className="text-xs text-slate-600">ATS Score</div>
              </div>
              <div className="text-center p-3 bg-[#F8FAFC] rounded-lg">
                <div className="text-2xl font-bold text-[#06162B] mb-1">
                  {resumeData?.experience_data?.positions || 0}
                </div>
                <div className="text-xs text-slate-600">Roles/Companies</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div id="analytics-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 scroll-mt-24">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg">
                <Target className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-emerald-50 px-2.5 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-3xl font-bold text-[#06162B] mb-1">{recentInterviews.length}</div>
            <div className="text-sm text-slate-600">Mock Interviews Completed</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg">
                <Award className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-emerald-50 px-2.5 py-1 rounded-full">+5%</span>
            </div>
            <div className="text-3xl font-bold text-[#06162B] mb-1">
              {recentInterviews.length > 0
                ? Math.round(recentInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / recentInterviews.length) + '%'
                : 'N/A'}
            </div>
            <div className="text-sm text-slate-600">Avg. Confidence Score</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-sky-50 rounded-lg">
                <Clock className="w-6 h-6 text-[#1D4D7A]" />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">This month</span>
            </div>
            <div className="text-3xl font-bold text-[#06162B] mb-1">
              {Math.round(recentInterviews.reduce((acc, i) => acc + (i.duration_seconds || 0), 0) / 60)}m
            </div>
            <div className="text-sm text-slate-600">Total Practice Time</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div id="history-section" className="bg-white rounded-xl border border-slate-200 shadow-sm scroll-mt-24">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#06162B]">Recent Interview Sessions</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Clear All History
                </button>
                <Link to="/history" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">View All</Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentInterviews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                      No interviews yet. Start a new interview to see it here!
                    </td>
                  </tr>
                )}
                {recentInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(interview.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{interview.job_role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{interview.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[80px] h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4F46E5] rounded-full"
                            style={{ width: `${interview.score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-[#06162B]">{interview.score || 'N/A'}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        interview.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/results/${interview.id}`} className="text-[#4F46E5] hover:text-[#4338CA] font-medium">View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

        <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-[#06162B] mb-2">Clear All History?</h3>
            <p className="text-slate-600 text-center mb-6">
              Are you sure you want to delete all your resume analysis data and interview history? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearHistory}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-200"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
