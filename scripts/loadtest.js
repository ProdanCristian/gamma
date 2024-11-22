import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const timeToFirstByte = new Trend('time_to_first_byte');

// Test configuration for static site on 4 CPU, 16GB RAM VPS
export const options = {
  stages: [
    { duration: '2m', target: 500 },    // Ramp up to 500 users
    { duration: '3m', target: 500 },    // Stay at 500
    { duration: '2m', target: 1000 },   // Ramp up to 1000
    { duration: '3m', target: 1000 },   // Stay at 1000
    { duration: '2m', target: 2000 },   // Ramp up to 2000
    { duration: '3m', target: 2000 },   // Stay at 2000
    { duration: '2m', target: 3000 },   // Ramp up to 3000
    { duration: '3m', target: 3000 },   // Stay at 3000
    { duration: '2m', target: 0 },      // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],    // 95% of requests must complete below 1s
    'http_req_duration{staticAsset:yes}': ['p(95)<200'], // Static assets should load within 200ms
    errors: ['rate<0.01'],                // Error rate should be less than 1%
    time_to_first_byte: ['p(95)<100'],    // TTFB should be under 100ms for 95% of requests
  },
};

const BASE_URL = 'https://gamma.md'; // Change to your production URL
const SLEEP_DURATION = { min: 1, max: 3 }; // Reduced sleep to increase load

export default function() {
  const locale = Math.random() < 0.5 ? 'ro' : 'ru';
  
  // Batch requests for static pages
  const responses = http.batch([
    // Homepage
    {
      method: 'GET',
      url: `${BASE_URL}/${locale}`,
      tags: { page: 'home', staticAsset: 'yes' }
    },
    // Shop page
    {
      method: 'GET',
      url: `${BASE_URL}/${locale}/shop`,
      tags: { page: 'shop', staticAsset: 'yes' }
    },
    // About page
    {
      method: 'GET',
      url: `${BASE_URL}/${locale}/about`,
      tags: { page: 'about', staticAsset: 'yes' }
    }
  ]);

  // Check responses and record TTFB
  responses.forEach(response => {
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    timeToFirstByte.add(response.timings.waiting);
    errorRate.add(response.status !== 200);
  });

  sleep(random(SLEEP_DURATION.min, SLEEP_DURATION.max));

  // Product page (static generated)
  const productResponse = http.get(`${BASE_URL}/${locale}/product/test1_223`, {
    tags: { page: 'product', staticAsset: 'yes' }
  });
  
  check(productResponse, {
    'product page status is 200': (r) => r.status === 200,
    'product load time < 1s': (r) => r.timings.duration < 1000,
  });
  timeToFirstByte.add(productResponse.timings.waiting);

  sleep(random(SLEEP_DURATION.min, SLEEP_DURATION.max));

  // API endpoints (to test server capacity)
  const apiResponse = http.get(`${BASE_URL}/api/products/allProducts`, {
    tags: { type: 'api' }
  });
  
  check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API response time < 2s': (r) => r.timings.duration < 2000,
  });
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}