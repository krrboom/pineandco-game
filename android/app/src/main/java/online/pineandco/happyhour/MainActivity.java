package online.pineandco.happyhour;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Toast;

/**
 * Pine & Co Happy Hour — 손잡이 게임기(RG Rotate 등)용 앱.
 * pineandco.online 을 전체화면 WebView 로 띄우고, 패드 버튼을 사이트가 아는 키보드 키로 바꿔 보낸다.
 *   A / X / Y / START / 십자키 가운데 → Enter       B / SELECT → Escape       십자키·아날로그 스틱 → 화살표
 * 사이트는 UA 의 "PineAndCoApp" 을 보고 게임패드 API 대신 키보드 입력만 쓴다 (입력 두 번 들어가는 것 방지).
 */
public class MainActivity extends Activity {
    static final String HOME = "https://pineandco.online/?pad=1&app=1";
    static final String OFFLINE =
        "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width'>" +
        "<body style='margin:0;background:#0d0f0c;color:#f0ebe0;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center'>" +
        "<div><div style='font-size:22px;margin-bottom:14px'>NO CONNECTION</div><div style='opacity:.7'>Wi-Fi 를 확인하고<br>A 버튼을 누르세요</div></div>" +
        "<script>function go(){location.replace('" + HOME + "')}addEventListener('keydown',function(e){if(e.key==='Enter')go()});addEventListener('click',go)</script>";

    WebView wv;
    long lastBack = 0;
    final boolean[] hat = new boolean[4];   // up, down, left, right (아날로그 스틱/햇 → 십자키)

    @Override protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " PineAndCoApp/1");
        wv.setBackgroundColor(0xFF0D0F0C);
        wv.setFocusable(true);
        wv.setFocusableInTouchMode(true);
        wv.setWebChromeClient(new WebChromeClient());
        wv.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl(); String h = u.getHost() == null ? "" : u.getHost();
                if (h.endsWith("pineandco.online") || h.endsWith("onrender.com") || h.endsWith("googleapis.com") || h.endsWith("gstatic.com")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;   // 인스타그램 등 바깥 링크는 기기 브라우저로
            }
            @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame()) v.loadDataWithBaseURL(null, OFFLINE, "text/html", "utf-8", null);
            }
        });
        setContentView(wv);
        if (saved != null) wv.restoreState(saved); else wv.loadUrl(HOME);
        wv.requestFocus();
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); wv.saveState(out); }
    @Override protected void onResume() { super.onResume(); hideBars(); wv.onResume(); }
    @Override protected void onPause() { wv.onPause(); super.onPause(); }
    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) hideBars(); }

    /** 상태바·내비바 숨김(몰입 모드). 가장자리를 쓸면 잠깐 나왔다가 다시 숨는다. */
    void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    /** 패드 버튼 → 사이트가 아는 키 */
    static int map(int code) {
        switch (code) {
            case KeyEvent.KEYCODE_BUTTON_A: case KeyEvent.KEYCODE_BUTTON_X: case KeyEvent.KEYCODE_BUTTON_Y:
            case KeyEvent.KEYCODE_BUTTON_START: case KeyEvent.KEYCODE_DPAD_CENTER: case KeyEvent.KEYCODE_NUMPAD_ENTER:
                return KeyEvent.KEYCODE_ENTER;
            case KeyEvent.KEYCODE_BUTTON_B: case KeyEvent.KEYCODE_BUTTON_SELECT:
                return KeyEvent.KEYCODE_ESCAPE;
            default: return 0;
        }
    }

    void sendKey(int code, int action) {
        long t = SystemClock.uptimeMillis();
        wv.dispatchKeyEvent(new KeyEvent(t, t, action, code, 0));
    }

    @Override public boolean dispatchKeyEvent(KeyEvent e) {
        int c = e.getKeyCode();
        if (c == KeyEvent.KEYCODE_BACK) {   // 뒤로 키: 사이트의 B(Escape). 1.5초 안에 두 번이면 앱 종료
            if (e.getAction() == KeyEvent.ACTION_DOWN && e.getRepeatCount() == 0) {
                if (wv.canGoBack()) { wv.goBack(); return true; }   // 소개서·예약 등 다른 페이지면 이전 페이지로
                long now = SystemClock.uptimeMillis();
                if (now - lastBack < 1500) { finish(); return true; }
                lastBack = now;
                Toast.makeText(this, "한 번 더 누르면 종료 / press again to exit", Toast.LENGTH_SHORT).show();
                sendKey(KeyEvent.KEYCODE_ESCAPE, KeyEvent.ACTION_DOWN);
            } else if (e.getAction() == KeyEvent.ACTION_UP) sendKey(KeyEvent.KEYCODE_ESCAPE, KeyEvent.ACTION_UP);
            return true;
        }
        int m = map(c);
        if (m != 0) {
            if (e.getRepeatCount() == 0 || e.getAction() == KeyEvent.ACTION_UP) sendKey(m, e.getAction());
            return true;
        }
        return super.dispatchKeyEvent(e);   // 십자키(DPAD_*)는 WebView 가 그대로 화살표 키로 넘긴다
    }

    /** 아날로그 스틱·햇 스위치 → 십자키 눌림/뗌 */
    @Override public boolean dispatchGenericMotionEvent(MotionEvent ev) {
        int src = ev.getSource();
        if ((src & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK || (src & InputDevice.SOURCE_DPAD) == InputDevice.SOURCE_DPAD) {
            float x = ev.getAxisValue(MotionEvent.AXIS_HAT_X), y = ev.getAxisValue(MotionEvent.AXIS_HAT_Y);
            if (Math.abs(x) < 0.5f) x = ev.getAxisValue(MotionEvent.AXIS_X);
            if (Math.abs(y) < 0.5f) y = ev.getAxisValue(MotionEvent.AXIS_Y);
            boolean[] now = { y < -0.5f, y > 0.5f, x < -0.5f, x > 0.5f };
            int[] codes = { KeyEvent.KEYCODE_DPAD_UP, KeyEvent.KEYCODE_DPAD_DOWN, KeyEvent.KEYCODE_DPAD_LEFT, KeyEvent.KEYCODE_DPAD_RIGHT };
            for (int i = 0; i < 4; i++) if (now[i] != hat[i]) { hat[i] = now[i]; sendKey(codes[i], now[i] ? KeyEvent.ACTION_DOWN : KeyEvent.ACTION_UP); }
            return true;
        }
        return super.dispatchGenericMotionEvent(ev);
    }
}
