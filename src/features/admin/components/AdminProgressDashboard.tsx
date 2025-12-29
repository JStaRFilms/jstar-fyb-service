'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import {
    Calendar,
    Clock,
    Users,
    FileText,
    TrendingUp,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface ProjectStats {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    outlineGenerated: number;
    paidProjects: number;
    avgProjectDuration: number;
    projects: any[];
}

export function AdminProgressDashboard() {
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjectStats();
    }, []);

    const fetchProjectStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/projects/analytics');
            if (!response.ok) {
                throw new Error('Failed to fetch project stats');
            }
            const data = await response.json();
            if (data.success) {
                setStats(data.analytics);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Error loading project stats: {error}</span>
                </div>
            </div>
        );
    }

    if (!stats) {
        return <div>No project data available</div>;
    }

    const completionRate = stats.totalProjects > 0
        ? (stats.completedProjects / stats.totalProjects) * 100
        : 0;

    const progressByPhase = {
        outline: Math.round((stats.outlineGenerated / stats.totalProjects) * 100),
        research: Math.round((stats.inProgressProjects / stats.totalProjects) * 100),
        writing: Math.round((stats.paidProjects / stats.totalProjects) * 100),
        completed: Math.round(completionRate)
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Projects</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.inProgressProjects}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.avgProjectDuration} days</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Visualization */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress Overview</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                        <Badge className="bg-green-100 text-green-600">{completionRate.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={completionRate} className="w-full" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Outline Generated</span>
                                <span className="font-medium">{progressByPhase.outline}%</span>
                            </div>
                            <Progress value={progressByPhase.outline} className="w-full" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Research Phase</span>
                                <span className="font-medium">{progressByPhase.research}%</span>
                            </div>
                            <Progress value={progressByPhase.research} className="w-full" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Writing Phase</span>
                                <span className="font-medium">{progressByPhase.writing}%</span>
                            </div>
                            <Progress value={progressByPhase.writing} className="w-full" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Completed</span>
                                <span className="font-medium">{progressByPhase.completed}%</span>
                            </div>
                            <Progress value={progressByPhase.completed} className="w-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Project</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Status</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Progress</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Created</th>
                                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.projects.slice(0, 10).map((project) => {
                                const duration = project.updatedAt.getTime() - project.createdAt.getTime();
                                const days = Math.round(duration / (1000 * 60 * 60 * 24));

                                return (
                                    <tr key={project.id} className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-sm">
                                            <div className="max-w-xs truncate" title={project.topic}>
                                                {project.topic}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge className={`${project.status === 'PROJECT_COMPLETE' ? 'bg-green-100 text-green-600' :
                                                project.status === 'WRITING_IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                                                    project.status === 'RESEARCH_IN_PROGRESS' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {project.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Progress value={project.progressPercentage || 0} className="w-20" />
                                                <span className="text-sm font-medium">{project.progressPercentage || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {project.createdAt.toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {days} days
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}