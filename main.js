// Custom Cursor Implementation
const mainCursor = document.getElementById("custom-cursor");
const glowCursor = document.getElementById("cursor-glow");

gsap.set([mainCursor, glowCursor], { xPercent: -50, yPercent: -50 });

let xTo = gsap.quickTo(mainCursor, "x", {duration: 0.05, ease: "power3"});
let yTo = gsap.quickTo(mainCursor, "y", {duration: 0.05, ease: "power3"});
let glowXTo = gsap.quickTo(glowCursor, "x", {duration: 0.25, ease: "power2.out"});
let glowYTo = gsap.quickTo(glowCursor, "y", {duration: 0.25, ease: "power2.out"});

window.addEventListener("mousemove", e => {
    xTo(e.clientX);
    yTo(e.clientY);
    glowXTo(e.clientX);
    glowYTo(e.clientY);
});

const interactables = document.querySelectorAll("a, button, .hamburger");
interactables.forEach(el => {
    el.addEventListener("mouseenter", () => {
        mainCursor.classList.add("hover");
        glowCursor.classList.add("hover");
    });
    el.addEventListener("mouseleave", () => {
        mainCursor.classList.remove("hover");
        glowCursor.classList.remove("hover");
    });
});

// Hamburger Menu Toggle
const hamburgerBtn = document.getElementById('hamburger-btn');
const navOverlay = document.getElementById('nav-overlay');
let overlayOpen = false;

