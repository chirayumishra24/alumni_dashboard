"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";

interface LoginGateProps {
  children: React.ReactNode;
}

export default function LoginGate({ children }: LoginGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    // Check if verified in sessionStorage
    const isAuth = sessionStorage.getItem("admin_authenticated");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
    setCheckingSession(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShake(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("admin_authenticated", "true");
        setIsAuthenticated(true);
      } else {
        const json = await res.json();
        setError(json.error || "Access Denied");
        setShake(true);
        // Reset shake after animation
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("Unable to connect to authentication server");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-violet-650" />
          <span className="text-xs font-semibold tracking-wider text-slate-405">AUTHENTICATING SESSION...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className={`w-full max-w-md p-8 rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-xl relative transition-all duration-300 ${shake ? "animate-shake" : ""}`}>
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-violet-605 to-indigo-605 flex items-center justify-center font-black text-white text-2xl tracking-wider shadow-md shadow-indigo-500/10">
            CCGS
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 justify-center">
              Coordinator Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">Please enter your password to access the CCGS Admin Dashboard.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                <KeyRound size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-100 p-3.5 rounded-2xl animate-fade-in">
              <ShieldAlert size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-650 to-indigo-650 hover:shadow-lg hover:shadow-indigo-500/15 text-xs font-bold text-white transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-75 disabled:hover:scale-100"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              "Unlock Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
