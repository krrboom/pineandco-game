# Pine & Co — Happy Hour 앱 (안드로이드 손잡이 게임기용)

`https://pineandco.online/?pad=1&app=1` 을 전체화면 WebView 로 띄우는 얇은 앱.
패드 버튼은 사이트가 아는 키보드 키로 바꿔 보낸다 (A/X/Y/START → Enter, B/SELECT → Escape, 십자키·스틱 → 화살표).

- 내려받기: **https://pineandco.online/app.apk** (최신 빌드로 자동 연결)
- 빌드: `main` 에 push 하면 GitHub Actions 가 서명된 APK 를 만들어 Releases 에 올린다.
- 서명 키는 저장소 비밀(KEYSTORE_B64 / KS_PASS / KEY_ALIAS / KEY_PASS)에만 있다. 키가 바뀌면 기기에서 지우고 다시 설치해야 한다.
