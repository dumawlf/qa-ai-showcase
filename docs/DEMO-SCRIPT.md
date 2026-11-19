# Demo script: 3-minute screen recording

Goal: a hiring manager watches 3 minutes and thinks "this person can build
our test suite and uses AI with control".

## Before you record

- Editor (VS Code) with this repo open, terminal at the bottom. Font size big (16 or more).
- Close everything else. Hide notifications. No other projects, tabs or bookmarks on screen.
- Run `npm test` once so everything is warm.
- Run these so the terminal is clean and the repo is in its final state:

```bash
git checkout HEAD -- src/pages/InventoryPage.ts
```

```bash
clear
```

- Speak slowly. Short sentences. It is fine to record each shot on its own and cut them together.

## The shots

| # | Time | Show | Say |
| --- | --- | --- | --- |
| 1 | 0:00 to 0:15 | The README on GitHub, top of the page. | "Hi, I'm Gabriel, a senior QA automation engineer. This is a Playwright and TypeScript test suite I built with an AI agent. I'll show the tests, then how the agent writes and repairs them." |
| 2 | 0:15 to 0:40 | Terminal. Type `npm test`. Let it run to "30 passed". | "Thirty UI tests for a demo web shop. Login, cart, checkout, and the negative cases. They run in parallel, in about ten seconds." |
| 3 | 0:40 to 1:00 | Type `npm run report`. Scroll the report slowly. Click the `smoke` tag once. | "This is the report. Each test is named after what a user sees. Smoke tests are tagged, so after a deploy I can run just those. On a failure the report keeps a trace, a screenshot and a video." |
| 4 | 1:00 to 1:20 | Editor. Open `tests/checkout.spec.ts`, show the first test. Then open `src/pages/CheckoutPage.ts` for two seconds. | "The tests read like plain steps. There are no selectors in them. Selectors live in page objects, so when a page changes, I fix one place." |
| 5 | 1:20 to 1:40 | Open `ai/requirements/REQ-001-sort-products.md`. Then `AGENTS.md`. | "Now the AI part. This is a requirement in plain language. And these are the rules my AI agent must follow. From these two files, the agent wrote the sorting tests." |
| 6 | 1:40 to 1:50 | Open `tests/sorting.spec.ts`. | "Five tests, one for each acceptance criterion. I review the diff before it is committed." |
| 7 | 1:50 to 2:15 | Terminal. Run the two commands under "Shot 7" below. Wait for the red result. Scroll to the error "element(s) not found". | "Now a front-end release renames an attribute on the page. I simulate that here, because I don't own this shop. Five tests fail. This is the daily cost of UI automation." |
| 8 | 2:15 to 2:45 | Run `git show ":/agent repairs the sort menu" -- src/pages/InventoryPage.ts`. Point at the red and green lines. | "The agent read the failure and the page snapshot. The menu was still there and worked the same. So the test was out of date, and the product was fine. The fix is one line. It now finds the menu the way a user does, by its name." |
| 9 | 2:45 to 2:55 | Run the two commands under "Shot 9" below. Show "5 passed". | "Same simulated release. Five green. The agent is not allowed to skip a test or remove a check to get there. That is in the rules." |
| 10 | 2:55 to 3:00 | Back to the README top. | "That is how I work: I set the rules and review, the agent does the typing. The code is linked below. Thanks for watching." |

### Shot 7 commands

Put the old locator back, then run against the simulated release:

```bash
git checkout ":/agent writes sorting tests" -- src/pages/InventoryPage.ts
```

```bash
npm run test:simulated-release
```

This run takes about 15 seconds. Cut the waiting in the edit.

### Shot 9 commands

Restore the repaired file, then run again:

```bash
git checkout HEAD -- src/pages/InventoryPage.ts
```

```bash
npm run test:simulated-release
```

## A stronger version of shots 8 and 9 (optional)

Do the repair live with your AI agent, instead of showing the old commit.

1. After shot 7, open your agent in the repo.
2. Type: `The sorting tests fail after a release. Follow the repair rules in AGENTS.md.`
3. Record it reading the error, changing the locator and re-running the tests. Speed this part up in the edit.
4. Show the one-line diff with `git diff`, then say the shot 8 lines.
5. After recording, run `git checkout HEAD -- src/pages/InventoryPage.ts` to clean up.

Rehearse it twice first. A live agent can take a different path each time.

## After you record

- Check the video: no private tabs, names of other projects, or notifications visible.
- Make sure `git status` is clean. If not, run `git checkout HEAD -- src/pages/InventoryPage.ts`.
