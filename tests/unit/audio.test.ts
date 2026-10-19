import { describe, expect, it, vi } from 'vitest';
import { createAmbientAudio } from '../../src/browser/audio';

function audioHost() {
  const gain = { value: 0, cancelScheduledValues: vi.fn(), setTargetAtTime: vi.fn() };
  const oscillator = { type: '', frequency: { value: 0 }, detune: { value: 0 }, connect: vi.fn(), start: vi.fn() };
  const host = {
    state: 'suspended', currentTime: 0, destination: {},
    createGain: vi.fn(() => ({ gain, connect: vi.fn() })),
    createBiquadFilter: vi.fn(() => ({ type: '', frequency: { value: 0 }, connect: vi.fn() })),
    createOscillator: vi.fn(() => oscillator),
    resume: vi.fn(async () => { host.state = 'running'; }),
    suspend: vi.fn(async () => { host.state = 'suspended'; }),
    close: vi.fn(async () => { host.state = 'closed'; }),
  };
  return { host, gain, create: vi.fn(() => host as unknown as AudioContext) };
}

describe('ambient audio lifecycle', () => {
  it('creates no audio until requested and serializes rapid toggles on one graph', async () => {
    const { host, create } = audioHost();
    const audio = createAmbientAudio(create);
    expect(create).not.toHaveBeenCalled();
    await expect(Promise.all([audio.toggle(), audio.toggle(), audio.toggle()])).resolves.toEqual([true, false, true]);
    expect(create).toHaveBeenCalledTimes(1);
    expect(host.createOscillator).toHaveBeenCalledTimes(4);
    audio.dispose();
  });

  it('allows a fresh toggle after a rejected browser resume', async () => {
    const { host, gain, create } = audioHost();
    host.resume.mockRejectedValueOnce(new Error('Browser denied audio'));
    const audio = createAmbientAudio(create);
    await expect(audio.toggle()).rejects.toThrow('Browser denied audio');
    expect(gain.value).toBe(.0001);
    await expect(audio.toggle()).resolves.toBe(true);
    audio.dispose();
  });

  it('closes partially initialized graphs and can retry construction', async () => {
    const { host, create } = audioHost();
    host.createBiquadFilter.mockImplementationOnce(() => { throw new Error('Unavailable filter'); });
    const audio = createAmbientAudio(create);
    await expect(audio.toggle()).rejects.toThrow('Unavailable filter');
    expect(host.close).toHaveBeenCalledTimes(1);
    await expect(audio.toggle()).resolves.toBe(true);
    expect(create).toHaveBeenCalledTimes(2);
    audio.dispose();
  });

  it('suspends a hidden tab and resumes only when sound is enabled', async () => {
    const { host, create } = audioHost();
    const audio = createAmbientAudio(create);
    await audio.setHidden(true);
    expect(create).not.toHaveBeenCalled();
    await audio.toggle();
    expect(host.state).toBe('suspended');
    await audio.setHidden(false);
    expect(host.state).toBe('running');
    await audio.toggle();
    host.resume.mockClear();
    await audio.setHidden(true);
    await audio.setHidden(false);
    expect(host.resume).not.toHaveBeenCalled();
    audio.dispose();
  });

  it('releases the context and prevents queued toggles from restarting disposed audio', async () => {
    const { host, create } = audioHost();
    const audio = createAmbientAudio(create);
    await audio.toggle();
    const pending = audio.toggle();
    audio.dispose();
    await expect(pending).resolves.toBe(false);
    await expect(audio.toggle()).resolves.toBe(false);
    expect(host.close).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
