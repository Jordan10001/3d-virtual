// Procedural Cozy Lo-Fi Music & Office Foley Generator (Web Audio API)

export class LoFiAudioSystem {
  private ctx: AudioContext | null = null;
  public isPlaying = false;
  public isMuted = false;
  public volume = 0.5;

  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private timer: NodeJS.Timeout | null = null;
  private chordStep = 0;

  private chords = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.00, 261.63], // Dm7
    [130.81, 164.81, 196.00, 246.94], // Cmaj7
  ];

  private bassNotes = [87.31, 82.41, 73.42, 65.41];
  private melodyScale = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

  init() {
    if (this.ctx || typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.startVinylHiss();
  }

  private startVinylHiss() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.008;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.06;

    noise.connect(filter);
    filter.connect(gain);
    if (this.musicGain) gain.connect(this.musicGain);

    noise.start();
  }

  playChord(freqs: number[], bassFreq: number, duration = 3.6) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);
    if (this.musicGain) filter.connect(this.musicGain);

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.35 + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now + idx * 0.04);
      osc.stop(now + duration + 0.1);
    });

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);

    bassOsc.connect(bassGain);
    if (this.musicGain) bassGain.connect(this.musicGain);

    bassOsc.start(now);
    bassOsc.stop(now + duration);

    if (Math.random() > 0.35) {
      setTimeout(() => {
        if (!this.ctx || !this.isPlaying) return;
        const note = this.melodyScale[Math.floor(Math.random() * this.melodyScale.length)];
        this.playMelodyPluck(note);
      }, 1200 + Math.random() * 800);
    }
  }

  playMelodyPluck(freq: number) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    if (this.musicGain) gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  toggleMusic(): boolean {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.scheduleLoop();
    } else {
      clearTimeout(this.timer);
      this.timer = null;
    }

    return this.isPlaying;
  }

  private scheduleLoop() {
    if (!this.isPlaying) return;
    const chord = this.chords[this.chordStep];
    const bass = this.bassNotes[this.chordStep];
    this.playChord(chord, bass, 3.8);

    this.chordStep = (this.chordStep + 1) % this.chords.length;
    this.timer = setTimeout(() => {
      this.scheduleLoop();
    }, 3600);
  }

  setMute(mute: boolean): boolean {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  playKeyClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playChime(success = true) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const f1 = success ? 523.25 : 392.00;
    const f2 = success ? 659.25 : 329.63;

    [f1, f2].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.5);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.55);
    });
  }
}
