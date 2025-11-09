"use client";

import { Plan } from "@/app/page";
import styles from "@/app/page.module.scss";
import { useRouter } from "next/navigation";

const MasonryGridItem = ({ profileImage, nickName, title, destinationName, planId }: Plan) => {
    const router = useRouter();
    return (
        <div className={styles.item} onClick={() => router.push(`plan/${planId}`)} style={{ cursor: 'pointer' }}>
            <div className={styles.profile}>
                {profileImage && <img src={profileImage} alt="프로필 이미지" className={styles.img} />}
                <span className={styles.nickname}>{nickName}</span>
            </div>
            <h3 className={styles.plan_title}>{title}</h3>
            <p className={styles.desc}>{destinationName}</p>
        </div>
    )
}

export default MasonryGridItem;