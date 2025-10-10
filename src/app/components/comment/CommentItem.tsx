/* eslint-disable */
"use client";

import { SetStateAction, useState } from "react";
import CommentList, { TComment } from "./CommentList";
import style from "./CommentList.module.scss";
import axios from "axios";

type TProps = TComment & {
    setComments: React.Dispatch<SetStateAction<TComment[]>>;
    isLogin: boolean;
}

const CommentItem = ({commentId, profileImage, nickName, content, likesCount, isLiked, parentId, childrenCount, ownership, setComments, isLogin}:TProps) => {

    const [isExpaneded, setIsExpanded] = useState(false);
    const [isShowOptions, setIsShowOptions] = useState(false);
    const [isClickEditBtn, setIsClickEditBtn] = useState(false);
    const [inputContent, setInputContent] = useState("");
    const [isCreateRecomment, setIsCreateRecomment] = useState(false);

    const onClickReCommentBtn = () => {
        setIsExpanded(!isExpaneded);
    }

    const onClickEditBtn = () => {
        setIsClickEditBtn(true);
        setIsShowOptions(false);
        setInputContent(content);
    }

    const onClickLikeBtn = async () => {
        try {
            if(!isLiked) {
                await axios.post(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment/${commentId}/like`,{},{ withCredentials: true });
            } else {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment/${commentId}/like`,{ withCredentials: true });
            }
            
            setComments(prevComments => 
                prevComments.map((comment) => comment.commentId === commentId ? {
                    ...comment,
                    isLiked: isLiked ? false : true,
                    likesCount: isLiked ? likesCount - 1 : likesCount + 1
                } : comment)
            );
            
        } catch(e) {
            console.error("Failed to post like", e);
        }
    }

    const onClickSaveEditBtn = async () => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment/${commentId}`, {content: inputContent},{ withCredentials: true });
            console.log(response.data.result);
      
            setComments(prevComments => prevComments.map(comment => comment.commentId===commentId ? {
                ...comment, content: inputContent, thumbnailImage: response.data.result.profileImage, nickName: response.data.result.nickName
            } : comment))

            setIsClickEditBtn(false);
          } catch (error) {
            console.error("Failed to edit:", error);
          }
        setIsExpanded(false);
    }

    const onClickDeleteBtn = async () => {
        try {
            const isConfirmed = window.confirm("정말로 이 댓글을 삭제하시겠습니까?");

            if(!isConfirmed) {
                setIsExpanded(false);
                return;
            }

            setComments(prevComments => prevComments.filter(comment => comment.commentId!==commentId ))

            const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/comment/${commentId}`);
            console.log("Comment Deleted", response.data);
          } catch (error) {
            console.error("Failed to delete:", error);
          }
        setIsShowOptions(false);
    }

    return (
        <li className={style.item}>
            <span className={style.thumb_wrap}>
                {profileImage && <img className={style.img} src={profileImage} alt="섬네일 이미지"/>}
            </span>
            <div className={style.text_area}>
                <div className={style.nickname}>{nickName}</div>
                <div className={style.content}>{isClickEditBtn ? <textarea className={style.edit_input} value={inputContent} onChange={(e) => setInputContent(e.target.value)}/> : content}</div>
                {
                    !isClickEditBtn ? (
                        <div className={style.reaction_area}>
                            <button type="button" aria-pressed={isLiked} className={style.likes_btn} onClick={onClickLikeBtn}>
                                <span className="blind">공감</span>{likesCount}
                            </button>
                            {childrenCount > 0 ? <button type="button" aria-expanded={isExpaneded} className={style.re_comment_btn} onClick={onClickReCommentBtn}>
                                답글 {childrenCount}</button> :  <button type="button" className={style.create_recomment_btn} onClick={() => {setIsCreateRecomment(true); setIsExpanded(true);}}>답글</button>}
                            {
                                isExpaneded && childrenCount > 0 && <button type="button" className={style.create_recomment_btn} onClick={() => setIsCreateRecomment(true)}>답글 쓰기</button>
                            }
                        </div>
                    ) : <><div className={style.edit_confirm_btn_wrap}>
                            <button type="button" className={style.edit_confirm_btn} onClick={onClickSaveEditBtn}>수정</button>
                            <button type="button" className={style.edit_cancel_btn} onClick={() => setIsClickEditBtn(false)}>취소</button> 
                        </div></>
                }
                {
                    isExpaneded && 
                        <div className={style.re_comment_area}>
                            <CommentList parentId={commentId} setIsCreateRecomment={setIsCreateRecomment} isCreateRecomment={isCreateRecomment} isLogin={isLogin}/>
                        </div>
                }
                {  ownership === "MINE" && <button type="button" className={style.option_btn} onClick={() => setIsShowOptions(!isShowOptions)}><span className="blind">설정</span></button>}
                {
                    isShowOptions && (
                        <div className={style.options}>
                            <button type="button" className={style.edit_btn} onClick={onClickEditBtn}>수정</button>
                            <button type="button" className={style.delete_btn} onClick={onClickDeleteBtn}>삭제</button>
                        </div>
                    )
                }
            </div>
        </li>
    )
}

export default CommentItem;