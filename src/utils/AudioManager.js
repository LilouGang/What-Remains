import { Howl, Howler } from 'howler';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.musicDistortion = null;
    this.musicGain = null;
    this.voiceGain = null;
    this.masterMuteNode = null; 
    this.ambient = null;
    this.impact = null;
    this.currentVoice = null;
    this.currentDistVal = 0;
    this.animationFrame = null;
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
    this.voiceGain = this.ctx.createGain();
    this.masterMuteNode = this.ctx.createGain(); 

    Howler.masterGain.disconnect();
    
    this.musicDistortion.connect(this.musicGain);
    this.musicGain.connect(this.masterMuteNode);
    this.voiceGain.connect(this.masterMuteNode);
    this.masterMuteNode.connect(this.ctx.destination);

    this.initialized = true;
  }

  setMasterMute(isMuted) {
    if (!this.initialized) this.initNodes();
    if (this.masterMuteNode) {
      this.masterMuteNode.gain.setValueAtTime(isMuted ? 0 : 1, this.ctx.currentTime);
    }
  }

  updateEffects(targetDist, targetVol, targetPitch, duration = 5000) {
    if (!this.initialized) this.initNodes();
    const now = this.ctx.currentTime;
    const durationSec = duration / 1000;

    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(targetVol, now + durationSec);

    const startDist = this.currentDistVal;
    const startPitch = this.ambient ? this.ambient.rate() : 1;
    const startTime = performance.now();

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentDist = startDist + (targetDist - startDist) * progress;
      const currentPitch = startPitch + (targetPitch - startPitch) * progress;

      const distAmount = Math.pow(currentDist, 2) * 2000;
      this.musicDistortion.curve = this.makeDistortionCurve(distAmount);
      this.currentDistVal = currentDist;

      if (this.ambient) this.ambient.rate(currentPitch);
      if (progress < 1) this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  playAmbient() {
    if (!this.ambient) {
      this.ambient = new Howl({ 
        src: ['/audio/main.mp3'], loop: true, volume: 1, html5: false,
        onplay: () => {
          const node = this.ambient._sounds[0]._node;
          node.disconnect();
          node.connect(this.musicDistortion);
        }
      });
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
      src: [file], autoplay: true, volume: 1,
      onplay: () => {
        if (this.currentVoice._sounds[0]) {
          const node = this.currentVoice._sounds[0]._node;
          node.disconnect();
          node.connect(this.voiceGain);
        }
      },
      onend: () => { if(onEnd) onEnd(); },
      onloaderror: () => { if(onEnd) onEnd(); }
    });
  }

  playFinalDrop() {
    if (this.musicGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    }
  }

  stopAll() {
    if (this.ambient) this.ambient.stop();
    if (this.currentVoice) this.currentVoice.stop();
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.masterMuteNode) this.masterMuteNode.gain.setValueAtTime(1, this.ctx.currentTime);
  }
}

export const audioManager = new AudioManager();