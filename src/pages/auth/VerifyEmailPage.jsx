import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InfoModal from '../../component/modal/InfoModal';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    redirect: '',
  });

  useEffect(() => {
    const status = params.get('status');

    if (status === 'success') {
      setModalInfo({
        show: true,
        title: '인증 완료',
        message: '이메일 인증이 완료되었습니다.',
        redirect: '/signup?verified=true',
      });
    } else {
      setModalInfo({
        show: true,
        title: '인증 실패',
        message: '유효하지 않거나 만료된 링크입니다.',
        redirect: '/signup?verified=false',
      });
    }
  }, [params.get('status')]);

  const handleModalClose = () => {
    navigate(modalInfo.redirect);
  };

  return (
    <div>
      이메일 인증 중...
      {modalInfo.show && (
        <InfoModal
          title={modalInfo.title}
          message={modalInfo.message}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
