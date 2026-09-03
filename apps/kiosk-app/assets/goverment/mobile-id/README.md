# 주민등록증 모바일 확인 연습 이미지

이 폴더에 아래 파일을 넣습니다.

- `portrait.png`: 주민등록증에 표시할 사람 이미지(정사각형 권장)
- `qr.png`: 확인용 QR 이미지(정사각형 권장)
- `skt.png`, `kt.png`, `lgu.png`, `mvno.png`: 통신사 로고(투명 PNG 권장)

파일을 넣은 뒤 `src/gov24/data/mobileIdAssets.ts`의 `null` 값을 주석의
`require(...)` 예시처럼 변경하면 됩니다. 이미지가 없어도 연습 화면은
기본 자리표시자로 정상 작동합니다.
