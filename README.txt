Pine & Co — Cocktail Defense  ·  GitHub 업로드용 폴더
=====================================================

이 폴더 안의 것을 GitHub 저장소에 통째로 올리면 됩니다.

[들어있는 것]
  index.html     ← 게임 본체 (이거 하나가 게임 전부)
  assets/        ← 이미지·음악·효과음 (100개)
  .nojekyll      ← GitHub Pages가 폴더를 그대로 서비스하게 하는 빈 파일

[올리는 법 — GitHub 웹]
  1. GitHub 저장소 페이지 → "Add file" → "Upload files"
  2. 이 폴더 안의 index.html + assets 폴더 + .nojekyll 을 드래그
  3. Commit changes
  4. (GitHub Pages 사용 시) Settings → Pages 에서 main 브랜치로 배포

[중요]
  - index.html 과 assets/ 는 항상 "같이" 올려야 합니다 (경로가 assets/... 상대경로).
  - .nojekyll 이 안 보이면 숨김파일이라 그렇습니다. 같이 올라가야 합니다.
  - 코드만 바뀐 업데이트는 index.html 만 다시 올려도 됩니다.
    (이미지·소리가 바뀐 경우에만 assets 도 같이)

[폰에서 확인]
  배포 후 폰 브라우저는 캐시가 남을 수 있으니, 새로고침 또는
  Safari 설정 → 방문 기록·웹사이트 데이터 지우기 한 번 해주세요.
