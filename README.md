# jonathanesperanza.com

Personal site and writing, built with [Zola](https://www.getzola.org/). Every push to `main` builds and deploys to GitHub Pages. Pull requests get a build check.

## Writing a post

```sh
bin/new-post "How memory consolidation works"   # creates a draft
bin/preview                                     # local server with drafts, reloads on save
bin/publish how-memory-consolidation-works      # un-drafts, dates it today, commits, pushes
```

- **Drafts never deploy.** A post with `draft = true` only shows up in `bin/preview`, marked as a draft.
- **Each post is a folder:** `content/posts/<slug>/index.md`. Put images next to it and reference them by filename: `![Diagram of the pipeline](pipeline.png)`.
- **Fill in `description`.** One sentence. It appears under the title in lists, in link previews, and in the feed.
- `bin/publish <slug> --no-push` commits without pushing. `bin/publish` with no arguments lists your drafts.

Front matter:

```toml
+++
title = "How memory consolidation works"
date = 2026-10-17
description = "What happens to a user's memories overnight, and why it runs as a batch job."
draft = true
# updated = 2026-11-02   # optional, shown as "updated" on the post
+++
```

Markdown supports footnotes (`[^1]`), tables, fenced code with syntax highlighting, and smart quotes.

## Layout

| Path | What it is |
|---|---|
| `content/_index.md` | Homepage: intro paragraphs, plus `role`, `projects`, and `open_source` under `[extra]` |
| `content/posts/` | Writing. Feed at `/posts/atom.xml` |
| `templates/` | Tera templates. `base.html` is the shell |
| `static/global.css` | All styles. Color tokens at the top; dark mode follows the system |
| `templates/shortcodes/term.html` | Dotted phrases in the homepage intro. Each `{% term(id, label, detail) %}phrase{% end %}` unfolds its detail on click (`static/js/terms.js`) |
| `static/files/cv.pdf` | Resume linked from the nav |

## Requirements

Zola **0.21**, the version CI uses. Homebrew installs the newest Zola, which can't build this site yet (0.22 changed the template engine), so download [v0.21.0](https://github.com/getzola/zola/releases/tag/v0.21.0) and put `zola` on your PATH. The `bin/` scripts warn if your version doesn't match.

Text is set in Schibsted Grotesk and code in JetBrains Mono, both self-hosted under the SIL Open Font License (`static/fonts/OFL-*.txt`).
