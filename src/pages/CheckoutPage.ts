import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../data/customers';
import { toCents } from '../support/money';

/** Covers the three checkout screens: your details, the overview, the confirmation. */
export class CheckoutPage {
  // Step 1: your details
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly error: Locator;

  // Step 2: overview
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  // Step 3: confirmation
  readonly confirmationHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');

    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');

    this.confirmationHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  /** Fills only the fields it is given, so tests can leave one empty on purpose. */
  async fillDetails(customer: Partial<Customer>): Promise<void> {
    if (customer.firstName !== undefined) await this.firstNameInput.fill(customer.firstName);
    if (customer.lastName !== undefined) await this.lastNameInput.fill(customer.lastName);
    if (customer.postalCode !== undefined) await this.postalCodeInput.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /** The three money lines of the overview, in cents. */
  async totals(): Promise<{ subtotal: number; tax: number; total: number }> {
    return {
      subtotal: toCents(await this.subtotal.innerText()),
      tax: toCents(await this.tax.innerText()),
      total: toCents(await this.total.innerText()),
    };
  }
}
