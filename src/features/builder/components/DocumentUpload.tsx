"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, Trash2 } from "lucide-react";
import { useBuilderStore } from "../store/useBuilderStore";

// Mock ID generator for optimistic UI (if we were using it, but we'll stick to simple state for now)
// In a real app we'd fetch the document list from the API

export function DocumentUpload({ projectId }: { projectId: string }) {
    const [mode, setMode] = useState<"upload" | "link">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // We would fetch this from a useDocuments hook in a real implementation
    // For now we just track uploads locally to show the UI feedback
    const [uploads, setUploads] = useState<{ name: string; type: string }[]>([]);

    const handleUpload = async () => {
        if (!file && !link) return;

        // Client-side validation for file uploads
        if (mode === "upload" && file) {
            const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
            const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

            if (file.size > MAX_FILE_SIZE) {
                alert("File exceeds 4MB limit. Please upload a smaller file.");
                return;
            }

            if (!ACCEPTED_TYPES.includes(file.type)) {
                alert("Only PDF and DOCX files are allowed.");
                return;
            }
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("projectId", projectId);

        if (mode === "upload" && file) {
            formData.append("file", file);
        } else if (mode === "link" && link) {
            formData.append("link", link);
        }

        try {
            const res = await fetch("/api/documents/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: "Upload failed" }));
                throw new Error(error.error || "Upload failed");
            }

            const data = await res.json();

            // Add to list
            setUploads(prev => [...prev, {
                name: mode === "upload" ? file!.name : link,
                type: mode === "upload" ? "file" : "link"
            }]);

            // Reset
            setFile(null);
            setLink("");

        } catch (error) {
            console.error("Upload error:", error);
            alert(error instanceof Error ? error.message : "Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Research Documents
            </h3>

            {/* Tabs */}
            <div className="flex bg-black/20 p-1 rounded-lg mb-4 w-fit">
                <button
                    onClick={() => setMode("upload")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "upload" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                        }`}
                >
                    Upload PDF
                </button>
                <button
                    onClick={() => setMode("link")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "link" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                        }`}
                >
                    Paste Link
                </button>
            </div>

            {/* Input Area */}
            <div className="mb-6">
                {mode === "upload" ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                        <input
                            type="file"
                            id="doc-upload"
                            className="hidden"
                            accept=".pdf,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="doc-upload" className="cursor-pointer block">
                            {file ? (
                                <div className="text-primary font-bold">{file.name}</div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Click to upload PDF or DOCX</p>
                                    <p className="text-gray-600 text-xs mt-1">Max 4MB</p>
                                </>
                            )}
                        </label>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://arxiv.org/pdf/..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
                        />
                        <p className="text-xs text-gray-500">Paste a direct link to a research paper or resource.</p>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={(!file && !link) || isUploading}
                    className="mt-4 w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        mode === "upload" ? "Upload File" : "Add Link"
                    )}
                </button>
            </div>

            {/* File List */}
            {uploads.length > 0 && (
                <div className="space-y-2">
                    {uploads.map((upload, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {upload.type === 'file' ? <FileText className="w-4 h-4 text-blue-400 shrink-0" /> : <LinkIcon className="w-4 h-4 text-purple-400 shrink-0" />}
                                <span className="text-sm truncate text-gray-300">{upload.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">Pending Analysis</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
