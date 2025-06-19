import { useEffect, useState, useRef } from 'react';
import notificationIconImg from '../../assets/icon-notification-bell.png';
import styles from './NotificationIcon.module.css';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState } from '../../atoms/authState';
import api from '../../api/axiosInstance';
import { userState } from '../../atoms/userState';
import { connectSSE } from '../../util/ConnectSSE';
import { setupSSE } from '../../api/setupSSE';

export default function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { accessToken } = useRecoilValue(authState);
  const auth = useRecoilValue(authState);
  const setAuth = useSetRecoilState(authState);
  const setUser = useSetRecoilState(userState);

  const accessTokenRef = useRef(auth.accessToken); 

 useEffect(() => {
    accessTokenRef.current = auth.accessToken;
  }, [auth.accessToken]);


  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.response);
      } catch (e) {
        console.error('알림 수 조회 실패:', e);
      }
    };

    let eventSource;
    let reconnectTimer;

    const handleConnect = async () => {
       const token = accessTokenRef.current;
      const userId = JSON.parse(atob(accessToken.split('.')[1])).sub;

      eventSource = connectSSE(
        accessToken,
        userId,
        fetchUnreadCount,
        (readIds) => {
          setUnreadCount((prev) => Math.max(0, prev - readIds.length));
        }
      );

      eventSource.onerror = async () => {
        eventSource.close();
        try {
          await setupSSE(setAuth, setUser);
          reconnectTimer = setTimeout(() => handleConnect(), 1000);
        } catch (e) {
          console.error('SSE 재연결 실패:', e);
        }
      };
    };

    fetchUnreadCount();
    handleConnect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.iconButton}
        onClick={() => window.location.href = '/notifications'}
      >
        <img src={notificationIconImg} alt="alarm" className={styles.icon} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
    </div>
  );
}
