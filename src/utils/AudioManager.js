import { Howl, Howler } from 'howler';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.musicDistortion = null;
    this.musicGain = null;
    this.ambient = null;
    this.impact = null;
    this.currentVoice = null;
  }

  makeDistortionCurve(amount) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  initNodes() {
    this.ctx = Howler.ctx;
    if (!this.ctx || this.initialized) return;

    this.musicDistortion = this.ctx.createWaveShaper();
    this.musicGain = this.ctx.createGain();

    Howler.masterGain.disconnect();
    Howler.masterGain.connect(this.musicDistortion);
    this.musicDistortion.connect(this.musicGain);
    this.musicGain.connect(this.ctx.destination);

    this.initialized = true;
  }

  updateEffects(targetDist, targetVol, targetPitch, duration = 5000) {
    if (!this.initialized) this.initNodes();
    
    const now = this.ctx.currentTime;
    const durationSec = duration / 1000;

    // 1. VOLUME (Transition Native fluide)
    // On annule les transitions en cours pour éviter les conflits
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(targetVol, now + durationSec);

    // 2. PITCH & DISTORTION (Transition par interpolation "Tween")
    // Comme ces paramètres n'ont pas de rampes natives, on les fait varier manuellement
    const startDist = this.currentDistVal || 0;
    const startPitch = this.ambient ? this.ambient.rate() : 1;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calcul des valeurs intermédiaires
      const currentDist = startDist + (targetDist - startDist) * progress;
      const currentPitch = startPitch + (targetPitch - startPitch) * progress;

      // Mise à jour de la Distortion
      const distAmount = Math.pow(currentDist, 2) * 2000;
      this.musicDistortion.curve = this.makeDistortionCurve(distAmount);
      this.currentDistVal = currentDist; // On stocke pour la prochaine transition

      // Mise à jour du Pitch
      if (this.ambient) {
        this.ambient.rate(currentPitch);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  playAmbient() {
    if (!this.ambient) {
      this.ambient = new Howl({ src: ['/audio/main.mp3'], loop: true, volume: 1, html5: false });
      this.impact = new Howl({ src: ['/audio/error.mp3'], volume: 0.4 });
    }
    if (!this.ambient.playing()) {
      this.ambient.play();
      this.initNodes();
    }
  }

  playVoice(file, onEnd) {
    if (this.currentVoice) this.currentVoice.stop();
    this.currentVoice = new Howl({ 
      src: [file], 
      autoplay: true, 
      volume: 1,
      onend: () => { if(onEnd) onEnd(); }
    });
  }

  playFinalDrop() {
    if (this.musicGain) {
      this.musicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
    }
  }

  stopAll() {
    if (this.ambient) this.ambient.stop();
    if (this.currentVoice) this.currentVoice.stop();
  }
}

export const audioManager = new AudioManager();