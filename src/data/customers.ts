export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const validCustomer: Customer = {
  firstName: 'Test',
  lastName: 'Buyer',
  postalCode: '10001',
};
