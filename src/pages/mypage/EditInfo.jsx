import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { userState } from '../../atoms/userState';
import LoginInput from '../../component/input/LoginInput';
import HoverEventButton from '../../component/button/HoverEventButton';
import ConfirmModal from '../../component/modal/MessageModal';
import styles from './EditInfo.module.css';
import {
    updateMemberInfo,
    deleteMember,
    getMyInfo,
    changePassword
} from '../../api/member';
import KakaoLinkButton from '../../component/button/KakaoLinkButton';
import { authState } from '../../atoms/authState';

export default function EditInfo() {
    const user = useRecoilValue(userState);
    const setUser = useSetRecoilState(userState);
    const setAuth = useSetRecoilState(authState);
    const navigate = useNavigate();

    const [email, setEmail] = useState(user.email || '');
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [password, setPassword] = useState('');
    const [emailChanged, setEmailChanged] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);

    const [showChangePwForm, setShowChangePwForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordCheck, setNewPasswordCheck] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await getMyInfo();
                const {
                    userId,
                    email,
                    name,
                    phone,
                    role,
                    productStatus,
                } = res;

                setUser({
                    userId,
                    email,
                    name,
                    phone,
                    role,
                    isLoggedIn: true,
                    productStatus,
                });

                setEmail(email);
                setName(name);
                setPhone(phone);
            } catch (err) {
                console.error("회원 정보 조회 실패", err);
            }
        };

        // user.email이 비어 있을 때만 fetch
        if (!user.email) {
            fetchUserInfo();
        }
    }, []);


    useEffect(() => {
        setEmailChanged(email !== user.email);
    }, [email, user.email]);

    const handleUpdate = async () => {
        try {
            if (emailChanged && !password) {
                setModalMessage('이메일을 변경하려면 비밀번호를 입력하세요.');
                setShowErrorModal(true);
                return;
            }

            const payload = {
                email,
                name,
                phone,
                ...(emailChanged && { password }),
            };

            await updateMemberInfo(payload);

            const res = await getMyInfo();
            const {
                userId,
                email: updatedEmail,
                name: updatedName,
                phone: updatedPhone,
                role,
                productStatus,
            } = res;

            setUser({
                userId,
                email: updatedEmail,
                name: updatedName,
                phone: updatedPhone,
                role,
                isLoggedIn: true,
                productStatus,
            });

            setModalMessage('회원 정보가 수정되었습니다.');
            setShowSuccessModal(true);
        } catch (err) {
            setModalMessage('회원 정보 수정에 실패했습니다.');
            setShowErrorModal(true);
            console.error(err);
        }
    };

    const handleDelete = () => {
        setConfirmPassword('');
        setShowModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteMember(confirmPassword);
            setUser({
                userId: null,
                email: '',
                name: '',
                phone: '',
                role: '',
                isLoggedIn: false,
                productStatus: {
                    '상품 등록': 0,
                    '1차 검수': 0,
                    '2차 검수': 0,
                    '배송 요청 등록': 0,
                    '배송 중': 0,
                    '배송 완료': 0,
                },
            });
            setAuth({
                accessToken: null,
                role: null,
            });

            setShowModal(false);
            navigate('/signup');
        } catch (err) {
            setShowModal(false);
            setModalMessage('비밀번호가 올바르지 않거나 권한이 없습니다.');
            setShowErrorModal(true);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== newPasswordCheck) {
            setModalMessage('새 비밀번호가 일치하지 않습니다.');
            setShowErrorModal(true);
            return;
        }

        try {
            await changePassword({ currentPassword, newPassword });
            setModalMessage('비밀번호가 변경되었습니다.');
            setShowSuccessModal(true);
            setShowChangePwForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordCheck('');
        } catch (err) {
            setModalMessage(
                err.response?.data?.errorMessage || '비밀번호 변경에 실패했습니다.'
            );
            setShowErrorModal(true);
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
            <div className={styles.formBox}>
                <div className={styles.pageTitle}>내 정보 확인하기</div>

                <div className={styles.form}>
                    <LoginInput
                        type="email"
                        id="email"
                        label="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        isFocused={focusedInput === 'email'}
                    />

                    {emailChanged && !showPasswordCheck && (
                        <HoverEventButton
                            className={`${styles.actionButton} ${styles.passwordCheckButton}`}
                            text="비밀번호 확인하기"
                            onClick={() => setShowPasswordCheck(true)}
                            color="black"
                        />
                    )}

                    {emailChanged && showPasswordCheck && (
                        <LoginInput
                            type="password"
                            id="password"
                            label="비밀번호 확인"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            isFocused={focusedInput === 'password'}
                        />
                    )}

                    <LoginInput
                        type="text"
                        id="name"
                        label="이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedInput('name')}
                        onBlur={() => setFocusedInput(null)}
                        isFocused={focusedInput === 'name'}
                    />
                    <LoginInput
                        type="text"
                        id="phone"
                        label="휴대폰 번호"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        onFocus={() => setFocusedInput('phone')}
                        onBlur={() => setFocusedInput(null)}
                        isFocused={focusedInput === 'phone'}
                    />

                    {showChangePwForm && (
                        <>
                            <LoginInput
                                type="password"
                                label="현재 비밀번호"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onFocus={() => setFocusedInput('curPw')}
                                onBlur={() => setFocusedInput(null)}
                                isFocused={focusedInput === 'curPw'}
                            />
                            <LoginInput
                                type="password"
                                label="새 비밀번호"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onFocus={() => setFocusedInput('newPw')}
                                onBlur={() => setFocusedInput(null)}
                                isFocused={focusedInput === 'newPw'}
                            />
                            <LoginInput
                                type="password"
                                label="새 비밀번호 확인"
                                value={newPasswordCheck}
                                onChange={(e) => setNewPasswordCheck(e.target.value)}
                                onFocus={() => setFocusedInput('newPwCheck')}
                                onBlur={() => setFocusedInput(null)}
                                isFocused={focusedInput === 'newPwCheck'}
                            />
                        </>
                    )}
                </div>


                <div className={styles.kakaoLinkArea}>
                    {user.kakaoLinked ? (
                        <button className={styles.kakaoLinkedButton} disabled>
                            <span className={styles.kakaoLabel}>카카오 계정 연동 완료</span>
                        </button>
                    ) : (
                        <KakaoLinkButton />
                    )}
                </div>

                <div className={styles.buttonArea}>
                    <HoverEventButton
                        className={styles.actionButton}
                        text="수정"
                        onClick={handleUpdate}
                        color="black"
                    />
                    {!showChangePwForm && (
                        <HoverEventButton
                            className={styles.actionButton}
                            text="비밀번호 변경하기"
                            onClick={() => setShowChangePwForm(true)}
                            color="#eeeeee"
                        />
                    )}
                    {showChangePwForm && (
                        <HoverEventButton
                            className={styles.actionButton}
                            text="비밀번호 변경 완료"
                            onClick={handleChangePassword}
                            color="black"
                        />
                    )}
                    <HoverEventButton
                        className={styles.actionButton}
                        text="회원탈퇴"
                        onClick={handleDelete}
                        color="#eeeeee"
                    />
                </div>
            </div>

            {/* 탈퇴 확인 모달 */}
            <ConfirmModal
                visible={showModal}
                message={'정말 탈퇴하시겠습니까?'}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmDelete}
                password={confirmPassword}
                setPassword={setConfirmPassword}
                showPasswordInput={true}
            />

            {/* 실패 모달 */}
            <ConfirmModal
                visible={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                onConfirm={() => setShowErrorModal(false)}
                password=""
                setPassword={() => { }}
                isErrorOnly={true}
                message={modalMessage}
            />

            {/* 성공 모달 */}
            <ConfirmModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate('/home');
                }}
                onConfirm={() => {
                    setShowSuccessModal(false);
                    navigate('/home');
                }}
                password=""
                setPassword={() => { }}
                isErrorOnly={true}
                message={modalMessage}
            />
        </div>
    );
}