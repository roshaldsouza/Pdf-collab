"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) router.replace("/dashboard");
    else router.replace("/login");

    // keep small delay so UI doesn't appear blank
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [router]);

  if (!loading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
