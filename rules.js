// ─────────────────────────────────────────────────────────────────────────────
// Rick AI — Validation Rules
// ─────────────────────────────────────────────────────────────────────────────
//
// Each rule is an object with this shape:
//
//   {
//     id:         "unique_snake_case_id",    // must be unique
//     category:   "mood|vocals|production|structure|exclude",
//     severity:   "error|warning|tip",       // affects score: -30 / -15 / -5
//     en: { msg: "...", suggestion: "..." }, // English text shown in UI
//     fr: { msg: "...", suggestion: "..." }, // French text (optional, falls back to en)
//     check(S) { return true/false; }        // return true = rule fires
//   }
//
// The `S` object passed to check() contains the full wizard state:
//   S.genre           string — e.g. "Pop"
//   S.subgenre        string
//   S.customSubgenre  string
//   S.moods           string[]
//   S.customMood      string
//   S.bpm             number | null
//   S.instruments     string[]
//   S.customInstruments string[]
//   S.production      string[]
//   S.customProduction  string[]
//   S.qualityTags     string[]
//   S.vocalTags       string[]
//   S.vocalistProfile { register, delivery[], qualities[], timbre[], gender }
//   S.excludes        string[]
//   S.customExcludes  string[]
//   S.lyricsSections  { structTag, deliveryTags[], text }[]
//   S.songKey         string | null   — e.g. "C major"
//   S.chordProgression string
//
// Tips for writing check():
//   - Always guard array access: (S.moods||[]).length
//   - Use optional chaining for nested: S.vocalistProfile?.register
//   - Set this._detail = "..." to append context to the message (reset auto)
//   - Return false if unsure — it's better to miss than to false-positive
//
// Severity guide:
//   error   — clear technical conflict or missing required field  (-30 pts)
//   warning — likely to reduce quality or cause unexpected output  (-15 pts)
//   tip     — optional improvement, not harmful                    ( -5 pts)
//
// To add a rule: copy any existing rule, change the id, and drop it in the
// appropriate section. The order determines display order in the UI.
// ─────────────────────────────────────────────────────────────────────────────