hamburgerBtn.addEventListener('click', () => {
    overlayOpen = !overlayOpen;
    if (overlayOpen) {
        navOverlay.classList.add('active');
        const spans = hamburgerBtn.querySelectorAll('span');
        spans[0].style.transform = 'translateY(14px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-14px) rotate(-45deg)';
    } else {
        navOverlay.classList.remove('active');
        const spans = hamburgerBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// FlowingMenu Component Port
const menuItems = document.querySelectorAll('.menu__item');
menuItems.forEach(item => {
    const text = item.getAttribute('data-text');
    const image = item.getAttribute('data-img');
    
    // Construct GSAP native Marquee elements
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    marquee.style.backgroundColor = 'var(--primary-green)'; // Active contrast color
    
    const innerWrap = document.createElement('div');
    innerWrap.className = 'marquee__inner-wrap';
    
    const inner = document.createElement('div');
    inner.className = 'marquee__inner';
    
    for(let i=0; i<6; i++) {
        const part = document.createElement('div');
        part.className = 'marquee__part';
        part.innerHTML = `<span>${text}</span><div class="marquee__img" style="background-image: url('${image}')"></div>`;
        inner.appendChild(part);
    }
    
    innerWrap.appendChild(inner);
    marquee.appendChild(innerWrap);
    item.appendChild(marquee);
    
    // Bind continuous infinite scroll track
    setTimeout(() => {
        const firstPart = inner.querySelector('.marquee__part');
        if(firstPart) {
            gsap.to(inner, {
                x: -firstPart.offsetWidth,
                duration: 10,
                ease: 'none',
                repeat: -1
            });
        }
    }, 100);
    
    // Edge Detection Hover Collisions
    const findClosestEdge = (x, y, w, h) => {
        const topDist = (x - w/2)**2 + (y - 0)**2;
        const bottomDist = (x - w/2)**2 + (y - h)**2;
        return topDist < bottomDist ? 'top' : 'bottom';
    };
    
    item.addEventListener('mouseenter', e => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);
        
        gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
            .set(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .set(innerWrap, { y: edge === 'top' ? '101%' : '-101%' }, 0)
            .to([marquee, innerWrap], { y: '0%' }, 0);
    });
    
    item.addEventListener('mouseleave', e => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);
        
        gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
            .to(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .to(innerWrap, { y: edge === 'top' ? '101%' : '-101%' }, 0);
    });
});


// -------------------------------------------------------------
// STRICT FIXED BOUNDARY FRAME ENGINE
// -------------------------------------------------------------
let currentStep = 0;
let isAnimating = false;

// DOM Elements
const boundS1Start = document.getElementById("bound-seq1-start");
const boundS1End = document.getElementById("bound-seq1-end");
const boundS2End = document.getElementById("bound-seq2-end");

const vid1 = document.getElementById("seq1-vid");
const vid2 = document.getElementById("seq2-vid");
const vid1Rev = document.getElementById("seq1-vid-rev");
const vid2Rev = document.getElementById("seq2-vid-rev");

const text1 = document.getElementById("text-1");
const text2 = document.getElementById("text-2");

// Ensure native boundary traps initiate
document.body.style.overflow = "hidden";
let nativeScrollActive = false;

// Create FluidGlass Refractive Cursor
const glassCursor = document.createElement("div");
glassCursor.className = "fluid-glass-cursor";
document.body.appendChild(glassCursor);

// GSAP quickTo for zero-latency 60fps tracking
const glassX = gsap.quickTo(glassCursor, "left", {duration: 0.5, ease: "power3", xPercent: -50});
const glassY = gsap.quickTo(glassCursor, "top", {duration: 0.5, ease: "power3", yPercent: -50});

window.addEventListener("mousemove", e => {
    glassX(e.clientX);
    glassY(e.clientY);
});

// Prevent native scrolling behavior entirely during sequential trap
window.addEventListener("wheel", (e) => { 
    if (nativeScrollActive) {
        // Escaping backwards out of native into sequential locking
        if (window.scrollY === 0 && e.deltaY < 0) {
            nativeScrollActive = false;
            document.body.style.overflow = "hidden";
        } else {
            return; // Natural scrolling continues down
        }
    } else {
        // Unlocking sequence successfully into native vertical navigation
        if (currentStep === 2 && !isAnimating && e.deltaY > 15) {
             nativeScrollActive = true;
             document.body.style.overflowY = "auto";
             document.body.style.overflowX = "hidden";
             return;
        }
    }
    
    e.preventDefault(); 
}, { passive: false });
// ─── LOADING SCREEN CONTROLLER ───────────────────────────────────────────────
const ecLoader     = document.getElementById('ec-loader');
const ecLoaderFill = document.getElementById('ec-loader-fill');
let   _loadedCount = 0;
const _TOTAL_VIDS  = 4;
const _firedSet    = new Set();

function _onVidReady(idx) {
    if (_firedSet.has(idx)) return;
    _firedSet.add(idx);
    _loadedCount++;
    const pct = (_loadedCount / _TOTAL_VIDS) * 100;
    if (ecLoaderFill) ecLoaderFill.style.width = pct + '%';
    if (_loadedCount >= _TOTAL_VIDS) _dismissLoader();
}

function _dismissLoader() {
    if (!ecLoader || ecLoader.style.display === 'none') return;
    gsap.to(ecLoader, {
        opacity: 0, duration: 0.9, ease: 'power2.inOut',
        onComplete: () => { ecLoader.style.display = 'none'; }
    });
}

// Wire up after DOM elements are assigned (called below after vid refs exist)
function _initLoader() {
    const vids = [vid1, vid2, vid1Rev, vid2Rev];
    vids.forEach((v, i) => {
        if (!v) { _onVidReady(i); return; }
        if (v.readyState >= 3) {
            _onVidReady(i);
        } else {
            v.addEventListener('canplaythrough', () => _onVidReady(i), { once: true });
            // Per-video fallback: don't wait more than 8 s
            setTimeout(() => _onVidReady(i), 8000);
        }
    });
    // Global safety: always clear loader within 12 s
    setTimeout(_dismissLoader, 12000);
}

// Global Speed Control Sub-loop Setup
let targetPlaybackRate = 1.0;
let currentPlaybackRate = 1.0;

let journeyVisible = false;

function playbackRateLoop() {
    // Decay target rapidly to 1x when not scrolling
    targetPlaybackRate += (1.0 - targetPlaybackRate) * 0.1; 
    
    // Smoothly apply easing specifically for rate
    currentPlaybackRate += (targetPlaybackRate - currentPlaybackRate) * 0.2;
    
    let safeRate = Math.max(1.0, currentPlaybackRate);
    if (!vid1.paused) vid1.playbackRate = safeRate;
    if (!vid2.paused) vid2.playbackRate = safeRate;
    if (!vid1Rev.paused) vid1Rev.playbackRate = safeRate;
    if (!vid2Rev.paused) vid2Rev.playbackRate = safeRate;
    
    // Globally scale ALL text and GSAP timelines proportionately with video speed!
    gsap.globalTimeline.timeScale(safeRate);
    
    requestAnimationFrame(playbackRateLoop);
}
requestAnimationFrame(playbackRateLoop);

// Boot the loader tracker now that vid refs exist
_initLoader();

let scrollCooldown = 0;

// ─── ROBUST FRAME-READY VIDEO TRANSITION ────────────────────────────────────
// Waits until the video has decoded its first frame (readyState >= 3)         
// before hiding the boundary frame anchor — eliminating all flash-of-background.
// A 300 ms safety timeout fires regardless so the UI never deadlocks.          
// The boundary frame stays visible during the brief overlap (crossfade).        
function seamlessTransitionTo(vidElement, anchorToHide, onReady) {
    vidElement.currentTime = 0.001;

    // Keep invisible (opacity only — never visibility:hidden which de-promotes GPU layer)
    gsap.set(vidElement, { opacity: 0 });

    const doSwap = () => {
        // video is z-index:2, anchor is z-index:1
        // Setting video opacity:1 INSTANTLY covers anchor — zero gap possible.
        // Then we leisurely fade the anchor out underneath (pure cleanup).
        gsap.set(vidElement, { opacity: 1 });
        const hideTargets = Array.isArray(anchorToHide) ? anchorToHide : [anchorToHide];
        hideTargets.forEach(el => gsap.to(el, { opacity: 0, duration: 0.15, ease: 'none' }));
        if (onReady) onReady();
    };

    const attemptPlay = () => {
        const p = vidElement.play();
        if (p !== undefined) p.catch(() => {});

        if (vidElement.readyState >= 3) {
            // First decoded frame already in buffer — swap next paint
            requestAnimationFrame(doSwap);
        } else {
            let swapped = false;
            const onCanPlay = () => {
                if (swapped) return;
                swapped = true;
                vidElement.removeEventListener('canplay', onCanPlay);
                clearTimeout(fallback);
                requestAnimationFrame(doSwap);
            };
            // Safety: swap after 400 ms max regardless of network state
            const fallback = setTimeout(() => {
                if (swapped) return;
                swapped = true;
                vidElement.removeEventListener('canplay', onCanPlay);
                doSwap();
            }, 400);
            vidElement.addEventListener('canplay', onCanPlay);
        }
    };

    attemptPlay();
}

function advanceStep() {
    if (isAnimating || Date.now() < scrollCooldown) return;
    
    if (currentStep === 0) {
        // STEP 0 -> Trigger Sequence 1
        isAnimating = true;
        gsap.to(text1, { opacity: 0, duration: 0.5 });

        seamlessTransitionTo(vid1, boundS1Start);

        const checkTime = () => {
            if (vid1.currentTime >= 7.5) {
                vid1.removeEventListener('timeupdate', checkTime);
                vid1.pause();
                // Boundary frame is z-index:1, video z-index:2
                // Show anchor first (instant), then fade video out on top
                gsap.set(boundS1End, { opacity: 1 });
                gsap.to(vid1, { opacity: 0, duration: 0.12, ease: 'none' });
                gsap.to(text2, { opacity: 1, duration: 1, delay: 0.1 });
                currentStep = 1;
                scrollCooldown = Date.now() + 800;
                isAnimating = false;
            }
        };
        vid1.addEventListener('timeupdate', checkTime);
    }
    else if (currentStep === 1) {
        // STEP 1 -> Trigger Sequence 2
        isAnimating = true;
        gsap.to(text2, { opacity: 0, duration: 0.5 });
        gsap.to(glassCursor, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' });

        seamlessTransitionTo(vid2, boundS1End);

        const onEnded2 = () => {
            vid2.removeEventListener('ended', onEnded2);
            gsap.set(boundS2End, { opacity: 1 });
            gsap.to(vid2, { opacity: 0, duration: 0.12, ease: 'none' });
            currentStep = 2;
            scrollCooldown = Date.now() + 800;
            isAnimating = false;
        };
        vid2.addEventListener('ended', onEnded2);
    }
}

function processStepBack() {
    if (isAnimating || Date.now() < scrollCooldown) return;
    
    if (currentStep === 1) {
        isAnimating = true;
        gsap.to(text2, { opacity: 0, duration: 0.3 });
        vid1.pause();

        seamlessTransitionTo(vid1Rev, boundS1End);

        const onEndedRev1 = () => {
            vid1Rev.removeEventListener('ended', onEndedRev1);
            gsap.set(boundS1Start, { opacity: 1 });
            gsap.to(vid1Rev, { opacity: 0, duration: 0.12, ease: 'none' });
            gsap.to(text1, { opacity: 1, duration: 0.5, delay: 0.1 });
            currentStep = 0;
            scrollCooldown = Date.now() + 800;
            isAnimating = false;
        };
        vid1Rev.addEventListener('ended', onEndedRev1);
    }
    else if (currentStep === 2) {
        isAnimating = true;
        vid2.pause();
        gsap.to(glassCursor, { opacity: 0, scale: 0, duration: 0.5, ease: 'power3.in' });

        seamlessTransitionTo(vid2Rev, [vid2, boundS2End]);

        const onEndedRev2 = () => {
            vid2Rev.removeEventListener('ended', onEndedRev2);
            gsap.set(boundS1End, { opacity: 1 });
            gsap.to(vid2Rev, { opacity: 0, duration: 0.12, ease: 'none' });
            gsap.to(text2, { opacity: 1, duration: 0.5, delay: 0.1 });
            currentStep = 1;
            scrollCooldown = Date.now() + 800;
            isAnimating = false;
        };
        vid2Rev.addEventListener('ended', onEndedRev2);
    }
}

// Event hooks mapping velocity specifically to video multiplier
window.addEventListener("wheel", (e) => {
    if(nativeScrollActive) return; // Prevent manipulation if natively scrolling!
    
    // If securely animating and wheel acts, multiply actual playrate
    if (isAnimating) {
        let pullMagnitude = Math.abs(e.deltaY);
        // Maxes playback to 4.5x based purely on wheel impact
        targetPlaybackRate = Math.min(4.5, targetPlaybackRate + (pullMagnitude * 0.05));
    } 
    // Basic step advancing
    else {
        if (e.deltaY > 15) advanceStep();
        else if (e.deltaY < -15) processStepBack();
    }
});

// Mobile scroll support
let touchStartY = 0;
window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener("touchmove", (e) => {
    if (nativeScrollActive) {
        let diff = Math.abs(e.touches[0].clientY - touchStartY);
        if (window.scrollY === 0 && (touchStartY < e.touches[0].clientY)) {
             nativeScrollActive = false;
             document.body.style.overflow = "hidden";
        }
        return;
    } else {
        let touchEndY = e.touches[0].clientY;
        let distance = touchStartY - touchEndY;
        if (currentStep === 2 && !isAnimating && distance > 15) {
             nativeScrollActive = true;
             document.body.style.overflowY = "auto";
             document.body.style.overflowX = "hidden";
             return;
        }
    }
    
    e.preventDefault();
    
    if(isAnimating) {
        let diff = Math.abs(e.touches[0].clientY - touchStartY);
        targetPlaybackRate = Math.min(4.5, targetPlaybackRate + (diff * 0.05));
    }
}, { passive: false });

window.addEventListener("touchend", (e) => {
    if (nativeScrollActive) return;

    let touchEndY = e.changedTouches[0].clientY;
    let distance = touchStartY - touchEndY;
    
    if (distance > 40) advanceStep(); 
    else if (distance < -40) processStepBack(); 
});

// Ported PillNav Animation Geometry Logic
function layoutPills() {
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

        gsap.set(circle, {
            xPercent: -50,
            scale: 0,
            transformOrigin: `50% ${originY}px`
        });

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
}
layoutPills();
window.addEventListener("resize", layoutPills);
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layoutPills);
}

