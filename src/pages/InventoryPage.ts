import type { Locator, Page } from '@playwright/test';

/** The four choices in the sort menu, exactly as the shopper reads them. */
export type SortOption =
  | 'Name (A to Z)'
  | 'Name (Z to A)'
  | 'Price (low to high)'
  | 'Price (high to low)';

/** The product list shown right after login. */
export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
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

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }
}
