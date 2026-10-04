<template>
  <!-- One quiet line at the foot of the column: who wrote it and where else to
       follow. Space above sets it apart; there is no rule. -->
  <footer>
    <div>
      <p class="meta">
        &copy; {{ new Date().getFullYear() }}
        <a href="https://x.com/naitokosuke" target="_blank" rel="noopener">ナイトウコウスケ</a>
      </p>
      <ul>
        <li><a href="/feed.xml">RSS</a></li>
        <li>
          <a href="https://github.com/naitokosuke/blog" target="_blank" rel="noopener">
            ソースコード
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: 8rem;
  /* The column edge lives on the div, so the gutter goes on the footer */
  padding-inline: var(--gutter);

  div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 0 1.5rem;
    max-width: var(--content-width);
    margin: 0 auto;
    padding-bottom: 2.5rem;
  }

  ul {
    display: flex;
    gap: 1.5rem;
    padding: 0;
    list-style: none;
  }

  a {
    display: inline-block;
    min-height: 44px;
    padding-block: 0.75rem;
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-accent-hover);
    }
  }

  ul a {
    min-width: 44px;
    font-size: var(--text-meta);
    letter-spacing: 0.12em;
  }
}
</style>
