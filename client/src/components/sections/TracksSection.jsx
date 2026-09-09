import React, { useState } from 'react';
import { Sword, Brain, Shield, Cloud, Bot, Sparkles, Code, ChevronRight } from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

export const TracksSection = () => {
  const [selectedTrack, setSelectedTrack] = useState(null);

  const tracks = [
    {
      id: 'ai-ml',
      name: 'DRAGON INTELLIGENCE (AI & ML)',
      icon: Brain,
      color: 'from-cyan-500 to-blue-600',
      description: 'Build neural models, autonomous agents, computer vision systems, and LLM applications.',
      problemStatement: 'Engineers must construct scalable AI agents capable of multi-agent reasoning, automated code analysis, or real-time predictive analytics.',
      tech: ['PyTorch', 'TensorFlow', 'LangChain', 'FastAPI', 'OpenCV'],
      requirements: 'Working AI demo, API endpoints, evaluation benchmarks, clean code structure.'
    },
    {
      id: 'cybersec',
      name: 'CASTLE DEFENSE (CYBERSECURITY)',
      icon: Shield,
      color: 'from-blue-600 to-indigo-700',
      description: 'Architect zero-trust protocols, identity verification, web application firewalls, and threat intelligence.',
      problemStatement: 'Develop automated security scanners, anti-tamper verification tokens, or cryptographic data protection suites.',
      tech: ['Node.js', 'Rust', 'WebAssembly', 'Cryptography', 'Docker'],
      requirements: 'Proof-of-Concept security audit, zero data leaks, encryption standards.'
    },
    {
      id: 'cloud-web3',
      name: 'REALM OF CLOUD & WEB3',
      icon: Cloud,
      color: 'from-sky-400 to-cyan-600',
      description: 'Deploy resilient cloud-native microservices, decentralized ledgers, and edge computing nodes.',
      problemStatement: 'Construct high-throughput web applications with sub-100ms latency, automatic failover, and glassmorphic UI.',
      tech: ['React', 'Next.js', 'MongoDB', 'GraphQL', 'AWS/GCP'],
      requirements: 'Responsive frontend UI, robust REST/GraphQL APIs, live database sync.'
    },
    {
      id: 'iot-embedded',
      name: 'RUNIC HARDWARE (IOT & ROBOTICS)',
      icon: Bot,
      color: 'from-blue-500 to-sky-600',
      description: 'Integrate hardware sensors, microcontrollers, smart energy grids, and autonomous robotics.',
      problemStatement: 'Design IoT telemetry dashboards and edge device controllers for smart campus environments.',
      tech: ['ESP32', 'Arduino', 'MQTT', 'Python', 'WebSockets'],
      requirements: 'Hardware/simulation working model, real-time sensor feed, alert triggers.'
    },
    {
      id: 'open-innovation',
      name: 'OPEN DRAGON ARENA',
      icon: Sparkles,
      color: 'from-cyan-400 to-blue-500',
      description: 'Unleash wild innovation in FinTech, EdTech, Healthcare, Agritech, or Sustainability.',
      problemStatement: 'Solve any high-impact challenge using modern software engineering practices.',
      tech: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind'],
      requirements: 'Working prototype, user journey workflow, clear business value proposition.'
    }
  ];

  return (
    <section id="tracks" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-widest mb-4">
          <Sword className="w-4 h-4" />
          <span>CHOOSE YOUR BATTLE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          INNOVATION TRACKS
        </h2>
        <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
          Select your arena track. Each track presents distinct engineering challenges designed for maximum technical rigor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isSelected = selectedTrack?.id === track.id;

          return (
            <TiltCard key={track.id} className="p-7 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-300 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 border border-sky-400/20 text-sky-300">
                    ALPHA TRACK
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white mb-2 group-hover:text-sky-300 transition-colors">
                  {track.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {track.description}
                </p>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/15 mb-4">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                    Problem Statement
                  </span>
                  <p className="text-xs text-slate-300 font-light leading-snug">
                    {track.problemStatement}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {track.tech.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedTrack(track)}
                  className="w-full py-2.5 text-xs font-bold tracking-wider text-sky-200 glass-button rounded-xl flex items-center justify-center gap-1 group-hover:text-white"
                >
                  <span>VIEW FULL SPECS</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Track Details Modal */}
      {selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-xl w-full p-8 rounded-3xl glass-card border border-sky-500/40 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <selectedTrack.icon className="w-8 h-8 text-sky-300" />
              <div>
                <h3 className="text-xl font-black text-white">{selectedTrack.name}</h3>
                <span className="text-xs text-sky-400">Technical Specifications</span>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overview</h4>
                <p className="text-sm text-slate-200">{selectedTrack.description}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Problem Statement</h4>
                <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-sky-500/20">
                  {selectedTrack.problemStatement}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Submission Requirements</h4>
                <p className="text-sm text-slate-200">{selectedTrack.requirements}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedTrack(null)}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
