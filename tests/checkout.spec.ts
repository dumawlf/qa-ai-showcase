import { validCustomer, type Customer } from '../src/data/customers';
import { products } from '../src/data/products';
import { expect, test } from '../src/fixtures/test';
import { dollarsToCents } from '../src/support/money';

test.describe('Checkout', () => {
  const basket = [products.backpack, products.bikeLight];

  // Every checkout test starts on the "your details" step with two products in the cart.
  test.beforeEach(async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.goto();
    for (const product of basket) {
      await inventoryPage.addToCart(product.name);
    }
    await header.openCart();
    await cartPage.checkout();
  });

  test('a shopper can buy two products', { tag: '@smoke' }, async ({ checkoutPage, header, page }) => {
    await checkoutPage.fillDetails(validCustomer);
    await checkoutPage.continue();
    await expect(checkoutPage.itemNames).toHaveText(basket.map((product) => product.name));

    await checkoutPage.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(header.cartBadge).toBeHidden();
  });

  test('the overview adds up: items, tax and total', async ({ checkoutPage }) => {
    await checkoutPage.fillDetails(validCustomer);
    await checkoutPage.continue();

    const expectedSubtotal = basket.reduce((sum, product) => sum + dollarsToCents(product.price), 0);
    const { subtotal, tax, total } = await checkoutPage.totals();

    expect(subtotal).toBe(expectedSubtotal);
    expect(tax).toBeGreaterThan(0);
    expect(total).toBe(subtotal + tax);
  });

  // One test per required field. The table keeps the three cases in one place.
  const missingFieldCases: { field: keyof Customer; message: string }[] = [
    { field: 'firstName', message: 'First Name is required' },
    { field: 'lastName', message: 'Last Name is required' },
    { field: 'postalCode', message: 'Postal Code is required' },
  ];

  for (const { field, message } of missingFieldCases) {
    test(`checkout is blocked when ${field} is missing`, async ({ checkoutPage, page }) => {
      const customer: Partial<Customer> = { ...validCustomer };
      delete customer[field];

      await checkoutPage.fillDetails(customer);
      await checkoutPage.continue();

      await expect(checkoutPage.error).toContainText(message);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    });
  }

  test('cancelling on the overview keeps the cart', async ({ checkoutPage, header, page }) => {
    await checkoutPage.fillDetails(validCustomer);
    await checkoutPage.continue();

    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toHaveText(String(basket.length));
  });

  test('after an order, "Back Home" returns to an empty-cart product list', async ({ checkoutPage, header, page }) => {
    await checkoutPage.fillDetails(validCustomer);
    await checkoutPage.continue();
    await checkoutPage.finish();

    await checkoutPage.backHomeButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toBeHidden();
  });
});

test.describe('Checkout: known defect', () => {
  // The demo shop lets a shopper place an order with nothing in the cart.
  // The test states the behaviour we want. `test.fail` tells Playwright the
  // failure is expected today, so the suite stays green, and the day the shop
  // is fixed this test "passes unexpectedly" and tells us to remove the marker.
  test('an empty cart cannot be checked out', { tag: '@known-defect' }, async ({ cartPage, page }) => {
    test.fail(true, 'Known defect in the demo shop: an empty cart can reach checkout.');

    await cartPage.goto();
    await cartPage.checkout();

    await expect(page).toHaveURL(/\/cart\.html$/);
  });
});
