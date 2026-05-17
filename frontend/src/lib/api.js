/**
 * POST JSON to the backend with timeout and safe body parsing.
 * Throws Error with a user-facing message; never throws on non-JSON alone.
 */
export async function postJson(baseUrl, path, body, options = {}) {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${String(baseUrl).replace(/\/$/, "")}${path}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error(`[api] JSON parse failed for ${url}:`, text, parseErr);
        const preview = text.replace(/\s+/g, " ").slice(0, 120);
        throw new Error(
          `Server returned non-JSON (${res.status}): ${preview || "(empty)"}`
        );
      }
    }

    return { res, data };
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Request timed out. Is the server running on the correct port?");
    }
    if (err instanceof TypeError && /fetch/i.test(err.message)) {
      throw new Error(
        "Cannot reach the server. Check that the backend is running and VITE_URL is correct."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
