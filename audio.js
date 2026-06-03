// audio.js - Synthesizing cinematic sounds using Web Audio API

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let droneOscillators = [];
let droneGain;
let masterGain;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = 0.5; // Overall volume
    }
}

function playTypingSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    // Random high pitch for terminal typing
    osc.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function startScanningSound() {
    if (!audioCtx) return null;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 2.5);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1);
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start();
    
    return {
        stop: () => {
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
            setTimeout(() => osc.stop(), 200);
        }
    };
}

function playUnlockSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

function startDrone() {
    if (!audioCtx) return;
    if (droneGain) return; // already playing
    
    droneGain = audioCtx.createGain();
    droneGain.connect(masterGain);
    droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 4); // Fade in
    
    // Create a chord for cinematic drone (e.g., C2, G2, C3)
    const freqs = [65.41, 98.00, 130.81];
    
    freqs.forEach(f => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        
        // Add slow LFO to frequency for subtle detuning/chorus
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + Math.random() * 0.1; // slow modulation
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 2; // mod depth
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        osc.frequency.value = f;
        osc.connect(droneGain);
        osc.start();
        
        droneOscillators.push({ osc, lfo });
    });
}

function stopDrone() {
    if (!audioCtx || !droneGain) return;
    droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
    setTimeout(() => {
        droneOscillators.forEach(d => {
            d.osc.stop();
            d.lfo.stop();
        });
        droneOscillators = [];
        droneGain = null;
    }, 3000);
}

function playGlitch() {
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Add bitcrusher/filter effect
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);
    
    noise.start();
}

window.AudioEngine = {
    init: initAudio,
    type: playTypingSound,
    startScan: startScanningSound,
    unlock: playUnlockSound,
    startDrone: startDrone,
    stopDrone: stopDrone,
    glitch: playGlitch
};
