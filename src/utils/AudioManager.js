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
    try {
      this.ctx = Howler.ctx;
      if (!this.ctx || this.initialized) return;

      this.musicDistortion = this.ctx.createWaveShaper();
      this.musicGain = this.ctx.createGain();

      // Deconnexion du master pour eviter le son propre
      Howler.masterGain.disconnect();
      Howler.masterGain.connect(this.musicDistortion);
      this.musicDistortion.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);

      this.initialized = true;
    } catch (e) {
      console.error("Audio init failed", e);
    }
  }

  updateDistortion(step, manualVolume) {
    if (!this.initialized) return;
    const distAmount = Math.pow(step, 1.8) * 1200;
    this.musicDistortion.curve = this.makeDistortionCurve(distAmount);
    this.musicGain.gain.setTargetAtTime(manualVolume, this.ctx.currentTime, 0.2);
  }

  playFinalDrop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  }

  loadSounds() {
    if (this.ambient) return;
    this.ambient = new Howl({ src: ['/audio/main.mp3'], loop: true, volume: 0.5, html5: false });
    this.impact = new Howl({ src: ['/audio/error.mp3'], volume: 0.3 });
  }

  playAmbient() {
    this.loadSounds();
    if (this.ambient && !this.ambient.playing()) {
      this.ambient.play();
      setTimeout(() => this.initNodes(), 100);
    }
  }

  playVoice(file, onEndCallback) {
    if (this.currentVoice) this.currentVoice.stop();
    this.currentVoice = new Howl({ 
      src: [file], 
      autoplay: true, 
      volume: 1,
      onend: () => { if (onEndCallback) onEndCallback(); }
    });
  }

  stopAll() {
    if (this.ambient) this.ambient.stop();
    if (this.currentVoice) this.currentVoice.stop();
    Howler.mute(false);
  }
}

export const audioManager = new AudioManager();