import { allProducts, type Product } from '../src/data/products';
import { expect, test } from '../src/fixtures/test';

// Written by an AI agent from ai/requirements/REQ-001-sort-products.md.
// The numbers in the test titles are the acceptance criteria.
// Criterion 5 (sorting never adds or removes a product) is also checked by
// every test: each one compares the full list, so a missing or extra product
// fails it.

const byName = (a: Product, b: Product): number => a.name.localeCompare(b.name);
const byPrice = (a: Product, b: Product): number => a.price - b.price;

const names = (list: Product[]): string[] => list.map((product) => product.name);
const prices = (list: Product[]): string[] => list.map((product) => `$${product.price}`);

test.describe('REQ-001: sort the product list', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('1. the list opens sorted by name, A to Z', async ({ inventoryPage }) => {
    await expect(inventoryPage.sortSelect).toHaveValue('az');
    await expect(inventoryPage.itemNames).toHaveText(names(allProducts.toSorted(byName)));
  });

  test('2. price low to high puts the cheapest product first', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Price (low to high)');

    await expect(inventoryPage.itemPrices).toHaveText(prices(allProducts.toSorted(byPrice)));
  });

  test('3. price high to low puts the most expensive product first', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Price (high to low)');

    await expect(inventoryPage.itemPrices).toHaveText(prices(allProducts.toSorted(byPrice).reverse()));
  });

  test('4. name Z to A reverses the alphabetical order', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Name (Z to A)');

    await expect(inventoryPage.itemNames).toHaveText(names(allProducts.toSorted(byName).reverse()));
  });

  test('5. going back to A to Z restores the full list', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Price (high to low)');
    await inventoryPage.sortBy('Name (A to Z)');

    await expect(inventoryPage.itemNames).toHaveText(names(allProducts.toSorted(byName)));
  });
});
