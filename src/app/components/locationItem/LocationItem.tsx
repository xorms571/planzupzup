"use client";
/* eslint-disable */

import { Location } from "@/app/plan/[planId]/page";
import style from "@/app/plan/[planId]/Plan.module.scss";
import { useEffect, useState } from "react";
import LocationDetail from "../locationDetail/LocationDetail";
import classNames from "classnames";
import { createPortal } from "react-dom";

type TProps = {
    isTotal?: boolean; 
    location: Location;
    locationIndex: number;
    setLocation?: React.Dispatch<React.SetStateAction<Location | undefined>>;
    orderColor: string;
    isEdit?: boolean;
    day: number;
    deleteEditItem?: (locationIndex: number) => void;
    setTotalLocationList? : React.Dispatch<React.SetStateAction<Location[][]>>;
    totalLocationList : Location[][];
}

const LocationItem = ({ isTotal, location, locationIndex, setLocation, orderColor, isEdit, deleteEditItem , day, setTotalLocationList, totalLocationList}:TProps) => {

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    const onClickItemImg = () => {
        setIsShowModal(true);
    }

    useEffect(() => {
        if (isShowModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isShowModal]);

    useEffect(() => {
        setPortalRoot(document.body);
    },[]);

    return (
        <>
        {isShowModal && portalRoot && createPortal(
            <LocationDetail day={day} locationId={`${location.locationId}`} setIsShowModal={setIsShowModal} isEdit={isEdit} {...(isEdit && {day: day})} {...(isEdit && {setTotalLocationList: setTotalLocationList})} totalLocationList={totalLocationList} locationIndex={locationIndex}/>,
            portalRoot
        )}
        {isTotal ? <div key={location.locationId} className={style.location_total_item} onClick={() => setLocation && setLocation(location)}>
        <div>
            <div className={style.order} style={{backgroundColor: `${orderColor}`}}>{locationIndex}</div>
            <div className={style.name}>{location.locationName}</div>
        </div>
        <div className={style.img_wrap} onClick={onClickItemImg}>
            { location.thumbnailImageUrl && <img src={location.thumbnailImageUrl} className={style.img}/>}
        </div>
        {/* <div className={style.category}>{location.category}</div> */}
    </div> : <div key={location.locationId} className={classNames(style.location_item, {[style.is_edit]:isEdit})} onClick={() => setLocation && setLocation(location)}>
        <a href="#" className={style.link}>
            <div className={style.img_wrap} onClick={onClickItemImg}>
                { location.thumbnailImageUrl && <img src={location.thumbnailImageUrl} className={style.img}/>}
            </div>
        </a>
        <div style={{"overflow":"hidden", "marginRight": "30px"}}>
            {!isEdit && <div className={style.order} style={{backgroundColor: `${orderColor}`}}>{locationIndex}</div>}
            <div className={style.name}>{location.locationName}</div>
            <div className={style.rating}>{location.rating}</div>
            {isEdit && <button type="button" className={style.delete_btn} onClick={() => deleteEditItem && deleteEditItem(locationIndex)}></button>}
        </div>
    </div>}
        </>
    )
}

export default LocationItem;