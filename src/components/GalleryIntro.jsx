import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GalleryIntro = () => {
    const secRef = useRef(null);
    const wrapRef = useRef(null);
    const shellRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        const shell = shellRef.current;
        
        let initialUntil = performance.now() + 1200;
        let running = false;
        let rafId = null;
        let lastTs = 0;
        let currentX = wrap.clientWidth / 2;
        let currentY = 60; 
        let targetX = wrap.clientWidth / 2;
        let targetY = wrap.clientHeight / 2;

        const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
        const round = (v, p = 3) => parseFloat(v.toFixed(p));
        const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

        const setVars = (x, y) => {
            const width = wrap.clientWidth || 1;
            const height = wrap.clientHeight || 1;
            const percentX = clamp((100 / width) * x);
            const percentY = clamp((100 / height) * y);
            const centerX = percentX - 50;
            const centerY = percentY - 50;

            wrap.style.setProperty('--pointer-x', `${percentX}%`);
            wrap.style.setProperty('--pointer-y', `${percentY}%`);
            wrap.style.setProperty('--background-x', `${adjust(percentX, 0, 100, 35, 65)}%`);
            wrap.style.setProperty('--background-y', `${adjust(percentY, 0, 100, 35, 65)}%`);
            wrap.style.setProperty('--pointer-from-center', `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`);
            wrap.style.setProperty('--pointer-from-top', `${percentY / 100}`);
            wrap.style.setProperty('--pointer-from-left', `${percentX / 100}`);
            wrap.style.setProperty('--rotate-x', `${round(-(centerX / 5))}deg`);
            wrap.style.setProperty('--rotate-y', `${round(centerY / 4)}deg`);
        };

        const step = ts => {
            if (!running) return;
            if (lastTs === 0) lastTs = ts;
            const dt = (ts - lastTs) / 1000;
            lastTs = ts;

            const tau = ts < initialUntil ? 0.6 : 0.14;
            const k = 1 - Math.exp(-dt / tau);

            currentX += (targetX - currentX) * k;
            currentY += (targetY - currentY) * k;

            setVars(currentX, currentY);

            const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

            if (stillFar) {
                rafId = requestAnimationFrame(step);
            } else {
                running = false;
                lastTs = 0;
                if (rafId) cancelAnimationFrame(rafId);
            }
        };

        const startTilt = () => {
            if (running) return;
            running = true;
            lastTs = 0;
            rafId = requestAnimationFrame(step);
        };

        const handlePointerEnter = (e) => {
            shell.classList.add('active', 'entering');
            setTimeout(() => shell.classList.remove('entering'), 180);
            const rect = shell.getBoundingClientRect();
            targetX = e.clientX - rect.left;
            targetY = e.clientY - rect.top;
            startTilt();
        };

        const handlePointerMove = (e) => {
            const rect = shell.getBoundingClientRect();
            targetX = e.clientX - rect.left;
            targetY = e.clientY - rect.top;
            startTilt();
        };

        const handlePointerLeave = () => {
            targetX = wrap.clientWidth / 2;
            targetY = wrap.clientHeight / 2;
            const checkSettle = () => {
                if (Math.hypot(targetX - currentX, targetY - currentY) < 0.6) {
                    shell.classList.remove('active');
                } else {
                    requestAnimationFrame(checkSettle);
                }
            };
            requestAnimationFrame(checkSettle);
        };

        shell.addEventListener("pointerenter", handlePointerEnter);
        shell.addEventListener("pointermove", handlePointerMove);
        shell.addEventListener("pointerleave", handlePointerLeave);

        setVars(currentX, currentY);
        startTilt();

        // GSAP Scroll Animations
        let expandTl = gsap.timeline({
            scrollTrigger: {
                trigger: secRef.current,
                start: "top top", 
                end: "+=400%",        
                pin: true,            
                scrub: 0.8, // More responsive for scroll-back
                fastScrollEnd: true,
                preventOverlaps: true
            }
        });

        expandTl.to(wrap, { scale: 18, duration: 2, ease: "power2.in", force3D: true }, 0);
        gsap.set(textRef.current, { xPercent: -50, yPercent: -50, scale: 0.95 });
        expandTl.to(textRef.current, { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out", force3D: true }, 1);

        return () => {
            shell.removeEventListener("pointerenter", handlePointerEnter);
            shell.removeEventListener("pointermove", handlePointerMove);
            shell.removeEventListener("pointerleave", handlePointerLeave);
            if (rafId) cancelAnimationFrame(rafId);
            if (expandTl.scrollTrigger) expandTl.scrollTrigger.kill();
            expandTl.kill();
        };
    }, []);

    return (
        <section className="native-sec gallery-intro-sequence" ref={secRef}>
            <div className="pc-card-wrapper" id="people-card" style={{ "--icon": "none", "--grain": "none" }} ref={wrapRef}>
                <div className="pc-behind"></div>
                <div className="pc-card-shell" ref={shellRef}>
                    <section className="pc-card">
                        <div className="pc-inside"></div>
                    </section>
                </div>
            </div>
            <h2 id="gallery-reveal-text" className="sequence-title" ref={textRef} style={{ position: 'absolute', top: '50%', left: '50%', opacity: 0 }}>OUR UPDATES</h2>
        </section>
    );
};

export default GalleryIntro;
