// utils/http.js
export const ensureSlash = (url) => (url.endsWith("/") ? url : url + "/");
