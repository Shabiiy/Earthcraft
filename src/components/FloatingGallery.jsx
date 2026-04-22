import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FloatingGallery = () => {
    const galleryRef = useRef(null);
    const leftColRef = useRef(null);
    const centerColRef = useRef(null);
    const rightColRef = useRef(null);

    useEffect(() => {
        const leftTl = gsap.to(leftColRef.current, { 
            yPercent: -10, ease: "none", 
            scrollTrigger: { trigger: galleryRef.current, start: "top bottom", end: "bottom top", scrub: true }
        });
        const centerTl = gsap.to(centerColRef.current, { 
            yPercent: -30, ease: "none", 
            scrollTrigger: { trigger: galleryRef.current, start: "top bottom", end: "bottom top", scrub: true }
        });
        const rightTl = gsap.to(rightColRef.current, { 
            yPercent: -5, ease: "none", 
            scrollTrigger: { trigger: galleryRef.current, start: "top bottom", end: "bottom top", scrub: true }
        });

        return () => {
            if (leftTl.scrollTrigger) leftTl.scrollTrigger.kill();
            if (centerTl.scrollTrigger) centerTl.scrollTrigger.kill();
            if (rightTl.scrollTrigger) rightTl.scrollTrigger.kill();
            leftTl.kill();
            centerTl.kill();
            rightTl.kill();
        };
    }, []);

    return (
        <section className="native-sec floating-gallery" ref={galleryRef}>
            <div className="masonry-col col-left" ref={leftColRef}>
                <div className="gallery-item">
                    <img className="masonry-img" src="/Gallery/Design & Advisory Services.png" alt="Design & Advisory Services" loading="lazy" decoding="async" />
                    <p className="gallery-caption">Design & Advisory Services</p>
                </div>
                <div className="gallery-item">
                    <img className="masonry-img" src="/Gallery/ThomsonsCasa.png" alt="ThomsonsCasa" loading="lazy" decoding="async" />
                    <p className="gallery-caption">ThomsonsCasa</p>
                </div>
            </div>
            <div className="masonry-col col-center" ref={centerColRef}>
                <div className="gallery-item">
                    <img className="masonry-img" src="/Gallery/Hospitality & Lifetyle Spaces.png" alt="Hospitality & Lifestyle Spaces" loading="lazy" decoding="async" />
                    <p className="gallery-caption">Hospitality & Lifestyle Spaces</p>
                </div>
                <div className="gallery-item">
                    <img className="masonry-img" src="/Gallery/Thottam.png" alt="Thottam" loading="lazy" decoding="async" />
                    <p className="gallery-caption">Thottam</p>
                </div>
            </div>
            <div className="masonry-col col-right" ref={rightColRef}>
                <div className="gallery-item">
                    <img className="masonry-img" src="/Gallery/Residential Spaces.png" alt="Residential Spaces" loading="lazy" decoding="async" />
                    <p className="gallery-caption">Residential Spaces</p>
                </div>
                <div className="gallery-item">
                    <img className="masonry-img" src="/Gallery/Zaitoon.png" alt="Zaitoon" loading="lazy" decoding="async" />
                    <p className="gallery-caption">Zaitoon</p>
                </div>
            </div>
        </section>
    );
};

export default FloatingGallery;
