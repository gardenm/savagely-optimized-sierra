import { career, chapters, profile } from '../content/career';
import { escapeHtml } from './dom';
import { icon } from './icons';

export function renderPages(): string {
  return `
    <section data-view="chapters" class="reading-view" hidden aria-labelledby="map-heading">
      <a href="#adventure" class="back-link">← Back to the lab</a><div class="reading-heading"><h1 id="map-heading">Every job.<br />A different room.</h1><p>A career under one slightly improbable roof. McGill and Nortel are playable; the rest of the building is still taking shape.</p></div>
      <div class="chapter-list">${chapters.map((c, i) => `<article class="chapter-row ${c.playable ? 'is-playable' : ''}"><span class="chapter-number">${i === 0 ? icon('arrow') : String(i).padStart(2, '0')}</span><div><p class="chapter-place">${escapeHtml(c.place)}</p><h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.summary)}</p></div><div class="chapter-state">${c.playable ? `<a class="primary-button" href="${c.route}">${escapeHtml(c.linkLabel)} ${icon('arrow')}</a>` : `<span>${escapeHtml(c.note)}</span>`}</div></article>`).join('')}</div>
      <div class="side-quests"><h2>A few things come along for the ride.</h2><p>More than a decade mentoring high-school CS students. A love of art and music.</p></div>
    </section>
    <section data-view="cv" class="reading-view" hidden aria-labelledby="cv-heading">
      <a href="#adventure" class="back-link">← Back to the adventure</a><div class="reading-heading"><h1 id="cv-heading">${escapeHtml(profile.name)}</h1><p>${escapeHtml(profile.summary)}</p></div>
      <div class="bio-layout"><div class="bio-timeline">
        ${career.map(entry => `<article><h2>${escapeHtml(entry.place)}</h2>${entry.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('')}</article>`).join('')}
      </div><aside class="bio-aside"><h2>Outside the job description.</h2><p>${escapeHtml(profile.mentoring)}</p><p class="content-note">${escapeHtml(profile.draft)}</p><a class="text-button" href="${escapeHtml(profile.linkedIn)}">LinkedIn ${icon('arrow')}</a></aside></div>
    </section>
  `;
}
