import style from "@/app/components/topProfile/TopProfile.module.scss";
import axios from "axios";
import { useParams } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

type TProps = {
    profile_img?: string,
    nickname?: string,
    title?: string,
    location?: string,
    date: string,
    isBookMarked?: boolean,
    planType?: string,
    nickName?: string
}
/* eslint-disable */
const TopProfile = ({profile_img, nickName, title, location, date, isBookMarked, planType}:TProps) => {

    const { planId } = useParams<{ planId: string }>();
    const [bookMarked, setBookMarked] = useState(false);

    const onClickBookMark = async () => {
        try {
            if(bookMarked) {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/${planId}/bookmark`,{ withCredentials: true })
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/${planId}/bookmark`,{},{ withCredentials: true })
            }
            setBookMarked(!bookMarked);
        } catch(e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if (isBookMarked !== undefined) {
            setBookMarked(isBookMarked);
        }
    }, [isBookMarked]);

    return (    
       <div className={style.profile_wrap}>
            <a href="#" className={style.link}>
                <span className={style.img_wrap}>
                    {profile_img && <img className={style.img} src={profile_img} alt="profile"/>}
                </span>
            </a>
            <div className={style.info_wrap}>
                <p className={style.nickname}>{nickName}</p>
                <h2 className={style.title_wrap}>
                    {title}{planType==="OTHERS" && <span className={style.bookmark} aria-selected={bookMarked} onClick={onClickBookMark}><span className="blind">즐겨찾기</span></span>}
                </h2>
                <div className={style.date_wrap}>
                    <span className={style.location}>{location}</span>
                    <span className={style.date}>{date}</span>
                </div>
            </div>
       </div>
    )
}

export default TopProfile;