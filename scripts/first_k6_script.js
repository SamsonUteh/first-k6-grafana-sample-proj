import http from 'k6/http';
import { sleep, check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Add load configuations
export const options = {
  vus: 2, // Number of virtual users
  duration: '5s', // Duration of the test
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    checks: ['rate>0.95'], // At least 95% of checks should pass
  },
};

export default function () {
  const response = http.get('https://test.k6.io');

  check(response, {
    'is status 200': (r) => r.status === 200,
  });

  sleep(1);
}

// Add report generation
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data) // The summary.html can be any name
  };
}