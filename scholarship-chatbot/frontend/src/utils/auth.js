export function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

export function logout() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-change"));
}
