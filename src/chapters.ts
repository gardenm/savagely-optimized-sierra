import type { SaveCodec } from './browser/saves';
import { mountChapter, type ChapterServices, type ChapterSession, type PuzzleView } from './chapter';
import type { Dispatch, RoomDefinition } from './game/model';
import { mcgill, mcgillSave } from './game/rooms/mcgill';
import { nortel, nortelSave } from './game/rooms/nortel';
import { renderAdventure } from './ui/adventure';
import { createNortelView, renderNortel } from './ui/nortel';
import { createRecommendzView, renderRecommendz } from './ui/recommendz';

export interface PlayableChapter {
  readonly title: string;
  readonly name: string;
  render(): string;
  mount(root: HTMLElement, services: ChapterServices): ChapterSession;
}

function chapter<S, A>(name: string, room: RoomDefinition<S, A>, codec: SaveCodec, renderPuzzle: () => string,
  mountPuzzle: (root: HTMLElement, dispatch: Dispatch<A>) => PuzzleView<S>): PlayableChapter {
  return {
    name, title: room.title,
    render: () => renderAdventure(room) + renderPuzzle(),
    mount: (root, services) => mountChapter(root, room, codec, mountPuzzle, services),
  };
}

export const playableChapters = {
  mcgill: chapter('McGill', mcgill, mcgillSave, renderRecommendz, createRecommendzView),
  nortel: chapter('Nortel', nortel, nortelSave, renderNortel, createNortelView),
};
export type ChapterId = keyof typeof playableChapters;
export const isChapterId = (id: string): id is ChapterId => Object.hasOwn(playableChapters, id);
