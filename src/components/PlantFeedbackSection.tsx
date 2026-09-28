import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  ThumbsUp, 
  Award, 
  Clock, 
  User, 
  Filter, 
  HeartHandshake, 
  Check, 
  TrendingUp, 
  Tag,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { CustomerFeedbackItem, FeedbackCategory } from '../types';
import { saveCustomerFeedbackToFirestore, subscribeToCustomerFeedback } from '../lib/firestoreService';
import { soundFx, triggerHaptic } from '../utils/notificationHelpers';

const INITIAL_FEEDBACK_ITEMS: CustomerFeedbackItem[] = [
  {
    id: 'fb-alwar-01',
    rating: 5,
    category: 'warranty_experience',
    categoryLabel: 'Sensor Hardware & Warranty',
    authorName: 'Harshit Sharma',
    authorRole: 'Plant Operations Director',
    facilityName: 'Plant Alpha · Alwar Manufacturing Hub',
    userEmail: 'harshit998ops@gmail.com',
    npsScore: 10,
    tags: ['⚡ Instant Hot-Swap Dispatch', '⏱️ Saved Downtime Hours', '🛡️ Zero Deductible'],
    feedbackMessage: 'The 3-Year Extended Sensor Warranty with Overnight Hot-Swap dispatch is unparalleled. When an accelerometer on our heavy CNC lathe showed thermal drift, a brand new replacement arrived before our morning shift began. Zero downtime achieved.',
    timestamp: '2 days ago',
    verified: true,
    officialReply: {
      author: 'Dr. Rajeshwari Menon',
      role: 'Chief Metrologist, MachineMind Support',
      message: 'Thank you Harshit! Our rapid-courier hub in Rajasthan guarantees sub-12 hour delivery for all critical sensor probes.',
      timestamp: '1 day ago',
    },
  },
  {
    id: 'fb-sanand-02',
    rating: 5,
    category: 'sensor_accuracy',
    categoryLabel: 'Sensor Telemetry & Accuracy',
    authorName: 'Ananya Deshmukh',
    authorRole: 'VP Reliability Engineering',
    facilityName: 'Plant Beta · Sanand EV Mega-Plant',
    userEmail: 'ananya.d@evpowertrain.in',
    npsScore: 10,
    tags: ['🎯 Accurate Bearing Anomaly Forecast', '🔊 Crystal Clear FFT', '📈 ISO 10816 Zone A'],
    feedbackMessage: 'The physics-guided neural net predicted bearing raceway spalling on Hydraulic Pump 02 exactly 18 days before audible noise started. We scheduled a planned changeout during routine weekend maintenance.',
    timestamp: '4 days ago',
    verified: true,
    officialReply: {
      author: 'Vikram "Vik" Rathore',
      role: 'Lead Mechanical Specialist',
      message: 'Excellent preventive catch Ananya! Catching spalls in ISO Zone B prevents spindle seizure and costly stator rewinds.',
      timestamp: '3 days ago',
    },
  },
  {
    id: 'fb-pune-03',
    rating: 5,
    category: 'technician_service',
    categoryLabel: 'Technician Calling & Dispatch',
    authorName: 'Vikramaditya Rao',
    authorRole: 'Chief Mechanical Engineer',
    facilityName: 'Plant Gamma · Pune Heavy Machinery Bay',
    userEmail: 'v.rao@puneheavymachinery.com',
    npsScore: 9,
    tags: ['🛠️ Helpful On-Duty Technicians', '📞 Fast Radio Dispatch', '📄 Easy ISO PDF Calibration'],
    feedbackMessage: 'Being able to call certified reliability technicians directly from the dashboard and dispatch them with pre-calculated shaft alignment directives is a game changer for our plant technicians.',
    timestamp: '1 week ago',
    verified: true,
  },
  {
    id: 'fb-chakan-04',
    rating: 5,
    category: 'feature_request',
    categoryLabel: 'Feature Request & Integrations',
    authorName: 'Rajesh Kulkarni',
    authorRole: 'Senior Electrical Drives Lead',
    facilityName: 'Chakan MIDC Phase 2 Hub',
    userEmail: 'rajesh.k@chakanstamping.com',
    npsScore: 10,
    tags: ['💡 SCADA PLC Safety Relay', '⚡ Fast RMA Dispatch'],
    feedbackMessage: 'The newly unlocked SCADA / PLC Emergency Safety Trip and ISO 17025 PDF certificates on Plant Pro give us everything required for our ISO audits without needing external consultants.',
    timestamp: '2 weeks ago',
    verified: true,
    officialReply: {
      author: 'MachineMind Reliability Team',
      role: 'Product Engineering',
      message: 'We are thrilled you are enjoying the SCADA Safety Relay and ISO 17025 verification slips on Plant Pro!',
      timestamp: '1 week ago',
    },
  },
];

