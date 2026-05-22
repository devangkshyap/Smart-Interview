import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Award, Briefcase, GraduationCap, Code, X, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ResumeAnalysisProps {
  onClose?: () => void;
  embedded?: boolean;
}

interface ResumeAnalysisData {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  improvements: string[];
  skills: {
    technical: string[];
    soft: string[];
    detected?: number;
    matched?: number;
    total_detected?: number;
    total_matched?: number;
  };
  experience: {
    totalYears: number;
    positions: number;
    companies: string[];
  };
  keywords: {
    found?: string[] | number;
    missing: string[];
    matched?: string[];
    total_found?: number;
    total_missing?: number;
  };
}

export default function ResumeAnalysis({ onClose, embedded = false }: ResumeAnalysisProps) {
  const { token } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);

  const uploadFileToBackend = async (file: File) => {
    setIsAnalyzing(true);
    setUploadedFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        // Fetch full details
        const fullResponse = await fetch(`http://127.0.0.1:5000/api/resumes/${data.resume.id}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fullResponse.ok) {
           const fullData = await fullResponse.json();
           setAnalysis({
             overallScore: fullData.resume.overall_score ?? 0,
             atsScore: fullData.resume.ats_score ?? 0,
             strengths: fullData.resume.strengths || ['Strong technical skills'],
             improvements: fullData.resume.improvements || ['Add more action verbs'],
             skills: fullData.resume.skills_detected || {
               technical: [], soft: [], detected: 0, matched: 0
             },
             experience: {
               totalYears: fullData.resume.experience_data?.total_years ?? fullData.resume.experience_data?.totalYears ?? 0,
               positions: fullData.resume.experience_data?.positions ?? 0,
               companies: fullData.resume.experience_data?.companies ?? []
             },
             keywords: fullData.resume.keywords || {
               found: [], missing: [], total_found: 0, total_missing: 0
             }
           });
           setAnalysisComplete(true);
        }
      } else {
        alert("Error uploading resume.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error uploading resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFileToBackend(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.txt'))) {
      uploadFileToBackend(file);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    setAnalysis(null);
  };

  if (!embedded && !uploadedFile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4F46E5] rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#06162B] mb-2">AI Resume Analysis</h1>
            <p className="text-slate-600">Upload your resume for instant AI-powered feedback and insights</p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-[#4F46E5] transition-all cursor-pointer group"
          >
            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4 group-hover:text-[#4F46E5] transition-colors" />
            <h3 className="text-lg font-semibold text-[#06162B] mb-2">Drop your resume here</h3>
            <p className="text-slate-600 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center gap-2 bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Choose File
            </label>
            <p className="text-xs text-slate-500 mt-4">Supports PDF, DOC, DOCX (Max 5MB)</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <TrendingUp className="w-8 h-8 text-[#4F46E5] mx-auto mb-2" />
              <div className="text-sm font-medium text-[#06162B]">ATS Score</div>
              <div className="text-xs text-slate-600">Optimize for systems</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <Award className="w-8 h-8 text-[#4F46E5] mx-auto mb-2" />
              <div className="text-sm font-medium text-[#06162B]">Skill Analysis</div>
              <div className="text-xs text-slate-600">Match job requirements</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <Sparkles className="w-8 h-8 text-[#4F46E5] mx-auto mb-2" />
              <div className="text-sm font-medium text-[#06162B]">AI Insights</div>
              <div className="text-xs text-slate-600">Personalized tips</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`${embedded ? '' : 'min-h-screen'} bg-[#F8FAFC] flex items-center justify-center p-6`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#4F46E5] rounded-full mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#06162B] mb-2">Analyzing Your Resume...</h3>
          <p className="text-slate-600 mb-4">Our AI is reviewing your experience and skills</p>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (analysisComplete && analysis) {
    return (
      <div className={`${embedded ? '' : 'min-h-screen'} bg-[#F8FAFC] ${embedded ? '' : 'p-6'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          {!embedded && (
            <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#06162B]">{uploadedFile?.name}</h2>
                    <p className="text-sm text-slate-600">{(uploadedFile?.size || 0 / 1024).toFixed(1)} KB • Analyzed just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                  <button
                    onClick={resetAnalysis}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New
                  </button>
                  {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-slate-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-[#06162B] via-[#0f1f35] to-[#1D4D7A] rounded-2xl p-8 mb-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Overall Resume Score</h3>
                <p className="text-slate-300 text-sm">Based on industry standards and ATS optimization</p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10B981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.overallScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute">
                    <div className="text-4xl font-bold">{analysis.overallScore}</div>
                    <div className="text-sm text-slate-300">/ 100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg font-bold text-[#06162B]">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {analysis.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full mt-2"></div>
                    <span className="text-sm text-slate-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-[#06162B]">Suggested Improvements</h3>
              </div>
              <ul className="space-y-3">
                {analysis.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-sm text-slate-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Skills Analysis */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="font-bold text-[#06162B]">Skills Detected</h3>
              </div>
              <div className="text-3xl font-bold text-[#06162B] mb-1">{analysis.skills.total_detected || analysis.skills.detected || 0}</div>
              <div className="text-sm text-slate-600 mb-4">{analysis.skills.total_matched || analysis.skills.matched || 0} matched to job market</div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 mb-1">Technical Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {(analysis.skills.technical || []).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-indigo-50 text-[#4F46E5] text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-[#1D4D7A]" />
                <h3 className="font-bold text-[#06162B]">Experience</h3>
              </div>
              <div className="text-3xl font-bold text-[#06162B] mb-1">{analysis.experience.totalYears} yrs</div>
              <div className="text-sm text-slate-600 mb-4">{analysis.experience.positions} positions</div>
              <div className="space-y-1">
                {(analysis.experience.companies || []).map((company: string, index: number) => (
                  <div key={index} className="text-xs text-slate-600 flex items-center gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    {company}
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Compatibility */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
                <h3 className="font-bold text-[#06162B]">ATS Score</h3>
              </div>
              <div className="text-3xl font-bold text-[#06162B] mb-1">{analysis.atsScore}%</div>
              <div className="text-sm text-slate-600 mb-4">Applicant Tracking System</div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all"
                  style={{ width: `${analysis.atsScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Keywords Analysis */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#06162B]">Keyword Analysis</h3>
              <span className="text-sm text-slate-600">{analysis.keywords.total_found || (Array.isArray(analysis.keywords.found) ? analysis.keywords.found.length : analysis.keywords.found) || 0} keywords found</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-[#10B981] mb-2">✓ Matched Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(analysis.keywords.found) ? analysis.keywords.found : analysis.keywords.matched || []).map((keyword: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-emerald-50 text-[#10B981] text-sm rounded-lg border border-emerald-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-600 mb-2">⚠ Missing Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {(analysis.keywords.missing || []).map((keyword: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-amber-50 text-amber-600 text-sm rounded-lg border border-amber-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
