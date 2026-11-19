# The AI workflow: one worked example

This page shows one full loop: an AI coding agent writes tests from a
requirement, runs them, and repairs them after a selector breaks.

Everything here happened in this repo. The commits are in the history, and
you can replay each step with the commands below.

The human's job in this loop: write the requirement, set the rules
([AGENTS.md](../AGENTS.md)), and review each diff before it is committed.

## The loop

```
requirement  ->  agent writes test  ->  agent runs it  ->  human reviews
                                                                |
        human reviews  <-  agent repairs  <-  test fails  <-  release
```

## Step 1. The requirement

[ai/requirements/REQ-001-sort-products.md](../ai/requirements/REQ-001-sort-products.md):
a user story about sorting the product list, with five acceptance criteria.
No selectors, no code, no test steps.

The prompt for this step is one sentence:

> Write Playwright tests for REQ-001. Follow AGENTS.md.

## Step 2. The agent writes the tests

Commit: `test(ai): agent writes sorting tests from REQ-001`

```bash
git show ":/agent writes sorting tests"
```

What the agent did:

- Opened the product list in a browser and read the real markup of the sort menu.
- Added `sortBy()` and a `SortOption` type to the existing page object
  [src/pages/InventoryPage.ts](../src/pages/InventoryPage.ts).
- Wrote [tests/sorting.spec.ts](../tests/sorting.spec.ts): five tests, one per criterion.
- Ran type check, lint and the tests. All five passed.

The locator it chose for the sort menu, following the rule at that time
("`data-test` first"):

```ts
this.sortSelect = page.getByTestId('product-sort-container');
```

One thing changed before the commit: the first draft read the list right
after sorting and compared it once. The final version uses
`await expect(locator).toHaveText([...])`, which retries until the page has
settled. That removes a possible flaky test before it exists.

## Step 3. A release breaks the selector

We do not own the demo shop, so we cannot ship a real change to it.
The break is simulated, and the simulation is honest about what it is:
with `SIMULATE_RELEASE=1`, the shop's JavaScript is edited on its way to the
browser, and `data-test="product-sort-container"` becomes
`data-test="sort-select"`. The page looks and works the same. Only the
attribute changed. The code is in
[src/support/simulated-release.ts](../src/support/simulated-release.ts).

To see the failure, go back to the page object as it was before the repair:

```bash
git checkout ":/agent writes sorting tests" -- src/pages/InventoryPage.ts
```

```bash
npm run test:simulated-release
```

The result, as it was recorded in this repo:

```
  ✘  1. the list opens sorted by name, A to Z
  ✘  2. price low to high puts the cheapest product first
  ✘  3. price high to low puts the most expensive product first
  ✘  4. name Z to A reverses the alphabetical order
  ✘  5. going back to A to Z restores the full list

    Error: expect(locator).toHaveValue(expected) failed

    Locator: getByTestId('product-sort-container')
    Expected: "az"
    Timeout: 5000ms
    Error: element(s) not found
```

## Step 4. The agent repairs it

The prompt for this step:

> The sorting tests fail after a release. Follow the repair rules in AGENTS.md.

What the agent did:

1. **Read the evidence.** Playwright saves a snapshot of the page next to
   each failure (`test-results/<test>/error-context.md`). The snapshot showed
   the menu is still on the page:

   ```
   - combobox "Sort products":
     - option "Name (A to Z)" [selected]
     - option "Name (Z to A)"
     - option "Price (low to high)"
     - option "Price (high to low)"
   ```

2. **Made the call.** The menu is there and has the same four options. The
   behaviour did not change. So the test is out of date, and the product is
   fine. No defect to report.

3. **Fixed one line, in the page object.** Not a swap of the old attribute
   for the new one. The new locator uses what a shopper and a screen reader
   get, which the release did not touch:

   ```diff
   - this.sortSelect = page.getByTestId('product-sort-container');
   + this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
   ```

4. **Proved it** against both versions of the page, then ran the whole suite:

   ```
   npm run test:simulated-release   ->  5 passed
   npm test                         ->  30 passed
   ```

5. **Updated the rules.** [AGENTS.md](../AGENTS.md) now says: for controls a
   user operates, use role and name first. The next test starts sturdier.

No assertion was removed, no test was skipped, and no timeout was raised.

Commit: `fix(ai): agent repairs the sort menu locator after a renamed attribute`

```bash
git show ":/agent repairs the sort menu"
```

To put the repaired file back after replaying step 3:

```bash
git checkout HEAD -- src/pages/InventoryPage.ts
```

## What stops the agent from cheating

A failing test can always be made green the wrong way. The rules in
[AGENTS.md](../AGENTS.md) forbid it: no deleted assertions, no `test.skip`,
no longer timeouts, no `force: true`. And when the behaviour itself changed,
the agent must leave the test alone and report a defect.

The human review of each diff is the last check. It is quick, because a
repair like this one is a one-line change.
