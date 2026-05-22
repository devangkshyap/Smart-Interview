import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Target, Award, ArrowRight, History as HistoryIcon, LogOut, ArrowLeft } from 'lucide-react';

export default function History() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/interviews?per_page=50', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInterviews(data.interviews || []);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#06162B] to-[#4F46E5]">
                Smart Interview
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
                <span className="text-sm font-semibold text-slate-600">
                  {user?.first_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <HistoryIcon className="w-8 h-8 text-[#4F46E5]" />
          <h1 className="text-3xl font-bold text-[#06162B]">Interview History</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {interviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {interviews.map((interview) => (
                <div key={interview.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#06162B] text-lg">{interview.job_role}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                          <HistoryIcon className="w-4 h-4" />
                          {formatDate(interview.created_at)}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatTime(interview.duration_seconds || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Score</div>
                      <div className="font-bold text-[#10B981] flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {Math.round(interview.score || 0)}%
                      </div>
                    </div>
                    <Link
                      to={`/results/${interview.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      View Analysis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#06162B] mb-2">No history found</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                You haven't completed any interviews yet. Start an interview to see your detailed analysis and history here.
              </p>
              <Link
                to="/configure"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-xl hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-200"
              >
                Start an Interview
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
