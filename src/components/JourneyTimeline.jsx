import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const JOURNEY_DATA = [
    { year: '2015', title: 'My first built project', desc: 'A breakthrough in sustainable residential architecture.' },
    { year: '2018', title: 'Multi-building Complex', desc: 'Scaling our vision to a community-level ecosystem.' },
    { year: '2019', title: 'Thomason Casa Building', desc: 'Winning international acclaim for biophilic integration.' },
    { year: '2022', title: 'Kochi Expansion', desc: 'Bringing Earthcraft philosophies to the coastal landscape.' },
    { year: '2025', title: 'Bangalore Project', desc: 'Redefining the urban skyline with living architectural skins.' }
];

const JourneyTimeline = () => {
    const sectionRef = useRef(null);
    const stickyRef = useRef(null);
    const pathRef = useRef(null);
    const milestoneRefs = useRef([]);
    const nodeRefs = useRef([]);

    useEffect(() => {
        const path = pathRef.current;
        const length = path.getTotalLength();

        // 1. Setup Path
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
        });

        // 2. Single Master Timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                pin: stickyRef.current,
                pinSpacing: true, 
                anticipatePin: 1
            }
        });

        // Path Drawing (0 to 1)
        tl.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            duration: 1
        }, 0);

        // Milestones and Nodes
        JOURNEY_DATA.forEach((_, index) => {
            const milestone = milestoneRefs.current[index];
            const node = nodeRefs.current[index];
            
            // Normalized position along the timeline (approximate)
            const startTime = (index / (JOURNEY_DATA.length - 1)) * 0.9; 

            // Checkpoint Node
            tl.fromTo(node, 
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.1, ease: "back.out(2)" },
                startTime
            );

            // Text Content
            tl.fromTo(milestone,
                { opacity: 0, y: 30, filter: 'blur(10px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.15, ease: "power2.out" },
                startTime + 0.02
            );
        });

        // Ensure nodes are aligned with path points (calculated by percentage)
        const updateNodes = () => {
            JOURNEY_DATA.forEach((_, i) => {
                const node = nodeRefs.current[i];
                if (node) {
                    const point = path.getPointAtLength((i / (JOURNEY_DATA.length - 1)) * length);
                    node.setAttribute('cx', point.x);
                    node.setAttribute('cy', point.y);
                }
            });
        };
        
        updateNodes();
        window.addEventListener('resize', updateNodes);

        return () => {
            window.removeEventListener('resize', updateNodes);
            if (tl.scrollTrigger) tl.scrollTrigger.kill();
            tl.kill();
        };
    }, []);

    return (
        <section ref={sectionRef} className="journey-timeline-section">
            <div ref={stickyRef} className="journey-sticky">
                <div className="journey-inner">
                    <h2 className="journey-header">Our Journey</h2>
                    
                    <svg viewBox="0 0 1000 1200" className="journey-svg-main" preserveAspectRatio="xMidYMid meet">
                        {/* Static track */}
                        <path 
                            d="M500,50 C300,200 700,400 500,600 C300,800 700,1000 500,1150" 
                            className="journey-track"
                        />
                        {/* Animated path */}
                        <path 
                            ref={pathRef}
                            d="M500,50 C300,200 700,400 500,600 C300,800 700,1000 500,1150" 
                            className="journey-active-line"
                        />

                        {/* Milestones Nodes */}
                        {JOURNEY_DATA.map((_, i) => (
                            <circle 
                                key={i}
                                ref={el => nodeRefs.current[i] = el}
                                r="10"
                                className="journey-node-point"
                            />
                        ))}
                    </svg>

                    <div className="journey-milestones-container">
                        {JOURNEY_DATA.map((item, i) => (
                            <div 
                                key={i} 
                                ref={el => milestoneRefs.current[i] = el}
                                className={`journey-card ${i % 2 === 0 ? 'left' : 'right'}`}
                                style={{ top: `${(i / (JOURNEY_DATA.length - 1)) * 70 + 15}%` }}
                            >
                                <div className="card-content">
                                    <span className="card-year">{item.year}</span>
                                    <h3 className="card-title">{item.title}</h3>
                                    <p className="card-desc">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default JourneyTimeline;
