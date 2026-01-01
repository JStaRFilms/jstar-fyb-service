import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// Force dynamic rendering to prevent static build failures
export const dynamic = 'force-dynamic';

async function getProjects() {
    return prisma.project.findMany({
        where: {
            isUnlocked: true
        },
        orderBy: { updatedAt: "desc" },
        include: {
            _count: {
                select: { documents: true, messages: true }
            }
        }
    });
}

const STATUS_COLORS: Record<string, string> = {
    OUTLINE_GENERATED: "bg-gray-500",
    RESEARCH_IN_PROGRESS: "bg-blue-500",
    RESEARCH_COMPLETE: "bg-purple-500",
    WRITING_IN_PROGRESS: "bg-yellow-500",
    PROJECT_COMPLETE: "bg-green-500",
};

const MODE_COLORS: Record<string, string> = {
    DIY: "bg-gray-600",
    CONCIERGE: "bg-accent",
};

export default async function AdminProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen bg-dark text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-display font-bold">Projects Dashboard</h1>
                    <p className="text-gray-400">Manage all paid projects</p>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-6 py-4">Topic</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Docs</th>
                                <th className="px-6 py-4">Messages</th>
                                <th className="px-6 py-4">Updated</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No paid projects yet.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white truncate max-w-[200px]">
                                                {project.topic}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${MODE_COLORS[project.mode] || "bg-gray-500"}`}>
                                                {project.mode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[project.status] || "bg-gray-500"}`}>
                                                {project.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {project._count.documents}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {project._count.messages}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/projects/${project.id}`}
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
