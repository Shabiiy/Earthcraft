import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const glowRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const glow = glowRef.current;

        if (!cursor || !glow) return;

        // Define global pause function expected by other components
        window.pauseSplashCursor = (paused) => {
            if (paused) {
                gsap.to([cursor, glow], { opacity: 0, duration: 0.2 });
            } else {
                gsap.to([cursor, glow], { opacity: 1, duration: 0.3 });
            }
        };

        // Position tracking
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mouse = { x: pos.x, y: pos.y };

        const updateMouse = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('mousemove', updateMouse);

        // Smooth follow logic using GSAP ticker
        const xSetCursor = gsap.quickSetter(cursor, "x", "px");
        const ySetCursor = gsap.quickSetter(cursor, "y", "px");
        const xSetGlow = gsap.quickSetter(glow, "x", "px");
        const ySetGlow = gsap.quickSetter(glow, "y", "px");

        const tick = () => {
            const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
            pos.x += (mouse.x - pos.x) * dt;
            pos.y += (mouse.y - pos.y) * dt;

            xSetCursor(mouse.x - 2.5);
            ySetCursor(mouse.y - 2.5);
            xSetGlow(mouse.x - 17.5);
            ySetGlow(mouse.y - 17.5);
        };

        gsap.ticker.add(tick);

        // Hover effect logic
        const handleMouseEnter = () => {
            cursor.classList.add('hover');
            glow.classList.add('hover');
        };

        const handleMouseLeave = () => {
            cursor.classList.remove('hover');
            glow.classList.remove('hover');
        };

        // MutationObserver to handle dynamic elements (like Pills in Header)
        const updateInteractions = () => {
            const elements = document.querySelectorAll('a, button, .pill, .gallery-item, .pc-card-wrapper, .minimal-submit');
            elements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        const observer = new MutationObserver(updateInteractions);
        observer.observe(document.body, { childList: true, subtree: true });
        updateInteractions();

        return () => {
            window.removeEventListener('mousemove', updateMouse);
            gsap.ticker.remove(tick);
            observer.disconnect();
            delete window.pauseSplashCursor;
        };
    }, []);

    return (
        <>
            <div ref={cursorRef} className="custom-cursor"></div>
            <div ref={glowRef} className="cursor-glow"></div>
        </>
    );
};


export default CustomCursor;
