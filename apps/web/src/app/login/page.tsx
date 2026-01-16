"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* background glow */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-blue-600/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="mb-6 text-center">
            <p className="text-slate-400 text-sm">PDF Collab</p>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-slate-400 mt-2">
              Login to manage, share and comment on PDFs.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur"
          >
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-700 text-red-200 text-sm">
                {error}
              </div>
            )}

            <label className="text-sm text-slate-300">Email</label>
            <input
              className="w-full mt-2 mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="text-sm text-slate-300">Password</label>
            <input
              className="w-full mt-2 mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-slate-400 mt-4 text-center">
              New here?{" "}
              <a className="text-blue-400 hover:text-blue-300 underline" href="/register">
                Create an account
              </a>
            </p>
          </form>

          <p className="text-xs text-slate-500 mt-5 text-center">
            Secure JWT auth • Role-based sharing • Comment pins
          </p>
        </div>
      </div>
    </div>
  );
}
