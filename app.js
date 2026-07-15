// Rick AI
const APP_VERSION = "1.0.0";

// KB loaded from kb.js
void KB; // reference to confirm kb.js loaded

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
let S = {
  genre: null, subgenre: "", customSubgenre: "",
  moods: [], customMood: "",
  bpm: null,
  instruments: [], customInstruments: [],
  production: [], customProduction: [],
  qualityTags: [], vocalTags: [],
  metaProductionTags: [], metaMoodTags: [],
  artistRef: "",
  excludes: [], customExcludes: [],
  vocalGender: null,
  customStyleText: "",
  lyricsSections: [],
  useGuidedLyrics: true,
  freeLyrics: "",
  open: { subgenre:true, mood:true, tempo:true, instruments:true, production:true, quality:true, vocal:true, metaprod:false, metamood:false, artistref:false, exclude:true, moreopts:true, vocbuild:false, custom:false, lyrics:true },
  theme: "studio",
  vocalistProfile: null,
  genreGroup: "Caribbean",
  songKey: null, chordProgression: "", customChordProgression: "",
  step: 1, substep: 1, _validateUnlocked: false,
  lang: "en"
};

let dragIdx = null;

// ═══════════════════════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════════════════════
const THEMES = {
  studio:  { name:"Studio",  swatch:"#c9820a",  vars:{"--bg":"#120d07","--surface":"#1c1409","--surface2":"#261b0d","--surface3":"#302212","--border":"#4a3218","--text":"#f5e6d0","--text-dim":"#b08060","--text-muted":"#705040","--l1":"#f59e0b","--l2":"#fb923c","--l3":"#22c55e","--l4":"#10b981","--l5":"#f97316","--l6":"#eab308","--conflict":"#ef4444","--warn":"#f59e0b","--pink":"#f472b6"} },
  default: { name:"Default", swatch:"#8b5cf6", vars:{"--bg":"#1a1625","--surface":"#231d33","--surface2":"#2b2440","--surface3":"#342c4e","--border":"#3d3460","--text":"#ede9f8","--text-dim":"#8b80b0","--text-muted":"#554d78","--l1":"#a78bfa","--l2":"#60a5fa","--l3":"#2dd4bf","--l4":"#4ade80","--l5":"#fb923c","--l6":"#facc15","--conflict":"#f87171","--warn":"#fbbf24","--pink":"#f472b6"} },
  black:   { name:"Black",   swatch:"#1a1a1a",  vars:{"--bg":"#000000","--surface":"#0a0a0a","--surface2":"#111111","--surface3":"#191919","--border":"#242424","--text":"#ffffff","--text-dim":"#909090","--text-muted":"#505050","--l1":"#7c3aed","--l2":"#2563eb","--l3":"#0d9488","--l4":"#16a34a","--l5":"#ea580c","--l6":"#ca8a04","--conflict":"#dc2626","--warn":"#d97706","--pink":"#db2777"} },
  light:   { name:"Light",   swatch:"#e5e7eb",  vars:{"--bg":"#f5f5f7","--surface":"#ffffff","--surface2":"#f0f0f5","--surface3":"#e8e8f0","--border":"#d1d1e0","--text":"#111122","--text-dim":"#555570","--text-muted":"#999ab0","--l1":"#7c3aed","--l2":"#1d4ed8","--l3":"#0f766e","--l4":"#15803d","--l5":"#c2410c","--l6":"#92400e","--conflict":"#dc2626","--warn":"#b45309","--pink":"#be185d"} }
};

function applyTheme(id) {
  if (!THEMES[id]) return;
  S.theme = id;
  const root = document.documentElement;
  Object.entries(THEMES[id].vars).forEach(([k,v]) => root.style.setProperty(k, v));
  const bg = THEMES[id].vars["--surface2"];
  const bg2 = THEMES[id].vars["--surface"];
  const border = THEMES[id].vars["--border"];
  const hdr = document.querySelector(".app-header");
  if (hdr) hdr.style.background = `linear-gradient(135deg, ${bg} 0%, ${bg2} 100%)`;
  // Light theme: invert text selection default
  document.body.classList.toggle("theme-light", id === "light");
  renderThemeSwatches();
  localStorage.setItem("sunoTheme", id);
}

