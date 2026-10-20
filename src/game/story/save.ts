import type { Progress } from '../model';
import { isStoryItem, storyFlags, verifiesCandidate, type AgentEvidence, type Sale, type StoryProgress } from './model';
import { freshStoryProgress } from './progress';

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const positiveInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
function sale(value: unknown): value is Sale {
  return object(value) && positiveInteger(value.quantity) && positiveInteger(value.unitPriceCents)
    && typeof value.totalCents === 'number' && Number.isSafeInteger(value.totalCents) && value.totalCents >= 0;
}

function evidence(value: unknown): AgentEvidence | null {
  if (!object(value)) return null;
  if (value.candidate !== null && (!object(value.candidate) || !positiveInteger(value.candidate.id))) return null;
  if (value.receipt !== null && (!object(value.receipt) || !positiveInteger(value.receipt.candidateId) || !sale(value.receipt.sale))) return null;
  return {
    candidate: value.candidate === null ? null : { id: (value.candidate as { id: number }).id },
    receipt: value.receipt === null ? null : {
      candidateId: (value.receipt as { candidateId: number }).candidateId,
      sale: { ...(value.receipt as { sale: Sale }).sale },
    },
  };
}

/** Validate the future v2 puzzle slice without activating it in the deployed v1 save adapter. */
export function decodeStoryProgress(value: unknown): StoryProgress | null {
  if (!object(value) || value.version !== 2 || !Array.isArray(value.inventory)
    || !value.inventory.every(item => typeof item === 'string' && isStoryItem(item))
    || !object(value.flags) || Object.keys(value.flags).length !== storyFlags.length
    || !storyFlags.every(flag => typeof (value.flags as Record<string, unknown>)[flag] === 'boolean')
    || typeof value.completed !== 'boolean') return null;
  const agent = evidence(value.agent);
  if (!agent) return null;
  const inventory = [...new Set(value.inventory)] as StoryProgress['inventory'];
  const flags = Object.fromEntries(storyFlags.map(flag => [flag, (value.flags as Record<string, boolean>)[flag]])) as StoryProgress['flags'];
  const has = (item: string) => inventory.includes(item as typeof inventory[number]);
  const family = (taken: boolean, ...forms: boolean[]) => forms.filter(Boolean).length === (taken ? 1 : 0);

  // Reject impossible source/form combinations instead of silently deleting a critical item.
  if (!family(flags.powerLeadTaken, has('power-lead'), flags.computerPowered)
    || !family(flags.gumTaken, has('gum'), has('chewed-gum'), has('sticky-clip'), flags.clipMounted)
    || !family(flags.clipTaken, has('retaining-clip'), has('sticky-clip'), flags.clipMounted)
    || (flags.clipTaken && !flags.drawerOpen)
    || (flags.strapWorn && !has('strap')) || (flags.clipMounted && !flags.strapWorn)
    || (flags.linkRestored && !flags.clipMounted)
    || (has('recommendation') && has('paper-plane'))
    || ((has('recommendation') || has('paper-plane') || flags.stylusDown) && !flags.computerPowered)
    || (flags.stylusDown && (has('recommendation') || has('paper-plane')))
    || (has('stylus') && !flags.stylusDown)
    || (flags.exampleOnBoard && !has('faulty-receipt'))
    || (has('checkout-plan') && (!has('stylus') || !flags.exampleOnBoard))
    || (flags.agentHasPlan && !has('checkout-plan')) || (flags.agentHasExample && !has('faulty-receipt'))
    || (agent.candidate !== null && (!flags.agentHasPlan || !flags.agentHasExample))
    || ((agent.receipt !== null) !== has('test-receipt'))
    || (agent.receipt !== null && (agent.candidate === null || !flags.linkRestored))
    || (value.completed !== flags.reviewComplete)
    || (value.completed && !verifiesCandidate(agent))) return null;
  return { inventory, flags, agent, completed: value.completed };
}

export const encodeStoryProgress = ({ inventory, flags, agent, completed }: StoryProgress) => ({ version: 2, inventory, flags, agent, completed });

/** Cutover preserves earned prototype milestones; navigation/positions stay with the world owner. */
export function migratePrototypeProgress(progress: Pick<Progress, 'inventory' | 'flags'>): StoryProgress {
  const fresh = freshStoryProgress();
  const powered = progress.inventory.includes('ticket');
  const strap = progress.inventory.includes('strap');
  const worn = strap && progress.flags?.strapWorn === true;
  const linked = worn && progress.flags?.linkRestored === true;
  return {
    ...fresh, inventory: [...(powered ? ['recommendation' as const] : []), ...(strap ? ['strap' as const] : [])],
    flags: {
      ...fresh.flags, computerPowered: powered, powerLeadTaken: powered,
      strapWorn: worn, linkRestored: linked, clipMounted: linked, clipTaken: linked, gumTaken: linked, drawerOpen: linked,
    },
  };
}
