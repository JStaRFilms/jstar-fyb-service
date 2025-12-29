'use client';

import React from 'react';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Clock, Calendar, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
    projectId: string;
    className?: string;
}

export function ProgressIndicator({ projectId, className }: ProgressIndicatorProps) {
    const { progress, loading, error, getMilestonesTimeline, getChapterProgress, calculateTimeRemaining } = useProgressTracking({
        projectId,
        onProgressUpdate: (progress) => {
            console.log('Progress updated:', progress);
        }
    });

    const milestones = getMilestonesTimeline();
    const chapters = getChapterProgress();
    const timeRemaining = calculateTimeRemaining();

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Project Progress</h3>
                    <Badge className="bg-gray-100 text-gray-600">Loading...</Badge>
                </div>
                <Progress value={0} className="w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-red-700">Progress Error</h3>
                    <Badge className="bg-red-100 text-red-600">Error</Badge>
                </div>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    const currentProgress = progress?.progressPercentage || 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
                    <Badge className={currentProgress === 100 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}>
                        {currentProgress}%
                    </Badge>
                </div>
                <Progress value={currentProgress} className="w-full" />

                {timeRemaining && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Estimated time remaining: {Math.round(timeRemaining / (1000 * 60 * 60))} hours</span>
                    </div>
                )}
            </div>

            {/* Phase Progress */}
            {progress?.contentProgress && (
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600">Content Generation</h4>
                    <div className="space-y-1">
                        {progress.contentProgress.outline && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Outline Generated
                                </span>
                                <span className="text-xs text-gray-500">
                                    {progress.contentProgress.outline.timestamp &&
                                        new Date(progress.contentProgress.outline.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {progress.contentProgress.research && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    {progress.contentProgress.research.completed ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    Research {progress.contentProgress.research.completed ? 'Completed' : 'In Progress'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {progress.contentProgress.research.timestamp &&
                                        new Date(progress.contentProgress.research.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {progress.contentProgress.writing && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    {progress.contentProgress.writing.completed ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-blue-500" />
                                    )}
                                    Writing {progress.contentProgress.writing.completed ? 'Completed' : 'In Progress'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {progress.contentProgress.writing.timestamp &&
                                        new Date(progress.contentProgress.writing.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {progress.contentProgress.abstract && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Abstract Generated
                                </span>
                                <span className="text-xs text-gray-500">
                                    {progress.contentProgress.abstract.timestamp &&
                                        new Date(progress.contentProgress.abstract.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chapter Progress */}
            {chapters.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600">Chapter Progress</h4>
                    <div className="space-y-2">
                        {chapters.map((chapter) => (
                            <div key={chapter.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    {chapter.isCompleted ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-gray-400" />
                                    )}
                                    {chapter.title || `Chapter ${chapter.id}`}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {chapter.isCompleted ? 'Completed' : 'In Progress'}
                                    {chapter.timeSpent && ` • ${Math.round(chapter.timeSpent / (1000 * 60))} min`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Milestones Timeline */}
            {milestones.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600">Milestones</h4>
                    <div className="space-y-1">
                        {milestones.slice(-5).map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                                <span className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" />
                                    {milestone.milestone}
                                </span>
                                <span>{milestone.timestamp.toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Project Status */}
            {progress?.actualCompletion && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Project completed on {progress.actualCompletion.toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
}