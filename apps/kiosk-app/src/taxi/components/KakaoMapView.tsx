import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { TaxiPlace } from "../screens/TaxiDestinationScreen";

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY?.trim();

type RoutePoint = { latitude: number; longitude: number };
const EMPTY_ROUTE_PATH: RoutePoint[] = [];
type MapMessage =
  | { type: "places"; places: TaxiPlace[] }
  | { type: "center"; place: TaxiPlace; reason?: "initial" | "drag" }
  | { type: "error" };

type Props = {
  query?: string;
  center?: Pick<TaxiPlace, "latitude" | "longitude">;
  routePath?: RoutePoint[];
  onPlaces?: (places: TaxiPlace[]) => void;
  onCenter?: (place: TaxiPlace, reason?: "initial" | "drag") => void;
};

export function KakaoMapView({
  query = "",
  center,
  routePath = EMPTY_ROUTE_PATH,
  onPlaces,
  onCenter,
}: Props) {
  const [failed, setFailed] = useState(false);
  const latitude = center?.latitude ?? 37.5774;
  const longitude = center?.longitude ?? 126.8909;
  const html = useMemo(
    () =>
      createMapHtml(
        KAKAO_JS_KEY ?? "",
        query,
        latitude,
        longitude,
        routePath,
      ),
    [query, latitude, longitude, routePath],
  );
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as MapMessage;
      if (message.type === "places") onPlaces?.(message.places);
      if (message.type === "center") onCenter?.(message.place, message.reason);
      if (message.type === "error") setFailed(true);
    } catch {
      setFailed(true);
    }
  };
  if (!KAKAO_JS_KEY || failed)
    return (
      <View style={s.fallback}>
        <Text style={s.icon}>🗺️</Text>
        <Text style={s.title}>카카오 지도 설정이 필요해요</Text>
        <Text style={s.text}>
          JavaScript 키를 넣으면 실제 지도와 장소 검색이 표시됩니다.{`\n`}
          키가 없어도 연습용 장소는 선택할 수 있어요.
        </Text>
      </View>
    );
  return (
    <WebView
      source={{ html, baseUrl: "https://smartkio.local" }}
      originWhitelist={["https://*"]}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      onMessage={handleMessage}
      onError={() => setFailed(true)}
      onHttpError={() => setFailed(true)}
      style={s.webview}
    />
  );
}

function createMapHtml(
  key: string,
  query: string,
  latitude: number,
  longitude: number,
  routePath: RoutePoint[],
) {
  const safeQuery = JSON.stringify(query);
  const safeRoutePath = JSON.stringify(
    routePath.filter(
      (point) =>
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude) &&
        point.latitude >= 33 &&
        point.latitude <= 39 &&
        point.longitude >= 124 &&
        point.longitude <= 132,
    ),
  );
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body,#map{width:100%;height:100%;margin:0}body{overflow:hidden}.route-label{padding:7px 11px;border-radius:7px;background:#202124;color:#fff;font:700 13px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.25)}.route-label.end{background:#e42b37}</style></head><body><div id="map"></div><script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false"></script><script>kakao.maps.load(function(){var center=new kakao.maps.LatLng(${latitude},${longitude});var map=new kakao.maps.Map(document.getElementById('map'),{center:center,level:4});var geocoder=new kakao.maps.services.Geocoder();var markers=[];function send(v){window.ReactNativeWebView.postMessage(JSON.stringify(v));}function clear(){markers.forEach(function(m){m.setMap(null)});markers=[];}function centerInfo(reason){var c=map.getCenter();geocoder.coord2Address(c.getLng(),c.getLat(),function(r,s){var a=s===kakao.maps.services.Status.OK&&r[0]?(r[0].road_address?r[0].road_address.address_name:r[0].address.address_name):'지도에서 선택한 위치';send({type:'center',reason:reason,place:{name:a,address:a,latitude:c.getLat(),longitude:c.getLng()}});});}var route=${safeRoutePath};if(route.length>1){var routeBounds=new kakao.maps.LatLngBounds();var linePath=route.map(function(p){var point=new kakao.maps.LatLng(p.latitude,p.longitude);routeBounds.extend(point);return point;});new kakao.maps.Polyline({map:map,path:linePath,strokeWeight:7,strokeColor:'#1769ff',strokeOpacity:.92,strokeStyle:'solid'});new kakao.maps.CustomOverlay({map:map,position:linePath[0],content:'<div class="route-label">출발</div>',yAnchor:1.5});new kakao.maps.CustomOverlay({map:map,position:linePath[linePath.length-1],content:'<div class="route-label end">도착</div>',yAnchor:1.5});function fitRoute(){map.relayout();map.setBounds(routeBounds,36,36,36,36);}fitRoute();setTimeout(fitRoute,150);setTimeout(fitRoute,500);}else{kakao.maps.event.addListener(map,'dragend',function(){centerInfo('drag');});centerInfo('initial');}var q=${safeQuery};if(q){var ps=new kakao.maps.services.Places(map);ps.keywordSearch(q,function(data,status){if(status===kakao.maps.services.Status.OK){clear();var bounds=new kakao.maps.LatLngBounds();var places=data.slice(0,8).map(function(p){var pos=new kakao.maps.LatLng(Number(p.y),Number(p.x));markers.push(new kakao.maps.Marker({map:map,position:pos}));bounds.extend(pos);return{name:p.place_name,address:p.road_address_name||p.address_name,latitude:Number(p.y),longitude:Number(p.x)};});map.setBounds(bounds);send({type:'places',places:places});}else{send({type:'places',places:[]});}},{size:8});}});</script></body></html>`;
}

const s = StyleSheet.create({
  webview: { flex: 1, backgroundColor: "#eef1f4" },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#edf1f4",
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "900", color: "#202631", marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 21, textAlign: "center", color: "#6d7480" },
});
