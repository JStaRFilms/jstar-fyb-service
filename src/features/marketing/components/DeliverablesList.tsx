import { Check } from 'lucide-react';

interface DeliverablesListProps {
    deliverables: string[];
}

export function DeliverablesList({ deliverables }: DeliverablesListProps) {
    return (
        <ul className="space-y-3">
            {deliverables.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300 group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="group-hover:text-white transition-colors text-sm md:text-base">{item}</span>
                </li>
            ))}
        </ul>
    );
}
