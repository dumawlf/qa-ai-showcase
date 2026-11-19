# Walkthrough: every file, in plain words

This page is for you, Gabriel. Read it once with the code open next to it.
After that you can explain any file in an interview.

Each part has: what it is, why it is like that, and a line you can say out loud.

---

## 1. The 60-second story

- The site is saucedemo.com, a demo shop made for test practice.
- 30 UI tests: login 7, product list 3, sorting 5, cart 7, checkout 8.
- Tests never contain selectors. Selectors live in page objects.
- Fixtures hand each test the page objects it asks for, already signed in.
- An AI agent wrote the sorting tests from a requirement, then repaired them after a selector broke.
- CI runs type check, lint and tests on every push and keeps the report.

**Say:** "It is a small suite, built the way I would build a big one."

---

## 2. TypeScript in ten minutes

TypeScript is JavaScript plus types. The types are checked before the code
runs, then thrown away. At run time it is plain JavaScript. Here is every
TypeScript feature used in this repo.

**Type annotations.** A colon says what a value is.

```ts
function toCents(text: string): number { ... }
```

Takes a string, returns a number. Pass a number by mistake and the editor
shows the error before you run anything.

**`Promise<void>`.** An `async` function always returns a Promise.
`Promise<void>` means "it finishes, and gives nothing back".

```ts
async goto(): Promise<void> { await this.page.goto('/'); }
```

**`interface`.** The shape of an object.

```ts
export interface Customer { firstName: string; lastName: string; postalCode: string; }
```

A typo like `custmer.firstNam` becomes a compile error, not a failing test at 2 a.m.

**`readonly`.** Can be set in the constructor, never changed after.
All locators in the page objects are `readonly`.

**`private readonly page: Page` inside a constructor.** A shortcut. It
declares the field and assigns it in one go. The long form would be:

```ts
private readonly page: Page;
constructor(page: Page) { this.page = page; }
```

`private` means only code inside the class can use it. So a test cannot
reach `inventoryPage.page` and go around the page object.

**`import type`.** Imports something only for type checking. It leaves no
trace in the running code.

**Union of strings.** A value that must be one of a fixed list.

```ts
export type SortOption = 'Name (A to Z)' | 'Name (Z to A)' | 'Price (low to high)' | 'Price (high to low)';
```

`sortBy('Price (low to hi)')` will not compile. The editor also offers the
four values as autocomplete.

**`Partial<Customer>`.** The same object, but every field is optional.
Used so a test can leave out one field on purpose.

**`keyof Customer`.** "One of the field names of Customer":
`'firstName' | 'lastName' | 'postalCode'`. Used in the table of
missing-field tests, so a wrong field name will not compile.

**`satisfies`.** Checks an object against a type, but keeps the exact keys.

```ts
export const users = { standard: {...}, lockedOut: {...} } satisfies Record<string, User>;
```

Every entry must be a valid `User`. And `users.standrd` (typo) is still an
error, because TypeScript remembers the real keys. `Record<string, User>`
means "an object whose values are all `User`".

**`as const`** is not used. **`any`** is not used. That is deliberate.

**Generics: `base.extend<TestFixtures, WorkerFixtures>`.** The angle
brackets pass types as arguments. Here they tell Playwright which fixtures
exist, so `async ({ inventoryPage }) =>` in a test is fully typed.

**`tsconfig.json`.** `strict: true` turns on the full set of checks.
`noEmit: true` means TypeScript only checks. Playwright runs the `.ts` files itself.
`npm run typecheck` runs the check.

**Say:** "My background is JavaScript. TypeScript adds the safety net:
wrong test data and wrong method names fail at compile time, not in CI."

---

## 3. `playwright.config.ts`

| Setting | Value | Why |
| --- | --- | --- |
| `fullyParallel` | on | Tests do not depend on each other, so they can run side by side. |
| `forbidOnly` | on CI | A forgotten `test.only` would silently skip the rest of the suite. |
| `retries` | 2 on CI, 0 locally | Locally I want to see a failure at once. On CI a network blip should not fail the build. A retried test is reported as "flaky", so it is not hidden. |
| `workers` | 2 on CI, 3 locally | The site is free and public. Keep the load small. |
| `timeout` / `expect.timeout` | 30 s / 5 s | The defaults, written down so nobody has to guess. |
| `actionTimeout` | 10 s | A click that cannot find its element fails in 10 s, not after the whole 30 s test. |
| `reporter` | list + html (+ github on CI) | Console lines while it runs, an HTML report after. On CI, failures also show up as notes on the pull request. |
| `testIdAttribute` | `data-test` | The site uses `data-test`, not Playwright's default `data-testid`. With this, `getByTestId('username')` works. |
| `trace`, `screenshot`, `video` | only kept on failure | Full evidence when something breaks, no clutter when it passes. |
| `projects` | chromium only | One browser keeps the load small. Adding Firefox is one more line. |

