import React, { useState, useRef, useEffect } from 'react';
import { 
  X, User, Cpu, Shield, Settings2, FileText, Upload, 
  Mic, Camera, AlertTriangle, Download, Trash2, Sliders, MonitorPlay, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'ai' | 'hardware' | 'privacy';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  
  // Local state for UI toggles (these would connect to a backend/context in a full implementation)
  const [useAIParsing, setUseAIParsing] = useState(true);
  const [interviewMode, setInterviewMode] = useState<'voice' | 'text'>('voice');
  const [aiPersona, setAiPersona] = useState('supportive');
  const [feedbackDetail, setFeedbackDetail] = useState(75);
  const [antiCheating, setAntiCheating] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  if (!isOpen) return null;

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      showToast('Microphone is working perfectly!');
    } catch (err) {
      showToast('Microphone access denied or not found.');
    }
  };

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      showToast('Camera is working perfectly!');
    } catch (err) {
      showToast('Camera access denied or not found.');
    }
  };

  const renderTabNavigation = () => (
    <div className="w-1/3 bg-slate-50 p-6 border-r border-slate-200">
      <h3 className="text-xl font-bold text-[#06162B] mb-6">Settings</h3>
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab('ai')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
            activeTab === 'ai' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Cpu className="w-5 h-5" />
          AI Environment
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
            activeTab === 'hardware' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MonitorPlay className="w-5 h-5" />
          Hardware & Setup
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
            activeTab === 'privacy' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Shield className="w-5 h-5" />
          Account & Privacy
        </button>
      </nav>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h4 className="text-lg font-bold text-[#06162B] mb-4">AI Interviewer Persona</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'supportive', title: 'Supportive', desc: 'Gives hints and guides you' },
            { id: 'strict', title: 'Strict FAANG', desc: 'Rigid, highly technical, no hints' },
            { id: 'behavioral', title: 'Leadership', desc: 'Focuses heavily on soft skills' }
          ].map(persona => (
            <div 
              key={persona.id}
              onClick={() => setAiPersona(persona.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${aiPersona === persona.id ? 'border-[#4F46E5] bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className="font-semibold text-[#06162B] mb-1">{persona.title}</div>
              <div className="text-xs text-slate-600">{persona.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
        <h4 className="font-semibold text-[#06162B] mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[#4F46E5]" /> Interview Mode
        </h4>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setInterviewMode('voice')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${interviewMode === 'voice' ? 'bg-white shadow-sm text-[#06162B]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Voice Mode (Speech-to-Text)
          </button>
          <button 
            onClick={() => setInterviewMode('text')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${interviewMode === 'text' ? 'bg-white shadow-sm text-[#06162B]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Text Mode (Typing)
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-bold text-[#06162B] mb-4">Feedback Detail Level</h4>
        <div className="px-2">
          <input 
            type="range" 
            min="0" max="100" 
            value={feedbackDetail}
            onChange={(e) => setFeedbackDetail(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>Quick Score</span>
            <span>Balanced</span>
            <span>Deep-Dive Analysis</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button onClick={() => showToast('AI settings saved!')} className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors shadow-sm">Save Changes</button>
      </div>
    </div>
  );

  const renderHardwareTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Ensure your browser has permissions for camera and microphone access before starting an interview.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Mic className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h5 className="font-semibold text-[#06162B]">Microphone</h5>
              <p className="text-xs text-slate-500">Default - System Audio</p>
            </div>
          </div>
          <button onClick={testMicrophone} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Test</button>
        </div>

        <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Camera className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h5 className="font-semibold text-[#06162B]">Camera</h5>
              <p className="text-xs text-slate-500">Integrated Webcam</p>
            </div>
          </div>
          <button onClick={testCamera} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Test</button>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h4 className="text-lg font-bold text-[#06162B] mb-4">Proctoring Settings</h4>
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <h5 className="font-semibold text-slate-900">Anti-Cheating Controls</h5>
            <p className="text-sm text-slate-600 mt-1">Enable tab-change detection and eye-tracking for official practice runs</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={antiCheating} onChange={() => setAntiCheating(!antiCheating)} />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h4 className="text-lg font-bold text-[#06162B] mb-2">Export Data</h4>
        <p className="text-sm text-slate-600 mb-4">Download a complete archive of all your past interview transcripts, scores, and AI feedback.</p>
        <button onClick={() => showToast('Data export started. Check your downloads shortly.')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-[#06162B] font-medium rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
          <Download className="w-4 h-4" />
          Export as JSON/PDF
        </button>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h4>
        <p className="text-sm text-slate-600 mb-4">Wipe your past AI transcripts and scores for a completely fresh start. This action cannot be undone.</p>
        <div className="p-5 border border-red-200 bg-red-50 rounded-xl flex items-center justify-between">
          <div>
            <h5 className="font-semibold text-red-900">Clear Interview History</h5>
            <p className="text-xs text-red-700">Delete all records permanently</p>
          </div>
          <button onClick={() => {
            if(window.confirm('Are you absolutely sure you want to delete all interview history?')) {
               showToast('Interview history cleared.');
            }
          }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex overflow-hidden h-[600px] transform animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Sidebar */}
        {renderTabNavigation()}

        {/* Right Content Area */}
        <div className="w-2/3 p-8 overflow-y-auto relative bg-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {successToast && (
            <div className="absolute top-6 right-20 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-medium animate-in slide-in-from-top-2">
              {successToast}
            </div>
          )}

          <div className="mt-2 h-full">
            {activeTab === 'ai' && renderAITab()}
            {activeTab === 'hardware' && renderHardwareTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
          </div>
        </div>
        
      </div>
    </div>
  );
}
