# Rules for AI coding agents in this repo

These are the standing instructions an AI agent (Claude Code, Cursor, Copilot
agent, or any other) gets before it touches the tests. A human reviews every
change the agent makes.

## Writing a test from a requirement

1. Read the requirement in `ai/requirements/`. Each acceptance criterion
   becomes at least one test.
2. Open the page in a browser and look at the real markup before you choose
   a locator. Do not guess.
3. Put locators and actions in a page object under `src/pages/`. Specs never
   contain selectors.
4. Import `test` and `expect` from `src/fixtures/test`, never from
   `@playwright/test`.
5. Locator order of preference:
   - Controls a user operates (buttons, menus, links): role and accessible
     name first (`getByRole`). The name is part of the product, so it changes
     far less often than an attribute. Fall back to `data-test` when the
     control has no accessible name.
   - Containers and plain text (a product card, a price, a message):
     `data-test` (`getByTestId`).
   - No XPath, no CSS classes.

   This rule was changed after the repair described in `docs/AI-WORKFLOW.md`.
6. No fixed waits (`waitForTimeout`). Use web-first assertions.
7. Name the test after the behaviour a user sees, and reference the
   requirement ID in the `describe` title.

## Running

- `npx playwright test <file>` for the file you changed, then `npm test`.
- `npm run typecheck` and `npm run lint` must pass.

## Repairing a failing test

1. Read the error and the page snapshot in
   `test-results/<test>/error-context.md`.
2. Decide which of the two it is, and say so:
   - **The test is out of date** (markup changed, behaviour is the same):
     fix the locator in the page object.
   - **The product is wrong** (behaviour changed): do not touch the test.
     Report a defect.
3. Never make a test pass by weakening it: no deleted assertions, no
   `test.skip`, no longer timeouts, no `force: true`.
4. Prefer a repair that does not depend on the thing that just changed.
5. Run the repaired test against the old and the new markup, then run the
   whole suite.

## Limits

- Stay inside this repo. Do not push, do not change CI secrets.
- Keep the load on the demo site small: one browser, at most three workers.
