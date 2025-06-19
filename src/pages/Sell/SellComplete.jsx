import { useState } from 'react';
import styles from './SellComplete.module.css';
import checkIcon from '../../assets/icon-check.png'
import HoverEventButton from '../../component/button/HoverEventButton';
import { useNavigate } from 'react-router-dom';

export default function SellComplete() {
    const navigate = useNavigate();

    const finishOnclick = () => {
        navigate('/home');
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.content}>
                <div className={styles.innerContent}>
                    <div className={styles.topRow}>
                        <img src={checkIcon} alt='check icon' className={styles.centerIcon}/>
                    </div>

                    <div className={styles.stepDescription}>
                        <div className={styles.titleText}>판매 신청 완료!</div>
                        <div className={styles.subText}>상품 사진 판독 후 상품 수거가 진행됩니다.</div>
                    </div>
                </div>
            </div>

            <div className={styles.fixedButtonWrapper}>
                <div className={styles.buttonGroup}>
                <HoverEventButton
                        text="판매 내역 확인하기"
                        width="w-full"
                        height="h-12"
                        color="black"
                        onClick={finishOnclick}
                    />
                </div>
            </div>
        </div>
    )
}