import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: '1m', target: 300 },
    { duration: '1m', target: 600 },
    { duration: '1m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const baseUrl = "https://gamma.md";

  const responses = {
    homepage: http.get(`${baseUrl}/`),
  };

  Object.keys(responses).forEach(page => {
    check(responses[page], {
      [`${page} status is OK`]: (r) => r.status === 200,
      [`${page} response time < 3s`]: (r) => r.timings.duration < 3000,
      [`${page} not empty`]: (r) => r.body.length > 0,
    });
  });

  sleep(Math.random() * 3 + 1);
}