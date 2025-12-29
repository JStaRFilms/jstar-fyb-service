import React from "react";

export const UpsellBanner = () => {
    return (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-primary to-purple-600 relative overflow-hidden text-center mt-8">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold font-display mb-2">Need a Human Touch?</h3>
                <p className="text-white/80 text-sm mb-4">
                    Our agency experts can review your code or write your defense speech.
                </p>
                <button className="px-6 py-3 bg-white text-primary font-bold rounded-xl text-sm hover:scale-105 transition-transform shadow-lg">
                    Hire an Expert
                </button>
            </div>
        </div>
    );
};
