import axios from 'axios';

let navigateToLogin;
let store;

export const setNavigateHandler = (navigateFn) => {
  navigateToLogin = navigateFn;
};

// 전역에서 setRecoilState 접근을 위한 init 함수
export const setAuthStore = (recoilSetter) => {
  store = recoilSetter;
};

// 등록된 store를 가져오는 함수 (LoginForm 등에서 사용)
export const getAuthStore = () => store;

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL + '/api/v1',
  withCredentials: true, // 쿠키 포함 (Spring Security + HTTPS 인증 시 필요)
  // headers: {
  //     'Content-Type': 'application/json',
  // },
});

// accessToken 갱신 처리 상태 및 큐
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터: accessToken 자동 추가
api.interceptors.request.use((config) => {
  const token = store?.getAccessToken?.();
  // console.log('[axios] accessToken:', token);

  // refreshToken 으로 accessToken 재발급 시 헤더 제거
  if (config.url?.includes('/auth/refresh')) {
    if (config.headers?.Authorization) {
      console.log("헤더 제거함");
      delete config.headers.Authorization;
    }
  } else if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData가 아닌 경우에만 Content-Type 설정
  const isFormData = config.data instanceof FormData;
  if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// 응답 에러 시 재발급 → 재시도 or 로그아웃 처리
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    // accessToken 만료, 인증 실패 && 요청이 재시도 된 적 없는 최초의 실패일 경우
    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (error) => reject(error),
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await api.get('/auth/refresh', {
          withCredentials: true,
        });

        const { accessToken, role } = res.data.response;
        store?.setAuth({ accessToken, role });

        processQueue(null, accessToken);

        // 재요청 실행
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // refreshToken 만료 시 로그인으로 보내기
        store?.resetAuth();
        if (navigateToLogin) navigateToLogin('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
