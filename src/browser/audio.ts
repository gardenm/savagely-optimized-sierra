/** Owns the audio graph and serializes toggles; it has no DOM dependencies. */
export function createAmbientAudio(createContext: () => AudioContext = () => new AudioContext()) {
  let graph: { context: AudioContext; gain: GainNode } | undefined;
  let enabled = false;
  let disposed = false;
  let hidden = false;
  let pending: Promise<void> = Promise.resolve();

  function initialize() {
    if (graph) return graph;
    const context = createContext();
    try {
      const gain = context.createGain();
      gain.gain.value = .0001;
      gain.connect(context.destination);
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.connect(gain);
      [130.81, 164.81, 196, 246.94].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const voice = context.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        oscillator.detune.value = index % 2 ? -3 : 3;
        voice.gain.value = .2;
        oscillator.connect(voice);
        voice.connect(filter);
        oscillator.start();
      });
      graph = { context, gain };
      return graph;
    } catch (error) {
      void context.close().catch(() => undefined);
      throw error;
    }
  }

  function silence() {
    enabled = false;
    if (graph && graph.context.state !== 'closed') graph.gain.gain.value = .0001;
  }

  return {
    toggle(): Promise<boolean> {
      const operation = pending.then(async () => {
        if (disposed) return false;
        try {
          const { context, gain } = initialize();
          await context.resume();
          if (disposed) return false;
          enabled = !enabled;
          gain.gain.cancelScheduledValues(context.currentTime);
          gain.gain.setTargetAtTime(enabled ? .07 : .0001, context.currentTime, .25);
          if (hidden) await context.suspend();
          return enabled;
        } catch (error) {
          silence();
          throw error;
        }
      });
      pending = operation.then(() => undefined, () => undefined);
      return operation;
    },
    async setHidden(nextHidden: boolean): Promise<void> {
      hidden = nextHidden;
      if (!graph || disposed) return;
      try {
        if (hidden) await graph.context.suspend();
        else if (enabled) await graph.context.resume();
      } catch (error) {
        silence();
        throw error;
      }
    },
    dispose(): void {
      disposed = true;
      enabled = false;
      if (graph && graph.context.state !== 'closed') void graph.context.close().catch(() => undefined);
    },
  };
}
