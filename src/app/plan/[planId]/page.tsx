"use client";
import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import style from "@/app/plan/[planId]/Plan.module.scss";
import classNames from 'classnames';
import { useGoogleMapService } from '../../hooks/useGoogleMapService';
import { useParams } from 'next/navigation';
import LocationListEditWrapper from '@/app/components/locationList/LocationListEditWrapper';
import LocationListWrapper from '@/app/components/locationList/LocationListWrapper';
import TopProfile from '@/app/components/topProfile/TopProfile';
import { COLOR_CODE } from '@/app/const/colorCode';
import CommentList from '@/app/components/comment/CommentList';
import CreateSearchList from '@/app/components/create/CreateSearchList';

export interface Location {
  locationId?: number;
  locationName: string;
  category?: string;
  scheduleOrder?: number;
  images?: string[];
  latitude: number;
  longitude: number;
  address?: string;
  duration?: number;
  rating: number;
  types?: string;
  thumbnailImageUrl?: string;
  description?: string;
}

export interface Plan {
  id: number;
  title: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  isBookMarkedOrPublic: boolean;
  areaCode: number;
  planType: string;
  nickName: string;
  profileImage: string;
  b: boolean;
}

export interface Day {
  label: string;
  index: string;
}

export type TProfile = {
  nickName?: string,
  description?: string,
  image?: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACK_HOST;

const PlanDetail: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [location, setLocation] = useState<Location>();
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('전체 일정');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polyline, setPolyline] = useState<google.maps.Polyline | google.maps.Polyline[] | null>(null);
  const [totalLocationList, setTotalLocationList] = useState<Location[][]>([]); // 편집되어 저장될 수있는 원본 전체 지역 리스트
  const [originalTotalLocationList, setOriginalTotalLocationList] = useState<Location[][]>([]); // 편집되지 않은 원본 전체 지역 리스트

  const googleMapService = useGoogleMapService({
    googleMap,
    setGoogleMap,
    markers,
    setMarkers,
    placesService,
    setPlacesService
  }, mapRef);

  const createCustomIconWithColor = (text: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 30;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(15, 15, 12, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'white';
      ctx.stroke();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 15, 15);
    }
    return {
      url: canvas.toDataURL(),
      scaledSize: new window.google.maps.Size(30, 30),
      anchor: new window.google.maps.Point(15, 15),
    };
  };

  const createPolyLine = () => {
    const newMarkers: any[] = [];
    const pathCoordinates: google.maps.LatLng[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    var lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4
    };

    const colorPalette = COLOR_CODE;

    if (polyline) {
      if (Array.isArray(polyline)) {
        polyline.forEach((p) => p.setMap(null));
      } else {
        polyline.setMap(null);
      }
    }

    markers.forEach((marker) => marker.setMap(null));

    if (selectedDay === '전체 일정') {
      const allPaths: google.maps.LatLng[][] = [];

      totalLocationList.forEach((locationList, dayIndex) => {
        const dayPath: google.maps.LatLng[] = [];
        locationList.forEach((location, locationIndex) => {
          const latLng = new window.google.maps.LatLng(location.latitude, location.longitude);
          dayPath.push(latLng);
          bounds.extend(latLng);

          console.log(dayIndex)

          newMarkers.push(new window.google.maps.Marker({
            position: latLng,
            map: googleMap,
            icon: createCustomIconWithColor((locationIndex + 1).toString(), colorPalette[dayIndex % colorPalette.length]),
          }))
        })

        if (dayPath.length > 0) {
          allPaths.push(dayPath);
        }
      });

      const polylinesToSet: google.maps.Polyline[] = [];
      allPaths.forEach((path, index) => {
        if (path.length > 0 && googleMap) {
          polylinesToSet.push(
            new window.google.maps.Polyline({
              path: path,
              strokeOpacity: 0,
              icons: [
                {
                  icon: { ...lineSymbol, strokeColor: colorPalette[index % colorPalette.length] }, // Polyline 색상 적용
                  offset: '0',
                  repeat: '20px',
                },
              ],
              map: googleMap,
            })
          )
        }
      })

      setPolyline(polylinesToSet);

    } else {
      const locationList = totalLocationList[parseInt(selectedDay, 10) - 1];
      locationList.forEach((location, locationIndex) => {
        const latLng = new window.google.maps.LatLng(location.latitude, location.longitude);
        pathCoordinates.push(latLng);
        bounds.extend(latLng);
        newMarkers.push(new window.google.maps.Marker({
          position: latLng,
          map: googleMap,
          icon: createCustomIconWithColor((locationIndex + 1).toString(), colorPalette[parseInt(selectedDay, 10) - 1]),
        }))
      })

      if (pathCoordinates.length > 0 && googleMap) {
        setPolyline(
          new window.google.maps.Polyline({
            path: pathCoordinates,
            strokeOpacity: 0,
            icons: [
              {
                icon: { ...lineSymbol, strokeColor: colorPalette[parseInt(selectedDay, 10) - 1] }, // Polyline 색상 적용
                offset: '0',
                repeat: '20px',
              },
            ],
            map: googleMap,
          })
        );
      } else {
        setPolyline(null);
      }
    }

    setMarkers(newMarkers);

    if (googleMap) {
      if (selectedDay === '전체 일정') {
        if (totalLocationList.flat().length === 0) {
          return;
        }
      } else {
        if (totalLocationList[parseInt(selectedDay) - 1].length === 0) {
          return;
        }
      }
      googleMap.fitBounds(bounds);

      const currentLocations = selectedDay === '전체 일정' ? totalLocationList.flat() : totalLocationList[parseInt(selectedDay) - 1];

      if (currentLocations.length === 1) {
        googleMap.setZoom(15);
        googleMap.panTo(new window.google.maps.LatLng(currentLocations[0].latitude, currentLocations[0].longitude));
      }
    }
  }

  useEffect(() => {
    if (mapRef.current) {
      googleMapService?.loadGoogleMapScript();
    }
  }, [mapRef]);

  useEffect(() => {
    if (location && googleMap) {
      const lat = location.latitude;
      const lng = location.longitude;

      googleMap.panTo({ lat, lng });
    }
  }, [location]);

  useEffect(() => {
    if (googleMap) {
      createPolyLine();
    }

    console.log(totalLocationList.flat());
  }, [totalLocationList, selectedDay]);

  useEffect(() => {
    if (totalLocationList && !isEditing) {
      setTotalLocationList(originalTotalLocationList);
    } // 편집 종료시 원본 전체 지역 리스트로 복구
  }, [isEditing]);

  useEffect(() => {
    if (days.length > 0) {
      loadTotalLocationList();
    }
  }, [days, isEditing]);

  useEffect(() => {
    if (plan) {
      generateDays();
    }
  }, [plan]);

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/${planId}`, { withCredentials: true });
      setPlan(response.data.result);
    } catch (e) {
      const error = e as AxiosError;

      if(error.isAxiosError && error.response?.status === 403) {
        alert('비공개 플랜입니다.');
      } else {
        alert('플랜을 불러오는데 실패했습니다.');
      }
      window.location.href='/';
    }
  };

  const onClickEditBtn = () => {
    if (isEditing) {
      if (totalLocationList.flat().length === 0) {
        alert("가고싶은 장소 적어도 한 곳은 추가해주세요!");
        return;
      }
      fetch(`${BACKEND_URL}/api/location/${planId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(totalLocationList)
      })
        .then(response => {
          if (!response.ok) {
            // If the server response was not ok (e.g., 404, 500), throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json(); // Parse the JSON response body
        })
        .then((responseData: any) => {
          console.log('Success:', responseData);
        })
        .catch((error: Error) => {
          console.error('Error:', error);
        });
      loadTotalLocationList();
    }
    setIsEditing(prev => !prev);
  }

  const loadTotalLocationList = async () => {
    try {
      var tempTotalLocationList: Location[][] = [];
      let isFirst = true;
      console.log(days);

      for (const [index] of days.entries()) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_HOST}/api/plan/${planId}/${index + 1}`, { withCredentials: true });

        var tempLocationList = response.data.result.locations;

        console.log(tempLocationList);
        var tempLocation: { lat: number; lng: number } | null = null;

        if (tempLocationList) {
          for (const [index, location] of tempLocationList.entries()) {
            if (index == 0) {
              tempLocation = { lat: location.latitude, lng: location.longitude };
              location.duration = 0;
              continue;
            }

            try {
              const response = await fetch(
                `/api/google/direction?origin=${tempLocation?.lat},${tempLocation?.lng}&destination=${location.latitude},${location.longitude}&mode=walking`
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              console.log(data);
              tempLocation = { lat: location.latitude, lng: location.longitude };
              if (data.routes[0]) {
                location.duration = data.routes[0].legs[0].duration.value;
              }
              else { location.duration = 0; }
            } catch (e) {
              console.error(e);
              return [];
            }
          }
        }

        if (tempLocationList && tempLocationList.length > 0) {
          isFirst = false;
        } else {
          tempLocationList = [];
        }
        tempTotalLocationList[index] = tempLocationList;
      }

      setTotalLocationList(tempTotalLocationList);
      setOriginalTotalLocationList(tempTotalLocationList);
      if (isFirst && days && days.length > 0) {
        setIsEditing(true);
        setSelectedDay("1");
        setIsShow(true);
      }
    } catch (e) {
      alert('일정 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleShowButton = () => {
    setIsShow(!isShow);
  }

  const generateDays = () => {
    if (!plan) return;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const result: Day[] = [];
    let index = 1;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      result.push({
        label: `${index}일차`,
        index: `${index}`
      });
      index++;
    }
    setDays(result);
  };

  return (
    <div style={{ display: 'flex' }} className={style.list_wrap}>
      {/* Sidebar */}
      <div className={style.list}>
        <button onClick={() => setSelectedDay('전체 일정')} aria-selected={selectedDay === '전체 일정' ? true : false} className={style.total_btn}>
          <span className="blind">전체 일정</span>
        </button>
        <div className={style.scroll_area}>
          {Array.from({ length: totalLocationList.length }, (_, index) => index + 1).map(day => (
            <div key={day} onClick={() => { setSelectedDay(`${day}`) }} aria-selected={selectedDay === `${day}` ? true : false} className={style.item}>
              {day}<span className="blind">일차</span>
            </div>
          ))}
        </div>
        <button onClick={() => onClickEditBtn()} className={classNames(style.edit_btn)}>
          {isEditing ? '종료' : '편집'}
        </button>
      </div>

      {/* Main Content */}
      <div className={classNames(style.contents, { [style.type_total]: selectedDay === "전체 일정" })}>
        <div className={classNames(style.floating_wrap, { [style.is_show]: isShow, [style.is_edit]: isEditing })}>
          {/* <EditSchedule day={selectedDay} planId={planId} /> */}
          <div className={classNames(style.floating_area, { [style.is_edit]: isEditing })}>
            <TopProfile location={plan?.destinationName} profile_img={plan?.profileImage} nickName={plan?.nickName} title={plan?.title} isBookMarkedOrPublic={plan?.b} planType={plan?.planType} date={`${plan?.startDate} - ${plan?.endDate}`} />
            <div className={style.content_wrap}>
              {
                (isEditing && totalLocationList.length > 0 && selectedDay!== "전체 일정") && <CreateSearchList areaCode={plan?.areaCode} setTotalLocationList={setTotalLocationList} totalLocationList={totalLocationList} selectedDay={selectedDay} />
              }
              <div className={style.schedule_wrap}>
                <div className={style.location_list_area}>
                  {
                    isEditing && totalLocationList ? <LocationListEditWrapper totalLocationList={totalLocationList} setTotalLocationList={setTotalLocationList} selectedDay={selectedDay} /> :
                      <LocationListWrapper selectedDay={selectedDay} totalLocationList={totalLocationList} setLocation={setLocation} />
                  }
                </div>
              </div>
            </div>
            {selectedDay === "전체 일정" && <CommentList />}
          </div>
          <span className={style.handle} onClick={handleShowButton}></span>
        </div>
        <div className={style.google_map} ref={mapRef}></div>
      </div>
    </div>
  );
};

export default PlanDetail;