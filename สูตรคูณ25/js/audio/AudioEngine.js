export class AudioEngine {
  constructor(store) {
    this.store = store;
    this.context = null;
    this.master = null;
    this.musicGain = null;
    this.interval = null;
    this.step = 0;
    this.scheduled = new Set();
  }

  ensure() {
    if (this.context) return;
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.musicGain.connect(this.master);
    this.master.connect(this.context.destination);
    this.sync();
  }

  sync() {
    if (!this.master || !this.musicGain) return;
    this.master.gain.value = 1;
    this.musicGain.gain.value = this.store.settings.musicVolume;
  }

  startMusic() {
    this.ensure();
    if (this.interval) return;
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
    this.interval = setInterval(() => {
      this.playTone(notes[this.step % notes.length], 0.07, "sine", this.store.settings.musicVolume * 0.18);
      this.step += 1;
    }, 420);
  }

  stopMusic() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.cancelScheduled();
  }

  schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      this.scheduled.delete(timer);
      callback();
    }, delay);
    this.scheduled.add(timer);
  }

  cancelScheduled() {
    this.scheduled.forEach((timer) => window.clearTimeout(timer));
    this.scheduled.clear();
  }

  playTone(freq, duration = 0.12, type = "triangle", gainValue = 0.12) {
    this.ensure();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue * this.store.settings.sfxVolume;
    osc.connect(gain);
    gain.connect(this.master);
    const now = this.context.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  correct() {
    this.playTone(523.25, 0.08, "triangle", 0.14);
    this.schedule(() => this.playTone(659.25, 0.1, "triangle", 0.13), 90);
    this.schedule(() => this.playTone(783.99, 0.12, "triangle", 0.12), 180);
  }

  wrong() {
    this.playTone(196, 0.16, "sine", 0.1);
    this.schedule(() => this.playTone(164.81, 0.16, "sine", 0.08), 120);
  }

  milestone() {
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((frequency, index) => {
      this.schedule(() => this.playTone(frequency, 0.18, "triangle", 0.14), index * 120);
    });
  }
}
