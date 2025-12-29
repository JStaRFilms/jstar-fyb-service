"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DownloadCloud, FileText, X } from "lucide-react";
import { ResearchDocument } from "@prisma/client";

interface DocumentPreviewModalProps {
    researchDoc: ResearchDocument | null;
    isOpen: boolean;
    onClose: () => void;
}

export const DocumentPreviewModal = ({ researchDoc, isOpen, onClose }: DocumentPreviewModalProps) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !researchDoc) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-start justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-display text-white line-clamp-1 break-all">
                                {researchDoc.title || researchDoc.fileName}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {researchDoc.fileType?.toUpperCase()} • {researchDoc.author || "Unknown Author"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Summary Section */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                            Summary
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {researchDoc.summary || "No summary available for this document."}
                        </p>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <span className="text-xs text-gray-500 block mb-1">Publication Year</span>
                            <span className="text-white font-medium">{researchDoc.year || "N/A"}</span>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <span className="text-xs text-gray-500 block mb-1">Document Type</span>
                            <span className="text-white font-medium capitalize">{researchDoc.documentType || "N/A"}</span>
                        </div>
                    </div>

                    {/* Stats / Status */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 justify-center pt-2">
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">
                            PROCESSED
                        </span>
                        <span>•</span>
                        <span>Ready for analysis</span>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/10 shrink-0 bg-white/5 rounded-b-3xl">
                    <a
                        href={researchDoc.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                    >
                        <DownloadCloud className="w-4 h-4" /> Download Original File
                    </a>
                </div>
            </div>
        </div>,
        document.body
    );
};
