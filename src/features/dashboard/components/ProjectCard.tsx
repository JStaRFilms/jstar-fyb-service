import React from "react";
import { Cpu, FileText, Lock } from "lucide-react";
import { StatusTimeline } from "./StatusTimeline";

import { Project } from "@prisma/client";

interface ProjectCardProps {
    project: Partial<Project>;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <Cpu className="w-24 h-24 text-white/5 -rotate-12" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-500 font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {project.status || "Active"}
            </div>

            <h2 className="text-2xl font-bold font-display mb-2 pr-8">{project.topic || "Untitled Project"}</h2>
            <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                {project.abstract || "No abstract available."}
            </p>

            {/* Status Timeline */}
            <StatusTimeline status={project.status || "NEW"} progress={project.progressPercentage || 0} />

            <div className="grid grid-cols-2 gap-3">
                <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Abstract
                </button>
                <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                    <Lock className="w-4 h-4" /> Full Doc
                </button>
            </div>
        </div>
    );
};
