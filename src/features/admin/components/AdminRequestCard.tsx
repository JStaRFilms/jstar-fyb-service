
import { TopicSwitchRequest } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Check, X, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequestRowActions } from "@/app/admin/requests/RequestRowActions"; // Reuse actions
import { ProofModal } from "./ProofModal";

interface AdminRequestCardProps {
    request: TopicSwitchRequest & {
        project?: { topic: string };
        user?: { name: string | null; email: string };
    };
}

export function AdminRequestCard({ request }: AdminRequestCardProps) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-4">
            {/* Header: User & Status */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{request.user?.name || "Unknown User"}</div>
                        <div className="text-xs text-gray-500">{request.user?.email}</div>
                    </div>
                </div>
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    request.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                        request.status === 'approved' ? "bg-green-500/10 text-green-500" :
                            "bg-red-500/10 text-red-500"
                )}>
                    {request.status}
                </span>
            </div>

            {/* Request Details */}
            <div className="bg-black/20 rounded-lg p-3 space-y-2">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Current Topic</span>
                    <span className="text-sm text-gray-300 line-clamp-1">{request.project?.topic}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Reason</span>
                    <span className="text-sm text-white">
                        {request.reason === 'changed_mind' ? 'Changed Mind' : 'Lecturer Rejected'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(new Date(request.createdAt))} ago
                    </span>
                    {request.proofUrl && <ProofModal proofUrl={request.proofUrl} />}
                </div>

                <div className="flex items-center gap-2">
                    <RequestRowActions requestId={request.id} currentStatus={request.status} />
                </div>
            </div>
        </div>
    );
}
