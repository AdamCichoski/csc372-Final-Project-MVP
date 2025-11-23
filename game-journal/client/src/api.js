// client/src/api.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const config = {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {} // browser sets correct multipart headers
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  };

  // If body is a plain object, JSON-stringify it
  if (config.body && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);

  // Optional: you can centralize error handling here
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore JSON parse errors
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  // Try to parse JSON, fall back to text
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// Convenience helpers

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

export function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

export function apiDelete(path) {
  return request(path, { method: "DELETE" });
}

export { API_BASE_URL };
