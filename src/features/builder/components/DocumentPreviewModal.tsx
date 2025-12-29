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

            <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-white/10 overflow-hidden bg-[#030014]/90">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 border border-white/10">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-xl font-bold font-display text-white line-clamp-1 break-all">
                                {researchDoc.title || researchDoc.fileName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 min-w-0">
                                <span className="text-[10px] sm:text-xs font-medium text-primary break-all">
                                    {researchDoc.fileType?.split('/').pop()?.toUpperCase() || 'DOCUMENT'}
                                </span>
                                <span className="text-gray-600 text-[10px] shrink-0">•</span>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate min-w-0 flex-1">
                                    {researchDoc.author || "Unknown Author"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
                    {/* Summary Section */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Abstract Summary
                        </h4>
                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base font-normal">
                                {researchDoc.summary || "No summary available for this document."}
                            </p>
                        </div>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Publication Year</span>
                            <span className="text-white text-sm sm:text-base font-medium">{researchDoc.year || "N/A"}</span>
                        </div>
                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Document Type</span>
                            <span className="text-white text-sm sm:text-base font-medium capitalize">{researchDoc.documentType || "N/A"}</span>
                        </div>
                    </div>

                    {/* Status Footer Inside Content */}
                    <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            ANALYZED
                        </div>
                        <span className="text-[10px] text-gray-600">Context available for AI assistance</span>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 sm:p-6 border-t border-white/10 shrink-0">
                    <a
                        href={researchDoc.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm transition-all"
                    >
                        <DownloadCloud className="w-4 h-4 text-gray-400" />
                        Download Resource
                    </a>
                </div>
            </div>
        </div>,
        document.body
    );
};
