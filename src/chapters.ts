import { mountChapter, type ChapterServices, type ChapterSession, type PuzzleView } from './chapter';
import type { Dispatch, RoomDefinition } from './game/model';
import { adventureRooms } from './game/adventure';
import { renderAdventure } from './ui/adventure';
import { createNortelView, renderNortel } from './ui/nortel';
import { createRecommendzView, renderRecommendz } from './ui/recommendz';
import { createSmartView, renderSmart } from './ui/smart';

export interface PlayableChapter {
  readonly title: string;
  readonly name: string;
  render(): string;
  mount(root: HTMLElement, services: ChapterServices): ChapterSession;
}

function chapter<S, A>(name: string, room: RoomDefinition<S, A>, renderPuzzle: () => string,
  mountPuzzle: (root: HTMLElement, dispatch: Dispatch<A>) => PuzzleView<S>): PlayableChapter {
  return {
    name, title: room.title,
    render: () => renderAdventure(room) + renderPuzzle(),
    mount: (root, services) => mountChapter(root, room, mountPuzzle, services),
  };
}

export const playableChapters = {
  mcgill: chapter('McGill', adventureRooms.mcgill, renderRecommendz, createRecommendzView),
  nortel: chapter('Nortel', adventureRooms.nortel, renderNortel, createNortelView),
  smart: chapter('SMART', adventureRooms.smart, renderSmart, createSmartView),
};
export type ChapterId = keyof typeof playableChapters;
export const isChapterId = (id: string): id is ChapterId => Object.hasOwn(playableChapters, id);
