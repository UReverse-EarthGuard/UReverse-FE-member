import { useRef, useState } from "react";
import SellPreviewModal from "../../component/sellPreview/SellPreviewModal";
import BlackWarningIcon from "../../assets/icon-warning-black.png";
import styles from "./ProductInfoForm.module.css";
import HoverEventButton from "../../component/button/HoverEventButton";
import PictureNotice from '../../component/sellNotice/PictureNotice';
import SellConfirmNotice from "../../component/sellNotice/SellConfirmNotice";
import { useRecoilState } from "recoil";
import { sellFormState } from "../../atoms/sellFormState";
import { useNavigate } from "react-router-dom";
import ProductInfo from "../../component/sell/product/ProductInfo";
import ProductPicture from "../../component/sell/product/ProductPicture";
import { formatNumberWithComma } from '../../util/FormatNumberWithComma';

export default function ProductInfoForm(){
    const navigate = useNavigate();
    const [formData, setFormData] = useRecoilState(sellFormState); // 전역적으로 입력한 판매 데이터 관리

    const [isModalOpen, setIsModalOpen] = useState(true);
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState({categoryId: '', mainCategoryName: '', subCategoryName: ''});
    const [pictureList, setPictureList] = useState([]);
    const [hasSeenPictureNotice, setHasSeenPictureNotice] = useState(false); // 사진등록 안내 모달 최초 한번 열기위한 상태변수

    // 사진 등록 안내 모달 오픈변수
    const [isPictureNoticeModalOpen, setIsPictureNoticeModalOpen] = useState(false);
    // 상품정보입력 완료 안내 모달 오픈변수
    const [isSellConfirmModalOpen, setIsSellConfirmModalOpen] = useState(false);

    // 사진 등록 트리거
    const fileInputRef = useRef(null);

    const handleOpenImagePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 사진등록 모달 닫기
    const handlePictureNoticeSelection = () => {
        setIsPictureNoticeModalOpen(false); // 모달 닫기
        setHasSeenPictureNotice(true); // 이제부터는 모달 생략
        handleOpenImagePicker();     // 사진 등록으로 이어짐
    };

    // 상품 등록완료 모달 닫기. 주소입력으로 이동
    const handleConfirmNoticeSelection = () => {
        setIsSellConfirmModalOpen(false);
        setFormData(prev => ({
            ...prev,
            product: {
                brand,
                category,
                images: pictureList,
            }
            }));
            navigate('/sell/address');
    }

    const handleOpenPictureNoticeModal = () => {
        if (!hasSeenPictureNotice) {
            setIsPictureNoticeModalOpen(true); // 첫 클릭이면 모달 열기
        } else {
            handleOpenImagePicker(); // 그 이후는 바로 input 열기
        }
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.content}>
                <div className={styles.alertBar} onClick={() => setIsModalOpen(true)}>
                    <img src={BlackWarningIcon} className={styles.alertIcon} alt="인포 아이콘"></img>
                    판매 가능 조건 다시 확인하기
                </div>
                <div className={styles.innerContent}>
                    <div className={styles.processBar}>
                        <div className={styles.doneProcessBar}></div>
                        <div className={styles.noneProcessBar}></div>
                        <div className={styles.noneProcessBar}></div>
                    </div>
                    <div className={styles.stepDescription}>
                        <p>
                            Step.1<br/>
                            판매할 상품의 정보를<br/>
                            추가해 주세요!
                        </p>
                    </div>

                    <div className={styles.productListArea}>
                        <ProductInfo
                            brand={brand}
                            setBrand={setBrand}
                            category={category}
                            setCategory={setCategory}
                        />
                    </div>

                    <div className={styles.imagePreviewContainer}>
                        <ProductPicture pictureList={pictureList} setPictureList={setPictureList}/>
                        {/* map 으로 state에 저장된 이미지 링크 컴포넌트에 전송, 링크는 아래의 사진 등록 버튼 누르면 state 에 저장 */}
                    </div>
                </div>
            </div>

            <div className={styles.fixedButtonWrapper}>
                <div className={styles.buttonGroup}>
                    <HoverEventButton
                        text={`+ 사진 추가 (${pictureList.length}/3)`}
                        width="w-full"
                        height="h-12"
                        color="black"
                        onClick={handleOpenPictureNoticeModal}
                        disabled={pictureList.length >= 3}
                    />
                    <HoverEventButton
                        text={
                            category && category.point
                                ? `${formatNumberWithComma(category.point)}p 보상받기`
                                : '보상받기'
                        }
                        width="w-full"
                        height="h-12"
                        color="green"
                        onClick={() => setIsSellConfirmModalOpen(true)}
                        disabled={!brand ||
                            category.length === 0 ||
                            pictureList.length < 2}
                    />
                </div>
            </div>

            {isModalOpen && <SellPreviewModal onClose={() => setIsModalOpen(false)} />}
            {isPictureNoticeModalOpen && (<PictureNotice onClose={handlePictureNoticeSelection} />)}
            {isSellConfirmModalOpen && (<SellConfirmNotice onClose={handleConfirmNoticeSelection} />)}

            {/* 파일 업로드 영역 */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    
                    if (!file) return;

                    if (pictureList.length >= 3) {
                        alert("최대 3장까지 등록할 수 있습니다.");
                        return;
                    }
                
                    const newImage = {
                        file,
                        preview: URL.createObjectURL(file),
                    };
                
                    setPictureList(prev => [...prev, newImage]);
                
                    // 선택한 파일 초기화 (같은 파일 다시 등록 가능하게)
                    e.target.value = '';
                }}
            />
        </div>
    )
}