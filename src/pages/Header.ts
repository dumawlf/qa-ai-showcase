import type { Locator, Page } from '@playwright/test';

/** The bar at the top of every page after login: menu, cart link, cart badge. */
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly logoutLink: Locator;
  private readonly menuButton: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
