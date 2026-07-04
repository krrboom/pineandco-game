# Pine & Co — Cocktail Defense (project context for Claude)

Single self-contained game in **`index.html`** (~540KB, one big `<script>`). Vampire-Survivors-style
top-down survival: a bartender fends off unruly guests with cocktails. Repo:
`https://github.com/krrboom/pineandco-game`.

This file exists so **any machine's Claude has full context** — the user develops on 2 Macs
(this one + a desktop); chat history and `~/.claude` memory do NOT sync between them, only this git
repo does. Read this first, keep it updated when you change the game.

## ⚙️ Cross-machine workflow (IMPORTANT — do this automatically)
- **Session start → `git pull`** (get the other machine's latest before editing).
- **After changes → `git add -A && git commit -m "…" && git push`.**
- The user just says "받아줘 / 올려줘"; you run the git. Auth is a GitHub PAT in each Mac's
  **macOS keychain** (per-machine, set up once). If push says "could not read Username", ask the
  user for a fresh PAT (`repo` scope) → `git credential-osxkeychain store`.
- End commit messages with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

## 🧪 Verify / run locally (no node/deno on these Macs — only python3)
- **Syntax check:** in a preview_eval, fetch the file, slice `<script>…</script>`, `new Function(js)`
  — throws on parse errors. For the exact line, load the script as a Blob `<script>` and read
  `window.onerror` lineno.
- **Runtime check:** `startGame('pat')`, set `player.weapons`/`player.superLv`, push dummy `enemies`,
  call `fireCocktail(key,lv)` and loop `update()` ~150× inside preview_eval, catch errors.
- **Serve:** the preview sandbox can't read `~/Desktop` (macOS TCC) and `python3 -m http.server`
  fails there (blocks `os.getcwd`). Workaround: copy `index.html` to the session scratchpad and serve
  with a tiny script that hardcodes the dir via `functools.partial(SimpleHTTPRequestHandler,
  directory=DIR)`; point `.claude/launch.json` at it (absolute path); re-copy after each edit + reload.

## 🎮 Current design (after the big rebalance)
**Characters** (base attack levels 1→6 = `MAX_BASE_LV`):
- **Pat** — Shaker, 130 HP tanky, **+2 max HP/level**, base = cobbler-shaker splash AoE, ULT = Shaker Tornado.
- **Joe** — Stirrer, 85 HP fragile/fast, **+1 max HP/level** + passive regen, base = barspoon/mixglass pierce line, ULT = Untouchable (invuln + spikes).

**Cocktails = weapons** (Lv1→8, `fireCocktail`). Deliberately **weak at Lv1**, scale up
(`P = 0.33 * 1.42^(lv-1)`). Each has a distinct Vampire-Survivors-style pattern:
- GIMLET=daggers (fires in aim/move direction, Lv1=1 dart→8), HIGHBALL=forward fizz splash,
  MOJITO=shotgun cone in aim dir (Lv1=1), VODKA TONIC=magic-wand homing ice bolt,
  MANHATTAN=fire-wand random big bomb, OLD FASHIONED=axe (arcs up, falls), MARGARITA=cross boomerang,
  SIDECAR=runetracer (wall-bounce + short trail), VODKA CRANBERRY=piercing comet line,
  GIN TONIC=garlic reimagined (semi-transparent gin-tonic hitbox trailing BEHIND player, damages on touch),
  SOUTH SIDE=**Mint Rain** (bombs fall from sky one by one, random landing w/ shadow, slow+poison, CD 130),
  COSMOPOLITAN=soda-gun cranberry gatling (locks a target), DRY MARTINI=King-Bible olive orbit,
  VODKA MARTINI=soda-gun olive gatling.

**Materials = passive stats ONLY** (Lv1→8, cointreau Lv3). No standalone stat cards anymore
(`GENERIC=[]`): lemon=dmg, lime/soda=fire rate, orange/sugar=area, **cointreau=+1 projectile/level (max Lv3)**,
tonic=pierce, mint=move, water=regen, olive=armor, sweetver=max HP, **dryver=crit (aura removed)**,
cranberry=magnet, angostura=xp + unlocks dash. Sweet/dry vermouth have **no aura/wormwood** now —
that damage aura only exists on the crafted **BLACK VERMOUTH** combo.

**Super cocktails** (`player.superLv`, 1→8): evolve requires **base attack maxed (Lv6) + cocktail Lv8 +
key ingredient at its own max** (`canEvolve` uses `g.max`, so cointreau-based ones need Lv3). Spirits NOT
needed. Only **boss tips** offer evolution. Super damage = base-Lv8 × `0.85 * 1.166^(superLv-1)`
→ Lv1 ≈ 0.85× base-Lv8 (starts ~100 dmg, slightly weaker than base Lv8), Lv8 = **2.5× base-Lv8**. Effects
(freeze/slow/poison/explode) also boosted ~1.6× for supers.

**Drops** (normal kill): firecross 0.15% / timestop 0.35% / magnet 0.4% / health 1% / else coin.
Boss: cash bill + tip (100%). **No ingredient/spirit field drops.**
- **Flame Cross** (불뿜는 십자가): 5s directional flamethrower in move direction, rainbow-gun-tier (dmg 400). Drop icon = a clear crucifix.
- **Time Stop**: 5s, freezes all enemies + their projectiles.

**Boss tip pool** = evolution + upgrades to **owned** cocktails/materials only (no new items, no base/ult,
no generic stats). **XP need ×5** (slow leveling). Base HP regen halved. Spirits are vestigial (only feed
the unreachable Rainbow Gun).

## 📌 Current state / next steps
- Repo unified at commit `baecec5` (this session's rebalance + desktop's Mint-Rain/HP-scaling + a bug fix
  where cointreau-evo cocktails could never evolve). Local == origin/main.
- **Next:** hook up a **custom domain** to remove `onrender.com` from the hosted URL (buy a domain →
  Render → Settings → Custom Domains → set CNAME). Deploy is Render auto-building from GitHub `main`.
