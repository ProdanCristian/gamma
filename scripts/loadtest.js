import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const timeToFirstByte = new Trend("time_to_first_byte");

export const options = {
  stages: [
    { duration: "2m", target: 500 },
    { duration: "3m", target: 500 },
    { duration: "2m", target: 1000 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    "http_req_duration{staticAsset:yes}": ["p(95)<200"],
    errors: ["rate<0.01"],
    time_to_first_byte: ["p(95)<100"],
  },
};

const BASE_URL = "https://gamma.md";
const SLEEP_DURATION = { min: 1, max: 3 };

export default function () {
  const response = http.get(
    `${BASE_URL}/ro/product/cs-h8c-r200-1k3kfl4ga-ip-pt-4g-3mpx-4mm_193`,
    {
      tags: { page: "product", staticAsset: "yes" },
    }
  );

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  timeToFirstByte.add(response.timings.waiting);
  errorRate.add(response.status !== 200);

  sleep(
    SLEEP_DURATION.min +
      Math.random() * (SLEEP_DURATION.max - SLEEP_DURATION.min)
  );
}
