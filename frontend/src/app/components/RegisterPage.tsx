import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Chrome, Zap, Target, Award } from 'lucide-react';
import { LogoIQ } from './Logo';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const parts = name.trim().split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name,
          last_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.user, data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#06162B] via-[#0f1f35] to-[#1D4D7A] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center mb-6">
            <LogoIQ className="w-20 h-20" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">InterviewIQ</h1>
          <p className="text-xl text-slate-300 mb-8">
            Master your interview skills with AI-powered practice sessions
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12 text-left">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-[#2dd4bf]" />
              </div>
              <div className="text-sm font-semibold text-white mb-1">AI Parsing</div>
              <div className="text-xs text-slate-400">Smart ATS scoring</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div className="text-sm font-semibold text-white mb-1">Dynamic Mocks</div>
              <div className="text-xs text-slate-400">Tailored questions</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div className="text-sm font-semibold text-white mb-1">Live Feedback</div>
              <div className="text-xs text-slate-400">Actionable insights</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center mb-4">
              <LogoIQ className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold text-[#06162B]">InterviewIQ</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#06162B] mb-2">Create an account</h2>
            <p className="text-slate-600">Start your interview prep journey today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-11 pr-4 py-3 bg-[#F1F5F9] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4F46E5] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
