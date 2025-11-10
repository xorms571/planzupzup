"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import style from "./search.module.scss";
import Filter from "../components/Filter";
import { NoResult } from "../components/create/CreateSearchList";

export type TPlan = {
    planId: string,
    title: string,
    profileImage: string,
    nickName: string,
    destinationName: string,
    bookMarkCount: number,
    commentCount: number,
    isBookMarkedOrPublic: boolean,
    days: number
}

const Search = () => {
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [plans, setPlans] = useState<TPlan[]>([]);
    const [filter, setFilter] = useState("LATEST");
    const [searchKeyword, setSearchKeyword] = useState("");

    // 무한 스크롤 감지를 위한 관찰 대상 요소
    const observerTarget = useRef<HTMLDivElement>(null);

    // useCallback을 위한 최신 상태 값을 유지하는 Ref
    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    const fetchPlans = useCallback(async (pageToFetch: number) => {
        // 의존성 배열에 추가하지 않고 최신 loading 및 hasMore 값에 접근하기 위해 Ref 사용
        if (loadingRef.current || !hasMoreRef.current) return;

        const isCurrentlySearching = searchKeyword.length > 0;

        setLoading(true);
        try {
            let url;
            if (isCurrentlySearching) {
                url = `${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/search/${searchKeyword}/${filter}?page=${pageToFetch}`;
            } else {
                url = `${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan?page=${pageToFetch}`;
            }

            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            setPlans(prevPlans => {
                // pageToFetch가 0이면 (초기 로드 또는 새 검색) 기존 내용을 대체
                if (pageToFetch === 0) {
                    return data.result.content;
                }
                return [...prevPlans, ...data.result.content];
            });
            setPage(prevPage => prevPage + 1);

            setHasMore(parseInt(data.result.page, 10) < parseInt(data.result.totalPages, 10) - 1);

        } catch (error) {
            console.error("플랜 불러오기 실패:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [searchKeyword, filter]); // 의존성 배열은 안정적: searchKeyword 및 filter


    const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }

    const onKeyDownEnter = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            setSearchKeyword(searchInput);
        }
    }

    // 무한 스크롤 관찰자를 위한 Effect
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchPlans(page); // 다음 페이지를 가져옴
            }
        }, {
            threshold: 1.0,
        });

        const currentObserverTarget = observerTarget.current;

        if (currentObserverTarget) {
            observer.observe(currentObserverTarget);
        }

        return () => {
            if (currentObserverTarget) {
                observer.unobserve(currentObserverTarget);
            }
        };
    }, [fetchPlans, hasMore, loading, page]); // 의존성 배열에서 searchKeyword 제거됨

    useEffect(() => {
        document.body.style.height = 'auto';
    }, [])

    // filter 또는 searchKeyword 변경 시 새 검색 또는 초기 로드를 트리거하는 Effect
    useEffect(() => {
        setPlans([]); // 이전 플랜 초기화
        setPage(0); // 페이지를 0으로 재설정
        setHasMore(true); // 초기에는 더 많은 결과가 있다고 가정

        if (searchKeyword.length > 0) {
            fetchPlans(0); // 새 검색 키워드에 대한 결과를 가져옴
        } else {
            // searchKeyword가 비어 있으면 초기 일반 플랜을 가져옴
            fetchPlans(0);
        }
    }, [filter, searchKeyword, fetchPlans]); // fetchPlans는 searchKeyword/filter 변경 시 ID가 변경되므로 여기에 의존성으로 포함됨.

    return (
        <div className={style.search_wrap}>
            <div className={style.search_field_wrap}>
                <div className={style.search_field}>
                    <input type="text" placeholder="지금 어디로 떠나고 싶으신가요?" value={searchInput} onChange={onChangeSearchInput} onKeyDown={onKeyDownEnter} />
                </div>
                <h1 className={style.main_title}>인기 여행 플랜을 나의 플랜으로 줍줍해보세요!</h1>
                <a href="/create" className={style.make_plan_link}>플랜만들기</a>
            </div>
            <div className={style.filter_wrap}>
                <Filter firstText="최신순" secondText="댓글순" thirdText="북마크순" onClickFirstBtn={() => { setFilter('LATEST'); }} onClickSecondBtn={() => { setFilter('COMMENT'); }} onClickThirdBtn={() => { setFilter('BOOKMARK'); }} />
            </div>
            <ul className={style.list}>
                {
                    plans.length > 0 ? plans.map((plan) => {
                        return (
                            <li className={style.item} key={plan.planId}>
                                <a href={`/plan/${plan.planId}`} className={style.link}>
                                    <span className={style.img_wrap}>
                                        <img className={style.img} src={plan.profileImage} alt={`${plan.nickName} profile image`} />
                                    </span>
                                    <div className={style.info_area}>
                                        <div className={style.days}>{plan.destinationName} - {plan.days}DAY</div>
                                        <strong className={style.title}>{plan.title}</strong>
                                        <div className={style.sub_info}>
                                            <span className={style.likes}>{plan.bookMarkCount}</span>
                                            <span className={style.comments}>{plan.commentCount}</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        )
                    }) : <NoResult title="검색 결과가 없습니다" desc="" />
                }
            </ul>
            <div ref={observerTarget} style={{ height: "50px" }}>
                {loading && <p>검색 결과 불러오는 중...</p>}
            </div>
        </div>
    )
}

export default Search;