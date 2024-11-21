import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Ramp up to 50 users
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 100 },    // Stay at 100 users
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const baseUrl = "https://gamma.md/ro/product/ferestrau-electric-cu-acumulator-tatta-td-5300_196";

  const params = {
    headers: {
      'Accept': 'text/html',
      'User-Agent': 'k6-test',
      'Cache-Control': 'no-cache'
    },
    tags: { name: 'homepage' }
  };

  const response = http.get(baseUrl, params);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
    'body size > 0': (r) => r.body.length > 0,
  });

  sleep(Math.random() * 3 + 1);
}