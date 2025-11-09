/* eslint-disable */
"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import style from "./CreateSearchList.module.scss";
import CreateSearchItem from "./CreateSearchItem";
import { Location } from "@/app/page";

export interface Place {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  photos: { getUrl: () => string }[];
  types: string[];
  place_id?: string;
  rating: number;
}

type TCreateSearchList = {
  setTotalLocationList: React.Dispatch<React.SetStateAction<Location[][]>>;
  selectedDay: string;
  totalLocationList: Location[][];
  areaCode?: number;
};

type TNoResult = {
  title?: string;
  desc?: string;
}

export const NoResult = ({ title='아직 플랜이 없어요', desc='가고 싶은 곳을 적고 첫 플랜을 만들어보세요!'}:TNoResult) => {
  return (
    <div className={style.no_plan}>
      <h2 className={style.title}>{title}</h2>
      <p className={style.desc}>{desc}</p>
    </div>
  );
};

const CreateSearchList = ({ setTotalLocationList, selectedDay, totalLocationList, areaCode }: TCreateSearchList) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPlaces = async (keyword: string, pageNum: number) => {
    if (pageNum === 1) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
    }
    
    const signal = abortControllerRef.current?.signal;

    if (loading && pageNum > 1) {
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/search?keyword=${keyword}&page=${pageNum}&areaCode=${areaCode}`, { signal });
      if (!res.ok) {
        console.error("Search API proxy error:", await res.text());
        setHasMore(false);
        return;
      }

      const data = await res.json();

      if (data.response?.body?.totalCount > 0) {
        const items = data.response.body.items.item;
        const results = Array.isArray(items) ? items : [items];

        const newPlaces: Place[] = results.map((item: any) => ({
          name: item.title,
          formatted_address: item.addr1,
          geometry: {
            location: {
              lat: () => parseFloat(item.mapy),
              lng: () => parseFloat(item.mapx),
            },
          },
          rating: 0,
          types: item.contenttypeid ? [item.contenttypeid.toString()] : [],
          photos: (item.firstimage || item.firstimage2)
            ? [
                {
                  getUrl: () => (item.firstimage || item.firstimage2) as string,
                },
              ]
            : [],
          place_id: item.contentid,
        }));

        setPlaces(prevPlaces => (pageNum === 1 ? newPlaces : [...prevPlaces, ...newPlaces]));
        setHasMore(data.response.body.totalCount > pageNum * 10);
      } else {
        if (pageNum === 1) {
          setPlaces([]);
        }
        setHasMore(false);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error("Failed to fetch places:", error);
      setHasMore(false);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchInput(keyword);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setPlaces([]);
      setPage(1);
      setHasMore(true);
  
      if (!keyword) {
        return;
      }
  
      fetchPlaces(keyword, 1);
    }, 300);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1 && searchInput) {
      fetchPlaces(searchInput, page);
    }
  }, [page]);

  const addSearchItem = (location: Location) => {
    const dayIndex = parseInt(selectedDay, 10) - 1;

    setTotalLocationList(prevTotalLocationList => {
      const newTotalLocationList = prevTotalLocationList.map(dayLocations => [...dayLocations]);

      if (dayIndex >= 0 && dayIndex < newTotalLocationList.length) {
        newTotalLocationList[dayIndex].push(location);
      } else {
        console.warn(`[addSearchItem] 유효하지 않은 dayIndex에 위치를 추가하려고 시도했습니다: ${dayIndex}. 현재 totalLocationList의 길이: ${newTotalLocationList.length}.`);
      }
      return newTotalLocationList
    });
  };

  useEffect(() => {
    setSearchInput("");
    setPlaces([]);
    setPage(1);
    setHasMore(true);
  },[selectedDay]);

  const isFirst = (totalLocationList: Location[][]) => {
    return totalLocationList.every(location => location.length === 0);
  }

    return (
        <div className={style.create_search_wrap}>
            <div className={style.search_wrap}>
                <input type="text"
                  value={searchInput}
                  onChange={onChangeInput}
                  className={style.search_input}
                  placeholder="상호명 또는 주소를 입력하세요"/>
            </div>
            <ul className={style.list}>
                {
                    totalLocationList[parseInt(selectedDay, 10) - 1].length > 0 || searchInput.length > 0 ? places.map((place, index) => (
                        <CreateSearchItem key={place.place_id} place={place} searchInput={searchInput} addSearchItem={addSearchItem} selectedDay={selectedDay} searchItemIndex={index}/>
                    )) : <NoResult />
                }
                {loading && <div className={style.loading}>Loading...</div>}
                <div ref={loader} />
            </ul>
        </div>
    )
};

export default CreateSearchList;