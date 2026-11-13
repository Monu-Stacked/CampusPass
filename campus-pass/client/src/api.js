export async function api(path, options = {}) {
  const token = sessionStorage.getItem("campus_token");
  const headers = { ...options.headers };
  if (options.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`/api${path}`, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || "Something went wrong.");
    error.details = data;
    throw error;
  }
  if (options.download) return response.blob();
  return response.json();
}

