import { say, type GameState, type Transition } from '../model';
import { verifiesCandidate, type StoryRoomState } from './model';
import { agentEvidence, changed, collect, fact, mark } from './progress';

type State = GameState<StoryRoomState>;

export function inspectShopify(state: State, prop: string): Transition<StoryRoomState> {
  if (prop === 'pick' || prop === 'guitar') return say(state, '“A Birch Green Jazzmaster. A pick beside it.”');
  return say(state, state.progress.completed ? '“The independent test matches the plan. Reviewed.”'
    : agentEvidence(state.progress).candidate ? '“A candidate fix. The result still needs an independent test.”'
      : '“An agent workbench. A task needs an example and a plan.”');
}

export function interactShopify(state: State, prop: string): Transition<StoryRoomState> {
  if (state.mode === 'pickup' && prop === 'pick') return collect(state, 'guitar-pick');
  const offering = state.mode === 'use' || state.mode === 'give';
  if (prop === 'workbench' && offering && state.selectedItem) {
    if (state.selectedItem === 'checkout-plan') return fact(state.progress, 'agentHasPlan') ? say(state, '“The plan is already in the brief.”')
      : mark(state, { agentHasPlan: true }, '“A concrete approach, added to the brief.”');
    if (state.selectedItem === 'faulty-receipt') return fact(state.progress, 'agentHasExample') ? say(state, '“The example is already in the brief.”')
      : mark(state, { agentHasExample: true }, '“A reproducible mistake, added to the brief.”');
    if (state.selectedItem === 'test-receipt') {
      if (!fact(state.progress, 'agentHasPlan') || !fact(state.progress, 'agentHasExample') || !fact(state.progress, 'linkRestored')
        || !verifiesCandidate(agentEvidence(state.progress))) return say(state, '“This doesn’t verify the current candidate against the new sale.”');
      if (state.progress.completed) return say(state, '“Already reviewed. The numbers still add up.”');
      return changed(state, { completed: true, flags: { ...state.progress.flags, reviewComplete: true } }, '“Three at three. Nine. Tested independently, then reviewed.”');
    }
  }
  if (state.selectedItem) return say(state, '“That won’t help with this.”');
  if (state.mode === 'use' && prop === 'workbench') {
    if (!fact(state.progress, 'agentHasPlan') || !fact(state.progress, 'agentHasExample')) return say(state, '“The brief is missing context.”');
    if (agentEvidence(state.progress).candidate) return say(state, state.progress.completed ? '“Finished, and verified.”'
      : fact(state.progress, 'linkRestored') ? '“The candidate is ready for the test till.”' : '“Candidate prepared. Queued while the test network is offline.”');
    return changed(state, { agent: { candidate: { id: 1 }, receipt: null } }, fact(state.progress, 'linkRestored')
      ? '“Task delegated. A candidate is ready for the test till.”' : '“Task delegated. The candidate is queued while the network is offline.”');
  }
  return inspectShopify(state, prop);
}