**Say:** "Retries are for CI only, and a retried test is flagged flaky. I do
not use retries to hide problems."

---

## 4. Page objects: `src/pages/`

One class per page or page part. A class holds two things: **locators**
(where things are) and **actions** (what a user does).

- `LoginPage`: the form and its error message.
- `Header`: the top bar. Cart link, cart badge, menu, logout. It is its own class because it is on every page.
- `InventoryPage`: the product list. `item(name)` finds one product card by the name a shopper sees.
- `ProductPage`: one product's detail page.
- `CartPage`: the cart.
- `CheckoutPage`: the three checkout screens in one class, because they are one flow.

Rules followed everywhere:

- **Assertions stay in the tests.** Page objects expose locators. Tests say `expect(header.cartBadge).toHaveText('1')`. So you read a test and see what is checked.
- **Locators are created once, in the constructor.** A Playwright locator is lazy. It is a description, not an element. It looks the element up fresh each time it is used.
- **Find things the way a user does.** `item('Sauce Labs Backpack')` then the button named "Add to cart". Not `add-to-cart-sauce-labs-backpack`.
- **`login()` and `fillDetails()` take a `Partial`.** They fill only what they are given. So "password is missing" is `login({ username })`, with no special method.

Two details worth knowing:

- `InventoryPage.openProduct()` waits for the "Back to products" button. The shop changes the address a moment before it draws the new page, and both pages use the same element names. Without the wait, the next step could read the old page. I hit this while building and fixed it there.
- `InventoryPage.sortSelect` uses `getByRole('combobox', { name: 'Sort products' })`. That is the repaired locator from the AI example.

**Say:** "If the page changes, I fix one line in one page object. No test changes."

---

## 5. Fixtures: `src/fixtures/test.ts`

A fixture is something a test asks for by name. Playwright builds it before
the test and cleans up after. `page` is a built-in fixture. This file adds ours.

```ts
test('...', async ({ inventoryPage, header }) => { ... });
```

The test asks for `inventoryPage` and `header`. It gets them, ready to use.
No `new InventoryPage(page)` at the top of every test.

Every spec imports `test` and `expect` from this file, not from `@playwright/test`.

**The pattern inside each fixture:**

```ts
inventoryPage: async ({ page }, use) => {
  await use(new InventoryPage(page));
},
```

Code before `use()` is setup. `use(value)` hands the value to the test and
waits while the test runs. Code after `use()` would be teardown.

**`signedInState` (worker fixture).** This is the sign-in.

- A worker is one parallel process. With 3 workers there are 3 of these.
- Once per worker, it opens the login page, logs in through the real form, and saves the cookies to a file in `.auth/`.
- `{ scope: 'worker' }` is what makes it "once per worker" and not "once per test".
- So the suite logs in 3 times, not 30 times. Faster, and less load on the site.
- The one odd line: `playwright.selectors.setTestIdAttribute(...)`. A browser context you create by hand does not read `testIdAttribute` from the config. I found this when the first run failed, and fixed it there.

**`storageState`.** A built-in Playwright option: "start the browser with
these cookies". We point it at the file from `signedInState`. So every test
starts signed in, with an empty cart.

**How login tests opt out.** At the top of `login.spec.ts`:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

That means: for this file, start with no cookies.

**`simulatedRelease`.** `{ auto: true }` means it runs for every test
without being asked for. It does nothing unless `SIMULATE_RELEASE=1`.

**Why not the "setup project" pattern?** Playwright's docs show two ways to
share a login. The other one is a separate setup project that runs first.
I chose per-worker because the shop's session cookie lasts only 10 minutes,
and a worker fixture always makes a fresh one, also in UI mode.

**Say:** "Tests start signed in. Login happens once per worker through the
real form, and the login tests themselves start signed out."

---

## 6. Test data: `src/data/`

- `users.ts`: the accounts. They are printed on the shop's own login page, so they are public test data, not secrets. In a real project the password would come from an environment variable or a secret store.
- `products.ts`: the six products and their prices. `allProducts` is the same data as a list.
- `customers.ts`: one valid customer for checkout.

Why in one place: when a price changes, you change one line.

## 7. Helpers: `src/support/`

