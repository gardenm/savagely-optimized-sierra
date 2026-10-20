import { clampPoint, type Progress, type Point, type ItemDefinition } from './model';
import { mcgill, mcgillSave } from './rooms/mcgill';
import { nortel, nortelSave } from './rooms/nortel';
import { smart } from './rooms/smart';

export const inventoryItems: readonly ItemDefinition[] = [...mcgill.items, ...nortel.items, ...smart.items];
export const adventureRooms = {
  mcgill: { ...mcgill, items: inventoryItems },
  nortel: { ...nortel, items: inventoryItems },
  smart: { ...smart, items: inventoryItems },
};
export type RoomId = keyof typeof adventureRooms;
export const isRoomId = (id: unknown): id is RoomId => typeof id === 'string' && Object.hasOwn(adventureRooms, id);

export type AdventureProgress = Readonly<{
  currentRoom: RoomId;
  inventory: readonly string[];
  positions: Readonly<Record<RoomId, Point>>;
  flags: Readonly<Record<string, boolean>>;
  completed: boolean;
}>;

export function freshAdventure(currentRoom: RoomId = 'mcgill'): AdventureProgress {
  return {
    currentRoom, inventory: [], completed: false,
    positions: { mcgill: { ...mcgill.spawn }, nortel: { ...nortel.spawn }, smart: { ...smart.spawn } },
    flags: { strapWorn: false, linkRestored: false },
  };
}

/** A typed room reducer sees the active position and shared inventory/milestones. */
export function roomProgress(adventure: AdventureProgress, room: RoomId): Progress {
  return { inventory: adventure.inventory, position: adventure.positions[room], flags: adventure.flags, completed: adventure.completed };
}

export function applyRoomProgress(adventure: AdventureProgress, room: RoomId, progress: Progress): AdventureProgress {
  return {
    ...adventure, inventory: progress.inventory, completed: progress.completed, flags: progress.flags ?? {},
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
    if (!object(value) || (value.version !== 1 && value.version !== 2) || !isRoomId(value.currentRoom)
      || !Array.isArray(value.inventory) || !value.inventory.every(item => typeof item === 'string' && inventoryItems.some(known => known.id === item))
      || !object(value.positions) || !object(value.flags) || typeof value.completed !== 'boolean') return null;
    const inventory = [...new Set(value.inventory)];
    if (value.version === 1 && (value.currentRoom === 'smart' || inventory.some(item => item !== 'ticket' && item !== 'strap'))) return null;
    const smartFlags = ['stylusDown', 'exampleOnBoard'] as const;
    if (value.version === 2 && Object.entries(value.flags).some(([key, flag]) => !['strapWorn', 'linkRestored', ...smartFlags].includes(key) || typeof flag !== 'boolean')) return null;
    const stylusDown = value.version === 2 && value.flags.stylusDown === true;
    const exampleOnBoard = value.version === 2 && value.flags.exampleOnBoard === true;
    if ((inventory.includes('stylus') && !stylusDown) || (stylusDown && inventory.includes('paper-plane'))
      || (exampleOnBoard && !inventory.includes('faulty-receipt'))
      || (inventory.includes('checkout-plan') && (!inventory.includes('stylus') || !exampleOnBoard))) return null;
    const strapWorn = inventory.includes('strap') && value.flags.strapWorn === true;
    return {
      currentRoom: value.currentRoom, inventory, completed: value.completed,
      positions: { mcgill: position(value.positions.mcgill, 'mcgill'), nortel: position(value.positions.nortel, 'nortel'), smart: position(value.positions.smart, 'smart') },
      flags: { strapWorn, linkRestored: strapWorn && value.flags.linkRestored === true, ...(stylusDown ? { stylusDown: true } : {}), ...(exampleOnBoard ? { exampleOnBoard: true } : {}) },
    };
  },
  encode(progress: AdventureProgress) { return { version: 2, ...progress }; },
};
