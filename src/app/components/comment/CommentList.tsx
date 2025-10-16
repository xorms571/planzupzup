/* eslint-disable */
"use client";

import { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import CommentItem from "./CommentItem";
import style from "./CommentList.module.scss";
import { useParams } from "next/navigation";
import axios from "axios";
import Filter from "../Filter";
import { TProfile } from "@/app/editProfile/EditProfile";
import { NoResult } from "../create/CreateSearchList";

export type TComment = {
    commentId?: string;
    profileImage?: string;
    nickName?: string;
    content: string;
    likesCount: number;
    isLiked: boolean;
    parentId?: string;
    childrenCount: number;
    ownership: string;
}

type TCommentList = {
    parentId?: string;
    isCreateRecomment?: boolean;
    setIsCreateRecomment?: React.Dispatch<SetStateAction<boolean>>;
    isLogin: boolean;
}

const CommentList = ({parentId, isCreateRecomment, setIsCreateRecomment, isLogin}: TCommentList) => {
    const { planId } = useParams<{ planId: string }>();
    const [comments, setComments] = useState<TComment[]>([]);
    // 현재 페이지 번호
    const [page, setPage] = useState(0);
    // 더 불러올 데이터가 있는지 여부
    const [hasMore, setHasMore] = useState(true);
    // 데이터 로딩 중인지 여부
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [createInputText, setCreateInputText] = useState("");
    const [filter, setFilter] = useState("LATEST");
    const [profile, setProfile] = useState<TProfile | null>(null);

    // 무한 스크롤 감지를 위한 관찰 대상 요소
    const observerTarget = useRef<HTMLDivElement>(null);

    const onClickCreateBtn = async () => {
        try {
            let response;

            if(!isLogin) {
                alert('로그인이 필요합니다');
                window.location.href="/login";
            }

            if(parentId) {
                response = await axios.post(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment`,{
                    content: createInputText,
                    parentId,
                    planId : planId
                },{ withCredentials: true })
            }else {
                response = await axios.post(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment`,{
                    content: createInputText,
                    parentId : null,
                    planId : planId
                },{ withCredentials: true })
            }

            const result = response.data.result;

            const newComment:TComment = {
                commentId: result.commentId,
                content: result.content,
                likesCount: 0,
                isLiked: false,
                childrenCount: 0,
                ownership: "MINE"
            }

            setComments(prevComments => [newComment, ...prevComments]);
        } catch(e) {
            console.log(e);
        }

        setCreateInputText("");

        if(parentId && setIsCreateRecomment) {
            setIsCreateRecomment(false);
        }
    }

    const fetchComments = useCallback(async (pageToFetch: number) => {
        if (loading || !hasMore) return;

        setLoading(true);

        try {
            let response;
            
            if(!parentId) {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment/${planId}/${filter}?page=${pageToFetch}`, {
                    credentials: 'include', 
                });
            }else {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment/${planId}/${parentId}/${filter}?page=${pageToFetch}`, {
                    credentials: 'include', 
                });
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            setComments(prevComments => [...prevComments, ...data.result.content]);
            setPage(prevPage => prevPage + 1);
            // API 응답에 'hasMore' 속성이 있다고 가정하고 업데이트합니다.
            if(parseInt(data.result.page, 10) >= parseInt(data.result.totalPages,10) -1 )setHasMore(false);
            setTotalElements(data.result.totalElements);
        } catch (error) {
            console.error("댓글 불러오기 실패:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, parentId, filter]);

    // Intersection Observer를 설정하여 무한 스크롤을 구현합니다.
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            // 관찰 대상이 뷰포트에 들어왔고, 더 불러올 데이터가 있으며, 현재 로딩 중이 아닐 때
            if (entries[0].isIntersecting && hasMore && !loading) {
                fetchComments(page); // 댓글을 불러옵니다.
            }
        }, {
            threshold: 1.0, // 대상이 100% 보일 때 트리거합니다.
        });

        const currentObserverTarget = observerTarget.current;

        if (currentObserverTarget) {
            observer.observe(currentObserverTarget);
        }

        // 컴포넌트 언마운트 시 옵저버 연결을 해제합니다.
        return () => {
            if (currentObserverTarget) {
                observer.unobserve(currentObserverTarget);
            }
        };
    }, [fetchComments]); // fetchComments, hasMore, loading이 변경될 때마다 이펙트를 다시 실행합니다.

    useEffect(() => {
        setComments([]);
        setPage(0);
        setHasMore(true);
        fetchComments(0);
    }, [filter]);

    useEffect(() => {
        if(isLogin) {
            const getProfile = async () => {
                try {
                    const data = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/my-page`, { withCredentials: true });
                    setProfile(data.data.result);
                } catch (e) {
                    console.log(e);
                }
            }
            getProfile();
        }
    }, [isLogin])
    
    return (
        <div className={style.comment_list}>
            { !parentId &&
                <>
                    <div className={style.count_wrap}>
                        <div className={style.count_area}>
                            댓글&nbsp;
                            <span className={style.count}>{totalElements}</span>
                        </div>
                        <Filter firstText="최신순" secondText="인기순" onClickFirstBtn={() => {setFilter('LATEST')}} onClickSecondBtn={() => {setFilter('POPULAR')}} />
                    </div>
                    <div className={style.textarea_wrap}>
                        <span className={style.thumb_wrap}>{profile?.image && <img className={style.img} src={profile?.image} alt="섬네일 이미지" />}</span>
                        <textarea placeholder={"댓글을 입력하세요"} className={style.textarea} value={createInputText} onChange={(e)=> setCreateInputText(e.target.value)}/>
                        <button type="button" className={style.create_confirm_btn} onClick={onClickCreateBtn}>등록</button>
                    </div>
                </>
            }
            {
                isCreateRecomment && <div className={style.textarea_wrap}>
                <textarea placeholder={"답글을 입력하세요"} className={style.textarea} value={createInputText} onChange={(e)=> setCreateInputText(e.target.value)}/>
                <button type="button" className={style.create_confirm_btn} onClick={onClickCreateBtn}>등록</button>
                </div>
            }
            <ul className={style.list}>
                {
                    totalElements>0 ? comments.map((item) => <CommentItem {...item} setComments={setComments} isLogin={isLogin}/>) : <NoResult title="아직 댓글이 없어요" desc="" />
                }
            </ul>
            <div ref={observerTarget} style={{ height: "20px" }}>
                {loading && <p>댓글 더 불러오는 중...</p>}
            </div>
        </div>
    )
}

export default CommentList;