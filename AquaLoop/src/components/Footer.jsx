export default function Footer() {
    return (
        <footer className="w-full bg-primary pt-24 pb-12 px-6 md:px-16 relative z-40 text-text-light">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-text-light/10 pb-16">
                    <div className="md:col-span-6 flex flex-col lg:pr-12">
                        <h2 className="font-heading font-bold text-3xl tracking-tight mb-4 text-text-light">AquaLoop</h2>
                        <p className="font-heading text-text-light/60 max-w-md mb-12 leading-relaxed">
                            Smart water reuse for semiconductor fabs, turning single‑use rinse water into a closed, data‑driven loop.
                        </p>
                        <div className="mt-auto inline-flex items-center gap-3 bg-[#0A0A10] border border-text-light/10 px-4 py-2.5 rounded-full w-max mt-8 md:mt-0">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                            <span className="font-data text-[10px] uppercase tracking-widest text-text-light/80">System Operational</span>
                        </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-4 font-heading text-sm text-text-light/80">
                        <h4 className="font-bold text-text-light/40 uppercase tracking-widest mb-3 text-xs">Platform</h4>
                        <a href="#features" className="hover:text-accent transition-colors w-max">Features</a>
                        <a href="#philosophy" className="hover:text-accent transition-colors w-max">Philosophy</a>
                        <a href="#protocol" className="hover:text-accent transition-colors w-max">Protocol</a>
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-4 font-heading text-sm text-text-light/80">
                        <h4 className="font-bold text-text-light/40 uppercase tracking-widest mb-3 text-xs">Company</h4>
                        <a href="#" className="hover:text-accent transition-colors w-max">About Us</a>
                        <a href="#" className="hover:text-accent transition-colors w-max">Careers</a>
                        <a href="#" className="hover:text-accent transition-colors w-max">Contact</a>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-heading text-xs text-text-light/40">
                    <div>&copy; {new Date().getFullYear()} AquaLoop Inc. All rights reserved.</div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-text-light transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-text-light transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
