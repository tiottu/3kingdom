package io.github.tiottu.kkomajangsu;

// 삼국지 꼬마 장수 안드로이드 앱: 크롬이 없어도 되게, 폰에 늘 있는 웹뷰(Android System WebView)로 게임 사이트를 연다.
// 게임 내용은 사이트에서 받아 오므로, 게임을 고쳐서 사이트에 올리면 앱을 다시 깔지 않아도 새 버전이 된다.

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    static final String SITE = "https://tiottu.github.io/3kingdom/";
    static final String HOST = "tiottu.github.io";
    WebView web;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#b03a2e"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#fff8e7"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);           // 도감·별명 저장 (localStorage)
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // 효과음
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setTextZoom(100);                     // 폰 글자 크기 설정과 상관없이 화면이 깨지지 않게
        s.setUserAgentString(s.getUserAgentString() + " KkomaJangsuApp");

        web.setWebChromeClient(new WebChromeClient()); // confirm("그만할까요?") 같은 창을 보여 준다
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false; // 게임 안은 앱에서
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { /* 열 앱이 없으면 그냥 둔다 */ }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (!req.isForMainFrame()) return;
                view.loadDataWithBaseURL(null,
                    "<html><body style='font-family:sans-serif;background:#fff8e7;color:#3a2a20;text-align:center;padding:40px 20px'>"
                    + "<div style='font-size:48px'>📶</div><h2>인터넷이 연결되지 않았어요</h2>"
                    + "<p>와이파이나 데이터를 켜고 아래 버튼을 눌러 주세요.</p>"
                    + "<button style='font-size:20px;padding:12px 24px;border:none;border-radius:16px;background:#3fa34d;color:#fff' "
                    + "onclick=\"location.href='" + SITE + "'\">다시 해 보기</button></body></html>",
                    "text/html", "utf-8", null);
            }
        });

        setContentView(web);
        if (saved != null) web.restoreState(saved);
        else web.loadUrl(SITE);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        // 게임은 화면 안에서 "← 뒤로" 버튼을 쓴다. 휴대폰 뒤로 버튼은 웹 기록이 있으면 뒤로, 없으면 앱을 닫는다.
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }
}
