/**
 * Cloudflare Worker: reverse-proxy d-iq.io → Cloud Run dashboard.
 * Rewrites the Host header so Cloud Run accepts the request.
 */
const ORIGIN = "dialectiq-dashboard-lbogvrkjga-ww.a.run.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN;
    url.protocol = "https:";

    const newRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow",
    });

    // Override Host header for Cloud Run
    newRequest.headers.set("Host", ORIGIN);

    const response = await fetch(newRequest);

    // Return response with CORS-friendly headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Proxied-By", "dialectiq-worker");
    return newResponse;
  },
};
