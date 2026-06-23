import { sentences } from './sentences.js';

export const modes = {
  finite: { label: 'Забег', speed: 70, score: [1, -1, -1] },
  infinite: { label: 'Бесконечно', speed: 78, score: [10, -5, -10] }
};

export const difficulties = {
  easy: { label: 'Легко', speed: 0.72 },
  hard: { label: 'Сложно', speed: 1.18 }
};

let nextId = 1;

export function parseSentence(text) {
  return text.split(/(\[.*?\])/).flatMap((part, index) => {
    if (!part) return [];
    if (part.startsWith('[') && part.endsWith(']')) {
      return [{ id: `${index}-x`, text: part.slice(1, -1), extra: true, selected: false }];
    }

    return part.split(/(\s+)/).filter(Boolean).map((text, wordIndex) => ({
      id: `${index}-${wordIndex}`,
      text,
      extra: false,
      selected: false
    }));
  });
}

export function makeItem(text, y) {
  return {
    id: nextId++,
    y,
    height: 120,
    processed: false,
    words: parseSentence(text)
  };
}

export function pickFiniteSentences() {
  const count = Math.max(1, Math.floor(sentences.length * 0.1));
  return shuffle(sentences).slice(0, count);
}

export function makeSentenceBag() {
  return shuffle(sentences);
}

export function scoreItem(item, mode) {
  let delta = 0;
  const [right, wrong, missed] = modes[mode].score;

  item.words = item.words.map((word) => {
    if (word.extra && word.selected) {
      delta += right;
      return { ...word, selected: false, correct: true };
    }
    if (!word.extra && word.selected) {
      delta += wrong;
      return { ...word, wrong: true };
    }
    if (word.extra && !word.selected) {
      delta += missed;
      return { ...word, missed: true };
    }
    return word;
  });

  item.processed = true;
  return delta;
}

function shuffle(items) {
  return [...items].sort(() => 0.5 - Math.random());
}
