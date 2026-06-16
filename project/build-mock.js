/**
 * Dev-only mock build — uses hardcoded app data so you can preview
 * without a Notion database. Run: node build-mock.js
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MOCK_APPS = [
  {
    index: 1,
    name: 'Lesson Co-Planner',
    category: 'For Teachers',
    tagline: 'Turn a topic and a time slot into a ready-to-teach lesson — hooks, activities, and exit tickets included.',
    slug: 'lesson-co-planner',
    whoItIsFor: 'K–12 classroom teachers in any subject — especially anyone short on planning time who still wants a lesson that holds together.',
    audienceTags: ['New teachers', 'Substitutes', 'Any subject'],
    capabilities: [
      'Draft a full lesson from a standard or topic',
      'Generate hooks, activities, and exit tickets',
      'Differentiate for different reading levels',
      'Build a materials list in seconds',
    ],
    steps: [
      'Tell it your grade, subject, and topic.',
      'Pick how long the class period is.',
      'Ask for tweaks until it fits your room.',
    ],
    goDeeperText: 'Remix it with your district\'s standards and pacing guide so every plan lands on-curriculum from the first draft.',
    remixUrl: '#',
    embedUrl: null,
  },
  {
    index: 2,
    name: 'Socratic Study Buddy',
    category: 'For Students',
    tagline: 'A tutor that asks the right questions instead of handing over the answer.',
    slug: 'socratic-study-buddy',
    whoItIsFor: 'Students working on their own — and the teachers who want guided practice that builds understanding instead of giving the answer away.',
    audienceTags: ['Independent study', 'Homework help', 'Test prep'],
    capabilities: [
      'Work through a problem step by step',
      'Get hints, not finished solutions',
      'Check understanding with follow-ups',
      'Practice explaining your thinking',
    ],
    steps: [
      'Paste a problem or name a topic.',
      'Try an answer, even a rough one.',
      'Let the buddy nudge you to the next step.',
    ],
    goDeeperText: 'Remix it with your unit\'s vocabulary and texts so it coaches students in your classroom\'s language.',
    remixUrl: '#',
    embedUrl: null,
  },
  {
    index: 3,
    name: 'Family Message Studio',
    category: 'Teachers & Office',
    tagline: 'Quick notes in; warm, clear messages home out — in any family\'s language.',
    slug: 'family-message-studio',
    whoItIsFor: 'Teachers, counselors, and office staff who write home often and want every message to sound human, clear, and kind.',
    audienceTags: ['Home communication', 'Translation', 'Front office'],
    capabilities: [
      'Turn bullet points into a friendly note',
      'Match a warm, professional school voice',
      'Translate into families\' home languages',
      'Draft reminders and tough conversations',
    ],
    steps: [
      'Jot the gist in a few words.',
      'Choose a tone and who it\'s going to.',
      'Review, translate, and send.',
    ],
    goDeeperText: 'Remix it with your school\'s voice, signature, and the languages your families actually speak.',
    remixUrl: '#',
    embedUrl: null,
  },
  {
    index: 4,
    name: 'Rubric Builder',
    category: 'Teachers & Coaches',
    tagline: 'Describe an assignment; get a clear rubric and feedback you can stand behind.',
    slug: 'rubric-builder',
    whoItIsFor: 'Teachers and instructional coaches building assessments and norming feedback so a grade means the same thing across a team.',
    audienceTags: ['Assessment', 'Coaching', 'Grade norming'],
    capabilities: [
      'Generate a rubric from any assignment',
      'Write criteria in student-friendly words',
      'Draft feedback aligned to each level',
      'Norm grading across a team',
    ],
    steps: [
      'Describe the assignment and what you value.',
      'Choose how many levels you want.',
      'Edit the criteria to match your bar.',
    ],
    goDeeperText: 'Remix it to lock in your grading scale and the exact language your team already uses.',
    remixUrl: '#',
    embedUrl: null,
  },
];

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pad(n) { return String(n).padStart(2, '0'); }

function renderMini(app) {
  return `<button class="mini" type="button" data-app="${app.index}"
            aria-controls="app-${app.index}" aria-expanded="false">
    <span class="mini__top">
      <span class="mini__idx">${pad(app.index)}</span>
      <span class="mini__cat">${esc(app.category)}</span>
    </span>
    <span class="mini__name">${esc(app.name)}</span>
    <span class="mini__who">${esc(app.whoItIsFor)}</span>
    <span class="mini__cue">
      <span>View app</span>
      <svg class="ic" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
    </span>
  </button>`;
}

function renderCard(app) {
  const capItems  = app.capabilities.map(c => `<li><svg class="ic" aria-hidden="true"><use href="#i-check"></use></svg>${esc(c)}</li>`).join('');
  const stepItems = app.steps.map(s => `<li>${esc(s)}</li>`).join('');
  const tagChips  = app.audienceTags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
  const embedAttr = app.embedUrl ? ` data-embed-src="${esc(app.embedUrl)}"` : '';

  return `<article class="app-card" id="app-${app.index}" data-embed-key="${esc(app.slug)}"${embedAttr}>
    <div class="app-card__head">
      <span class="app-card__idx">${pad(app.index)}</span>
      <div class="app-card__titles">
        <span class="app-card__cat">${esc(app.category)}</span>
        <h2 class="app-card__name">${esc(app.name)}</h2>
        <p class="app-card__tag">${esc(app.tagline)}</p>
      </div>
      <div class="app-card__actions">
        <a class="btn btn--remix" href="${esc(app.remixUrl)}" target="_blank" rel="noopener">
          <svg class="ic" aria-hidden="true"><use href="#i-copy"></use></svg>Remix this app
        </a>
      </div>
    </div>
    <div class="app-card__body">
      <div class="embed">
        <div class="embed__frame">
          <div class="embed__bar">
            <span class="embed__dot"></span>
            <span class="embed__url" data-embed-url>playlab.ai / ${esc(app.slug)}</span>
            <span class="embed__live">● Live</span>
          </div>
          <div class="embed__stage">
            <div class="embed__ph">
              <img class="embed__ph-mark" src="assets/logo/Playlab_Logo-Loop_Black.svg" alt="">
              <h4>Embed the live app</h4>
              <p>Paste the app's Playlab share link to embed it right here in the card.</p>
              <form class="embed__form" data-embed-form>
                <input type="url" placeholder="https://playlab.ai/projects/…" aria-label="Playlab share link">
                <button type="submit">Embed</button>
              </form>
              <span class="embed__hint">or set Embed URL in Notion</span>
            </div>
          </div>
        </div>
      </div>
      <div class="fields">
        <div class="field">
          <p class="field__label"><svg class="ic" aria-hidden="true"><use href="#i-users"></use></svg>Who it's for</p>
          <p>${esc(app.whoItIsFor)}</p>
          ${tagChips ? `<div class="tags" style="margin-top: var(--space-md);">${tagChips}</div>` : ''}
        </div>
        ${capItems ? `<div class="field">
          <p class="field__label"><svg class="ic ic--sparkle" aria-hidden="true"><use href="#i-sparkle"></use></svg>What you can do with it</p>
          <ul class="do">${capItems}</ul>
        </div>` : ''}
        ${stepItems ? `<div class="field">
          <p class="field__label"><svg class="ic" aria-hidden="true"><use href="#i-flag"></use></svg>How to get started</p>
          <ol class="steps">${stepItems}</ol>
        </div>` : ''}
        ${app.goDeeperText ? `<div class="field field--deeper">
          <div class="deeper"><div class="deeper__body">
            <p class="field__label"><svg class="ic" aria-hidden="true"><use href="#i-compass"></use></svg>Want to go deeper?</p>
            <p>${esc(app.goDeeperText)}</p>
            <a class="link-arrow" href="${esc(app.remixUrl)}" target="_blank" rel="noopener">
              Make it yours<svg class="ic" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
            </a>
          </div></div>
        </div>` : ''}
      </div>
    </div>
  </article>`;
}

let html = readFileSync(resolve(__dirname, 'template.html'), 'utf-8');
html = html
  .replace('{{PICKER}}', MOCK_APPS.map(renderMini).join('\n'))
  .replace('{{CARDS}}',  MOCK_APPS.map(renderCard).join('\n'));

const out = resolve(__dirname, 'public');
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'index.html'), html, 'utf-8');
for (const dir of ['assets', 'fonts']) {
  cpSync(resolve(__dirname, dir), resolve(out, dir), { recursive: true });
}
cpSync(resolve(__dirname, 'colors_and_type.css'), resolve(out, 'colors_and_type.css'));

console.log('Mock build → public/index.html');
