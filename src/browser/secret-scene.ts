/** No hash route, saved room, chapter entry or in-world link can select the Easter egg. */
export function isBackyardRequest(search: string): boolean {
  return new URLSearchParams(search).get('scene') === 'hotdogs';
}
