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
  weirdness: 50,
  styleInfluence: 50,
  customStyleText: "",
  lyricsSections: [],
  useGuidedLyrics: true,
  freeLyrics: "",
  open: { subgenre:true, mood:true, tempo:true, instruments:true, production:true, quality:true, vocal:true, metaprod:false, metamood:false, artistref:false, exclude:true, moreopts:true, vocbuild:false, custom:false, lyrics:true },
  theme: "light",
  vocalistProfile: null,
  step: 1,
  lang: "en"
};

let dragIdx = null;

// ═══════════════════════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════════════════════
const THEMES = {
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
          <div class="layer-badge">L1</div>
          <div class="layer-title">${t("genreAnchorTitle")}</div>
          <div class="check-badge">✓</div>
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

  // ── UNSELECTED STATE: full genre grid ──
  const favIds = getFavs();
  const groups = {};
  KB.genres.forEach(g => { (groups[g.group] = groups[g.group] || []).push(g); });
  const sortedGroups = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([grp, gs]) => [grp, gs.slice().sort((a, b) => a.name.localeCompare(b.name))]);

  const mkCard = (g) => {
    const isFav = favIds.includes(g.id);
    const starLabel = isFav ? "Remove from favorites" : "Add to favorites";
    const starChar = isFav ? "★" : "☆";
    return `<div class="genre-card-wrap">
      <button class="genre-card" onclick="selectGenre('${g.id}')" title="${esc(kbDesc(g.id))}">
        <div class="genre-icon">${g.icon}</div>
        <div class="genre-name">${esc(g.name)}</div>
      </button>
      <button class="fav-btn${isFav ? " active" : ""}" onclick="toggleFav('${g.id}',event)" title="${starLabel}" aria-label="${starLabel}">${starChar}</button>
    </div>`;
  };

  const favGenres = favIds.map(id => KB.genres.find(g => g.id === id)).filter(Boolean).sort((a,b) => a.name.localeCompare(b.name));
  const favSection = `
    <div class="genre-group">
      <div class="fav-group-label">★ Favorites</div>
      ${favGenres.length
        ? `<div class="genre-grid">${favGenres.map(mkCard).join("")}</div>`
        : `<div class="fav-empty">Tap ☆ on any genre to save it here</div>`}
    </div>`;

  return `
    <div class="card">
      <div class="layer-hdr" style="--layer-color:var(--l1)">
        <div class="layer-badge">L1</div>
        <div class="layer-title">Genre Anchor</div>
        <div class="layer-hint">Most important — v5 loads the production framework from this</div>
      </div>
      <div class="card-inner">
        ${favSection}
        ${sortedGroups.map(([grp, gs]) => `
          <div class="genre-group">
            <div class="genre-group-label">${esc(grp)}</div>
            <div class="genre-grid">${gs.map(mkCard).join("")}</div>
          </div>
        `).join("")}
      </div>
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

// ── SUNO MORE OPTIONS ─────────────────────────────────────────
function moreOptsHTML() {
  const exl = [...S.excludes, ...S.customExcludes.filter(Boolean)];
  const exlBox = exl.length
    ? exl.map(e=>`<span class="excl-chip">✕ ${esc(e)}</span>`).join("")
    : `<span class="excl-box-empty">None selected — choose excludes above</span>`;
  const smMO = `W:${S.weirdness}% · SI:${S.styleInfluence}%${S.vocalGender?" · "+S.vocalGender:""}`;
  const body = `
    <div class="card-inner" style="padding-bottom:8px">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">These mirror Suno's <strong style="color:var(--text-dim)">More Options</strong> panel — set them in Suno to match.</div>
    </div>
    <div class="excl-box-label" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);padding:0 16px 4px">Excluded Styles</div>
    <div class="excl-box">${exlBox}</div>
    <div class="more-opts-grid">
      <div class="more-opt-row">
        <span class="more-opt-label">Vocal Gender</span>
        <div class="gender-toggle">
          <button class="gender-btn${S.vocalGender==="Male"?" active-male":""}" onclick="S.vocalGender=S.vocalGender==='Male'?null:'Male';render()">Male</button>
          <button class="gender-btn${S.vocalGender==="Female"?" active-female":""}" onclick="S.vocalGender=S.vocalGender==='Female'?null:'Female';render()">Female</button>
        </div>
      </div>
      <div class="more-opt-row">
        <span class="more-opt-label">Weirdness</span>
        <div class="opts-slider-wrap">
          <input type="range" class="opts-slider" min="0" max="100" step="5" value="${S.weirdness}"
            oninput="S.weirdness=+this.value;this.nextElementSibling.textContent=this.value+'%';patchPreviews()">
          <span class="opts-pct">${S.weirdness}%</span>
        </div>
      </div>
      <div class="more-opt-row">
        <span class="more-opt-label">Style Influence</span>
        <div class="opts-slider-wrap">
          <input type="range" class="opts-slider" min="0" max="100" step="5" value="${S.styleInfluence}"
            oninput="S.styleInfluence=+this.value;this.nextElementSibling.textContent=this.value+'%';patchPreviews()">
          <span class="opts-pct">${S.styleInfluence}%</span>
        </div>
      </div>
    </div>`;
  return sectionCard("moreopts","⚙️","background:var(--text-muted)","Suno More Options","Set these in Suno's More Options panel","var(--text-muted)",smMO,body);
}

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
        <div class="mo-field">
          <div class="mo-field-label">Weirdness</div>
          <div class="mo-field-val">${S.weirdness}%</div>
        </div>
        <div class="mo-field">
          <div class="mo-field-label">Style Influence</div>
          <div class="mo-field-val">${S.styleInfluence}%</div>
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
  S.moods = []; S.bpm = null; S.instruments = []; S.production = [];
  S.qualityTags = []; S.vocalTags = [];
  S.metaProductionTags = []; S.metaMoodTags = []; S.artistRef = "";
  S.vocalGender = null; S.weirdness = 50; S.styleInfluence = 50;
  S.step = 1;
  render();
}

// ── FAVORITES ──────────────────────────────────────────────────
function getFavs() {
  try { return JSON.parse(localStorage.getItem("sunoFavGenres") || "[]"); } catch { return []; }
}
function saveFavs(arr) { localStorage.setItem("sunoFavGenres", JSON.stringify(arr)); }
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
          weirdness: saved.weirdness ?? 50,
          styleInfluence: saved.styleInfluence ?? 50
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
    vocalGender: null, weirdness: 50, styleInfluence: 50,
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

function nextStep() {
  const total = wizardTotalSteps();
  if (S.step < total) { S.step++; render(); scrollBuilderTop(); }
}
function prevStep() {
  if (S.step > 1) { S.step--; render(); scrollBuilderTop(); }
}
function goToStep(n) {
  const total = wizardTotalSteps();
  if (n >= 1 && n <= total && (n <= S.step || S.genre)) {
    S.step = n; render(); scrollBuilderTop();
  }
}
function scrollBuilderTop() {
  const el = document.getElementById("builder-col");
  if (el) el.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function wizardStepContent(stepDef) {
  if (!S.genre && stepDef.id !== "genre") return "";
  switch (stepDef.id) {
    case "genre":       return genrePickerHTML();
    case "mood":        return moodHTML() + tempoHTML();
    case "instruments": return instrumentsHTML();
    case "tags":        return metaTagsHTML() + metaMoodHTML() + artistRefHTML() + excludesHTML() + moreOptsHTML() + customStyleHTML();
    case "vocals":      return lyricsBuilderHTML();
    case "production":  return productionHTML() + metaProductionHTML() + qualityHTML();
    default: return "";
  }
}

function wizardHTML() {
  const steps = wizardSteps();
  const total = steps.length;
  const stepIdx = Math.max(0, Math.min((S.step || 1) - 1, total - 1));
  const step = stepIdx + 1;
  const stepDef = steps[stepIdx];
  const isFirst = step === 1;
  const isLast  = step === total;
  const canNext = step === 1 ? !!S.genre : true;
  const sc = stepDef.color;

  // ── Progress rail ──
  const rail = steps.map((s, i) => {
    const n = i + 1;
    const done   = n < step;
    const active = n === step;
    const cls    = done ? "done" : active ? "active" : "pending";
    const icon   = done ? "✓" : s.icon;
    const canGo  = n < step || (n > step && S.genre);
    return `
      ${i > 0 ? `<div class="wiz-line${done || active ? " lit" : ""}"></div>` : ""}
      <button class="wiz-pill ${cls}" onclick="goToStep(${n})"
        style="--sc:${s.color}" ${!canGo && n !== step ? "disabled" : ""}>
        <div class="wiz-pill-ring">${icon}</div>
        <div class="wiz-pill-lbl">${t("steps." + s.id)}</div>
      </button>`;
  }).join("");

  return `
    <div class="wizard-wrap" style="--sc:${sc}">
      <div class="wiz-track">
        <div class="wiz-rail">${rail}</div>
      </div>
      <div class="wiz-hdr">
        <div class="wiz-hdr-icon">${stepDef.icon}</div>
        <div class="wiz-hdr-text">
          <div class="wiz-hdr-num">${t("steps." + stepDef.id)} &middot; ${step} ${t("stepOf")} ${total}</div>
          <h2 class="wiz-hdr-title">${t("section." + stepDef.id + ".title") || t("steps." + stepDef.id)}</h2>
          <p class="wiz-hdr-hint">${t("section." + stepDef.id + ".hint") || ""}</p>
        </div>
      </div>
      <div class="wiz-body">
        ${wizardStepContent(stepDef)}
      </div>
      <div class="wiz-footer">
        <button class="wiz-btn wiz-btn-restart" onclick="if(confirm(t('restartBtn')+'?'))clearGenre()" title="Restart">&#8635;</button>
        <button class="wiz-btn wiz-btn-save" onclick="quickSavePreset()" title="Save preset">&#128190;</button>
        <button class="wiz-btn wiz-btn-validate" onclick="showValidate()" title="Validate prompt">&#9989;</button>
        ${isFirst
          ? `<div></div>`
          : `<button class="wiz-btn wiz-btn-back" onclick="prevStep()">${t("back")}</button>`}
        <div class="wiz-step-dots">
          ${steps.map((_,i) => `<span class="wiz-sdot${i+1===step?" a":i+1<step?" d":""}"></span>`).join("")}
        </div>
        ${isLast
          ? `<button class="wiz-btn wiz-btn-next" onclick="nextStep()">${t("finish")}</button>`
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
const _sub = document.getElementById("app-subtitle");
if (_sub) _sub.textContent = t("subtitle");
applyTheme(S.theme);
render();

// version label
const _vl=document.getElementById('app-version-lbl');if(_vl)_vl.textContent='v'+APP_VERSION;
if (!localStorage.getItem('rickai_intro_seen')) showIntro();
