<template>
  <!-- The header already names the site; the foot of the page names who wrote
       it and where else to follow. Text links, since there is room for words
       here and none of these needs a glyph to be found. -->
  <footer>
    <div class="bleed">
      <p class="author">
        <span class="meta">書いた人</span>
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
      <p class="meta copyright">&copy; {{ new Date().getFullYear() }} naitokosuke</p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: 6rem;
  /* The column edge lives on the div, so the gutter goes on the footer */
  padding-inline: var(--gutter);

  div {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    gap: 0.25rem 1.5rem;
    max-width: var(--content-width);
    margin: 0 auto;
    padding-block: 2rem 3rem;
    border-top: 1px solid var(--color-rule);

    /* The bleed sits on this rule, which is the div's top edge */
    &::after {
      top: calc((var(--bleed-height) - 1px) / -2 - 1px);
      bottom: auto;
    }
  }

  .author {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    font-size: 1rem;

    a {
      color: var(--color-text);
    }
  }

  ul {
    display: flex;
    gap: 1.5rem;
    padding: 0;
    list-style: none;
    font-size: 0.9375rem;

    a {
      display: inline-block;
      padding-block: 0.5rem;
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-accent-hover);
      }
    }
  }

  .copyright {
    grid-column: 1 / -1;
  }

  @media (width <= 768px) {
    div {
      grid-template-columns: 1fr;
    }
  }
}
</style>
