import React, { useState } from 'react';
import {
  X,
  Bot,
  Cpu,
  Users,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Server,
  Activity,
  Sliders,
  Flame,
} from 'lucide-react';

interface AiAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  userEmail?: string;
}

export const AiAutomationModal: React.FC<AiAutomationModalProps> = ({
  isOpen,
  onClose,
  language,
  userEmail = '',
}) => {
  const [autoScaleEnabled, setAutoScaleEnabled] = useState(true);
  const [aiModerationEnabled, setAiModerationEnabled] = useState(true);
  const [cdnCachingEnabled, setCdnCachingEnabled] = useState(true);
  const [recommendationAiEnabled, setRecommendationAiEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center text-xl shadow-md shadow-pink-500/20">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {language === 'hi' ? 'करोड़ों यूज़र्स और AI ऑटो-हैंडलिंग सिस्टम' : 'Million Users & AI Auto-Handling Architecture'}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  100% AUTOMATED
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'जानें कि लाखों-करोड़ों यूज़र्स को mytube का ऑटोमेटेड क्लाउड और AI कैसे संभालता है'
                  : 'How Google Cloud & AI handle millions of concurrent users without manual work'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800 dark:text-gray-200">
          {/* Quick Direct Answer Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/30 flex items-start gap-3.5">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                {language === 'hi'
                  ? 'सीधा जवाब: आपको एक-एक यूज़र को मैनुअल हैंडल नहीं करना पड़ेगा!'
                  : 'Direct Answer: You DO NOT have to handle users manually!'}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'YouTube या Instagram जैसे बड़े ऐप्स में कोई इंसान एक-एक यूज़र को नहीं देखता। mytube में सारा ट्रैफिक, वीडियो स्ट्रीमिंग, डेटाबेस और कमेंट्स Google Cloud Serverless और AI ऑटोमैटिक 24x7 हैंडल करते हैं।'
                  : 'Like YouTube and Instagram, all traffic, stream encoding, and database queries scale automatically via Google Cloud serverless architecture and AI bots 24x7.'}
              </p>
            </div>
          </div>

          {/* 3 Pillars Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {language === 'hi' ? 'कौन सा सिस्टम क्या काम करता है?' : 'System Division of Labor'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. AI System */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-pink-600 dark:text-pink-400">
                    <Bot className="w-5 h-5" />
                    <span className="font-bold text-xs">{language === 'hi' ? '1. AI व बॉट्स (ऑटोमेटेड)' : '1. AI & Bots (Automated)'}</span>
                  </div>
                  <ul className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                    <li>{language === 'hi' ? 'स्पैम और बॉट कमेंट्स ऑटो-फ़िल्टर' : 'Auto-filter spam & bot comments'}</li>
                    <li>{language === 'hi' ? 'ग़लत/अनुचित वीडियो का ऑटो-डिटेक्शन' : 'Auto-detect unsafe/copyrighted videos'}</li>
                    <li>{language === 'hi' ? 'पर्सनलाइज़्ड वीडियो रिकमेंडेशन (Feed)' : 'Personalized recommendation algorithm'}</li>
                    <li>{language === 'hi' ? 'वीडियो क्वालिटी ऑटो-एडजस्ट (1080p, 720p)' : 'Adaptive video bitrate transcoding'}</li>
                  </ul>
                </div>
                <span className="inline-block mt-3 text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full w-fit">
                  {language === 'hi' ? 'Zero Manual Work' : 'Zero Manual Effort'}
                </span>
              </div>

              {/* 2. Google Cloud Infrastructure */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                    <Server className="w-5 h-5" />
                    <span className="font-bold text-xs">{language === 'hi' ? '2. क्लाउड इंफ्रास्ट्रक्चर' : '2. Cloud Infrastructure'}</span>
                  </div>
                  <ul className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                    <li>{language === 'hi' ? '1 से 10 करोड़ यूज़र्स पर ऑटो-स्केलिंग' : 'Auto-scales to 10M+ concurrent users'}</li>
                    <li>{language === 'hi' ? 'सर्वर कभी क्रैश या डाउन नहीं होता' : 'Zero downtime & serverless resilience'}</li>
                    <li>{language === 'hi' ? 'ग्लोबल CDN से बिना बफरिंग वीडियो लोड' : 'Instant buffer-free streaming via CDN'}</li>
                    <li>{language === 'hi' ? 'फ़ायरस्टोर में रियल-टाइम डेटा सिंक' : 'Real-time database sync in Firestore'}</li>
                  </ul>
                </div>
                <span className="inline-block mt-3 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full w-fit">
                  {language === 'hi' ? 'Auto-Scalable' : 'Auto-Scaling Active'}
                </span>
              </div>

              {/* 3. Your Role as Founder */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300/40 dark:border-amber-700/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                    <span className="text-base">👑</span>
                    <span className="font-bold text-xs">{language === 'hi' ? '3. आपका रोल (Founder)' : '3. Your Role (Founder)'}</span>
                  </div>
                  <ul className="text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5 list-disc list-inside">
                    <li>{language === 'hi' ? 'डैशबोर्ड से प्लेटफ़ॉर्म ग्रोथ देखना' : 'Monitor high-level growth & analytics'}</li>
                    <li>{language === 'hi' ? 'नए क्रिएटर्स और फीचर्स लॉन्च करना' : 'Launch creator programs & features'}</li>
                    <li>{language === 'hi' ? 'पॉलिसी व रूल्स तय करना' : 'Set platform policies & community rules'}</li>
                    <li>{language === 'hi' ? 'रेवेन्यू और मोनेटाइजेशन संभालना' : 'Manage revenue & monetization streams'}</li>
                  </ul>
                </div>
                <span className="inline-block mt-3 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full w-fit">
                  {language === 'hi' ? 'Master Decision Maker' : 'Platform Owner'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Simulated Automated Metrics */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-100 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>{language === 'hi' ? 'लाइव ऑटो-हैंडलिंग मेट्रिक्स' : 'Live Auto-Handling Metrics'}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {language === 'hi' ? '● ऑल सिस्टम्स नॉर्मल (99.99% अपटाइम)' : '● All Systems Operational (99.99% Uptime)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800">
                <p className="text-[10px] text-gray-400">{language === 'hi' ? 'कॉन्करेंट कैपेसिटी' : 'Concurrent Capacity'}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">10M+ Users</p>
                <p className="text-[9px] text-emerald-500 font-medium">Auto-Scalable</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800">
                <p className="text-[10px] text-gray-400">{language === 'hi' ? 'AI स्पैम शील्ड' : 'AI Spam Shield'}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">Active</p>
                <p className="text-[9px] text-pink-500 font-medium">Bot Defense On</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800">
                <p className="text-[10px] text-gray-400">{language === 'hi' ? 'डेटाबेस क्वेरीज़' : 'Database Queries'}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">&lt; 15ms</p>
                <p className="text-[9px] text-purple-500 font-medium">Ultra Fast</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800">
                <p className="text-[10px] text-gray-400">{language === 'hi' ? 'क्लाउड बफरिंग' : 'Cloud Latency'}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">0.2s Avg</p>
                <p className="text-[9px] text-cyan-500 font-medium">Global CDN</p>
              </div>
            </div>
          </div>

          {/* Automated Control Toggles */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {language === 'hi' ? 'फ़ाउंडर ऑटोमेशन टॉगल्स' : 'Founder Automation Switches'}
            </h4>

            <div className="space-y-2">
              {/* Toggle 1 */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'Google Cloud ऑटो-स्केलिंग (High-Traffic Server)' : 'Google Cloud Auto-Scaling'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {language === 'hi' ? 'ट्रैफिक बढ़ने पर सर्वर अपने आप बड़े हो जाते हैं' : 'Server dynamically expands with user spike'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoScaleEnabled(!autoScaleEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    autoScaleEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'AI स्पैम व सुरक्षा शील्ड (AI Moderation Bot)' : 'AI Spam & Safety Shield'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {language === 'hi' ? 'ग़लत कमेंट्स और बॉट यूज़र्स को AI तुरंत ब्लॉक करता है' : 'Automatically filters toxic content and spam'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAiModerationEnabled(!aiModerationEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    aiModerationEnabled ? 'bg-pink-500 justify-end' : 'bg-gray-300 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'स्मार्ट AI रिकमेंडेशन इंजन' : 'Smart AI Recommendation Algorithm'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {language === 'hi' ? 'हर दर्शक को उनकी रुचि के अनुसार वीडियो दिखाता है' : 'Personalizes Home & Shorts feed dynamically'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecommendationAiEnabled(!recommendationAiEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    recommendationAiEnabled ? 'bg-purple-500 justify-end' : 'bg-gray-300 dark:bg-neutral-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-neutral-800/40 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {language === 'hi' ? `फ़ाउंडर: ${userEmail}` : `Founder: ${userEmail}`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold transition-colors shadow-sm"
          >
            {language === 'hi' ? 'समझ गया (Done)' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
