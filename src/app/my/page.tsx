"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import style from "./My.module.scss";
import axios, { AxiosError } from "axios";
import Filter from "@/app/components/Filter";
import { TPlan } from "../search/page";
import { NoResult } from "../components/create/CreateSearchList";

export type TProfile = {
    nickName: string,
    description?: string,
    image: string | null
}

const My = () => {
    const [profile, setProfile] = useState<TProfile|null>(null);
    const [pageMyPlan, setPageMyPlan] = useState(0);
    const [hasMoreMyPlan, setHasMoreMyPlan] = useState(true);
    const [loadingMyPlan, setLoadingMyPlan] = useState(false);
    const [totalElementsMyPlan, setTotalElementsMyPlan] = useState(0);
    const [filterMyPlan, setFilterMyPlan] = useState("ALL");
    const [plansMyPlan, setPlansMyPlan] = useState<TPlan[]>([]);
    const [isMoreBtnMyPlan, setIsMoreBtnMyPlan] = useState(false);

    const [pageBookmark, setPageBookmark] = useState(0);
    const [hasMoreBookmark, setHasMoreBookmark] = useState(true);
    const [loadingBookmark, setLoadingBookmark] = useState(false);
    const [totalElementsBookmark, setTotalElementsBookmark] = useState(0);
    const [filterBookmark, setFilterBookmark] = useState("LATEST");
    const [plansBookmark, setPlansBookmark] = useState<TPlan[]>([]);
    const [isMoreBtnBookmark, setIsMoreBtnBookmark] = useState(false);

    useEffect(() => {
        document.body.style.height = 'auto';
    }, [])

    const fetchPlansMyPlan = useCallback(async (pageToFetch: number) => {
        if (loadingMyPlan || !hasMoreMyPlan) return;
        setLoadingMyPlan(true);
        try {
            const data = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/my-page/plans?visibility=${filterMyPlan}&size=3&page=${pageToFetch}`, {withCredentials: true});
            setPlansMyPlan((prev) => [...prev, ...data.data.result.content]);
            setPageMyPlan(prev => prev+1);

            if(parseInt(data.data.result.page, 10) >= parseInt(data.data.result.totalPages,10) -2 ){setIsMoreBtnMyPlan(false);}
            else {
                setIsMoreBtnMyPlan(true);
            }
            setTotalElementsMyPlan(data.data.result.totalElements);
        } catch(e) {
            console.log(e);
        }
        setLoadingMyPlan(false);
    },[loadingMyPlan, filterMyPlan, hasMoreMyPlan, pageMyPlan])

    const fetchPlansBookmark = useCallback(async (pageToFetch: number) => {
        if (loadingBookmark) return;

        setLoadingBookmark(true);
        try {
            const data = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/my-page/bookmark/${filterBookmark}?size=6&page=${pageToFetch}`, {withCredentials: true});
            setPlansBookmark((prev) => [...prev, ...data.data.result.content]);
            setPageBookmark(prev => prev+1);

            if(parseInt(data.data.result.page, 10) >= parseInt(data.data.result.totalPages,10) -2 ){setIsMoreBtnBookmark(false);}
            else {
                setIsMoreBtnBookmark(true);
            }
            setTotalElementsBookmark(data.data.result.totalElements);
        } catch(e) {
            console.log(e);
        }
        setLoadingBookmark(false);
    },[loadingBookmark, filterBookmark, hasMoreBookmark, pageBookmark]);

    const fetchProfile = async () => {
        try {
            const data = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/my-page`, {withCredentials: true});
            setProfile(data.data.result);
        } catch(e) {
            console.log(e);
        }
    }

    useEffect(() => {
        setPlansMyPlan([]);
        setPageMyPlan(0);
        fetchPlansMyPlan(0);
    }, [filterMyPlan]);

    useEffect(() => {
        setPlansBookmark([]);
        setPageBookmark(0);
        fetchPlansBookmark(0);
    }, [filterBookmark]);

    useEffect(() => {
        fetchProfile();
    },[])

    return (
        <div className={style.my}>
            <div className={style.profile_wrap}>
                <div className={style.profile_area}>
                    <strong className={style.nickname}>{profile?.nickName}</strong>
                    <p className={style.desc}>{profile?.description ?  profile.description : "소개가 없습니다."}</p>
                    <div className={style.btn_wrap}>
                        <a href="/my/edit" type="button" className={style.edit_btn}>프로필 수정</a>
                    </div>
                    <span className={style.thumb_wrap}>
                        {profile?.image && <img className={style.img} src={profile?.image} alt="프로필이미지" />}
                    </span>
                </div>
            </div>
            <div className={style.plans_wrap}>
                <div className={style.plans_area}>
                    <div className={style.title_wrap}>
                        <span className={style.title_area}>
                            <strong className={style.title}>내가 만든 플랜</strong>
                            <span className={style.count}>{totalElementsMyPlan}</span>
                        </span>
                        <Filter firstText="전체" secondText="공개" thirdText="비공개" onClickFirstBtn={()=>setFilterMyPlan("ALL")} onClickSecondBtn={() => setFilterMyPlan("PUBLIC")} onClickThirdBtn={() => setFilterMyPlan("PRIVATE")} />
                    </div>
                    <ul className={style.list}>
                        {
                            plansMyPlan.length > 0 ? plansMyPlan.map((plan) => {
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
                            }) : <NoResult title="아직 내가 만든 플랜이 없어요" desc="" />
                        }
                    </ul>
                    {isMoreBtnMyPlan && <button type="button" className={style.more_btn} onClick={() => fetchPlansMyPlan(pageMyPlan)}>더보기</button>}
                </div>
                <div className={style.plans_area}>
                    <div className={style.title_wrap}>
                        <span className={style.title_area}>
                            <strong className={style.title}>찜한 플랜</strong>
                            <span className={style.count}>{totalElementsBookmark}</span>
                        </span>
                        <Filter firstText="전체" secondText="댓글순" thirdText="북마크순" onClickFirstBtn={()=>setFilterBookmark("LATEST")} onClickSecondBtn={() => setFilterBookmark("COMMENT")} onClickThirdBtn={() => setFilterBookmark("BOOKMARK")} />
                    </div>
                    <ul className={style.list}>
                        {
                            plansBookmark.length > 0 ? plansBookmark.map((plan) => {
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
                            }) : <NoResult title="아직 찜한 플랜이 없어요" desc="" />
                        }
                    </ul>
                    {isMoreBtnBookmark && <button type="button" className={style.more_btn} onClick={() => fetchPlansBookmark(pageBookmark)}>더보기</button>}
                </div>
            </div>
        </div>
    )
}

export default My;