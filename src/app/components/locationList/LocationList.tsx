"use client";
/* eslint-disable */
import style from "@/app/plan/[planId]/Plan.module.scss";
import LocationItem from "@/app/components/locationItem/LocationItem";
import { NoResult } from "../create/CreateSearchList";
import { Location } from "@/app/page";

type TProps = {
    isTotal?: boolean;
    locationList: Location[];
    setLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    orderColor: string;
    totalLocationList: Location[][];
    day: number;
}

const LocationList = ({ isTotal , locationList, setLocation, orderColor, totalLocationList, day }:TProps) => {

    return (
        isTotal ? <div className={style.total_location_list}>
        {locationList.map((location, idx) => (
        <LocationItem day={day} isTotal={true} locationIndex={idx+1} location={location} totalLocationList={totalLocationList} setLocation={setLocation} orderColor={orderColor}/>
        ))}
    </div> : <div className={style.location_list}>
        {locationList.map((location, idx) => (
            <div className={style.duration_wrap} key={idx}>
                <LocationItem day={day} isTotal={false} locationIndex={idx+1} location={location} setLocation={setLocation} totalLocationList={totalLocationList} orderColor={orderColor}/>
            </div>
        ))}
        {locationList.length>0 ? <span className={style.line} style={{backgroundColor: orderColor}}/> : <NoResult desc=""/>}
    </div>
    )
}

export default LocationList;