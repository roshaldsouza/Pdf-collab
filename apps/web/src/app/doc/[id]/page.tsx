"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { API_BASE } from "@/lib/config";

type Doc = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
};

export default function DocPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [doc, setDoc] = useState<Doc | null>(null);
  const [myRole, setMyRole] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const data = await apiFetch(`/documents/${id}`);
        setDoc(data.document);
        setMyRole(data.myRole);
      } catch (e: any) {
        setError(e.message || "Failed to load document");
      }
    }
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          ← Back
        </button>

        <p className="text-sm text-slate-300">
          Role: <span className="font-semibold">{myRole}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-200">
          {error}
        </div>
      )}

      {!doc ? (
        <p className="text-slate-400">Loading document...</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
          <p className="text-sm text-slate-400 mb-4">
            File: {doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB
          </p>

          <a
            className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
            href={`${API_BASE}${doc.fileUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            Open PDF
          </a>
        </div>
      )}
    </div>
  );
}
