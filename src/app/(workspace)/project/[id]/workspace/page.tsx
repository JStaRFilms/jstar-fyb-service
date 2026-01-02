import { ChapterEditor } from '@/features/builder/components/v2/ChapterEditor';

interface WorkspacePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const { id } = await params;

    return (
        <ChapterEditor projectId={id} />
    );
}
