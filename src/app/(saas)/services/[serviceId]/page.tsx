'use client';

import { PRICING_CONFIG } from "@/config/pricing";
import { Mic, Code, FileEdit, CheckCircle, Zap, ArrowLeft, ShieldCheck, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useBuilderStore } from "@/features/builder/store/useBuilderStore";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
    Mic, Code, FileEdit, CheckCircle, Zap, Search,
};

export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams<{ serviceId: string }>();
    const { data } = useBuilderStore();
    const projectId = data.projectId;
    const [isLoading, setIsLoading] = useState(false);

    const service = PRICING_CONFIG.ADD_ONS.find(s => s.id === params.serviceId);
    const Icon = service ? (iconMap[service.icon] || CheckCircle) : CheckCircle;

    if (!service) {
        return (
            <div className="min-h-screen bg-dark text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
                    <Link href="/services" className="text-primary hover:underline">← Back to Services</Link>
                </div>
            </div>
        );
    }

    const handlePurchase = async () => {
        if (!projectId) {
            toast.error("No project found. Please create a project first.");
            router.push("/project/builder");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/services/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId: service.id, projectId })
            });

            const data = await res.json();

            if (data.success && data.authorizationUrl) {
                window.location.href = data.authorizationUrl;
            } else {
                toast.error(data.error || "Failed to initialize payment");
            }
        } catch (error) {
            console.error("Purchase error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white p-8">
            <div className="max-w-2xl mx-auto">
                {/* Back Link */}
                <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Services
                </Link>

                {/* Service Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{service.label}</h1>
                            <p className="text-gray-400">{service.description}</p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-black/20 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Service Price</span>
                            <span className="text-3xl font-bold text-primary">₦{service.price.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-400" />
                            Secure Payment
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Delivered within 72hrs
                        </div>
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={isLoading}
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Proceed to Payment</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
