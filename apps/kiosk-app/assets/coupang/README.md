# 쿠팡 연습용 이미지 교체 위치

## 상품별 이미지

아래 파일들을 같은 이름으로 교체하면 됩니다.

| 파일명 | 샘플 상품 |
| --- | --- |
| `product-main.png` | 라벤더 화장지 |
| `product-tissue-natural.png` | 천연펄프 4겹 화장지 |
| `product-tissue-soft.png` | 순면감촉 3겹 화장지 |
| `product-tissue-eco.png` | 친환경 대나무 화장지 |
| `product-tissue-compact.png` | 가성비 2겹 화장지 |
| `product-water.png` | 생수 |
| `product-rice.png` | 쌀 |
| `product-detergent.png` | 세탁세제 |
| `product-ramen.png` | 라면 |
| `product-shampoo.png` | 샴푸 |
| `product-socks.png` | 양말 |
| `product-apple.png` | 사과 |

- 권장 크기: 1200 × 1200px 정사각형
- 배경: 흰색 또는 투명
- 용도: 홈 추천 상품, 검색 결과, 상품 상세, 주문 확인 화면

사진을 바꿀 때는 위 표의 파일명을 그대로 맞춰 기존 파일을 교체하세요. 코드는 수정하지 않아도 반영됩니다.

상품명·가격·검색어·할인율 등 샘플 정보는 `src/coupang/data/products.ts`에서 수정할 수 있습니다.

## 참고

- PNG 사용을 권장합니다.
- 상품이 이미지 중앙에 있고 사방에 여백이 있는 사진이 가장 자연스럽습니다.
- 안드로이드 앱에서 바로 반영되지 않으면 앱을 다시 빌드하거나 Metro 캐시를 새로고침하세요.
