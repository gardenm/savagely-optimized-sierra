import { clampPoint, type Progress, type Point, type ItemDefinition } from './model';
import { mcgill, mcgillSave } from './rooms/mcgill';
import { nortel, nortelSave } from './rooms/nortel';
import { smart } from './rooms/smart';
import { lightspeed } from './rooms/lightspeed';
import { shopify } from './rooms/shopify';
import { verifiesCandidate, type AgentEvidence } from './story/model';
import { decodeAgentEvidence } from './story/save';

export const inventoryItems: readonly ItemDefinition[] = [...mcgill.items, ...nortel.items, ...smart.items, ...lightspeed.items, ...shopify.items];
export const adventureRooms = {
  mcgill: { ...mcgill, items: inventoryItems },
  nortel: { ...nortel, items: inventoryItems },
  smart: { ...smart, items: inventoryItems },
  lightspeed: { ...lightspeed, items: inventoryItems },
  shopify: { ...shopify, items: inventoryItems },
};
export type RoomId = keyof typeof adventureRooms;
export const isRoomId = (id: unknown): id is RoomId => typeof id === 'string' && Object.hasOwn(adventureRooms, id);

export type AdventureProgress = Readonly<{
  currentRoom: RoomId;
  inventory: readonly string[];
  positions: Readonly<Record<RoomId, Point>>;
  flags: Readonly<Record<string, boolean>>;
  completed: boolean;
  agent: AgentEvidence;
}>;

export function freshAdventure(currentRoom: RoomId = 'mcgill'): AdventureProgress {
  return {
    currentRoom, inventory: [], completed: false, agent: { candidate: null, receipt: null },
    positions: { mcgill: { ...mcgill.spawn }, nortel: { ...nortel.spawn }, smart: { ...smart.spawn }, lightspeed: { ...lightspeed.spawn }, shopify: { ...shopify.spawn } },
    flags: { strapWorn: false, linkRestored: false },
  };
}

/** A typed room reducer sees the active position and shared inventory/milestones. */
export function roomProgress(adventure: AdventureProgress, room: RoomId): Progress {
  return { inventory: adventure.inventory, position: adventure.positions[room], flags: adventure.flags, completed: adventure.completed, agent: adventure.agent };
}

export function applyRoomProgress(adventure: AdventureProgress, room: RoomId, progress: Progress): AdventureProgress {
  return {
    ...adventure, inventory: progress.inventory, completed: progress.completed, flags: progress.flags ?? {}, agent: progress.agent ?? adventure.agent,
    positions: { ...adventure.positions, [room]: progress.position },
  };
}

export function enterRoom(adventure: AdventureProgress, room: RoomId): AdventureProgress {
  return adventure.currentRoom === room ? adventure : { ...adventure, currentRoom: room };
}

/** Old completion belongs to its chapter, not the new whole adventure. */
export function importLegacy(mcgillValue: unknown, nortelValue: unknown): AdventureProgress {
  const lab = mcgillSave.decode(mcgillValue);
  const racks = nortelSave.decode(nortelValue);
  return {
    ...freshAdventure(), inventory: [...new Set([...lab.inventory, ...racks.inventory])],
    positions: { ...freshAdventure().positions, mcgill: lab.position, nortel: racks.position },
    flags: { strapWorn: racks.flags?.strapWorn === true, linkRestored: racks.flags?.linkRestored === true },
  };
}

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
function position(value: unknown, room: RoomId): Point {
  const { bounds, spawn } = adventureRooms[room];
  return clampPoint({ x: object(value) && typeof value.x === 'number' ? value.x : NaN, y: object(value) && typeof value.y === 'number' ? value.y : NaN }, bounds, spawn);
}

