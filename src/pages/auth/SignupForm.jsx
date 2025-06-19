import styles from './SignupForm.module.css';
import LoginInput from '../../component/input/LoginInput';
import { useState, useEffect } from 'react';
import { signup } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import InfoModal from '../../component/modal/InfoModal';
import { checkEmailDuplicate, sendVerificationEmail } from '../../api/email';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { signupFormState } from '../../atoms/signupFormState';

export default function SignupForm() {
  const [params] = useSearchParams();
  const [form, setForm] = useRecoilState(signupFormState);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(
    params.get('verified') === 'true'
  );
  const [signupSuccessModalOpen, setSignupSuccessModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
  });
  const navigate = useNavigate();

    // 이메일 인증 완료 시 query param으로 전달된 verified 상태 처리
  useEffect(() => {
    if (params.get('verified') === 'true') {
      setIsEmailVerified(true);
      setIsEmailAvailable(false); // 인증 완료되면 중복확인도 비활성화
    }
  }, [params]);

  const handleCloseModal = () => {
    setModalInfo({ show: false, title: '', message: '' });
  };

  // 이메일 인증 후 돌아왔을 때 form 값을 유지
  useEffect(() => {
    if (params.get('status') === 'success') {
      setIsEmailVerified(true);
    }
  }, [params]);

  // 공통 에러 메시지 처리 함수
  const handleError = (status, message) => {
    setErrorMessage(status === 400 ? message : '회원가입에 실패했습니다.');
    setErrorModalOpen(true);
  };

  const handleSignup = async () => {
    if (!isEmailVerified) {
      alert('이메일 인증을 완료해 주세요.');
      return;
    }
    const res = await signup({ ...form });
    if (res.success) {
      setSignupSuccessModal(true);
    } else {
      const { status, message } = res.error;
      handleError(status, message);
    }
  };

  const handleEmailChange = (e) => {
    setForm((prev) => ({
      ...prev,
      email: e.target.value,
    }));
    setIsEmailAvailable(false);
    setIsEmailVerified(false);
  };

  const handleEmailDuplicateCheck = async () => {
    if (!form.email) {
      return setModalInfo({
        show: true,
        title: '입력 오류',
        message: '이메일을 입력해 주세요.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setModalInfo({
        show: true,
        title: '입력 오류',
        message: '올바른 이메일 형식이 아닙니다.',
      });
    }

    try {
      const available = await checkEmailDuplicate(form.email);
      if (available) {
        setIsEmailAvailable(true);
        setModalInfo({
          show: true,
          title: '중복 확인 성공',
          message: '사용 가능한 이메일입니다.',
        });
      } else {
        setIsEmailAvailable(false);
        setModalInfo({
          show: true,
          title: '중복 확인 실패',
          message: '이미 사용 중인 이메일입니다.',
        });
      }
    } catch {
      setModalInfo({
        show: true,
        title: '중복 확인 오류',
        message: '이메일 중복 확인에 실패했습니다.',
      });
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      await sendVerificationEmail(form.email);
      setModalInfo({
        show: true,
        title: '인증 메일 발송',
        message: '인증 메일이 발송되었습니다. 메일을 확인해 주세요.',
      });
    } catch {
      setModalInfo({
        show: true,
        title: '메일 발송 실패',
        message: '인증 메일 발송에 실패했습니다.',
      });
    }
  };

  const formatPhoneNumber = (value) => {
    return value
      .replace(/[^\d]/g, '')
      .replace(/(\d{3})(\d{1,4})(\d{0,4})/, (_, a, b, c) => {
        return b ? (c ? `${a}-${b}-${c}` : `${a}-${b}`) : a;
      })
      .slice(0, 13);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.brand}>U:REVERSE</h1>
        <p className={styles.sub}>당신의 옷, 다시 가치 있게</p>

        <div className={styles.form}>
          <LoginInput
            type="name"
            id="name"
            label="이름"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
            isFocused={focusedInput === 'name'}
          />

          <LoginInput
            type="email"
            id="email"
            label="이메일"
            value={form.email}
            onChange={handleEmailChange}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            isFocused={focusedInput === 'email'}
          />

          <div className={styles.emailButtonGroup}>
            <button
              className={styles.cta}
              onClick={handleEmailDuplicateCheck}
              disabled={isEmailAvailable || isEmailVerified}
            >
              중복확인
            </button>
            <button
              className={styles.secondary}
              onClick={handleSendVerificationEmail}
               disabled={!form.email || !isEmailAvailable || isEmailVerified}
               >
              인증 메일 전송
            </button>
          </div>

          <LoginInput
            type="password"
            id="password"
            label="비밀번호"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            isFocused={focusedInput === 'password'}
          />

          <LoginInput
            type="phone"
            id="phone"
            label="전화번호"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                phone: formatPhoneNumber(e.target.value),
              }))
            }
            onFocus={() => setFocusedInput('phone')}
            onBlur={() => setFocusedInput(null)}
            isFocused={focusedInput === 'phone'}
          />

          <button
            className={styles.secondary}
            onClick={handleSignup}
             disabled={!isEmailVerified}
          >
            가입하기
          </button>

          <div className={styles.signupLink}>
            이미 계정이 있으신가요?&nbsp;
            <span onClick={() => navigate('/login')}>로그인</span>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {modalInfo.show && (
        <InfoModal
          title={modalInfo.title}
          message={modalInfo.message}
          onClose={() => setModalInfo({ show: false, title: '', message: '' })}
        />
      )}
      {errorModalOpen && (
        <InfoModal
          title="회원가입 실패"
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
        />
      )}
      {signupSuccessModalOpen && (
        <InfoModal
          title="회원가입 성공"
          message="로그인 화면으로 이동합니다."
          onClose={() => {
            setSignupSuccessModal(false);
            setForm({ name: '', email: '', password: '', phone: '' });
            navigate('/login');
          }}
        />
      )}
    </div>
  );
}
