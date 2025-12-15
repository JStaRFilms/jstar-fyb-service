import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
    // Graceful fallback if DB is not ready
    let leads: any[] = [];
    try {
        leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("DB Error", e);
    }

    return (
        <div className="min-h-screen bg-dark text-white p-8 font-sans">
            <h1 className="text-3xl font-display font-bold mb-8">Lead Capture Dashboard</h1>

            <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left bg-white/5">
                    <thead className="bg-white/10 text-gray-400 uppercase text-xs font-mono">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">WhatsApp</th>
                            <th className="p-4">Dept</th>
                            <th className="p-4">Original Topic</th>
                            <th className="p-4">AI Twist</th>
                            <th className="p-4">Complexity</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">No leads found yet.</td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(lead.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-mono text-accent">{lead.whatsapp}</td>
                                    <td className="p-4 text-sm">{lead.department}</td>
                                    <td className="p-4 text-sm text-gray-400 max-w-xs truncate" title={lead.topic}>
                                        {lead.topic}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-white max-w-xs truncate" title={lead.twist}>
                                        {lead.twist}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            {[...Array(lead.complexity)].map((_, i) => (
                                                <div key={i} className={`w-1 h-3 rounded-full ${lead.complexity > 3 ? 'bg-red-500' : 'bg-green-500'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                            {lead.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
