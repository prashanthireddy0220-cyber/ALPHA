import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, CheckCircle, XCircle, Clock, MapPin, Calendar, Users, AlertTriangle } from 'lucide-react';
import { TiltCard } from '../components/common/TiltCard';

export const VerifyPassPage = () => {
  const { teamId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPass = async () => {
      try {
        const res = await axios.get(`/api/registration/verify/${teamId}`);
        if (res.data?.valid) {
          setData(res.data);
        } else {
          setError(res.data?.message || 'Invalid Event Pass');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. Invalid or unconfirmed event pass.');
      } finally {
        setLoading(false);
      }
    };
    verifyPass();
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-sky-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-sky-300 tracking-widest uppercase">VERIFYING ALPHA EVENT PASS...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen pt-32 px-4 max-w-md mx-auto text-center">
        <TiltCard className="p-8 border border-red-500/40">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-black text-white">INVALID EVENT PASS</h1>
          <p className="text-xs text-slate-300 mt-2 mb-6">{error || 'This QR pass could not be authenticated.'}</p>
          <Link to="/" className="px-6 py-2.5 text-xs font-bold text-sky-300 glass-button rounded-xl">
            BACK TO ALPHA HOMEPAGE
          </Link>
        </TiltCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 mb-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">VALID ALPHA EVENT PASS</h1>
        <p className="text-xs text-emerald-400 font-bold mt-1">Official KARE IEEE Education Society Pass</p>
      </div>

      <TiltCard className="p-8 border border-sky-400/40">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TEAM NAME</span>
            <h2 className="text-xl font-black text-white">{data.teamName}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TEAM ID</span>
            <span className="text-2xl font-black text-cyan-300 font-mono text-glow">{data.teamId}</span>
          </div>
        </div>

        <div className="space-y-4 my-6">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Event Date: <strong className="text-white">{data.eventDate}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Venue: <strong className="text-white">{data.venue}</strong></span>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">VALIDATED TEAM MEMBERS</span>
            <div className="space-y-2">
              {data.members?.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="font-bold text-white">{m.name}</span>
                  <span className="text-sky-400 font-mono text-[11px]">{m.regNo} ({m.department})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
            AUTHENTICATED BY ALPHA DIGITAL TRUST NODE
          </span>
        </div>
      </TiltCard>
    </div>
  );
};