export const adventureSave = {
  // Keep the deployed key; a newer payload protects progress from an older cached client.
  key: 'savagely-optimized:adventure:v1',
  decode(value: unknown): AdventureProgress | null {
    if (!object(value) || ![1, 2, 3, 4].includes(value.version as number) || !isRoomId(value.currentRoom)
      || !Array.isArray(value.inventory) || !value.inventory.every(item => typeof item === 'string' && inventoryItems.some(known => known.id === item))
      || !object(value.positions) || !object(value.flags) || typeof value.completed !== 'boolean') return null;
    const inventory = [...new Set(value.inventory)];
    if (value.version === 1 && (value.currentRoom === 'smart' || inventory.some(item => item !== 'ticket' && item !== 'strap'))) return null;
    if (value.version !== 3 && value.version !== 4 && (value.currentRoom === 'lightspeed' || inventory.some(item => item === 'guitar-pick' || item === 'retaining-clip'))) return null;
    if (value.version !== 4 && (value.currentRoom === 'shopify' || inventory.includes('test-receipt'))) return null;
    const smartFlags = ['stylusDown', 'exampleOnBoard'] as const;
    const lightspeedFlags = value.version === 3 || value.version === 4 ? ['drawerOpen', 'clipTaken'] : [];
    const shopifyFlags = value.version === 4 ? ['agentHasPlan', 'agentHasExample', 'reviewComplete'] : [];
    if (value.version !== 1 && Object.entries(value.flags).some(([key, flag]) => !['strapWorn', 'linkRestored', ...smartFlags, ...lightspeedFlags, ...shopifyFlags].includes(key) || typeof flag !== 'boolean')) return null;
    const stylusDown = value.version !== 1 && value.flags.stylusDown === true;
    const exampleOnBoard = value.version !== 1 && value.flags.exampleOnBoard === true;
    const drawerOpen = (value.version === 3 || value.version === 4) && value.flags.drawerOpen === true;
    const clipTaken = (value.version === 3 || value.version === 4) && value.flags.clipTaken === true;
    if ((inventory.includes('stylus') && !stylusDown) || (stylusDown && inventory.includes('paper-plane'))
      || (exampleOnBoard && !inventory.includes('faulty-receipt'))
      || (inventory.includes('checkout-plan') && (!inventory.includes('stylus') || !exampleOnBoard))) return null;
    if ((clipTaken && (!drawerOpen || !inventory.includes('retaining-clip'))) || (inventory.includes('retaining-clip') && !clipTaken)) return null;
    const strapWorn = inventory.includes('strap') && value.flags.strapWorn === true;
    const linkRestored = strapWorn && value.flags.linkRestored === true;
    const agent = value.version === 4 ? decodeAgentEvidence(value.agent) : { candidate: null, receipt: null };
    if (!agent) return null;
    const agentHasPlan = value.version === 4 && value.flags.agentHasPlan === true;
    const agentHasExample = value.version === 4 && value.flags.agentHasExample === true;
    const reviewComplete = value.version === 4 && value.flags.reviewComplete === true;
    if ((agentHasPlan && !inventory.includes('checkout-plan')) || (agentHasExample && !inventory.includes('faulty-receipt'))
      || (agent.candidate !== null && (!agentHasPlan || !agentHasExample))
      || ((agent.receipt !== null) !== inventory.includes('test-receipt'))
      || (agent.receipt !== null && (agent.candidate === null || !linkRestored))
      || (reviewComplete && (!value.completed || !verifiesCandidate(agent)))
      || (agent.candidate !== null && value.completed && !reviewComplete)) return null;
    return {
      currentRoom: value.currentRoom, inventory, completed: value.completed, agent,
      positions: { mcgill: position(value.positions.mcgill, 'mcgill'), nortel: position(value.positions.nortel, 'nortel'), smart: position(value.positions.smart, 'smart'), lightspeed: position(value.positions.lightspeed, 'lightspeed'), shopify: position(value.positions.shopify, 'shopify') },
      flags: { strapWorn, linkRestored, ...(stylusDown ? { stylusDown: true } : {}), ...(exampleOnBoard ? { exampleOnBoard: true } : {}), ...(drawerOpen ? { drawerOpen: true } : {}), ...(clipTaken ? { clipTaken: true } : {}), ...Object.fromEntries(shopifyFlags.filter(flag => Object.hasOwn(value.flags as object, flag)).map(flag => [flag, (value.flags as Record<string, boolean>)[flag]])) },
    };
  },
  encode(progress: AdventureProgress) { return { version: 4, ...progress }; },
};
