"use client";

import { useEffect, useMemo, useState } from "react";
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

function RoleBadge({ role }: { role: string }) {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (role === "OWNER") {
    return (
      <span className={`${base} bg-emerald-900/30 border-emerald-700 text-emerald-200`}>
        OWNER
      </span>
    );
  }
  if (role === "EDITOR") {
    return (
      <span className={`${base} bg-blue-900/30 border-blue-700 text-blue-200`}>
        EDITOR
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-800 border-slate-700 text-slate-200`}>
      VIEWER
    </span>
  );
}

export default function DocPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [doc, setDoc] = useState<Doc | null>(null);
  const [myRole, setMyRole] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");

  // pins
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  // comment form
  const [pageNumber, setPageNumber] = useState(1);
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  // share form
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

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

  async function shareDoc(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShareMsg("");

    if (!shareEmail.trim()) {
      setError("Email is required to share");
      return;
    }

    try {
      setSharing(true);

      await apiFetch("/shares", {
        method: "POST",
        body: JSON.stringify({
          documentId: id,
          email: shareEmail,
          role: shareRole,
        }),
      });

      setShareMsg(`Shared successfully with ${shareEmail}`);
      setShareEmail("");
      setShareRole("VIEWER");
    } catch (e: any) {
      setError(e.message || "Failed to share document");
    } finally {
      setSharing(false);
    }
  }

  // click inside canvas to set x,y
  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const relX = clickX / rect.width;
    const relY = clickY / rect.height;

    setX(Number(relX.toFixed(2)));
    setY(Number(relY.toFixed(2)));
  }

  const selectedComment = useMemo(() => {
    return comments.find((c) => c.id === selectedCommentId) || null;
  }, [comments, selectedCommentId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-blue-600/15 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-purple-600/15 blur-3xl rounded-full" />

      {/* Topbar */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
            >
              ← Back
            </button>

            <div>
              <p className="text-xs text-slate-400">Document</p>
              <p className="font-semibold leading-tight">
                {doc ? doc.title : "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RoleBadge role={myRole || "VIEWER"} />
            {doc && (
              <a
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
                href={`${API_BASE}${doc.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-900/30 border border-red-700 text-red-200 text-sm animate-fadeUp">
            {error}
          </div>
        )}

        {!doc ? (
          <p className="text-slate-400">Loading document...</p>
        ) : (
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* LEFT: Viewer + actions */}
            <div className="space-y-6 animate-fadeUp">
              {/* Canvas Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Preview Canvas</h2>
                    <p className="text-sm text-slate-400">
                      Click anywhere to set comment position (x,y).
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedCommentId(null)}
                    className="text-sm px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
                  >
                    Clear selection
                  </button>
                </div>

                <div
                  onClick={handleCanvasClick}
                  className="relative w-full h-[460px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-crosshair"
                >
                  {/* subtle grid overlay */}
                  <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
                    <div className="w-full h-full bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />
                  </div>

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
                        className={`absolute w-4 h-4 rounded-full border-2 transition ${
                          active
                            ? "bg-yellow-400 border-yellow-200 scale-110"
                            : "bg-red-500 border-red-200 hover:scale-110"
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

                <div className="mt-4 grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-xs text-slate-400">Current Page</p>
                    <p className="font-semibold">{pageNumber}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-xs text-slate-400">x</p>
                    <p className="font-semibold">{x.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-xs text-slate-400">y</p>
                    <p className="font-semibold">{y.toFixed(2)}</p>
                  </div>
                </div>

                {selectedComment && (
                  <div className="mt-4 p-4 rounded-2xl bg-yellow-900/20 border border-yellow-700">
                    <p className="text-xs text-yellow-200 mb-1">Selected comment</p>
                    <p className="text-sm text-slate-100">{selectedComment.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Page {selectedComment.pageNumber} •{" "}
                      {selectedComment.user.name || selectedComment.user.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Share + Comment cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Share */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
                  <h3 className="text-lg font-semibold mb-1">Share</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Invite teammates with Viewer/Editor access.
                  </p>

                  {myRole !== "OWNER" ? (
                    <p className="text-slate-400 text-sm">
                      Only <span className="font-semibold">OWNER</span> can share.
                    </p>
                  ) : (
                    <form onSubmit={shareDoc} className="space-y-3">
                      <input
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                        placeholder="Email (example: user2@gmail.com)"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                      />

                      <select
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                        value={shareRole}
                        onChange={(e) =>
                          setShareRole(e.target.value as "VIEWER" | "EDITOR")
                        }
                      >
                        <option value="VIEWER">VIEWER (read only)</option>
                        <option value="EDITOR">EDITOR (can comment)</option>
                      </select>

                      <button
                        disabled={sharing}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold disabled:opacity-60"
                      >
                        {sharing ? "Sharing..." : "Share Document"}
                      </button>

                      {shareMsg && (
                        <p className="text-green-400 text-sm">{shareMsg}</p>
                      )}
                    </form>
                  )}
                </div>

                {/* Add Comment */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
                  <h3 className="text-lg font-semibold mb-1">Add Comment</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Pin comments to specific places.
                  </p>

                  {!canComment ? (
                    <p className="text-slate-400 text-sm">
                      You have <span className="font-semibold">{myRole}</span> access.
                      Only OWNER/EDITOR can comment.
                    </p>
                  ) : (
                    <form onSubmit={addComment} className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                          type="number"
                          min={1}
                          value={pageNumber}
                          onChange={(e) => setPageNumber(Number(e.target.value))}
                          placeholder="Page"
                        />
                        <input
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                          type="number"
                          step="0.01"
                          value={x}
                          onChange={(e) => setX(Number(e.target.value))}
                          placeholder="x (0-1)"
                        />
                        <input
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                          type="number"
                          step="0.01"
                          value={y}
                          onChange={(e) => setY(Number(e.target.value))}
                          placeholder="y (0-1)"
                        />
                      </div>

                      <textarea
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
                        placeholder="Write a comment..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                      />

                      <button
                        disabled={posting}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold disabled:opacity-60"
                      >
                        {posting ? "Posting..." : "Add Comment"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Comments */}
            <div className="animate-fadeUp">
              <div className="sticky top-[92px] bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">Comments</h2>
                    <p className="text-sm text-slate-400">
                      {comments.length} total
                    </p>
                  </div>

                  <button
                    onClick={loadComments}
                    className="text-sm px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
                  >
                    Refresh
                  </button>
                </div>

                {comments.length === 0 ? (
                  <p className="text-slate-400">No comments yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                    {comments.map((c) => {
                      const active = selectedCommentId === c.id;

                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCommentId(c.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition ${
                            active
                              ? "bg-slate-800 border-yellow-400"
                              : "bg-slate-950 border-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-200 font-semibold">
                                {c.user.name || c.user.email}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Page {c.pageNumber} • ({c.x.toFixed(2)}, {c.y.toFixed(2)})
                              </p>
                            </div>

                            <span className="text-xs text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-slate-100 mt-2">{c.message}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
