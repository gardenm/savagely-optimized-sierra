import { say, type GameState, type Transition } from '../model';
import { faultySale, isStoryItem, itemNames, type Sale } from './model';
import { agentEvidence, fact, owns, replace, wearStrap } from './progress';

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const describeSale = (sale: Sale) => `${sale.quantity} coffees × ${money(sale.unitPriceCents)}. Total: ${money(sale.totalCents)}.`;

export function inspectStoryItem<S>(state: GameState<S>, item: string): Transition<S> {
  if (!owns(state.progress, item) || !isStoryItem(item)) return say(state, '“I don’t have that.”');
  if (item === 'faulty-receipt') return say(state, `“${describeSale(faultySale)} That doesn’t add up.”`);
  if (item === 'test-receipt') {
    const receipt = agentEvidence(state.progress).receipt;
    return say(state, receipt ? `“Candidate ${receipt.candidateId}. ${describeSale(receipt.sale)}”` : '“An unreadable receipt.”');
  }
  const descriptions: Partial<Record<keyof typeof itemNames, string>> = {
    'checkout-plan': '“Quantity times unit price. A small sketch with a useful point.”',
    'power-lead': '“A spare computer power lead. The racks have their own.”',
    'sticky-clip': '“The gum is on the back, clear of the connector.”',
    recommendation: '“Recommendz has committed an opinion to paper.”',
    'paper-plane': '“A research output with improved aerodynamics.”',
    gum: '“Still in its wrapper.”', 'chewed-gum': '“Not much flavour. Plenty of adhesion.”',
  };
  return say(state, descriptions[item] ?? `“${itemNames[item]}.”`);
}

export function useStoryItem<S>(state: GameState<S>, item: string, target?: string): Transition<S> | undefined {
  if (!owns(state.progress, item) || (target !== undefined && !owns(state.progress, target))) return say(state, '“I don’t have that.”');
  if (target !== undefined) {
    if ((item === 'chewed-gum' && target === 'retaining-clip') || (item === 'retaining-clip' && target === 'chewed-gum')) {
      return replace(state, ['chewed-gum', 'retaining-clip'], ['sticky-clip'], '“A clip with a very small mounting budget.”');
    }
    return say(state, '“Those don’t go together.”');
  }
  if (item === 'gum') return replace(state, ['gum'], ['chewed-gum'], '“Mint condition. Briefly.”');
  if (item === 'recommendation' && !fact(state.progress, 'stylusDown')) {
    return replace(state, ['recommendation'], ['paper-plane'], '“Peer reviewed. Folded twice.”');
  }
  if (item === 'strap') return wearStrap(state);
  // Non-transforming tools remain selectable for use with a scene prop.
  return undefined;
}
