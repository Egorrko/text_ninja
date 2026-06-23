<script>
  import SentenceRow from './lib/SentenceRow.svelte';
  import { difficulties, makeItem, makeSentenceBag, modes, pickFiniteSentences, scoreItem } from './lib/game';

  let screen = 'start';
  let mode = 'finite';
  let difficulty = 'easy';
  let score = 0;
  let items = [];
  let queue = [];
  let bag = [];
  let nextY = 0;
  let raf = 0;
  let lastTime = 0;
  let viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight;

  $: redLineY = Math.min(190, Math.max(120, viewportHeight * 0.28));
  $: redLineFinishY = redLineY + 3;
  $: left = mode === 'finite' ? items.filter((item) => !item.processed).length : null;

  function startGame(selectedMode = mode) {
    stopLoop();
    mode = selectedMode;
    score = 0;
    screen = 'playing';
    viewportHeight = window.innerHeight;
    queue = mode === 'finite' ? pickFiniteSentences() : [];
    bag = mode === 'infinite' ? makeSentenceBag() : [];
    items = [];
    nextY = viewportHeight + 48;

    const count = mode === 'finite' ? queue.length : 9;
    for (let i = 0; i < count; i += 1) addItem();

    lastTime = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function addItem() {
    const text = mode === 'finite' ? queue.shift() : nextInfiniteSentence();
    if (!text) return;
    items = [...items, makeItem(text, nextY)];
    nextY += 184;
  }

  function nextInfiniteSentence() {
    if (bag.length === 0) bag = makeSentenceBag();
    return bag.shift();
  }

  function toggleWord(itemId, wordId) {
    items = items.map((item) => item.id !== itemId ? item : {
      ...item,
      words: item.words.map((word) => word.id === wordId ? { ...word, selected: !word.selected, wrong: false } : word)
    });
  }

  function tick(now) {
    if (screen !== 'playing') return;

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const speed = modes[mode].speed * difficulties[difficulty].speed;
    let nextScore = score;
    let nextItems = items.map((item) => ({ ...item, y: item.y - speed * dt }));

    nextItems.forEach((item) => {
      if (!item.processed && item.y <= redLineFinishY) nextScore += scoreItem(item, mode);
    });

    if (mode === 'infinite') {
      nextItems = nextItems.filter((item) => item.y + item.height > -80);
      while (nextItems.length < 9) {
        const last = nextItems.at(-1);
        const y = last ? last.y + last.height + 64 : viewportHeight + 48;
        const item = makeItem(nextInfiniteSentence(), y);
        nextItems = [...nextItems, item];
      }
    }

    score = nextScore;
    items = nextItems;

    if (mode === 'finite' && items.every((item) => item.processed)) {
      raf = window.setTimeout(() => { screen = 'done'; }, 900);
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function restart() {
    startGame(mode);
  }

  function stopLoop() {
    cancelAnimationFrame(raf);
    clearTimeout(raf);
  }
</script>

<svelte:window bind:innerHeight={viewportHeight} />

{#if screen === 'start'}
  <main class="screen start">
    <h1>Редакторский дзен</h1>
    <p>Выбирайте лишние слова до красной линии.</p>
    <div class="difficulty">
      <span>Скорость</span>
      <div class="toggle" class:hard={difficulty === 'hard'} aria-label="Сложность">
        <button class:active={difficulty === 'easy'} on:click={() => { difficulty = 'easy'; }}>Легко</button>
        <button class:active={difficulty === 'hard'} on:click={() => { difficulty = 'hard'; }}>Сложно</button>
      </div>
    </div>
    <div class="actions">
      <button class:active={mode === 'finite'} on:click={() => startGame('finite')}>Забег</button>
      <button class:active={mode === 'infinite'} on:click={() => startGame('infinite')}>Бесконечно</button>
    </div>
  </main>
{:else if screen === 'done'}
  <main class="screen done">
    <h1>Дзен достигнут</h1>
    <p>Уровень дзена: {score}</p>
    <button on:click={restart}>Заново</button>
  </main>
{:else}
  <main class="game">
    <div class="line" style={`top: ${redLineY}px`}></div>
    <div class="hud">
      <div>Уровень дзена: {score}</div>
      <div>{modes[mode].label} · {difficulties[difficulty].label}{#if left !== null} · Осталось: {left}{/if}</div>
    </div>
    <button class="exit" on:click={() => { screen = 'start'; stopLoop(); }}>×</button>

    {#each items as item (item.id)}
      <SentenceRow
        {item}
        playing={screen === 'playing'}
        bind:height={item.height}
        onToggle={toggleWord}
      />
    {/each}
  </main>
{/if}
