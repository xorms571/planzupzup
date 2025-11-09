/* eslint-disable */
"use client";

import { ChangeEvent, SetStateAction, useEffect, useRef, useState } from "react";
import style from "./LocationDetail.module.scss";
import axios from "axios";
import classNames from "classnames";
import Flicking from "@egjs/react-flicking";
import { Location } from "@/app/page";

type TProps = {
    locationId: string;
    setIsShowModal: React.Dispatch<SetStateAction<boolean>>;
    isEdit?: boolean;
    day: number;
    setTotalLocationList? : React.Dispatch<React.SetStateAction<Location[][]>>;
    locationIndex: number;
    totalLocationList: Location[][];
}

const LocationDetail = ({ locationId, totalLocationList, setIsShowModal, isEdit, day, setTotalLocationList, locationIndex}:TProps) => {

    const [location, setLocation] = useState<Location | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [editedDescription, setEditedDescription] = useState<string>("");
    const [inputImages, setInputImages] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
        if(e.target.files[0].size > (10 * 1024 * 1024)) {
            alert("10MB 미만 크기의 파일만 업로드 가능합니다.");
            return;
        }

        const selectedFile = e.target.files[0];

        setSelectedFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[index] = selectedFile;
            return newFiles;
        });
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setInputImages((prevInputImages) => {
                const newInputImages = [...prevInputImages];
                newInputImages[index] = reader.result as string;
                return newInputImages;
            });
        };
        reader.readAsDataURL(selectedFile);
    }
};

    const flickingRef = useRef<Flicking>(null);

    const easing = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;


    const goToPrev = () => {
        flickingRef.current?.prev();
    };

    const goToNext = () => {
        flickingRef.current?.next();
    };

    useEffect(() => {
        if(day >= 0 ) {
            setLocation(totalLocationList[day][locationIndex-1]);
            setEditedDescription(totalLocationList[day][locationIndex-1].description || "");
        }
    },[]);

    const onClickSaveBtn = async () => {
        try {
            if (setTotalLocationList && day !== undefined && day >= 0) {
                
                const uploadPromises = selectedFiles.map(async (file, index) => {
                    if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        const uploadResponse = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                        });
    
                        if (!uploadResponse.ok) {
                            throw new Error('Image upload failed.');
                        }
    
                        const res = await uploadResponse.json();
                        return { index, url: res.url };
                    }
                    return null;
                });
    
                const uploadedImages = await Promise.all(uploadPromises);

                console.log(uploadedImages);
    
                setTotalLocationList(prevTotalLocationList => {
                    const newTotalLocationList = prevTotalLocationList.map(dayLocations => [...dayLocations]);
                    const targetLocation = { ...newTotalLocationList[day][locationIndex-1]};
                    
                    uploadedImages.forEach(img => {
                        if (img && targetLocation.images) {
                            targetLocation.images[img.index] = img.url;
                        }
                    });
    
                    targetLocation.description = editedDescription;
                    newTotalLocationList[day][locationIndex-1] = targetLocation;
                    return newTotalLocationList;
                });
            }
            setIsShowModal(false);
    
        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장에 실패했습니다.");
        }
    };

    return (
        <div className={style.dimmed_layer} onClick={() => {setIsShowModal(false);}}>
            <div className={style.modal} onClick={(e) => {e.stopPropagation();}}>
                <div className={style.top}>
                    <span className={style.day}>{location?.scheduleOrder}일차</span>
                    <strong className={style.title}>{location?.locationName}</strong>
                    <span className={classNames(style.category, style.type_tourist)}>{location?.types}관광명소</span>
                    <button type="button" onClick={() => {setIsShowModal(false);}} className={style.close_btn}><span className="blind">닫기</span></button>
                </div>
                <div className={style.flicking_wrap}>
                    <Flicking
                            ref={flickingRef}
                            align="prev"
                            bound={true}
                            onChanged={e => setCurrentIndex(e.index)}
                            easing={easing}
                            duration={600}
                        >
                        <div className={classNames(style.img_wrap, {[style.is_edit] : isEdit})}>
                            {isEdit && <><span className={style.badge_editable}><span className="blind">이미지 수정</span></span><input type="file" className="blind" id="upload_image_1" onChange={(e)=> handleFileChange(e, 0)} accept="image/*"/><label className={style.upload_btn} htmlFor="upload_image_1"></label></>}
                            { (location?.images?.[0] || inputImages[0]) && <img className={style.img} src={inputImages[0] || location?.images?.[0]} alt="업로드 이미지"/>}
                        </div>
                        <div className={classNames(style.img_wrap, {[style.is_edit] : isEdit})}>
                            {isEdit && <><span className={style.badge_editable}><span className="blind">이미지 수정</span></span><input type="file" className="blind" id="upload_image_2" onChange={(e) => handleFileChange(e, 1)} accept="image/*" /><label className={style.upload_btn} htmlFor="upload_image_2"></label></>}
                            { (location?.images?.[1] || inputImages[1]) && <img className={style.img} src={inputImages[1] || location?.images?.[1]} alt="업로드 이미지2"/>}
                        </div>
                        <div className={classNames(style.img_wrap, {[style.is_edit] : isEdit})}>
                            {isEdit && <><span className={style.badge_editable}><span className="blind">이미지 수정</span></span><input type="file" className="blind" id="upload_image_3"  onChange={(e) => handleFileChange(e,2)} accept="image/*"/><label className={style.upload_btn} htmlFor="upload_image_3"></label></>}
                            { (location?.images?.[2]|| inputImages[2]) && <img className={style.img} src={inputImages[2] || location?.images?.[2]} alt="업로드 이미지3"/>}
                        </div>
                    </Flicking>
                    <button type="button" className={style.prev_btn} onClick={goToPrev}>
                        <span className="blind">이전</span>
                    </button>
                    <button type="button" className={style.next_btn} onClick={goToNext}>
                        <span className="blind">다음</span>
                    </button>
                </div>
                <div className={style.dot_wrap}>
                    {Array.from({ length: 3 }, (_, index) => (
                        <span
                            key={index}
                            className={classNames(style.dot, { [style.is_active]: index === currentIndex })}
                        ></span>
                    ))}
                </div>
                {isEdit ? <textarea className={style.textarea} value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} placeholder={"사진과 함께, 이곳의 여행 이야기를 들려주세요"}></textarea> : <div className={style.desc_wrap}><p className={style.desc}>{location?.description}</p></div>}
                {isEdit && <button type="button" className={style.save_btn} onClick={onClickSaveBtn}>저장</button>}
            </div>
        </div>
    )
}

export default LocationDetail;