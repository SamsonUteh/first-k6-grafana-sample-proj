import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';
const TRAFFIC_SPLIT = {
  home: 0.6, // 60% of traffic to home page
  news: 0.2, // 20% of traffic to news page
  blogs: 0.2, // 20% of traffic to blogs page
}

// Add load configuations
export const options = {
  // vus: 3, // Number of virtual users [Not needed when you use stages to define number of users with "target"]
  // duration: '5s', // Duration of the test [Not needed when you use stages to define number of users with "duration"]
  stages: [
    { duration: '5s', target: 5 }, // Ramp up to 5 users over 5 seconds
    { duration: '3s', target: 5 }, // Stay at 5 users for 3 seconds
    { duration: '5s', target: 0 }, // Ramp down to 0 users over 5 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    checks: ['rate>0.95'], // At least 95% of checks should pass
  },
};

export default function () {
  const randomValue = Math.random();

  if (randomValue < TRAFFIC_SPLIT.home) {
    group('Open Home Page', () => {
      const response = http.get(BASE_URL);

      check(response, {
        'is status 200': (r) => r.status === 200,
      });

    })

    sleep(1);

  }
  else if (randomValue < TRAFFIC_SPLIT.home + TRAFFIC_SPLIT.blogs) {
    group('Open News Page', () => {
      const response = http.get(`${BASE_URL}/news.php`);

      check(response, {
        'news loaded': (r) => r.status === 200,
      });

    })

    sleep(1);
  }
  else {

    group('Open Blogs Page', () => {
      const response = http.get(`${BASE_URL}/blogs.php`);

      check(response, {
        'blogs loaded': (r) => r.status === 200,
      });

    })

    sleep(1);
  }

  
}

// Add report generation
export function handleSummary(data) {
  return {
    "traffic-distribution-summary.html": htmlReport(data) // The summary.html can be any name
  };
}