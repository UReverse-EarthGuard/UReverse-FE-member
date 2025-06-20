import axios from 'axios';

export const setupSSE = async (setAuth, setUser) => {
  
  const refreshAxios = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL + '/api/v1',
    withCredentials: true,
  });

  try {
    const res = await refreshAxios.get('/auth/refresh'); // accessToken 재발급 유도

    const { accessToken, role } = res.data.response;

    // Recoil 상태 갱신
    setAuth((prev) => ({
      ...prev,
      accessToken,
      role,
    }));

    setUser((prev) => ({
      ...prev,
      role,
      isLoggedIn: true,
    }));
  } catch (e) {
    console.error('SSE용 토큰 재발급 실패', e);
    window.location.reload(); 
  }
};
