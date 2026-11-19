import type { Locator, Page } from '@playwright/test';
import type { User } from '../data/users';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Fills only the fields it is given, so tests can leave one empty on purpose. */
  async login(user: Partial<User>): Promise<void> {
    if (user.username !== undefined) await this.usernameInput.fill(user.username);
    if (user.password !== undefined) await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }
}
