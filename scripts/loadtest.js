import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: '1m', target: 100 },    // Ramp up to 100 users
    { duration: '1m', target: 300 },    // Ramp up to 300
    { duration: '1m', target: 500 },    // Ramp up to 700
    { duration: '5m', target: 500 },    // Sustain 700 for 5 minutes
    { duration: '1m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests should be below 3 seconds
    http_req_failed: ['rate<0.1'],      // Less than 10% of requests should fail
  },
};

export default function () {
  const baseUrl = "http://193.160.119.179:3000";

  // More robust error tracking
  const responses = {
    homepage: http.get(`${baseUrl}/`),
    products: http.get(`${baseUrl}/ro/product/alfa-romeo-giulia-2024-ti_135`),
    about: http.get(`${baseUrl}/ro/about`),
    contact: http.get(`${baseUrl}/ro/contact`),
  };

  // Comprehensive checks for each page
  Object.keys(responses).forEach(page => {
    check(responses[page], {
      [`${page} status is OK`]: (r) => r.status === 200,
      [`${page} response time < 3s`]: (r) => r.timings.duration < 3000,
      [`${page} not empty`]: (r) => r.body.length > 0,
    });
  });

  // Simulate more natural user behavior
  sleep(Math.random() * 3 + 1);
}