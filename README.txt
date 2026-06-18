Pine & Co — Cocktail Defense  ·  GitHub 업로드 (1차)
=====================================================

GitHub 웹은 한 번에 100개까지만 올라가서, 에셋을 2번에 나눠 올립니다.
순서대로 두 폴더를 올리면 됩니다.

[1차 — 이 폴더(github-업로드)]  총 94개
  index.html      ← 게임 본체
  sandbox.html    ← 테스트 모드
  .nojekyll       ← (숨김파일) GitHub Pages용
  README.txt
  assets/         ← 이미지·소리 90개 (먼저 올림)

[2차 — github-업로드-2차 폴더]  총 66개
  assets/         ← 나머지 이미지·소리 66개

────────────────────────────
올리는 순서 (GitHub 웹)
────────────────────────────
1) 저장소 → "Add file" → "Upload files"
2) 이 폴더(github-업로드)의 index.html + sandbox.html + .nojekyll + assets 폴더를 드래그
3) Commit changes
4) 다시 "Add file" → "Upload files"
5) github-업로드-2차 폴더 안의 assets 폴더를 드래그
   (같은 assets/ 경로에 나머지 66개가 추가됩니다 — 기존 건 안 지워짐)
6) Commit changes
7) (GitHub Pages) Settings → Pages 에서 main 브랜치로 배포

[중요]
  - 1차·2차 둘 다 assets 폴더로 올라가서 합쳐집니다(총 156개).
  - .nojekyll 이 안 보이면 숨김파일이라 그렇습니다. 같이 올라가야 합니다.
  - 코드만 바뀐 다음 업데이트는 index.html(+sandbox.html)만 다시 올리면 됩니다.

[폰에서 확인]
  배포 후 캐시 때문에 안 바뀌어 보이면 새로고침 또는
  Safari 설정 → 방문 기록·웹사이트 데이터 지우기 한 번 해주세요.
