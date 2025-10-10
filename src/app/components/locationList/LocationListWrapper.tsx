import LocationList from "@/app/components/locationList/LocationList";
import { Location } from "@/app/plan/[planId]/page";
import style from "@/app/plan/[planId]/Plan.module.scss";
import { getOrderColor } from "@/app/utils/getOrderColor";
import { NoResult } from "../create/CreateSearchList";
/* eslint-disable */
type TProps = {
    selectedDay: string;
    totalLocationList: Location[][];
    setLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
}

const LocationListWrapper = ({ selectedDay, totalLocationList, setLocation} : TProps) => {
    if(selectedDay !== '전체 일정') {
        return <LocationList day={parseInt(selectedDay, 10) - 1} isTotal={false} locationList={totalLocationList[parseInt(selectedDay, 10) - 1]} setLocation={setLocation} orderColor={getOrderColor(parseInt(selectedDay, 10) - 1)} totalLocationList={totalLocationList}/>
    } else {
        return <div className={style.locationlist_list}>
            {totalLocationList.map((locationList,index) => {if(locationList.length > 0) return <div className={style.locationlist_item}><span className={style.day}>{index+1}일차</span><LocationList day={0} isTotal={true} totalLocationList={totalLocationList} locationList={locationList} setLocation={setLocation} orderColor={getOrderColor(index)}/></div>})}
            {totalLocationList.flat().length === 0 && <NoResult desc=""/>}
        </div>
    }
}

export default LocationListWrapper;