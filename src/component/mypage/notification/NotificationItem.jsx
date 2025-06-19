import styles from './NotificationItem.module.css';

export default function NotificationItem({ data }) {

    return (
        <div className={styles.card}>
            <div className={styles.titleRow}>
                <div className={`${styles.title} ${data.isRead === "N" ? styles.unread : ''}`}>
                    {data.title}
                </div>
                <div className={styles.time}>
                    {data.createdAt?.slice(0, 16).replace('T', ' ') || '시간 정보 없음'}
                </div>
            </div>
            <div className={styles.message}>{data.message}</div>
        </div>
    );
}
