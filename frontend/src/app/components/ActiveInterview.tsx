import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, SkipForward, ChevronRight, Circle, Lightbulb, Bookmark, BookmarkCheck, Pause, Play, FileText, TrendingUp, Volume2, Clock, Award, Brain } from 'lucide-react';
import { LogoIQ } from './Logo';

export default function ActiveInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [interviewDetails, setInterviewDetails] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [questionNotes, setQuestionNotes] = useState('');
  const [voiceActivity, setVoiceActivity] = useState(0);
  const [isVoiceAssistEnabled, setIsVoiceAssistEnabled] = useState(true);
  
  // Interview control states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{score: number, feedback: string} | null>(null);
  const [totalInterviewTime, setTotalInterviewTime] = useState(0);
  const [isDictating, setIsDictating] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showStartScreenModal, setShowStartScreenModal] = useState(true);
  const [screenShareWarning, setScreenShareWarning] = useState(false);
  const [isScreenShareActive, setIsScreenShareActive] = useState(false);
  const [screenSharingReady, setScreenSharingReady] = useState(false);
  
  // Dynamic Real-time Metrics
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [speechClarity, setSpeechClarity] = useState(0);
  const [paceWPM, setPaceWPM] = useState(0);
  const [eyeContact, setEyeContact] = useState(100);
  const [fillerWords, setFillerWords] = useState<{count: number, words: string[]}>({ count: 0, words: [] });
  const recognitionRef = useRef<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        if (!isCameraOff) {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(activeStream);
        } else {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOff]);
  const requestScreenShare = async () => {
    try {
      // Explicitly unlock speech synthesis on user interaction (synchronously before async pause)
      if (window.speechSynthesis) {
        const unlockUtterance = new SpeechSynthesisUtterance('');
        unlockUtterance.volume = 0;
        window.speechSynthesis.speak(unlockUtterance);
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (!displayStream) {
        throw new Error('Screen capture permission denied');
      }

      const screenTrack = displayStream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => {
          setIsScreenShareActive(false);
          setScreenSharingReady(false);
          setScreenShareWarning(true);
          setIsPaused(true);
        };
      }

      setScreenStream(displayStream);
      setIsScreenShareActive(true);
      setShowStartScreenModal(false);
      setScreenShareWarning(false);
      setScreenSharingReady(true);
    } catch (error) {
      console.error('Error accessing screen share:', error);
      setScreenShareWarning(true);
      setScreenSharingReady(false);
      setShowStartScreenModal(true);
    }
  };

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setInterviewDetails(data.interview);
          const fetchedQuestions = data.interview.questions || [];
          setQuestions(fetchedQuestions);
          // Prioritize actual fetched length over the requested num_questions to prevent out-of-bounds crashes
          setTotalQuestions(fetchedQuestions.length > 0 ? fetchedQuestions.length : (data.interview.num_questions || 0));
        }
      } catch (error) {
        console.error('Error fetching interview:', error);
      }
    };
    if (id && token) {
      fetchInterview();
    }
  }, [id, token]);

  const playQuestionAudio = () => {
    if (questions.length > 0) {
      const currentQText = questions[currentQuestion - 1]?.question_text;
      if (currentQText) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const utterance = new SpeechSynthesisUtterance(currentQText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        
        // Ensure voice is loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
           const voice = voices.find(v => v.name.includes('Google US English') || v.lang.startsWith('en-')) || voices[0];
           if (voice) utterance.voice = voice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Voice Assistance Effect
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isVoiceAssistEnabled && questions.length > 0 && screenSharingReady && !isPaused) {
      // Add a 1 second delay to ensure all modal animations are finished and the page is fully interactive
      timeoutId = setTimeout(() => {
        playQuestionAudio();
      }, 1000);
    } else {
      window.speechSynthesis.cancel();
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, isVoiceAssistEnabled, questions, isPaused, screenSharingReady]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setWrittenAnswer((prev) => (prev + ' ' + transcript).trim());
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsDictating(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsDictating(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (!isPaused && screenSharingReady) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
        setTotalInterviewTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, screenSharingReady]);

  // Real-time metrics calculation
  useEffect(() => {
    if (!isPaused && screenSharingReady) {
      const calculateMetrics = () => {
        // Calculate Pace WPM based on writtenAnswer and timeElapsed
        const wordCount = writtenAnswer.trim().split(/\s+/).filter(w => w.length > 0).length;
        const minutes = timeElapsed > 0 ? timeElapsed / 60 : 1/60;
        const currentWPM = Math.min(250, Math.round(wordCount / minutes));
        setPaceWPM(wordCount === 0 ? 0 : currentWPM);

        // Detect Filler Words
        const fillerWordRegex = /\b(um|uh|like|you know|basically|actually|literally)\b/gi;
        const matches = writtenAnswer.match(fillerWordRegex) || [];
        const count = matches.length;
        const uniqueMatches = Array.from(new Set(matches.map(m => m.toLowerCase())));
        setFillerWords({ count, words: uniqueMatches });

        // Speech Clarity based on filler words
        const clarity = Math.max(0, 100 - (count * 5));
        setSpeechClarity(wordCount === 0 ? 0 : clarity);

        // Confidence Score based on pace and filler words (and evaluation if available)
        let conf = 100;
        if (wordCount > 0) {
           conf = Math.max(0, 100 - (count * 2) - (currentWPM < 100 || currentWPM > 160 ? 15 : 0));
        } else {
           conf = 0;
        }
        if (evaluationResult) {
           conf = evaluationResult.score;
        }
        setConfidenceScore(conf);

        // Simulate voice activity if not muted
        if (!isMuted) {
          setVoiceActivity(Math.random() * 100);
        } else {
          setVoiceActivity(0);
        }
      };

      const activityInterval = setInterval(calculateMetrics, 500);
      return () => clearInterval(activityInterval);
    }
  }, [isPaused, screenSharingReady, isMuted, writtenAnswer, timeElapsed, evaluationResult]);

  const cleanupMedia = () => {
    window.speechSynthesis.cancel();
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (screenStream) screenStream.getTracks().forEach(track => track.stop());
    setStream(null);
    setScreenStream(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Anti-Cheat: Tab change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isPaused && screenSharingReady) {
        setIsPaused(true);
        // Show an aggressive alert or custom modal (using native alert for immediate interruption)
        alert('ANTI-CHEAT WARNING: You have switched tabs or minimized the browser during an active interview. Your session has been paused.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused, screenSharingReady]);

  const submitAnswer = async () => {
    if (!questions.length) return null;
    
    const currentQ = questions[currentQuestion - 1];
    if (!currentQ) return null;

    try {
      const response = await fetch(`/api/interviews/${id}/questions/${currentQ.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answer_text: writtenAnswer,
          time_spent_seconds: timeElapsed,
          is_bookmarked: bookmarkedQuestions.includes(currentQuestion),
          notes: questionNotes
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      return null;
    }
  };

  const evaluateAnswer = async () => {
    if (!screenSharingReady) {
      setScreenShareWarning(true);
      return;
    }

    if (!writtenAnswer.trim()) return;
    setIsEvaluating(true);
    const result = await submitAnswer();
    setIsEvaluating(false);
    
    if (result && result.question) {
      const notes = result.question.notes || '';
      const aiFeedbackMatch = notes.match(/AI Evaluation:\s*(.*)/);
      const feedback = aiFeedbackMatch ? aiFeedbackMatch[1] : '';
      setEvaluationResult({
        score: result.question.confidence_score || 0,
        feedback: feedback
      });
    }
  };

  const completeInterview = async () => {
    await submitAnswer();
    try {
      await fetch(`/api/interviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'completed',
          duration_seconds: totalInterviewTime
        })
      });
    } catch (error) {
      console.error('Error completing interview:', error);
    }
    cleanupMedia();
    navigate(`/results/${id}`);
  };

  const handleNextQuestion = async () => {
    if (!screenSharingReady) {
      setScreenShareWarning(true);
      return;
    }

    await submitAnswer();
    
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeElapsed(0);
      setWrittenAnswer('');
      setQuestionNotes('');
      setShowHints(false);
      setEvaluationResult(null);
    } else {
      await completeInterview();
    }
  };

  const handleExitInterview = async () => {
    setShowExitModal(false);
    cleanupMedia();
    await completeInterview();
  };

  const handleSkipQuestion = async () => {
    if (!screenSharingReady) {
      setScreenShareWarning(true);
      return;
    }

    await submitAnswer();
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeElapsed(0);
      setWrittenAnswer('');
      setQuestionNotes('');
      setShowHints(false);
      setEvaluationResult(null);
    }
  };

  const toggleBookmark = () => {
    if (bookmarkedQuestions.includes(currentQuestion)) {
      setBookmarkedQuestions(bookmarkedQuestions.filter(q => q !== currentQuestion));
    } else {
      setBookmarkedQuestions([...bookmarkedQuestions, currentQuestion]);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };



  const hints = [
    "Use the STAR method: Situation, Task, Action, Result",
    "Be specific with examples from your experience",
    "Quantify your achievements with numbers when possible",
    "Keep your answer between 1-2 minutes",
    "Practice speaking clearly and at a moderate pace"
  ];

  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-[#06162B] flex flex-col">
      {(!screenSharingReady || screenShareWarning || showStartScreenModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-2xl text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4F46E5]/10 mx-auto mb-4">
                <Video className="w-8 h-8 text-[#4F46E5]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Screen Sharing Required</h2>
              <p className="text-slate-400">
                This interview requires screen sharing to prevent cheating. Please share your screen to continue.
              </p>
            </div>
            <div className="space-y-3 text-left text-slate-300">
              {screenShareWarning && (
                <div className="rounded-3xl bg-amber-500/10 border border-amber-400/20 p-4">
                  <p className="font-semibold text-amber-200">Warning:</p>
                  <p>If you decline or stop sharing your screen, the interview will pause until you start sharing again.</p>
                </div>
              )}
              <div className="rounded-3xl bg-slate-900/90 p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Your screen will be previewed during the interview and recording will continue only while it is active.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={requestScreenShare}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] transition-colors"
              >
                {screenShareWarning ? 'Resume Screen Share' : 'Start Interview'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-700 text-slate-200 hover:bg-slate-900 transition-colors"
              >
                Cancel and Return Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Progress Bar */}
      <div className="bg-[#0f1f35] border-b border-slate-700">
        <div className="h-1.5 bg-slate-700 relative">
          <div
            className="absolute inset-y-0 left-0 bg-[#4F46E5] transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIQ className="w-8 h-8" />
            <span className="text-white font-semibold">InterviewIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-300">
              Question <span className="font-semibold text-white">{currentQuestion}</span> of {totalQuestions}
            </div>
            <div className="text-sm text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time: <span className={`font-semibold ${timeElapsed > 120 ? 'text-orange-400' : 'text-white'}`}>{formatTime(timeElapsed)}</span>
            </div>
            {bookmarkedQuestions.length > 0 && (
              <div className="text-sm text-slate-300 flex items-center gap-1">
                <Bookmark className="w-4 h-4 fill-current text-[#4F46E5]" />
                <span>{bookmarkedQuestions.length} bookmarked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - AI Interviewer */}
        <div className="flex-1 bg-[#0f1f35] p-8 flex flex-col overflow-y-auto">
          {/* Pause Overlay */}
          {isPaused && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="bg-[#0f1f35] rounded-2xl p-8 border border-slate-600 text-center max-w-md">
                <Pause className="w-16 h-16 text-[#4F46E5] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Interview Paused</h3>
                <p className="text-slate-400 mb-6">Take your time. Resume when you're ready to continue.</p>
                <button
                  onClick={handlePauseResume}
                  className="flex items-center gap-2 bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4338CA] transition-all mx-auto"
                >
                  <Play className="w-5 h-5" />
                  Resume Interview
                </button>
              </div>
            </div>
          )}

          {showExitModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 py-10">
              <div className="w-full max-w-lg rounded-3xl bg-slate-950/95 border border-white/10 p-8 shadow-2xl text-center">
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-white">Exit Interview</h3>
                  <p className="mt-3 text-slate-400">If you exit now, your interview will be marked as completed and you'll see your analysis page.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  <button
                    onClick={handleExitInterview}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
                  >
                    Confirm Exit
                  </button>
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-700 text-slate-200 hover:bg-slate-900 transition-colors"
                  >
                    Keep Interview
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center">
            {/* AI Avatar */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-[#4F46E5] rounded-full flex items-center justify-center shadow-2xl">
                <Brain className="w-16 h-16 text-white" />
              </div>
              {isRecording && (
                <div className="absolute -bottom-2 -right-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center border-4 border-[#0f1f35]">
                      <Circle className="w-3 h-3 fill-current text-white" />
                    </div>
                    <div className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Status & Voice Visualization */}
            <div className="mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{isMuted ? 'Microphone muted' : 'AI is listening...'}</span>
                </div>
                {/* Voice Activity Bars */}
                {!isMuted && (
                  <div className="flex gap-1 h-12 items-end">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#4F46E5] rounded-full transition-all duration-100"
                        style={{
                          height: `${Math.max(10, (Math.sin(voiceActivity + i * 0.5) + 1) * 20)}px`,
                          opacity: 0.3 + (voiceActivity / 150)
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Question Display */}
            <div className="max-w-3xl w-full">
              <div className="bg-[#1D4D7A]/30 rounded-2xl p-8 border border-slate-600 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-[#4F46E5] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{currentQuestion}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Current Question</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-[#1D4D7A] text-slate-300 rounded-full">Behavioral</span>
                          <span className="text-xs px-2 py-0.5 bg-amber-900/50 text-amber-300 rounded-full">Medium</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xl text-white leading-relaxed">
                          {questions.length > 0 ? questions[currentQuestion - 1]?.question_text : "Loading questions..."}
                        </p>
                        <button 
                          onClick={playQuestionAudio}
                          className="p-2.5 bg-white/5 hover:bg-[#4F46E5]/20 text-[#4F46E5] hover:text-[#6366F1] rounded-full transition-colors shrink-0"
                          title="Read Question Aloud"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleBookmark}
                    className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {bookmarkedQuestions.includes(currentQuestion) ? (
                      <BookmarkCheck className="w-5 h-5 text-[#4F46E5] fill-current" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-slate-400 hover:text-[#4F46E5]" />
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showHints ? 'bg-[#4F46E5] text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showNotes ? 'bg-[#4F46E5] text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    {showNotes ? 'Hide Notes' : 'Show Notes'}
                  </button>
                </div>

                {/* Hints Section */}
                {showHints && (
                  <div className="mt-4 p-4 bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-[#4F46E5] mt-0.5" />
                      <div className="text-sm font-semibold text-indigo-300">Interview Tips</div>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-300 ml-6">
                      {hints.map((hint, index) => (
                        <li key={index} className="list-disc">{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick Notes */}
              {showNotes && (
                <div className="mt-4 bg-[#0f1f35]/50 rounded-2xl p-4 border border-slate-600 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-semibold text-white">Quick Notes</h4>
                  </div>
                  <textarea
                    value={questionNotes}
                    onChange={(e) => setQuestionNotes(e.target.value)}
                    placeholder="Jot down key points you want to mention..."
                    className="w-full h-20 px-3 py-2 bg-[#06162B] border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Written Answer Section */}
              <div className="mt-6 bg-[#0f1f35]/50 rounded-2xl p-6 border border-slate-600 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Written Answer (Optional)</h4>
                    <p className="text-xs text-slate-400">Type your response or speak naturally - both work!</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleDictation}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDictating ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#1D4D7A] text-white hover:bg-[#2a5a8f]'
                      }`}
                    >
                      {isDictating ? <Mic className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                      {isDictating ? 'Dictating...' : 'Dictate Answer'}
                    </button>
                    <div className="text-xs text-slate-500">
                      {writtenAnswer.length} / 5000 characters
                    </div>
                  </div>
                </div>
                <textarea
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value.slice(0, 5000))}
                  placeholder="Start typing your answer here... You can also use voice-only if you prefer."
                  className="w-full h-32 px-4 py-3 bg-[#06162B] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none transition-all"
                  maxLength={5000}
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span>Auto-saved</span>
                    </div>
                    {writtenAnswer.length > 0 && (
                      <button
                        onClick={() => setWrittenAnswer('')}
                        className="text-xs text-[#4F46E5] hover:text-[#6366F1] transition-colors"
                      >
                        Clear answer
                      </button>
                    )}
                  </div>
                  <button
                    onClick={evaluateAnswer}
                    disabled={isEvaluating || !writtenAnswer.trim()}
                    className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEvaluating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    {isEvaluating ? 'Evaluating...' : 'Evaluate Answer'}
                  </button>
                </div>
              </div>

              {/* Answer Quality Preview */}
              {evaluationResult && (
                <div className="mt-4 bg-[#0f1f35]/50 rounded-xl p-4 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm font-semibold text-white">AI Evaluation Result</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      evaluationResult.score >= 80 ? 'text-[#10B981]' :
                      evaluationResult.score >= 60 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {evaluationResult.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        evaluationResult.score >= 80 ? 'bg-[#10B981]' :
                        evaluationResult.score >= 60 ? 'bg-amber-400' : 'bg-slate-500'
                      }`}
                      style={{ width: `${evaluationResult.score}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed bg-[#06162B] p-3 rounded-lg border border-slate-700">
                    {evaluationResult.feedback || "No specific feedback provided. Keep practicing!"}
                  </div>
                </div>
              )}

              {/* Hint */}
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-400">💡 You can answer via voice, text, or both. The AI will analyze your complete response.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - User Video */}
        <div className="w-[400px] bg-[#06162B] p-6 border-l border-slate-700">
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-white font-semibold mb-1">Your Video</h3>
              <p className="text-xs text-slate-400">You can see yourself here during the interview</p>
            </div>

            {/* Video Feed */}
            <div className="flex-1 bg-[#0f1f35] rounded-xl overflow-hidden relative border-2 border-slate-700 shadow-xl">
              {!isCameraOff ? (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1f35] to-[#1D4D7A]">
                      <Video className="w-16 h-16 text-slate-600 mx-auto mb-3 animate-pulse" />
                      <p className="text-slate-500 text-sm">Accessing Camera...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#06162B] flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Camera is turned off</p>
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && !isCameraOff && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Circle className="w-2 h-2 fill-current text-white animate-pulse" />
                  <span className="text-white text-xs font-semibold">REC</span>
                </div>
              )}
            </div>

            {/* Screen Share Preview */}
            <div className="mt-4 bg-[#0f1f35] rounded-3xl p-4 border border-slate-700 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Screen Share</p>
                  <p className="text-sm text-slate-200">Live preview of your shared desktop</p>
                </div>
                <div className={`text-xs font-semibold ${isScreenShareActive ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {isScreenShareActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="h-28 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                {isScreenShareActive && screenStream ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                    Screen share preview unavailable
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Feedback Stats */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Real-time Feedback</div>

              <div className="bg-[#0f1f35] rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">Confidence</div>
                  <div className="text-sm font-bold text-[#10B981]">{Math.round(confidenceScore)}%</div>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full transition-all duration-300" style={{ width: `${confidenceScore}%` }}></div>
                </div>
              </div>

              <div className="bg-[#0f1f35] rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">Speech Clarity</div>
                  <div className="text-sm font-bold text-[#4F46E5]">{Math.round(speechClarity)}%</div>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-300" style={{ width: `${speechClarity}%` }}></div>
                </div>
              </div>

              <div className="bg-[#0f1f35] rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">Pace</div>
                  <div className="text-sm font-bold text-[#10B981]">
                    {paceWPM >= 130 && paceWPM <= 160 ? 'Optimal' : paceWPM > 0 ? (paceWPM < 130 ? 'Slow' : 'Fast') : 'N/A'}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{Math.round(paceWPM)} WPM (optimal: 130-160)</div>
              </div>

              <div className="bg-[#0f1f35] rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">Filler Words</div>
                  <div className="text-sm font-bold text-amber-500">{fillerWords.count}</div>
                </div>
                <div className="text-xs text-slate-500">
                  {fillerWords.words.length > 0 ? fillerWords.words.map(w => `"${w}"`).join(', ') : 'None detected'}
                </div>
              </div>

              <div className="bg-[#0f1f35] rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">Eye Contact</div>
                  <div className="text-sm font-bold text-[#10B981]">{Math.round(eyeContact)}%</div>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full transition-all duration-300" style={{ width: `${eyeContact}%` }}></div>
                </div>
              </div>

              {/* Resume-Based Insight */}
              <div className="bg-gradient-to-r from-emerald-900/30 to-sky-900/30 rounded-lg p-3 border border-emerald-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs font-semibold text-emerald-300">Resume Match</div>
                </div>
                <div className="text-xs text-slate-300">
                  This question aligns with your React experience at Google (2021-2023)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-[#0f1f35] border-t border-slate-700 px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-2 px-5 py-3 bg-[#1D4D7A] hover:bg-[#2a5a8f] text-white rounded-lg font-medium transition-all"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              <span className="text-sm">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all"
            >
              <VideoOff className="w-5 h-5" />
              <span className="text-sm">Exit Interview</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#1D4D7A] hover:bg-[#2a5a8f] text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                isCameraOff
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#1D4D7A] hover:bg-[#2a5a8f] text-white'
              }`}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              <span className="text-sm">{isCameraOff ? 'Turn On' : 'Turn Off'}</span>
            </button>

            <button
              onClick={() => setIsVoiceAssistEnabled(!isVoiceAssistEnabled)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                !isVoiceAssistEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#1D4D7A] hover:bg-[#2a5a8f] text-white'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">{isVoiceAssistEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>

            <button
              onClick={handleSkipQuestion}
              className="flex items-center gap-2 px-5 py-3 bg-[#1D4D7A] hover:bg-[#2a5a8f] text-white rounded-lg font-medium transition-all"
            >
              <SkipForward className="w-5 h-5" />
              <span className="text-sm">Skip</span>
            </button>
          </div>

          {/* Center - Question Info */}
          <div className="text-center">
            <div className="text-sm text-slate-400">
              Ready to move on? Submit your answer to continue
            </div>
          </div>

          {/* Right - Primary Action */}
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 bg-[#4F46E5] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-[#4338CA] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {currentQuestion < totalQuestions ? (
              <>
                Next Question
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Finish Interview
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
