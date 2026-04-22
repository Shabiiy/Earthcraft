import React, { useEffect } from 'react';
import gsap from 'gsap';

const Header = ({ isMenuOpen, setIsMenuOpen }) => {
    useEffect(() => {
        const layoutPills = () => {
            document.querySelectorAll('.pill').forEach(pill => {
                const circle = pill.querySelector('.hover-circle');
                if (!circle) return;
                
                const rect = pill.getBoundingClientRect();
                const w = rect.width;
                const h = rect.height;
                const R = ((w * w) / 4 + h * h) / (2 * h);
                const D = Math.ceil(2 * R) + 2;
                const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                const originY = D - delta;

                circle.style.width = `${D}px`;
                circle.style.height = `${D}px`;
                circle.style.bottom = `-${delta}px`;

                gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

                const label = pill.querySelector('.pill-label');
                const white = pill.querySelector('.pill-label-hover');

                if (label) gsap.set(label, { y: 0 });
                if (white) gsap.set(white, { y: h + 12, opacity: 0 });
                
                pill._animTl = gsap.timeline({ paused: true });
                pill._animTl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.45, ease: "power3.out", overwrite: 'auto' }, 0);
                if (label) {
                    pill._animTl.to(label, { y: -(h + 8), duration: 0.45, ease: "power3.out", overwrite: 'auto' }, 0);
                }
                if (white) {
                    gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
                    pill._animTl.to(white, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", overwrite: 'auto' }, 0);
                }
            });
        };
        
        layoutPills();
        window.addEventListener("resize", layoutPills);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(layoutPills);
        }

        const handleMouseEnter = (e) => {
            const pill = e.currentTarget;
            if(pill._activeTween) pill._activeTween.kill();
            pill._activeTween = pill._animTl.tweenTo(pill._animTl.duration(), { duration: 0.35, ease: "power2.out", overwrite: 'auto' });
        };
        const handleMouseLeave = (e) => {
            const pill = e.currentTarget;
            if(pill._activeTween) pill._activeTween.kill();
            pill._activeTween = pill._animTl.tweenTo(0, { duration: 0.25, ease: "power2.out", overwrite: 'auto' });
        };
        
        document.querySelectorAll('.pill').forEach(pill => {
            pill.addEventListener("mouseenter", handleMouseEnter);
            pill.addEventListener("mouseleave", handleMouseLeave);
        });

        return () => {
            window.removeEventListener("resize", layoutPills);
            document.querySelectorAll('.pill').forEach(pill => {
                pill.removeEventListener("mouseenter", handleMouseEnter);
                pill.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, []);

    return (
        <header className="header">
            <div className="logo">
                <img src="/EC logo.png" alt="Earthcraft Logo" loading="eager" fetchPriority="high" decoding="async" width="120" height="40" />
            </div>
            <nav className="nav-links glass">
                <a href="#" className="pill">
                    <span className="hover-circle" aria-hidden="true"></span>
                    <span className="label-stack">
                        <span className="pill-label">DESIGN & BUILD</span>
                        <span className="pill-label-hover" aria-hidden="true">DESIGN & BUILD</span>
                    </span>
                </a>
                <a href="#" className="pill">
                    <span className="hover-circle" aria-hidden="true"></span>
                    <span className="label-stack">
                        <span className="pill-label">INTERIORS</span>
                        <span className="pill-label-hover" aria-hidden="true">INTERIORS</span>
                    </span>
                </a>
                <a href="#" className="pill">
                    <span className="hover-circle" aria-hidden="true"></span>
                    <span className="label-stack">
                        <span className="pill-label">COMMUNITIES</span>
                        <span className="pill-label-hover" aria-hidden="true">COMMUNITIES</span>
                    </span>
                </a>
            </nav>
            <button className="hamburger" aria-label="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span style={{ transform: isMenuOpen ? 'translateY(14px) rotate(45deg)' : 'none' }}></span>
                <span style={{ opacity: isMenuOpen ? '0' : '1' }}></span>
                <span style={{ transform: isMenuOpen ? 'translateY(-14px) rotate(-45deg)' : 'none' }}></span>
            </button>
        </header>
    );
};

export default Header;
