/**
 * Debugging helper for frontend token usage
 */

export function logTokenUsage() {
  const token = localStorage.getItem("token");
  console.log("Token in localStorage:", token);

  // Monkey patch axios to log Authorization header on requests
  const axios = require("axios");
  axios.interceptors.request.use((config) => {
    console.log("Axios request Authorization header:", config.headers.Authorization);
    return config;
  });
}
