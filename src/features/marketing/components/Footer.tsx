import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black py-20">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-display font-bold mb-8">Ready to graduate in style?</h2>
                <Link
                    href="/auth/register"
                    className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-wider hover:bg-primary hover:border-primary transition-all duration-300 text-white mb-12"
                >
                    Get Started Now
                </Link>
                <p className="text-gray-500">J Star FYB Service © 2025. All rights reserved.</p>
            </div>
        </footer>
    );
}
