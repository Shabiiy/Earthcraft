import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TOTAL_FRAMES = 240;
export const PRELOAD_THRESHOLD = 30; // Initial frames to unblock the site
export const globalImageCache = [];

const Preloader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const preloaderRef = useRef(null);
    const hasUnblocked = useRef(false);

    useEffect(() => {
        // document.body.style.overflow = "hidden"; // Removed as per request to avoid scroll-breaking CSS
        let imagesLoaded = 0;
        let criticalLoaded = 0;

        const loadAndDecode = async (i) => {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, '0');
            const extension = (i === 1 || i === TOTAL_FRAMES || i === TOTAL_FRAMES - 1) ? 'png' : 'jpg';
            img.src = `/assets/HeroSection/ezgif-frame-${paddedIndex}.${extension}`;
            
            try {
                // Off-main-thread decoding to prevent jank
                await img.decode();
                globalImageCache[i - 1] = img;
            } catch (err) {
                console.warn(`Failed to decode frame ${i}:`, err);
                globalImageCache[i - 1] = img;
            } finally {
                imagesLoaded++;
                
                // Track critical set for initial reveal
                if (i <= PRELOAD_THRESHOLD) {
                    criticalLoaded++;
                }

                // Update progress label based on TOTAL_FRAMES to keep UX consistent
                const progressPercentage = Math.floor((imagesLoaded / TOTAL_FRAMES) * 100);
                setProgress(progressPercentage);

                // Reveal site early if critical frames are ready
                if (criticalLoaded === PRELOAD_THRESHOLD && !hasUnblocked.current) {
                    hasUnblocked.current = true;
                    revealSite();
                }
            }
        };

        const revealSite = () => {
            gsap.to(preloaderRef.current, { 
                autoAlpha: 0, 
                duration: 1.2, 
                ease: "power2.inOut",
                onComplete: () => {
                    preloaderRef.current.style.display = 'none';
                    // document.body.style.overflow = "auto";
                    ScrollTrigger.refresh();
                    if (onComplete) onComplete();
                }
            });
        };

        // Initialize cache array
        globalImageCache.length = TOTAL_FRAMES;

        // Prioritized loading: Load critical frames first
        const loadSequentially = async () => {
            // Preload Logo
            const logo = new Image();
            logo.src = "/EC logo.png";
            try { await logo.decode(); } catch(e) {}

            // Group 1: Critical (First 30)
            const criticalPromises = [];
            for (let i = 1; i <= PRELOAD_THRESHOLD; i++) {
                criticalPromises.push(loadAndDecode(i));
            }
            await Promise.all(criticalPromises);

            // Group 2: Background (The rest)
            // We load these in smaller batches to avoid saturating the network/CPU
            const BATCH_SIZE = 10;
            for (let i = PRELOAD_THRESHOLD + 1; i <= TOTAL_FRAMES; i += BATCH_SIZE) {
                const batch = [];
                for (let j = 0; j < BATCH_SIZE && (i + j) <= TOTAL_FRAMES; j++) {
                    batch.push(loadAndDecode(i + j));
                }
                await Promise.all(batch);
            }
        };

        loadSequentially();

    }, [onComplete]);

    return (
        <div ref={preloaderRef} id="site-preloader" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <img src="/EC logo.png" alt="Earthcraft" style={{ width: '120px', marginBottom: '20px', opacity: 0.8 }} />
            <div id="preloader-progress" style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
                {progress}%
            </div>
            <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '15px', position: 'relative', overflow: 'hidden' }}>
                <div id="preloader-bar" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: '#fff', transition: 'width 0.1s linear' }}></div>
            </div>
        </div>
    );
};

export default Preloader;
