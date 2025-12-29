"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, CreditCard, ChevronDown } from "lucide-react";

interface SendPaymentLinkButtonProps {
    leadId: string;
}

const PRICING_TIERS = {
    BASIC: { label: "Basic Plan", amount: 15000 },
    STANDARD: { label: "Standard Plan", amount: 30000 },
    PREMIUM: { label: "Premium Plan", amount: 50000 },
};

export function SendPaymentLinkButton({ leadId }: SendPaymentLinkButtonProps) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleGenerateLink = async (key: keyof typeof PRICING_TIERS) => {
        setLoading(true);
        setIsOpen(false);
        const tier = PRICING_TIERS[key];

        try {
            const res = await fetch(`/api/admin/leads/${leadId}/send-payment-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: tier.amount,
                    tier: tier.label,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to generate link");

            // Success - Copy to clipboard
            await navigator.clipboard.writeText(data.authorizationUrl);
            alert(`✅ Link for ${tier.label} copied to clipboard!`);
            // Optionally open in new tab: window.open(data.authorizationUrl, "_blank");
        } catch (error) {
            alert("❌ Error generating link");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <CreditCard className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Send Pay Link</span>
                <ChevronDown className="h-3 w-3" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f0c29] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                    {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                        <button
                            key={key}
                            onClick={() => handleGenerateLink(key as keyof typeof PRICING_TIERS)}
                            className="w-full text-left px-4 py-3 hover:bg-primary/20 transition-colors border-b border-white/5 last:border-b-0"
                        >
                            <div className="font-medium text-white">{tier.label}</div>
                            <div className="text-xs text-gray-400">₦{tier.amount.toLocaleString()}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
