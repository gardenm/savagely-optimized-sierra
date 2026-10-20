import { say, type GameState, type Transition } from '../model';
import { calculateTotal, independentSale, type StoryRoomState } from './model';
import { agentEvidence, changed, collect, fact, mark, owns } from './progress';

type State = GameState<StoryRoomState>;

export function inspectLightspeed(state: State, prop: string): Transition<StoryRoomState> {
  if (prop === 'drawer') return say(state, fact(state.progress, 'drawerOpen') ? '“The drawer is open.”' : '“Jammed. There’s a narrow seam around the latch.”');
  if (prop === 'clip') return say(state, fact(state.progress, 'drawerOpen') ? '“A spare plastic retaining clip from the cable management.”' : '“The drawer is closed.”');
  return say(state, '“An iOS point of sale demo. Ready for a coffee order.”');
}

export function interactLightspeed(state: State, prop: string): Transition<StoryRoomState> {
  if (state.mode === 'use' && prop === 'drawer' && state.selectedItem === 'guitar-pick') {
    return fact(state.progress, 'drawerOpen') ? say(state, '“Already open.”')
      : mark(state, { drawerOpen: true }, '“The pick slips past the latch. Click.”');
  }
  if (state.mode === 'pickup' && prop === 'clip') return fact(state.progress, 'drawerOpen')
    ? collect(state, 'retaining-clip', 'clipTaken') : say(state, '“The drawer is closed.”');
  if (state.selectedItem) return say(state, '“That won’t help with this.”');
  if (state.mode === 'use' && prop === 'till') {
    const agent = agentEvidence(state.progress);
    if (agent.candidate && fact(state.progress, 'linkRestored')) {
      const receipt = { candidateId: agent.candidate.id, sale: { ...independentSale, totalCents: calculateTotal(independentSale) } };
      // Re-running the till produces the current candidate's result, replacing stale evidence.
      return changed(state, { inventory: [...new Set([...state.progress.inventory, 'test-receipt'])], agent: { ...agent, receipt } }, '“New sale. Three coffees. Total: $9.00.”');
    }
    if (!owns(state.progress, 'faulty-receipt')) return collect(state, 'faulty-receipt');
    return say(state, agent.candidate ? '“The candidate is queued. The test network is offline.”' : '“Two coffees. Total: $3.00. That can’t be right.”');
  }
  return inspectLightspeed(state, prop);
}
