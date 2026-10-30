import {browser} from 'k6/browser';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

// export default async function () {
//   const page = browser.newPage();
//   await page.goto('https://example.com'); 
//   sleep(10)
//   (await page).close()

//   check(page, {
//   'page title is correct': async (p) =>
//     (await p.title()) === 'Example Domain',
// });

// }

export default async function () {
  const page = await browser.newPage();

  try {
    await page.goto('https://google.com');

    sleep(10); // Keep the page open for 10 seconds
  } finally {
    await page.close();
  }
}

export function handleSummary(data) {
  return {
    "my-browser-test.html": htmlReport(data) // The summary.html can be any name
  };
}