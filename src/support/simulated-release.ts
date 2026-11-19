import type { BrowserContext } from '@playwright/test';

/**
 * Simulates a front-end release that renames a `data-test` attribute.
 *
 * We do not own the demo site, so we cannot ship a real change to it.
 * Instead, when SIMULATE_RELEASE=1, the site's JavaScript bundle is edited
 * on its way to the browser. The page then renders the "new" markup, and
 * any test that depends on the old attribute fails exactly as it would
 * after a real release. See docs/AI-WORKFLOW.md.
 */
const RENAMES: Record<string, string> = {
  'product-sort-container': 'sort-select',
};

export function isSimulatedRelease(): boolean {
  return process.env.SIMULATE_RELEASE === '1';
}

export async function applySimulatedRelease(context: BrowserContext): Promise<void> {
  await context.route('**/assets/*.js', async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    for (const [oldName, newName] of Object.entries(RENAMES)) {
      body = body.replaceAll(oldName, newName);
    }
    await route.fulfill({ response, body });
  });
}
