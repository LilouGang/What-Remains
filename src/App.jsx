import React, { useState, useRef, useEffect } from "react";
import { Howler } from 'howler';
import ParticleCanvas from "./components/ParticleCanvas";
import { audioManager } from "./utils/AudioManager";
import { STAGES } from "./constants/stages";

// --- ICONES ---
const HeadsetIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12v7c0 1.1.9 2 2 2h3v-8H4v-1c0-4.41 3.59-8 8-8s8 3.59 8 8v1h-3v8h3c1.1 0 2-.9 2-2v-7c0-5.52-4.48-10-10-10z"/></svg>;
const InstaIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const LinkedinIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="1.5"></circle></svg>;

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
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  
  const uiRef = useRef(null);

  // Formatage avec espaces
  const formatNumber = (val) => {
    return val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue.length <= 15) { 
      setInputValue(rawValue);
    }
  };

  // Intro Sequence
  useEffect(() => {
    if (introStep === 0) setTimeout(() => setIntroStep(1), 800);
    if (introStep === 1) setTimeout(() => setIntroStep(2), 1500);
    if (introStep === 2) {
      setTimeout(() => { setIntroStep(3); setTimeout(() => setIsButtonReady(true), 500); }, 2000);
    }
  }, [introStep]);

  // Exclusion Zone (Le centre)
  useEffect(() => {
    // On ajoute un petit délai pour laisser le temps au DOM de se mettre à jour lors des changements d'état
    setTimeout(() => {
      if (uiRef.current) {
        setExclusionBox(uiRef.current.getBoundingClientRect());
      }
    }, 50);
      
    const updateBox = () => { if (uiRef.current) setExclusionBox(uiRef.current.getBoundingClientRect()); };
    const obs = new ResizeObserver(updateBox);
    if (uiRef.current) obs.observe(uiRef.current);
    return () => obs.disconnect();
  }, [gameState, stageIndex, showFact, inputValue]);

  const runTypewriter = async (script) => {
    setDisplayedSubtitle("");
    let currentText = "";
    for (const segment of script) {
      await new Promise(r => setTimeout(r, segment.delay));
      for (let i = 0; i < segment.text.length; i++) {
        currentText += segment.text[i];
        setDisplayedSubtitle(currentText);
        await new Promise(r => setTimeout(r, 35));
      }
    }
    return true;
  };

  const handleStageTransition = () => {
    if (stageIndex >= STAGES.length - 1) {
      triggerTripleGlitch();
    } else {
      setStageIndex(prev => prev + 1);
      setInputValue("");
      setShowFact(false);
      setDisplayedSubtitle("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== "" && !showFact) {
      const currentStage = STAGES[stageIndex];
      if (audioManager.impact) audioManager.impact.play();
      setDecayConfig({ glyphs: currentStage.glyphs });
      audioManager.updateDistortion(stageIndex / (STAGES.length - 1), currentStage.volume);
      setShowFact(true);
      audioManager.playVoice(currentStage.voice);

      runTypewriter(currentStage.script).then(() => {
        setTimeout(handleStageTransition, 3000); // 3s après la fin de l'écriture
      });
    }
  };

  const triggerTripleGlitch = () => {
    const ms = 50;
    const flash = (cb) => {
      setStrobeState('WHITE'); Howler.mute(true);
      setTimeout(() => { setStrobeState('NONE'); Howler.mute(false); if(cb) cb(); }, ms);
    };
    flash(() => setTimeout(() => {
      flash(() => setTimeout(() => {
        setStrobeState('WHITE'); Howler.mute(true);
        setTimeout(() => {
          Howler.mute(false);
          audioManager.playFinalDrop();
          setTimeout(() => {
            setGameState('FINAL_SHOCK');
            audioManager.stopAll();
            setTimeout(() => setShowFinalContent(true), 3000);
          }, 250);
        }, ms);
      }, ms));
    }, ms));
  };

  if (gameState === 'FINAL_SHOCK') {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ opacity: showFinalContent ? 1 : 0, transition: 'opacity 3s ease-in-out', textAlign: 'center', color: '#1a1a1a', padding: '0 20px' }}>
          <h2 style={{ marginBottom: '30px', fontWeight: 'normal', fontSize: '18px' }}>Agir maintenant</h2>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '16px', marginBottom: '40px' }}>
            <li><a href="https://www.wwf.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>WWF — Protéger la biodiversité</a></li>
            <li><a href="https://seashepherd.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>Sea Shepherd — Défendre les océans</a></li>
            <li><a href="https://www.greenpeace.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>Greenpeace — Urgence climatique</a></li>
          </ul>
          <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', alignItems: 'center' }}>
            <a href="https://killianlacaque.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ width: '28px', opacity: 0.8 }}><img src="/portfolio-logo.png" alt="P" style={{ width: '100%', filter: 'grayscale(1)' }} /></a>
            <a href="https://instagram.com/killian.lcq_/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', opacity: 0.7 }}><InstaIcon /></a>
            <a href="https://linkedin.com/in/killian-lacaque/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', opacity: 0.7 }}><LinkedinIcon /></a>
          </div>
          <p className="font-ubuntu-regular" style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, fontSize: '11px', color: '#999' }}>Le calcul est terminé. Essayez de vivre avec.</p>
        </div>
      </div>
    );
  }

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
      {strobeState === 'WHITE' && <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 999 }} />}
      <ParticleCanvas exclusionBox={exclusionBox} decayConfig={decayConfig} hasStarted={gameState === 'PLAYING'} />

      {/* LE CONTEUR PRINCIPAL N'A PLUS LA REF */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#1a1a1a', maxWidth: '800px', width: '90%', userSelect: 'none' }}>
        
        {gameState === 'INTRO' && (
          <div ref={uiRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '35px', display: 'inline-block' }}>
            <div style={{ opacity: introStep >= 1 ? 1 : 0, transition: 'opacity 1.5s' }}><HeadsetIcon /></div>
            <p style={{ opacity: introStep >= 2 ? 1 : 0, transition: 'opacity 1.5s', fontSize: '18px', marginTop: '35px' }}>Activez le volume pour une expérience optimale</p>
            <button 
              onClick={() => { if(isButtonReady) { audioManager.playAmbient(); setGameState('PLAYING'); } }} 
              style={{ 
                opacity: introStep >= 3 ? 1 : 0, 
                transition: 'opacity 1.5s', 
                border: 'none', 
                background: 'transparent', 
                fontSize: '18px',
                cursor: 'pointer', 
                fontFamily: 'inherit',
                borderBottom: '1px solid black',
                paddingBottom: '5px',
                lineHeight: '1',
                marginTop: '35px'
              }}
            >
              Commencer
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div 
            ref={uiRef} 
            style={{ 
              display: 'inline-block', 
              textAlign: 'center',
              // Ordre : Haut (0), Droite (18), Bas (18), Gauche (18)
              padding: '0 18px 18px 18px', 
              boxSizing: 'border-box'
            }}
          >
            {!showFact ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                {/* Ce paragraphe a sa propre marge qui gère le haut */}
                <p style={{ fontSize: '18px', lineHeight: '1.6', margin: '18px 0' }}>
                  {STAGES[stageIndex].question}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <input 
                    autoFocus 
                    type="text" 
                    value={formatNumber(inputValue)} 
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyDown} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: '1px solid #1a1a1a', 
                      fontSize: '24px', 
                      textAlign: 'center', 
                      width: `${Math.max(60, formatNumber(inputValue).length * 15)}px`,
                      outline: 'none', 
                      fontFamily: 'inherit',
                      transition: 'width 0.1s ease-out'
                    }} 
                  />
                  <span style={{ fontSize: '16px' }}>{STAGES[stageIndex].unit}</span>
                </div>
              </div>
            ) : (
              <div className="fade-in" style={{ padding: '0 20px' }}>
                {/* On s'assure que le Fact a aussi une marge cohérente en haut */}
                <p style={{ fontSize: '20px', color: '#d32f2f', margin: '18px 0 10px 0', lineHeight: '1.4' }}>
                  {STAGES[stageIndex].fact}
                </p>
                <a href={STAGES[stageIndex].source} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: '#3c5a99', textDecoration: 'none', opacity: 0.5 }}>
                  — voir la source
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {showFact && gameState === 'PLAYING' && (
        <div style={{ position: 'absolute', bottom: '80px', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '12px 25px', borderRadius: '2px' }}>
            <p className="font-ubuntu-regular" style={{ fontSize: '15px', color: '#555', maxWidth: '650px', margin: 0, lineHeight: '1.6' }}>
              {displayedSubtitle}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}