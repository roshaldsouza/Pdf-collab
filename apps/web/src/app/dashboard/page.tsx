"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/documents");
        setDocs(data.documents);
      } catch (e: any) {
        setError(e.message);
        router.push("/login");
      }
    }
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="px-4 py-2 bg-red-600 rounded"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid gap-4">
        {docs.map((d) => (
          <div key={d.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="font-semibold">{d.title}</p>
            <p className="text-sm text-slate-400">{d.myRole}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