document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener("mouseenter", () => {
        if(pill._activeTween) pill._activeTween.kill();
        pill._activeTween = pill._animTl.tweenTo(pill._animTl.duration(), { duration: 0.35, ease: "power2.out", overwrite: 'auto' });
    });
    pill.addEventListener("mouseleave", () => {
        if(pill._activeTween) pill._activeTween.kill();
        pill._activeTween = pill._animTl.tweenTo(0, { duration: 0.25, ease: "power2.out", overwrite: 'auto' });
    });
});

// -------------------------------------------------------------
// POST-SEQUENCE NATIVE SCROLL ANIMATIONS (ScrollTrigger)
// -------------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// S1: Native Gallery Intro Sequences
let expandTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".gallery-intro-sequence",
        start: "center center", 
        end: "+=120%",        
        pin: true,            
        scrub: 1              
    }
});

// The component wildly expands natively with a super-scaled mass filling even edge screens
expandTl.to(".pc-card-wrapper", {
    scale: 25,         
    duration: 2,
    ease: "power2.in"
}, 0);

// Strict math bind handling centering absolute coordinate arrays 
gsap.set("#gallery-reveal-text", { xPercent: -50, yPercent: -50, scale: 0.95 });

// Fade in OUR GALLERY seamlessly one-line 
expandTl.to("#gallery-reveal-text", {
    opacity: 1,
    scale: 1,
    duration: 1.5,
    ease: "power3.out"
}, 1);

