import { products } from '../src/data/products';
import { expect, test } from '../src/fixtures/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('the cart starts empty', async ({ header, cartPage }) => {
    await expect(header.cartBadge).toBeHidden();

    await header.openCart();
    await expect(cartPage.items).toHaveCount(0);
  });

  test('adding a product shows it in the badge and in the cart', { tag: '@smoke' }, async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await expect(header.cartBadge).toHaveText('1');

    await header.openCart();
    await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
    await expect(cartPage.item(products.backpack.name)).toContainText(`$${products.backpack.price}`);
  });

  test('the badge counts every product added', async ({ inventoryPage, header }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.addToCart(products.onesie.name);

    await expect(header.cartBadge).toHaveText('3');
  });

  test('a product can be removed from the product list', async ({ inventoryPage, header }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.removeFromCart(products.backpack.name);

    await expect(header.cartBadge).toHaveText('1');
  });

  test('a product can be removed from the cart page', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await header.openCart();

    await cartPage.remove(products.backpack.name);

    await expect(cartPage.itemNames).toHaveText([products.bikeLight.name]);
    await expect(header.cartBadge).toHaveText('1');
  });

  test('the cart survives a page reload', async ({ inventoryPage, header, cartPage, page }) => {
    await inventoryPage.addToCart(products.boltTShirt.name);

    await page.reload();

    await expect(header.cartBadge).toHaveText('1');
    await header.openCart();
    await expect(cartPage.itemNames).toHaveText([products.boltTShirt.name]);
  });

  test('"Continue Shopping" goes back to the product list', async ({ header, cartPage, inventoryPage, page }) => {
    await header.openCart();
    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
