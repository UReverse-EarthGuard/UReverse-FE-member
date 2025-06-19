import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InfoModal from '../../component/modal/InfoModal';

function KakaoLinkCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const isSuccess = query.get('success') === 'true';
    setSuccess(isSuccess);
    setShowModal(true);
  }, [location.search]);

  const handleClose = () => {
    setShowModal(false);
    navigate('/mypage/edit'); // 모달 닫으면 마이페이지로 이동
  };

  return (
    <>
      {showModal && (
        <InfoModal
          title={success ? '카카오 연동 성공' : '카카오 연동 실패'}
          message={
            success
              ? '카카오 계정 연동이 완료되었습니다.'
              : '다시 시도해 주세요.'
          }
          onClose={handleClose}
        />
      )}
    </>
  );
}

export default KakaoLinkCallback;
