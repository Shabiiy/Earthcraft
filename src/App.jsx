import React, { useState } from 'react';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Header from './components/Header';
import OverlayMenu from './components/OverlayMenu';
import HeroSequence from './components/HeroSequence';
import GalleryIntro from './components/GalleryIntro';
import FloatingGallery from './components/FloatingGallery';
import JourneyTimeline from './components/JourneyTimeline';
import ContactPortal from './components/ContactPortal';

function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
            
            <img className="global-bg" src="/bg.png" alt="" loading="eager" fetchPriority="high" decoding="async" />
            
            <CustomCursor />
            
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <OverlayMenu isOpen={isMenuOpen} />

            <main className="main-content">
                <HeroSequence />
                
                <div className="native-content">
                    <GalleryIntro />
                    <FloatingGallery />
                    <JourneyTimeline />
                    <ContactPortal />
                </div>
            </main>
        </>
    );
}

export default App;
