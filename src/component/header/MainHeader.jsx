import { useNavigate } from 'react-router-dom';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { userState } from '../../atoms/userState';
import { authState } from '../../atoms/authState';
import { logout } from '../../api/member'

import NotificationIcon from "../icon/NotificationIcon";
import settingsIcon from "../../assets/icon-settings.png"
import logoutIcon from "../../assets/icon-logout.png"

import styles from "./MainHeader.module.css"

export default function MainHeader() {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState);
  const setAuth = useSetRecoilState(authState);
  const auth = useRecoilValue(authState);

  const handleLogout = async () => {
    try {
      await logout();
      setUser({ isLoggedIn: false });
      setAuth({ accessToken: null, role: null });
      navigate('/');
    } catch (e) {
      console.error('로그아웃 실패:', e);
    }
  };

  const handleLogoClick = () => {
    if (auth?.accessToken) {
      navigate('/home'); // 로그인 유저 → /home
    } else {
      navigate('/');     // 비로그인 유저 → /
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoText} onClick={handleLogoClick}>
        U:REVERSE
      </div>

      <div className={styles.iconGroup}>
        <NotificationIcon />
        <button className={styles.iconButton} onClick={() => navigate('/mypage/edit')}>
          <img src={settingsIcon} alt="마이페이지" />
        </button>
        <button className={styles.iconButton} onClick={handleLogout}>
          <img src={logoutIcon} alt="로그아웃" />
        </button>
      </div>
    </header>
  );
}