export const connectSSE = (accessToken, userId, onMessage, onReadUpdate) => {
    const url = `${process.env.REACT_APP_BASE_URL}/api/v1/notifications/subscribe/${userId}?token=${accessToken}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('connect', () => {
        console.log('✅ SSE 연결됨');
    });

    eventSource.addEventListener('notification', () => {
        onMessage(); // fetchUnreadCount 실행
    });

    eventSource.addEventListener('read-update', (event) => {
        const readIds = JSON.parse(event.data); // List<Long> 형태
        onReadUpdate?.(readIds); // 선택적 호출
    });

    eventSource.onerror = (e) => {
        console.warn('❌ SSE 오류, 연결 종료됨', e);
        eventSource.close();
    };

    return eventSource;
};