function renderThemeSwatches() {
  const el = document.getElementById("theme-swatches");
  if (!el) return;
  el.innerHTML = Object.entries(THEMES).map(([id, t]) =>
    `<button class="swatch${S.theme===id?" active":""}" style="background:${t.swatch}"
      onclick="applyTheme('${id}')" title="${t.name}"></button>`
  ).join("");
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const G = () => KB.genres.find(g => g.id === S.genre);

function allTags() { return [...S.qualityTags, ...S.vocalTags]; }

function hardConflicts(tags) {
  return KB.conflicts.hard.filter(r => r.tags.every(t => tags.includes(t)));
}

function wouldConflict(tag) {
  if (allTags().includes(tag)) return false;
  return KB.conflicts.hard.some(r => r.tags.includes(tag) && r.tags.every(t => t === tag || allTags().includes(t)));
}

function moodConflict(mood) {
  const ml = mood.toLowerCase();
  const sel = S.moods.map(m => m.toLowerCase());
  for (const rule of KB.conflicts.softMoods) {
    if (rule.pair.includes(ml)) {
      const other = rule.pair.find(p => p !== ml);
      if (sel.some(s => s.includes(other))) return rule;
    }
  }
  return null;
}

function assemble() {
  const g = G();
  if (!g) return "";
  const parts = [];
  const genrePart = S.subgenre || S.customSubgenre || g.name;
  if (genrePart) parts.push(genrePart);
  const moods = [...S.moods, ...(S.customMood ? [S.customMood] : [])];
  if (moods.length) parts.push(moods.join(", "));
  if (S.bpm) parts.push(`${S.bpm} BPM`);
  if (S.songKey) parts.push(`key of ${S.songKey}`);
  const _chord = S.chordProgression === '__custom__' ? S.customChordProgression.trim() : S.chordProgression;
  if (_chord) parts.push(`chord progression: ${_chord}`);
  const inst = [...S.instruments, ...S.customInstruments.filter(Boolean)];
  if (inst.length) parts.push(inst.join(", "));
  const prod = [...S.production, ...S.customProduction.filter(Boolean)];
  if (prod.length) parts.push(prod.join(", "));
  if (S.artistRef.trim()) parts.push(S.artistRef.trim());
  if (S.vocalistProfile) {
    const vs = assembleVocalistStr(S.vocalistProfile);
    if (vs) parts.push(vs);
  }
  const exl = [...S.excludes, ...S.customExcludes.filter(Boolean)];
  if (exl.length) parts.push(exl.map(e => `no: ${e}`).join(", "));
  if (S.customStyleText.trim()) parts.push(S.customStyleText.trim());
  const tags = [...allTags(), ...S.metaProductionTags, ...S.metaMoodTags];
  if (tags.length) parts.push(tags.join(""));
  return parts.join(", ");
}

function assembleLyrics() {
  // Use live draft (always current) — fall back to saved profile
  const _vp = S.vocalistDraft || S.vocalistProfile;
  const cmdBlock = _vp ? buildVocalistCmdBlock(_vp) : "";
  if (!S.useGuidedLyrics) {
    return cmdBlock ? cmdBlock + "\n\n" + S.freeLyrics : S.freeLyrics;
  }
  const secs = S.lyricsSections;
  if (!secs.length) return cmdBlock || "";
  return secs.map((sec, i) => {
    const tags = sec.deliveryTags.join("");
    // vocalist command block goes on its own line inside the FIRST section
    const cmdLine = (i === 0 && cmdBlock) ? "\n" + cmdBlock : "";
    return `${sec.structTag}${tags}${cmdLine}\n${sec.text}`;
  }).join("\n\n");
}

function annotatedParts() {
  const g = G();
  if (!g) return [];
  const parts = [];
  const genrePart = S.subgenre || S.customSubgenre || g.name;
  if (genrePart) parts.push({ label:"L1 Genre",      content:genrePart, color:"var(--l1)" });
  const moods = [...S.moods, ...(S.customMood ? [S.customMood] : [])];
  if (moods.length) parts.push({ label:"L2 Mood",    content:moods.join(", "), color:"var(--l2)" });
  if (S.bpm) parts.push({ label:"L3 Tempo",          content:`${S.bpm} BPM`, color:"var(--l3)" });
  const inst = [...S.instruments, ...S.customInstruments.filter(Boolean)];
  if (inst.length) parts.push({ label:"L4 Instruments", content:inst.join(", "), color:"var(--l4)" });
  const prod = [...S.production, ...S.customProduction.filter(Boolean)];
  if (prod.length) parts.push({ label:"L5 Production",  content:prod.join(", "), color:"var(--l5)" });
  const exl = [...S.excludes, ...S.customExcludes.filter(Boolean)];
  if (exl.length) parts.push({ label:"Exclude",      content:exl.map(e=>`no: ${e}`).join(", "), color:"var(--conflict)" });
  if (S.customStyleText.trim()) parts.push({ label:"Custom", content:S.customStyleText.trim(), color:"var(--text-dim)" });
  const tags = allTags();
  if (tags.length) parts.push({ label:"L6 Tags",     content:tags.join(""), color:"var(--l6)" });
  return parts;
}

function uid() { return Math.random().toString(36).slice(2,9); }

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── ACCORDION HELPERS ─────────────────────────────────────────
function toggleSection(id) { S.open[id] = !S.open[id]; render(); }

function sectionCard(id, badge, badgeStyle, title, hint, color, summary, body, warnText) {
  const open = S.open[id] !== false;
  const tTitle = t("section." + id + ".title") || title;
  const tHint  = t("section." + id + ".hint")  || hint;
  const rhs = (!open && summary)
    ? `<span class="layer-summary">${esc(summary)}</span>`
    : `<div class="layer-hint">${tHint}</div>`;
  const warnBadge = `<span class="layer-hdr-warn${warnText?"":" hdr-warn-hidden"}" id="${id}-hdr-warn">${warnText?"⚠ "+esc(warnText):""}</span>`;
  return `
    <div class="card">
      <div class="layer-hdr" onclick="toggleSection('${id}')" style="--layer-color:${color}">
        <div class="layer-badge"${badgeStyle?` style="${badgeStyle}"`:""}>${badge}</div>
        <div class="layer-title">${tTitle}</div>
        ${rhs}
        ${warnBadge}
        <span class="acc-chevron ${open?"open":""}">▾</span>
      </div>
      <div class="${open?"":"acc-hidden"}">${body}</div>
    </div>
  `;
}

// ── SUMMARY HELPERS (shown in collapsed header) ───────────────
function smMood()    { const a=[...S.moods,...(S.customMood?[S.customMood]:[])]; return a.length?a.slice(0,3).join(", ")+(a.length>3?` +${a.length-3}`:""):null; }
function smTempo()   { return S.bpm?`${S.bpm} BPM`:null; }
function smInst()    { const a=[...S.instruments,...S.customInstruments.filter(Boolean)]; return a.length?a.slice(0,2).join(", ")+(a.length>2?` +${a.length-2}`:""):null; }
function smProd()    { const a=[...S.production,...S.customProduction.filter(Boolean)]; return a.length?a.slice(0,2).join(", ")+(a.length>2?` +${a.length-2}`:""):null; }
function smQuality() { return S.qualityTags.length?S.qualityTags.join(""):null; }
function smVocal()   { const a=allTags(); return a.length?a.join(""):null; }
function smExclude() { const a=[...S.excludes,...S.customExcludes.filter(Boolean)]; return a.length?a.map(e=>"no: "+e).join(", "):null; }
function smCustom()  { const t=S.customStyleText.trim(); return t?t.slice(0,40)+(t.length>40?"…":""):null; }
function smSub()     { return S.subgenre||S.customSubgenre||null; }
function smLyrics()  { return S.lyricsSections.length?`${S.lyricsSections.map(s=>s.structTag.replace(/[\[\]]/g,"")).join(" · ")}`:S.freeLyrics.trim()?"free form":null; }

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════
function render() {
  document.getElementById("builder-col").innerHTML = wizardHTML();
  document.getElementById("preview-col").innerHTML = previewHTML();
  bindTempoSlider();
  renderLangButtons();
}

function renderLangButtons() {
  const en = document.getElementById("lang-en");
  const fr = document.getElementById("lang-fr");
  if (en) en.classList.toggle("active", S.lang === "en");
  if (fr) fr.classList.toggle("active", S.lang === "fr");
}

function builderHTML() {
  return `
    ${genrePickerHTML()}
    ${S.genre ? layersHTML() : ""}
    ${S.genre ? metaTagsHTML() : ""}
    ${S.genre ? metaProductionHTML() : ""}
    ${S.genre ? metaMoodHTML() : ""}
    ${S.genre ? artistRefHTML() : ""}
    ${S.genre ? excludesHTML() : ""}
    ${S.genre ? moreOptsHTML() : ""}
    ${S.genre ? customStyleHTML() : ""}
    ${S.genre ? lyricsBuilderHTML() : ""}
  `;
}

// ── GENRE PICKER ──────────────────────────────────────────────
function genrePickerHTML() {
  // ── SELECTED STATE: compact row + subgenre card ──
  if (S.genre) {
    const g = G();
    const subLabel = S.subgenre || S.customSubgenre || null;
    return `
      <div class="card">
        <div class="layer-hdr" style="--layer-color:var(--l1)">
          <div class="layer-badge" style="font-size:18px">🎵</div>
          <div class="layer-title">${t("genreAnchorTitle")}</div>
          <div class="check-badge" style="color:var(--l3);font-size:18px">✓</div>
        </div>
        <div class="genre-sel-row">
          <div class="genre-sel-icon">${g.icon}</div>
          <div class="genre-sel-info">
            <div class="genre-sel-name">${esc(g.name)}</div>
            <div class="genre-sel-meta">${esc(g.group)}</div>
            <div class="genre-sel-desc">${esc(kbDesc(g.id))}</div>
          </div>
          <button class="btn btn-ghost" onclick="clearGenre()" style="flex-shrink:0">↩ Change</button>
        </div>
      </div>
      ${sectionCard('subgenre',
        'L1', 'background:rgba(139,92,246,.25);color:var(--l1);border:1px solid var(--l1)',
        'Sub-genre', 'Refine the genre anchor for a more specific sound',
        'var(--l1)', smSub(),
        `<div class="subgenre-card-inner">
          ${subLabel ? `<div class="subgenre-selected-badge" style="margin-bottom:10px">✓ ${esc(subLabel)}</div>` : ""}
          <div class="chip-group">
            ${g.subgenres.map(sg=>{const _h=chipHint(sg)||kbDesc(sg);return`<button class="chip${S.subgenre===sg?" active":""}" onclick="toggleSub('${esc(sg)}')"${_h?` data-tip="${esc(_h)}"`:""}>${esc(sg)}</button>`;}).join("")}
            <button class="btn-add" onclick="addCustomSub()">+ Custom</button>
          </div>
          ${S.customSubgenre ? `<div class="custom-row" style="margin-top:10px">
            <input class="text-input" value="${esc(S.customSubgenre)}" oninput="S.customSubgenre=this.value;patchPreviews()" placeholder="Custom sub-genre...">
            <button class="btn-icon del" onclick="S.customSubgenre='';render()">✕</button>
          </div>` : ""}
        </div>`
      )}
    `;
  }

  // ── UNSELECTED STATE: tab-filtered compact grid ──
  const favIds  = getFavs();
  const groups  = {};
  KB.genres.forEach(g => { (groups[g.group] = groups[g.group] || []).push(g); });
  const sortedGroupKeys = Object.keys(groups).sort();

  const shortLabel = g => g
    .replace("Country / Folk", "Country")
    .replace("Latin / World", "Latin")
    .replace("R&B / Soul", "R&B")
    .replace("Cinematic", "Film");

  const activeGrp = S.genreGroup;

  // Tabs: All | ★ | each group
  const tabDefs = [
    { id: "",      label: "All",   count: KB.genres.length },
    { id: "__fav", label: "★",     count: favIds.length    },
    ...sortedGroupKeys.map(g => ({ id: g, label: shortLabel(g), count: groups[g].length }))
  ];
  const tabs = tabDefs.map(tab => {
    const active = (tab.id === "" && !activeGrp) || (tab.id === activeGrp);
    return `<button class="gft-tab${active?" active":""}"
      onclick="setGenreFilter(this.dataset.g)" data-g="${esc(tab.id)}"
      >${tab.label}<span class="gft-count">${tab.count}</span></button>`;
  }).join("");

  // Genre card
  const mkCard = g => {
    const isFav = favIds.includes(g.id);
    return `<div class="gpc-wrap">
      <button class="gpc-card" onclick="selectGenre('${g.id}')">
        <span class="gpc-icon">${g.icon}</span>
        <span class="gpc-name">${esc(g.name)}</span>
      </button>
      <button class="gpc-fav${isFav?" active":""}"
        onclick="toggleFav('${g.id}',event)"
        title="${isFav?"Remove from favourites":"Add to favourites"}">${isFav?"★":"☆"}</button>
    </div>`;
  };

  // Build grid content
  const favGenres = favIds.map(id => KB.genres.find(g => g.id === id)).filter(Boolean);
  let gridHTML = "";

  if (activeGrp === "__fav") {
    gridHTML = favGenres.length
      ? `<div class="gpc-grid">${favGenres.map(mkCard).join("")}</div>`
      : `<div class="gpc-empty">Tap ☆ on any genre to save it here.</div>`;
  } else if (activeGrp) {
    const gs = (groups[activeGrp] || []).slice().sort((a,b) => a.name.localeCompare(b.name));
    gridHTML = `<div class="gpc-grid">${gs.map(mkCard).join("")}</div>`;
  } else {
    // All — favourites first, then grouped sections
    if (favGenres.length) {
      gridHTML += `<div class="gpc-section">
        <div class="gpc-section-label">★ Favourites</div>
        <div class="gpc-grid">${favGenres.map(mkCard).join("")}</div>
      </div>`;
    }
    gridHTML += sortedGroupKeys.map(grp => {
      const gs = groups[grp].slice().sort((a,b) => a.name.localeCompare(b.name));
      return `<div class="gpc-section">
        <div class="gpc-section-label">${esc(grp)}</div>
        <div class="gpc-grid">${gs.map(mkCard).join("")}</div>
      </div>`;
    }).join("");
  }

  return `
    <div class="card">
      <div class="genre-welcome-banner">
        <div class="genre-welcome-icon">🎵</div>
        <div class="genre-welcome-text">
          <div class="genre-welcome-title">${t("section.genre.title")}</div>
          <div class="genre-welcome-hint">${t("genrePickLabel")}</div>
        </div>
      </div>
      <div class="gft-tabs-row">${tabs}</div>
      <div class="gpc-body">${gridHTML}</div>
    </div>
  `;
}

// ── 6 LAYERS ─────────────────────────────────────────────────
function layersHTML() {
  return moodHTML() + tempoHTML() + instrumentsHTML() + productionHTML() + qualityHTML();
}

function moodHTML() {
  const g = G();
  const body = `<div class="card-inner">
    ${g.moods.map(mg => {
      const pc = moodConflict(mg.primary);
      return `<div class="mood-group">
        <div class="mood-primary-row">
          <button class="mood-primary-btn${S.moods.includes(mg.primary)?" active":""}${pc?" warn":""}"
                  onclick="toggleMood('${esc(mg.primary)}')" title="${pc?"⚠️ "+pc.reason:""}" ${chipHint(mg.primary)?`data-tip="${esc(chipHint(mg.primary))}"`:""}>
            ${esc(mg.primary)}${pc?` <span class="warn-dot">⚠</span>`:""}
          </button>
        </div>
        <div class="mood-modifiers">
          ${mg.mods.map(mod => { const mc=moodConflict(mod); return `<button class="chip chip-sm${S.moods.includes(mod)?" active-l2":""}${mc?" warn":""}" onclick="toggleMood('${esc(mod)}')" ${chipHint(mod)?`data-tip="${esc(chipHint(mod))}"`:""}>${esc(mod)}</button>`; }).join("")}
        </div>
      </div>`;
    }).join("")}
    ${S.customMood ? `<div class="custom-row" style="margin-top:8px">
      <input class="text-input" value="${esc(S.customMood)}" oninput="S.customMood=this.value;patchPreviews()" placeholder="Custom mood...">
      <button class="btn-icon del" onclick="S.customMood='';render()">✕</button>
    </div>` : `<button class="btn-add" onclick="S.customMood='custom';render()">+ Custom mood</button>`}
    ${S.moods.length ? `<div class="selected-summary">Selected: ${S.moods.map(m=>`<span class="selected-tag">${esc(m)}</span>`).join("")}</div>` : ""}
  </div>`;
  return sectionCard("mood","L2","","Mood / Energy","One primary mood + modifier — no conflicting moods","var(--l2)",smMood(),body);
}

function tempoHTML() {
  const g = G();
  const [mn, mx] = g.tempoRange;
  const bpm = S.bpm ?? g.defaultBPM;
  const slMin = Math.max(40, mn - 20), slMax = Math.min(250, mx + 20);
  const outLow  = S.bpm !== null && S.bpm < mn;
  const outHigh = S.bpm !== null && S.bpm > mx;
  const outRange = outLow || outHigh;
  const warnMsg = outHigh
    ? `⚠️ Above typical range for ${g.name} (max ${mx} BPM) — may alter genre feel`
    : outLow
      ? `⚠️ Below typical range for ${g.name} (min ${mn} BPM) — may alter genre feel`
      : "";
  const body = `<div class="card-inner">
    <div class="tempo-range-bar">
      <span class="${outLow?"range-label-warn":""}">${mn} BPM — min</span>
      <span>${esc(g.name)} typical</span>
      <span class="${outHigh?"range-label-warn":""}">max — ${mx} BPM</span>
    </div>
    <input type="range" class="tempo-slider${outRange?" bpm-warn":""}" id="tempo-slider"
           min="${slMin}" max="${slMax}" value="${bpm}"
           oninput="S.bpm=parseInt(this.value);updateBPMDisplay()">
    <div class="tempo-bpm-display">
      <span class="tempo-bpm-num${outRange?" bpm-warn":""}" id="bpm-num">${bpm}</span><span class="tempo-bpm-unit">BPM</span>
    </div>
    <div class="bpm-warn-msg${outRange?" visible":""}" id="bpm-warn-msg">${warnMsg}</div>
    <div class="tempo-presets">
      <span class="tempo-preset-label">Presets:</span>
      ${[mn,Math.round((mn+mx)/2),mx].map(v=>`<button class="chip chip-sm${S.bpm===v?" active-l3":""}" onclick="S.bpm=${v};render()">${v}</button>`).join("")}
      <button class="chip chip-sm" onclick="promptBPM()">Custom</button>
    </div>
  </div>`;
  const hdrWarn = outRange ? (outHigh ? `${bpm} BPM — above range` : `${bpm} BPM — below range`) : "";
  return sectionCard("tempo","L3","","Tempo Cue","State BPM explicitly — v5 takes it literally","var(--l3)",smTempo(),body,hdrWarn);
}

function updateBPMDisplay() {
  const sl = document.getElementById("tempo-slider");
  if (!sl) return;
  const bpm = parseInt(sl.value);
  S.bpm = bpm;
  const g = G();
  if (!g) return;
  const [mn, mx] = g.tempoRange;
  const outLow  = bpm < mn;
  const outHigh = bpm > mx;
  const out = outLow || outHigh;
  const numEl = document.getElementById("bpm-num");
  if (numEl) { numEl.textContent = bpm; numEl.classList.toggle("bpm-warn", out); }
  sl.classList.toggle("bpm-warn", out);
  const warnEl = document.getElementById("bpm-warn-msg");
  if (warnEl) {
    warnEl.classList.toggle("visible", out);
    if (out) warnEl.textContent = outHigh
      ? `⚠️ Above typical range for ${g.name} (max ${mx} BPM) — may alter genre feel`
      : `⚠️ Below typical range for ${g.name} (min ${mn} BPM) — may alter genre feel`;
  }
  // Update L3 header badge (yellow near limit, red outside)
  const hdrBadge = document.getElementById("tempo-hdr-warn");
  if (hdrBadge) {
    const span = Math.ceil((mx - mn) * 0.12); // 12% soft zone
    const nearHigh = !out && bpm > mx - span;
    const nearLow  = !out && bpm < mn + span;
    if (out) {
      hdrBadge.textContent = outHigh ? `⚠ ${bpm} BPM — above range` : `⚠ ${bpm} BPM — below range`;
      hdrBadge.className = "layer-hdr-warn";
    } else if (nearHigh || nearLow) {
      hdrBadge.textContent = nearHigh ? `⚠ Approaching max (${mx} BPM)` : `⚠ Approaching min (${mn} BPM)`;
      hdrBadge.className = "layer-hdr-warn warn-soft";
    } else {
      hdrBadge.className = "layer-hdr-warn hdr-warn-hidden";
    }
  }
  patchPreviews();
}

function instrumentsHTML() {
  const g = G();
  const body = `<div class="card-inner">
    <div class="inst-grid">
      ${g.instruments.map((inst,i) => {
        const sel=S.instruments.includes(inst), order=sel?S.instruments.indexOf(inst)+1:"";
        return `<label class="inst-item${sel?" selected":""}">
          <input type="checkbox" ${sel?"checked":""} onchange="toggleInst('${esc(inst)}')">
          <div class="inst-order">${order}</div>
          <div class="inst-name">${esc(inst)}</div>
        </label>`;
      }).join("")}
    </div>
    ${S.customInstruments.map((inst,i)=>`<div class="custom-row" style="margin-top:6px">
      <input class="text-input" value="${esc(inst)}" oninput="S.customInstruments[${i}]=this.value;patchPreviews()" placeholder="Custom instrument...">
      <button class="btn-icon del" onclick="S.customInstruments.splice(${i},1);render()">✕</button>
    </div>`).join("")}
    <button class="btn-add" onclick="S.customInstruments.push('');render()">+ Add instrument</button>
    ${([...S.instruments,...S.customInstruments.filter(Boolean)].length)?`<div class="selected-summary">Order: ${[...S.instruments,...S.customInstruments.filter(Boolean)].map((s,i)=>`<span class="selected-tag">${i+1}. ${esc(s)}</span>`).join("")}</div>`:""}
  </div>`;
  return sectionCard("instruments","L4","","Instrument Stack","First listed = lead voice — order by prominence","var(--l4)",smInst(),body);
}

// ── KEY & CHORD PROGRESSION ───────────────────────────────────
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_LABELS = ['C','C♯\nD♭','D','D♯\nE♭','E','F','F♯\nG♭','G','G♯\nA♭','A','A♯\nB♭','B'];
const CHORD_PRESETS = [
  { id:'I–V–vi–IV',    label:'I – V – vi – IV',   hint:'Pop anthem — used in countless hits' },
  { id:'I–IV–V',       label:'I – IV – V',         hint:'Blues & rock foundation' },
  { id:'I–vi–IV–V',    label:'I – vi – IV – V',    hint:'50s doo-wop, country ballad' },
  { id:'ii–V–I',       label:'ii – V – I',         hint:'Jazz standard resolution' },
  { id:'i–VII–VI–VII', label:'i – VII – VI – VII', hint:'Rock & metal power loop' },
  { id:'i–VI–III–VII', label:'i – VI – III – VII', hint:'Epic cinematic / dramatic minor' },
  { id:'vi–IV–I–V',    label:'vi – IV – I – V',    hint:'Minor-feel pop & R&B' },
  { id:'I–IV–vi–V',    label:'I – IV – vi – V',    hint:'Uplifting anthemic' },
  { id:'I–iii–IV–V',   label:'I – iii – IV – V',   hint:'Worship & ambient swells' },
  { id:'I–ii–IV–I',    label:'I – ii – IV – I',    hint:'Soul & gospel groove' },
];

function setNoteRoot(note) {
  const quality = S.songKey ? (S.songKey.endsWith('minor') ? 'minor' : 'major') : 'major';
  S.songKey = note ? `${note} ${quality}` : null;
  render();
}
function setKeyQuality(q) {
  const root = S.songKey ? S.songKey.split(' ')[0] : null;
  S.songKey = root ? `${root} ${q}` : null;
  render();
}
function setChordPreset(id) {
  S.chordProgression = S.chordProgression === id ? '' : id;
  render();
}

function keyAndChordsHTML() {
  const noteRoot = S.songKey ? S.songKey.split(' ')[0] : null;
  const quality  = S.songKey ? (S.songKey.endsWith('minor') ? 'minor' : 'major') : 'major';
  const isCustomChord = S.chordProgression === '__custom__';

  const noteGrid = NOTES.map((n, i) => {
    const lbl = NOTE_LABELS[i].replace('\n','<br>');
    const sel  = noteRoot === n;
    const isBlack = n.includes('#');
    return `<button class="key-note-btn${sel?' active':''}${isBlack?' black-key':''}"
      onclick="setNoteRoot(${sel?"null":"'"+n+"'"})">
      <span class="key-note-lbl">${lbl}</span>
    </button>`;
  }).join('');

  const qualityRow = S.songKey ? `
    <div class="key-quality-row">
      <button class="key-quality-btn${quality==='major'?' active':''}" onclick="setKeyQuality('major')">
        ☀️ ${t('keyMajor')}
      </button>
      <button class="key-quality-btn${quality==='minor'?' active':''}" onclick="setKeyQuality('minor')">
        🌙 ${t('keyMinor')}
      </button>
    </div>` : '';

  const keyPreview = S.songKey
    ? `<div class="key-preview">🎵 <strong>${S.songKey}</strong></div>`
    : `<div class="key-preview key-preview-empty">Tap a note to set the key</div>`;

  const chordChips = CHORD_PRESETS.map(cp => `
    <button class="chord-chip${S.chordProgression===cp.id?' active':''}"
      onclick="setChordPreset('${cp.id}')"
      data-tip="${esc(cp.hint)}">
      <span class="chord-chip-label">${cp.label}</span>
      <span class="chord-chip-hint">${cp.hint}</span>
    </button>`).join('');

  return `
    <div class="card key-card">
      <div class="layer-hdr no-acc" style="--layer-color:var(--l3)">
        <div class="layer-badge" style="background:var(--l3)">🎼</div>
        <div class="layer-title">${t('keyLabel')}</div>
        ${S.songKey ? `<div class="check-badge" style="color:var(--l3)">✓</div>` : '<div class="layer-hint">optional</div>'}
      </div>
      <div class="key-section">
        <div class="key-note-grid">${noteGrid}</div>
        ${qualityRow}
        ${keyPreview}
      </div>
    </div>
    <div class="card key-card" style="margin-top:12px">
      <div class="layer-hdr no-acc" style="--layer-color:var(--l4)">
        <div class="layer-badge" style="background:var(--l4)">🎸</div>
        <div class="layer-title">${t('chordLabel')}</div>
        ${S.chordProgression ? `<div class="check-badge" style="color:var(--l4)">✓</div>` : '<div class="layer-hint">optional</div>'}
      </div>
      <div class="chord-section">
        <div class="chord-chip-grid">${chordChips}</div>
        <div class="chord-custom-row">
          <input class="text-input chord-custom-input"
            value="${esc(S.customChordProgression)}"
            placeholder="${esc(t('chordCustomPh'))}"
            oninput="S.customChordProgression=this.value; S.chordProgression=this.value?'__custom__':(S.chordProgression==='__custom__'?'':S.chordProgression); render()">
        </div>
        ${S.chordProgression&&S.chordProgression!=='__custom__'?`<div class="chord-preview">🎸 <strong>${S.chordProgression}</strong></div>`:''}
        ${isCustomChord&&S.customChordProgression?`<div class="chord-preview">🎸 <strong>${esc(S.customChordProgression)}</strong></div>`:''}
      </div>
    </div>`;
}


function productionHTML() {
  const g = G();
  const body = `<div class="card-inner">
    <div class="chip-group">
      ${g.production.map(p=>{const _t=prodTip(p);return`<button class="chip${S.production.includes(p)?" active-l5":""}" onclick="toggleProd('${esc(p)}')"${_t?` data-tip="${esc(_t)}"`:""}>${esc(p)}</button>`;})}
    </div>
    ${S.customProduction.map((p,i)=>`<div class="custom-row" style="margin-top:6px">
      <input class="text-input" value="${esc(p)}" oninput="S.customProduction[${i}]=this.value;patchPreviews()" placeholder="Production descriptor...">
      <button class="btn-icon del" onclick="S.customProduction.splice(${i},1);render()">✕</button>
    </div>`).join("")}
    <button class="btn-add" onclick="S.customProduction.push('');render()">+ Add production style</button>
  </div>`;
  return sectionCard("production","L5","","Production Style","Mixing character, reverb, compression, signal chain","var(--l5)",smProd(),body);
}

function qualityHTML() {
  const body = `<div class="card-inner">
    ${KB.metaTags.quality.map(qt=>{const d=getTagDesc(qt.tag);return`<label class="tag-item${S.qualityTags.includes(qt.tag)?" selected-quality":""}"
        data-tip="${esc(d)}">
      <input type="checkbox" ${S.qualityTags.includes(qt.tag)?"checked":""} onchange="toggleQTag('${esc(qt.tag)}')" style="accent-color:var(--l6)">
      <div><div class="tag-label">${esc(qt.tag)}</div><div class="tag-desc">${esc(d)}</div></div>
    </label>`}).join("")}
  </div>`;
  return sectionCard("quality","L6","","Quality Tags","Trigger high-fidelity render — skip on test runs","var(--l6)",smQuality(),body);
}

// ── VOCAL / META TAGS ─────────────────────────────────────────
function metaTagsHTML() {
  const active = allTags();
  const conflicts = hardConflicts(active);
  const body = `
    ${conflicts.length ? `<div class="conflict-banner">⛔ ${conflicts.map(c=>c.reason).join(" · ")}</div>` : ""}
    <div class="card-inner">
      ${KB.metaTags.vocal.map(vt => {
        const isSel=S.vocalTags.includes(vt.tag), wc=!isSel&&wouldConflict(vt.tag);
        const vtd=getTagDesc(vt.tag);
        return `<label class="tag-item${isSel?" selected-vocal":""}${wc?" conflict-item":""}"
            data-tip="${esc(vtd)}">
          <input type="checkbox" ${isSel?"checked":""} onchange="toggleVTag('${esc(vt.tag)}')" style="accent-color:var(--pink)">
          <div>
            <div class="tag-label">${esc(vt.tag)} ${wc?`<span class="conflict-badge">⚡ conflict</span>`:""}</div>
            <div class="tag-desc">${esc(vtd)}</div>
          </div>
        </label>`;
      }).join("")}
    </div>`;
  return sectionCard("vocal","🎤","background:var(--pink)","Vocal / Meta Tags","Bypass language layer — processed before generation","var(--pink)",smVocal(),body);
}

// ── PRODUCTION META TAGS ──────────────────────────────────────
function metaProductionHTML() {
  const sel = S.metaProductionTags;
  const body = `<div class="card-inner">
    <div class="meta-tag-grid">
      ${KB.metaTags.production.map(t => `
        <button class="meta-tag-btn${sel.includes(t.tag)?" active-prod":""}"
            onclick="toggleMetaProd('${esc(t.tag)}')" data-tip="${esc(kbDesc(t.tag))}">
          <div class="meta-tag-name">${esc(t.tag)}</div>
        </button>`).join("")}
    </div>
  </div>`;
  const sm = sel.length ? sel.slice(0,3).join(" ")+(sel.length>3?` +${sel.length-3}`:"") : null;
  return sectionCard("metaprod","⚙","background:var(--l5);color:#fff","Production Meta Tags","Bracketed modifiers that shape the mix character","var(--l5)",sm,body);
}

// ── MOOD META TAGS ────────────────────────────────────────────
function metaMoodHTML() {
  const sel = S.metaMoodTags;
  const body = `<div class="card-inner">
    <div class="meta-tag-grid">
      ${KB.metaTags.moodMeta.map(t => `
        <button class="meta-tag-btn${sel.includes(t.tag)?" active-mood":""}"
            onclick="toggleMetaMood('${esc(t.tag)}')" data-tip="${esc(kbDesc(t.tag))}">
          <div class="meta-tag-name">${esc(t.tag)}</div>
        </button>`).join("")}
    </div>
  </div>`;
  const sm = sel.length ? sel.slice(0,3).join(" ")+(sel.length>3?` +${sel.length-3}`:"") : null;
  return sectionCard("metamood","🎭","background:var(--l2);color:#fff","Mood Meta Tags","Bracketed mood modifiers applied before generation","var(--l2)",sm,body);
}

// ── ARTIST REFERENCE ──────────────────────────────────────────
function artistRefHTML() {
  const body = `<div class="card-inner">
    <div class="artist-tip-box">
      <strong>${t("artistRefHowToLabel")}</strong> ${t("artistRefHowToBody")}
    </div>
    <div class="artist-ref-input-row">
      <input class="text-input" id="artist-ref-input" value="${esc(S.artistRef)}"
             oninput="S.artistRef=this.value;patchPreviews()" placeholder="e.g. Miles Davis Kind of Blue-era, J Dilla-style drums...">
      ${S.artistRef ? `<button class="btn-icon del" onclick="S.artistRef='';render()">✕</button>` : ""}
    </div>
    ${(() => {
      const g = G();
      const groupRefs = g && KB.artistRefs[g.group] ? KB.artistRefs[g.group] : null;
      if (!groupRefs) return `<div class="artist-ref-none">${t("artistRefNone")}</div>`;
      return Object.entries(groupRefs).map(([sub, artists]) => `
        <div class="artist-ref-sub" style="margin-bottom:12px">
          <div class="artist-ref-sub-label">${esc(sub)}</div>
          <div class="artist-chips">
            ${artists.map(a => `<button class="artist-chip" onclick="insertArtistRef('${esc(a)}')">${esc(a)}</button>`).join("")}
          </div>
        </div>`).join("");
    })()}
  </div>`;
  const sm = S.artistRef || null;
  return sectionCard("artistref","🎙","background:var(--l1);color:#fff","Artist Reference","Most powerful v5 tool — encodes era, tone & technique in one phrase","var(--l1)",sm,body);
}

function insertArtistRef(name) {
  const cur = S.artistRef.trim();
  S.artistRef = cur ? cur + ", " + name + "-style" : name + "-style";
  render();
  // focus input after render
  setTimeout(()=>{ const el=document.getElementById("artist-ref-input"); if(el) el.focus(); }, 50);
}

// ── EXCLUDES ──────────────────────────────────────────────────
function excludesHTML() {
  const body = `<div class="card-inner">
    <div class="chip-group">
      ${KB.commonExcludes.map(ex=>`<button class="chip chip-sm chip-exclude${S.excludes.includes(ex)?" active":""}" onclick="toggleEx('${ex}')">no: ${ex}</button>`).join("")}
    </div>
    ${S.customExcludes.map((ex,i)=>`<div class="custom-row" style="margin-top:6px">
      <span class="custom-prefix">no:</span>
      <input class="text-input" value="${esc(ex)}" oninput="S.customExcludes[${i}]=this.value;patchPreviews()" placeholder="What to exclude...">
      <button class="btn-icon del" onclick="S.customExcludes.splice(${i},1);render()">✕</button>
    </div>`).join("")}
    <button class="btn-add" onclick="S.customExcludes.push('');render()">+ Add custom exclude</button>
  </div>`;
  return sectionCard("exclude","🚫","background:var(--conflict)","Exclude / Negative Tags","Added as \"no: item\" in style field","var(--conflict)",smExclude(),body);
}

// moreOptsHTML() removed — weirdness & style influence removed from UX

// ── CUSTOM STYLE TEXT ──────────────────────────────────────────
function customStyleHTML() {
  const body = `<div class="card-inner">
    <textarea class="textarea" rows="3" placeholder="Any additional style descriptors..."
              oninput="S.customStyleText=this.value;patchPreviews()">${esc(S.customStyleText)}</textarea>
  </div>`;
  return sectionCard("custom","✏️","background:var(--text-muted)","Custom Style Text","Appended after all layers","var(--text-dim)",smCustom(),body);
}

// ── PREVIEW COLUMN ────────────────────────────────────────────
function previewHTML() {
  if (!S.genre) {
    return `
      <div class="card">
        <div class="preview-empty">
          <div class="preview-empty-icon">🎛️</div>
          <p>${t("noGenreHint")}</p>
        </div>
      </div>
    `;
  }
  return `
    ${stylePreviewHTML()}
    ${lyricsPreviewHTML()}
    ${outputHTML()}
  `;
}

function stylePreviewHTML() {
  const parts = annotatedParts();
  const raw = assemble();
  return `
    <div class="card">
      <div class="preview-hdr">
        <h3>📋 Style Field — Live Preview</h3>
        <button class="btn btn-copy" id="copy-style-btn" onclick="copyText('${esc(raw)}','copy-style-btn')">Copy</button>
      </div>
      ${parts.length ? `
        <div class="annotated-wrap">
          ${parts.map((p,i) => `
            ${i>0?`<span class="ann-comma">,</span>`:""}
            <span class="ann-part" style="--part-color:${p.color}">
              <span class="ann-label">${p.label}</span>
              <span class="ann-content">${esc(p.content)}</span>
            </span>
          `).join("")}
        </div>
      ` : `<div style="padding:14px;color:var(--text-muted);font-size:12px">Fill in the layers below to build your prompt…</div>`}
      <div class="preview-raw-wrap">
        <textarea class="raw-textarea" id="style-raw" rows="4" onclick="this.select()" readonly>${esc(raw)}</textarea>
      </div>
    </div>
  `;
}

// ── LYRICS BUILDER ────────────────────────────────────────────
function vocalistStepHTML() {
  const sm = S.vocalistProfile ? (S.vocalistProfile.name || "Vocal profile set") : null;
  return sectionCard("vocbuild","🎤","background:var(--pink)","Vocal Profile",
    "Build a vocalist persona — timbre, register, delivery style","var(--pink)",sm,
    `<div class="card-inner">${vocalistBuilderHTML()}</div>`);
}

function lyricsOnlyHTML() {
  const sm = smLyrics();
  const body = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px 0;flex-wrap:wrap;gap:8px">
      <div class="tab-row">
        <button class="btn-tab${S.useGuidedLyrics?" active":""}" onclick="S.useGuidedLyrics=true;render()">${t("guidedTab")}</button>
        <button class="btn-tab${!S.useGuidedLyrics?" active":""}" onclick="S.useGuidedLyrics=false;render()">${t("freeformTab")}</button>
      </div>
      <div style="font-size:10px;color:var(--warn)">&#x26A0;&#xFE0F; ${t("lyricsWarning")}</div>
    </div>
    ${S.useGuidedLyrics ? songStructureMapHTML()+guidedLyricsHTML() : freeformLyricsHTML()}
  `;
  return sectionCard("lyrics","♪","background:var(--l2)","Lyric Structure","Build lyrics with structural tags and delivery markers","var(--l2)",sm,body);
}

function lyricsBuilderHTML() {
  const noVocal = allTags().some(t => t === "[No Vocals]" || t === "[Instrumental]");
  const showVocalist = !noVocal && S.lyricsSections.length > 0;
  const sm = smLyrics() || (S.vocalistProfile && showVocalist ? (S.vocalistProfile.name || "vocalist active") : null);
  const body = `
    ${showVocalist ? `<div class="lyr-vocalist-wrap">${vocalistBuilderHTML()}</div>` : ""}
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px 0;flex-wrap:wrap;gap:8px">
      <div class="tab-row">
        <button class="btn-tab${S.useGuidedLyrics?" active":""}" onclick="S.useGuidedLyrics=true;render()">${t("guidedTab")}</button>
        <button class="btn-tab${!S.useGuidedLyrics?" active":""}" onclick="S.useGuidedLyrics=false;render()">${t("freeformTab")}</button>
      </div>
      <div style="font-size:10px;color:var(--warn)">&#x26A0;&#xFE0F; ${t("lyricsWarning")}</div>
    </div>
    ${S.useGuidedLyrics ? `${songStructureMapHTML()}${guidedLyricsHTML()}` : freeformLyricsHTML()}
  `;
  return sectionCard("lyrics","♪","background:var(--l2)","Lyric Structure","Vocalist + guided song structure with delivery tags","var(--l2)",sm,body);
}

function songStructureMapHTML() {
  if (!S.lyricsSections.length) return "";
  return `
    <div style="border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:0">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);padding:10px 16px 6px">Song Structure</div>
      <div class="struct-map">
        ${S.lyricsSections.map((sec, i) => `
          ${i>0?`<span class="struct-arrow">›</span>`:""}
          <div class="struct-map-block" onclick="scrollToSection('${sec.id}')" title="Click to jump to section">
            <div class="smb-tag">${esc(sec.structTag.replace(/[\[\]]/g,""))}</div>
            <div class="smb-dtag">${sec.deliveryTags.map(d=>d.replace(/[\[\]]/g,"")).join(" ")}</div>
            <div class="smb-text">${esc(sec.text.split("\n")[0].slice(0,20))||"..."}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function guidedLyricsHTML() {
  return `
    <div class="add-section-bar">
      ${KB.lyricsTags.structural.map(tag => `
        <button class="chip chip-sm chip-struct" onclick="addSection('${esc(tag)}')">${esc(tag)}</button>
      `).join("")}
    </div>
    ${S.lyricsSections.length ? `
      <div class="lyrics-sections-list" id="lslist">
        ${S.lyricsSections.map((sec, i) => lyricsSectionHTML(sec, i)).join("")}
      </div>
    ` : `<div class="lyrics-empty">Click a section tag above to start building your lyrics structure</div>`}
  `;
}

function lyricsSectionHTML(sec, i) {
  const open = sec.open !== false;
  const selBadges = sec.deliveryTags.length
    ? sec.deliveryTags.map(d => `<span class="delivery-badge">${esc(d.replace(/[\[\]]/g,""))}</span>`).join("")
    : "";
  const preview = !open && sec.text
    ? `<span class="lsec-preview">${esc(sec.text.split("\n")[0].slice(0,50))}</span>`
    : "";
  return `
    <div class="lyrics-sec${open?"":" lsec-collapsed"}" id="lsec-${sec.id}" draggable="true"
         ondragstart="onDragStart(event,${i})" ondragover="onDragOver(event,${i})" ondrop="onDrop(event,${i})" ondragleave="onDragLeave(event)">
      <div class="lyrics-sec-hdr" onclick="toggleLyricsSection(${i})" style="cursor:pointer">
        <span class="drag-handle" title="Drag to reorder" onclick="event.stopPropagation()">⠿</span>
        <span class="struct-badge">${esc(sec.structTag)}</span>
        ${selBadges ? `<div class="delivery-selected">${selBadges}</div>` : ""}
        ${preview}
        <div class="lyrics-sec-controls" onclick="event.stopPropagation()">
          ${i>0?`<button class="btn-icon" onclick="moveSection(${i},-1)" title="Move up">↑</button>`:""}
          ${i<S.lyricsSections.length-1?`<button class="btn-icon" onclick="moveSection(${i},1)" title="Move down">↓</button>`:""}
          <button class="btn-icon btn-clone" onclick="cloneSection(${i})" title="Clone section">⧉</button>
          <span class="lsec-chevron${open?" open":""}">▾</span>
          <button class="btn-icon del" onclick="removeSection(${i})" title="Remove">✕</button>
        </div>
      </div>
      <div class="lsec-body" style="${open?"":"display:none"}">
        <div class="delivery-groups">
          ${Object.entries(KB.lyricsTags.deliveryGroups).map(([grp, tags]) => `
            <div class="delivery-group">
              <span class="delivery-group-label">${grp}</span>
              ${tags.map(dt => `<button class="chip chip-xs chip-delivery${sec.deliveryTags.includes(dt)?" active":""}"
                  onclick="toggleDelivery(${i},'${esc(dt)}')" ${chipHint(dt)?`data-tip="${esc(chipHint(dt))}"`:""}>${esc(dt.replace(/[\[\]]/g,""))}</button>`).join("")}
            </div>
          `).join("")}
        </div>
        <textarea class="lyrics-textarea" rows="4"
                  placeholder="Type lyrics for ${esc(sec.structTag)}…"
                  oninput="S.lyricsSections[${i}].text=this.value;patchPreviews()">${esc(sec.text)}</textarea>
      </div>
    </div>
  `;
}
function toggleLyricsSection(i) {
  S.lyricsSections[i].open = !(S.lyricsSections[i].open !== false);
  render();
}

function freeformLyricsHTML() {
  return `
    <div class="freeform-wrap">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">Use [Verse 1], [Chorus], etc. inline with your lyrics text</div>
      <textarea class="textarea" rows="10"
                placeholder="[Verse 1]&#10;Write your lyrics here...&#10;&#10;[Chorus]&#10;Your chorus here..."
                oninput="S.freeLyrics=this.value;patchPreviews()">${esc(S.freeLyrics)}</textarea>
    </div>
  `;
}

function lyricsPreviewHTML() {
  const lyr = assembleLyrics();
  if (!lyr.trim()) return "";
  // Syntax-highlight structural and delivery tags
  const highlighted = esc(lyr)
    .replace(/(\[(?:Verse \d+|Chorus|Pre-Chorus|Post-Chorus|Bridge|Intro|Outro|Hook|Rap Verse|Spoken Word|Interlude|Break|Drop|Build|Breakdown|Refrain|Swell|Fade Out|Instrumental Break|Solo|Guitar Solo)\])/g, '<span class="stag">$1</span>')
    .replace(/(\[(?:Whispered|Soft|Gentle|Powerful|Belted|Shouted|Screamed|Intense|Smooth|Raspy|Breathy|Airy|Nasal|Soulful|Operatic|Falsetto|Head Voice|Chest Voice|Melodic|Tender|Aggressive|Harmonies|Ad-libs|Vocal Run|Melisma|Vibrato|Staccato|Legato|Choir|Chant|Growling|Rapped|Fast Rap|Slow Flow|Melodic Rap|Trap Flow|Double Time|Spoken)\])/g, '<span class="dtag">$1</span>')
    .replace(/(\[(?:female lead|male lead|female narrator|male narrator|rap verse|gospel choir|diva solo|primal scream|intimate MC|spoken word|Female Vocal|Male Vocal)\])/gi, '<span class="stag" style="color:var(--pink)">$1</span>');
  return `
    <div class="card">
      <div class="preview-hdr">
        <h3>🎤 Lyrics Box Preview</h3>
        <button class="btn btn-copy" id="copy-lyr-btn" onclick="copyLyrics()">Copy</button>
      </div>
      <pre class="lyrics-pre" id="lyrics-pre">${highlighted}</pre>
    </div>
  `;
}

function moreOptsOutputHTML() {
  const exl = [...S.excludes, ...S.customExcludes.filter(Boolean)];
  const chips = exl.map(e=>`<span class="excl-chip">✕ ${esc(e)}</span>`).join("");
  return `
    <div class="card more-opts-out">
      <div class="sec-hdr">
        <h3>⚙️ Suno More Options</h3>
        <span class="sec-hint">Set these in Suno's panel</span>
      </div>
      <div class="more-opts-out-grid">
        <div class="mo-field" style="grid-column:1/-1">
          <div class="mo-field-label">Exclude Styles</div>
          ${exl.length
            ? `<div class="mo-excl-chips">${chips}</div>
               <div style="margin-top:8px;font-size:12px;color:var(--text-muted)">Type each into Suno's <em>Exclude styles</em> field</div>`
            : `<div class="mo-field-val empty">None selected</div>`}
        </div>
        <div class="mo-field">
          <div class="mo-field-label">Vocal Gender</div>
          <div class="mo-field-val${S.vocalGender?"":" empty"}">${S.vocalGender||"Not set"}</div>
        </div>
      </div>
    </div>
  `;
}

function outputHTML() {
  return `
    ${moreOptsOutputHTML()}
    <div class="card" style="margin-top:12px">
      <div class="sec-hdr">
        <h3>🚀 Final Output</h3>
        <span class="sec-hint">Click to select · Copy buttons below</span>
      </div>
      <div class="output-grid">
        <div>
          <div class="output-field-label">STYLE FIELD</div>
          <textarea class="output-textarea" id="out-style" rows="6" readonly onclick="this.select()">${esc(assemble())}</textarea>
          <button class="btn btn-primary" id="copy-style-final-btn" onclick="copyFinal('style')">📋 Copy Style Field</button>
        </div>
        <div>
          <div class="output-field-label">LYRICS BOX</div>
          <textarea class="output-textarea" id="out-lyrics" rows="6" readonly onclick="this.select()">${esc(assembleLyrics())}</textarea>
          <button class="btn btn-primary" id="copy-lyrics-final-btn" onclick="copyFinal('lyrics')">📋 Copy Lyrics Box</button>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// PATCH PREVIEWS (fast update without full re-render)
// ═══════════════════════════════════════════════════════════════
function patchPreviews() {
  patchCloudBtn();
  const raw = assemble();
  const lyr = assembleLyrics();
  el("style-raw") && (el("style-raw").value = raw);
  el("out-style") && (el("out-style").value = raw);
  el("out-lyrics") && (el("out-lyrics").value = lyr);
  // Update annotated
  const wrap = document.querySelector(".annotated-wrap");
  if (wrap) {
    const parts = annotatedParts();
    wrap.innerHTML = parts.map((p,i) => `
      ${i>0?`<span class="ann-comma">,</span>`:""}
      <span class="ann-part" style="--part-color:${p.color}">
        <span class="ann-label">${p.label}</span>
        <span class="ann-content">${esc(p.content)}</span>
      </span>
    `).join("");
  }
  // Update lyrics preview
  if (el("lyrics-pre") && lyr.trim()) {
    const highlighted = esc(lyr)
      .replace(/(\[(?:Verse \d|Chorus|Pre-Chorus|Post-Chorus|Bridge|Intro|Outro|Hook|Rap Verse|Spoken Word|Interlude|Break|Drop|Build)\])/g, '<span class="stag">$1</span>')
      .replace(/(\[(?:Powerful|Whispered|Falsetto|Raspy|Smooth|Spoken|Melodic|Aggressive|Tender|Breathy|Operatic|Growling)\])/g, '<span class="dtag">$1</span>');
    el("lyrics-pre").innerHTML = highlighted;
  }
  // Update More Options output card
  const moCard = document.querySelector(".more-opts-out");
  if (moCard) moCard.outerHTML = moreOptsOutputHTML();
  // Update copy-style-btn data
  const csb = el("copy-style-btn");
  if (csb) csb.onclick = () => copyText(raw, "copy-style-btn");
}

function el(id) { return document.getElementById(id); }

// ═══════════════════════════════════════════════════════════════
// TEMPO SLIDER REBIND
// ═══════════════════════════════════════════════════════════════
function bindTempoSlider() {
  const sl = el("tempo-slider");
  if (sl) {
    sl.oninput = function() {
      S.bpm = parseInt(this.value);
      const num = el("bpm-num");
      if (num) num.textContent = this.value;
      patchPreviews();
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════
function clearGenre() {
  S.genre = null; S.subgenre = ""; S.customSubgenre = "";
  S.moods = []; S.bpm = null; S.instruments = []; S.production = []; S.genreGroup = "Caribbean";
  S.qualityTags = []; S.vocalTags = [];
  S.metaProductionTags = []; S.metaMoodTags = []; S.artistRef = "";
  S.vocalGender = null;
  S.songKey = null; S.chordProgression = ""; S.customChordProgression = "";
  S.step = 1; S.substep = 1; S._validateUnlocked = false;
  render();
}

// ── FAVORITES ──────────────────────────────────────────────────
function getFavs() {
  try { return JSON.parse(localStorage.getItem("sunoFavGenres") || "[]"); } catch { return []; }
}
function saveFavs(arr) { localStorage.setItem("sunoFavGenres", JSON.stringify(arr)); }
function setGenreFilter(g) { S.genreGroup = g || null; render(); }

function toggleFav(id, e) {
  e.stopPropagation();
  const favs = getFavs();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx, 1);
  saveFavs(favs);
  render();
}

function selectGenre(id) {
  if (S.genre === id) return;
  S.genre = id;
  S.subgenre = ""; S.customSubgenre = "";
  const g = KB.genres.find(x => x.id === id);
  S.bpm = g.defaultBPM;
  S.qualityTags = [...g.qualityDefault];
  S.vocalTags = g.vocalDefault ? [g.vocalDefault] : [];
  S.instruments = g.instruments.slice(0, 3);
  S.production = g.production.slice(0, 2);
  S.moods = [];
  S.metaProductionTags = []; S.metaMoodTags = []; S.artistRef = "";
  S.step = 2;
  render();
}

function toggleSub(sg) { S.subgenre = S.subgenre === sg ? "" : sg; render(); }
function addCustomSub() { S.customSubgenre = "Custom Sub-genre"; render(); }

function toggleMood(m) {
  const conflict = moodConflict(m);
  if (conflict && !S.moods.includes(m)) {
    if (!confirm(`⚠️ Soft conflict: ${conflict.reason}\n\nAdd anyway?`)) return;
  }
  S.moods = S.moods.includes(m) ? S.moods.filter(x=>x!==m) : [...S.moods, m];
  render();
}

function promptBPM() {
  const v = prompt("Enter custom BPM (40–250):");
  if (v && !isNaN(v) && +v >= 40 && +v <= 250) { S.bpm = parseInt(v); render(); }
}

function toggleInst(i) {
  S.instruments = S.instruments.includes(i) ? S.instruments.filter(x=>x!==i) : [...S.instruments, i];
  render();
}

function toggleProd(p) {
  S.production = S.production.includes(p) ? S.production.filter(x=>x!==p) : [...S.production, p];
  render();
}

function toggleQTag(t) {
  S.qualityTags = S.qualityTags.includes(t) ? S.qualityTags.filter(x=>x!==t) : [...S.qualityTags, t];
  render();
}

const _EXCL_VOCAL = ["[No Vocals]","[Instrumental]"];
function toggleVTag(t) {
  const isOn = S.vocalTags.includes(t);
  if (isOn) {
    S.vocalTags = S.vocalTags.filter(x => x !== t);
  } else {
    if (_EXCL_VOCAL.includes(t)) {
      // Adding exclusion tag — clear all non-exclusion vocal tags
      S.vocalTags = S.vocalTags.filter(x => _EXCL_VOCAL.includes(x));
    } else {
      // Adding vocal style/gender — clear exclusion tags
      S.vocalTags = S.vocalTags.filter(x => !_EXCL_VOCAL.includes(x));
    }
    S.vocalTags.push(t);
  }
  render();
}

function toggleEx(e) {
  S.excludes = S.excludes.includes(e) ? S.excludes.filter(x=>x!==e) : [...S.excludes, e];
  render();
}

function toggleMetaProd(t) {
  S.metaProductionTags = S.metaProductionTags.includes(t) ? S.metaProductionTags.filter(x=>x!==t) : [...S.metaProductionTags, t];
  render();
}

function toggleMetaMood(t) {
  S.metaMoodTags = S.metaMoodTags.includes(t) ? S.metaMoodTags.filter(x=>x!==t) : [...S.metaMoodTags, t];
  render();
}

// ── PRESETS ───────────────────────────────
// ── PRESETS ───────────────────────────────────────────────────
function openPresets() {
  renderPresetList();
  document.getElementById("preset-backdrop").classList.add("open");
}
function closePresets() {
  document.getElementById("preset-backdrop").classList.remove("open");
}
function renderPresetList() {
  const presets = getPresets();
  const el = document.getElementById("preset-list");
  if (!el) return;
  if (!presets.length) {
    el.innerHTML = `<div class="preset-empty">No saved presets yet.<br>Fill in the builder and save your first one!</div>`;
    return;
  }
  el.innerHTML = `<div class="preset-list">${presets.map((p,i) => `
    <div class="preset-item">
      <div class="preset-item-info">
        <div class="preset-item-name">${esc(p.name)}</div>
        <div class="preset-item-meta">${esc(p.meta)}</div>
      </div>
      <button class="btn" onclick="loadPreset(${i})" style="font-size:11px;padding:4px 10px">Load</button>
      <button class="btn-icon del" onclick="deletePreset(${i})" title="Delete">✕</button>
    </div>`).join("")}
  </div>`;
}
function getPresets() {
  try { return JSON.parse(localStorage.getItem("sunoPresets") || "[]"); } catch(e) { return []; }
}
function quickSavePreset() {
  if (!S.genre) return;
  const def = [S.genre, S.subgenre, S.moods[0]].filter(Boolean).join(' · ');
  const name = prompt('Save preset as:', def);
  if (name === null || !name.trim()) return;
  const nm = name.trim();
  const lib = JSON.parse(localStorage.getItem('suno_presets') || '[]');
  lib.unshift({ name: nm, state: JSON.parse(JSON.stringify(S)), saved: Date.now() });
  localStorage.setItem('suno_presets', JSON.stringify(lib.slice(0, 40)));
  const fb = document.createElement('div');
  fb.textContent = '✓ Saved: ' + nm;
  Object.assign(fb.style, { position:'fixed', bottom:'80px', right:'20px',
    background:'#22c55e', color:'#fff', padding:'8px 16px', borderRadius:'8px',
    fontSize:'13px', fontWeight:'700', zIndex:'9999',
    boxShadow:'0 4px 12px rgba(0,0,0,.4)' });
  document.body.appendChild(fb);
  setTimeout(() => { fb.style.opacity='0'; setTimeout(()=>fb.remove(),300); }, 2200);
}

function savePreset() {
  const nameEl = document.getElementById("preset-name-input");
  const name = (nameEl ? nameEl.value.trim() : "") || "Untitled Preset";
  const g = G();
  const meta = g ? `${g.name}${S.subgenre?" › "+S.subgenre:""} · ${S.bpm||g.defaultBPM} BPM · ${S.moods.slice(0,2).join(", ")||"no mood"}` : "No genre selected";
  const presets = getPresets();
  presets.unshift({ name, meta, state: JSON.parse(JSON.stringify(S)) });
  localStorage.setItem("sunoPresets", JSON.stringify(presets.slice(0,20)));
  if (nameEl) nameEl.value = "";
  renderPresetList();
}
function loadPreset(idx) {
  const presets = getPresets();
  if (!presets[idx]) return;
  const saved = presets[idx].state;
  const theme = S.theme;
  S = { ...saved, theme,
    metaProductionTags: saved.metaProductionTags || [],
    metaMoodTags: saved.metaMoodTags || [],
    artistRef: saved.artistRef || ""
  };
  closePresets();
  applyTheme(S.theme);
  render();
}
function deletePreset(idx) {
  if (!confirm("Delete this preset?")) return;
  const presets = getPresets();
  presets.splice(idx, 1);
  localStorage.setItem("sunoPresets", JSON.stringify(presets));
  renderPresetList();
}

// ── LYRICS SECTION ACTIONS ────────────────────────────────────
function addSection(tag) {
  S.lyricsSections.push({ id: uid(), structTag: tag, deliveryTags: [], text: "", open: true });
  render();
}
function removeSection(i) { S.lyricsSections.splice(i, 1); render(); }
function cloneSection(i) {
  const src = S.lyricsSections[i];
  const copy = { id: uid(), structTag: src.structTag, deliveryTags: [...src.deliveryTags], text: src.text, open: true };
  S.lyricsSections.splice(i + 1, 0, copy);
  render();
}
function moveSection(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= S.lyricsSections.length) return;
  [S.lyricsSections[i], S.lyricsSections[j]] = [S.lyricsSections[j], S.lyricsSections[i]];
  render();
}
function toggleDelivery(i, tag) {
  const sec = S.lyricsSections[i];
  sec.deliveryTags = sec.deliveryTags.includes(tag)
    ? sec.deliveryTags.filter(t => t !== tag)
    : [...sec.deliveryTags, tag];
  render();
}

// ── DRAG & DROP ───────────────────────────────────────────────
function onDragStart(e, i) { dragIdx = i; e.currentTarget.classList.add("dragging"); }
function onDragEnd(e) {
  dragIdx = null;
  e.currentTarget.classList.remove("dragging");
  document.querySelectorAll(".lsec").forEach(el => el.classList.remove("drag-over"));
}
function onDragOver(e, i) { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }
function onDragLeave(e) { e.currentTarget.classList.remove("drag-over"); }
function onDrop(e, i) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");
  if (dragIdx === null || dragIdx === i) return;
  const item = S.lyricsSections.splice(dragIdx, 1)[0];
  S.lyricsSections.splice(i, 0, item);
  dragIdx = null;
  render();
}

function scrollToSection(id) {
  const el = document.getElementById("lsec-" + id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── COPY / EXPORT / IMPORT ────────────────────────────────────
function _clipFallback(text) {
  // Works in file:// and older browsers
  const ta = Object.assign(document.createElement("textarea"), {
    value: text, style: "position:fixed;top:-999px;left:-999px;opacity:0"
  });
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand("copy"); } catch(e) {}
  document.body.removeChild(ta);
}

function copyText(text, btnId) {
  const flash = () => {
    const btn = document.getElementById(btnId);
    if (btn) {
      const o = btn.textContent;
      btn.textContent = "✓ Copied!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = o; btn.classList.remove("copied"); }, 2000);
    }
  };
  try {
    if (navigator.clipboard && location.protocol !== "file:") {
      navigator.clipboard.writeText(text).then(flash).catch(() => { _clipFallback(text); flash(); });
    } else {
      _clipFallback(text); flash();
    }
  } catch(e) { _clipFallback(text); flash(); }
}

function copyLyrics() {
  copyText(assembleLyrics(), "copy-lyr-btn");
}

function copyFinal(type) {
  const text = type === "style" ? assemble() : assembleLyrics();
  const btnId = type === "style" ? "copy-style-final-btn" : "copy-lyrics-final-btn";
  _clipFallback(text);
  const ta = document.querySelector(type === "style" ? "#out-style" : "#out-lyrics");
  if (ta) { ta.style.borderColor = "var(--l4)"; setTimeout(() => ta.style.borderColor = "", 1500); }
  const btn = document.getElementById(btnId);
  if (btn) {
    const o = btn.textContent;
    btn.textContent = String.fromCharCode(10003) + " Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = o; btn.classList.remove("copied"); }, 2000);
  }
}

function exportJSON() {
  if (!S.genre) { alert("Select a genre first."); return; }
  const data = {
    version: "1.0",
    exported: new Date().toISOString(),
    state: { ...S },
    output: { styleField: assemble(), lyricsBox: assembleLyrics() }
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `suno-prompt-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
}

function exportTXT() {
  const g = G();
  const style = assemble();
  const lyrics = assembleLyrics();
  const parts = annotatedParts ? annotatedParts() : [];
  const lines = [
    "===================================",
    "  SUNO v5 PROMPT",
    "===================================",
    `  Generated : ${new Date().toLocaleString()}`,
    `  Genre     : ${g ? g.name : "--"}${S.subgenre ? " > " + S.subgenre : ""}`,
    "===================================", "",
    "STYLE FIELD  (paste into Suno Style Field)",
    "-----------------------------------",
    style || "(empty)", "",
    "LAYER BREAKDOWN",
    "-----------------------------------",
    ...parts.map(p => `[${p.label.padEnd(14)}]  ${p.content}`), ""
  ];
  if (lyrics) {
    lines.push("LYRICS BOX  (paste into Suno Lyrics Box)");
    lines.push("-----------------------------------");
    lines.push(lyrics); lines.push("");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `suno-prompt-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function exportDOC() {
  const g = G();
  const style = assemble();
  const lyrics = assembleLyrics();
  const parts = annotatedParts ? annotatedParts() : [];
  const esc2 = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--l1").trim() || "#8b5cf6";
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Suno v5 Prompt<\/title>
<style>body{font-family:Calibri,Arial,sans-serif;margin:2.5cm 3cm;color:#222;font-size:11pt}
h1{font-size:20pt;color:${accent};margin-bottom:2pt}.meta{font-size:9pt;color:#888;margin-bottom:18pt}
h2{font-size:13pt;color:#333;border-bottom:1pt solid #ddd;padding-bottom:4pt;margin:16pt 0 8pt}
.box{background:#f8f8f8;border:1pt solid #ccc;border-radius:4pt;padding:10pt;
  font-family:"Courier New",monospace;font-size:10pt;white-space:pre-wrap}
.layer-row{display:flex;gap:10pt;margin-bottom:4pt}
.layer-label{font-size:9pt;font-weight:bold;color:${accent};min-width:100pt;text-transform:uppercase}
<\/style><\/head><body>
<h1>Suno v5 Prompt<\/h1>
<div class="meta">Generated: ${new Date().toLocaleString()} &nbsp;&#183;&nbsp;
  Genre: <strong>${esc2(g ? g.name : "--")}${S.subgenre ? " > " + esc2(S.subgenre) : ""}<\/strong><\/div>
<h2>Style Field<\/h2>
<div class="box">${esc2(style)}<\/div>
${parts.length ? `<h2>Layer Breakdown<\/h2>
${parts.map(p=>`<div class="layer-row"><span class="layer-label">${esc2(p.label)}<\/span><span>${esc2(p.content)}<\/span><\/div>`).join("")}` : ""}
${lyrics ? `<h2>Lyrics Box<\/h2><div class="box">${esc2(lyrics)}<\/div>` : ""}
<\/body><\/html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `suno-prompt-${Date.now()}.doc`; a.click();
  URL.revokeObjectURL(url);
}

function toggleExportMenu(e) {
  if (e) e.stopPropagation();
  document.getElementById("export-dd").classList.toggle("open");
}
function closeExportMenu() {
  const dd = document.getElementById("export-dd");
  if (dd) dd.classList.remove("open");
}
document.addEventListener("click", closeExportMenu);

function importJSON() {
  const input = document.createElement("input");
  input.type = "file"; input.accept = ".json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const saved = data.state || data;
        const theme = S.theme;
        S = { ...S, ...saved, theme,
          metaProductionTags: saved.metaProductionTags || [],
          metaMoodTags: saved.metaMoodTags || [],
          artistRef: saved.artistRef || "",
          excludes: saved.excludes || [],
          customExcludes: saved.customExcludes || [],
          vocalGender: saved.vocalGender || null,

        };
        render();
      } catch(err) { alert("Invalid JSON: " + err.message); }
    };
    reader.readAsText(file);
  };
  input.click();
}

// -- RESET --
function resetAll() {
  if (!confirm("Reset all selections?")) return;
  const theme = S.theme;
  S = {
    genre: null, subgenre: "", customSubgenre: "",
    moods: [], customMood: "", bpm: null,
    instruments: [], customInstruments: [],
    production: [], customProduction: [],
    qualityTags: [], vocalTags: [],
    metaProductionTags: [], metaMoodTags: [], artistRef: "",
    excludes: [], customExcludes: [],
    vocalGender: null, genreGroup: "Caribbean", substep: 1, _validateUnlocked: false,
    vocalistProfile: null,
    customStyleText: "", lyricsSections: [],
    useGuidedLyrics: true, freeLyrics: "",
    open: { subgenre:true, mood:true, tempo:true, instruments:true, production:true,
            quality:true, vocal:true, metaprod:false, metamood:false, artistref:false,
            exclude:true, moreopts:true, vocbuild:false, custom:false, lyrics:true },
    theme
  };
  render();
}

// ── VOCALIST LIBRARY ─────────────────────────────────────────
const VOICE_TYPES = ["Soprano","Mezzo-Soprano","Alto","Tenor","Baritone","Bass","Unspecified"];
const VOICE_QUALITIES = ["raspy","breathy","smooth","silky","warm","bright","dark","nasal","velvety","powerful","delicate","rich","gritty","airy","husky","piercing","sultry","mellow"];
const VOICE_REGISTERS = ["chest voice","mixed voice","head voice","falsetto","full range"];
const VOICE_DELIVERY = ["straight-tone","vibrato","belting","crooning","melisma","runs & riffs","whisper","yodel","soulful runs","ad-libs","falsetto breaks","vocal fry"];
const VOICE_TIMBRE = ["smoky rasp","vocal fry","close mic","warm storytelling","confident delivery","ethereal","resonant","weathered","intimate","restrained"];
const VOICE_PITCH_PRESETS = [
  { label:"D2-D4  Deep Bass",   val:"D2 to D4",   hint:"Massive resonant bass — anchors to chest voice, prevents falsetto breakouts" },
  { label:"F2-F4  Gritty Bari", val:"F2 to F4",   hint:"Gritty baritone — stack with smoky rasp or vocal fry" },
  { label:"B1-B3  Proximity",   val:"B1 to B3",   hint:"Intimate whisper register — combine with close mic + kill the reverb" },
  { label:"D2  Mechanical",     val:"stay on D2", hint:"Single-note drone — removes melody, forces robotic/deadpan character" },
];

const VP_KEY = "sunoVocalists";

function getVocalistLibrary() {
  try { return JSON.parse(localStorage.getItem(VP_KEY) || "[]"); } catch { return []; }
}
function saveVocalistLibrary(arr) { localStorage.setItem(VP_KEY, JSON.stringify(arr)); }

// Draft profile held in state:
// S.vocalistDraft = { name, type, qualities[], register, delivery[] }
// S.vocalistProfile = active loaded profile (inserted into assemble)

function vocalistBuilderHTML() {
  if (!S.vocalistDraft) S.vocalistDraft = { name:"", type:"Unspecified", qualities:[], register:"", delivery:[], pitchRange:"", timbre:[] };
  const d = S.vocalistDraft;
  const lib = getVocalistLibrary();

  const typeRow = VOICE_TYPES.map(t =>
    `<button class="chip${d.type===t?" active":""}" onclick="setVocalDraft('type','${t}')" ${chipHint(t)?`data-tip="${esc(chipHint(t))}"`:""}>${t}</button>`
  ).join("");

  const qualRow = VOICE_QUALITIES.map(q =>
    `<button class="chip${d.qualities.includes(q)?" active":""}" onclick="toggleVocalDraftArr('qualities','${q}')" ${chipHint(q)?`data-tip="${esc(chipHint(q))}"`:""}>${q}</button>`
  ).join("");

  const regRow = VOICE_REGISTERS.map(r =>
    `<button class="chip${d.register===r?" active":""}" onclick="setVocalDraft('register','${r}')" ${chipHint(r)?`data-tip="${esc(chipHint(r))}"`:""}>${r}</button>`
  ).join("");

  const delRow = VOICE_DELIVERY.map(v =>
    `<button class="chip${d.delivery.includes(v)?" active":""}" onclick="toggleVocalDraftArr('delivery','${v}')" ${chipHint(v)?`data-tip="${esc(chipHint(v))}"`:""}>${v}</button>`
  ).join("");

  const timbreRow = VOICE_TIMBRE.map(t =>
    `<button class="chip${d.timbre && d.timbre.includes(t)?" active":""}" onclick="toggleVocalDraftArr('timbre','${t}')" ${chipHint(t)?`data-tip="${esc(chipHint(t))}"`:""}>${t}</button>`
  ).join("");

  const pitchRow = VOICE_PITCH_PRESETS.map(p =>
    `<button class="chip${d.pitchRange===p.val?" active":""}" onclick="setVocalDraft('pitchRange','${p.val}')" title="${p.hint}">${p.label}</button>`
  ).join("");

  const preview = assembleVocalistStr(d);
  const cmdBlock = buildVocalistCmdBlock(d);
  const hasProfile = !!S.vocalistProfile;

  const libSection = lib.length ? `
    <div class="vo-lib-header">Saved Vocalists</div>
    <div class="vo-lib-list">
      ${lib.map((v, i) => `
        <div class="vo-lib-item${S.vocalistProfile && S.vocalistProfile._idx === i ? " active" : ""}">
          <div class="vo-lib-name">${esc(v.name || "Unnamed")}</div>
          <div class="vo-lib-desc">${esc(assembleVocalistStr(v))}</div>
          <div class="vo-lib-actions">
            <button class="btn btn-xs" onclick="loadVocalistProfile(${i})">Use</button>
            <button class="btn btn-xs" onclick="editVocalistProfile(${i})">Edit</button>
            <button class="btn btn-xs btn-danger-ghost" onclick="deleteVocalistProfile(${i})">&#x2715;</button>
          </div>
        </div>`).join("")}
    </div>` : `<div class="fav-empty" style="padding:8px 0">${t("noVocalists")}</div>`;

  const body = `
    <div class="card-inner" style="padding-bottom:4px">
      ${hasProfile ? `<div class="vo-active-banner">
        <span>Active: <strong>${esc(S.vocalistProfile.name || "Custom")}</strong> &mdash; ${esc(assembleVocalistStr(S.vocalistProfile))}</span>
        <button class="btn btn-xs btn-danger-ghost" onclick="S.vocalistProfile=null;patchPreviews()">Remove</button>
      </div>` : ""}
      <div class="vo-section-label">Voice Type</div>
      <div class="chip-group">${typeRow}</div>
      <div class="vo-section-label">Tone Qualities <span class="vo-hint">pick any</span></div>
      <div class="chip-group">${qualRow}</div>
      <div class="vo-section-label">Register</div>
      <div class="chip-group">${regRow}</div>
      <div class="vo-section-label">Delivery <span class="vo-hint">pick any</span></div>
      <div class="chip-group">${delRow}</div>
      <div class="vo-section-label">Timbre Keywords <span class="vo-hint">texture descriptors &mdash; added to style prompt</span></div>
      <div class="chip-group">${timbreRow}</div>
      <div class="vo-section-label">Pitch Register <span class="vo-hint">mathematical range constraint &mdash; hover each for detail</span></div>
      <div class="chip-group">${pitchRow}</div>
      <input class="text-input" style="margin-top:5px;font-size:12px;width:100%" placeholder="Custom range e.g. C2 to E4 or stay on D2..."
        value="${esc(d.pitchRange||'')}" oninput="S.vocalistDraft.pitchRange=this.value;render()">
      ${preview ? `<div class="vo-preview">&#x2192; <code>${esc(preview)}</code></div>` : ""}
      ${cmdBlock ? `<div class="vo-preview" style="margin-top:4px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span>&#x1F4CB; ${t("cmdBlockLabel")}</span>
          <code>${esc(cmdBlock)}</code>
          <button class="btn btn-xs" onclick="copyVocalistCmdBlock()">${t("copyBtn")}</button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${t("cmdBlockHint")}</div>
      </div>` : ""}
      <div class="vo-actions">
        <input class="text-input" style="flex:1;font-size:13px" placeholder="${t('vocalistNamePh')}"
          value="${esc(d.name)}" oninput="S.vocalistDraft.name=this.value">
        <button class="btn" onclick="applyVocalistDraft()" ${preview?"":"disabled"}>${t("useBtn")}</button>
        <button class="btn" onclick="saveVocalistAs()" ${preview?"":"disabled"}>${t("saveBtn")}</button>
        <button class="btn btn-ghost" onclick="clearVocalistDraft()">${t("clearBtn")}</button>
      </div>
    </div>
    <div class="card-inner" style="border-top:1px solid var(--border);padding-top:12px">
      ${libSection}
    </div>`;

  const sm = S.vocalistProfile
    ? (S.vocalistProfile.name || assembleVocalistStr(S.vocalistProfile))
    : (preview || null);

  return sectionCard("vocbuild","🎤","background:var(--pink);color:#fff","Vocalist Profile",
    "Define technical voice qualities that get added to your style prompt","var(--pink)",sm,body);
}

function assembleVocalistStr(vp) {
  if (!vp) return "";
  const parts = [];
  if (vp.type && vp.type !== "Unspecified") parts.push(vp.type);
  if (vp.qualities && vp.qualities.length) parts.push(...vp.qualities);
  if (vp.timbre && vp.timbre.length) parts.push(...vp.timbre);
  if (vp.register) parts.push(vp.register);
  if (vp.pitchRange) parts.push(vp.pitchRange);
  if (vp.delivery && vp.delivery.length) parts.push(...vp.delivery);
  return parts.length ? "vocalist: " + parts.join(", ") : "";
}

function setVocalDraft(key, val) {
  if (!S.vocalistDraft) S.vocalistDraft = { name:"", type:"Unspecified", qualities:[], register:"", delivery:[] };
  if (S.vocalistDraft[key] === val) S.vocalistDraft[key] = key === "type" ? "Unspecified" : "";
  else S.vocalistDraft[key] = val;
  render();
}

function toggleVocalDraftArr(key, val) {
  if (!S.vocalistDraft) S.vocalistDraft = { name:"", type:"Unspecified", qualities:[], register:"", delivery:[], pitchRange:"", timbre:[] };
  const arr = S.vocalistDraft[key];
  if (!Array.isArray(arr)) return;
  const idx = arr.indexOf(val);
  if (idx === -1) arr.push(val); else arr.splice(idx, 1);
  render();
}

function applyVocalistDraft() {
  if (!S.vocalistDraft) return;
  S.vocalistProfile = { ...S.vocalistDraft, _idx: null };
  render();
}

function saveVocalistAs() {
  if (!S.vocalistDraft) return;
  const name = prompt(t("saveAsTitle"), S.vocalistDraft.name || t("saveAsPlaceholder"));
  if (name === null) return;
  S.vocalistDraft.name = name.trim() || S.vocalistDraft.name || "Vocalist";
  saveVocalistDraft();
}

function saveVocalistDraft() {
  if (!S.vocalistDraft) return;
  const lib = getVocalistLibrary();
  const entry = { ...S.vocalistDraft };
  delete entry._idx;
  lib.push(entry);
  saveVocalistLibrary(lib);
  S.vocalistProfile = { ...entry, _idx: lib.length - 1 };
  render();
}

function loadVocalistProfile(i) {
  const lib = getVocalistLibrary();
  if (!lib[i]) return;
  S.vocalistProfile = { ...lib[i], _idx: i };
  S.vocalistDraft = { ...lib[i] };
  patchPreviews();
  render();
}

function editVocalistProfile(i) {
  const lib = getVocalistLibrary();
  if (!lib[i]) return;
  S.vocalistDraft = { ...lib[i], _idx: i };
  render();
}

function deleteVocalistProfile(i) {
  if (!confirm("Delete this vocalist profile?")) return;
  const lib = getVocalistLibrary();
  lib.splice(i, 1);
  saveVocalistLibrary(lib);
  if (S.vocalistProfile && S.vocalistProfile._idx === i) S.vocalistProfile = null;
  render();
}

function clearVocalistDraft() {
  S.vocalistDraft = { name: "", type: "Unspecified", qualities: [], register: "", delivery: [], pitchRange: "", timbre: [] };
  render();
}

function buildVocalistCmdBlock(vp) {
  if (!vp) return "";
  const parts = [];
  // Voice type as Suno tag
  if (vp.type && vp.type !== "Unspecified") {
    parts.push("[" + vp.type + " Voice]");
    // Range exclusions for classical types
    const blMap = {
      "Bass":          ["no falsetto","no tenor","no soprano"],
      "Baritone":      ["no falsetto","no soprano"],
      "Tenor":         ["no bass","no baritone","no soprano"],
      "Alto":          ["no soprano","no falsetto"],
      "Mezzo-Soprano": ["no bass","no baritone"],
      "Soprano":       ["no bass","no baritone","no tenor"],
    };
    if (blMap[vp.type]) blMap[vp.type].forEach(b => parts.push("[" + b + "]"));
  }
  if (vp.timbre && vp.timbre.length) vp.timbre.forEach(t => parts.push("[" + t + "]"));
  if (vp.pitchRange) parts.push("[" + vp.pitchRange + "]");
  return parts.join("");
}

function copyVocalistCmdBlock() {
  const block = buildVocalistCmdBlock(S.vocalistDraft) || buildVocalistCmdBlock(S.vocalistProfile);
  if (block) { _clipFallback(block); }
}


// ═══════════════════════════════════════════════════════════════
// i18n


// ── VALIDATION ────────────────────────────────────────────────
function validatePrompt() {
  const results = [];
  for (const rule of VALIDATION_RULES) {
    try {
      if (rule.check(S)) {
        const loc = rule[S.lang] || rule.en;
        results.push({
          id:         rule.id,
          category:   rule.category,
          severity:   rule.severity,
          msg:        loc.msg + (rule._detail ? ` (${rule._detail})` : ""),
          suggestion: loc.suggestion,
        });
        rule._detail = null; // reset
      }
    } catch(e) { /* rule error — skip */ }
  }
  const deductions = results.reduce((acc, r) =>
    acc + (r.severity === "error" ? 30 : r.severity === "warning" ? 15 : 5), 0);
  const score = Math.max(0, 100 - deductions);
  return { results, score };
}

function scoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}
function scoreLabel(score) {
  const v = t("validate");
  if (score >= 80) return v.perfect;
  if (score >= 55) return v.good;
  if (score >= 30) return v.fair;
  return v.weak;
}

function validateHTML() {
  const { results, score } = validatePrompt();
  const v      = t("validate");
  const errors = results.filter(r => r.severity === "error");
  const warns  = results.filter(r => r.severity === "warning");
  const tips   = results.filter(r => r.severity === "tip");
  const col    = scoreColor(score);

  const issueBlock = (label, icon, items, cls) => items.length === 0 ? "" : `
    <div class="val-group">
      <div class="val-group-hdr ${cls}">${icon} ${label} (${items.length})</div>
      ${items.map(r => `
        <div class="val-issue">
          <div class="val-issue-msg">${r.msg}</div>
          <div class="val-issue-tip">💡 ${r.suggestion}</div>
        </div>`).join("")}
    </div>`;

  // Exclude summary
  const excl = [...S.excludes, ...S.customExcludes.filter(Boolean)];
  const exclHTML = excl.length
    ? excl.map(e => `<span class="chip chip-sm chip-exclude">no: ${esc(e)}</span>`).join("")
    : `<span class="val-empty">${v.excludeEmpty}</span>`;

  return `
    <div class="val-score-row">
      <div class="val-score-ring" style="--sc:${col}">
        <svg viewBox="0 0 64 64" class="val-ring-svg">
          <circle cx="32" cy="32" r="26" class="val-ring-bg"/>
          <circle cx="32" cy="32" r="26" class="val-ring-fill"
            style="stroke:${col};stroke-dasharray:${Math.round(score*1.634)} 163.4"/>
        </svg>
        <div class="val-score-num" style="color:${col}">${score}</div>
      </div>
      <div class="val-score-info">
        <div class="val-score-label">${v.score}</div>
        <div class="val-score-tag" style="background:${col}">${scoreLabel(score)}</div>
        ${results.length === 0
          ? `<div class="val-ok">✓ ${v.noIssues}</div>`
          : `<div class="val-summary">
              ${errors.length  ? `<span class="val-badge err">${errors.length} ${v.errors}</span>` : ""}
              ${warns.length   ? `<span class="val-badge wrn">${warns.length} ${v.warnings}</span>` : ""}
              ${tips.length    ? `<span class="val-badge tip">${tips.length} ${v.tips}</span>` : ""}
             </div>`}
      </div>
    </div>

    <div class="val-issues">
      ${issueBlock(v.errors,   "🔴", errors, "err")}
      ${issueBlock(v.warnings, "🟡", warns,  "wrn")}
      ${issueBlock(v.tips,     "💡", tips,   "tip")}
      ${results.length === 0
        ? `<div class="val-clear">🎉 ${v.noIssues}</div>`
        : ""}
    </div>

    <div class="val-exclude-box">
      <div class="val-exclude-hdr">🚫 ${v.excludeSection}</div>
      <div class="val-exclude-chips">${exclHTML}</div>
      <div class="val-exclude-add">
        ${KB.commonExcludes.map(ex=>`<button
          class="chip chip-sm${S.excludes.includes(ex)?" active chip-exclude":""}"
          onclick="toggleEx('${ex}');render();showValidate()">${ex}</button>`).join("")}
      </div>
      ${S.customExcludes.map((ex,i)=>`
        <div class="val-excl-custom">
          <input class="text-input" value="${esc(ex)}"
            oninput="S.customExcludes[${i}]=this.value;patchPreviews()"
            placeholder="Custom exclude...">
          <button class="btn-del" onclick="S.customExcludes.splice(${i},1);render();showValidate()">✕</button>
        </div>`).join("")}
      <button class="btn-add" onclick="S.customExcludes.push('');render();showValidate()">+ Add exclude</button>
    </div>
  `;
}


function validateStepHTML() {
  return `
    <div class="vstep-wrap">
      <div class="vstep-badge-row">
        <span class="vstep-opt-badge">⚡ Optional — but recommended</span>
        <p class="vstep-opt-hint">A quick scan catches common mistakes before you spend a generation. You can also skip straight to Copy &amp; Generate below.</p>
      </div>
      <div class="vstep-body">${validateHTML()}</div>
    </div>
  `;
}

function showValidate() {
  // Re-render if already open (picks up state changes)
  const existing = document.getElementById('validate-modal');
  if (existing) { existing.remove(); }
  const v = t("validate");
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="val-modal" id="validate-modal">
      <div class="val-modal-card">
        <div class="val-modal-hdr">
          <span>✅ ${v.title}</span>
          <button class="val-modal-close" onclick="closeValidate()">✕</button>
        </div>
        <div class="val-modal-body">${validateHTML()}</div>
        <div class="val-modal-foot">
          <button class="btn" onclick="closeValidate()">${v.closeBtn}</button>
          <button class="btn btn-primary" onclick="copyFinal('style');closeValidate()">📋 ${v.generateBtn}</button>
        </div>
      </div>
    </div>`);
  document.body.style.overflow = 'hidden';
}

function closeValidate() {
  const el = document.getElementById('validate-modal');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => { el.remove(); document.body.style.overflow = ''; }, 200);
  }
}


// ── SONG MANAGEMENT (SQLite · File System Access API) ────────
// Writes a real rickai.db file to a user-chosen folder.
// Falls back to IndexedDB if File System Access API unavailable.

const LS_SONGS  = 'rickai_songs';   // legacy / migration
const IDB_NAME  = 'rickai_db';
const IDB_STORE = 'sqlite';
let   db        = null;             // sql.js instance
let  _fileHandle = null;            // FileSystemFileHandle (if supported)

// ── IDB helpers (store file handle + blob fallback) ───────────
function _idbOpen() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = rej;
  });
}
async function _idbGet(key) {
  const idb = await _idbOpen();
  return new Promise((res, rej) => {
    const tx = idb.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror = rej;
  });
}
async function _idbPut(key, val) {
  const idb = await _idbOpen();
  return new Promise((res, rej) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(val, key);
    tx.oncomplete = res; tx.onerror = rej;
  });
}

