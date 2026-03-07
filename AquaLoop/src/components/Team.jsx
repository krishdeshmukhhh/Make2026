import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Linkedin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
    {
        name: "Krish Deshmukh",
        role: "Software",
        focus: "Landing Page and Dashboard",
        tags: ["Front-End", "AI", "Dashboard"],
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
        links: { github: "#", linkedin: "#" }
    },
    {
        name: "Kuldeep Debnath",
        role: "Software",
        focus: "AI Model",
        tags: ["Front-End", "AI", "Dashboard"],
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
        links: { github: "#", linkedin: "#" }
    },
    {
        name: "Khushi Karanpuria",
        role: "Embedded Hardware",
        focus: "Develops the C++ sensor firmware and high-frequency WebSocket bridges.",
        tags: ["C++", "IoT / Sensors", "Python"],
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&q=80",
        links: { github: "#", linkedin: "#" }
    },
    {
        name: "Gavin Sun",
        role: "Machine Learning",
        focus: "Trains the predictive models that dynamically anticipate water purity thresholds.",
        tags: ["PyTorch", "Data Science", "Telemetry"],
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
        links: { github: "#", linkedin: "#" }
    }
];

export default function Team() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.team-header-block > *', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                }
            });

            gsap.from('.team-card', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="team"
            ref={sectionRef}
            className="relative w-full bg-white pt-24 pb-32 z-20"
        >
            <div className="max-w-6xl mx-auto px-6">

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left Column: Heading Block */}
                    <div className="team-header-block lg:w-[35%] flex flex-col pt-4">
                        <div className="font-data text-xs text-accent tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-accent/50 block"></span>
                            Control Crew
                        </div>
                        <h2 className="font-heading font-bold text-4xl md:text-5xl text-black tracking-tight mb-6 leading-tight">
                            The operators behind the{' '}
                            <span className="font-drama italic text-accent pr-1">system.</span>
                        </h2>
                        <p className="font-heading text-black/60 text-lg leading-relaxed max-w-sm">
                            Engineered for operational rigor and absolute reliability. Bringing industrial precision and human craft to water intelligence.
                        </p>
                    </div>

                    {/* Right Column: Team Grid */}
                    <div className="lg:w-[65%] grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {TEAM_MEMBERS.map((member, idx) => (
                            <div
                                key={idx}
                                className="team-card group relative bg-white rounded-[2rem] border border-gray-200 p-6 shadow-md overflow-hidden hover:-translate-y-2 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 ease-out flex flex-col h-full"
                            >
                                {/* Top Row */}
                                <div className="flex items-center gap-4 mb-5 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 group-hover:border-accent/40 group-hover:scale-105 transition-all duration-500 shadow-sm flex-shrink-0">
                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col group-hover:-translate-y-[1px] transition-transform duration-500">
                                        <h3 className="font-heading font-bold text-lg text-black">{member.name}</h3>
                                        <span className="font-data text-[10px] text-accent tracking-widest uppercase mt-0.5">{member.role}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                    {member.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="px-2.5 py-1 text-[9px] uppercase font-data tracking-widest bg-gray-100 text-gray-600 border border-gray-200 rounded-full group-hover:border-accent/30 group-hover:bg-accent/5 group-hover:text-black transition-colors duration-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Focus Statement */}
                                <div className="mt-auto relative z-10">
                                    <p className="font-heading text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4 group-hover:text-black transition-colors duration-300">
                                        {member.focus}
                                    </p>
                                </div>

                                {/* Hover Icons */}
                                <div className="absolute top-6 right-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-x-4 group-hover:translate-x-0">
                                    {member.links?.github && (
                                        <a href={member.links.github} className="text-gray-400 hover:text-accent transition-colors">
                                            <Github size={16} strokeWidth={2} />
                                        </a>
                                    )}
                                    {member.links?.linkedin && (
                                        <a href={member.links.linkedin} className="text-gray-400 hover:text-accent transition-colors">
                                            <Linkedin size={16} strokeWidth={2} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
