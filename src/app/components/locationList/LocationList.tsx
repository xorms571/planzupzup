"use client";
/* eslint-disable */
import { Location } from "@/app/plan/[planId]/page";
import style from "@/app/plan/[planId]/Plan.module.scss";
import { getTimeUnit } from "@/app/utils/getTimeUnit";
import LocationItem from "@/app/components/locationItem/LocationItem";
import { getOrderColor } from "@/app/utils/getOrderColor";

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
        <span className={style.line} style={{backgroundColor: orderColor}}/>
    </div>
    )
}

export default LocationList;