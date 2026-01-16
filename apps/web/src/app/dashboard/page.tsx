"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Doc = {
  id: string;
  title: string;
  myRole: "OWNER" | "EDITOR" | "VIEWER";
  createdAt?: string;
};

function RoleBadge({ role }: { role: Doc["myRole"] }) {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (role === "OWNER")
    return (
      <span className={`${base} bg-emerald-900/30 border-emerald-700 text-emerald-200`}>
        OWNER
      </span>
    );
  if (role === "EDITOR")
    return (
      <span className={`${base} bg-blue-900/30 border-blue-700 text-blue-200`}>
        EDITOR
      </span>
    );
  return (
    <span className={`${base} bg-slate-800 border-slate-700 text-slate-200`}>
      VIEWER
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // upload
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // search
  const [query, setQuery] = useState("");

  async function loadDocs() {
    const data = await apiFetch("/documents");
    setDocs(data.documents || []);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function init() {
      setError("");
      try {
        setLoading(true);
        await loadDocs();
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  async function uploadPdf(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please choose a PDF file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      if (title.trim()) formData.append("title", title);
      formData.append("file", file);

      await apiFetch("/documents/upload", {
        method: "POST",
        body: formData,
      });

      setTitle("");
      setFile(null);
      await loadDocs();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.title.toLowerCase().includes(q));
  }, [docs, query]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* glow bg */}
      <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-blue-600/15 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-purple-600/15 blur-3xl rounded-full" />

      {/* topbar */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Workspace</p>
            <h1 className="text-2xl font-bold leading-tight">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  await loadDocs();
                } catch {}
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.replace("/login");
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-900/30 border border-red-700 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          {/* upload card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
            <h2 className="text-lg font-semibold mb-1">Upload PDF</h2>
            <p className="text-sm text-slate-400 mb-4">
              Add a new document to your workspace.
            </p>

            <form onSubmit={uploadPdf} className="space-y-3">
              <input
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <button
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>

          {/* docs list */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Your Documents</h2>
                <p className="text-sm text-slate-400">
                  {docs.length} total
                </p>
              </div>

              <input
                className="w-[240px] max-w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                placeholder="Search docs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="text-slate-400">Loading documents...</p>
            ) : filteredDocs.length === 0 ? (
              <p className="text-slate-400">No documents found.</p>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => router.push(`/doc/${d.id}`)}
                    className="w-full text-left p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">{d.title}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Open document → add comments & share
                        </p>
                      </div>
                      <RoleBadge role={d.myRole} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
