export type DeliveryAddress = {
  id: string;
  name: string;
  roadAddress: string;
  detail: string;
  request: string;
  latitude?: string;
  longitude?: string;
};

export type AddressSearchResult = {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  x: string;
  y: string;
};
