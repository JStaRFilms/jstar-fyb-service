import React from "react";
import { Download, DownloadCloud, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
    type: "DOC" | "PDF";
    filename: string;
    size: string;
    status: "ready" | "compiling";
    downloadUrl?: string;
}

const ResourceCard = ({ type, filename, size, status, downloadUrl }: ResourceCardProps) => {
    return (
        <div
            className={cn(
                "p-4 rounded-xl glass-panel flex items-center justify-between group cursor-pointer border border-white/10 transition-colors",
                status === "ready" ? "hover:bg-white/5" : "opacity-60 cursor-not-allowed"
            )}
        >
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                        type === "DOC" && "bg-blue-500/20 text-blue-400",
                        type === "PDF" && "bg-red-500/20 text-red-400"
                    )}
                >
                    {type}
                </div>
                <div>
                    <p className="font-bold text-sm">{filename}</p>
                    <p className="text-xs text-gray-500">
                        {status === "ready" ? `${size} • Ready` : "Compiling..."}
                    </p>
                </div>
            </div>
            {status === "ready" ? (
                <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
                </button>
            ) : (
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
            )}
        </div>
    );
};

export const ResourceDownloads = () => {
    return (
        <div>
            <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-accent" /> Resources
            </h3>
            <div className="space-y-3">
                <ResourceCard
                    type="DOC"
                    filename="Project_Abstract.docx"
                    size="12 KB"
                    status="ready"
                    downloadUrl="#"
                />
                <ResourceCard
                    type="PDF"
                    filename="Full_Source_Code.zip"
                    size=""
                    status="compiling"
                />
            </div>
        </div>
    );
};
