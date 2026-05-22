import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, FileText, Upload, Loader2, Mail, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeResumeName, setActiveResumeName] = useState<string | null>(null);
  const [useAIParsing, setUseAIParsing] = useState(true);
  const [successToast, setSuccessToast] = useState('');

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  useEffect(() => {
    if (token) {
      fetch('http://127.0.0.1:5000/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.resumes && data.resumes.length > 0) {
          const primary = data.resumes.find((r: any) => r.is_primary) || data.resumes[0];
          setActiveResumeName(primary.file_name);
        } else {
          setActiveResumeName(null);
        }
      })
      .catch(err => console.error("Error fetching resumes:", err));
    }
  }, [token]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setActiveResumeName(data.resume.file_name);
      showToast('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-[#06162B]">Your Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        
        {successToast && (
          <div className="fixed top-24 right-6 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-lg text-sm font-medium animate-in slide-in-from-top-2 shadow-sm flex items-center gap-2 z-50">
            <CheckCircle className="w-4 h-4" />
            {successToast}
          </div>
        )}

        {/* User Info Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center gap-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#06162B] mb-1">
              {user?.first_name} {user?.last_name}
            </h2>
            <div className="flex items-center text-slate-600 gap-2 mb-4">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-[#4F46E5]">
              Standard Plan
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resume Vault */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <h3 className="text-lg font-bold text-[#06162B]">Resume Vault</h3>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <FileText className={`w-12 h-12 mx-auto mb-4 ${activeResumeName ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
              {activeResumeName ? (
                <div>
                  <p className="text-[#06162B] font-medium mb-1">Active Resume</p>
                  <p className="text-sm text-slate-600 mb-6 truncate max-w-xs mx-auto" title={activeResumeName}>{activeResumeName}</p>
                </div>
              ) : (
                <p className="text-slate-600 mb-6">No active resume found.</p>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`px-6 py-3 bg-[#4F46E5] text-white font-medium rounded-xl hover:bg-[#4338CA] transition-all inline-flex items-center gap-2 shadow-sm ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {isUploading ? 'Uploading...' : (activeResumeName ? 'Upload New Resume' : 'Upload PDF / DOCX')}
              </button>
            </div>

            <div className="flex items-center justify-between mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div>
                <h5 className="font-semibold text-emerald-900 text-sm">AI Resume Parsing</h5>
                <p className="text-xs text-emerald-700">Auto-extract skills to tailor interviews</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={useAIParsing} onChange={() => setUseAIParsing(!useAIParsing)} />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <h3 className="text-lg font-bold text-[#06162B]">Career Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Job Title</label>
                <select className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none transition-shadow">
                  <option>Software Engineer</option>
                  <option>Senior Software Engineer</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>Product Manager</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>DevOps Engineer</option>
                  <option>UX Designer</option>
                  <option>Cyber Security</option>
                  <option>Cloud Architect</option>
                  <option>Data Engineer</option>
                  <option>Machine Learning Engineer</option>
                  <option>System Administrator</option>
                  <option>Network Engineer</option>
                  <option>Information Security Analyst</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">This helps us tailor your mock interview questions.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level</label>
                <select className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none transition-shadow">
                  <option>Junior (0-2 years)</option>
                  <option>Mid-Level (3-5 years)</option>
                  <option>Senior (6+ years)</option>
                  <option>Lead / Manager</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => showToast('Preferences saved successfully!')} className="px-6 py-2.5 bg-[#06162B] text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                  Save Preferences
                </button>
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