- `money.ts`: `toCents('$29.99')` gives `2999`. Tests compare cents because JavaScript decimals are not exact (`0.1 + 0.2` is `0.30000000000000004`).
- `simulated-release.ts`: the fake release for the AI example. `context.route()` catches the shop's JavaScript file on its way to the browser, renames one attribute in it, and passes it on. The same technique is used in real projects to mock an API response.

---

## 8. The specs: `tests/`

Shared style:

- Test names say what a user sees: "a locked-out user is refused with a clear message".
- Arrange, act, assert, separated by blank lines.
- `{ tag: '@smoke' }` marks the 4 most important paths. `npm run test:smoke` runs only those. Use it after a deploy, when you want an answer in seconds.
- Assertions are "web-first": `await expect(locator).toHaveText(...)` retries until it is true or 5 seconds pass. There is no `waitForTimeout` anywhere.

**`login.spec.ts` (7).** One happy path and six ways it must fail or close.
The last test logs out and then checks that the old session really is dead.

**`inventory.spec.ts` (3).** All six products with prices, the detail page
matches the list, add to cart from the detail page.

**`cart.spec.ts` (7).** Empty at the start, add, count, remove from two
places, survives a reload, "Continue Shopping".

**`checkout.spec.ts` (8).**

- `beforeEach` puts two products in the cart and opens checkout, so each test starts at the same point.
- "the overview adds up": item total equals the sum of the prices, and total equals item total plus tax. It does not check the tax rate, because no requirement states it.
- The three missing-field tests come from one table and a `for` loop. One test per case, so the report shows exactly which field failed.
- **The known defect.** The shop lets you check out with an empty cart. The test describes the correct behaviour and is marked `test.fail`. Today it fails as expected, so the suite is green. The day the shop is fixed, Playwright reports "passed unexpectedly" and we remove the marker. This is better than `test.skip`, which would stay silent forever. It takes about 6 seconds because it waits the full 5 seconds for a redirect that does not come.

**`sorting.spec.ts` (5).** Written by the AI agent. The expected order is
computed from the product data with `toSorted()`, then compared with the
page in one retrying assertion.

**Say:** "Every negative case is its own test, so the report tells you which
rule broke without opening a trace."

---

## 9. The AI part

Files: `AGENTS.md`, `ai/requirements/REQ-001-sort-products.md`,
`docs/AI-WORKFLOW.md`, and two commits in the history.

- `AGENTS.md` is the rule book the agent reads first. It works with any agent tool.
- The requirement has no selectors and no steps. Only what the shopper needs.
- The agent wrote the tests, ran them, and they passed.
- The simulated release renamed one attribute. All five tests failed.
- The agent read the page snapshot Playwright saves with each failure, saw the menu was still there, and decided: the test is old, the product is fine.
- The fix was one line: find the menu by role and name, which the release did not touch.
- It proved the fix on both versions of the page, then updated the rule book.

Questions you may get, and honest answers:

- **"Is the break real?"** The failure is real. The release is simulated, because we do not own the shop. The README and the doc say so.
- **"Is this self-healing?"** No. Nothing changes the tests at run time. The agent proposes a repair as a normal code change, and a person reviews it.
- **"What if the product is really broken?"** Then the rule is: do not touch the test, report a defect. The agent may never weaken a test to make it pass.
- **"Did you write this code?"** The agent wrote most of it. You set the rules, review it and can explain every line. That is the point of the project.

**Say:** "The agent is fast. The rules and the review are what make it safe."

---

## 10. CI: `.github/workflows/tests.yml`

- Runs on every push to `main`, on every pull request, and by hand.
- Steps: install, install the browser, type check, lint, tests.
- `concurrency`: a new push cancels the older run on the same branch.
- `permissions: contents: read`: the job can read the code and nothing more.
- The report is uploaded even when tests fail (`if: !cancelled()`). A failed run is when you need it.
- It has never run yet, because nothing is pushed. Check the first run after you publish.

## 11. Lint: `eslint.config.mjs`

Two things matter:

- `no-floating-promises`: catches a missing `await`. That is the most common cause of flaky Playwright tests.
- `eslint-plugin-playwright`: catches `test.only`, fixed waits and similar habits.

TypeScript is pinned to version 6.0 because the lint tools do not support 7 yet.

---

## 12. Before you publish: your checklist

1. Run `npm test` and `npm run report` yourself.
2. Read each spec file once. They are short.
3. Replay the AI example with the commands in `docs/AI-WORKFLOW.md`.
4. Be sure the "About" lines in the README are true for you. They say you review every change. So review it.
