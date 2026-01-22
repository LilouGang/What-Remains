import React, { useState, useRef, useEffect } from "react";
import { Howler } from 'howler';
import ParticleCanvas from "./components/ParticleCanvas";
import { audioManager } from "./utils/AudioManager";
import { STAGES } from "./constants/stages";

export default function App() {
  const [introStep, setIntroStep] = useState(0);
  const [isButtonReady, setIsButtonReady] = useState(false);
  const [gameState, setGameState] = useState('INTRO'); 
  const [stageIndex, setStageIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showFact, setShowFact] = useState(false);
  const [strobeState, setStrobeState] = useState('NONE');
  const [showFinalContent, setShowFinalContent] = useState(false);
  const [decayConfig, setDecayConfig] = useState(null);
  const [exclusionBox, setExclusionBox] = useState(null);
  const uiRef = useRef(null);

  useEffect(() => {
    if (introStep === 0) setTimeout(() => setIntroStep(1), 1000);
    if (introStep === 1) setTimeout(() => setIntroStep(2), 2000);
    if (introStep === 2) {
      setTimeout(() => {
        setIntroStep(3);
        setTimeout(() => setIsButtonReady(true), 500);
      }, 3000);
    }
  }, [introStep]);

  useEffect(() => {
    const updateBox = () => { if (uiRef.current) setExclusionBox(uiRef.current.getBoundingClientRect()); };
    const obs = new ResizeObserver(updateBox);
    if (uiRef.current) obs.observe(uiRef.current);
    return () => obs.disconnect();
  }, [gameState, stageIndex, showFact]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== "" && !showFact) {
      const currentStage = STAGES[stageIndex];
      if (audioManager.impact) audioManager.impact.play();
      setDecayConfig({ glyphs: currentStage.glyphs });
      const progress = (stageIndex + 1) / STAGES.length;
      audioManager.updateDistortion(progress);
      setShowFact(true);
      audioManager.playVoice(currentStage.voice);
      setTimeout(() => {
        if (stageIndex < STAGES.length - 1) {
          setStageIndex(prev => prev + 1);
          setInputValue("");
          setShowFact(false);
        } else {
          triggerDoubleGlitch();
        }
      }, 5000);
    }
  };

  const triggerDoubleGlitch = () => {
    const ms = 50; 
    setStrobeState('WHITE');
    Howler.mute(true);
    setTimeout(() => {
      setStrobeState('NONE');
      Howler.mute(false);
      setTimeout(() => {
        setStrobeState('WHITE');
        Howler.mute(true);
        setTimeout(() => {
          Howler.mute(false);
          audioManager.playFinalDrop(); 
          setTimeout(() => {
            setGameState('FINAL_SHOCK');
            audioManager.stopAll();
            setTimeout(() => setShowFinalContent(true), 3000);
          }, 250); 
        }, ms);
      }, ms);
    }, ms);
  };

  const iconLinkStyle = { display: 'inline-block', width: '32px', height: '32px', color: '#1a1a1a' };

  if (gameState === 'FINAL_SHOCK') {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ opacity: showFinalContent ? 1 : 0, transition: 'opacity 3s ease-in-out', textAlign: 'center', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
          <h2 style={{ marginBottom: '50px', fontWeight: 'normal' }}>Agir maintenant</h2>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '17px', marginBottom: '70px' }}>
            <li><a href="https://www.wwf.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>WWF — Protéger la biodiversité</a></li>
            <li><a href="https://seashepherd.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>Sea Shepherd — Défendre les océans</a></li>
            <li><a href="https://www.greenpeace.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>Greenpeace — Campagnes climatiques</a></li>
          </ul>
          <div style={{ display: 'flex', gap: '35px', justifyContent: 'center' }}>
            <a href="https://killianlacaque.vercel.app/" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><img src="/portfolio-logo.png" alt="Portfolio" style={{ width: '100%' }} /></a>
            <a href="https://www.instagram.com/killian.lcq_/" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><InstaIcon /></a>
            <a href="https://www.linkedin.com/in/killian-lacaque/" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><LinkedinIcon /></a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
      
      {strobeState === 'WHITE' && <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 999 }} />}

      <ParticleCanvas exclusionBox={exclusionBox} decayConfig={decayConfig} hasStarted={gameState === 'PLAYING'} />

      <div ref={uiRef} style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#1a1a1a', maxWidth: '600px' }}>
      {gameState === 'INTRO' && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '35px',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}>
          <div style={{ opacity: introStep >= 1 ? 1 : 0, transition: 'opacity 1.5s' }}><HeadsetIcon /></div>
          <p style={{ 
            opacity: introStep >= 2 ? 1 : 0, 
            transition: 'opacity 1.5s', 
            fontSize: '19px',
            pointerEvents: 'none'
          }}>
            Activez le volume pour une expérience optimale
          </p>
            <button 
              onClick={() => { if(isButtonReady) { audioManager.playAmbient(); setGameState('PLAYING'); } }} 
              style={{ 
                opacity: introStep >= 3 ? 1 : 0, 
                transition: 'opacity 1.5s', 
                border: 'none', background: 'transparent', fontSize: '21px', 
                cursor: isButtonReady ? 'pointer' : 'default', 
                textDecoration: 'underline', fontFamily: 'inherit',
                pointerEvents: isButtonReady ? 'auto' : 'none'
              }}
            >
              Commencer
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            {!showFact ? (
              <>
                <p style={{ fontSize: '22px', lineHeight: '1.5' }}>{STAGES[stageIndex].question}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <input 
                    autoFocus 
                    type="number" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    style={{ background: 'transparent', border: 'none', borderBottom: '1.5px solid #1a1a1a', fontSize: '32px', textAlign: 'center', width: '110px', outline: 'none', fontFamily: 'inherit' }} 
                  />
                  <span style={{ fontSize: '18px' }}>{STAGES[stageIndex].unit}</span>
                </div>
              </>
            ) : (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontSize: '23px', color: '#d32f2f', padding: '0 20px', lineHeight: '1.4', marginBottom: '10px' }}>
                  {STAGES[stageIndex].fact}
                </p>
                
                {/* Lien source discret et intégré à la zone de répulsion */}
                <a 
                  href={STAGES[stageIndex].source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: '#3c5a99', // Bleu sourd plus foncé
                    textDecoration: 'none',
                    opacity: 0.5,     // Un poil plus visible que 0.4
                    transition: 'opacity 0.3s ease, color 0.3s ease',
                    fontFamily: 'inherit',
                    userSelect: 'none',
                    marginTop: '15px',
                    borderBottom: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = 1;
                    e.target.style.borderBottom = '1px solid #3c5a99';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = 0.5;
                    e.target.style.borderBottom = '1px solid transparent';
                  }}
                >
                  — voir la source
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// SVG Icons... (strokeWidth="1")
const InstaIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const LinkedinIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="1.5"></circle></svg>
);
const HeadsetIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12v7c0 1.1.9 2 2 2h3v-8H4v-1c0-4.41 3.59-8 8-8s8 3.59 8 8v1h-3v8h3c1.1 0 2-.9 2-2v-7c0-5.52-4.48-10-10-10z"/></svg>
);