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
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8, // 8px gap
                left: rect.right - 224, // 224px = w-56 dropdown width, align right
            });
        }
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on scroll (since it's fixed position)
    useEffect(() => {
        if (isOpen) {
            const handleScroll = () => setIsOpen(false);
            window.addEventListener("scroll", handleScroll, true);
            return () => window.removeEventListener("scroll", handleScroll, true);
        }
    }, [isOpen]);

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
        } catch (error) {
            alert("❌ Error generating link");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
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

            {/* Portal-like fixed dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="fixed w-56 bg-[#0f0c29] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden"
                    style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                >
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
        </>
    );
}

