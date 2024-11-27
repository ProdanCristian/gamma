import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // Ramp up virtual users
  stages: [
    { duration: '1m', target: 200 },    // Slowly ramp up to 10 users
    { duration: '3m', target: 500 },     // Stay at 50 users for a minute
    { duration: '30s', target: 0 }      // Ramp down to 0 users
  ],
  // Thresholds for performance
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% of requests under 500ms`
    'http_req_failed': ['rate<0.01']     // Less than 1% request failure
  }
};

export default function() {
  const res = http.get('http://193.160.119.179:3000');  // Replace with your app's URL
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 500
  });
  
  sleep(1);  // Think time between requests
}