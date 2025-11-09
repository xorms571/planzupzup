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
        // useEffect 유발 트리거 
        const [searchKeyword, setSearchKeyword] = useState("");
    
        // 무한 스크롤 감지를 위한 관찰 대상 요소
        const observerTarget = useRef<HTMLDivElement>(null);
    
        const fetchSearchPlans = useCallback(async (pageToFetch: number) => {
            if (loading || !hasMore || searchKeyword.length === 0) return;
    
            setLoading(true);
            try {
                let response;
                
                response = await fetch(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/search/${searchKeyword}/${filter}?page=${pageToFetch}`, {
                    credentials: 'include', 
                });
    
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
    
                const data = await response.json();
    
                setPlans(prevPlans => [...prevPlans, ...data.result.content]);
                setPage(prevPage => prevPage + 1);

                if(parseInt(data.result.page, 10) >= parseInt(data.result.totalPages,10) - 1) setHasMore(false);

            } catch (error) {
                console.error("플랜 검색 실패:", error);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        }, [loading, hasMore, searchKeyword, filter]);

        const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
            setSearchInput(e.target.value);
        }

        const onKeyDownEnter = async (e: KeyboardEvent) => {
            if(e.key === 'Enter') {
                if(searchInput.length===0) {
                    alert("검색어를 입력해주세요.");
                } else {
                    setSearchKeyword(searchInput);
                }
            }
        }
    
        useEffect(() => {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchSearchPlans(page);
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
        }, [fetchSearchPlans]);

        useEffect(() => {
            document.body.style.height = 'auto';
        }, [])

        useEffect(() => {
            if(searchKeyword.length > 0) {
                setPlans([]);
                setPage(0);
                setHasMore(true);
                fetchSearchPlans(0);
            }
        }, [filter, searchKeyword]);

    return (
        <div className={style.search_wrap}>
            <div className={style.search_field_wrap}>
                <div className={style.search_field}>
                    <input type="text" placeholder="지금 어디로 떠나고 싶으신가요?" value={searchInput} onChange={onChangeSearchInput} onKeyDown={onKeyDownEnter}/>
                </div>
                <h1 className={style.main_title}>인기 여행 플랜을 나의 플랜으로 줍줍해보세요!</h1>
                <a href="/create" className={style.make_plan_link}>플랜만들기</a>
            </div>
            <div className={style.filter_wrap}>
                <Filter firstText="최신순" secondText="댓글순" thirdText="북마크순" onClickFirstBtn={() => {setFilter('LATEST');}} onClickSecondBtn={() => {setFilter('COMMENT');}} onClickThirdBtn={() => {setFilter('BOOKMARK');}} />
            </div>
            <ul className={style.list}>
                {
                    plans.length > 0 ? plans.map((plan) => {
                        return (
                            <li className={style.item}>
                                <a href={`/plan/${plan.planId}`} className={style.link}>
                                    <span className={style.img_wrap}>
                                        <img className={style.img} src={plan.profileImage} alt="프로필 이미지"/>
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