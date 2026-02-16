const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function getToken(): string | null {
  return localStorage.getItem("jwt_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

async function uploadFile(path: string, file: File): Promise<any> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Upload failed");
  }
  return res.json();
}

export const api = {
  // Send both gmail and confirmGmail to match backend validation expectations.
  register: (gmail: string, confirmGmail?: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ gmail, confirmGmail: confirmGmail ?? gmail }),
    }),

  login: (gmail: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ gmail, password }),
    }),

  forgotPassword: (gmail: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ gmail }) }),

  upload: (file: File) => uploadFile("/upload", file),

  process: (fileId: string) =>
    request("/process", { method: "POST", body: JSON.stringify({ fileId }) }),

  getSummary: (fileId: string) => request<any>(`/summary/${fileId}`),

  downloadUrl: (fileId: string) => `${API_BASE}/download/${fileId}`,
};
