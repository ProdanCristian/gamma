import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  const baseUrl = "http://193.160.119.179:3000";

  http.get(`${baseUrl}/api/orders`);
  sleep(1);
}
