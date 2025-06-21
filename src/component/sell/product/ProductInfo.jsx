import styles from './ProductInfo.module.css';
import AddIcon from '../../../assets/icon-add.png';
import { useEffect, useRef, useState } from 'react';
import BottomSheetModal from '../../modal/BottomSheetModal';
import BrandAndCategorySelect from './BrandAndCategorySelect';
import BrandSelect from './BrandSelect';
import CategorySelect from './CategorySelect';

import { getBrandList } from '../../../api/brand';
import { getCategoryList } from '../../../api/category';
import { formatNumberWithComma } from '../../../util/FormatNumberWithComma';

export default function ProductInfo({ brand, setBrand, category, setCategory }){
    const isEmpty = !brand || Object.keys(brand).length === 0;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('select'); // 'select', 'brand', 'category' 로 모달 컴포넌트 선택됨
    const [brandList, setBrandList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [point, setPoint] = useState('25,000');
    const modalRef = useRef(null); // 모달창 열고 닫기 애니메이션을 위한 ref

    // brandSelect, categorySelect 의 선택 임시 저장용
    const [tempBrand, setTempBrand] = useState(null);
    const [tempCategory, setTempCategory] = useState(null);

    const handleBrandClick = () => setModalContent('brand');
    const handleCategoryClick = () => setModalContent('category');
    const handleOpen = () => {
        setModalContent('select');
        setIsModalOpen(true);
        setTempBrand(null);
        setTempCategory(null);
        setBrand(null);
        setCategory(null);
    };
    const handleClose = () => setIsModalOpen(false);

    // ✅ 모달 외부에서 닫기 trigger 예시
    const forceCloseModal = () => {
        if (modalRef.current) {
            modalRef.current.triggerClose(); // 애니메이션 포함 닫힘
        }
    };

    // 모달 내 보여질 컴포넌트 선택
    const renderModalContent = () => {
        switch (modalContent) {
            case 'brand':
                return <BrandSelect 
                    onBack={() => setModalContent('select')} 
                    setBrand={setTempBrand} 
                    brandList={brandList} />;
            case 'category':
                return <CategorySelect 
                    onBack={() => setModalContent('select')} 
                    setCategory={setTempCategory} 
                    categoryList={categoryList} />;
            case 'select':
            default:
                return (
                    <BrandAndCategorySelect
                        brand={tempBrand || brand}
                        category={tempCategory || category}
                        onBrandClick={handleBrandClick}
                        onCategoryClick={handleCategoryClick}
                        onClose={handleConfirmSelection}
                    />
                );
        }
    };

    // 선택 완료 버튼 클릭시 기존 brand, category 반영
    const handleConfirmSelection = () => {
        if (tempBrand) setBrand(tempBrand);
        if (tempCategory) setCategory(tempCategory);
        forceCloseModal();
    };

    // 브랜드 목록 가져오는 api 통신
    useEffect(() => {
        getBrandListHandler();
    }, [])

    useEffect(() => {
        if(tempBrand){
            getCategoryListHandler();
        } else {
            setCategoryList([]);
        }
    }, [tempBrand])

    /**
     * api 통신
     * 1. 브랜드 목록 가져오기
     * 2. 브랜드 목록에 포함된 카테고리 목록 가져오기
     */
    const getBrandListHandler = async () => {
        try {
            const data = await getBrandList();
            setBrandList(data);
        } catch (err) {
            console.log(err);
        }
    }

    const getCategoryListHandler = async() => {
        try{
            const data = await getCategoryList(tempBrand.brandId);
            setCategoryList(data);
        } catch(err) {
            console.log(err);
        }
    }

    return(
        <div className={styles.container}>
            {isEmpty ? (
                <div className={styles.emptyBox} onClick={handleOpen}>
                    <img src={AddIcon} alt="상품 없음" className={styles.addIcon} />
                </div>
            ) : (
                <div className={styles.productBox} onClick={handleOpen}>
                    <div className={styles.productInfo}>
                            <div className={styles.brandName}>{brand.name} {brand.nameEn}</div>
                        <div className={styles.categoryName}>{category.mainCategoryName} / {category.subCategoryName}</div>
                    </div>
                    <div className={styles.pointInfo}>
                        <span className={styles.pointInfoText}>예상 H.Point : </span><span className={styles.pointScoreText}>{ formatNumberWithComma(category.point)}P</span>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <BottomSheetModal ref={modalRef} onClose={handleClose}>
                    {renderModalContent()}
                </BottomSheetModal>
            )}
        </div>
    )
}