import { useState } from "react";
import { TaxiDestinationScreen, type PlaceRole, type TaxiPlace } from "./TaxiDestinationScreen";
import { TaxiHomeScreen } from "./TaxiHomeScreen";
import { TaxiMapScreen } from "./TaxiMapScreen";
import { TaxiMapSearchScreen } from "./TaxiMapSearchScreen";

type Page="home"|"search"|"map-search"|"route";

export function TaxiPracticeScreen({onBack,token}:{onBack:()=>void;token:string}){
  const [page,setPage]=useState<Page>("home"); const [role,setRole]=useState<PlaceRole>("destination"); const [mapQuery,setMapQuery]=useState("");
  const [departure,setDeparture]=useState<TaxiPlace>({name:"굿지어디자인",address:"서울 마포구 상암동",latitude:37.5774,longitude:126.8909}); const [destination,setDestination]=useState<TaxiPlace|null>(null);
  const openSearch=(nextRole:PlaceRole)=>{setRole(nextRole);setPage("search");};
  const openMap=(query="",nextRole=role)=>{setRole(nextRole);setMapQuery(query);setPage("map-search");};
  const selectPlace=(place:TaxiPlace)=>{if(role==="departure"){setDeparture(place);setPage(destination?"route":"search");if(!destination)setRole("destination");}else{setDestination(place);setPage("route");}};
  if(page==="home")return <TaxiHomeScreen onBack={onBack} onDestination={()=>openMap("","destination")}/>;
  if(page==="search")return <TaxiDestinationScreen role={role} currentDeparture={departure} onBack={()=>setPage(destination?"route":"home")} onSelect={selectPlace} onOpenMap={openMap}/>;
  if(page==="map-search")return <TaxiMapSearchScreen role={role} initialQuery={mapQuery} onBack={()=>setPage("search")} onSelect={selectPlace}/>;
  if(destination)return <TaxiMapScreen departure={departure} destination={destination} token={token} onBack={()=>setPage("home")} onChangeDeparture={()=>openSearch("departure")} onChangeDestination={()=>openSearch("destination")}/>;
  return <TaxiHomeScreen onBack={onBack} onDestination={()=>openMap("","destination")}/>;
}
