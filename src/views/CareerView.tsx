import React, { useState, useEffect } from 'react';
import { Compass, Briefcase, BookOpen, Star, Target, CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

// Interfaces mapping to backend payloads
interface CareerRecommendation {
  career: string;
  compatibilityScore: number;
  explanation: string;
}

interface CareerTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
}

interface CareerPhase {
  id: string;
  title: string;
  description?: string;
  order: number;
  tasks: CareerTask[];
}

interface CareerRoadmap {
  id: string;
  targetCareer: string;
  currentLevel: string;
  phases: CareerPhase[];
}

interface CareerProfile {
  id: string;
  targetCareer?: string;
  interests: string[];
  preferredSubjects: string[];
  strengths: string[];
  workPreferences: string[];
  careerPreferences: string[];
  recommendations?: CareerRecommendation[];
}

// Data options for the wizard
const OPTIONS = {
  goals: ['Software Engineer', 'AI/ML Engineer', 'Data Scientist', 'Cybersecurity Engineer', 'Cloud Engineer', 'UI/UX Designer', 'Product Manager', 'Data Analyst', "I'm not sure yet"],
  interests: ['Artificial Intelligence', 'Programming', 'Web Development', 'Mobile Development', 'Cybersecurity', 'Data', 'Cloud Computing', 'Design', 'Business', 'Technology'],
  subjects: ['Mathematics', 'Data Structures', 'Python', 'DBMS', 'Software Engineering', 'Algorithms', 'Statistics', 'Human Computer Interaction', 'Machine Learning', 'I don\'t know'],
  strengths: ['Logical Thinking', 'Problem Solving', 'Programming', 'Mathematics', 'Communication', 'Creativity', 'Design', 'Leadership', 'Research', 'Analysis'],
  workStyles: ['Building things', 'Solving complex problems', 'Analyzing data', 'Designing interfaces', 'Researching', 'Working with people', 'Working independently', 'Creating products'],
  preferences: ['Remote', 'Office', 'Hybrid', 'High salary', 'Job stability', 'Innovation', 'Creativity', 'Work-life balance']
};

