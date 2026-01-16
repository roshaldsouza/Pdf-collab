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
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-slate-900 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <input
          className="w-full p-3 rounded bg-slate-800 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-800 mb-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-slate-400 mt-3">
          New here?{" "}
          <a className="text-blue-400 underline" href="/register">
            Create account
          </a>
        </p>
      </form>
    </div>
  );
}
