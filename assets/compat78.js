/* compat78.js — 옛 크롬(78 등, Anbernic RG Rotate 내장 브라우저) 호환 보정.
   그 브라우저는 clamp()/min()/max()(크롬 79+), inset(87), dvh, aspect-ratio(88), flex gap(84) 을 몰라 선언을 통째로 버린다.
   → 글자·버튼·그림이 원본 크기로, aspect-ratio 로 높이를 잡는 카드(.gcard 등)는 높이 0 이 되어 13개가 한 자리에 겹친다.
   여기서는 <style> 원문을 직접 읽어 (1) clamp/min/max/dvh 를 현재 화면 크기로 px 계산해 다시 넣고 (2) inset → top/right/bottom/left,
   (3) aspect-ratio 는 요소마다 실제 너비로 높이를 지정, (4) flex gap 은 자식 margin 으로 흉내 낸다. 화면이 바뀌거나 DOM 이 바뀌면 다시 계산.
   clamp 를 아는 브라우저(손님 폰)에서는 아무것도 하지 않는다. 강제 시험: ?compat=1 */
(function(){
  var force = /[?&]compat=1/.test(location.search);
  var supports = false;
  try { supports = window.CSS && CSS.supports && CSS.supports('width', 'clamp(1px,2px,3px)') && CSS.supports('inset', '0') && CSS.supports('aspect-ratio', '1/1'); } catch (e) {}
  if (supports && !force) return;

  var FN = /\b(clamp|min|max)\(/;
  function num(tok, ctx) {
    var m = /^(-?\d*\.?\d+)(px|vw|vh|vmin|vmax|dvh|dvw|em|rem|%)?$/.exec(tok.trim());
    if (!m) throw 0;
    var v = parseFloat(m[1]), u = m[2] || 'px', W = ctx.w, H = ctx.h;
    switch (u) { case 'px': return v; case 'vw': case 'dvw': return v * W / 100; case 'vh': case 'dvh': return v * H / 100;
      case 'vmin': return v * Math.min(W, H) / 100; case 'vmax': return v * Math.max(W, H) / 100;
      case 'em': case 'rem': return v * 16; case '%': return v * (ctx.base || W) / 100; }
    throw 0;
  }
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
  function balanced(s) { var d = 0; for (var i = 0; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') { d--; if (!d) return s.slice(0, i + 1); } } return s; }
  function parseCSS(text) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    var out = [], stack = [], i = 0, n = text.length;
    while (i < n) {
      var open = text.indexOf('{', i); if (open < 0) break;
      var head = text.slice(i, open).trim();
      if (head[0] === '@') {
        if (/^@(media|supports)/.test(head)) { stack.push(head.replace(/^@media\s*/, '').replace(/^@supports[\s\S]*/, '__supports__')); i = open + 1; continue; }
        var depth = 1, j = open + 1; while (j < n && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; } i = j; continue;
      }
      var close = text.indexOf('}', open); if (close < 0) break;
      var body = text.slice(open + 1, close), decls = [];
      body.split(';').forEach(function (d) { var k = d.indexOf(':'); if (k < 0) return; var p = d.slice(0, k).trim(), v = d.slice(k + 1).trim();
        if (FN.test(v) || p === 'inset' || p === 'aspect-ratio' || p === 'gap' || /dvh|dvw/.test(v)) decls.push([p, v]); });
      if (decls.length) out.push({ media: stack.slice(), selector: head, decls: decls });
      i = close + 1;
      var k2 = i; while (k2 < n && /\s/.test(text[k2])) k2++;
      while (text[k2] === '}' && stack.length) { stack.pop(); i = k2 + 1; k2 = i; while (k2 < n && /\s/.test(text[k2])) k2++; }
    }
    return out;
  }
  var rules = null, sheet = null, arRules = [], gapRules = [];
  /* ?compat=1 시험 모드(최신 크롬): 크롬 78처럼 보이게 원본 <style>에서 그 브라우저가 못 읽는 선언을 실제로 지운다.
     그래야 보정이 빠뜨린 선언이 최신 크롬에서 몰래 살아남지 않고 눈에 보인다. (실제 옛 브라우저에서는 이미 버려져 있어 할 일 없음) */
  var stripped = false;
  function stripForTest() {
    if (stripped || !(force && supports)) return; stripped = true;
    var st = document.getElementsByTagName('style');
    for (var i = 0; i < st.length; i++) { if (st[i].id === 'compat78') continue;
      st[i].textContent = st[i].textContent.replace(/([a-z-]+)\s*:\s*([^;{}]*?)(;|(?=\}))/g, function (m, p, v, end) {
        if (/\b(clamp|min|max)\(/.test(v) || /\bd(vh|vw)\b/.test(v) || p === 'inset' || p === 'aspect-ratio' || p === 'gap' || p === 'row-gap' || p === 'column-gap') return end === ';' ? '' : '';
        return m; }); }
  }
  function mediaOK(list) { for (var i = 0; i < list.length; i++) { var q = list[i]; if (q === '__supports__') return false; try { if (!matchMedia(q).matches) return false; } catch (e) { return false; } } return true; }
  function pxOf(v, ctx) {
    var nv = v.replace(/(clamp|min|max)\([^;]*?\)(?=(\s|$|\)))/g, function (m) { return Math.round(evalExpr(balanced(m), ctx) * 100) / 100 + 'px'; });
    nv = nv.replace(/(-?\d*\.?\d+)d(vh|vw)/g, function (m, a, u) { return Math.round(num(a + 'v' + u[1], ctx) * 100) / 100 + 'px'; });
    return nv;
  }
  function build() {
    var ctx = { w: window.innerWidth, h: window.innerHeight };
    if (!rules) { var css = ''; var st = document.getElementsByTagName('style'); for (var i = 0; i < st.length; i++) css += st[i].textContent + '\n'; rules = parseCSS(css); stripForTest(); }
    var out = []; arRules = []; gapRules = [];
    rules.forEach(function (r) {
      if (!mediaOK(r.media)) return;
      var lines = [];
      r.decls.forEach(function (d) {
        var p = d[0], v = d[1].replace(/\s*!important\s*$/, '');
        if (p === 'inset') { var parts = v.split(/\s+/); if (parts.length === 1) lines.push('top:' + v + ';right:' + v + ';bottom:' + v + ';left:' + v); return; }
        if (p === 'aspect-ratio') { var ar = /^\s*([\d.]+)\s*(?:\/\s*([\d.]+))?\s*$/.exec(v); if (ar) arRules.push({ sel: r.selector, ratio: parseFloat(ar[1]) / (ar[2] ? parseFloat(ar[2]) : 1) }); return; }
        if (p === 'gap') { try { var g = pxOf(v, ctx).split(/\s+/).map(parseFloat); if (!isNaN(g[0])) gapRules.push({ sel: r.selector, row: g[0], col: isNaN(g[1]) ? g[0] : g[1] }); } catch (e) {} return; }
        if (/var\(/.test(v)) return;
        try { var nv = pxOf(v, ctx); if (nv !== v && !FN.test(nv)) lines.push(p + ':' + nv); } catch (e) {}
      });
      if (lines.length) out.push(r.selector + '{' + lines.join(';') + '}');
    });
    if (!sheet) { sheet = document.createElement('style'); sheet.id = 'compat78'; document.head.appendChild(sheet); }
    sheet.textContent = out.join('\n');
    var els = document.querySelectorAll('[style*="clamp("],[style*="min("],[style*="max("]');
    for (var e = 0; e < els.length; e++) { var el = els[e], raw = el.getAttribute('style') || ''; if (el.__c78 === raw) continue; el.__c78 = raw;
      raw.split(';').forEach(function (d) { var k = d.indexOf(':'); if (k < 0) return; var p = d.slice(0, k).trim(), v = d.slice(k + 1).trim(); if (!FN.test(v) || /var\(/.test(v)) return;
        try { var nv = pxOf(v, ctx); if (!FN.test(nv)) { if (force && supports) el.style.removeProperty(p); el.style.setProperty(p, nv); } } catch (x) {} }); }
    applyElements();
    try { if (window.__fitTitle) window.__fitTitle(); } catch (e) {}   // 크기가 바뀌었으니 시작화면1 zoom 다시
  }
  /* aspect-ratio → 요소 높이, flex gap → 자식 margin (DOM 이 바뀔 때마다 다시) */
  function applyElements() {
    var i, j, list;
    for (i = 0; i < arRules.length; i++) { try { list = document.querySelectorAll(arRules[i].sel); } catch (e) { continue; }
      for (j = 0; j < list.length; j++) { var el = list[j], w = el.clientWidth; if (!w) continue;
        var cs = getComputedStyle(el), pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0), vpad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        var h = (w - pad) / arRules[i].ratio; if (cs.boxSizing === 'border-box') h += vpad + (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
        h = Math.round(h * 10) / 10; if (el.__arH !== h) { el.__arH = h; el.style.height = h + 'px'; } } }
    for (i = 0; i < gapRules.length; i++) { try { list = document.querySelectorAll(gapRules[i].sel); } catch (e) { continue; }
      for (j = 0; j < list.length; j++) { var box = list[j], c = getComputedStyle(box); if (!/flex/.test(c.display)) continue;
        var col = /column/.test(c.flexDirection), wrap = c.flexWrap !== 'nowrap', g = gapRules[i], kids = box.children, k;
        var key = g.row + '/' + g.col + '/' + col + '/' + wrap + '/' + kids.length; if (box.__gapKey === key) continue; box.__gapKey = key;
        for (k = 0; k < kids.length; k++) { var s = kids[k].style;
          if (wrap) { s.marginRight = g.col + 'px'; s.marginBottom = g.row + 'px'; }
          else if (col) { s.marginTop = k ? g.row + 'px' : ''; }
          else { s.marginLeft = k ? g.col + 'px' : ''; } } } }
  }
  function run() { try { build(); } catch (e) {} }
  var t, t2;
  function later() { clearTimeout(t2); t2 = setTimeout(function () { try { applyElements(); } catch (e) {} }, 150); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(run, 120); });
  try { new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] }); } catch (e) {}
  window.__compat78 = { run: run, apply: applyElements, rules: function () { return rules; } };
})();
