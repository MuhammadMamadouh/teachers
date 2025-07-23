import http from 'k6/http';
import exec from 'k6/execution';
import { browser } from 'k6/browser';
import { sleep, check, fail } from 'k6';

const BASE_URL = 'https://nazzamly.com';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export function setup() {
  const res = http.get(BASE_URL);
  if (res.status !== 200) {
    exec.test.abort(`Got unexpected status code ${res.status} when trying to setup. Exiting.`);
  }
}

export default async function () {
  const page = await browser.newPage();

  try {
    // 1. Open the welcome page
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });
    const title = await page.title();
    // exec.test.info(`Welcome page title: ${title}`);

    check(title, {
      'welcome page loaded': t => t.includes('نظام إدارة المعلمين'),
    });

    // 2. Click the login link
   

  } catch (error) {
    fail(`Browser iteration failed: ${error && error.message ? error.message : error}`);
  } finally {
    await page.close();
  }
}