// ── File persistence ─────────────────────────────────────────
async function _verifyPermission(handle) {
  const opts = { mode: 'readwrite' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  return (await handle.requestPermission(opts)) === 'granted';
}

async function pickDBFile() {
  if (!window.showSaveFilePicker) {
    pbToast('File picker not supported in this browser', true);
    return false;
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'rickai.db',
      types: [{ description: 'SQLite Database', accept: { 'application/x-sqlite3': ['.db'] } }]
    });
    _fileHandle = handle;
    await _idbPut('fileHandle', handle);
    await _dbWriteFile();
    pbToast('✓ DB file set — saves here from now on');
    patchCloudBtn();
    return true;
  } catch(e) { return false; } // user cancelled
}

async function _dbWriteFile() {
  if (!db || !_fileHandle) return;
  try {
    const data     = db.export();
    const writable = await _fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  } catch(e) {
    console.warn('File write failed, falling back to IDB:', e.message);
    _fileHandle = null;
    await _idbPut('fileHandle', null);
    await _idbPut('blob', db.export());
  }
}

function _dbPersist() {
  if (!db) return;
  if (_fileHandle) {
    _dbWriteFile();           // → real .db file on disk
  } else {
    _idbPut('blob', db.export()); // → IDB fallback
  }
}

// ── DB init ───────────────────────────────────────────────────
async function initDB() {
  try {
    if (typeof initSqlJs === 'undefined') throw new Error('sql.js not loaded');
    const SQL = await initSqlJs({
      locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
    });

    // Try to reopen saved file handle
    let initialData = null;
    const savedHandle = await _idbGet('fileHandle');
    if (savedHandle && window.showSaveFilePicker) {
      try {
        if (await _verifyPermission(savedHandle)) {
          _fileHandle = savedHandle;
          const file  = await savedHandle.getFile();
          const buf   = await file.arrayBuffer();
          if (buf.byteLength > 0) initialData = new Uint8Array(buf);
        }
      } catch(e) { _fileHandle = null; }
    }

    // Fall back to IDB blob
    if (!initialData) {
      const blob = await _idbGet('blob');
      if (blob) initialData = blob;
    }

    db = initialData ? new SQL.Database(initialData) : new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS songs (
      id      TEXT PRIMARY KEY,
      title   TEXT NOT NULL,
      state   TEXT NOT NULL,
      created TEXT NOT NULL,
      updated TEXT NOT NULL
    )`);

    // Migrate from legacy localStorage
    const legacy = JSON.parse(localStorage.getItem(LS_SONGS) || '[]');
    if (legacy.length && !dbGetSongs().length) {
      legacy.forEach(s => _dbInsert(s.id, s.title, s.state, s.created, s.updated));
      _dbPersist();
      localStorage.removeItem(LS_SONGS);
      pbToast('✓ Songs migrated to SQLite (' + legacy.length + ')');
    }

    patchCloudBtn();
    const loc = _fileHandle ? '→ ' + _fileHandle.name : '→ IndexedDB (no file chosen yet)';
    console.log('SQLite ready ' + loc + ' — ' + dbGetSongs().length + ' songs');
  } catch(e) {
    console.warn('sql.js init failed, using localStorage:', e.message);
    db = null;
  }
}

// ── CRUD ──────────────────────────────────────────────────────
function _dbInsert(id, title, state, created, updated) {
  db.run('INSERT OR REPLACE INTO songs VALUES (?,?,?,?,?)',
    [id, title, state, created, updated]);
}

function dbGetSongs() {
  if (!db) return JSON.parse(localStorage.getItem(LS_SONGS) || '[]');
  const res = db.exec('SELECT id,title,state,created,updated FROM songs ORDER BY updated DESC');
  if (!res.length) return [];
  return res[0].values.map(([id,title,state,created,updated]) =>
    ({ id, title, state, created, updated }));
}

// ── Session tracking ──────────────────────────────────────────
let _songId    = null;
let _songTitle = "";
let _savedHash = "";

function _stateHash() {
  const { step, substep, lang, open, genreGroup, _validateUnlocked, ...core } = S;
  return JSON.stringify(core);
}
function _isDirty() { return _stateHash() !== _savedHash; }

function patchCloudBtn() {
  const btn = document.getElementById('cloud-btn');
  if (!btn) return;
  const lbl  = _songTitle || 'Songs';
  const dbLbl = _fileHandle
    ? `<span style="font-size:9px;opacity:.5;margin-left:3px" title="${_fileHandle.name}">🗄</span>` : '';
  if (_songId && !_isDirty()) btn.innerHTML = `<span style="color:#22c55e">💾</span> ${lbl}${dbLbl}`;
  else if (_songId)           btn.innerHTML = `<span style="color:#f59e0b">💾●</span> ${lbl}${dbLbl}`;
  else                        btn.innerHTML = `💾 Songs${dbLbl}`;
}

// ── Song library modal ────────────────────────────────────────
function showSongLibrary() {
  const existing = document.getElementById('songs-modal');
  if (existing) existing.remove();
  const dbBanner = _fileHandle
    ? `<div class="songs-db-banner songs-db-connected"><span class="songs-db-icon">🗄</span><span class="songs-db-name">${_fileHandle.name}</span></div>`
    : `<div class="songs-db-banner songs-db-unpicked">
        <span class="songs-db-icon">💿</span>
        <div class="songs-db-msg"><strong>No DB file selected</strong><span>Pick a file to save songs to disk</span></div>
        <button class="btn songs-db-pick-btn" onclick="pickDBFile().then(()=>pbRefreshList())">📂 Choose file</button>
      </div>`;
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="pb-modal" id="songs-modal">
      <div class="pb-card pb-card-wide">
        <div class="pb-hdr">
          <span>💾 My Songs</span>
          <button class="pb-close" onclick="closeModal('songs-modal')">✕</button>
        </div>
        ${dbBanner}
        <div class="pb-toolbar">
          <button class="btn btn-primary" onclick="pbNewSong()">+ Save Current</button>
        </div>
        <div class="pb-body" id="songs-list"></div>
      </div>
    </div>`);
  document.body.style.overflow = 'hidden';
  pbRefreshList();
}

