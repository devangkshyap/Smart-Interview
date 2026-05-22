import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Award, Target, Clock, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ResultsSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [interview, setInterview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/interviews/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setInterview(data.interview);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id && token) {
      fetchResults();
    }
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Results not found</h2>
        <Link to="/dashboard" className="text-[#4F46E5] hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const parsedFeedback = (() => {
    if (!interview?.feedback) return null;
    try {
      const parsed = JSON.parse(interview.feedback);
      if (
        parsed &&
        (Array.isArray(parsed.good_points) || Array.isArray(parsed.bad_points) || Array.isArray(parsed.improvements))
      ) {
        return parsed;
      }
    } catch (e) {
      return null;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981] rounded-full mb-6 shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#06162B] mb-4">Interview Completed!</h1>
          <p className="text-xl text-slate-600">Great job. Here is your AI-generated feedback and score.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <Award className="w-8 h-8 text-[#4F46E5] mx-auto mb-3" />
            <div className="text-3xl font-bold text-[#06162B] mb-1">
              {Math.round((interview.questions?.reduce((acc: number, q: any) => acc + (q.confidence_score || 0), 0) || 0) / (interview.questions?.length || 1))}%
            </div>
            <div className="text-sm text-slate-500">Overall Score</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <Target className="w-8 h-8 text-[#10B981] mx-auto mb-3" />
            <div className="text-3xl font-bold text-[#06162B] mb-1">{interview.job_role}</div>
            <div className="text-sm text-slate-500">Role Focus</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <MessageSquare className="w-8 h-8 text-sky-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-[#06162B] mb-1">
              {interview.questions?.filter((q: any) => q.answer_text && q.answer_text.trim() !== '').length || 0}
            </div>
            <div className="text-sm text-slate-500">Questions Answered</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-[#06162B] mb-1">{formatTime(interview.duration_seconds || 0)}</div>
            <div className="text-sm text-slate-500">Total Duration</div>
          </div>
        </div>

        {/* Analysis Dashboard */}
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl shadow-2xl border border-white/70 backdrop-blur-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-7 h-7 text-[#4F46E5]" />
            <div>
              <h2 className="text-2xl font-bold text-[#06162B]">Analysis Dashboard</h2>
              <p className="text-sm text-slate-500">Your interview feedback has been organized into strengths, improvements and actionable advice.</p>
            </div>
          </div>

          {parsedFeedback ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">+</span>
                  <h3 className="text-lg font-semibold text-slate-900">Good Points</h3>
                </div>
                <ul className="space-y-3 text-slate-600">
                  {parsedFeedback.good_points?.length > 0 ? (
                    parsedFeedback.good_points.map((point: string, index: number) => (
                      <li key={index} className="rounded-2xl bg-slate-50 p-3 border border-slate-200">{point}</li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-400">No strengths were detected.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-500">-</span>
                  <h3 className="text-lg font-semibold text-slate-900">Areas for Improvement</h3>
                </div>
                <ul className="space-y-3 text-slate-600">
                  {parsedFeedback.bad_points?.length > 0 ? (
                    parsedFeedback.bad_points.map((point: string, index: number) => (
                      <li key={index} className="rounded-2xl bg-slate-50 p-3 border border-slate-200">{point}</li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-400">No areas for improvement were detected.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">→</span>
                  <h3 className="text-lg font-semibold text-slate-900">Actionable Advice</h3>
                </div>
                <ul className="space-y-3 text-slate-600">
                  {parsedFeedback.improvements?.length > 0 ? (
                    parsedFeedback.improvements.map((point: string, index: number) => (
                      <li key={index} className="rounded-2xl bg-slate-50 p-3 border border-slate-200">{point}</li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-400">No actionable advice was generated.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
              {interview.feedback ? (
                <p className="whitespace-pre-wrap leading-relaxed">{interview.feedback}</p>
              ) : (
                <p className="text-center text-slate-500">Your detailed feedback is being generated. Please check back in a few moments.</p>
              )}
            </div>
          )}
        </div>

        {/* Questions Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#06162B] mb-6">Question Breakdown</h2>
          <div className="space-y-6">
            {interview.questions?.map((q: any, index: number) => (
              <div key={q.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-semibold text-slate-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#06162B] mb-2">{q.question_text}</h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-3">
                      <p className="text-sm text-slate-600 font-medium mb-1">Your Answer:</p>
                      <p className="text-sm text-slate-700">{q.answer_text || <span className="italic text-slate-400">Skipped or voice-only</span>}</p>
                    </div>
                    {q.confidence_score !== null && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <span className="font-medium text-[#4F46E5]">Confidence Score:</span>
                        <span className={`font-bold ${q.confidence_score >= 80 ? 'text-emerald-500' : q.confidence_score >= 60 ? 'text-amber-500' : 'text-slate-500'}`}>{q.confidence_score}%</span>
                      </div>
                    )}
                    {q.notes && q.notes.includes('AI Evaluation:') && (
                      <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                        <p className="text-sm font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-500" />
                          AI Feedback:
                        </p>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                          {q.notes.split('AI Evaluation:').pop()?.trim()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Return to Dashboard
          </Link>
          <Link
            to="/configure"
            className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Start New Interview
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
