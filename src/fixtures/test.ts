import fs from 'node:fs';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';
import { users } from '../data/users';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Header } from '../pages/Header';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { applySimulatedRelease, isSimulatedRelease } from '../support/simulated-release';

/** Fixtures created fresh for every test. */
interface TestFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: Header;
  simulatedRelease: void;
}

/** Fixtures created once per worker process and shared by its tests. */
interface WorkerFixtures {
  signedInState: string;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Each worker logs in through the real login form once and saves the session
  // to a file. Every test then starts already signed in, with an empty cart.
  signedInState: [
    async ({ browser, playwright }, use, workerInfo) => {
      // A context made by hand does not read `testIdAttribute` from the config,
      // so it is applied here. Without it `getByTestId` looks for `data-testid`.
      const { baseURL, testIdAttribute } = workerInfo.project.use;
      if (testIdAttribute) playwright.selectors.setTestIdAttribute(testIdAttribute);

      const file = path.resolve('.auth', `standard-user-${workerInfo.workerIndex}.json`);
      fs.mkdirSync(path.dirname(file), { recursive: true });

      const context = await browser.newContext({ baseURL, storageState: undefined });
      const page = await context.newPage();
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(users.standard);
      await page.waitForURL('**/inventory.html');
      await context.storageState({ path: file });
      await context.close();

      await use(file);
    },
    { scope: 'worker' },
  ],

  // Tests are signed in by default. A spec can opt out with:
  //   test.use({ storageState: { cookies: [], origins: [] } });
  storageState: async ({ signedInState }, use) => {
    await use(signedInState);
  },

  // Runs for every test, but only does something when SIMULATE_RELEASE=1.
  simulatedRelease: [
    async ({ context }, use) => {
      if (isSimulatedRelease()) await applySimulatedRelease(context);
      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  header: async ({ page }, use) => {
    await use(new Header(page));
  },
});

export { expect };
