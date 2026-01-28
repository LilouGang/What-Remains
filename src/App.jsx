import React, { useState, useRef, useEffect } from "react";
import ParticleCanvas from "./components/ParticleCanvas";
import { audioManager } from "./utils/AudioManager";
import { STAGES } from "./constants/stages";

const FINAL_SCRIPT = [
  { text: "Vous ne pouvez plus l'ignorer. ", delay: 500 },
  { text: "Qu'allez-vous faire ?", delay: 800 }
];

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
  const [showFinalLinks, setShowFinalLinks] = useState(false);
  const [decayConfig, setDecayConfig] = useState(null);
  const [exclusionBox, setExclusionBox] = useState(null);
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  
  const uiRef = useRef(null);

  const formatNumber = (val) => val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  useEffect(() => {
    if (introStep === 0) setTimeout(() => setIntroStep(1), 800);
    if (introStep === 1) setTimeout(() => setIntroStep(2), 1500);
    if (introStep === 2) { setTimeout(() => { setIntroStep(3); setIsButtonReady(true); }, 2000); }
  }, [introStep]);

  useEffect(() => {
    const updateBox = () => { if (uiRef.current) setExclusionBox(uiRef.current.getBoundingClientRect()); };
    const obs = new ResizeObserver(updateBox);
    if (uiRef.current) obs.observe(uiRef.current);
    updateBox();
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

  const playVoiceAndWait = (file) => {
    if (!file) return Promise.resolve();
    return new Promise((resolve) => {
      audioManager.playVoice(file, () => resolve());
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== "" && !showFact) {
      const currentStage = STAGES[stageIndex];
      const nextStage = STAGES[stageIndex + 1];

      if (audioManager.impact) audioManager.impact.play();
      setDecayConfig({ glyphs: currentStage.glyphs });
      setShowFact(true);

      if (nextStage) {
        audioManager.updateEffects(nextStage.distortion, nextStage.volume, nextStage.pitch, 7500);
      }

      const typewriterPromise = runTypewriter(currentStage.script);
      const voicePromise = playVoiceAndWait(currentStage.voice);

      Promise.all([typewriterPromise, voicePromise]).then(() => {
        setTimeout(handleStageTransition, 5000);
      });
    }
  };

  const triggerTripleGlitch = () => {
    const flashSync = (duration, cb) => {
      setStrobeState('WHITE');
      audioManager.setMasterMute(true); 
      setTimeout(() => { 
        setStrobeState('NONE'); 
        audioManager.setMasterMute(false); 
        if(cb) cb(); 
      }, duration);
    };

    flashSync(50, () => {
      setTimeout(() => {
        flashSync(50, () => {
          setTimeout(() => {
            setStrobeState('WHITE');
            audioManager.setMasterMute(true); 
            audioManager.playFinalDrop();
            
            setShowFact(false); 
            setDisplayedSubtitle(""); 
            setInputValue("");

            setTimeout(() => {
              setGameState('FINAL_SHOCK');
              audioManager.stopAll(); 
              audioManager.setMasterMute(false); 
              setStrobeState('NONE');

              setTimeout(() => {
                runTypewriter(FINAL_SCRIPT).then(() => {
                  setTimeout(() => setShowFinalLinks(true), 3000);
                });
              }, 2500);
            }, 200);
          }, 50);
        }, 50);
      }, 50);
    });
  };

  if (gameState === 'FINAL_SHOCK') {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!showFinalLinks ? (
          <p className="font-ubuntu-regular" style={{ fontSize: '18px', color: '#1a1a1a', textAlign: 'center', padding: '0 40px', lineHeight: '1.6' }}>
            {displayedSubtitle}
          </p>
        ) : (
          <div className="fade-in" style={{ textAlign: 'center', color: '#1a1a1a', padding: '0 20px' }}>
            <h2 style={{ marginBottom: '40px', fontWeight: 'normal', fontSize: '18px' }}>Agissez maintenant</h2>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '16px', marginBottom: '50px' }}>
              <li><a href="https://www.wwf.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>WWF — Protéger la biodiversité</a></li>
              <li><a href="https://seashepherd.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>Sea Shepherd — Défendre les océans</a></li>
              <li><a href="https://www.greenpeace.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'none', borderBottom: '1px solid #eee' }}>Greenpeace — Urgence climatique</a></li>
            </ul>
            <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', alignItems: 'center', marginBottom: '40px' }}>
              <a href="https://killianlacaque.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ width: '28px' }}>
                <img src="/portfolio-logo.png" alt="P" style={{ width: '100%' }} />
              </a>
              <a href="https://instagram.com/killian.lcq_/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a' }}><InstaIcon /></a>
              <a href="https://linkedin.com/in/killian-lacaque/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a' }}><LinkedinIcon /></a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>
      {strobeState === 'WHITE' && <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 999 }} />}
      <ParticleCanvas exclusionBox={exclusionBox} decayConfig={decayConfig} hasStarted={gameState === 'PLAYING'} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px', width: '90%' }}>
        {gameState === 'INTRO' && (
          <div ref={uiRef} style={{ display: 'inline-block', padding: '0 18px 18px 18px' }}>
            <div style={{ opacity: introStep >= 1 ? 1 : 0, transition: 'opacity 1.5s', marginBottom: '35px' }}><HeadsetIcon /></div>
            <p style={{ opacity: introStep >= 2 ? 1 : 0, transition: 'opacity 1.5s', fontSize: '18px', marginBottom: '35px' }}>Activez le volume pour une expérience optimale</p>
            <button 
              onClick={() => {
                if(isButtonReady) { 
                  audioManager.playAmbient(); 
                  audioManager.updateEffects(STAGES[0].distortion, STAGES[0].volume, STAGES[0].pitch, 100);
                  setGameState('PLAYING'); 
                } 
              }}
              style={{ opacity: introStep >= 3 ? 1 : 0, transition: 'opacity 1.5s', border: 'none', background: 'none', fontSize: '18px', borderBottom: '1px solid black', paddingBottom: '4px', cursor: 'pointer', fontFamily: 'inherit' }}
            >Commencer</button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div ref={uiRef} style={{ display: 'inline-block', padding: '0 18px 18px 18px' }}>
            {!showFact ? (
              <>
                <p style={{ fontSize: '18px', margin: '18px 0' }}>{STAGES[stageIndex].question}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', justifyContent: 'center' }}>
                  <input autoFocus type="text" value={formatNumber(inputValue)} onChange={(e) => { if(e.target.value.replace(/\D/g, "").length <= 15) setInputValue(e.target.value.replace(/\D/g, "")) }} onKeyDown={handleKeyDown} style={{ background: 'none', border: 'none', borderBottom: '1px solid black', fontSize: '24px', textAlign: 'center', width: `${Math.max(60, formatNumber(inputValue).length * 15)}px`, outline: 'none', fontFamily: 'inherit' }} />
                  <span style={{ fontSize: '16px' }}>{STAGES[stageIndex].unit}</span>
                </div>
              </>
            ) : (
              <div className="fade-in">
                <p style={{ fontSize: '20px', color: '#d32f2f', margin: '18px 0 10px 0', lineHeight: '1.4' }}>{STAGES[stageIndex].fact}</p>
                <a href={STAGES[stageIndex].source} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', opacity: 0.8, textDecoration: 'none', color: '#3c5a99' }}>— voir la source</a>
              </div>
            )}
          </div>
        )}
      </div>

      {showFact && gameState === 'PLAYING' && (
        <div style={{ position: 'absolute', bottom: '80px', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '12px 25px' }}>
            <p className="font-ubuntu-regular" style={{ fontSize: '15px', color: '#555', margin: 0, lineHeight: '1.6' }}>{displayedSubtitle}</p>
          </div>
        </div>
      )}
    </main>
  );
}