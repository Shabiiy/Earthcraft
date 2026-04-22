import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOTAL_FRAMES, globalImageCache } from './Preloader';

gsap.registerPlugin(ScrollTrigger);

const HeroSequence = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Performance & Smoothness State
    const targetFrame = useRef(0);
    const currentFrame = useRef(0);
    const text1Ref = useRef(null);
    const logoRef = useRef(null);
    const text2Ref = useRef(null);
    const hazeRef = useRef(null);
    const text3Ref = useRef(null);
    const lastTime = useRef(performance.now());
    const lastRenderedBase = useRef(-1);
    const idleTimer = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: true
        });
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        

        const getDrawParams = (img) => {
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            return {
                ratio,
                shiftX: (canvas.width - img.width * ratio) / 2,
                shiftY: (canvas.height - img.height * ratio) / 2,
                w: img.width,
                h: img.height
            };
        };

        const renderFrames = (frame) => {
            const base = Math.floor(frame);
            const next = Math.min(base + 1, TOTAL_FRAMES - 1);
            const alpha = frame - base;

            const imgBase = globalImageCache[base];
            const imgNext = globalImageCache[next];

            if (!imgBase || !imgBase.complete) return;

            // Render Base Frame
            const b = getDrawParams(imgBase);
            ctx.globalAlpha = 1;
            ctx.drawImage(imgBase, 0, 0, b.w, b.h, b.shiftX, b.shiftY, b.w * b.ratio, b.h * b.ratio);

            // Blend Next Frame if available and ready
            if (alpha > 0.01 && imgNext && imgNext.complete) {
                const n = getDrawParams(imgNext);
                ctx.globalAlpha = alpha;
                ctx.drawImage(imgNext, 0, 0, n.w, n.h, n.shiftX, n.shiftY, n.w * n.ratio, n.h * n.ratio);
            }
            
            lastRenderedBase.current = base;
        };


        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            lastRenderedBase.current = -1;
            renderFrames(currentFrame.current);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Visibility tracking to pause animation when off-screen
        let isVisible = true;
        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
        }, { threshold: 0 });
        observer.observe(containerRef.current);

        let rafId;
        const animate = (now) => {
            if (!isVisible) {
                rafId = requestAnimationFrame(animate);
                return;
            }

            const dt = now - lastTime.current;
            lastTime.current = now;

            const deltaProgress = targetFrame.current - currentFrame.current;
            if (Math.abs(deltaProgress) > 0.0001) {
                const speed = 0.07 * (dt / 16.67);
                currentFrame.current += deltaProgress * Math.min(speed, 1);
                renderFrames(currentFrame.current);
            }
            
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);

        // Initial render check: Ensure frame 0 is drawn as soon as it's available
        const checkInitialFrame = setInterval(() => {
            if (globalImageCache[0] && globalImageCache[0].complete) {
                renderFrames(0);
                clearInterval(checkInitialFrame);
            }
        }, 100);

        let ctxAnim = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=1000%', 
                    pin: true,
                    scrub: 0.8,
                    snap: {
                        snapTo: [0, 0.25, 0.5, 0.75, 1], 
                        duration: { min: 0.6, max: 1.2 },
                        delay: 0.1,
                        ease: "power2.inOut"
                    },
                    onUpdate: (self) => {
                        const adjustedProgress = Math.min(1, self.progress / 0.85);
                        targetFrame.current = adjustedProgress * (TOTAL_FRAMES - 1);
                        
                        if (window.pauseSplashCursor) window.pauseSplashCursor(true);
                        
                        if (idleTimer.current) clearTimeout(idleTimer.current);
                        idleTimer.current = setTimeout(() => {
                            if (window.pauseSplashCursor) window.pauseSplashCursor(false);
                        }, 150);
                    },
                    onToggle: (self) => {
                        if (!self.isActive && window.pauseSplashCursor) {
                            window.pauseSplashCursor(false);
                        }
                    }
                }
            });

            // 1st text + logo: Present at load, slides UP and fades on scroll
            gsap.set([text1Ref.current, logoRef.current], { opacity: 1, y: 0 });
            tl.to([text1Ref.current, logoRef.current], 
                { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, 
                0.05
            );

            // 2nd text: Precise 4-point interpolation [0.35, 0.45, 0.55, 0.65]
            // Start Fade In at 0.35, Fully Visible at 0.45, Hold until 0.55, Fade Out by 0.65
            gsap.set([text2Ref.current, hazeRef.current], { opacity: 0, y: 40 });
            tl.to([text2Ref.current, hazeRef.current], 
                { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, 
                0.35
            );
            tl.to([text2Ref.current, hazeRef.current], 
                { opacity: 0, y: -40, duration: 0.1, ease: "power2.in" }, 
                0.55
            );

            // 3rd text: Final beat [0.8, 0.9, 1.0]
            gsap.set(text3Ref.current, { opacity: 0, y: 20 });
            tl.to(text3Ref.current, 
                { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, 
                0.8
            );
        }, containerRef);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(rafId);
            clearInterval(checkInitialFrame);
            observer.disconnect();
            ctxAnim.revert(); // Clean up all GSAP animations and ScrollTriggers
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (window.pauseSplashCursor) window.pauseSplashCursor(false);
        };
    }, []);

    return (
        <section ref={containerRef} className="hero-canvas-sequence" style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#000', overflow: 'hidden', contain: 'layout paint' }}>
            <canvas 
                ref={canvasRef} 
                style={{ 
                    display: 'block', 
                    width: '100vw', 
                    height: '100vh', 
                    backgroundColor: '#000',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    contain: 'strict'
                }} 
            />

            <div className="abs-text top-right">
                <div className="branding-block">
                    <img ref={logoRef} src="/EC logo.png" alt="Earthcraft" className="sequence-logo" />
                    <h1 ref={text1Ref} className="sequence-title tiny color-green">
                        Building with nature,<br />Crafting the future
                    </h1>
                </div>
            </div>

            <div className="abs-text center-middle">
                <div ref={hazeRef} className="text-haze" />
                <h2 ref={text2Ref} className="sequence-title color-brown">
                    Where Space Breathe,<br />and souls belong
                </h2>
            </div>

            <div className="abs-text bottom-right">
                <p ref={text3Ref} className="sequence-title small color-brown">
                    for a thoughtful planet
                </p>
            </div>
        </section>
    );

};



export default HeroSequence;
