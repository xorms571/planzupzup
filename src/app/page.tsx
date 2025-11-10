"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/page.module.scss";
import { MasonryInfiniteGrid } from "@egjs/react-infinitegrid";
import MasonryGridItem from "./components/main/MasonryGridItem";
import Flicking from "@egjs/react-flicking";
import { AutoPlay } from "@egjs/flicking-plugins";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import axios from "axios";

export interface Location {
  locationId?: number;
  locationName: string;
  day?: string; // ISO 날짜 문자열
  scheduleOrder?: number;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  placeId?: string;
  googleImageUrl: string | undefined;
  types?: string[];
  images?: string[]; // 이미지 URL 배열
}

export interface Plan {
  planId?: number | undefined;
  areaCode?: number;
  nickName: string;
  profileImage: string | undefined;
  planType?: 'OTHERS' | 'PRIVATE' | 'PUBLIC' | string; // planType이 다른 값도 올 수 있으면 string
  b?: boolean; // 의미가 불분명하므로 그대로 boolean
  title: string;
  content: string;
  startDate?: string; // ISO 날짜 문자열
  endDate?: string;   // ISO 날짜 문자열
  destinationName?: string;
  locations?: Location[];
}

const getColumnSize = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 1024 ? 3 : 2;
  }
  return 2;
};

const getTripDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "당일치기";
  } else {
    const nights = diffDays;
    const days = diffDays + 1;
    return `${nights}박 ${days}일`;
  }
};

const Home: React.FC = () => {
  const [column, setColumn] = useState(getColumnSize());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [locations, setLocations] = useState<Plan[]>([])
  const router = useRouter();

  useEffect(() => {

    const fetchData = async () => {
      try {
        const plansResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan`);
        const fetchedPlans = plansResponse.data.result.content;
        setPlans(fetchedPlans);
        if (fetchedPlans && fetchedPlans.length > 0) {
          const recentTwoPlans = fetchedPlans.slice(-2)
          const responses = await Promise.all(
            recentTwoPlans.map((plan: Plan) =>
              axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/${plan.planId}/1`, { withCredentials: true })
            )
          );
          const allContents = responses.map((res) => res.data.result);
          setLocations(allContents);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    document.body.style.height = 'auto';

    const handleResize = () => setColumn(getColumnSize());
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  const easing = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  const plugins = [
    new AutoPlay({
      direction: "NEXT",
      animationDuration: 600,
      duration: 3000
    })
  ];

  const img_wrap_style = { 
    background: 'rgba(0,0,0,.02)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '366px',
    borderRadius: '16px',
  }

  return (
    <div className={styles.container_wrapper}>
      <section className={styles.section_1_2}>
        <Flicking
          align="prev"
          bound={true}
          onChanged={e => setCurrentIndex(e.index)}
          plugins={plugins}
          easing={easing}
          duration={600}
          circular={true}
        >
          <div className={styles.img_wrap}>
            <img className={styles.img} src={"/img_section_1_bg_1.png"} alt="대표 이미지" />
          </div>
          <div className={styles.img_wrap}>
            <img className={styles.img} src={"/img_section_1_bg_2.png"} alt="대표 이미지2" />
          </div>
          <div className={styles.img_wrap}>
            <img className={styles.img} src={"/img_section_1_bg_3.png"} alt="대표 이미지3" />
          </div>
          <div className={styles.img_wrap}>
            <img className={styles.img} src={"/img_section_1_bg_4.png"} alt="대표 이미지4" />
          </div>
          <div className={styles.img_wrap}>
            <img className={styles.img} src={"/img_section_1_bg_5.png"} alt="대표 이미지5" />
          </div>
        </Flicking>
        <div className={styles.dot_wrap}>
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={classNames(styles.dot, { [styles.is_active]: index === currentIndex })}
            ></span>
          ))}
        </div>
        <div className={styles.description}>
          <p>맘에 드는 플랜,<br className={styles.br} /> 하나씩 줍줍!<br />나만의 여행 완성해보세요</p>
          <span>여행이 막막할 땐,<br className={styles.br} /> 그냥 줍줍해보자!</span>
          <button onClick={() => router.push('/create')}>플랜만들기</button>
        </div>
      </section>
      <section className={styles.section_2_2}>
        <h2 className={styles.title}>지금 어디로 떠나고 싶으신가요?</h2>
        <div className={styles.input_wrap}>
          <input type="text" placeholder="검색어를 입력하세요" className={styles.input} />
        </div>
      </section>

      <section className={styles.section_5}>
        <div className={styles.top_area}>
          <div>
            <h2 className={styles.title}>당신만의 여행을 만들어보세요!</h2>
            <p className={styles.desc}>유튜버의 루트를 참고해, 내 여행에 맞게 플랜을 짜보세요<br />장소, 일정, 동선까지 한눈에 정리할 수 있어요</p>
          </div>
          <a href="#" className={styles.link}>플랜 만들기</a>
        </div>
        <ul className={styles.list}>
          {
            locations.map((location) => {
              return (
                <li onClick={() => router.push(`plan/${location.planId}`)} className={styles.item} key={location.planId} style={{ cursor: 'pointer' }}>
                  {location.locations && location.locations[0]?.googleImageUrl
                    ? <div style={img_wrap_style}><img src={location.locations[0]?.googleImageUrl} alt={`${location.title} image`} className={styles.img} /></div>
                    : <div style={img_wrap_style}><img src='/empty_img.svg' alt="no image" className={styles.img} style={{ width: '50px', height: '50px' }} /></div>}
                  <div className={styles.info_area}>
                    <div className={styles.day_wrap}>
                      {location.startDate && location.endDate && <span className={styles.day}>{getTripDuration(location.startDate, location.endDate)}</span>}
                    </div>
                    <p className={styles.sub_title}>{location.title}</p>
                    <p className={styles.sub_desc}>{location.content}</p>
                  </div>
                </li>
              )
            })
          }
        </ul>
      </section>
      <section className={styles.section_6}>
        <h2 className={styles.title}>함께 소통하고 공유해요</h2>
        <p className={styles.desc}>서로의 여행루트를 공유하고 소통할 수 있어요!</p>
        <MasonryInfiniteGrid className={styles.list}
          gap={32}
          useRecycle={true}
          autoResize={true}
          threshold={300}
          resizeDebounce={10}
          align="stretch"
          column={column}
          useTransform={true}>
          {plans.map((item) => (
            <MasonryGridItem
              key={item.planId}
              profileImage={item.profileImage}
              nickName={item.nickName}
              title={item.title}
              content={item.content}
              planId={item.planId}
            />
          ))}
        </MasonryInfiniteGrid>
      </section>
    </div>
  );
};

export default Home;