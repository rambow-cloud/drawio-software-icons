# Repository working agreements

Every repository change must follow this sequence:

1. Create or reuse an open issue in this repository before committing work. Write issues in English and define the expected result.
2. Create `feat/<issue-number>-<short-description>` from current `main`. Use this prefix for features, fixes, documentation and maintenance alike.
3. Commit and push only to that feature branch. Never push directly to `main`.
4. Open an English PR targeting `main`. Include a standalone `Closes #<issue-number>` line matching the branch issue.
5. Run `npm run check:pr` and wait for the required **PR checks** check. Merge only after it passes. Do not bypass repository rules.

PR checks are intentionally lightweight: whitespace, JS/JSON/YAML syntax,
changed SVG/PNG safety, icon configuration, workflow-policy tests and TypeScript.
They do not download artwork, build distribution artifacts or deploy either site.
Use additional focused tests when the behavior being changed requires them.
Full builds and publishing run after merging to `main`.

Avoid redundant validation: repeat checks only after a relevant change or a
failure with a newly understood cause. For browser-verifiable results, tell the
user exactly what to open and inspect instead of making command-line requests.
For DNS, use server-side deployment status and outputs; do not run local DNS
probes.