const VALIDATION_RULES = [

  // ── MOOD CONFLICTS ────────────────────────────────────────────────────────
  {
    id: "mood_contradiction", category: "mood", severity: "warning",
    en: { msg: "Contradictory moods detected",
          suggestion: "Pick one emotional direction for a cleaner, stronger result." },
    fr: { msg: "Ambiances contradictoires détectées",
          suggestion: "Choisissez une direction émotionnelle claire pour un meilleur résultat." },
    check(S) {
      const PAIRS = [
        [["Happy","Joyful","Uplifting","Euphoric","Playful"],
         ["Melancholic","Sad","Dark","Gloomy","Sombre","Mournful"]],
        [["Aggressive","Intense","Angry","Fierce"],
         ["Peaceful","Calm","Serene","Gentle","Tranquil"]],
        [["Energetic","Upbeat","Frantic"],
         ["Lazy","Slow","Dreamy","Ethereal"]],
        [["Romantic","Sensual"],
         ["Angry","Aggressive","Hostile"]],
      ];
      const m = S.moods || [];
      for (const [a, b] of PAIRS) {
        const ha = m.find(x => a.includes(x));
        const hb = m.find(x => b.includes(x));
        if (ha && hb) { this._detail = `"${ha}" + "${hb}"`; return true; }
      }
      return false;
    }
  },

  {
    id: "mood_too_many", category: "mood", severity: "tip",
    en: { msg: "Many moods selected",
          suggestion: "Suno focuses best on 2–3 moods. More can dilute the emotional impact." },
    fr: { msg: "Trop d'ambiances sélectionnées",
          suggestion: "Suno est plus précis avec 2–3 ambiances. En ajouter plus dilue l'impact émotionnel." },
    check(S) { return (S.moods || []).length > 4; }
  },

  // ── VOCALS — REGISTER / DELIVERY CONFLICTS ────────────────────────────────
  {
    id: "heavy_genre_soft_vocal", category: "vocals", severity: "warning",
    en: { msg: "Heavy genre with very soft vocal register",
          suggestion: "Soprano or Alto may feel out of place in Metal. Consider Tenor or Baritone." },
    fr: { msg: "Genre heavy avec registre vocal très doux",
          suggestion: "Soprano ou Alto peut sembler déplacé en Metal. Envisagez Ténor ou Baryton." },
    check(S) {
      const heavyGenres = ["Metal","Heavy Metal","Death Metal","Black Metal","Metalcore","Deathcore","Thrash Metal","Doom Metal"];
      const softRegs    = ["Soprano","Mezzo-Soprano","Alto"];
      const reg = S.vocalistProfile?.register || "";
      return heavyGenres.some(g => (S.genre || "").includes(g)) && softRegs.includes(reg);
    }
  },

  {
    id: "soprano_growl", category: "vocals", severity: "error",
    en: { msg: "Soprano register + Growl/Scream delivery",
          suggestion: "Soprano and Growl/Scream are physiologically opposite. Choose one or the other." },
    fr: { msg: "Registre Soprano + livraison Growl/Scream",
          suggestion: "Soprano et Growl/Scream sont opposés physiologiquement. Choisissez l'un ou l'autre." },
    check(S) {
      const reg  = S.vocalistProfile?.register || "";
      const del  = S.vocalistProfile?.delivery || [];
      const hard = ["[Growling]","[Screamed]"];
      return reg === "Soprano" && del.some(d => hard.includes(d));
    }
  },

  {
    id: "bass_high_quality", category: "vocals", severity: "warning",
    en: { msg: "Bass register with high-pitched quality",
          suggestion: 'A Bass register paired with "High-pitched" sounds contradictory. Pick a consistent range.' },
    fr: { msg: "Registre Basse avec qualité aiguë",
          suggestion: 'Un registre Basse avec "High-pitched" est contradictoire. Choisissez une plage cohérente.' },
    check(S) {
      const reg = S.vocalistProfile?.register || "";
      const q   = S.vocalistProfile?.qualities || [];
      return reg === "Bass" && q.some(x => x.toLowerCase().includes("high"));
    }
  },

  {
    id: "classical_rap", category: "vocals", severity: "warning",
    en: { msg: "Classical/Opera genre with Rap delivery",
          suggestion: "Rap flow in a classical context is unusual. This may produce unexpected results." },
    fr: { msg: "Genre Classique/Opéra avec livraison Rap",
          suggestion: "Le Rap dans un contexte classique est inhabituel. Cela peut produire des résultats inattendus." },
    check(S) {
      const g       = (S.genre || "").toLowerCase();
      const del     = S.vocalistProfile?.delivery || [];
      const rapTags = ["[Rapped]","[Fast Rap]","[Slow Flow]","[Melodic Rap]","[Trap Flow]","[Double Time]"];
      return (g.includes("classical") || g.includes("opera")) && del.some(d => rapTags.includes(d));
    }
  },

  {
    id: "too_many_delivery_tags", category: "vocals", severity: "tip",
    en: { msg: "Many vocal delivery tags selected",
          suggestion: "5+ delivery tags can pull Suno in too many directions. Keep 2–3 that define the core style." },
    fr: { msg: "Trop de tags de livraison vocale",
          suggestion: "5+ tags de livraison peuvent éparpiller Suno. Gardez 2–3 qui définissent le style central." },
    check(S) { return (S.vocalistProfile?.delivery || []).length >= 5; }
  },

  // ── PRODUCTION CONFLICTS ──────────────────────────────────────────────────
  {
    id: "lofi_hifi", category: "production", severity: "warning",
    en: { msg: 'Lo-fi aesthetic + Hi-fi production tags',
          suggestion: 'Lo-fi and "Crystal Clear" / "High Fidelity" work against each other.' },
    fr: { msg: "Esthétique Lo-fi + tags de production Hi-fi",
          suggestion: '"Lo-fi" et "Crystal Clear" / "High Fidelity" s\'opposent.' },
    check(S) {
      const p       = (S.production || []).map(x => x.toLowerCase());
      const hasLofi = p.some(x => x.includes("lo-fi") || x.includes("lofi"));
      const hasHifi = p.some(x => x.includes("crystal clear") || x.includes("high fidelity") || x.includes("hi-fi"));
      return hasLofi && hasHifi;
    }
  },

  {
    id: "acoustic_heavy_synth", category: "production", severity: "tip",
    en: { msg: "Acoustic instruments + Heavy electronic production",
          suggestion: "Blending acoustic instruments with heavy synth/electronic production can muddy the sound." },
    fr: { msg: "Instruments acoustiques + production électronique lourde",
          suggestion: "Mélanger des instruments acoustiques avec une production électronique lourde peut brouiller le son." },
    check(S) {
      const inst     = (S.instruments || []).map(x => x.toLowerCase());
      const prod     = (S.production  || []).map(x => x.toLowerCase());
      const acoustic = inst.some(x => x.includes("acoustic") || x.includes("guitar") || x.includes("piano") || x.includes("violin"));
      const heavy    = prod.some(x => x.includes("electronic") || x.includes("heavy synth") || x.includes("edm") || x.includes("dubstep"));
      return acoustic && heavy;
    }
  },

  // ── EXCLUDE OVERLAPS ──────────────────────────────────────────────────────
  {
    id: "exclude_overlap", category: "exclude", severity: "error",
    en: { msg: "Conflict: excluded item also in selected tags",
          suggestion: "Remove it from Excludes or de-select it — having both cancels them out." },
    fr: { msg: "Conflit : un élément exclu est aussi sélectionné",
          suggestion: "Retirez-le des Exclusions ou désélectionnez-le — avoir les deux s'annule." },
    check(S) {
      const excl = [...(S.excludes || []), ...(S.customExcludes || []).filter(Boolean)];
      const all  = [
        ...(S.instruments      || []), ...(S.customInstruments || []).filter(Boolean),
        ...(S.production       || []), ...(S.customProduction  || []).filter(Boolean),
        ...(S.qualityTags      || []), ...(S.vocalTags         || []),
      ];
      for (const e of excl) {
        for (const a of all) {
          if (excludeMatches(e, a)) {
            this._detail = `"${e}" conflicts with "${a}"`;
            return true;
          }
        }
      }
      return false;
    }
  },

  // ── STRUCTURE — REQUIRED FIELDS ───────────────────────────────────────────
  {
    id: "no_genre", category: "structure", severity: "error",
    en: { msg: "No genre selected — this is required",
          suggestion: "A genre is the foundation of every Suno prompt. Go back to Step 1 and choose one." },
    fr: { msg: "Aucun genre sélectionné — requis",
          suggestion: "Le genre est la base de tout prompt Suno. Revenez à l'Étape 1 pour en choisir un." },
    check(S) { return !S.genre; }
  },

  {
    id: "no_mood", category: "structure", severity: "warning",
    en: { msg: "No mood / emotion selected",
          suggestion: "Moods tell Suno the emotional feel of the track. Pick at least one in the Mood step." },
    fr: { msg: "Aucune ambiance / émotion sélectionnée",
          suggestion: "Les ambiances indiquent l'émotion du morceau. Choisissez-en au moins une à l'étape Mood." },
    check(S) { return S.genre && !(S.moods || []).length; }
  },

  {
    id: "no_production", category: "structure", severity: "tip",
    en: { msg: "No production style selected",
          suggestion: "Tags like 'Warm', 'Raw', 'Polished' help Suno shape the mix. Add one in the Production step." },
    fr: { msg: "Aucun style de production sélectionné",
          suggestion: "Des tags comme 'Warm', 'Raw', 'Polished' guident le mix. Ajoutez-en un à l'étape Production." },
    check(S) {
      return S.genre
        && !(S.production || []).length
        && !(S.customProduction || []).filter(Boolean).length;
    }
  },

  {
    id: "no_bpm", category: "structure", severity: "tip",
    en: { msg: "No BPM set",
          suggestion: "Setting a BPM locks the tempo. Without it, Suno chooses freely — great for some styles, risky for others." },
    fr: { msg: "Aucun BPM défini",
          suggestion: "Un BPM fixe le tempo. Sans lui, Suno choisit librement — idéal parfois, risqué pour d'autres styles." },
    check(S) { return S.genre && !S.bpm; }
  },

  // ── STRUCTURE — PROMPT DENSITY ────────────────────────────────────────────
  {
    id: "prompt_too_bare", category: "structure", severity: "warning",
    en: { msg: "Prompt is very sparse — Suno has little to work with",
          suggestion: "Add moods, instruments, and production tags to give Suno more direction." },
    fr: { msg: "Prompt très court — Suno n'a pas assez d'informations",
          suggestion: "Ajoutez des ambiances, instruments et tags de production pour guider davantage Suno." },
    check(S) {
      const parts = [
        S.genre, S.subgenre || S.customSubgenre,
        ...(S.moods       || []),
        ...(S.instruments || []),
        ...(S.production  || []),
        ...(S.qualityTags || []),
        ...(S.vocalTags   || []),
      ].filter(Boolean);
      return parts.length < 3;
    }
  },

  {
    id: "style_too_long", category: "structure", severity: "warning",
    en: { msg: "Style prompt is very long — may overwhelm Suno",
          suggestion: "Suno v5 works best under ~150 characters. Trim to the most essential descriptors." },
    fr: { msg: "Prompt de style trop long — peut surcharger Suno",
          suggestion: "Suno v5 est optimal sous ~150 caractères. Réduisez aux descripteurs essentiels." },
    check(S) {
      const parts = [
        S.genre, S.subgenre || S.customSubgenre,
        ...(S.moods || []), ...(S.instruments || []), ...(S.production || []),
      ].filter(Boolean);
      return parts.join(", ").length > 150;
    }
  },

  // ── INSTRUMENTS ───────────────────────────────────────────────────────────
  {
    id: "too_many_instruments", category: "structure", severity: "warning",
    en: { msg: "Many instruments selected",
          suggestion: "More than 7 instruments can dilute each other. Pick the 3–5 most essential for your sound." },
    fr: { msg: "Trop d'instruments sélectionnés",
          suggestion: "Plus de 7 instruments peuvent se diluer mutuellement. Choisissez les 3–5 essentiels." },
    check(S) {
      const total = (S.instruments || []).length + (S.customInstruments || []).filter(Boolean).length;
      return total > 7;
    }
  },

  // ── TEMPO / GENRE MISMATCH ────────────────────────────────────────────────
  {
    id: "bpm_too_fast_for_genre", category: "structure", severity: "warning",
    en: { msg: "BPM seems very high for this genre",
          suggestion: "Classical, Jazz Ballad, Acoustic, and Ambient genres rarely exceed 120 BPM." },
    fr: { msg: "BPM très élevé pour ce genre",
          suggestion: "Les genres Classique, Jazz Ballad, Acoustique et Ambient dépassent rarement 120 BPM." },
    check(S) {
      const slowGenres = ["classical","jazz ballad","acoustic","ambient","folk","blues ballad","soul ballad","bossa nova","slow"];
      const g = (S.genre || "").toLowerCase();
      return S.bpm && S.bpm > 140 && slowGenres.some(x => g.includes(x));
    }
  },

  {
    id: "bpm_too_slow_for_genre", category: "structure", severity: "warning",
    en: { msg: "BPM seems very low for this genre",
          suggestion: "EDM, Metal, and Drum & Bass typically run 128–180 BPM. Low BPM may confuse Suno." },
    fr: { msg: "BPM très bas pour ce genre",
          suggestion: "EDM, Metal et Drum & Bass tournent généralement à 128–180 BPM. Un BPM bas peut confondre Suno." },
    check(S) {
      const fastGenres = ["edm","drum and bass","dnb","drum & bass","metal","hardcore","house","techno","trance","dubstep"];
      const g = (S.genre || "").toLowerCase();
      return S.bpm && S.bpm < 100 && fastGenres.some(x => g.includes(x));
    }
  },

];
// ─────────────────────────────────────────────────────────────────────────────
// END OF RULES — add new rules above this line
// ─────────────────────────────────────────────────────────────────────────────
