import type { Action, GameState, Progress, RoomDefinition, Transition } from '../../src/game/model';
import { createInitialState, update } from '../../src/game/update';
import { useStoryItem } from '../../src/game/story/inventory';
import { initialStoryRoom, itemNames, type StoryAction, type StoryRoomId, type StoryRoomState } from '../../src/game/story/model';
import { freshStoryProgress } from '../../src/game/story/progress';
import { interactStory, updateStoryRoom } from '../../src/game/story/rules';

// Geometry is deliberately fictional and test-only. No unfinished scene is registered in the app.
const props = {
  mcgill: ['computer', 'gum', 'papers', 'board', 'records', 'door'],
  nortel: ['power-lead', 'strap', 'mount', 'cable', 'ome-a', 'ome-b', 'console', 'door'],
  smart: ['ledge', 'stylus', 'whiteboard', 'door'],
  lightspeed: ['drawer', 'clip', 'till', 'door'],
  shopify: ['pick', 'guitar', 'workbench', 'door'],
};
export function storyFixture(id: StoryRoomId): RoomDefinition<StoryRoomState, StoryAction> {
  return {
    id, title: id, label: id, gameLabel: id,
    art: { src: '/test-only.webp', alt: 'Test fixture', width: 100, height: 100 },
    spawn: { x: 50, y: 80 }, bounds: { left: 0, right: 100, top: 0, bottom: 100 },
    props: props[id].map((prop, index) => ({ id: prop, name: prop, label: prop,
      area: { left: index * 10, top: 0, width: 10, height: 10 }, destination: { x: 50 + index, y: 80 } })),
    items: Object.entries(itemNames).map(([item, name]) => ({ id: item, name, label: name, icon: 'ticket' })),
    initialState: initialStoryRoom,
    interact: (state, prop) => interactStory(id, state, prop),
    useInventoryItem: useStoryItem,
    update: (state, action) => updateStoryRoom(id, state, action),
  };
}

export class StoryJourney {
  room: StoryRoomId = 'mcgill';
  state: GameState<StoryRoomState>;
  constructor(progress: Omit<Progress, 'position'> = freshStoryProgress()) {
    this.state = createInitialState(storyFixture(this.room), { ...progress, position: { x: 50, y: 80 } });
  }
  enter(room: StoryRoomId) {
    this.room = room;
    this.state = createInitialState(storyFixture(room), this.state.progress);
    return this;
  }
  dispatch(action: Action<StoryAction>): Transition<StoryRoomState> {
    const result = update(this.state, action, storyFixture(this.room));
    this.state = result.state;
    return result;
  }
  touch(prop: string, mode: 'use' | 'pickup' | 'open' | 'look' = 'use') {
    this.dispatch({ type: 'select-mode', mode: 'walk' });
    this.dispatch({ type: 'select-mode', mode });
    return this.dispatch({ type: 'interact', prop });
  }
  itemOn(item: string, prop: string, mode: 'use' | 'give' = 'use') {
    if (!this.state.progress.inventory.includes(item)) return { state: this.state, effects: [] };
    this.dispatch({ type: 'select-mode', mode: 'walk' });
    this.dispatch({ type: 'select-mode', mode });
    this.dispatch({ type: 'select-item', item });
    return this.dispatch({ type: 'interact', prop });
  }
  use(item: string, target?: string) { return this.dispatch({ type: 'use-item', item, target }); }
}

export const milestones = {
  'take-lead': (j: StoryJourney) => { j.enter('nortel').touch('power-lead', 'pickup'); },
  'power-computer': (j: StoryJourney) => { j.enter('mcgill').itemOn('power-lead', 'computer'); },
  'print-recommendation': (j: StoryJourney) => {
    j.enter('mcgill').touch('computer'); j.dispatch({ type: 'room', action: { type: 'rate-film', film: 'Alien', rating: 1 } });
  },
  'fold-plane': (j: StoryJourney) => { j.use('recommendation'); },
  'knock-stylus-down': (j: StoryJourney) => { j.enter('smart').itemOn('paper-plane', 'ledge'); },
  'take-stylus': (j: StoryJourney) => { j.enter('smart').touch('stylus', 'pickup'); },
  'take-pick': (j: StoryJourney) => { j.enter('shopify').touch('pick', 'pickup'); },
  'open-drawer': (j: StoryJourney) => { j.enter('lightspeed').itemOn('guitar-pick', 'drawer'); },
  'take-clip': (j: StoryJourney) => { j.enter('lightspeed').touch('clip', 'pickup'); },
  'take-gum': (j: StoryJourney) => { j.enter('mcgill').touch('gum', 'pickup'); },
  'chew-gum': (j: StoryJourney) => { j.use('gum'); },
  'make-sticky-clip': (j: StoryJourney) => { j.use('chewed-gum', 'retaining-clip'); },
  'wear-strap': (j: StoryJourney) => { j.enter('nortel').touch('strap'); },
  'mount-clip': (j: StoryJourney) => { j.enter('nortel').itemOn('sticky-clip', 'mount'); },
  'connect-fibre': (j: StoryJourney) => { j.enter('nortel').touch('cable'); },
  'print-bad-receipt': (j: StoryJourney) => { j.enter('lightspeed').touch('till'); },
  'copy-example': (j: StoryJourney) => { j.enter('smart').itemOn('faulty-receipt', 'whiteboard'); },
  'draw-plan': (j: StoryJourney) => { j.enter('smart').itemOn('stylus', 'whiteboard'); },
  'provide-plan': (j: StoryJourney) => { j.enter('shopify').itemOn('checkout-plan', 'workbench', 'give'); },
  'provide-example': (j: StoryJourney) => { j.enter('shopify').itemOn('faulty-receipt', 'workbench', 'give'); },
  'prepare-candidate': (j: StoryJourney) => { j.enter('shopify').touch('workbench'); },
  'test-candidate': (j: StoryJourney) => { j.enter('lightspeed').touch('till'); },
  'review-result': (j: StoryJourney) => { j.enter('shopify').itemOn('test-receipt', 'workbench'); },
} as const;
export type Milestone = keyof typeof milestones;

export function run(journey: StoryJourney, steps: readonly Milestone[]) {
  for (const step of steps) milestones[step](journey);
  return journey;
}
export const paperPath: readonly Milestone[] = ['take-lead', 'power-computer', 'print-recommendation', 'fold-plane', 'knock-stylus-down', 'take-stylus'];
export const hardwarePath: readonly Milestone[] = ['take-pick', 'open-drawer', 'take-clip', 'take-gum', 'chew-gum', 'make-sticky-clip', 'wear-strap', 'mount-clip', 'connect-fibre'];
export const planPath: readonly Milestone[] = ['print-bad-receipt', 'copy-example', 'draw-plan', 'provide-plan', 'provide-example', 'prepare-candidate'];
export const ending: readonly Milestone[] = ['test-candidate', 'review-result'];

export function fingerprint(progress: Omit<Progress, 'position'>) {
  return JSON.stringify({ inventory: [...progress.inventory].sort(), flags: progress.flags, agent: progress.agent, completed: progress.completed });
}
