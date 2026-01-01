"use client";

import { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, Trash2, CheckCircle, XCircle, Eye, Sparkles } from "lucide-react";
import { useBuilderStore } from "../store/useBuilderStore";

export function DocumentUpload({ projectId }: { projectId: string }) {
    const [mode, setMode] = useState<"upload" | "link">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [extractionStatus, setExtractionStatus] = useState<Record<string, string>>({});

    // Fetch existing documents
    useEffect(() => {
        fetchDocuments();
    }, [projectId]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/documents?projectId=${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

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
            setDocuments(prev => [...prev, {
                id: data.doc.id,
                fileName: mode === "upload" ? file!.name : "External Link",
                fileType: mode === "upload" ? "file" : "link",
                status: "PENDING",
                ...data.doc
            }]);

            // Reset
            setFile(null);
            setLink("");

            // Auto-start extraction for file uploads
            if (mode === "upload" && data.doc.id) {
                await handleExtract(data.doc.id);
            }

        } catch (error) {
            console.error("Upload error:", error);
            alert(error instanceof Error ? error.message : "Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    const handleExtract = async (documentId: string) => {
        setIsExtracting(true);
        setExtractionStatus(prev => ({ ...prev, [documentId]: "PROCESSING" }));

        try {
            const res = await fetch(`/api/documents/${documentId}/extract`, {
                method: "POST"
            });

            if (!res.ok) {
                throw new Error("Extraction failed");
            }

            const data = await res.json();

            // Update document status
            setDocuments(prev => prev.map(doc =>
                doc.id === documentId
                    ? { ...doc, status: "PROCESSED", ...data.extraction.metadata }
                    : doc
            ));

            setExtractionStatus(prev => ({ ...prev, [documentId]: "SUCCESS" }));

        } catch (error) {
            console.error("Extraction error:", error);
            setExtractionStatus(prev => ({ ...prev, [documentId]: "FAILED" }));
        } finally {
            setIsExtracting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PROCESSED": return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "FAILED": return <XCircle className="w-4 h-4 text-red-400" />;
            case "PROCESSING": return <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />;
            default: return <Sparkles className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "PROCESSED": return "Processed";
            case "FAILED": return "Failed";
            case "PROCESSING": return "Processing...";
            default: return "Pending Analysis";
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
                        mode === "upload" ? "Upload & Process" : "Add Link"
                    )}
                </button>
            </div>

            {/* Document List */}
            {documents.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Uploaded Documents</h4>
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {doc.fileType === 'file' ? <FileText className="w-5 h-5 text-blue-400 shrink-0" /> : <LinkIcon className="w-5 h-5 text-purple-400 shrink-0" />}
                                <div className="min-w-0">
                                    <span className="text-sm font-medium text-white">{doc.fileName}</span>
                                    {doc.title && (
                                        <p className="text-xs text-gray-400 truncate">{doc.title}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(doc.status)}
                                    <span className="text-xs text-gray-400">{getStatusText(doc.status)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {doc.status === "PENDING" && (
                                        <button
                                            onClick={() => handleExtract(doc.id)}
                                            disabled={isExtracting}
                                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Process
                                        </button>
                                    )}

                                    {doc.status === "PROCESSED" && (
                                        <button
                                            onClick={() => {
                                                // Show extracted content
                                                alert(`Title: ${doc.title || 'N/A'}\n\nSummary: ${doc.summary || 'N/A'}`);
                                            }}
                                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Processing Info */}
            <div className="mt-4 text-xs text-gray-500">
                <p><strong>Note:</strong> Documents are automatically processed to extract metadata, content, and insights for AI content generation.</p>
                <p className="mt-1">Processed documents become available as context for chapter generation and research assistance.</p>
            </div>
        </div>
    );
}
