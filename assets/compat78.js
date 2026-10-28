/* compat78.js — 옛 크롬(78 등, Anbernic RG Rotate 내장 브라우저) 호환 보정.
   clamp()/min()/max()(크롬 79+), inset(87), dvh 를 모르는 브라우저는 그 선언을 통째로 버려서
   글자·버튼·그림이 원본 크기(거대)로 나온다. 여기서는 <style> 원문을 직접 읽어 그 선언만
   현재 화면 크기로 숫자 계산해 px 로 다시 넣는다. clamp 를 아는 브라우저(손님 폰)에서는 아무것도 하지 않는다.
   강제 시험: ?compat=1 (최신 크롬에서도 돌려 계산값이 원래 clamp 결과와 같은지 비교할 수 있다) */
(function(){
  var force = /[?&]compat=1/.test(location.search);
  var supports = false;
  try { supports = window.CSS && CSS.supports && CSS.supports('width', 'clamp(1px,2px,3px)') && CSS.supports('inset', '0'); } catch (e) {}
  if (supports && !force) return;

  var FN = /\b(clamp|min|max)\(/;
  function num(tok, ctx) {   // '12px' '2.6vw' '1.5em' '40%' '0' → px
    var m = /^(-?\d*\.?\d+)(px|vw|vh|vmin|vmax|dvh|dvw|em|rem|%)?$/.exec(tok.trim());
    if (!m) throw 0;
    var v = parseFloat(m[1]), u = m[2] || 'px';
    var W = ctx.w, H = ctx.h;
    switch (u) { case 'px': return v; case 'vw': case 'dvw': return v * W / 100; case 'vh': case 'dvh': return v * H / 100;
      case 'vmin': return v * Math.min(W, H) / 100; case 'vmax': return v * Math.max(W, H) / 100;
      case 'em': case 'rem': return v * 16; case '%': return v * (ctx.base || W) / 100; }
    throw 0;
  }
  // tiny expression evaluator: numbers with units, + - * /, parentheses, clamp/min/max/calc
  function evalExpr(s, ctx) {
    var i = 0;
    function ws() { while (i < s.length && /\s/.test(s[i])) i++; }
    function args() { var out = []; ws(); for (;;) { out.push(sum()); ws(); if (s[i] === ',') { i++; continue; } if (s[i] === ')') { i++; return out; } throw 0; } }
    function atom() {
      ws(); var m = /^(clamp|min|max|calc)\(/.exec(s.slice(i));
      if (m) { i += m[0].length; var a = args();
        if (m[1] === 'clamp') return Math.min(Math.max(a[1], a[0]), a[2]);
        if (m[1] === 'min') return Math.min.apply(null, a); if (m[1] === 'max') return Math.max.apply(null, a); return a[0]; }
      if (s[i] === '(') { i++; var v = sum(); ws(); if (s[i] !== ')') throw 0; i++; return v; }
      var t = /^-?\d*\.?\d+(px|vw|vh|vmin|vmax|dvh|dvw|em|rem|%)?/.exec(s.slice(i)); if (!t) throw 0; i += t[0].length; return num(t[0], ctx);
    }
    function prod() { var v = atom(); for (;;) { ws(); if (s[i] === '*') { i++; v *= atom(); } else if (s[i] === '/') { i++; v /= atom(); } else return v; } }
    function sum() { var v = prod(); for (;;) { ws(); if (s[i] === '+') { i++; v += prod(); } else if (s[i] === '-') { i++; v -= prod(); } else return v; } }
    var r = sum(); ws(); if (i !== s.length) throw 0; return r;
  }
  // very small CSS splitter: returns [{media, selector, decls:[[prop,value],...]}], skipping @keyframes/@font-face
  function parseCSS(text) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    var out = [], stack = [], i = 0, n = text.length;
    while (i < n) {
      var open = text.indexOf('{', i); if (open < 0) break;
      var head = text.slice(i, open).trim();
      if (head[0] === '@') {
        if (/^@(media|supports)/.test(head)) { stack.push(head.replace(/^@media\s*/, '').replace(/^@supports.*/, '__supports__')); i = open + 1; continue; }
        // @keyframes / @font-face / @page ...: skip the whole block (with nesting)
        var depth = 1, j = open + 1; while (j < n && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; } i = j; continue;
      }
      var close = text.indexOf('}', open); if (close < 0) break;
      var body = text.slice(open + 1, close), decls = [];
      body.split(';').forEach(function (d) { var k = d.indexOf(':'); if (k < 0) return; var p = d.slice(0, k).trim(), v = d.slice(k + 1).trim();
        if (FN.test(v) || p === 'inset' || /dvh|dvw/.test(v)) decls.push([p, v]); });
      if (decls.length) out.push({ media: stack.slice(), selector: head, decls: decls });
      i = close + 1;
      // pop closed media blocks
      var k2 = i; while (k2 < n && /\s/.test(text[k2])) k2++;
      while (text[k2] === '}' && stack.length) { stack.pop(); i = k2 + 1; k2 = i; while (k2 < n && /\s/.test(text[k2])) k2++; }
    }
    return out;
  }
  var rules = null, sheet = null;
  function mediaOK(list) { for (var i = 0; i < list.length; i++) { var q = list[i]; if (q === '__supports__') return false; try { if (!matchMedia(q).matches) return false; } catch (e) { return false; } } return true; }
  function build() {
    var ctx = { w: window.innerWidth, h: window.innerHeight };
    if (!rules) { var css = ''; var st = document.getElementsByTagName('style'); for (var i = 0; i < st.length; i++) css += st[i].textContent + '\n'; rules = parseCSS(css); }
    var out = [];
    rules.forEach(function (r) {
      if (!mediaOK(r.media)) return;
      var lines = [];
      r.decls.forEach(function (d) {
        var p = d[0], v = d[1].replace(/\s*!important\s*$/, '');
        if (p === 'inset') { var parts = v.split(/\s+/); if (parts.length === 1) lines.push('top:' + v + ';right:' + v + ';bottom:' + v + ';left:' + v); return; }
        if (/var\(/.test(v)) return;
        // value may be a list (e.g. "clamp(..) 10px" or "0 clamp(..)"): evaluate each function token in place
        try {
          var nv = v.replace(/(clamp|min|max)\([^;]*?\)(?=(\s|$|\)))/g, function (m) { return Math.round(evalExpr(balanced(m), ctx) * 100) / 100 + 'px'; });
          nv = nv.replace(/(-?\d*\.?\d+)d(vh|vw)/g, function (m, a, u) { return Math.round(num(a + 'v' + u[1], ctx) * 100) / 100 + 'px'; });
          if (nv !== v && !FN.test(nv)) lines.push(p + ':' + nv);
        } catch (e) {}
      });
      if (lines.length) out.push(r.selector + '{' + lines.join(';') + '}');
    });
    if (!sheet) { sheet = document.createElement('style'); sheet.id = 'compat78'; document.head.appendChild(sheet); }
    sheet.textContent = out.join('\n');
    // inline style="" attributes
    var els = document.querySelectorAll('[style*="clamp("],[style*="min("],[style*="max("]');
    for (var e = 0; e < els.length; e++) { var el = els[e], raw = el.getAttribute('style') || ''; if (el.__c78 === raw) continue; el.__c78 = raw;
      raw.split(';').forEach(function (d) { var k = d.indexOf(':'); if (k < 0) return; var p = d.slice(0, k).trim(), v = d.slice(k + 1).trim(); if (!FN.test(v) || /var\(/.test(v)) return;
        try { var nv = v.replace(/(clamp|min|max)\([^;]*\)/g, function (m) { return Math.round(evalExpr(balanced(m), ctx) * 100) / 100 + 'px'; }); if (!FN.test(nv)) el.style.setProperty(p, nv); } catch (x) {} }); }
  }
  // cut a function call at its matching parenthesis (the regex above may over-match a trailing list)
  function balanced(s) { var d = 0; for (var i = 0; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') { d--; if (!d) return s.slice(0, i + 1); } } return s; }
  function run() { try { build(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(run, 120); });
  window.__compat78 = { run: run, rules: function () { return rules; } };
})();
