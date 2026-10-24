import { say, type RoomDefinition } from '../model';
import { useStoryItem } from '../story/inventory';
import { initialStoryRoom, type StoryAction, type StoryRoomState } from '../story/model';
import { interactStory, updateStoryRoom } from '../story/rules';

/** The owner's home office, with the planned furniture already moved in. */
export const shopify: RoomDefinition<StoryRoomState, StoryAction> = {
  id: 'shopify', title: 'Shopify', label: 'Shopify home office', gameLabel: 'Playable Shopify room',
  art: {
    src: '/art/shopify-office-painted.png', width: 1536, height: 1024,
    alt: 'A crooked cartoon home office with a white standing desk and green Shopify shopping-bag statue, bamboo and bonsai hexagon wallpaper, three portraits of family and a black-and-white sheepadoodle, a walnut cabinet and shelves, a Birch Green Jazzmaster on a stand, and a vintage Sears Silvertone stereo console.',
  },
  spawn: { x: 52, y: 89 }, bounds: { left: 37, right: 90, top: 74, bottom: 96 },
  props: [
    { id: 'workbench', name: 'computer', label: 'Agent workbench', area: { left: 10, top: 34, width: 29, height: 23 }, destination: { x: 40, y: 80 } },
    { id: 'wife', name: 'portrait of my wife', label: 'Portrait of my wife', area: { left: 15, top: 13, width: 8, height: 16 }, destination: { x: 40, y: 80 } },
    { id: 'son', name: 'portrait of my son', label: 'Portrait of my son', area: { left: 24, top: 10, width: 8, height: 19 }, destination: { x: 40, y: 80 } },
    { id: 'dog', name: 'sheepadoodle portrait', label: 'Sheepadoodle portrait', area: { left: 33, top: 14, width: 8, height: 16 }, destination: { x: 40, y: 80 } },
    { id: 'cabinet', name: 'cabinet', label: 'Cabinet', area: { left: 44, top: 10, width: 19, height: 59 }, destination: { x: 53, y: 77 } },
    { id: 'turntable', name: 'Silvertone console', label: 'Sears Silvertone turntable console', area: { left: 71, top: 44, width: 19, height: 25 }, destination: { x: 77, y: 79 } },
    { id: 'guitar', name: 'Jazzmaster', label: 'Birch Green Jazzmaster', area: { left: 63, top: 36, width: 7, height: 34 }, destination: { x: 64, y: 78 } },
    { id: 'pick', name: 'guitar pick', label: 'Guitar pick beside the Jazzmaster', area: { left: 63, top: 70, width: 7, height: 7 }, destination: { x: 65, y: 81 } },
    { id: 'door', name: 'doorway', label: 'Home office doorway', area: { left: 88, top: 14, width: 11, height: 55 }, destination: { x: 89, y: 78 } },
  ],
  items: [{ id: 'test-receipt', name: 'test receipt', label: 'Test receipt', icon: 'receipt' }],
  initialState: initialStoryRoom,
  useInventoryItem: useStoryItem,
  interact(state, prop) {
    if (prop === 'workbench' || prop === 'pick') return interactStory('shopify', state, prop);
    if (prop === 'door' && (state.mode === 'open' || state.mode === 'use') && !state.selectedItem) return interactStory('shopify', state, prop);
    if (state.selectedItem && (state.mode === 'use' || state.mode === 'give')) return say(state, '“That won’t help with this.”');
    if (state.mode === 'pickup') return say(state, '“That’s staying in the office.”');
    switch (prop) {
      case 'guitar': return say(state, '“My Birch Green Jazzmaster. Some problems need a different kind of feedback.”');
      case 'cabinet': return say(state, '“The cabinet. Finally, room for the things that aren’t cables.”');
      case 'turntable': return say(state, '“A 1970s Sears Silvertone. Still a very good argument for physical media.”');
      case 'wife': return say(state, '“My wife. A good reason not to spend the whole evening at this desk.”');
      case 'son': return say(state, '“My son. Proud dad, permanently.”');
      case 'dog': return say(state, '“Our black-and-white sheepadoodle. The office’s unofficial supervisor.”');
      case 'door': return say(state, '“There’s a whole career on the other side of that door.”');
      default: return { state, effects: [] };
    }
  },
  update: (state, action) => updateStoryRoom('shopify', state, action),
};