const QUICK_TAG_OPTIONS = [
  '⚡ Instant Hot-Swap Dispatch',
  '🎯 Accurate Bearing Anomaly Forecast',
  '🛡️ Zero Deductible Warranty',
  '📱 Responsive Mobile Dashboard',
  '🛠️ Helpful On-Duty Technicians',
  '⏱️ Saved Downtime Hours',
  '🔊 Crystal Clear FFT Waveforms',
  '📄 Easy ISO PDF Calibration Export',
  '💡 Requesting Extra SCADA Protocols',
  '🤝 Fast Customer Support Response',
];

const CATEGORY_OPTIONS: { id: FeedbackCategory; label: string; icon: string }[] = [
  { id: 'warranty_experience', label: 'Sensor Warranty & Hot-Swap RMA', icon: '🛡️' },
  { id: 'sensor_accuracy', label: 'Sensor Telemetry & Precision', icon: '🎯' },
  { id: 'technician_service', label: 'Technician Support & Dispatch', icon: '🛠️' },
  { id: 'app_usability', label: 'App Dashboard & Usability', icon: '📱' },
  { id: 'feature_request', label: 'Feature Request / Idea', icon: '💡' },
  { id: 'general', label: 'General Plant Experience', icon: '🏭' },
];

export const PlantFeedbackSection: React.FC = () => {
  const { themeConfig } = useTheme();
  const { user } = useAuth();
  const { activeFacility, planTier } = usePlan();

  const [feedbackList, setFeedbackList] = useState<CustomerFeedbackItem[]>(INITIAL_FEEDBACK_ITEMS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('warranty_experience');
  const [npsScore, setNpsScore] = useState<number>(10);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⚡ Instant Hot-Swap Dispatch',
    '🎯 Accurate Bearing Anomaly Forecast',
  ]);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(user?.name || 'Harshit Sharma');
  const [authorRole, setAuthorRole] = useState<string>(
    user?.role || 'Plant Operations Director'
  );
  const [userEmail, setUserEmail] = useState<string>(user?.email || 'harshit998ops@gmail.com');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  // Subscribe to real-time Firestore feedback updates if available
  useEffect(() => {
    const unsubscribe = subscribeToCustomerFeedback((remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        // Merge without duplicating
        setFeedbackList((prev) => {
          const merged = [...remoteItems];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleToggleTag = (tag: string) => {
    triggerHaptic(10);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    triggerHaptic([30, 50, 30]);

    const catObj = CATEGORY_OPTIONS.find((c) => c.id === category) || CATEGORY_OPTIONS[0];

    const newFeedback: CustomerFeedbackItem = {
      id: `fb-${Date.now()}`,
      rating,
      category,
      categoryLabel: catObj.label,
      authorName: authorName.trim() || 'Plant Engineer',
      authorRole: authorRole.trim() || 'Plant Lead',
      facilityName: activeFacility.name,
      userEmail: userEmail.trim() || 'plant-ops@machinemind.internal',
      npsScore,
      tags: selectedTags,
      feedbackMessage: feedbackText.trim(),
      timestamp: 'Just now',
      verified: true,
      officialReply: {
        author: 'Dr. Rajeshwari Menon',
        role: 'Chief Reliability Lead, MachineMind',
        message: 'Thank you for your valuable feedback! Our engineering team reviews every plant submission to continually improve sensor telemetry & support.',
        timestamp: 'Just now',
      },
    };

    // Save to Firestore asynchronously
    try {
      await saveCustomerFeedbackToFirestore(newFeedback);
    } catch {
      // Local fallback continues gracefully
    }

    setFeedbackList((prev) => [newFeedback, ...prev]);
    setIsSubmitting(false);
    setFeedbackText('');
    
    soundFx.playSuccessChime();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#10b981', '#38bdf8', '#fbbf24'],
    });

    setSubmitSuccessNotice(
      `🎉 Thank you, ${authorName.split(' ')[0]}! Your feedback has been registered and shared with the MachineMind Reliability Engineering desk.`
    );
    setTimeout(() => setSubmitSuccessNotice(null), 8000);
  };

  const filteredFeedbacks = feedbackList.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterRating !== 'all' && item.rating !== filterRating) return false;
    return true;
  });

  const ratingDescriptions: Record<number, string> = {
    5: '⭐⭐⭐⭐⭐ 5/5 · Outstanding Precision & Zero Downtime',
    4: '⭐⭐⭐⭐ 4/5 · Very Good & Highly Reliable',
    3: '⭐⭐⭐ 3/5 · Good · Meets Expectations',
    2: '⭐⭐ 2/5 · Fair · Needs Some Improvements',
    1: '⭐ 1/5 · Poor · Requires Attention',
  };

  const averageRating = (
    feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / (feedbackList.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Success Notification Alert */}
      {submitSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="leading-relaxed">{submitSuccessNotice}</p>
          </div>
          <button
            onClick={() => setSubmitSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Satisfaction KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{averageRating}</span>
              <span className="text-xs text-slate-500">/ 5.0</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Average Plant CSAT</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-700 font-mono">98.6%</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Warranty RMA Resolution</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 font-mono">&lt; 15 min</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Engineer On-Call Response</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-purple-700 font-mono">+94 NPS</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Net Promoter Score</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Feedback Form (Left) & Verified Reviews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Interactive Feedback Submission Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass}`}>
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Share Your Experience & Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Help us refine hardware warranty policies, telemetry accuracy & support.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            {/* 1. Star Rating Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        triggerHaptic(15);
                        setRating(star);
                      }}
                      className="p-1 rounded-xl hover:scale-115 transition-transform cursor-pointer"
                      aria-label={`Rate ${star} Stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isActive
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-semibold text-slate-600 mt-1">
                {ratingDescriptions[hoverRating || rating]}
              </p>
            </div>

            {/* 2. Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setCategory(cat.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-left text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                      category === cat.id
                        ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} ${themeConfig.textClass} shadow-2xs font-bold`
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Quick Tag Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Quick Highlight Tags (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? `${themeConfig.primaryClass} text-white font-bold shadow-2xs`
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Detailed Feedback / Comments */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Your Suggestions / Comments</span>
                <span className="text-[10px] font-mono text-slate-400">{feedbackText.length} characters</span>
              </div>
              <textarea
                rows={4}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your sensor reliability, hot-swap claim experience, or feature requests..."
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            {/* 5. NPS Recommendation Scale */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Recommendation Likelihood (NPS)</span>
                <span className="font-mono font-bold text-sky-600">{npsScore} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={npsScore}
                onChange={(e) => setNpsScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Unlikely)</span>
                <span>5 (Neutral)</span>
                <span>10 (Extremely Likely)</span>
              </div>
            </div>

            {/* 6. Author Details Pre-filled Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Role / Title</label>
                <input
                  type="text"
                  required
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !feedbackText.trim()}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Feedback...' : 'Submit Plant Feedback'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Verified Plant Feedback & Testimonials Stream */}
        <div className="lg:col-span-6 space-y-4">
          {/* Header & Filter Controls */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Verified Plant Reviews & Insights</span>
              </h3>
              <p className="text-[11px] text-slate-500">Real feedback from operating plant reliability teams</p>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>
          </div>

          {/* Feedback Items Stream */}
          <div className="space-y-3.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredFeedbacks.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No feedback matching your selected filter</p>
                <p className="text-[11px] text-slate-400">Try choosing "All Categories" or be the first to submit!</p>
              </div>
            ) : (
              filteredFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                          {item.rating}.0
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="font-extrabold text-xs text-slate-900 mt-1 flex items-center gap-1.5">
                        <span>{item.authorName}</span>
                        <span className="text-[10px] font-normal text-slate-500">({item.authorRole})</span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{item.facilityName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {item.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono mt-1">{item.timestamp}</div>
                    </div>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    "{item.feedbackMessage}"
                  </p>

                  {/* Highlight Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Official Engineering Reply if present */}
                  {item.officialReply && (
                    <div className="mt-2 p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-sky-950 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          <span>Response from {item.officialReply.author} ({item.officialReply.role})</span>
                        </span>
                        <span className="text-[10px] text-sky-600 font-mono font-normal">
                          {item.officialReply.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-900 leading-relaxed">
                        {item.officialReply.message}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
