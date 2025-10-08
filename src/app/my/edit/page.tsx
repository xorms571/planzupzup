"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import style from "./MyEdit.module.scss";
import axios from "axios";
import { TProfile } from "../page";

const Edit = () => {

    const [profile, setProfile] = useState<TProfile|null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [inputImage, setInputImage] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            const data = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/my-page`, {withCredentials: true});
            setProfile(data.data.result);
        } catch(e) {
            console.log(e);
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if(e.target.files[0].size > (10 * 1024 * 1024)) {
                alert("10MB 미만 크기의 파일만 업로드 가능합니다.");
                return;
            }
    
            const selectedFile = e.target.files[0];
    
            setFile(selectedFile);
            
            const reader = new FileReader();

            reader.onloadend = () => {
                setInputImage(reader.result as string);
            };

            reader.readAsDataURL(selectedFile);
        }
    };

    const onClickSaveBtn = async () => {
        try {
            const formData = new FormData();

            if (profile?.nickName && profile?.nickName.length < 4) {
                alert("닉네임은 반드시 4글자 이상입니다.");
            }

            const data = {
                nickName: profile?.nickName,
                description: profile?.description
            };

            const dto = JSON.stringify(data);

            const blob = new Blob([dto], { type: "application/json" }); 

            formData.append("memberReqDto", blob);

            if (file) {
                formData.append('file', file);
            }

            await axios.put(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/my-page`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            window.location.href="/my";
        } catch (error) {
            console.error("마이페이지 수정 실패:", error);
            alert("수정에 실패했습니다.");
        }
    };

    const onChangeNickName = (e: ChangeEvent<HTMLInputElement>) => {
        setProfile((prev) => {
            if(prev) {
                const temp = {...prev};
                temp.nickName = e.target.value;
                return temp;
            } else {
                return null;
            }
        })
    }

    const onChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
        setProfile((prev) => {
            if(prev) {
                const temp = {...prev};
                temp.description = e.target.value;
                return temp;
            } else {
                return null;
            }
        })
    }

    const onClickDeleteBtn = () => {
        setFile(null);
        setInputImage(null);
        setProfile(prev => {
            if(prev)
                return {...prev, image: null};
            else
                return null;
        })
    }

    useEffect(() => {
        fetchProfile();
        document.body.style.height = 'auto';
    },[]);

    return (
        <div className={style.my_edit}>
            <div className={style.image_area}>
                <span className={style.thumb_wrap}>
                    {(inputImage || profile?.image) && <img className={style.img} src={inputImage || profile?.image || undefined} alt="업로드 프로필 이미지" />}
                </span>
                <div className={style.btn_wrap}>
                    <label htmlFor="image_input">
                    프로필 수정
                    </label>
                    <input className="blind" id="image_input" type="file" accept="image/*" onChange={handleFileChange} />
                    <button type="button" className={style.delete_btn} onClick={onClickDeleteBtn}>삭제</button>
                </div>
            </div>
            <div className={style.info_area}>
                <h2 className={style.head_title}>프로필 수정</h2>
                <div className={style.nickname_wrap}>
                    <label className={style.sub_title} htmlFor="input_nickname">닉네임</label>
                    <input type="text" className={style.nickname} id="input_nickname" onChange={onChangeNickName} value={profile?.nickName} placeholder="닉네임을 입력해주세요."/>
                </div>
                <div className={style.description_wrap}>
                    <label className={style.sub_title} htmlFor="input_description">나의 여행 스타일 한줄 소개</label>
                    <input type="text" className={style.description} id="input_description" onChange={onChangeDescription} value={profile?.description} placeholder="소개가 없습니다."/>
                </div>
                <div className={style.btn_area}>
                    <button type="button" onClick={onClickSaveBtn} >저장</button>
                    <button type="button">취소</button>
                </div>
            </div>
        </div>
    )
}

export default Edit;