import { Howl, Howler } from 'howler';

class AudioManager {
  constructor() {
    this.distortionLevel = 0;
    this.ctx = null;
    this.distortionNode = null;
    this.filterNode = null;
    this.compressor = null; // Nouveau : Limiteur de sécurité
    this.gainNode = null;
    this.ambient = null;
    this.impact = null;
    this.currentVoice = null;
    this.initialized = false;
  }

  makeDistortionCurve(amount) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  initNodes() {
    try {
      this.ctx = Howler.ctx;
      if (!this.ctx || this.initialized) return;

      this.distortionNode = this.ctx.createWaveShaper();
      this.filterNode = this.ctx.createBiquadFilter();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.gainNode = this.ctx.createGain();
      
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 20000;

      // Configuration du compresseur (Limiteur)
      this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(40, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Chaîne : Master -> Disto -> Filter -> Compressor -> Gain -> Sortie
      Howler.masterGain.connect(this.distortionNode);
      this.distortionNode.connect(this.filterNode);
      this.filterNode.connect(this.compressor);
      this.compressor.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.initialized = true;
    } catch (e) {
      console.error("Audio init failed", e);
    }
  }

  updateDistortion(step) {
    if (!this.initialized || !this.gainNode) return;
    this.distortionLevel = Math.pow(step, 1.5) * 400; 
    this.distortionNode.curve = this.makeDistortionCurve(this.distortionLevel);
    const compensatedGain = Math.max(0.15, 1.0 - (Math.pow(step, 0.8) * 0.85)); 
    this.gainNode.gain.setTargetAtTime(compensatedGain, this.ctx.currentTime, 0.1);
    const freq = Math.max(250, 20000 - (step * 12000));
    this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.5);
  }

  loadSounds() {
    if (this.ambient) return;
    this.ambient = new Howl({ src: ['/audio/main.mp3'], loop: true, volume: 0.3 });
    this.impact = new Howl({ src: ['/audio/error.mp3'], volume: 0.4 });
  }

  playAmbient() {
    this.loadSounds();
    if (this.ambient && !this.ambient.playing()) {
      this.ambient.play();
      setTimeout(() => this.initNodes(), 100);
    }
  }

  playVoice(file) {
    if (this.currentVoice) this.currentVoice.stop();
    this.currentVoice = new Howl({ src: [file], autoplay: true, volume: 1 });
  }

  playFinalDrop() {
    if (!this.ctx || !this.initialized) return;
    
    const now = this.ctx.currentTime;
    const duration = 0.3;

    this.filterNode.frequency.cancelScheduledValues(now);
    this.filterNode.frequency.exponentialRampToValueAtTime(40, now + duration);

    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  stopAll() {
    if (this.ambient) this.ambient.stop();
    if (this.currentVoice) this.currentVoice.stop();
    Howler.mute(false);
    
    if (this.initialized) {
      this.gainNode.gain.setValueAtTime(1, this.ctx.currentTime);
      this.filterNode.frequency.setValueAtTime(20000, this.ctx.currentTime);
    }
  }
}

export const audioManager = new AudioManager();