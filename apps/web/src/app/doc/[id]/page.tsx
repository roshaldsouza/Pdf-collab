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

type Comment = {
  id: string;
  documentId: string;
  pageNumber: number;
  x: number;
  y: number;
  message: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export default function DocPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [doc, setDoc] = useState<Doc | null>(null);
  const [myRole, setMyRole] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");

  // ✅ Step 10: selected pin/comment
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  // comment form
  const [pageNumber, setPageNumber] = useState(1);
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const canComment = myRole === "OWNER" || myRole === "EDITOR";

  async function loadDoc() {
    const data = await apiFetch(`/documents/${id}`);
    setDoc(data.document);
    setMyRole(data.myRole);
  }

  async function loadComments() {
    const data = await apiFetch(`/comments/${id}`);
    setComments(data.comments || []);
  }

  useEffect(() => {
    async function loadAll() {
      setError("");
      try {
        await loadDoc();
        await loadComments();
      } catch (e: any) {
        setError(e.message || "Failed to load document");
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Comment message is required");
      return;
    }

    try {
      setPosting(true);

      await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({
          documentId: id,
          pageNumber,
          x,
          y,
          message,
        }),
      });

      setMessage("");
      await loadComments();
    } catch (e: any) {
      setError(e.message || "Failed to add comment");
    } finally {
      setPosting(false);
    }
  }

  // ✅ Step 10: click inside canvas to set relative x,y
  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const relX = clickX / rect.width;
    const relY = clickY / rect.height;

    setX(Number(relX.toFixed(2)));
    setY(Number(relY.toFixed(2)));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Top Bar */}
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Document Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
            <p className="text-sm text-slate-400 mb-4">
              File: {doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB
            </p>

            {/* ✅ Step 10: Clickable canvas with pins */}
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">
                Click inside the box to auto-set comment position (x,y)
              </p>

              <div
                onClick={handleCanvasClick}
                className="relative w-full h-[420px] rounded-xl bg-slate-800 border border-slate-700 overflow-hidden cursor-crosshair"
              >
                {/* Pins */}
                {comments.map((c) => {
                  const left = `${c.x * 100}%`;
                  const top = `${c.y * 100}%`;
                  const active = selectedCommentId === c.id;

                  return (
                    <button
                      key={c.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedCommentId(c.id);
                      }}
                      className={`absolute w-4 h-4 rounded-full border-2 ${
                        active
                          ? "bg-yellow-400 border-yellow-200"
                          : "bg-red-500 border-red-200"
                      }`}
                      style={{
                        left,
                        top,
                        transform: "translate(-50%, -50%)",
                      }}
                      title={`Page ${c.pageNumber}: ${c.message}`}
                    />
                  );
                })}
              </div>
            </div>

            <a
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              href={`${API_BASE}${doc.fileUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              Open PDF
            </a>

            {/* Add Comment */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <h2 className="text-lg font-semibold mb-3">Add Comment</h2>

              {!canComment ? (
                <p className="text-slate-400 text-sm">
                  You have <span className="font-semibold">{myRole}</span> access. Only
                  OWNER/EDITOR can add comments.
                </p>
              ) : (
                <form onSubmit={addComment} className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      className="p-3 rounded-lg bg-slate-800 border border-slate-700"
                      type="number"
                      min={1}
                      value={pageNumber}
                      onChange={(e) => setPageNumber(Number(e.target.value))}
                      placeholder="Page"
                    />
                    <input
                      className="p-3 rounded-lg bg-slate-800 border border-slate-700"
                      type="number"
                      step="0.01"
                      value={x}
                      onChange={(e) => setX(Number(e.target.value))}
                      placeholder="x (0-1)"
                    />
                    <input
                      className="p-3 rounded-lg bg-slate-800 border border-slate-700"
                      type="number"
                      step="0.01"
                      value={y}
                      onChange={(e) => setY(Number(e.target.value))}
                      placeholder="y (0-1)"
                    />
                  </div>

                  <textarea
                    className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
                    placeholder="Write a comment..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />

                  <button
                    disabled={posting}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {posting ? "Posting..." : "Add Comment"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Comments List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Comments</h2>
              <button
                onClick={loadComments}
                className="text-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>

            {comments.length === 0 ? (
              <p className="text-slate-400">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border ${
                      selectedCommentId === c.id
                        ? "bg-slate-700 border-yellow-400"
                        : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    <p className="text-sm text-slate-300 mb-1">
                      <span className="font-semibold">
                        {c.user.name || c.user.email}
                      </span>{" "}
                      • Page {c.pageNumber} • ({c.x.toFixed(2)}, {c.y.toFixed(2)})
                    </p>
                    <p className="text-slate-100">{c.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