// S2: Native Backgroup Portal Expansion Track
let portalTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".portal-and-contact-wrapper",
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 1
    }
});

// Escalate the transparent portal window identically crushing the white
portalTl.to(".bg-portal-card", {
    scale: 30,   // Massive geometric scale to guarantee door corners clear bounding screen limits
    duration: 2,
    ease: "power2.in"
}, 0);

// Natively instantaneously vanish the white envelope exactly when the window structurally covers screen
portalTl.to(".portal-sequence", {
    autoAlpha: 0,
    duration: 0.1
}, 2);

// -------------------------------------------------------------
// PROFILE CARD TILT ENGINE
// -------------------------------------------------------------
const tiltCards = document.querySelectorAll(".pc-card-wrapper");
tiltCards.forEach(wrap => {
    const shell = wrap.querySelector(".pc-card-shell");
    if (!shell) return;
    
    let initialUntil = performance.now() + 1200;
    let running = false;
    let rafId = null;
    let lastTs = 0;
    
    let currentX = shell.clientWidth / 2;
    let currentY = 60; 
    let targetX = shell.clientWidth / 2;
    let targetY = shell.clientHeight / 2;

    const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
    const round = (v, p = 3) => parseFloat(v.toFixed(p));
    const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

    const setVars = (x, y) => {
        const width = shell.clientWidth || 1;
        const height = shell.clientHeight || 1;

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

    shell.addEventListener("pointerenter", (e) => {
        shell.classList.add('active', 'entering');
        setTimeout(() => shell.classList.remove('entering'), 180);
        
        const rect = shell.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        startTilt();
    });
    
    shell.addEventListener("pointermove", (e) => {
        const rect = shell.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        startTilt();
    });

    shell.addEventListener("pointerleave", () => {
        targetX = shell.clientWidth / 2;
        targetY = shell.clientHeight / 2;
        
        const checkSettle = () => {
            if (Math.hypot(targetX - currentX, targetY - currentY) < 0.6) {
                shell.classList.remove('active');
            } else {
                requestAnimationFrame(checkSettle);
            }
        };
        requestAnimationFrame(checkSettle);
    });

    setVars(currentX, currentY);
    startTilt();
});

// S2: Floating Gallery Parallax
gsap.to(".col-left", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".floating-gallery", start: "top bottom", end: "bottom top", scrub: true }});
gsap.to(".col-center", { yPercent: -30, ease: "none", scrollTrigger: { trigger: ".floating-gallery", start: "top bottom", end: "bottom top", scrub: true }});
gsap.to(".col-right", { yPercent: -5, ease: "none", scrollTrigger: { trigger: ".floating-gallery", start: "top bottom", end: "bottom top", scrub: true }});

// S3: Form Document Reveal Setup
gsap.from(".contact-sec", {
    opacity: 0,
    duration: 1.5,
    ease: "power2.inOut",
    scrollTrigger: {
        trigger: ".contact-sec",
        start: "top 90%",
        end: "top 50%",
        scrub: true
    }
});

const formLines = document.querySelectorAll(".minimal-input");
gsap.from(formLines, {
    scaleX: 0,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
        trigger: ".contact-form",
        start: "top 60%"
    }
});
