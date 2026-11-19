// These accounts are published on the demo site's own login page.
// They are public test data, not secrets.

export interface User {
  username: string;
  password: string;
}

const PASSWORD = 'secret_sauce';

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
} satisfies Record<string, User>;
