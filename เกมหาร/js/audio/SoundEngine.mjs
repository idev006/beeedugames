const SFX_MASTER_GAIN = 17;
const AMBIENT_MASTER_GAIN = 8.4;

export class SoundEngine {
  constructor(settings) {
    this.settings = settings;
    this.context = null;
    this.ambient = null;
    this.ambientTimer = null;
    this.masterSfxGain = null;
    this.masterAmbientGain = null;
  }

  play(frequency, seconds = 0.05, type = 'sine') {
    this.#tone(frequency, seconds, type);
  }

  cue(name) {
    if (!this.settings.soundOn || this.settings.reducedSensory) return;
    const cues = {
      start: [[392, .09, 'triangle', 0, .028], [523, .12, 'triangle', .075, .026], [784, .08, 'sine', .16, .016]],
      place: [[523, .055, 'triangle', .01, .024], [784, .045, 'sine', .045, .012]],
      return: [[330, .07, 'triangle', 0, .02], [247, .09, 'sine', .055, .014]],
      submit: [[440, .055, 'sine', 0, .02], [587, .07, 'triangle', .055, .018], [880, .05, 'sine', .14, .012]],
      correct: [[523, .09, 'triangle', 0, .028], [659, .09, 'triangle', .08, .026], [784, .11, 'sine', .16, .024], [1047, .22, 'sine', .28, .018]],
      wrong: [[392, .08, 'triangle', 0, .018], [349, .1, 'sine', .08, .014], [440, .08, 'triangle', .2, .012]],
      hint: [[988, .045, 'sine', 0, .014], [1319, .05, 'sine', .055, .014], [1760, .08, 'triangle', .13, .012], [1175, .12, 'sine', .24, .01]],
      guided: [[392, .05, 'triangle', 0, .02], [440, .055, 'triangle', .07, .019], [494, .06, 'triangle', .14, .018], [587, .08, 'sine', .24, .013]],
      split: [[988, .04, 'sine', 0, .018], [740, .05, 'sine', .045, .016], [587, .07, 'triangle', .095, .013]],
      drop: [[262, .06, 'triangle', 0, .02], [196, .08, 'sine', .05, .017], [147, .1, 'triangle', .12, .012]],
      flow: [[659, .045, 'sine', 0, .012], [880, .05, 'sine', .055, .01]],
      unlock: [[392, .1, 'triangle', 0, .025], [523, .12, 'triangle', .09, .025], [659, .14, 'sine', .2, .022], [784, .16, 'triangle', .32, .02], [1047, .28, 'sine', .5, .016]],
      replay: [[523, .055, 'triangle', 0, .016], [392, .07, 'triangle', .05, .016], [330, .08, 'sine', .12, .012]],
    };
    if (['place', 'return'].includes(name)) this.#tap(name === 'place' ? 1300 : 700, .028, 0, .012);
    if (name === 'split') this.#tap(2400, .025, 0, .008);
    if (name === 'drop') this.#tap(170, .06, 0, .012);
    if (name === 'submit') this.#tap(1600, .035, 0, .01);
    if (['correct', 'unlock'].includes(name)) this.#shimmer(name === 'unlock' ? .34 : .2);
    for (const note of cues[name] ?? []) this.#tone(...note);
  }

