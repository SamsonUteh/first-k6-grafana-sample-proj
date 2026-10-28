import http from 'k6/http';
import { sleep, check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const BASE_URL = __ENV.BASE_URL || 'https://gorest.co.in/public';

// Add load configuations
export const options = {
  vus: 3, // Number of virtual users [Not needed when you use stages to define number of users with "target"]
  duration: '3s', // Duration of the test [Not needed when you use stages to define number of users with "duration"]
  // stages: [
  //   { duration: '5s', target: 5 }, // Ramp up to 5 users over 5 seconds
  //   { duration: '3s', target: 5 }, // Stay at 5 users for 3 seconds
  //   { duration: '5s', target: 0 }, // Ramp down to 0 users over 5 seconds
  // ],
  // thresholds: {
  //   http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  //   http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  //   checks: ['rate>0.95'], // At least 95% of checks should pass
  // },
};

// Add headers for the requests for authentication
const params = {
  headers: {
    'Authorization': 'Bearer a023688d0a92765f16eedbede961665f0852a9bb6d34f3867fb38ff5af6718e1',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
}

// To add external payload, create a payload.json file.
const externalData = JSON.parse(open('./payload.json'));

// For a single payload, you can also define it directly in the code as shown below. However, it's better to keep the payload in a separate file for better organization and maintainability.
const createUserPayload = JSON.stringify({
  "name": "Tenali Ramakrishna",
  "email": "tenali6@example.com", 
  "gender": "male", 
  "status": "active"
});

// This is the main function that will be executed by each virtual user
export default function () {
  
  // GET Request to fetch users
  const response = http.get(`${BASE_URL}/v2/users`, params);
  check(response, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);

  // POST Request to create a new user
  // const responseCreateUser = http.post(`${BASE_URL}/v2/users`, createUserPayload, params); When the payload is in the same file
  const userIndex = (__VU - 1 + __ITER) % externalData.length;
  const responseCreateUser = http.post(`${BASE_URL}/v2/users`, JSON.stringify(externalData[userIndex]), params); // When the payload is in a separate file
  console.log("***payload***", externalData);
  console.log("***payload2***", JSON.stringify(externalData[userIndex]));
  console.log("***full response***", responseCreateUser.body);
  check(responseCreateUser, {
    'is status 201': (r) => r.status === 201,
    'is response contains id': (r) => r.body.includes('id'),
  });
  sleep(1);


}

// Add report generation
export function handleSummary(data) {
  return {
    "get-api.html": htmlReport(data) // The summary.html can be any name
  };
}