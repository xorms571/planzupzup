/* eslint-disable */
"use client";

import { useState } from "react";
import style from "./CreateSearchList.module.scss";
import { Place } from "./CreateSearchList";
import { getKoreanCategory } from "@/app/utils/getKoreanCategory";
import { Location } from "@/app/page";

type TCreateSearchItem = {
    place: Place;
    searchInput: string;
    addSearchItem: (location: Location) => void;
    selectedDay: string;
    searchItemIndex: number;
}

const CreateSearchItem = ({ place, searchInput, addSearchItem, selectedDay, searchItemIndex }: TCreateSearchItem) => {

    const { name, formatted_address, photos, types, rating } = place;
    const [imageUrl, setImageUrl] = useState(
        place.photos && place.photos.length > 0 ? place.photos[0].getUrl() : "",
    );

    const tempLocation: Location = {
        locationName: name,
        googleImageUrl: imageUrl,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        rating: place.rating,
        description: "설명"
    };

    const highlightText = (text: string, highlight: string) => {
        // 검색어가 없거나 공백만 있다면 하이라이트 없이 원본 텍스트 반환
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }

        // 검색어에 정규식 특수 문자가 포함될 경우를 대비하여 이스케이프 처리
        const escapedHighlight = (highlight ?? "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // 정규식 생성: `g`는 전역 검색, `i`는 대소문자 구분 없음
        const regex = new RegExp(`(${escapedHighlight})`, 'gi');
        // 정규식을 사용하여 텍스트를 분할 (캡처 그룹이 있으면 일치하는 부분도 배열에 포함)
        const parts = text.split(regex);

        return (
            <span>
                {parts.map((part, index) =>
                    // 분할된 부분이 정규식에 일치하고 (즉, 검색어에 해당하고) 대소문자 구분 없이 원본 검색어와 같으면
                    regex.test(part) && part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark key={index} className={style.highlight}>{part}</mark> // 하이라이트 스타일을 위한 클래스 추가
                    ) : (
                        <span key={index}>{part}</span> // 그렇지 않으면 일반 텍스트
                    )
                )}
            </span>
        );
    };

    const categoryIcons: Record<string, { src: string; alt: string, color: string }> = {
        관광지: { src: "/category/tour.svg", alt: "tour", color: 'F95353' },
        문화시설: { src: "/category/culture.svg", alt: "culture", color: 'FC8600' },
        "행사/공연/축제": { src: "/category/festival.svg", alt: "festival", color: 'FFE521' },
        여행코스: { src: "/category/trip.svg", alt: "trip", color: '33D900' },
        레포츠: { src: "/category/leisure.svg", alt: "leisure", color: '1FD5F8' },
        숙박: { src: "/category/hotel.svg", alt: "hotel", color: '7A54FF' },
        쇼핑: { src: "/category/shopping.svg", alt: "shopping", color: 'FD347E' },
        음식점: { src: "/category/food.svg", alt: "food", color: '1B07EF' },
    };

    const category = (name: string) => {
        const src = categoryIcons[name].src;
        const alt = categoryIcons[name].alt;
        const color = categoryIcons[name].color;
        return (
            <span className={style.category} style={{ color: `#${color}` }}>
                <img src={src} alt={alt} />
                {name}
            </span>
        )
    };

    return (
        <li className={style.item}>
            <div className={style.content}>
                {imageUrl ? (
                    <div className={style.thumb_wrap}>
                        <img src={imageUrl} alt={name} />
                    </div>
                ) : (
                    <div className={style.no_image_placeholder}>
                        <img src='/empty_img.svg' />
                    </div>
                )}
                <div className={style.info_area}>
                    <div>
                        <strong className={style.title}>{highlightText(name, searchInput)}</strong>
                        <em className={style.address}>{place.formatted_address}</em>
                    </div>
                    {category(getKoreanCategory(place.types))}
                </div>
            </div>
            <button className={style.add_btn} onClick={() => addSearchItem(tempLocation)}>
                <span className="blind">장소추가하기</span>
            </button>
        </li>
    )
}

export default CreateSearchItem;
