import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Check, Code, Mic, Camera, Users, Settings2, Play, AlertCircle, FileText, Upload, Trash2, CheckCircle, Search, Briefcase, Building2, MessageSquare, Sparkles } from 'lucide-react';
import { LogoIQ } from './Logo';

export default function InterviewConfiguration() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [useResumeData, setUseResumeData] = useState(true);

  const steps = [
    { number: 1, title: 'Interview Type' },
    { number: 2, title: 'Job Role' },
    { number: 3, title: 'Target Company' },
    { number: 4, title: 'Questions' },
  ];

  const jobRoles = [
    'Software Engineer',
    'Senior Software Engineer',
    'Data Analyst',
    'Data Scientist',
    'Product Manager',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'UX Designer',
    'Cyber Security',
    'Cloud Architect',
    'Data Engineer',
    'Machine Learning Engineer',
    'System Administrator',
    'Network Engineer',
    'Information Security Analyst'
  ];

  const companies = [
    { name: 'Google', logo: '🔍' },
    { name: 'Microsoft', logo: '🪟' },
    { name: 'Meta', logo: '📘' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Apple', logo: '🍎' },
    { name: 'Netflix', logo: '🎬' },
    { name: 'Tesla', logo: '⚡' },
    { name: 'Stripe', logo: '💳' },
    { name: 'Uber', logo: '🚗' },
    { name: 'Airbnb', logo: '🏠' },
    { name: 'Spotify', logo: '🎵' },
    { name: 'Palantir', logo: '👁️' },
    { name: 'OpenAI', logo: '🤖' },
    { name: 'Databricks', logo: '🧱' },
    { name: 'Snowflake', logo: '❄️' },
    { name: 'ByteDance', logo: '🎵' },
    { name: 'TCS', logo: '🏢' },
    { name: 'Infosys', logo: '🌐' },
    { name: 'Wipro', logo: '🌻' },
    { name: 'HCLTech', logo: '💻' },
    { name: 'Tech Mahindra', logo: '⚙️' },
    { name: 'Flipkart', logo: '🛒' },
    { name: 'Zomato', logo: '🛵' },
    { name: 'Swiggy', logo: '🍔' },
    { name: 'Paytm', logo: '₹' },
    { name: 'Ola', logo: '🚖' },
    { name: 'IBM', logo: '🖥️' },
    { name: 'Oracle', logo: '🗄️' },
    { name: 'Salesforce', logo: '☁️' },
    { name: 'Adobe', logo: '🎨' },
    { name: 'Nvidia', logo: '🎮' },
    { name: 'LinkedIn', logo: '👔' },
  ];

  const canProceed = () => {
    if (currentStep === 1) return interviewType !== null;
    if (currentStep === 2) return jobRole !== '';
    if (currentStep === 3) return company !== '';
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interview_type: interviewType,
          job_role: jobRole,
          company: company,
          num_questions: numQuestions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create interview');
      }

      const data = await response.json();
      navigate(`/interview/${data.interview.id}`);
    } catch (error) {
      console.error(error);
      alert('Error creating interview session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIQ className="w-8 h-8" />
              <span className="text-xl font-bold text-[#06162B]">InterviewIQ</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.number
                        ? 'bg-[#10B981] text-white'
                        : currentStep === step.number
                        ? 'bg-[#4F46E5] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= step.number ? 'text-[#06162B]' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-1 mx-2 mb-6 rounded transition-all ${
                      currentStep > step.number ? 'bg-[#10B981]' : 'bg-slate-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resume Integration Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-4 mb-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#06162B]">Resume Analysis Active</span>
                  <span className="px-2 py-0.5 bg-[#10B981] text-white text-xs rounded-full">Premium</span>
                </div>
                <p className="text-xs text-slate-600">Questions will be tailored to your 5.5 years experience and 18 technical skills</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useResumeData}
                onChange={(e) => setUseResumeData(e.target.checked)}
                className="w-4 h-4 text-[#4F46E5] border-slate-300 rounded focus:ring-[#4F46E5]"
              />
              <span className="text-sm font-medium text-slate-700">Use Resume Data</span>
            </label>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 min-h-[400px]">
          {/* Step 1: Interview Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#06162B] mb-2">Select Interview Type</h2>
                <p className="text-slate-600">Choose the type of interview you want to practice</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <button
                  onClick={() => setInterviewType('behavioral')}
                  className={`group relative p-8 rounded-xl border-2 transition-all ${
                    interviewType === 'behavioral'
                      ? 'border-[#1D4D7A] bg-sky-50 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all ${
                        interviewType === 'behavioral'
                          ? 'bg-[#1D4D7A]'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    >
                      <Users className={`w-8 h-8 ${interviewType === 'behavioral' ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#06162B] mb-2">HR / Behavioral Round</h3>
                    <p className="text-sm text-slate-600">
                      Practice answering behavioral questions, discussing your experience, and showcasing soft skills
                    </p>
                  </div>
                  {interviewType === 'behavioral' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#1D4D7A] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setInterviewType('technical')}
                  className={`group relative p-8 rounded-xl border-2 transition-all ${
                    interviewType === 'technical'
                      ? 'border-[#1D4D7A] bg-sky-50 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all ${
                        interviewType === 'technical'
                          ? 'bg-[#1D4D7A]'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    >
                      <Code className={`w-8 h-8 ${interviewType === 'technical' ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#06162B] mb-2">Technical / Coding Round</h3>
                    <p className="text-sm text-slate-600">
                      Practice technical questions, coding challenges, and system design discussions
                    </p>
                  </div>
                  {interviewType === 'technical' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#1D4D7A] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Job Role */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#06162B] mb-2">Select Your Target Role</h2>
                <p className="text-slate-600">What position are you interviewing for?</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for a role..."
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {jobRoles
                    .filter((role) => role.toLowerCase().includes(jobRole.toLowerCase()))
                    .map((role) => (
                      <button
                        key={role}
                        onClick={() => setJobRole(role)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                          jobRole === role
                            ? 'border-[#1D4D7A] bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            jobRole === role ? 'bg-[#1D4D7A]' : 'bg-slate-100'
                          }`}
                        >
                          <Briefcase className={`w-5 h-5 ${jobRole === role ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <span className="font-medium text-[#06162B]">{role}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Target Company */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#06162B] mb-2">Select Target Company</h2>
                <p className="text-slate-600">We'll tailor questions to match the company's interview style</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for a company..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {companies.map((comp) => (
                    <button
                      key={comp.name}
                      onClick={() => setCompany(comp.name)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                        company === comp.name
                          ? 'border-[#1D4D7A] bg-sky-50 shadow-lg'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-4xl">{comp.logo}</div>
                      <span className="font-medium text-[#06162B] text-sm">{comp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Number of Questions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#06162B] mb-2">How many questions?</h2>
                <p className="text-slate-600">Choose the length of your practice session</p>
              </div>

              <div className="max-w-xl mx-auto">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-600">Number of Questions</span>
                    <span className="text-2xl font-bold text-[#4F46E5]">{numQuestions}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="5"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[5, 10, 15].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumQuestions(num)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        numQuestions === num
                          ? 'border-[#1D4D7A] bg-sky-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-2xl font-bold text-[#06162B] mb-1">{num}</div>
                      <div className="text-xs text-slate-600">
                        {num === 5 ? 'Quick' : num === 10 ? 'Standard' : 'Extended'}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-[#F8FAFC] rounded-xl p-6 border border-slate-200">
                  <h3 className="font-semibold text-[#06162B] mb-4">Interview Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Type:</span>
                      <span className="text-sm font-medium text-[#06162B]">
                        {interviewType === 'behavioral' ? 'HR / Behavioral' : 'Technical / Coding'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Role:</span>
                      <span className="text-sm font-medium text-[#06162B]">{jobRole}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Company:</span>
                      <span className="text-sm font-medium text-[#06162B]">{company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Questions:</span>
                      <span className="text-sm font-medium text-[#06162B]">{numQuestions} questions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#10B981] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-[#059669] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <MessageSquare className="w-5 h-5" />
              )}
              {isLoading ? 'Setting up...' : 'Launch AI Interview'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
