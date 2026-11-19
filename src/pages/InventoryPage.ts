import type { Locator, Page } from '@playwright/test';

/** The product list shown right after login. */
export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** The card of one product, found by the name a shopper sees. */
  item(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async addToCart(productName: string): Promise<void> {
    await this.item(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.item(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async openProduct(productName: string): Promise<void> {
    await this.itemNames.filter({ hasText: productName }).click();
    // The list and the detail page share element names, and the address changes
    // a moment before the new page is drawn. Wait for something only the detail
    // page has, so the next step cannot read the old list by mistake.
    await this.page.getByTestId('back-to-products').waitFor();
  }
}
