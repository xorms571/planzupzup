"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./destination.module.scss";
import classNames from "classnames";

interface Destination {
  id?: number;
  image: string;
  name: string;
}

const defaultDestinations: Destination[] = [
  { name: "부산", image: "/destination/busan.jpg" },
  { name: "강릉", image: "/destination/gangneung.avif" },
  { name: "제주도", image: "/destination/jeju.webp" },
  { name: "전주", image: "/destination/jeonju.png" },
  { name: "서울", image: "/destination/seoul.avif" },
  { name: "속초", image: "/destination/sokcho.avif" },
  { name: "속초", image: "/destination/sokcho.jpg" },
];

interface Props {
  onDestinationSelect: (name: string, image: string) => void;
}

const DestinationSelector: React.FC<Props> = ({ onDestinationSelect }) => {
  const [search, setSearch] = useState<string>("");
  const [relatedSearchTerms, setRelatedSearchTerms] = useState<Destination[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>(defaultDestinations);

  useEffect(() => {
    document.body.style.height = 'auto';
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      if (!search.trim()) {
        setRelatedSearchTerms([]);
        return;
      }
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/destination/${search}`, { withCredentials: true });
        setRelatedSearchTerms(response.data.result || []);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setRelatedSearchTerms([]);
      }
    };

    const timer = setTimeout(() => {
      fetchDestinations();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className={style.container}>
      <div>
        <h2 className={style.title}>지금 어디로 떠나고 싶으신가요?</h2>
        <p className={style.subTitle}>여행지를 검색해보세요</p>
      </div>
      <div className={style.spacer} />

      <div className={style.searchContainer}>
        <div style={{ display: "flex", gap: "8px", }}>
          <img style={{ paddingLeft: "20px" }} src="/search.svg" alt="search-icon" />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className={style.searchInput}
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <ul className={classNames(style.relatedSearchTherms, { [style.hidden]: relatedSearchTerms.length === 0 })}>
          {relatedSearchTerms.map((term) => (
            <li
              className={style.searchTerm}
              key={term.id}
              onClick={() => onDestinationSelect(term.name, term.image)}
            >
              {term.name}
            </li>
          ))}
        </ul>
      </div>

      <div className={style.listContainer}>
        <div className={style.list}>
          {destinations.slice(0, 3).map((destination, index) => (
            <div
              key={destination.id || `${destination.name}-${index}`}
              className={style.item}
              onClick={() => onDestinationSelect(destination.name, destination.image)}
            >
              <img
                src={destination.image}
                alt={destination.name}
                className={style.image}
              />
              <div className={style.name}>{destination.name}</div>
            </div>
          ))}
        </div>
        <div className={style.list}>
          {destinations.slice(3, 7).map((destination, index) => (
            <div
              key={destination.id || `${destination.name}-${index + 3}`}
              className={style.item}
              onClick={() => onDestinationSelect(destination.name, destination.image)}
            >
              <img
                src={destination.image}
                alt={destination.name}
                className={style.image}
              />
              <div className={style.name}>{destination.name}</div>
            </div>
          ))}
        </div>
        <div className={style.spacer} />
      </div>
    </div>
  );
};

export default DestinationSelector;
