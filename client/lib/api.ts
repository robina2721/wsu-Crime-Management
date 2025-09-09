const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

async function request(path: string, init?: RequestInit) {
  const url = path.startsWith("/") ? `${BASE}${path}` : `${BASE}/${path}`;
  const headers = new Headers(init?.headers || {});
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && init?.body && !isFormData)
    headers.set("Content-Type", "application/json");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token && !headers.has("Authorization"))
    headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(url, { ...init, headers });
    // If server returned non-JSON (HTML error page), read its text and wrap into a JSON Response
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      // Avoid leaking large HTML in production — only include snippet in dev
      const payload: any = { success: false, error: "Non-JSON response from server" };
      payload.originalStatus = res.status;
      payload.originalContentType = contentType;
      payload.bodySnippet = process.env.NODE_ENV !== "production" ? String(text).slice(0, 8000) : undefined;
      return new Response(JSON.stringify(payload), {
        status: res.status || 500,
        headers: { "Content-Type": "application/json" },
      } as any);
    }
    return res;
  } catch (err: any) {
    // Handle network failures gracefully so callers do not crash unexpectedly.
    console.error("API request failed", url, err);
    const body = { success: false, error: err?.message || String(err) };
    try {
      return new Response(JSON.stringify(body), {
        status: 0,
        headers: { "Content-Type": "application/json" },
      } as any);
    } catch (e) {
      // Fallback for environments without Response constructor
      throw err;
    }
  }
}

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body?: any) => {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    return request(path, {
      method: "POST",
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  },
  put: (path: string, body?: any) => {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    return request(path, {
      method: "PUT",
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  },
  delete: (path: string) => request(path, { method: "DELETE" }),
};
