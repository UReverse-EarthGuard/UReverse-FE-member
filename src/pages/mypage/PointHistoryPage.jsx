import { useEffect, useState, useRef } from 'react';
import { fetchPointHistory } from '../../api/point';
import PointHistoryList from '../../component/mypage/point/PointHistoryList';
import styles from './PointHistoryPage.module.css';

const PointHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [totalPoint, setTotalPoint] = useState(0);
  const [cursor, setCursor] = useState({ lastCreatedAt: null, lastProductId: null });
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const {
        pointHistory,
        totalPoint,
        lastCreatedAt,
        lastProductId,
      } = await fetchPointHistory(cursor);

      if (!Array.isArray(pointHistory)) {
        throw new Error('Invalid response format');
      }

      setHistory((prev) => {
        const productIds = new Set(prev.map((item) => item.productId));
        const newItems = pointHistory.filter((item) => !productIds.has(item.productId));
        return [...prev, ...newItems];
      });

      setCursor({ lastCreatedAt, lastProductId });
      setTotalPoint(totalPoint ?? 0);
    } catch (err) {
      console.error('포인트 내역 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerBox}>
        <div className={styles.title}>포인트 내역</div>

        <div className={styles.totalCard}>
          <div className={styles.label}>총 포인트:</div>
          <div className={styles.total}>{totalPoint.toLocaleString()}P</div>
        </div>

        <div className={styles.historyCard}>
          <PointHistoryList history={history} />
          <div ref={observerRef} className={styles.observer} />
        </div>
      </div>
    </div>
  );
}

export default PointHistoryPage;