export const CareerView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);

  // Wizard State
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [goal, setGoal] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<string[]>([]);

  // Selection State for Target
  const [selectingTarget, setSelectingTarget] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/career/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data.profile);
      setRoadmap(data.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/career/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCareer: goal,
          interests,
          preferredSubjects: subjects,
          strengths,
          workPreferences: styles,
          careerPreferences: prefs
        })
      });
      if (res.ok) {
        await fetchProfile();
        setIsWizardActive(false);
        setSelectingTarget(true); // Jump directly to picking target
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectTargetCareer = async (careerName: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/career/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerName })
      });
      if (res.ok) {
        await fetchProfile();
        setSelectingTarget(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
      </div>
    );
  }

  // WIZARD RENDERER
  if (isWizardActive) {
    const renderWizardStep = () => {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold">What do you want to become?</h2>
              <p className="text-gray-500 text-sm">Select a primary goal, or choose "I'm not sure yet" if you want us to guide you.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {OPTIONS.goals.map(g => (
                  <button key={g} onClick={() => { setGoal(g); setCurrentStep(2); }} className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${goal === g ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <span className="font-semibold text-sm">{g}</span>
                    {goal === g && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </button>
                ))}
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold">What are you interested in?</h2>
              <p className="text-gray-500 text-sm">Select all that apply.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {OPTIONS.interests.map(i => {
                  const isSelected = interests.includes(i);
                  return (
                    <button key={i} onClick={() => toggleSelection(setInterests, i)} className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold">Which subjects do you enjoy the most?</h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {OPTIONS.subjects.map(i => {
                  const isSelected = subjects.includes(i);
                  return (
                    <button key={i} onClick={() => toggleSelection(setSubjects, i)} className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        case 4:
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold">What are your strongest skills?</h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {OPTIONS.strengths.map(i => {
                  const isSelected = strengths.includes(i);
                  return (
                    <button key={i} onClick={() => toggleSelection(setStrengths, i)} className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        case 5:
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold">What kind of work do you enjoy?</h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {OPTIONS.workStyles.map(i => {
                  const isSelected = styles.includes(i);
                  return (
                    <button key={i} onClick={() => toggleSelection(setStyles, i)} className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        case 6:
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold">Any specific career preferences?</h2>
              <div className="flex flex-wrap gap-2 mt-4">
                {OPTIONS.preferences.map(i => {
                  const isSelected = prefs.includes(i);
                  return (
                    <button key={i} onClick={() => toggleSelection(setPrefs, i)} className={`px-4 py-2 rounded-full border text-sm transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        case 7:
          return (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 py-12">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Ready to discover your matches?</h2>
              <p className="text-gray-500 max-w-md mx-auto">Campus OS will now analyze your interests, strengths, and academic history to find your best-fit careers.</p>
              <button 
                disabled={submitting} 
                onClick={submitAssessment}
                className="mt-8 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Profile'}
              </button>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {[1,2,3,4,5,6,7].map(step => (
              <div key={step} className={`h-1.5 rounded-full transition-all ${step <= currentStep ? 'bg-black' : 'bg-gray-200'} ${step === currentStep ? 'w-8' : 'w-4'}`} />
            ))}
          </div>
          <button onClick={() => setIsWizardActive(false)} className="text-sm font-semibold text-gray-400 hover:text-black">Cancel</button>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-10 shadow-sm min-h-[400px]">
          {renderWizardStep()}
        </div>

        {currentStep > 1 && currentStep < 7 && (
          <div className="flex justify-between mt-6">
            <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-2.5 rounded-full font-semibold text-gray-500 hover:bg-gray-100">Back</button>
            <button onClick={() => setCurrentStep(prev => prev + 1)} className="px-6 py-2.5 rounded-full font-semibold bg-black text-white hover:bg-gray-800 flex items-center gap-2">Next <ChevronRight className="w-4 h-4"/></button>
          </div>
        )}
      </div>
    );
  }

  // EMPTY STATE
  if (!profile && !selectingTarget) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 overflow-hidden">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Discover your best-fit career</h1>
        <p className="text-gray-500 max-w-lg mb-8">Tell Campus OS about your interests, strengths, and goals. We'll analyze your profile and generate a personalized roadmap to help you succeed.</p>
        <button onClick={() => setIsWizardActive(true)} className="bg-black text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2">
          Start Career Discovery
        </button>
      </div>
    );
  }

  // SELECT TARGET CAREER STATE
  if (selectingTarget && profile?.recommendations) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Career Matches</h1>
          <p className="text-gray-500">Based on your responses, these careers currently have the strongest compatibility.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.recommendations.map((rec, idx) => (
            <div key={rec.career} className={`bg-white border ${idx === 0 ? 'border-indigo-200 shadow-md ring-4 ring-indigo-50' : 'border-gray-100 shadow-sm'} rounded-[32px] p-6 flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  {idx === 0 && <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">Top Match</span>}
                  <h3 className="text-xl font-bold text-gray-900">{rec.career}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black tracking-tight text-indigo-600">{rec.compatibilityScore}%</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Match</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex-1 text-sm text-gray-700 whitespace-pre-line">
                {rec.explanation}
              </div>
              
              <button 
                disabled={submitting}
                onClick={() => selectTargetCareer(rec.career)}
                className={`w-full py-3.5 rounded-full font-bold transition-all ${idx === 0 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {submitting ? 'Generating...' : 'Build Roadmap'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // DASHBOARD / ROADMAP STATE
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Career Roadmap</h1>
          <p className="text-gray-500 text-sm mt-1">Your personalized path to becoming a <span className="font-semibold text-black">{roadmap?.targetCareer || 'Professional'}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setSelectingTarget(true)} className="px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Change Target
          </button>
          <button onClick={() => setIsWizardActive(true)} className="px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
            Retake Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold">Action Plan</h2>
          
          <div className="relative border-l-2 border-gray-100 ml-6 md:ml-4 pl-6 md:pl-8 space-y-12">
            {roadmap?.phases.map((phase, idx) => (
              <div key={phase.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[35px] md:-left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white ${idx === 0 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Phase {phase.order}</h3>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{phase.title}</h4>
                {phase.description && <p className="text-sm text-gray-500 mb-6">{phase.description}</p>}
                
                <div className="space-y-3">
                  {phase.tasks.map(task => (
                    <div key={task.id} className={`p-4 rounded-2xl border ${task.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'} shadow-sm flex gap-4 items-start`}>
                      <div className="pt-1">
                        {task.status === 'COMPLETED' 
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        }
                      </div>
                      <div>
                        <h5 className={`font-bold text-sm ${task.status === 'COMPLETED' ? 'text-emerald-900 line-through opacity-70' : 'text-gray-900'}`}>{task.title}</h5>
                        {task.description && (
                          <p className={`text-xs mt-1 ${task.status === 'COMPLETED' ? 'text-emerald-700 opacity-80' : 'text-gray-500'}`}>{task.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Profile Summary */}
        <div className="space-y-6">
          <div className="bg-black text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <img src="/logo.jpg" alt="Logo" className="w-24 h-24 object-cover rounded-full" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Target Career</h3>
            <h2 className="text-2xl font-black tracking-tight mb-6">{roadmap?.targetCareer}</h2>
            
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-300 mb-1">Campus OS Fit Score</div>
                  <div className="text-xl font-bold text-white">
                    {profile?.recommendations?.find(r => r.career === roadmap?.targetCareer)?.compatibilityScore || 85}%
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-indigo-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Your Profile Highlights</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Strengths</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.strengths.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700">{s}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.interests.map(i => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
