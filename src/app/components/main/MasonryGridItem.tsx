"use client";

import { Plan } from "@/app/page";
import styles from "@/app/page.module.scss";
import { useRouter } from "next/navigation";

const MasonryGridItem = ({ profileImage, nickName, title, planId, content }: Plan) => {
    const router = useRouter();
    return (
        <div className={styles.item} onClick={() => router.push(`plan/${planId}`)} style={{ cursor: 'pointer' }}>
            <div className={styles.profile}>
                {profileImage
                    ? <img src={profileImage} alt={`${nickName} profile image`} className={styles.img} />
                    : <div className={styles.img} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,.03)' }}><img src='/empty_img.svg' alt="no profile image" /></div>}
                <span className={styles.nickname}>{nickName}</span>
            </div>
            <h3 className={styles.plan_title}>{title}</h3>
            <p className={styles.desc}>{content}</p>
        </div>
    )
}

export default MasonryGridItem;