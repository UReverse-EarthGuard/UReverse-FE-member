import api from '../api/axiosInstance';
import { authState } from '../atoms/authState';
import { userState } from '../atoms/userState';

export const setupSSE = async (setAuth, setUser) => {
  try {
    const res = await api.get('/auth/refresh'); // accessToken 재발급 유도

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
    throw e;
  }
};
