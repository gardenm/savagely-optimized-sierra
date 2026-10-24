import { say, type RoomDefinition } from '../model';
import { inspectStoryItem, useStoryItem } from '../story/inventory';
import { initialStoryRoom, type StoryAction, type StoryRoomState } from '../story/model';
import { interactStory, updateStoryRoom } from '../story/rules';

/** Castle-inspired scenery around the existing POS and drawer puzzle rules. */
export const lightspeed: RoomDefinition<StoryRoomState, StoryAction> = {
  id: 'lightspeed', title: 'Lightspeed', label: 'Lightspeed office', gameLabel: 'Playable Lightspeed room',
  art: {
    src: '/art/lightspeed-office-dott.png', width: 1536, height: 1024,
    alt: 'A crooked cartoon POS testing office inspired by Gare Viger, with exposed brick, oversized timber beams, an iPad and receipt printer on a teal counter, and an arched passage.',
  },
  spawn: { x: 58, y: 89 }, bounds: { left: 44, right: 88, top: 73, bottom: 96 },
  props: [
    { id: 'till', name: 'iPad POS', label: 'iPad POS', area: { left: 9, top: 32, width: 18, height: 21 }, destination: { x: 45, y: 85 } },
    { id: 'printer', name: 'receipt printer', label: 'Receipt printer', area: { left: 30, top: 42, width: 13, height: 17 }, destination: { x: 49, y: 85 } },
    { id: 'drawer', name: 'drawer', label: 'Counter drawer', area: { left: 11, top: 59, width: 24, height: 18 }, destination: { x: 49, y: 89 } },
    { id: 'clip', name: 'retaining clip', label: 'Retaining clip in the drawer', area: { left: 16, top: 61, width: 13, height: 13 }, destination: { x: 49, y: 92 } },
    { id: 'workstation', name: 'workstation', label: 'Developer workstation', area: { left: 51, top: 34, width: 23, height: 24 }, destination: { x: 65, y: 76 } },
    { id: 'beams', name: 'timber beams', label: 'Timber beams', area: { left: 35, top: 5, width: 36, height: 20 }, destination: { x: 59, y: 85 } },
    { id: 'door', name: 'arched passage', label: 'Arched passage', area: { left: 84, top: 20, width: 15, height: 49 }, destination: { x: 87, y: 76 } },
  ],
  items: [
    { id: 'guitar-pick', name: 'guitar pick', label: 'Guitar pick', icon: 'pick' },
    { id: 'retaining-clip', name: 'retaining clip', label: 'Retaining clip', icon: 'clip' },
  ],
  initialState: initialStoryRoom,
  useInventoryItem: useStoryItem,
  interact(state, prop) {
    if (prop === 'till' || prop === 'drawer' || prop === 'clip') return interactStory('lightspeed', state, prop);
    if (prop === 'door' && (state.mode === 'open' || state.mode === 'use') && !state.selectedItem) return interactStory('lightspeed', state, prop);
    if (state.selectedItem && (state.mode === 'use' || state.mode === 'give')) return say(state, '“That won’t help with this.”');
    if (prop === 'printer' && state.progress.inventory.includes('faulty-receipt')) return inspectStoryItem(state, 'faulty-receipt');
    if (state.mode === 'talk') return say(state, '“Customer support is on another floor.”');
    switch (prop) {
      case 'printer': return say(state, '“Thermal paper. Permanent evidence of temporary arithmetic.”');
      case 'workstation': return say(state, '“An iOS build, a simulator, and a suspiciously long coffee break.”');
      case 'beams': return say(state, '“The architecture has more branches than the code.”');
      case 'door': return say(state, '“A change of scene, through a very old arch.”');
      default: return { state, effects: [] };
    }
  },
  update: (state, action) => updateStoryRoom('lightspeed', state, action),
};
