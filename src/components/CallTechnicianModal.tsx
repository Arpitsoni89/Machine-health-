import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  MessageSquare,
  Wrench,
  AlertOctagon,
  ArrowRight,
  Send
} from 'lucide-react';
import { TechnicianInfo } from '../types';
import confetti from 'canvas-confetti';

interface CallTechnicianModalProps {
  technician: TechnicianInfo;
  isOpen: boolean;
  onClose: () => void;
  onDispatchToBay?: (technician: TechnicianInfo, bayNotes: string) => void;
}

export const CallTechnicianModal: React.FC<CallTechnicianModalProps> = ({
  technician,
  isOpen,
  onClose,
  onDispatchToBay,
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [transcript, setTranscript] = useState<{ sender: 'tech' | 'user'; text: string; time: string }[]>([]);
  const [customReplyText, setCustomReplyText] = useState('');

  // Call simulation lifecycle
  useEffect(() => {
    if (!isOpen) {
      setCallStatus('connecting');
      setCallDuration(0);
      setTranscript([]);
      return;
    }

    const t1 = setTimeout(() => {
      setCallStatus('ringing');
    }, 800);

    const t2 = setTimeout(() => {
      setCallStatus('connected');
      setTranscript([
        {
          sender: 'tech',
          text: `MachineMind Support, ${technician.name} speaking. I'm active on ${technician.radioChannel}. Which machine or bay needs assistance?`,
          time: '00:01',
        },
      ]);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, technician]);

  // Call timer
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleQuickResponse = (userPrompt: string, techResponse: string) => {
    const timeStr = formatTimer(callDuration);
    setTranscript((prev) => [
      ...prev,
      { sender: 'user', text: userPrompt, time: timeStr },
    ]);

    setTimeout(() => {
      setTranscript((prev) => [
        ...prev,
        { sender: 'tech', text: techResponse, time: formatTimer(callDuration + 1) },
      ]);
    }, 800);
  };

  const handleSendCustomText = () => {
    if (!customReplyText.trim()) return;
    const textToSend = customReplyText;
    setCustomReplyText('');

    const timeStr = formatTimer(callDuration);
    setTranscript((prev) => [
      ...prev,
      { sender: 'user', text: textToSend, time: timeStr },
    ]);

    setTimeout(() => {
      setTranscript((prev) => [
        ...prev,
        {
          sender: 'tech',
          text: `Copy that loud and clear. I have logged "${textToSend}" onto our shift clipboard and I am on standby for immediate physical intervention.`,
          time: formatTimer(callDuration + 1),
        },
      ]);
    }, 1000);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleConfirmDispatch = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    if (onDispatchToBay) {
      onDispatchToBay(technician, `Direct Voice Dispatch confirmed with ${technician.name} via Support Hotline.`);
    }
    handleEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caller Header Card */}
        <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/80 text-center relative">
          <div className="relative inline-block mb-3">
            <img
              src={technician.avatar}
              alt={technician.name}
              className={`w-20 h-20 rounded-full object-cover border-4 border-slate-700 shadow-xl mx-auto ${
                callStatus === 'connected' ? 'ring-4 ring-emerald-500/40' : 'animate-pulse'
              }`}
            />
            {callStatus === 'connected' && (
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-white">
            {technician.name}
          </h3>
          <p className="text-xs text-sky-400 font-medium">
            {technician.role}
          </p>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="font-mono text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
              {technician.badgeId}
            </span>
            <span className="font-mono text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Radio className="w-3 h-3 text-sky-400" />
              <span>{technician.radioChannel}</span>
            </span>
          </div>

          {/* Status / Call Duration Indicator */}
          <div className="mt-3">
            {callStatus === 'connecting' && (
              <span className="text-xs font-semibold text-slate-400 animate-pulse">
                Initiating VoIP Connection to Plant Floor...
              </span>
            )}
            {callStatus === 'ringing' && (
              <span className="text-xs font-semibold text-amber-400 flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>Ringing Technician Device ({technician.phone})...</span>
              </span>
            )}
            {callStatus === 'connected' && (
              <span className="text-xs font-extrabold text-emerald-400 font-mono flex items-center justify-center gap-1.5 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full w-max mx-auto shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Call Active · {formatTimer(callDuration)}</span>
              </span>
            )}
            {callStatus === 'ended' && (
              <span className="text-xs font-bold text-rose-400">
                Call Ended · Logged in CMMS
              </span>
            )}
          </div>
        </div>

        {/* Live Audio Transcript & Dialogue Box */}
        <div className="p-4 sm:p-5 flex-1 max-h-[300px] overflow-y-auto space-y-3 bg-slate-950/50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Encrypted VoIP Audio Feed & Auto-Transcription
          </div>

          {transcript.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-xs'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                  <span className="font-bold">{item.sender === 'user' ? 'You (Plant Operations)' : technician.name}</span>
                  <span className="font-mono">{item.time}</span>
                </div>
                <div>{item.text}</div>
              </div>
            </div>
          ))}

          {callStatus === 'connected' && (
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Radio Directives:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  onClick={() =>
                    handleQuickResponse(
                      "High vibration on Main Extruder Motor (#4). Need bearing grease inspection.",
                      "Understood! High vibration indicates bearing cage or lubrication starvation. I am grabbing my grease gun and laser alignment kit now. ETA 4 mins!"
                    )
                  }
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left text-sky-300 font-semibold transition cursor-pointer flex items-center justify-between"
                >
                  <span>1. "High vibration on Extruder Motor #4 — inspect bearing"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>

                <button
                  onClick={() =>
                    handleQuickResponse(
                      "Thermal temperature alarm on Hydraulic Pump. Need fluid pressure verification.",
                      "Copy! I will inspect the suction strainer for pump cavitation and verify oil reservoir temperature. En route right now."
                    )
                  }
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left text-sky-300 font-semibold transition cursor-pointer flex items-center justify-between"
                >
                  <span>2. "Thermal warning on Hydraulic Pump — check cavitation"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>

                <button
                  onClick={() =>
                    handleQuickResponse(
                      "Scheduling routine maintenance inspection for the upcoming shift change.",
                      "Affirmative. I have scheduled that machine on the alpha shift rotation. Will check mounting bolt torque and sensor cables."
                    )
                  }
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left text-sky-300 font-semibold transition cursor-pointer flex items-center justify-between"
                >
                  <span>3. "Schedule routine inspection for shift change"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={customReplyText}
                  onChange={(e) => setCustomReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCustomText()}
                  placeholder="Speak or type custom message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
                />
                <button
                  onClick={handleSendCustomText}
                  className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Call In-Call Controls Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                !isSpeakerOn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isSpeakerOn ? 'Speaker ON' : 'Speaker OFF'}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {callStatus === 'connected' && (
              <button
                onClick={handleConfirmDispatch}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Dispatch to Bay</span>
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
