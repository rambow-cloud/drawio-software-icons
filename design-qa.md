# Icon detail design review

Source visual truth: `.sync-stage/design-review/reference.png` (the approved ImageGen board, copied unchanged; 1024 × 1536).

Implementation: the React quick-preview dialog and the shared server-rendered icon detail HTML. Local visual evidence stays in the ignored `.sync-stage/design-review/` directory.

## Evidence and normalization

- Desktop: `detail-desktop.jpg` and `dialog-desktop.jpg`; CSS viewport 1440 × 1163/1164, captured at one image pixel per CSS pixel. The browser's existing 110% zoom was accommodated with viewport emulation, without changing the user's zoom preference.
- Reference-width detail: `detail-reference-viewport.jpg`, CSS viewport 963 × 1056. The reference's page frame is 962 × 959; its presentation-board margins are excluded when comparing the actual UI.
- Mobile: `detail-mobile.jpg`, `dialog-mobile.jpg` and `commercial-mobile.jpg`; CSS viewport 390 × 843. There is no mobile mock; these captures validate the responsive interpretation.
- Full-view comparisons: `detail-comparison.png` and `dialog-comparison.png`, reference on the left and implementation on the right. Each pair uses equal display widths. Differences caused by the board's frame size are distinguished from actual component differences.
- Focused review: the cropped dialog comparison makes the typography, original artwork, preview controls, action hierarchy and property rows readable. The full detail capture also resolves those areas without additional enlargement.

## Findings and comparison history

1. Initial review identified small metadata and less prominent artwork relative to the mock, plus an insufficient mobile close target. Increased the page title and preview artwork, dialog title/metadata sizes, and the mobile close target to 44 CSS pixels. The close control stays reachable while the dialog scrolls. Balanced the two detail columns.
2. Post-fix desktop captures and the paired dialog comparison show the intended single preview surface, adjacent orange download action, compact properties, fine separators and unboxed icon gallery. Post-fix mobile observation confirms a 44-pixel close control, no horizontal dialog overflow, and working scroll access to the full-details link.

Fonts and typography: existing Inter/Segoe UI/Chinese system fallbacks retained; heading weight, hierarchy, body wrapping and metadata readability reviewed. No new font downloads.

Spacing and layout: balanced page columns, compact desktop dialog, stacked mobile layout, simple borders and restrained corners reviewed. The original homepage is preserved.

Colors and tokens: warm `#f8f7f4`, charcoal text, orange `#d9532c`, white preview and light separators match the selected direction. Focus outlines remain visible.

Images and assets: supplied original logos and favicon are reused without modifications, effects or generated replacements. Raster PNG labels and original dimensions remain accurate.

Copy: existing summaries, licenses, source URLs, software classifications and usage restrictions remain available. Real same-category catalog entries replace the mock's illustrative recommendations. The quick preview retains its existing concise content instead of adding a duplicate generic description. Verification and detailed usage notes are expandable.

## Interaction and regression checks

- Open quick preview from the homepage with Enter; Escape closes it and restores focus to the originating icon.
- Native background radios change the preview to light, dark and a transparency grid, including keyboard operation. Computed dark background confirmed as `rgb(37, 42, 41)`; no client script is required on the full page.
- Original SVG/PNG and localized XML download destinations inspected in the rendered DOM; draw.io and full-details links preserved.
- English WeChat PNG details retain publisher/terms, commercial restrictions, original artwork and expanded pinned revision/SHA-256 information. At 390 pixels, long values wrap without horizontal overflow.
- Console inspected: no error from the current root-page session or new dialog. An earlier preview-only navigation to a directory URL hit Vite's homepage fallback and produced a catalog JSON error; the explicit generated `index.html` preview and correct homepage root resolve it. Production continues to use the unchanged Worker route.
- Local automated validation: `npm run check:pr` and `npm run test:ui`. Required remote PR checks must pass before any merge.

No actionable P0/P1/P2 visual issues remain in the reviewed states. Downloads were inspected through their native link targets; external editor navigation and actual download completion are left for user inspection. No deployment or DNS validation was performed.

final result: passed

## Rambow Cloud palette alignment (issue #40)

This revision supersedes the warm/orange palette described above; the approved detail layout, typography, content and original artwork remain in place.

Source truth: live screenshots and computed CSS from https://rambow.cloud/zh/ and https://blog.rambow.cloud/zh/. Both expose the same paper `#edf5fc`, ink `#142f55`, muted text `#526d8c`, blue `#0078bb`, cyan `#00a6ed` and line `#5d89bd38`. Shared tokens in `src/brand.css` now feed the React site, generated detail stylesheet, and generated catalog/guide stylesheet. The code panel uses navy surfaces with light blue text. Semantic software types and change badges retain their existing colors.

Evidence in the ignored `.sync-stage/brand-review/` directory: `reference-main.png`, `reference-blog.png`, `home.png`, `dialog.png`, `detail.png`, and `detail-mobile.png`. Desktop captures use the browser's normal viewport; mobile uses a 390 CSS-pixel viewport and the temporary override was reset afterward. The screenshots show the shared pale blue background, navy headings, blue actions, white surfaces and cool separators. Computed homepage and full-page colors match the reference paper/ink/blue exactly.

The quick dialog and full detail page still select transparent by default, with the original neutral checkerboard. Light/dark artwork comparisons remain neutral. The mobile page has no horizontal overflow; the existing heading sizes, content wrapping, button hierarchy and preview controls remain readable. No actionable visual regressions were found in these reviewed states. CSS production bundling passes. Repository PR validation is recorded in the PR checks.

final result: passed
