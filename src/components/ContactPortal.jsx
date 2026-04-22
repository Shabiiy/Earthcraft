import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CircularText from '../CircularText';

gsap.registerPlugin(ScrollTrigger);

const ContactPortal = () => {
    const wrapperRef = useRef(null);
    const cardRef = useRef(null);
    const portalSecRef = useRef(null);
    const contactSecRef = useRef(null);

    useEffect(() => {
        let portalTl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapperRef.current,
                start: "top top",
                end: "+=200%",
                pin: true,
                scrub: 0.8,
                fastScrollEnd: true,
                preventOverlaps: true
            }
        });

        // Animate the radial mask "hole" expansion
        portalTl.to(cardRef.current, {
            '--hole-radius': '150vw',
            duration: 2,
            ease: "power2.in"
        }, 0);

        // Expand the circular text as the hole opens - ensuring it stays OUTSIDE the hole
        portalTl.to('.portal-text-wrapper', {
            scale: 25, // Dramatically increased to stay ahead of the 150vw hole expansion
            opacity: 0,
            duration: 2,
            ease: "power2.in"
        }, 0);

        // Reveal the contact section contents as the hole expands
        portalTl.to(contactSecRef.current, {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, 0.5);

        // Fade out the mask section at the end
        portalTl.to(portalSecRef.current, {
            opacity: 0,
            duration: 0.5
        }, 1.8);

        return () => {
            if (portalTl.scrollTrigger) portalTl.scrollTrigger.kill();
            portalTl.kill();
        };
    }, []);

    return (
        <div className="portal-and-contact-wrapper" style={{ position: 'relative', width: '100%', minHeight: '100vh' }} ref={wrapperRef}>
            <section className="native-sec contact-sec" ref={contactSecRef}>
                <h2 className="contact-title">CONTACT</h2>
                <form className="contact-form" onSubmit={e => e.preventDefault()}>
                    <input type="text" className="minimal-input" placeholder="Full Name" />
                    <input type="email" className="minimal-input" placeholder="Email Address" />
                    <div className="inline-inputs">
                        <input type="text" className="minimal-input" placeholder="Country" />
                        <input type="text" className="minimal-input" placeholder="City" />
                    </div>
                    <textarea className="minimal-input context-area" placeholder="Context for Admission"></textarea>
                    
                    <label className="custom-checkbox">
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        I understand that details is reviewed selectively...
                    </label>
                    
                    <button type="submit" className="minimal-submit">SUBMIT</button>
                </form>
            </section>

            <section className="native-sec portal-sequence overlay-portal" ref={portalSecRef}>
                <div className="bg-portal-card" id="contact-door" ref={cardRef} />
                <div className="portal-text-wrapper" style={{ 
                    position: 'absolute', 
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 61,
                    width: '210px',
                    height: '210px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'none'
                }}>
                    <CircularText text="EARTHCRAFT • ARCHITECTURE • DESIGN • BUILD • " spinDuration={25} />
                </div>
            </section>

        </div>
    );
};

export default ContactPortal;
