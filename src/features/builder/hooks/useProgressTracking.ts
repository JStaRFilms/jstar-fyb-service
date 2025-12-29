import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

interface ProgressData {
    progressPercentage: number;
    contentProgress: any;
    documentProgress: any;
    aiGenerationStatus: any;
    timeTracking: any;
    milestones: any[];
    estimatedCompletion: Date | null;
    actualCompletion: Date | null;
}

interface UseProgressTrackingProps {
    projectId: string;
    onProgressUpdate?: (progress: ProgressData) => void;
}

export function useProgressTracking({ projectId, onProgressUpdate }: UseProgressTrackingProps) {
    const { data: sessionData } = useSession();
    const session = sessionData?.user;
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch current progress
    const fetchProgress = async () => {
        if (!session) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/progress`);
            if (!response.ok) {
                throw new Error('Failed to fetch progress');
            }

            const data = await response.json();
            if (data.success) {
                setProgress(data.project);
                onProgressUpdate?.(data.project);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Update progress
    const updateProgress = async (
        milestone: string,
        phase: string,
        details?: any,
        metadata?: any
    ) => {
        if (!session) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    milestone,
                    phase,
                    details,
                    metadata
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update progress');
            }

            const data = await response.json();
            if (data.success) {
                setProgress(data.project);
                onProgressUpdate?.(data.project);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Calculate estimated time remaining
    const calculateTimeRemaining = () => {
        if (!progress || !progress.timeTracking) return null;

        const timeTracking = progress.timeTracking as any;
        const totalTime = Object.values(timeTracking).reduce((acc: number, phase: any) => {
            return acc + (phase.totalTime || 0);
        }, 0);

        const remainingPhases = 4 - Object.keys(timeTracking).length;
        const avgPhaseTime = totalTime / Object.keys(timeTracking).length;
        const estimatedRemaining = remainingPhases * avgPhaseTime;

        return estimatedRemaining;
    };

    // Get progress milestones timeline
    const getMilestonesTimeline = () => {
        if (!progress?.milestones) return [];

        return progress.milestones
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(milestone => ({
                ...milestone,
                timestamp: new Date(milestone.timestamp)
            }));
    };

    // Get chapter progress
    const getChapterProgress = () => {
        if (!progress?.contentProgress?.chapters) return [];

        const chapters = progress.contentProgress.chapters as Record<string, any>;
        return Object.entries(chapters).map(([id, chapter]) => ({
            id,
            ...chapter,
            isCompleted: chapter.completed || false,
            timeSpent: chapter.timeSpent || 0
        }));
    };

    useEffect(() => {
        fetchProgress();
    }, [projectId, session]);

    return {
        progress,
        loading,
        error,
        fetchProgress,
        updateProgress,
        calculateTimeRemaining,
        getMilestonesTimeline,
        getChapterProgress,
        refetch: fetchProgress
    };
}