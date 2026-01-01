'use client';

import { PRICING_CONFIG } from "@/config/pricing";
import { Mic, Code, FileEdit, CheckCircle, ArrowRight, Sparkles, Zap, BadgeCheck, Search } from "lucide-react";
import Link from "next/link";
import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useEffect, useState } from "react";

const iconMap: Record<string, React.ElementType> = {
    Mic, Code, FileEdit, CheckCircle, Zap, Search,
};

export default function ServicesPage() {
    const { data } = useBuilderStore();
    const projectId = data.projectId;
    const [purchasedServices, setPurchasedServices] = useState<string[]>([]);

    // Fetch purchased services for this project
    useEffect(() => {
        if (projectId) {
            fetch(`/api/services/purchased?projectId=${projectId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.services) {
                        setPurchasedServices(data.services);
                    }
                })
                .catch(console.error);
        }
    }, [projectId]);

    return (
        <div className="min-h-screen bg-dark text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4" />
                        Expert Services
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-display font-bold mb-4">Need a Human Touch?</h1>
                    <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                        Our agency experts can help with specific tasks. Add these services to your existing project.
                    </p>
                </header>

                {/* Service Cards - Single column on mobile, 2 columns on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {PRICING_CONFIG.ADD_ONS.map((service) => {
                        const Icon = iconMap[service.icon] || CheckCircle;
                        const isPurchased = purchasedServices.includes(service.id);

                        return (
                            <div
                                key={service.id}
                                className={`group bg-white/5 border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${isPurchased
                                    ? 'border-green-500/30 opacity-75'
                                    : 'border-white/10 hover:border-primary/50 hover:scale-[1.02]'
                                    }`}
                            >
                                {/* Icon + Title Row */}
                                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${isPurchased ? 'bg-green-500/10' : 'bg-primary/10'
                                        }`}>
                                        {isPurchased ? (
                                            <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                                        ) : (
                                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base sm:text-lg mb-1">{service.label}</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm">{service.description}</p>
                                    </div>
                                </div>

                                {/* Price + Button - Stacked on mobile */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <span className={`text-xl sm:text-2xl font-bold ${isPurchased ? 'text-green-400' : 'text-primary'}`}>
                                        {isPurchased ? 'Purchased' : `₦${service.price.toLocaleString()}`}
                                    </span>

                                    {isPurchased ? (
                                        <span className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg font-bold text-sm text-center">
                                            ✓ Complete
                                        </span>
                                    ) : (
                                        <Link
                                            href={`/services/${service.id}`}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                                        >
                                            Buy Now
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Back Link */}
                <div className="text-center mt-8 sm:mt-12">
                    <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
