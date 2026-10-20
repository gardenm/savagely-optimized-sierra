import { say, type RoomDefinition } from '../model';
import { useStoryItem } from '../story/inventory';
import { initialStoryRoom, type StoryAction, type StoryRoomState } from '../story/model';
import { interactStory, updateStoryRoom } from '../story/rules';

/** Real scene geometry around the already-tested cross-room SMART rules. */
export const smart: RoomDefinition<StoryRoomState, StoryAction> = {
  id: 'smart', title: 'SMART Technologies', label: 'SMART office', gameLabel: 'Playable SMART room',
  art: {
    src: '/art/smart-office-ottawa.webp', width: 1536, height: 1024,
    alt: 'A cartoon Ottawa cubicle office with beige fabric partitions, an iMac, a PC workstation, a SMART Board, and Parliament’s Peace Tower visible through the window.',
  },
  spawn: { x: 57, y: 88 }, bounds: { left: 43, right: 86, top: 71, bottom: 96 },
  props: [
    { id: 'imac', name: 'iMac', label: 'iMac', area: { left: 4, top: 34, width: 20, height: 25 }, destination: { x: 44, y: 86 } },
    { id: 'pc', name: 'PC workstation', label: 'PC workstation', area: { left: 33, top: 35, width: 15, height: 29 }, destination: { x: 48, y: 78 } },
    { id: 'cubicles', name: 'cubicles', label: 'Cubicles', area: { left: 17, top: 22, width: 16, height: 14 }, destination: { x: 44, y: 80 } },
    { id: 'whiteboard', name: 'SMART Board', label: 'SMART Board', area: { left: 58, top: 27, width: 25, height: 16 }, destination: { x: 53, y: 84 } },
    { id: 'ledge', name: 'high ledge', label: 'High ledge', area: { left: 57, top: 8, width: 10, height: 12 }, destination: { x: 56, y: 83 } },
    { id: 'stylus', name: 'stylus', label: 'Stylus on the ledge', area: { left: 67, top: 8, width: 12, height: 12 }, destination: { x: 72, y: 88 } },
    { id: 'printer', name: 'printer', label: 'Printer', area: { left: 74, top: 45, width: 9, height: 6 }, destination: { x: 74, y: 76 } },
    { id: 'door', name: 'door', label: 'Door', area: { left: 87, top: 10, width: 13, height: 57 }, destination: { x: 84, y: 76 } },
  ],
  items: [
    { id: 'paper-plane', name: 'paper plane', label: 'Paper plane', icon: 'plane' },
    { id: 'stylus', name: 'stylus', label: 'Whiteboard stylus', icon: 'stylus' },
    { id: 'faulty-receipt', name: 'faulty receipt', label: 'Faulty receipt', icon: 'receipt' },
    { id: 'checkout-plan', name: 'checkout sketch', label: 'Checkout sketch', icon: 'sketch' },
  ],
  initialState: initialStoryRoom,
  useInventoryItem: useStoryItem,
  interact(state, prop) {
    if (['whiteboard', 'ledge', 'stylus', 'door'].includes(prop)) return interactStory('smart', state, prop);
    if (state.selectedItem && (state.mode === 'use' || state.mode === 'give')) return say(state, '“That won’t help with this.”');
    if (state.mode === 'talk') return say(state, '“The partition is doing its best to provide privacy.”');
    switch (prop) {
      case 'imac': return say(state, '“SMART Notebook for Mac. A whole whiteboard on an iMac.”');
      case 'pc': return say(state, '“The PC side of the cubicle. Same board, different windows.”');
      case 'cubicles': return say(state, '“Open-plan thinking. Fabric-walled execution.”');
      case 'printer': return say(state, '“A printer. For when the whiteboard needs to leave the room.”');
      default: return { state, effects: [] };
    }
  },
  update: (state, action) => updateStoryRoom('smart', state, action),
};
