export const PRICING_CONFIG = {
    SAAS: {
        PAPER: { id: 'DIY_PAPER', label: 'Paper Only (DIY)', price: 15_000, popular: false },
        SOFTWARE: { id: 'DIY_SOFTWARE', label: 'Software + Paper (DIY)', price: 20_000, popular: false }
    },
    AGENCY: {
        PAPER: [
            { id: 'AGENCY_PAPER_EXPRESS', label: 'Paper Express', price: 60_000, popular: false },
            { id: 'AGENCY_PAPER_DEFENSE', label: 'Paper + Defense', price: 80_000, popular: true },
            { id: 'AGENCY_PAPER_PREMIUM', label: 'Paper Premium', price: 100_000, popular: false }
        ],
        SOFTWARE: [
            { id: 'AGENCY_CODE_GO', label: 'Code & Go', price: 120_000, popular: false },
            { id: 'AGENCY_DEFENSE_READY', label: 'Defense Ready', price: 200_000, popular: true },
            { id: 'AGENCY_SOFT_LIFE', label: 'The Soft Life', price: 320_000, popular: false }
        ]
    },
    // À la carte services - can be purchased on top of any plan
    ADD_ONS: [
        { id: 'ADDON_DEFENSE_SPEECH', label: 'Defense Speech Writing', price: 25_000, description: 'Professional speech for your project defense', icon: 'Mic' },
        { id: 'ADDON_CODE_REVIEW', label: 'Code Review & Debug', price: 20_000, description: 'Expert review of your software code', icon: 'Code' },
        { id: 'ADDON_CHAPTER_EDIT', label: 'Chapter Editing', price: 10_000, description: 'Polish and refine a single chapter', icon: 'FileEdit' },
        { id: 'ADDON_RUSH_DELIVERY', label: 'Rush Delivery', price: 15_000, description: '48-hour priority processing', icon: 'Zap' },
        { id: 'ADDON_DEEP_RESEARCH', label: 'AI Deep Research', price: 5_000, description: 'Automated research synthesis using Gemini Deep Research Agent', icon: 'Search' },
    ]
} as const;

export type PricingTrack = 'PAPER' | 'SOFTWARE';

export const getTierByPrice = (price: number) => {
    // Check SaaS
    if (price === PRICING_CONFIG.SAAS.PAPER.price) return PRICING_CONFIG.SAAS.PAPER;
    if (price === PRICING_CONFIG.SAAS.SOFTWARE.price) return PRICING_CONFIG.SAAS.SOFTWARE;

    // Check Agency
    const paperTier = PRICING_CONFIG.AGENCY.PAPER.find(t => t.price === price);
    if (paperTier) return paperTier;

    const softwareTier = PRICING_CONFIG.AGENCY.SOFTWARE.find(t => t.price === price);
    if (softwareTier) return softwareTier;

    return null;
};