  #tone(frequency, seconds = 0.05, type = 'sine', delay = 0, level = 0.035) {
    if (!this.settings.soundOn || this.settings.reducedSensory) return;
    try {
      const context = this.#ensureContext();
      if (!context) return;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const startAt = context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = Math.random() * 5 - 2.5;
      filter.type = 'lowpass';
      filter.frequency.value = Math.max(900, frequency * 2.4);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(level * this.settings.sfxVolume, startAt + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + seconds);
      oscillator.connect(filter).connect(gain).connect(this.masterSfxGain);
      oscillator.start(startAt);
      oscillator.stop(startAt + seconds + 0.02);
    } catch { /* Sound is optional. */ }
  }

  #tap(frequency = 900, seconds = .035, delay = 0, level = .012) {
    try {
      const context = this.#ensureContext();
      if (!context) return;
      const sampleCount = Math.max(1, Math.floor(context.sampleRate * seconds));
      const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < sampleCount; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      filter.type = 'bandpass';
      filter.frequency.value = frequency;
      gain.gain.value = level * this.settings.sfxVolume;
      source.buffer = buffer;
      source.connect(filter).connect(gain).connect(this.masterSfxGain);
      source.start(context.currentTime + delay);
    } catch { /* Sound is optional. */ }
  }

  #shimmer(delay = 0) {
    for (const note of [[1568, .05, 'sine', delay, .008], [1976, .06, 'sine', delay + .07, .007], [2637, .08, 'sine', delay + .15, .006]]) this.#tone(...note);
  }

  #ensureContext() {
    const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.context ??= new AudioContextClass();
    this.#ensureMasterGains();
    if (this.context.state === 'suspended') this.context.resume?.();
    return this.context;
  }

  #ensureMasterGains() {
    if (this.masterSfxGain && this.masterAmbientGain) return;
    this.masterSfxGain = this.context.createGain();
    this.masterAmbientGain = this.context.createGain();
    this.masterSfxGain.gain.value = SFX_MASTER_GAIN;
    this.masterAmbientGain.gain.value = AMBIENT_MASTER_GAIN;
    this.masterSfxGain.connect(this.context.destination);
    this.masterAmbientGain.connect(this.context.destination);
  }

  #syncMasterGains() {
    const now = this.context.currentTime;
    this.masterSfxGain.gain.setTargetAtTime(this.settings.soundOn && !this.settings.reducedSensory ? SFX_MASTER_GAIN : 0, now, .05);
    this.masterAmbientGain.gain.setTargetAtTime(this.settings.musicOn && !this.settings.reducedSensory ? AMBIENT_MASTER_GAIN : 0, now, .3);
  }

  setAmbient(on) {
    if (!on || !this.settings.musicOn || this.settings.reducedSensory) {
      this.stopAmbient();
      return;
    }
    try {
      const context = this.#ensureContext();
      if (!context || this.ambient) return;
      this.#syncMasterGains();
      this.ambient = { active: true, phrase: 0 };
      const scheduleMusicPhrase = () => {
        if (!this.ambient || !this.settings.musicOn || this.settings.reducedSensory) return;
        this.#musicPhrase(this.ambient.phrase);
        this.ambient.phrase = (this.ambient.phrase + 1) % 4;
        this.ambientTimer = setTimeout(scheduleMusicPhrase, 6500 + Math.random() * 3500);
      };
      scheduleMusicPhrase();
    } catch { /* Music is optional. */ }
  }

  #musicPhrase(phrase) {
    const phrases = [
      [[523, 0], [659, .34], [784, .68], [659, 1.08]],
      [[587, 0], [659, .36], [523, .76]],
      [[392, 0], [523, .42], [587, .84], [784, 1.22]],
      [[659, 0], [587, .4], [523, .82]],
    ];
    const notes = phrases[phrase] ?? phrases[0];
    this.#musicTone(196, 1.6, 'sine', 0, .0025, -0.16);
    notes.forEach(([frequency, delay], index) => this.#musicTone(frequency, index === notes.length - 1 ? .42 : .24, 'triangle', delay, .0048, index % 2 ? .18 : -.14));
    this.#musicTap(820, .026, .0026);
  }

  #musicTone(frequency, seconds, type, delay, level, pan = 0) {
    try {
      const context = this.#ensureContext();
      if (!context) return;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = context.createStereoPanner?.();
      const startAt = context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = Math.random() * 4 - 2;
      filter.type = 'lowpass';
      filter.frequency.value = 1250;
      filter.Q.value = .3;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(level * this.settings.musicVolume, startAt + .02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + seconds);
      oscillator.connect(filter).connect(gain);
      if (panner) {
        panner.pan.value = pan;
        gain.connect(panner).connect(this.masterAmbientGain);
      } else {
        gain.connect(this.masterAmbientGain);
      }
      oscillator.start(startAt);
      oscillator.stop(startAt + seconds + .05);
    } catch { /* Music is optional. */ }
  }

  #musicTap(frequency, seconds, level) {
    try {
      const context = this.#ensureContext();
      if (!context) return;
      const sampleCount = Math.max(1, Math.floor(context.sampleRate * seconds));
      const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < sampleCount; index += 1) data[index] = (Math.random() * 2 - 1) * ((sampleCount - index) / sampleCount);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      filter.type = 'bandpass';
      filter.frequency.value = frequency;
      filter.Q.value = 4;
      gain.gain.value = level * this.settings.musicVolume;
      source.buffer = buffer;
      source.connect(filter).connect(gain).connect(this.masterAmbientGain);
      source.start(context.currentTime);
    } catch { /* Music is optional. */ }
  }

  stopAmbient() {
    if (!this.ambient) return;
    this.ambient = null;
    clearTimeout(this.ambientTimer);
    this.ambientTimer = null;
  }

  dispose() {
    this.stopAmbient();
    this.context?.close();
  }
}
