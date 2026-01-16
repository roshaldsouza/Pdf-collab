"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-emerald-600/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="mb-6 text-center">
            <p className="text-slate-400 text-sm">PDF Collab</p>
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-slate-400 mt-2">
              Upload PDFs, share access, and collaborate with comments.
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

            <label className="text-sm text-slate-300">Name</label>
            <input
              className="w-full mt-2 mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
              placeholder="Roshal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              placeholder="Minimum 6 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>

            <p className="text-sm text-slate-400 mt-4 text-center">
              Already have an account?{" "}
              <a className="text-blue-400 hover:text-blue-300 underline" href="/login">
                Login
              </a>
            </p>
          </form>

          <p className="text-xs text-slate-500 mt-5 text-center">
            Built with Next.js • Express • Prisma • Postgres
          </p>
        </div>
      </div>
    </div>
  );
}
