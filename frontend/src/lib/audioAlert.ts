// Real-time audio tone synthesizer for partner ringing requests and milestones
// Uses HTML5 Web Audio API so it runs without external audio file dependencies

let ringingInterval: any = null;
let audioCtx: AudioContext | null = null;
let isRingingActive = false;
let activeOscillators: OscillatorNode[] = [];

// Persistent storage and tracking for responded/dismissed requests
const DISMISSED_STORAGE_PREFIX = 'lh_dismissed_request_';
const dismissedRequestIds = new Set<string>();

// Cross-tab broadcast channel for audio synchronization
let ringingBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    ringingBroadcastChannel = new BroadcastChannel('localhaat_audio_channel');
    ringingBroadcastChannel.onmessage = (event) => {
      const type = event.data?.type;
      const reqId = event.data?.requestId;
      if (type === 'STOP_RINGING') {
        stopRingingAlert(false);
      } else if (type === 'DISMISS_REQUEST') {
        if (reqId) {
          dismissedRequestIds.add(reqId);
        }
        stopRingingAlert(false);
      }
    };
  } catch (e) {}
}

export const markBookingRequestResponded = (requestId: string) => {
  if (!requestId) return;
  dismissedRequestIds.add(requestId);
  try {
    sessionStorage.setItem(`${DISMISSED_STORAGE_PREFIX}${requestId}`, 'true');
    localStorage.setItem(`${DISMISSED_STORAGE_PREFIX}${requestId}`, Date.now().toString());
  } catch (e) {}

  stopRingingAlert(true);

  if (ringingBroadcastChannel) {
    try {
      ringingBroadcastChannel.postMessage({ type: 'DISMISS_REQUEST', requestId });
    } catch (e) {}
  }
};

export const isBookingRequestResponded = (requestId: string): boolean => {
  if (!requestId) return false;
  if (dismissedRequestIds.has(requestId)) return true;
  try {
    if (sessionStorage.getItem(`${DISMISSED_STORAGE_PREFIX}${requestId}`) === 'true') return true;
    if (localStorage.getItem(`${DISMISSED_STORAGE_PREFIX}${requestId}`)) return true;
  } catch (e) {}
  return false;
};

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function isAudioSuspended(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(audioCtx && audioCtx.state === 'suspended');
}

export async function resumeAudioContext(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
      return true;
    }
    return ctx?.state === 'running';
  } catch (e) {
    return false;
  }
}

// Auto-unlock AudioContext on user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (e) {}
  };
  ['click', 'touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach((ev) => {
    window.addEventListener(ev, unlockAudio, { passive: true });
  });
}

export const playTwoToneChime = () => {
  if (!isRingingActive) return;
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'closed') return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: High frequency pulse (880Hz -> 700Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(700, now + 0.15);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Tone 2: Harmonious second pulse (1174.66Hz -> 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    gain2.gain.setValueAtTime(0.35, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    activeOscillators.push(osc1, osc2);

    osc1.onended = () => {
      activeOscillators = activeOscillators.filter((o) => o !== osc1);
    };
    osc2.onended = () => {
      activeOscillators = activeOscillators.filter((o) => o !== osc2);
    };

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.35);
  } catch (e) {
    // Audio autoplay restrictions gracefully handled
  }
};

export const startRingingAlert = () => {
  stopRingingAlert(false);
  isRingingActive = true;

  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch (e) {}

  playTwoToneChime();

  ringingInterval = setInterval(() => {
    if (!isRingingActive) {
      if (ringingInterval) {
        clearInterval(ringingInterval);
        ringingInterval = null;
      }
      return;
    }
    playTwoToneChime();
  }, 1600);
};

export const stopRingingAlert = (broadcast: boolean = false) => {
  isRingingActive = false;

  if (ringingInterval) {
    clearInterval(ringingInterval);
    ringingInterval = null;
  }

  // Force-terminate and disconnect all in-flight oscillators
  for (const osc of activeOscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {}
  }
  activeOscillators = [];

  // Suspend context to instantly kill any scheduled nodes
  try {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    }
  } catch (e) {}

  // Broadcast to other tabs so they stop ringing synchronously
  if (broadcast && ringingBroadcastChannel) {
    try {
      ringingBroadcastChannel.postMessage({ type: 'STOP_RINGING' });
    } catch (e) {}
  }
};

export const isRinging = (): boolean => isRingingActive;

export const playSuccessChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  } catch (e) {}
};

export const playDeclineChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    [400, 320, 260].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.18);
    });
  } catch (e) {}
};
