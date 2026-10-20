import { describe, expect, it } from 'vitest';
import { createInitialState, update } from '../../src/game/update';
import { films, storyRooms, type StoryProgress } from '../../src/game/story/model';
import { freshStoryProgress } from '../../src/game/story/progress';
import { decodeStoryProgress, encodeStoryProgress, migratePrototypeProgress } from '../../src/game/story/save';
import { freshAdventure, importLegacy } from '../../src/game/adventure';
import { StoryJourney, ending, fingerprint, hardwarePath, milestones, paperPath, planPath, run, storyFixture, type Milestone } from '../fixtures/story';

const beforeReview = () => run(new StoryJourney(), [...paperPath, ...planPath, ...hardwarePath, 'test-candidate']);
function snapshot(journey: StoryJourney): StoryProgress {
  const decoded = decodeStoryProgress({ version: 2, ...journey.state.progress });
  expect(decoded, JSON.stringify(journey.state.progress)).not.toBeNull();
  return decoded!;
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

describe('connected adventure rules through the shared reducer', () => {
  it.each([
    ['paper first', [...paperPath, ...planPath, ...hardwarePath, ...ending]],
    ['hardware first', [...hardwarePath, ...paperPath, ...planPath, ...ending]],
    ['retail first', ['take-pick', 'open-drawer', 'take-clip', 'print-bad-receipt', ...paperPath, ...planPath, ...hardwarePath, ...ending]],
  ] as const)('completes with %s exploration, retaining tools and references', (_name, route) => {
    const journey = run(new StoryJourney(), route);
    expect(snapshot(journey).completed).toBe(true);
    expect(journey.state.progress.inventory).toEqual(expect.arrayContaining(['guitar-pick', 'strap', 'stylus', 'faulty-receipt', 'checkout-plan', 'test-receipt']));
    for (const spent of ['power-lead', 'gum', 'chewed-gum', 'retaining-clip', 'sticky-clip', 'paper-plane']) {
      expect(journey.state.progress.inventory).not.toContain(spent);
    }
  });

  it.each(films)('prints for any valid rating of %s without a correct taste to guess', film => {
    for (const rating of [1, 2, 3, 4, 5] as const) {
      const journey = run(new StoryJourney(), ['take-lead', 'power-computer']);
      journey.enter('mcgill').touch('computer');
      const result = journey.dispatch({ type: 'room', action: { type: 'rate-film', film, rating } });
      expect(result.state.progress.inventory).toEqual(['recommendation']);
      expect(result.effects).toEqual([{ type: 'persist' }]);
    }
  });

  it('requires power and an open terminal, rejects out-of-range runtime input, and keeps one paper form', () => {
    const j = new StoryJourney();
    j.touch('computer');
    expect(j.state.room.computerOpen).toBe(false);
    const rate = { type: 'room', action: { type: 'rate-film', film: 'Alien', rating: 1 } } as const;
    j.dispatch(rate);
    expect(j.state.progress.inventory).toEqual([]);
    run(j, ['take-lead', 'power-computer']);
    j.dispatch(rate);
    expect(j.state.progress.inventory).toEqual([]);
    j.touch('computer');
    j.dispatch({ ...rate, action: { ...rate.action, rating: 0 as 1 } });
    expect(j.state.progress.inventory).toEqual([]);
    j.dispatch(rate);
    j.use('recommendation');
    j.touch('computer'); j.dispatch(rate);
    expect(j.state.progress.inventory).toEqual(['paper-plane']);
    j.enter('smart').itemOn('paper-plane', 'ledge');
    run(j, ['print-recommendation']);
    expect(j.state.progress.inventory).not.toContain('recommendation');
    snapshot(j);
  });

  it.each([['chewed-gum', 'retaining-clip'], ['retaining-clip', 'chewed-gum']])('combines %s with %s atomically and preserves unrelated items', (item, target) => {
    const j = run(new StoryJourney(), ['take-gum', 'chew-gum', 'take-pick', 'open-drawer', 'take-clip']);
    const before = freeze(j.state);
    const action = { type: 'use-item', item, target } as const;
    const result = j.dispatch(action);
    expect(result).toEqual(update(before, action, storyFixture(j.room)));
    expect([...result.state.progress.inventory].sort()).toEqual(['guitar-pick', 'sticky-clip']);
    expect(before.progress.inventory).toContain('chewed-gum');
    expect(result.effects).toEqual([{ type: 'persist' }]);
    run(j, ['take-gum', 'take-clip']);
    expect(j.state.progress.inventory).toEqual(result.state.progress.inventory);
    snapshot(j);
  });

  it('rejects unavailable ingredients and unrelated combinations without saving or consuming anything', () => {
    const j = run(new StoryJourney(), ['take-gum', 'take-pick', 'open-drawer', 'take-clip']);
    const before = j.state.progress;
    for (const pair of [['gum', 'retaining-clip'], ['guitar-pick', 'gum'], ['chewed-gum', 'retaining-clip'], ['gum', 'missing']]) {
      const result = j.use(pair[0], pair[1]);
      expect(result.effects).toEqual([]);
      expect(result.state.progress).toBe(before);
    }
    expect(j.use('missing').state.progress).toBe(before);
    expect(j.state.progress.inventory).toContain('gum');
  });

  it('keeps wrong throws and ungrounded repairs recoverable, with a transient shock', () => {
    const j = run(new StoryJourney(), [...paperPath.slice(0, 4), ...hardwarePath.slice(0, 6)]);
    j.enter('nortel').itemOn('paper-plane', 'console');
    expect(j.state.progress.inventory).toContain('paper-plane');
    const ingredients = [...j.state.progress.inventory];
    const shock = j.itemOn('sticky-clip', 'mount');
    expect(shock.state.room.tripped).toBe(true);
    expect(shock.effects.filter(effect => effect.type === 'persist')).toHaveLength(1); // walking only
    expect(shock.state.progress.inventory).toEqual(ingredients);
    j.touch('strap');
    j.itemOn('sticky-clip', 'mount');
    expect(j.state.progress.inventory).toContain('sticky-clip');
    j.touch('console');
    expect(j.state.room.tripped).toBe(false);
    j.touch('cable');
    expect(j.state.progress.flags?.linkRestored).toBe(false);
    j.itemOn('sticky-clip', 'mount');
    expect(j.state.progress.inventory).not.toContain('sticky-clip');
    j.touch('cable');
    expect(j.state.progress.flags?.linkRestored).toBe(true);
    j.dispatch({ type: 'room', action: { type: 'reset-equipment' } });
    expect(j.state.progress.flags?.clipMounted).toBe(true);
    snapshot(j);
  });

  it('can collect the strap before wearing it, and safely collect the spare lead during a fault', () => {
    const j = new StoryJourney().enter('nortel');
    j.touch('strap', 'pickup');
    expect(j.state.progress.flags?.strapWorn).toBe(false);
    j.touch('ome-a');
    j.touch('power-lead', 'pickup');
    expect(j.state.room.tripped).toBe(true);
    expect(j.state.progress.inventory).toEqual(['strap', 'power-lead']);
    j.enter('mcgill').use('strap');
    expect(j.state.progress.flags?.strapWorn).toBe(true);
    expect(j.state.room.tripped).toBe(false);
  });

  it('copies references without consuming them, and keeps a candidate queued until Nortel is online', () => {
    const j = run(new StoryJourney(), [...paperPath, ...planPath]);
    expect(j.state.progress.inventory).toEqual(expect.arrayContaining(['faulty-receipt', 'checkout-plan']));
    expect(j.state.progress.agent?.candidate).toEqual({ id: 1 });
    run(j, ['test-candidate']);
    expect(j.state.progress.agent?.receipt).toBeNull();
    run(j, [...hardwarePath, 'test-candidate']);
    expect(j.state.progress.agent?.receipt).toEqual({ candidateId: 1, sale: { quantity: 3, unitPriceCents: 300, totalCents: 900 } });
    expect(j.state.progress.completed).toBe(false);
  });

  it('accepts task references in either order and repeated delegation keeps the tested candidate identity', () => {
    const j = run(new StoryJourney(), [...hardwarePath, ...paperPath, 'print-bad-receipt', 'copy-example', 'draw-plan', 'provide-example', 'provide-plan', 'prepare-candidate', 'test-candidate']);
    const before = j.state.progress.agent;
    run(j, ['provide-plan', 'provide-example', 'prepare-candidate']);
    expect(j.state.progress.agent).toBe(before);
    run(j, ['review-result']);
    expect(j.state.progress.completed).toBe(true);
  });

  it.each([
    { candidateId: 99, sale: { quantity: 3, unitPriceCents: 300, totalCents: 900 } },
    { candidateId: 1, sale: { quantity: 2, unitPriceCents: 300, totalCents: 600 } },
    { candidateId: 1, sale: { quantity: 3, unitPriceCents: 300, totalCents: 300 } },
  ])('rejects stale or unsuitable test evidence, then repairs it by rerunning the till: %j', receipt => {
    const j = beforeReview();
    j.state = { ...j.state, progress: { ...j.state.progress, agent: { candidate: { id: 1 }, receipt } } };
    snapshot(j); // Recoverable evidence is retained by the future save decoder too.
    run(j, ['review-result']);
    expect(j.state.progress.completed).toBe(false);
    expect(j.state.progress.inventory).toContain('test-receipt');
    run(j, ['test-candidate', 'review-result']);
    expect(j.state.progress.completed).toBe(true);
  });

  it('makes receipt arithmetic inspectable and requires the actual new test, without requiring Look', () => {
    const j = run(new StoryJourney(), ['print-bad-receipt']);
    j.dispatch({ type: 'room', action: { type: 'inspect-item', item: 'faulty-receipt' } });
    expect(j.state.dialogue.text).toContain('2 coffees × $3.00. Total: $3.00');
    run(j, [...paperPath, ...planPath, ...hardwarePath]);
    j.enter('shopify').itemOn('faulty-receipt', 'workbench');
    expect(j.state.progress.completed).toBe(false);
    run(j, ['test-candidate']);
    j.dispatch({ type: 'room', action: { type: 'inspect-item', item: 'test-receipt' } });
    expect(j.state.dialogue.text).toContain('3 coffees × $3.00. Total: $9.00');
    const noLook = beforeReview();
    run(noLook, ['review-result']);
    expect(noLook.state.progress.completed).toBe(true);
  });

  it('keeps earlier-candidate evidence after reload but requires testing the current candidate', () => {
    const old = snapshot(beforeReview());
    const saved = { ...encodeStoryProgress(old), agent: { ...old.agent, candidate: { id: 2 } } };
    const restored = decodeStoryProgress(JSON.parse(JSON.stringify(saved)));
    expect(restored).not.toBeNull();
    const j = new StoryJourney(restored!);
    run(j, ['review-result']);
    expect(j.state.progress.completed).toBe(false);
    run(j, ['test-candidate']);
    expect(j.state.progress.agent?.receipt?.candidateId).toBe(2);
    run(j, ['review-result']);
    expect(j.state.progress.completed).toBe(true);
  });

  it('ignores film/reset events sent to the wrong room and rejects a forged item selection', () => {
    const j = new StoryJourney().enter('shopify');
    const before = j.state;
    expect(j.dispatch({ type: 'room', action: { type: 'rate-film', film: 'Alien', rating: 1 } })).toEqual({ state: before, effects: [] });
    expect(j.dispatch({ type: 'room', action: { type: 'reset-equipment' } })).toEqual({ state: before, effects: [] });
    j.state = { ...j.state, mode: 'use', selectedItem: 'test-receipt' };
    j.dispatch({ type: 'interact', prop: 'workbench' });
    expect(j.state.progress.completed).toBe(false);
  });

  it('leaves every room freely before solving anything, during a fault and after completion', () => {
    const complete = snapshot(run(beforeReview(), ['review-result']));
    for (const progress of [freshStoryProgress(), complete]) for (const room of storyRooms) {
      const j = new StoryJourney(progress).enter(room);
      if (room === 'nortel' && !progress.completed) j.touch('ome-a');
      expect(j.touch('door', 'open').effects).toContainEqual({ type: 'leave-room' });
      expect(j.state.progress.completed).toBe(progress.completed);
    }
  });
});

describe('connected progress cutover and save validation', () => {
  it.each([false, true])('migrates prototype McGill success=%s and every Nortel stage without losing earned progress', ticket => {
    const stages = [{}, { strap: true }, { strap: true, strapWorn: true }, { strap: true, strapWorn: true, linkRestored: true }];
    for (const stage of stages) {
      const old = importLegacy({ ticket, completed: ticket }, { version: 2, ...stage });
      const migrated = migratePrototypeProgress(old);
      expect(decodeStoryProgress(encodeStoryProgress(migrated))).toEqual(migrated);
      expect(migrated.flags.computerPowered).toBe(ticket);
      expect(migrated.flags.linkRestored).toBe(stage.linkRestored === true);
      expect(migrated.completed).toBe(false);
      const j = run(new StoryJourney(migrated), [...paperPath, ...planPath, ...hardwarePath, ...ending]);
      expect(snapshot(j).completed).toBe(true);
      expect(new Set(j.state.progress.inventory).size).toBe(j.state.progress.inventory.length);
    }
    expect(migratePrototypeProgress(freshAdventure())).toEqual(freshStoryProgress());
  });

  it('round-trips immutable story state without terminal/fault/selection or position data', () => {
    const j = beforeReview();
    const progress = freeze(snapshot(j));
    const runtimeProgress = { ...progress, position: { x: 50, y: 80 }, computerOpen: true };
    const encoded = encodeStoryProgress(runtimeProgress);
    expect(Object.keys(encoded).sort()).toEqual(['agent', 'completed', 'flags', 'inventory', 'version']);
    const decoded = decodeStoryProgress(JSON.parse(JSON.stringify(encoded)));
    expect(decoded).toEqual(progress);
    expect(decoded!.agent.receipt).not.toBe(progress.agent.receipt);
    expect(createInitialState(storyFixture('nortel'), { ...decoded!, position: { x: 50, y: 80 } }).room.tripped).toBe(false);
  });

  it('protects malformed, future, unknown-item and impossible item/source saves', () => {
    const fresh = encodeStoryProgress(freshStoryProgress());
    const bad: unknown[] = [null, [], {}, { ...fresh, version: 3 }, { ...fresh, inventory: ['ticket'] },
      { ...fresh, flags: { ...fresh.flags, futureFlag: false } }, { ...fresh, agent: { candidate: { id: NaN }, receipt: null } },
      { ...fresh, inventory: ['power-lead'], flags: { ...fresh.flags, computerPowered: true, powerLeadTaken: true } },
      { ...fresh, inventory: ['gum', 'chewed-gum'], flags: { ...fresh.flags, gumTaken: true } },
      { ...fresh, flags: { ...fresh.flags, linkRestored: true } }, { ...fresh, inventory: ['stylus'] },
      { ...fresh, inventory: ['test-receipt'] }, { ...fresh, completed: true }];
    for (const saved of bad) expect(decodeStoryProgress(saved), JSON.stringify(saved)).toBeNull();
    const complete = encodeStoryProgress(snapshot(run(beforeReview(), ['review-result'])));
    expect(decodeStoryProgress({ ...complete, agent: { ...complete.agent, receipt: { ...complete.agent.receipt!, candidateId: 99 } } })).toBeNull();
  });
});

it('every reachable milestone prefix can still complete using the actual reducer rules', () => {
  // Explore runtime transitions rather than rechecking a second copy of the dependency table.
  const states: StoryProgress[] = [freshStoryProgress()];
  const index = new Map([[fingerprint(states[0]), 0]]);
  const parents: number[][] = [[]];
  const entries = Object.entries(milestones) as [Milestone, (j: StoryJourney) => void][];
  for (let cursor = 0; cursor < states.length; cursor++) {
    for (const [, apply] of entries) {
      const j = new StoryJourney(states[cursor]);
      apply(j);
      const next = snapshot(j);
      const key = fingerprint(next);
      let destination = index.get(key);
      if (destination === undefined) {
        destination = states.length; index.set(key, destination); states.push(next); parents.push([]);
      }
      if (destination !== cursor) parents[destination].push(cursor);
    }
    if (states.length > 20_000) throw new Error('Story state space unexpectedly grew; check for repeatable sources.');
  }
  const endings = states.flatMap((state, i) => state.completed ? [i] : []);
  expect(endings.length).toBeGreaterThan(0);
  const recoverable = new Set(endings);
  const queue = [...endings];
  for (let i = 0; i < queue.length; i++) for (const parent of parents[queue[i]]) if (!recoverable.has(parent)) {
    recoverable.add(parent); queue.push(parent);
  }
  expect(recoverable.size).toBe(states.length);
  for (const ending of endings) {
    const { flags, agent } = states[ending];
    expect(flags).toMatchObject({ computerPowered: true, stylusDown: true, exampleOnBoard: true, linkRestored: true, agentHasPlan: true, agentHasExample: true, reviewComplete: true });
    expect(agent.receipt?.sale).toEqual({ quantity: 3, unitPriceCents: 300, totalCents: 900 });
  }
});
