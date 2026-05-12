const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export function getStoredToken() {
  return localStorage.getItem("physics_auth_token");
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem("physics_auth_token", token);
    return;
  }

  localStorage.removeItem("physics_auth_token");
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Backend сервері қосылмаған немесе API-ге байланыс жоқ. Laravel серверін іске қосыңыз.");
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || Object.values(payload.errors || {})[0]?.[0] || "Сұраныс орындалмады";
    throw new Error(message);
  }

  return payload.data ?? payload;
}
