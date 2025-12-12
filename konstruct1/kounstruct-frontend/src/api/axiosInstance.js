import axios from "axios";
// ---- LOGOUT guard ----
let isLoggingOut = false;
export const setLoggingOut = (v) => {
  isLoggingOut = !!v;
  if (isLoggingOut) localStorage.setItem("__LOGGING_OUT__", "1");
  else localStorage.removeItem("__LOGGING_OUT__");
};
const loggingOutFlag = () =>
  isLoggingOut || localStorage.getItem("__LOGGING_OUT__") === "1";



const LOCAL_IP = "192.168.29.79";
// const LOCAL_IP = "192.168.0.104";
// const LOCAL_IP = "192.168.1.14";
// const LOCAL_IP = "192.168.78.214";
// const LOCAL_IP = "192.168.16.214";
// const LOCAL_IP = "192.168.0.204";
// const LOCAL_IP = "192.168.78.214";

const refreshToken = async () => {
  const refresh = localStorage.getItem("REFRESH_TOKEN");
  if (!refresh) return null; // <- no throw
  try {
    const { data } = await axios.post(
      `https://konstruct.world/users/token/refresh/`,
      { refresh }
    );
    const newAccess = data?.access || null;
    if (newAccess) localStorage.setItem("ACCESS_TOKEN", newAccess);
    if (data?.refresh) localStorage.setItem("REFRESH_TOKEN", data.refresh);
    return newAccess;
  } catch {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    return null; // <- no redirect here
  }
};

// Auth microservice (LOGIN WILL WORK)
const axiosInstance = axios.create({
  baseURL: `https://konstruct.world/users/`, 
  // baseURL: `http://${LOCAL_IP}:8000/api`, 
});

// Project microservice (OTHER SERVICES - ASK FRIEND FOR PORTS)
export const projectInstance = axios.create({
  baseURL: `https://konstruct.world/projects/`,
  // baseURL: `http://${LOCAL_IP}:8001/api/`,
});


export const organnizationInstance = axios.create({
  baseURL: `https://konstruct.world/organizations/`,
  // baseURL: `http://${LOCAL_IP}:8002/api/`,
});

export const checklistInstance = axios.create({
  baseURL: `https://konstruct.world/checklists/`,
  timeout: 45000,
  // baseURL: `http://${LOCAL_IP}:8003/api/`,
});

export const NEWchecklistInstance = axios.create({
  baseURL: `https://konstruct.world/checklists/`,
  timeout: 45000,
  // baseURL: `http://${LOCAL_IP}:8003/api/`,
});

// Attach token to every request
const attachTokenInterceptor = (instance) => {
 instance.interceptors.request.use(
  (config) => {
    if (loggingOutFlag()) {
      // hard-cancel any in-flight/new requests during logout
      throw new axios.Cancel("Request aborted: logging out");
    }
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isCancel(error)) {
      return new Promise(() => {}); // silently ignore
    }
  const originalRequest = error.config || {};
  const status = error?.response?.status;
  const isRefreshCall = String(originalRequest?.url || "").includes("token/refresh");

  if (status === 401 && !originalRequest._retry && !isRefreshCall && !loggingOutFlag()) {
    originalRequest._retry = true;
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return instance(originalRequest);
    }
  }

  if (status === 401) {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
  }
  return Promise.reject(error);
}

    
  );
};

attachTokenInterceptor(axiosInstance);
attachTokenInterceptor(projectInstance);
attachTokenInterceptor(organnizationInstance);
attachTokenInterceptor(checklistInstance);
attachTokenInterceptor(NEWchecklistInstance);
export default axiosInstance;
