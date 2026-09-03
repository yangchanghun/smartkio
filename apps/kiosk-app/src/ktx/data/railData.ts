export type Station = { name: string; km: number };
export type TrainOption = { id: string; departure: string; arrival: string; minutes: number; standardPrice: number; firstPrice: number; cars: number[] };

export const stations: Station[] = [
  { name: "행신", km: 18 }, { name: "서울", km: 0 }, { name: "용산", km: 5 }, { name: "청량리", km: 9 },
  { name: "상봉", km: 14 }, { name: "광명", km: 22 }, { name: "수원", km: 41 }, { name: "평택", km: 75 },
  { name: "천안아산", km: 96 }, { name: "오송", km: 129 }, { name: "대전", km: 160 }, { name: "공주", km: 192 },
  { name: "김천구미", km: 236 }, { name: "서대구", km: 285 }, { name: "동대구", km: 293 }, { name: "경주", km: 330 },
  { name: "울산", km: 370 }, { name: "부산", km: 417 }, { name: "밀양", km: 348 }, { name: "구포", km: 404 },
  { name: "창원중앙", km: 393 }, { name: "창원", km: 401 }, { name: "마산", km: 409 }, { name: "진주", km: 457 },
  { name: "포항", km: 357 }, { name: "익산", km: 243 }, { name: "정읍", km: 286 }, { name: "광주송정", km: 342 },
  { name: "나주", km: 368 }, { name: "목포", km: 411 }, { name: "전주", km: 276 }, { name: "남원", km: 334 },
  { name: "곡성", km: 355 }, { name: "순천", km: 397 }, { name: "여천", km: 423 }, { name: "여수엑스포", km: 435 },
  { name: "양평", km: 55 }, { name: "원주", km: 100 }, { name: "제천", km: 154 }, { name: "평창", km: 180 },
  { name: "진부(오대산)", km: 203 }, { name: "강릉", km: 223 },
];

const pad = (n: number) => String(n).padStart(2, "0");
const time = (minutes: number) => `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;

export function getRouteEstimate(from: string, to: string) {
  const start = stations.find(s => s.name === from)?.km ?? 0;
  const end = stations.find(s => s.name === to)?.km ?? 0;
  const distance = Math.abs(end - start);
  const minutes = Math.max(5, Math.round(4 + distance / 2.78));
  const standardPrice = Math.max(7500, Math.round(distance * 142 / 100) * 100);
  return { distance, minutes, standardPrice, firstPrice: Math.round(standardPrice * 1.45 / 100) * 100 };
}

export function createTrainOptions(from: string, to: string, hour: number): TrainOption[] {
  const estimate = getRouteEstimate(from, to);
  return [15, 62, 109, 184, 244].map((offset, index) => {
    const departureMinutes = hour * 60 + offset;
    const variance = index % 3 === 1 ? 5 : index % 3 === 2 ? 9 : 0;
    return {
      id: `KTX-${509 + index * 4}`,
      departure: time(departureMinutes),
      arrival: time(departureMinutes + estimate.minutes + variance),
      minutes: estimate.minutes + variance,
      standardPrice: estimate.standardPrice,
      firstPrice: estimate.firstPrice,
      cars: [5, 6, 7, 8],
    };
  });
}