function pbRefreshList() {
  const el = document.getElementById('songs-list');
  if (!el) return;
  const songs = dbGetSongs();
  if (!songs.length) {
    el.innerHTML = '<div class="pb-empty">No saved songs yet. Click "+ Save Current" to save your work.</div>';
    return;
  }
  el.innerHTML = songs.map(s => {
    const isActive = s.id === _songId;
    const ago = _timeAgo(new Date(s.updated));
    let st = {};
    try { st = JSON.parse(s.state); } catch(e) {}
    const preview = [st.genre, st.subgenre || st.customSubgenre,
      (st.moods||[]).slice(0,2).join(', ')].filter(Boolean).join(' · ') || '—';
    return `<div class="song-row${isActive?' active':''}">
      <div class="song-row-info">
        <div class="song-row-title">${esc(s.title)}${isActive?
          ' <span class="song-active-badge">editing</span>':''}</div>
        <div class="song-row-meta">${preview}</div>
        <div class="song-row-time">${ago}</div>
      </div>
      <div class="song-row-actions">
        <button class="btn btn-sm" onclick="pbOpenSong('${s.id}','${esc(s.title)}')">Open</button>
        <button class="btn btn-sm" onclick="pbOverwriteSong('${s.id}','${esc(s.title)}')">Save</button>
        <button class="btn btn-sm btn-danger-ghost" onclick="pbDeleteSong('${s.id}','${esc(s.title)}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

function _timeAgo(d) {
  const s = Math.round((Date.now()-d)/1000);
  if (s<60)    return 'just now';
  if (s<3600)  return Math.round(s/60)+'m ago';
  if (s<86400) return Math.round(s/3600)+'h ago';
  return Math.round(s/86400)+'d ago';
}

function pbNewSong() {
  const title = prompt('Song title:',
    _songTitle||[S.genre,S.subgenre||S.customSubgenre].filter(Boolean).join(' · ')||'Untitled');
  if (!title) return;
  const id=Date.now().toString(36)+Math.random().toString(36).slice(2);
  const now=new Date().toISOString();
  if (db) { _dbInsert(id,title,JSON.stringify(S),now,now); _dbPersist(); }
  else { const a=JSON.parse(localStorage.getItem(LS_SONGS)||'[]'); a.push({id,title,state:JSON.stringify(S),created:now,updated:now}); localStorage.setItem(LS_SONGS,JSON.stringify(a)); }
  _songId=id; _songTitle=title; _savedHash=_stateHash();
  pbRefreshList(); patchCloudBtn();
  pbToast('✓ Saved: '+title);
}

function pbSaveCurrent() {
  if (!_songId) { pbNewSong(); return; }
  const now=new Date().toISOString(), state=JSON.stringify(S);
  if (db) { db.run('UPDATE songs SET state=?,updated=? WHERE id=?',[state,now,_songId]); _dbPersist(); }
  else { const a=JSON.parse(localStorage.getItem(LS_SONGS)||'[]'); const i=a.findIndex(s=>s.id===_songId); if(i>=0) a[i]=Object.assign({},a[i],{state,updated:now}); localStorage.setItem(LS_SONGS,JSON.stringify(a)); }
  _savedHash=_stateHash(); patchCloudBtn();
  pbToast('✓ Saved');
}

function pbOpenSong(id, title) {
  if (_isDirty()&&_songId) { if (!confirm('You have unsaved changes. Open anyway?')) return; }
  const songs=dbGetSongs(), s=songs.find(s=>s.id===id);
  if (!s) return;
  let state={}; try { state=JSON.parse(s.state); } catch(e) {}
  const safe=['genre','subgenre','customSubgenre','moods','customMood','bpm',
    'instruments','customInstruments','production','customProduction',
    'qualityTags','vocalTags','metaProductionTags','metaMoodTags','artistRef',
    'excludes','customExcludes','vocalGender',
    'customStyleText','lyricsSections','useGuidedLyrics','freeLyrics','vocalistProfile'];
  safe.forEach(k=>{ if(state[k]!==undefined) S[k]=state[k]; });
  S.step=1; S.substep=1; S._validateUnlocked=false;
  _songId=id; _songTitle=title; _savedHash=_stateHash();
  render(); patchCloudBtn(); closeModal('songs-modal');
  pbToast('✓ Opened: '+title);
}

function pbOverwriteSong(id, title) {
  if (!confirm('Overwrite "'+title+'" with current state?')) return;
  const now=new Date().toISOString(), state=JSON.stringify(S);
  if (db) { db.run('UPDATE songs SET state=?,updated=? WHERE id=?',[state,now,id]); _dbPersist(); }
  else { const a=JSON.parse(localStorage.getItem(LS_SONGS)||'[]'); const i=a.findIndex(s=>s.id===id); if(i>=0) a[i]=Object.assign({},a[i],{state,updated:now}); localStorage.setItem(LS_SONGS,JSON.stringify(a)); }
  if (id===_songId) { _savedHash=_stateHash(); patchCloudBtn(); }
  pbRefreshList(); pbToast('✓ Saved: '+title);
}

function pbDeleteSong(id, title) {
  if (!confirm('Delete "'+title+'"? This cannot be undone.')) return;
  if (db) { db.run('DELETE FROM songs WHERE id=?',[id]); _dbPersist(); }
  else { const a=JSON.parse(localStorage.getItem(LS_SONGS)||'[]').filter(s=>s.id!==id); localStorage.setItem(LS_SONGS,JSON.stringify(a)); }
  if (id===_songId) { _songId=null; _songTitle=''; patchCloudBtn(); }
  pbRefreshList(); pbToast('Deleted: '+title);
}

function closeModal(id) {
  const el=document.getElementById(id);
  if (el) { el.style.opacity='0'; setTimeout(()=>{ el.remove(); document.body.style.overflow=''; },200); }
}

function pbToast(msg,isErr) {
  const t=document.createElement('div');
  t.className='pb-toast'+(isErr?' pb-toast-err':'');
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),300); },2400);
}

// ── INTRO / ONBOARDING ───────────────────────────────────────
function introHTML() {
  const i = t("intro");
  const steps = i.steps.map((s, idx) => `
    <div class="intro-step">
      <div class="intro-step-icon">${s.icon}</div>
      <div class="intro-step-num">${idx + 1}</div>
      <div class="intro-step-label">${s.label}</div>
      <div class="intro-step-desc">${s.desc}</div>
      ${s.ex?'<div class="intro-step-ex">'+s.ex+'</div>':''}
    </div>`).join('<div class="intro-step-arrow">→</div>');

  return `
  <div class="intro-overlay" id="intro-overlay">
    <div class="intro-card">
      <div class="intro-hero">
        <div class="intro-logo">🎵</div>
        <h2 class="intro-title">${i.title}</h2>
        <p class="intro-tagline">${i.tagline}</p>
      </div>

      <div class="intro-body-text">${i.body}</div>

      <div class="intro-steps-wrap">
        <div class="intro-steps">${steps}</div>
      </div>

      <div class="intro-result">
        <div class="intro-result-title">${i.whatYouGet}</div>
        <div class="intro-result-items">
          <div class="intro-result-item">
            <span class="intro-result-icon">📋</span>
            <div>
              <div class="intro-result-label">${i.styleLabel}</div>
              <div class="intro-result-desc">${i.styleDesc}</div>
            </div>
          </div>
          <div class="intro-result-item">
            <span class="intro-result-icon">📝</span>
            <div>
              <div class="intro-result-label">${i.lyricsLabel}</div>
              <div class="intro-result-desc">${i.lyricsDesc}</div>
            </div>
          </div>
          <div class="intro-result-item">
            <span class="intro-result-icon">🚫</span>
            <div>
              <div class="intro-result-label">${i.excludeLabel}</div>
              <div class="intro-result-desc">${i.excludeDesc}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="intro-actions">
        <button class="intro-skip" onclick="closeIntro(false)">${i.skip}</button>
        <button class="intro-start" onclick="closeIntro(true)">${i.start}</button>
      </div>
    </div>
  </div>`;
}

function showIntro() {
  const existing = document.getElementById('intro-overlay');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('afterbegin', introHTML());
  document.body.style.overflow = 'hidden';
}

function closeIntro(markSeen) {
  if (markSeen) localStorage.setItem('rickai_intro_seen', '1');
  const el = document.getElementById('intro-overlay');
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'scale(.97)';
    setTimeout(() => { el.remove(); document.body.style.overflow = ''; }, 280);
  }
}

// ═══════════════════════════════════════════════════════════════
// WIZARD_STEPS_DEF and LANG are defined in lang.js

function t(key) {
  const parts = key.split(".");
  let obj = LANG[S.lang] || LANG.en;
  for (const p of parts) { obj = obj && obj[p]; }
  if (obj !== undefined && obj !== null) return obj;
  obj = LANG.en;
  for (const p of parts) { obj = obj && obj[p]; }
  return (obj !== undefined && obj !== null) ? obj : key;
}

// kbDesc(key) — get description for a genre id or tag string in current language
function kbDesc(key) {
  const cur = (KB_TEXT[S.lang] || KB_TEXT.en);
  const en  = KB_TEXT.en;
  return cur.tags[key]   || cur.genres[key]   ||
         en.tags[key]    || en.genres[key]     || "";
}
// Alias used by qualityHTML / metaTagsHTML
function getTagDesc(tagStr) { return kbDesc(tagStr); }

// prodTip(str) -- short tooltip for a freeform production style chip
function prodTip(p) {
  const PROD_HINTS = {
    "sidechain":   "Pumping compression synced to the kick drum",
    "reverb":      "Spacious room or hall reverb across the mix",
    "delay":       "Echo repeats that add rhythmic depth",
    "compression": "Dynamic range control for punch and cohesion",
    "distortion":  "Harmonic saturation or clipping for edge",
    "lo-fi":       "Vintage imperfections: crackle, tape hiss, roll-off",
    "lofi":        "Vintage imperfections: crackle, tape hiss, roll-off",
    "analog":      "Warm, organic tape or tube character",
    "warm":        "Soft high-frequency roll-off with low-mid warmth",
    "dark":        "Emphasis on low and low-mid frequencies",
    "bright":      "High-frequency presence and airiness",
    "wide":        "Stereo image expanded for immersive listening",
    "stereo":      "Full stereo field with panning dimension",
    "punchy":      "Strong attack transients with tight release",
    "808":         "Sub-bass 808 kick processing",
    "sub":         "Deep sub-bass frequencies below 80 Hz",
    "bass":        "Emphasized low-end presence",
    "groove":      "Rhythmic pocket with swing or syncopation",
    "danceable":   "Rhythmic drive optimized for danceability",
    "layered":     "Multiple stacked elements for harmonic depth",
    "glitch":      "Rhythmic stutters and digital artifacts",
    "chop":        "Sliced and rearranged sample fragments",
    "minimal":     "Sparse arrangement, few elements, maximum space",
    "lush":        "Dense, rich arrangement with many harmonic layers",
    "cinematic":   "Wide dynamic range with orchestral or dramatic feel",
    "live":        "Organic, human-performed sound rather than programmed",
    "vintage":     "Period-accurate production characteristics",
    "tropical":    "Warm, sun-drenched textures with island feel",
    "intimate":    "Close, quiet, personal: low reverb and volume",
    "saturated":   "Soft clipping or tube warmth from saturation",
    "filtered":    "Frequency-shaped with EQ cuts or sweeps",
    "meringue":    "Upbeat Caribbean rhythm with brass and percussion",
    "kompa":       "Haitian groove with lush brass and smooth guitar",
    "epic":        "Climactic build with large dynamic range",
  };
  const lower = p.toLowerCase();
  for (const [key, hint] of Object.entries(PROD_HINTS)) {
    if (lower.includes(key)) return hint;
  }
  return "";
}

// chipHint(tag) — per-language tooltip from CHIP_HINTS
function chipHint(tag) {
  if (!tag) return '';
  const h = (typeof CHIP_HINTS !== 'undefined' && (CHIP_HINTS[S.lang] || CHIP_HINTS.en)) || {};
  return h[tag] || '';
}

function setLang(l) {
  if (!LANG[l]) return;
  S.lang = l;
  localStorage.setItem("sunoLang", l);
  const sub = document.getElementById("app-subtitle");
  if (sub) sub.textContent = t("subtitle");
  render();
}

// ═══════════════════════════════════════════════════════════════
// WIZARD
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// WIZARD ENGINE
// ═══════════════════════════════════════════════════════════════
function wizardNoVocal() {
  return allTags().some(tg => tg === "[No Vocals]" || tg === "[Instrumental]");
}

function wizardSteps() {
  const noVocal = wizardNoVocal();
  return WIZARD_STEPS_DEF.filter(s => !(s.id === "vocals" && noVocal));
}

function wizardTotalSteps() { return wizardSteps().length; }

function _curStepDef() {
  const steps = wizardSteps();
  return steps[Math.max(0, Math.min((S.step||1)-1, steps.length-1))];
}
function _ssCount(def) { return def && def.substeps ? def.substeps.length : 1; }

function nextStep() {
  const def = _curStepDef();
  const ssCount = _ssCount(def);
  if ((S.substep||1) < ssCount) {
    S.substep = (S.substep||1) + 1;
  } else {
    const steps = wizardSteps();
    const total = steps.length;
    if (S.step < total) {
      // Unlock validate when leaving the last non-validate step
      const nextDef = steps[S.step]; // steps[S.step] is the next step (0-indexed = S.step)
      if (nextDef && nextDef.id === 'validate') S._validateUnlocked = true;
      S.step++; S.substep = 1;
    }
  }
  render(); scrollBuilderTop();
}
function prevStep() {
  if ((S.substep||1) > 1) {
    S.substep--;
  } else if (S.step > 1) {
    S.step--;
    const prevDef = _curStepDef();
    S.substep = _ssCount(prevDef);
  }
  render(); scrollBuilderTop();
}
function goToStep(n) {
  const steps = wizardSteps();
  const total = steps.length;
  const targetDef = steps[n - 1];
  if (targetDef && targetDef.id === 'validate' && !S._validateUnlocked) return;
  if (n >= 1 && n <= total && (n <= S.step || S.genre)) {
    S.step = n; S.substep = 1; render(); scrollBuilderTop();
  }
}
function goToSubstep(n) {
  S.substep = n; render(); scrollBuilderTop();
}
function scrollBuilderTop() {
  const el = document.getElementById("builder-col");
  if (el) el.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Map subId → S.open key so each card is expanded when navigated to
const _OPEN_MAP = {
  mood_vibe:'mood', mood_tempo:'tempo', mood_meta:'metamood',
  inst_instruments:'instruments',
  vocals_profile:'vocbuild', vocals_lyrics:'lyrics',
  prod_style:'production', prod_meta:'metaprod', prod_quality:'quality', prod_vocal:'vocal',
  reference:'artistref', excludes:'exclude', style:'custom',
};

function wizardStepContent(stepDef, substep) {
  if (!S.genre && stepDef.id !== "genre") return "";
  const ss = stepDef.substeps;
  const subId = ss ? (ss[Math.max(0,(substep||1)-1)] || ss[0]).id : stepDef.id;
  // Auto-open the card for this sub-step
  const openKey = _OPEN_MAP[subId];
  if (openKey && S.open) S.open[openKey] = true;
  switch (subId) {
    case "genre":          return genrePickerHTML();
    case "mood_vibe":      return moodHTML();
    case "mood_tempo":     return tempoHTML();
    case "mood_meta":      return metaMoodHTML();
    case "instruments":    return instrumentsHTML();
    case "inst_instruments": return instrumentsHTML();
    case "inst_key":         return keyAndChordsHTML();
    case "vocals_profile": return vocalistStepHTML();
    case "vocals_lyrics":  return lyricsOnlyHTML();
    case "prod_style":     return productionHTML();
    case "prod_meta":      return metaProductionHTML();
    case "prod_quality":   return qualityHTML();
    case "prod_vocal":     return metaTagsHTML();
    case "reference":      return artistRefHTML();
    case "excludes":       return excludesHTML();
    case "style":          return customStyleHTML();
    case "validate":       return validateStepHTML();
    default: return "";
  }
}

function wizardHTML() {
  const steps = wizardSteps();
  const total = steps.length;
  const stepIdx = Math.max(0, Math.min((S.step || 1) - 1, total - 1));
  const step = stepIdx + 1;
  const stepDef = steps[stepIdx];
  const substeps = stepDef.substeps || null;
  const ssCount  = substeps ? substeps.length : 1;
  const substep  = Math.max(1, Math.min(S.substep || 1, ssCount));
  const curSub   = substeps ? substeps[substep - 1] : null;

  const isFirst = step === 1 && substep === 1;
  const isLast  = step === total && substep === ssCount;
  const canNext = step === 1 ? !!S.genre : true;
  const sc = stepDef.color;

  // Header text — use substep section key when inside a substep
  const hdrIcon  = curSub ? curSub.icon : stepDef.icon;
  const hdrTitle = curSub
    ? (t("section." + curSub.key + ".title") || curSub.label)
    : (t("section." + stepDef.id + ".title") || t("steps." + stepDef.id));
  const hdrHint = curSub
    ? (t("section." + curSub.key + ".hint") || "")
    : (t("section." + stepDef.id + ".hint") || "");

  // Sub-step tab row
  const sstabs = substeps ? `
    <div class="wiz-sstabs">
      ${substeps.map((ss, i) => {
        const done = i + 1 < substep;
        const act  = i + 1 === substep;
        return (i > 0 ? '<span class="wiz-sstab-sep">›</span>' : '') +
          `<button class="wiz-sstab${act ? ' active' : done ? ' done' : ''}"
              onclick="goToSubstep(${i+1})" style="--sc:${sc}">
            ${done ? '✓' : ss.icon} ${ss.label}
          </button>`;
      }).join("")}
    </div>` : "";

  // Progress rail (parent steps only)
  const rail = steps.map((s, i) => {
    const n = i + 1;
    const done   = n < step;
    const active = n === step;
    const cls    = done ? "done" : active ? "active" : "pending";
    const icon   = done ? "✓" : s.icon;
    const isValidate = s.id === 'validate';
    if (isValidate && !S._validateUnlocked) return "";
    const canGo  = n < step || (n > step && S.genre);
    const subPip = active && s.substeps
      ? `<div class="wiz-pill-subpip">${substep}/${ssCount}</div>` : "";
    return `
      ${i > 0 ? `<div class="wiz-line${done || active ? " lit" : ""}"></div>` : ""}
      <button class="wiz-pill ${cls}" onclick="goToStep(${n})"
        style="--sc:${s.color}" ${!canGo && n !== step ? "disabled" : ""}>
        <div class="wiz-pill-ring">${icon}</div>
        <div class="wiz-pill-lbl">${t("steps." + s.id)}</div>
        ${subPip}
      </button>`;
  }).join("");

  // Footer dots — substep dots when inside multi-substep, else parent dots
  const dots = substeps
    ? substeps.map((_,i) => `<span class="wiz-sdot${i+1===substep?' a':i+1<substep?' d':''}" onclick="goToSubstep(${i+1})"></span>`).join("")
    : steps.map((_,i)    => `<span class="wiz-sdot${i+1===step?' a':i+1<step?' d':''}" onclick="goToStep(${i+1})"></span>`).join("");

  return `
    <div class="wizard-wrap" style="--sc:${sc}">
      <div class="wiz-track">
        <div class="wiz-rail">${rail}</div>
      </div>
      <div class="wiz-hdr">
        <div class="wiz-hdr-icon">${hdrIcon}</div>
        <div class="wiz-hdr-text">
          <div class="wiz-hdr-num">${t("steps." + stepDef.id)} &middot; ${step} ${t("stepOf")} ${total}</div>
          <h2 class="wiz-hdr-title">${hdrTitle}</h2>
          <p class="wiz-hdr-hint">${hdrHint}</p>
          ${sstabs}
        </div>
      </div>
      <div class="wiz-body">
        ${wizardStepContent(stepDef, substep)}
      </div>
      <div class="wiz-footer">
        <button class="wiz-btn wiz-btn-restart" onclick="if(confirm(t('restartBtn')+'?'))clearGenre()" title="Restart">&#8635;</button>
        <button class="wiz-btn wiz-btn-save" onclick="quickSavePreset()" title="Save preset">&#128190;</button>
        ${(S._validateUnlocked && S.genre) ? `<button class="wiz-btn wiz-btn-validate" onclick="showValidate()">&#9989; Validate</button>` : `<div></div>`}
        ${isFirst
          ? `<div></div>`
          : `<button class="wiz-btn wiz-btn-back" onclick="prevStep()">${t("back")}</button>`}
        <div class="wiz-step-dots">${dots}</div>
        ${isLast
          ? `<button class="wiz-btn wiz-btn-next wiz-btn-generate" onclick="copyFinal('style')">📋 ${t("generateBtn")}</button>`
          : `<button class="wiz-btn wiz-btn-next" onclick="nextStep()" ${!canNext?`disabled title="${t("genreRequired")}"`:""} >${t("next")}</button>`}
      </div>
    </div>
  `;
}


// INIT
// =============================================================
const _savedTheme = localStorage.getItem("sunoTheme");
if (_savedTheme && THEMES[_savedTheme]) S.theme = _savedTheme;
const _savedLang = localStorage.getItem("sunoLang");
if (_savedLang && LANG[_savedLang]) S.lang = _savedLang;
const _sub = document.getEleme