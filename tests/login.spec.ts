import { users } from '../src/data/users';
import { expect, test } from '../src/fixtures/test';

// Every other spec starts signed in. These tests need a visitor with no session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('a valid user lands on the product list', { tag: '@smoke' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('a locked-out user is refused with a clear message', async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut);

    await expect(loginPage.error).toContainText('Sorry, this user has been locked out.');
    await expect(page).toHaveURL(/\/$/);
  });

  test('a wrong password is refused', async ({ loginPage }) => {
    await loginPage.login({ username: users.standard.username, password: 'not-the-password' });

    await expect(loginPage.error).toContainText('Username and password do not match any user in this service');
  });

  test('the username is required', async ({ loginPage }) => {
    await loginPage.login({ password: users.standard.password });

    await expect(loginPage.error).toContainText('Username is required');
  });

  test('the password is required', async ({ loginPage }) => {
    await loginPage.login({ username: users.standard.username });

    await expect(loginPage.error).toContainText('Password is required');
  });

  test('a visitor cannot open the product list without logging in', async ({ inventoryPage, loginPage, page }) => {
    await inventoryPage.goto();

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in.");
  });

  test('logging out ends the session', async ({ loginPage, inventoryPage, header, page }) => {
    await loginPage.login(users.standard);
    await header.logout();
    await expect(loginPage.loginButton).toBeVisible();

    // The old session must not let the visitor back in.
    await inventoryPage.goto();
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.error).toBeVisible();
  });
});
