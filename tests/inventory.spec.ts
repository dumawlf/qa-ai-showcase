import { allProducts, products } from '../src/data/products';
import { expect, test } from '../src/fixtures/test';
import { dollarsToCents, toCents } from '../src/support/money';

test.describe('Product list', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('shows every product with its price', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(allProducts.length);

    for (const product of allProducts) {
      await expect(inventoryPage.item(product.name)).toContainText(`$${product.price}`);
    }
  });

  test('the detail page shows the same name and price as the list', async ({ inventoryPage, productPage }) => {
    const product = products.fleeceJacket;

    await inventoryPage.openProduct(product.name);

    await expect(productPage.name).toHaveText(product.name);
    expect(toCents(await productPage.price.innerText())).toBe(dollarsToCents(product.price));
  });

  test('a product can be added to the cart from its detail page', async ({ inventoryPage, productPage, header }) => {
    await inventoryPage.openProduct(products.onesie.name);
    await productPage.addToCartButton.click();

    await expect(header.cartBadge).toHaveText('1');
    await expect(productPage.removeButton).toBeVisible();
  });
});
