<script>
  export let item;
  export let playing = false;
  export let height = 120;
  export let onToggle = () => {};
</script>

<article
  class="sentence"
  class:processed={item.processed}
  style={`transform: translateY(${item.y}px)`}
  bind:clientHeight={height}
>
  {#each item.words as word}
    {#if /^\s+$/.test(word.text)}
      {word.text}
    {:else}
      <button
        class:selected={word.selected}
        class:correct={word.correct}
        class:missed={word.missed}
        class:wrong={word.wrong}
        disabled={!playing || word.correct || word.missed}
        on:click={() => onToggle(item.id, word.id)}
      >
        {word.text}
      </button>
    {/if}
  {/each}
</article>
