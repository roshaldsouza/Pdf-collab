"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Doc = {
  id: string;
  title: string;
  myRole?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [error, setError] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function loadDocs() {
    setLoadingDocs(true);
    setError("");

    try {
      const data = await apiFetch("/documents");
      setDocs(data.documents || []);
    } catch (e: any) {
      setError(e.message || "Failed to load documents");
      router.push("/login");
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    try {
      setUploading(true);

      const form = new FormData();
      form.append("title", title || file.name);
      form.append("file", file);

      await apiFetch("/documents/upload", {
        method: "POST",
        body: form,
      });

      // reset form
      setTitle("");
      setFile(null);

      // refresh docs
      await loadDocs();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="px-4 py-2 bg-red-600 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-200">
          {error}
        </div>
      )}

      {/* Upload PDF */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Upload PDF</h2>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-3">
          <input
            className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            disabled={uploading}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {file && (
          <p className="text-sm text-slate-400 mt-2">
            Selected: <span className="text-slate-200">{file.name}</span>
          </p>
        )}
      </div>

      {/* Docs Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Your Documents</h2>

        <button
          onClick={loadDocs}
          className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {/* Docs List */}
      {loadingDocs ? (
        <p className="text-slate-400">Loading documents...</p>
      ) : docs.length === 0 ? (
        <p className="text-slate-400">No documents yet. Upload one to start.</p>
      ) : (
        <div className="grid gap-4">
          {docs.map((d) => (
            <button
              key={d.id}
              onClick={() => router.push(`/doc/${d.id}`)}
              className="text-left bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition"
            >
              <p className="font-semibold text-lg">{d.title}</p>
              <p className="text-sm text-slate-400 mt-1">
                Role: <span className="text-slate-200">{d.myRole || "OWNER"}</span>
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
