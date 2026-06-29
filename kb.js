// ═══════════════════════════════════════════════════════════════
// SUNO v5 KNOWLEDGE BASE  –  kb.js
// Edit this file to add/modify genres, tags, and artist references
// ═══════════════════════════════════════════════════════════════
const KB = {

  // ─── GENRES ─────────────────────────────────────────────────
  genres: [
    {
      id:"melodic-dubstep", name:"Melodic Dubstep", icon:"🎛️", group:"Electronic",
      subgenres:["Future Bass Dubstep","Emotional Dubstep","Cinematic Dubstep","Hybrid Trap","Brostep"],
      moods:[
        { primary:"Melancholic", mods:["Introspective","Nostalgic","Longing","Wistful"] },
        { primary:"Euphoric",    mods:["Uplifting","Triumphant","Soaring","Anthemic"] },
        { primary:"Dark",        mods:["Brooding","Intense","Haunting","Sinister"] },
        { primary:"Energetic",   mods:["Driving","Powerful","Relentless","Aggressive"] }
      ],
      tempoRange:[130,150], defaultBPM:140,
      instruments:["plucked synth lead","deep sub bass","wobble bass","glitchy percussion","atmospheric supersaws","melodic piano","string pads","reverbed guitar","arpeggiator synth"],
      production:["stadium reverb","heavy sidechain compression","lush reverb tail","mid-side processing","heavy limiting","glitchy build-ups","epic drops","white noise sweeps"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[No Vocals]",
      desc:"Emotional electronic with melodic elements and heavy dubstep drops"
    },
    {
      id:"future-bass", name:"Future Bass", icon:"🌈", group:"Electronic",
      subgenres:["Colorful Future Bass","Chill Future Bass","Hybrid Trap","Kawaii Future Bass","Melodic Future Bass"],
      moods:[
        { primary:"Euphoric",    mods:["Uplifting","Joyful","Soaring","Radiant"] },
        { primary:"Nostalgic",   mods:["Dreamy","Wistful","Bittersweet","Warm"] },
        { primary:"Playful",     mods:["Energetic","Bright","Fun","Bubbly"] },
        { primary:"Melancholic", mods:["Emotional","Tender","Longing","Soft"] }
      ],
      tempoRange:[140,160], defaultBPM:150,
      instruments:["supersaws","pitched vocal chops","808 bass","bright lead synth","pluck synth","trap hi-hats","atmospheric pads","bell tones"],
      production:["massive reverb","sidechain pumping","layered pads","vocal chop glitch","bright EQ","punchy drops","shimmery highs"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:null,
      desc:"Colorful high-energy electronic with pitched vocals and heavy drops"
    },
    {
      id:"house", name:"House", icon:"🏠", group:"Electronic",
      subgenres:["Deep House","Tech House","Progressive House","Tropical House","Garage House","Afro House"],
      moods:[
        { primary:"Groovy",    mods:["Warm","Infectious","Hypnotic","Rolling"] },
        { primary:"Euphoric",  mods:["Uplifting","Dancefloor","Peak-Time","Anthemic"] },
        { primary:"Sensual",   mods:["Smooth","Late-Night","Sultry","Deep"] },
        { primary:"Energetic", mods:["Driving","Relentless","Pumping","Intense"] }
      ],
      tempoRange:[120,132], defaultBPM:124,
      instruments:["four-on-the-floor kick","hi-hat groove","bass synth","organ chords","piano riff","filtered strings","clap","sub bass"],
      production:["warm reverb","analog warmth","punchy compression","rolling bassline","sidechain pumping","filtered breakdown","warm low-end"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:null,
      desc:"Four-on-the-floor groove-driven electronic dance music"
    },
    {
      id:"lofi", name:"Lo-Fi Hip Hop", icon:"☕", group:"Electronic",
      subgenres:["Chill Lo-Fi","Rainy Day Lo-Fi","Study Lo-Fi","Jazz Lo-Fi","Bedroom Lo-Fi"],
      moods:[
        { primary:"Nostalgic",     mods:["Melancholic","Wistful","Hazy","Bittersweet"] },
        { primary:"Cozy",          mods:["Calm","Peaceful","Warm","Intimate"] },
        { primary:"Contemplative", mods:["Reflective","Introspective","Meditative","Quiet"] },
        { primary:"Dreamy",        mods:["Sleepy","Hazy","Floating","Mellow"] }
      ],
      tempoRange:[70,90], defaultBPM:80,
      instruments:["dusty sample chops","vinyl crackle","jazzy piano","soft boom bap drums","upright bass","muted guitar","ambient texture","rain ambience"],
      production:["tape saturation","vinyl noise","gentle compression","warm low-pass filter","soft reverb","analog warmth","dusty mix"],
      qualityDefault:["[Studio Quality]"], vocalDefault:"[No Vocals]",
      desc:"Relaxed hazy hip hop with vintage sampling aesthetics"
    },
    {
      id:"dnb", name:"Drum & Bass", icon:"🥁", group:"Electronic",
      subgenres:["Liquid DnB","Neurofunk","Jungle DnB","Minimal DnB","Ragga Jungle","Dark DnB"],
      moods:[
        { primary:"Energetic", mods:["Intense","Fast","Relentless","Driving"] },
        { primary:"Dark",      mods:["Atmospheric","Heavy","Industrial","Gritty"] },
        { primary:"Euphoric",  mods:["Uplifting","Liquid","Rolling","Flowing"] },
        { primary:"Tense",     mods:["Suspenseful","Frenetic","Urgent","Anxious"] }
      ],
      tempoRange:[170,180], defaultBPM:174,
      instruments:["amen break","reese bass","atmospheric pads","rolling bassline","sampled horns","snare roll","sub bass","chopped breakbeat"],
      production:["heavy compression","sidechain pumping","wide stereo field","glitchy effects","sub-heavy mix","neuro distortion","rolling groove"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[No Vocals]",
      desc:"High-speed breakbeat electronic with deep rolling basslines"
    },
    {
      id:"techno", name:"Techno", icon:"⚙️", group:"Electronic",
      subgenres:["Minimal Techno","Industrial Techno","Melodic Techno","Dark Techno","Acid Techno","Peak-Time Techno"],
      moods:[
        { primary:"Dark",     mods:["Hypnotic","Industrial","Cold","Mechanical"] },
        { primary:"Driving",  mods:["Relentless","Trance-inducing","Grinding","Pounding"] },
        { primary:"Minimal",  mods:["Sparse","Raw","Stripped","Focused"] },
        { primary:"Euphoric", mods:["Melodic","Emotional","Soaring","Late-Night"] }
      ],
      tempoRange:[130,145], defaultBPM:138,
      instruments:["four-on-the-floor kick","modular synths","acid bass","hi-hat pattern","industrial noise","textural pads","percussive clicks","vocal stabs"],
      production:["heavy compression","dry mix","room reverb","industrial fx","acid 303 filter","minimal arrangement","hypnotic groove"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:"[No Vocals]",
      desc:"Machine-driven hypnotic electronic with industrial aesthetics"
    },
    {
      id:"ambient", name:"Ambient", icon:"🌌", group:"Electronic",
      subgenres:["Dark Ambient","Space Ambient","Nature Ambient","Drone Ambient","New Age Ambient","Cinematic Ambient"],
      moods:[
        { primary:"Ethereal",   mods:["Dreamy","Floating","Otherworldly","Transcendent"] },
        { primary:"Peaceful",   mods:["Meditative","Serene","Calming","Still"] },
        { primary:"Dark",       mods:["Mysterious","Haunting","Foreboding","Deep"] },
        { primary:"Melancholic",mods:["Introspective","Nostalgic","Wistful","Longing"] }
      ],
      tempoRange:[60,80], defaultBPM:70,
      instruments:["synthesizer pads","field recordings","drone bass","reverbed guitar","bell tones","choir vocals","sparse piano","nature sounds"],
      production:["massive reverb","long decay","gentle fade","granular processing","slow attack","wide stereo field","ethereal textures"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[No Vocals]",
      desc:"Atmospheric textural soundscapes without traditional song structure"
    },
    {
      id:"hip-hop", name:"Hip Hop", icon:"🎤", group:"Hip Hop",
      subgenres:["Conscious Hip Hop","Hardcore Hip Hop","West Coast","East Coast","Southern Hip Hop","Alternative Hip Hop"],
      moods:[
        { primary:"Confident",  mods:["Aggressive","Assertive","Bold","Dominant"] },
        { primary:"Nostalgic",  mods:["Reflective","Retrospective","Sentimental","Real"] },
        { primary:"Dark",       mods:["Gritty","Raw","Authentic","Street"] },
        { primary:"Boastful",   mods:["Triumphant","Celebratory","Energetic","Hype"] }
      ],
      tempoRange:[80,105], defaultBPM:93,
      instruments:["punchy kick","crispy snare","sampled brass","808 bass","vintage piano","hi-hat pattern","orchestral strings","vocal samples"],
      production:["punchy compression","vinyl warmth","wide stereo","boom bap drums","soulful samples","heavy 808","crisp high-end"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:"[Male Vocal]",
      desc:"Rhythmic vocal-driven music with boom bap or modern production"
    },
    {
      id:"trap", name:"Trap", icon:"🔊", group:"Hip Hop",
      subgenres:["Dark Trap","Melodic Trap","Atlanta Trap","Cloud Trap","Plugg","SoundCloud Trap"],
      moods:[
        { primary:"Dark",       mods:["Menacing","Cold","Threatening","Sinister"] },
        { primary:"Confident",  mods:["Aggressive","Assertive","Dominant","Hard"] },
        { primary:"Melancholic",mods:["Lonely","Introspective","Emotional","Brooding"] },
        { primary:"Hype",       mods:["Energetic","Explosive","Anthemic","Party"] }
      ],
      tempoRange:[130,145], defaultBPM:140,
      instruments:["Roland 808","trap hi-hat rolls","trap snare","atmospheric pads","piano melody","orchestral strings","dark synths","ad-lib vocals"],
      production:["heavy 808 compression","spatial reverb","hard limiting","hi-hat swing","trap triplets","dark atmospheric mix","punchy low end"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:null,
      desc:"Modern hip hop with heavy 808s, hi-hat rolls and atmospheric production"
    },
    {
      id:"boom-bap", name:"Boom Bap", icon:"🎵", group:"Hip Hop",
      subgenres:["Golden Era Boom Bap","Jazz Boom Bap","Cinematic Boom Bap","Underground Boom Bap"],
      moods:[
        { primary:"Nostalgic", mods:["Reflective","Golden-Era","Classic","Soulful"] },
        { primary:"Confident", mods:["Cool","Smooth","Authentic","Real"] },
        { primary:"Raw",       mods:["Gritty","Street","Underground","Hard"] },
        { primary:"Smooth",    mods:["Jazzy","Laid-Back","Groovy","Effortless"] }
      ],
      tempoRange:[85,100], defaultBPM:92,
      instruments:["sampled jazz breaks","chunky kick","snappy snare","sampled horns","bass guitar","vinyl scratches","jazzy piano","soul vocal samples"],
      production:["vinyl warmth","punchy compression","subtle reverb","sample chops","natural drum sound","warm low-end","classic mixdown"],
      qualityDefault:["[Studio Quality]"], vocalDefault:"[Male Vocal]",
      desc:"Classic hip hop with jazz-inflected samples and hard-hitting drums"
    },
    {
      id:"rnb", name:"R&B", icon:"🎶", group:"R&B / Soul",
      subgenres:["Contemporary R&B","Alternative R&B","Quiet Storm","PBR&B","UK R&B","Bedroom R&B"],
      moods:[
        { primary:"Sensual",   mods:["Smooth","Intimate","Sultry","Late-Night"] },
        { primary:"Emotional", mods:["Vulnerable","Heartfelt","Raw","Deep"] },
        { primary:"Confident", mods:["Empowered","Assured","Bold","Flirtatious"] },
        { primary:"Romantic",  mods:["Tender","Sweet","Passionate","Warm"] }
      ],
      tempoRange:[75,95], defaultBPM:85,
      instruments:["electric guitar","bass guitar","Rhodes piano","soft drums","strings","brass section","synth pads","finger snaps"],
      production:["warm reverb","smooth compression","lush mixing","analog warmth","layered harmonies","intimate acoustics","silky high-end"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[Female Vocal]",
      desc:"Soul-influenced pop with smooth production and emotional vocals"
    },
    {
      id:"neo-soul", name:"Neo-Soul", icon:"🎷", group:"R&B / Soul",
      subgenres:["Organic Neo-Soul","Electronic Neo-Soul","Jazz-Infused Neo-Soul","Afro Neo-Soul"],
      moods:[
        { primary:"Soulful",    mods:["Warm","Spiritual","Authentic","Deep"] },
        { primary:"Melancholic",mods:["Nostalgic","Bittersweet","Reflective","Tender"] },
        { primary:"Euphoric",   mods:["Uplifting","Joyful","Celebratory","Groove"] },
        { primary:"Intimate",   mods:["Personal","Confessional","Honest","Raw"] }
      ],
      tempoRange:[70,90], defaultBPM:80,
      instruments:["Rhodes piano","Wurlitzer","slap bass","live drums with brushes","brass horns","strings","acoustic guitar","B3 organ"],
      production:["analog warmth","room reverb","subtle compression","vinyl character","live band feel","organic textures","warm low-end"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[Female Vocal]",
      desc:"Modern soul with jazz influences and organic live instrumentation"
    },
    {
      id:"pop", name:"Pop", icon:"⭐", group:"Pop",
      subgenres:["Synth-Pop","Electropop","Indie Pop","Dark Pop","Hyperpop","Power Pop","Bedroom Pop"],
      moods:[
        { primary:"Uplifting",  mods:["Cheerful","Optimistic","Bright","Happy"] },
        { primary:"Nostalgic",  mods:["Bittersweet","Wistful","Reflective","Warm"] },
        { primary:"Energetic",  mods:["Fun","Danceable","Infectious","Exciting"] },
        { primary:"Melancholic",mods:["Emotional","Sad","Longing","Heartbroken"] }
      ],
      tempoRange:[100,130], defaultBPM:116,
      instruments:["synthesizer","electric bass","drum machine","electric guitar","piano","layered harmonies","synth arpeggios","clap track"],
      production:["polished mixing","bright EQ","punchy compression","wide stereo","radio-ready master","layered production","catchy hooks"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:null,
      desc:"Mainstream accessible music with catchy melodies and polished production"
    },
    {
      id:"indie-rock", name:"Indie Rock", icon:"🎸", group:"Rock",
      subgenres:["Dream Pop","Shoegaze","Lo-Fi Indie","Folk Rock","Post-Punk Revival","Math Rock"],
      moods:[
        { primary:"Nostalgic",     mods:["Melancholic","Wistful","Bittersweet","Longing"] },
        { primary:"Energetic",     mods:["Raw","Driving","Infectious","Spirited"] },
        { primary:"Dreamy",        mods:["Atmospheric","Hazy","Floating","Ethereal"] },
        { primary:"Introspective", mods:["Thoughtful","Earnest","Personal","Vulnerable"] }
      ],
      tempoRange:[100,145], defaultBPM:120,
      instruments:["jangly electric guitar","bass guitar","live drums","rhythm guitar","piano","organ","vocal harmonies","shimmering guitar leads"],
      production:["room reverb","analog saturation","natural compression","live recording feel","guitar layers","punchy drums","warm mix"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:null,
      desc:"Guitar-driven rock with artistic independence and emotional depth"
    },
    {
      id:"metal", name:"Metal", icon:"🤘", group:"Rock",
      subgenres:["Heavy Metal","Death Metal","Black Metal","Doom Metal","Progressive Metal","Power Metal","Djent","Melodic Death Metal"],
      moods:[
        { primary:"Aggressive",  mods:["Intense","Fierce","Brutal","Relentless"] },
        { primary:"Dark",        mods:["Epic","Ominous","Crushing","Devastating"] },
        { primary:"Triumphant",  mods:["Powerful","Majestic","Epic","Victorious"] },
        { primary:"Melancholic", mods:["Atmospheric","Doom","Haunting","Desolate"] }
      ],
      tempoRange:[120,200], defaultBPM:160,
      instruments:["distorted guitar","bass guitar","double kick drums","palm-muted riffs","lead guitar","rhythm guitar wall","blast beats","clean guitar (sparse)"],
      production:["heavy compression","tight low-end","wide guitar mix","powerful drums","heavy saturation","precise mix","guitar doubling"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:null,
      desc:"Heavy aggressive guitar-driven music with complex arrangements"
    },
    {
      id:"jazz", name:"Jazz", icon:"🎺", group:"Jazz",
      subgenres:["Smooth Jazz","Bebop","Jazz Fusion","Cool Jazz","Swing Jazz","Modal Jazz","Free Jazz","Nu Jazz"],
      moods:[
        { primary:"Melancholic",   mods:["Nocturnal","Bittersweet","Longing","Blue"] },
        { primary:"Playful",       mods:["Swinging","Lively","Fun","Spirited"] },
        { primary:"Sophisticated", mods:["Cool","Elegant","Refined","Smooth"] },
        { primary:"Introspective", mods:["Meditative","Deep","Thoughtful","Exploratory"] }
      ],
      tempoRange:[80,160], defaultBPM:120,
      instruments:["upright bass","saxophone","piano","brushed drums","trumpet","jazz guitar","vibraphone","trombone"],
      production:["room reverb","warm compression","natural acoustics","spatial mixing","live feel","analog warmth","balanced mix"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:null,
      desc:"Improvisational music with sophisticated harmony and swing feel"
    },
    {
      id:"orchestral", name:"Orchestral", icon:"🎻", group:"Cinematic",
      subgenres:["Epic Orchestral","Romantic Orchestral","Minimalist Orchestral","Cinematic Orchestral","Chamber Orchestral"],
      moods:[
        { primary:"Epic",       mods:["Triumphant","Majestic","Grandiose","Monumental"] },
        { primary:"Melancholic",mods:["Emotional","Tender","Poignant","Sorrowful"] },
        { primary:"Serene",     mods:["Peaceful","Ethereal","Sublime","Majestic"] },
        { primary:"Dramatic",   mods:["Tense","Suspenseful","Intense","Powerful"] }
      ],
      tempoRange:[60,120], defaultBPM:84,
      instruments:["strings ensemble","brass section","woodwinds","choir","timpani","piano","French horns","harp"],
      production:["concert hall reverb","dynamic range","spatial orchestration","natural acoustics","wide stereo imaging","section layering"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[No Vocals]",
      desc:"Full orchestra arrangements with classical or modern cinematic style"
    },
    {
      id:"cinematic", name:"Cinematic", icon:"🎬", group:"Cinematic",
      subgenres:["Action Cinematic","Emotional Cinematic","Horror Cinematic","Sci-Fi Cinematic","Trailer Music","Epic Cinematic"],
      moods:[
        { primary:"Epic",       mods:["Intense","Powerful","Triumphant","Explosive"] },
        { primary:"Melancholic",mods:["Dramatic","Emotional","Moving","Poignant"] },
        { primary:"Dark",       mods:["Suspenseful","Tense","Ominous","Threatening"] },
        { primary:"Inspiring",  mods:["Uplifting","Motivational","Soaring","Heroic"] }
      ],
      tempoRange:[60,140], defaultBPM:90,
      instruments:["strings","brass","epic percussion","piano","synthesizer","choir","low brass","solo violin"],
      production:["large hall reverb","dynamic contrast","layered textures","massive low end","epic builds","trailer-style percussion","wide mix"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:"[No Vocals]",
      desc:"Film score-inspired music designed for emotional storytelling"
    },
    {
      id:"country", name:"Country", icon:"🤠", group:"Country / Folk",
      subgenres:["Modern Country","Classic Country","Outlaw Country","Country Pop","Bluegrass","Americana","Folk Country"],
      moods:[
        { primary:"Nostalgic",  mods:["Heartfelt","Sincere","Warm","Sentimental"] },
        { primary:"Uplifting",  mods:["Cheerful","Celebratory","Festive","Feel-Good"] },
        { primary:"Melancholic",mods:["Lonesome","Heartbroken","Sad","Longing"] },
        { primary:"Defiant",    mods:["Proud","Rebellious","Strong","Independent"] }
      ],
      tempoRange:[90,130], defaultBPM:108,
      instruments:["acoustic guitar","pedal steel guitar","fiddle","banjo","bass guitar","drums","dobro","mandolin"],
      production:["warm reverb","natural acoustics","live feel","authentic mix","twang character","Nashville sound","organic production"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:null,
      desc:"American roots music with storytelling lyrics and country instrumentation"
    },
    {
      id:"reggaeton", name:"Reggaeton", icon:"🌴", group:"Latin / World",
      subgenres:["Modern Reggaeton","Urban Reggaeton","Romantic Reggaeton","Perreo","Trap Latino","Dembow"],
      moods:[
        { primary:"Energetic", mods:["Sensual","Party","Festive","Danceable"] },
        { primary:"Confident", mods:["Aggressive","Bold","Assertive","Dominant"] },
        { primary:"Romantic",  mods:["Smooth","Flirtatious","Passionate","Sweet"] },
        { primary:"Euphoric",  mods:["Uplifting","Celebratory","Joyful","Vibrant"] }
      ],
      tempoRange:[90,100], defaultBPM:95,
      instruments:["dembow beat","808 bass","piano","brass samples","synthesizer","trap hi-hats","synth pads","percussion"],
      production:["punchy compression","bright EQ","danceable mix","urban sound","heavy low-end","tight groove","club-ready master"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:null,
      desc:"Latin urban music with dembow rhythm and dancehall influences"
    },
    {
      id:"afrobeats", name:"Afrobeats", icon:"🌍", group:"Latin / World",
      subgenres:["Afropop","Afro-Fusion","Highlife","Afro R&B","Amapiano","Afroswing"],
      moods:[
        { primary:"Joyful",     mods:["Celebratory","Uplifting","Festive","Vibrant"] },
        { primary:"Sensual",    mods:["Smooth","Flowing","Groovy","Warm"] },
        { primary:"Energetic",  mods:["Danceable","Infectious","Lively","Buoyant"] },
        { primary:"Melancholic",mods:["Yearning","Nostalgic","Emotional","Tender"] }
      ],
      tempoRange:[90,115], defaultBPM:100,
      instruments:["talking drum","bass guitar","electric guitar","shaker","brass section","synthesizer","log drum","kora (sparse)"],
      production:["warm mix","live percussion feel","rhythmic energy","layered percussion","bright EQ","organic warmth","afro groove"],
      qualityDefault:["[Hyper-Realistic]","[Studio Quality]"], vocalDefault:null,
      desc:"West African-influenced pop with polyrhythmic percussion and infectious grooves"
    },
    {
      id:"kompa", name:"Kompa", icon:"🎷", group:"Caribbean",
      subgenres:["Kompa Dirèk","Kompa Gouyad","Mini Jazz","Romantic Kompa","Modern Kompa","Kompa Fusion","Konpa Zouk"],
      moods:[
        { primary:"Romantic",  mods:["Sensual","Tender","Passionate","Sweet"] },
        { primary:"Festive",   mods:["Joyful","Celebratory","Lively","Vibrant"] },
        { primary:"Nostalgic", mods:["Sentimental","Classic","Golden-Era","Reflective"] },
        { primary:"Smooth",    mods:["Groovy","Elegant","Laid-Back","Silky"] }
      ],
      tempoRange:[100,120], defaultBPM:110,
      instruments:["electric guitar lead","bass guitar","trumpet","trombone","saxophone","congas","güira","tambourine","organ","synthesizer pads","drum kit","rhythm guitar"],
      production:["warm analog mix","danceable groove","rich brass arrangement","smooth vocal layering","Caribbean warmth","deep bass line","live band feel","lush horn section"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:"[Male Vocal]",
      desc:"Haitian dance music created in 1955 — infectious meringue-based rhythm, lush brass, and smooth electric guitar"
    },
    {
      id:"raboday", name:"Raboday", icon:"🔥", group:"Caribbean",
      subgenres:["Classic Raboday","Electronic Raboday","Raboday Trap","Hardcore Raboday","Raboday Romantique","Raboday Gouyad"],
      moods:[
        { primary:"Energetic",  mods:["Hype","Explosive","Intense","High-Energy"] },
        { primary:"Aggressive", mods:["Raw","Street","Hard","Fierce"] },
        { primary:"Party",      mods:["Wild","Festive","Carnival","Frenetic"] },
        { primary:"Rebellious", mods:["Bold","Defiant","Urban","Unfiltered"] }
      ],
      tempoRange:[135,160], defaultBPM:145,
      instruments:["808 bass","trap drum kit","distorted synthesizer","sampled brass loop","rapid hi-hat rolls","sub bass","tambourine","güira","digital percussion","synth stab"],
      production:["heavy 808 compression","trap production","bass saturation","raw high-energy mix","punchy kick","distorted low-end","aggressive limiting","swing hi-hat pattern"],
      qualityDefault:["[Studio Quality]"], vocalDefault:"[Male Vocal]",
      desc:"Modern Haitian urban genre — Kompa rhythms fused with trap, 808s, and raw street energy"
    },
    {
      id:"zouk", name:"Zouk", icon:"🌺", group:"Caribbean",
      subgenres:["Zouk Love","Zouk Bèlè","Zouk Be (Fast)","Antillean Zouk","Cabo Love","Cape Verdean Zouk","Modern Zouk","Kizomba-Zouk"],
      moods:[
        { primary:"Romantic",   mods:["Sensual","Intimate","Tender","Passionate"] },
        { primary:"Festive",    mods:["Tropical","Joyful","Vibrant","Euphoric"] },
        { primary:"Melancholic",mods:["Longing","Bittersweet","Nostalgic","Emotional"] },
        { primary:"Dreamy",     mods:["Flowing","Lush","Enchanting","Hypnotic"] }
      ],
      tempoRange:[75,130], defaultBPM:95,
      instruments:["electric guitar","synthesizer pads","bass guitar","congas","drum machine","trumpet","saxophone","accordion","flute","rhythm guitar","keyboard","vocal harmonies"],
      production:["lush tropical arrangement","layered synthesizer pads","Caribbean reverb","smooth vocal production","wide stereo mix","rich harmony stacking","danceable low-end","warm tropical EQ"],
      qualityDefault:["[Studio Quality]","[Mastered]"], vocalDefault:"[Female Vocal]",
      desc:"Caribbean dance music from the French Antilles — romantic vocals, flowing rhythms, and lush tropical production"
    }
  ],

  // ─── META TAGS ───────────────────────────────────────────────
  metaTags: {
    quality: [
      { tag:"[Hyper-Realistic]", desc:"Highest-fidelity render. Captures breath, bow noise, room tone. Uses more credits — skip on test runs." },
      { tag:"[Studio Quality]",  desc:"Broad quality baseline for all production styles. Pairs well with Hyper-Realistic." },
      { tag:"[Mastered]",        desc:"Broadcast-ready: consistent loudness, final limiting, tonal balance." }
    ],
    vocal: [
      { tag:"[No Vocals]",    desc:"Removes all vocal content. Most reliable for instrumentals. Pair with 'no: vocals' for max effect." },
      { tag:"[Instrumental]", desc:"Alternative to No Vocals. Sometimes produces a warmer tone. Use if No Vocals still leaks vocals." },
      { tag:"[Female Vocal]", desc:"Feminine register and delivery. Best for R&B, pop, jazz, neo-soul." },
      { tag:"[Male Vocal]",   desc:"Masculine register. Best for hip hop, soul, rock, jazz." },
      { tag:"[Powerful]",     desc:"Projects full-voice intensity. Best for anthems, gospel, soul belting." },
      { tag:"[Whispered]",    desc:"Intimate breathy delivery. Best for ASMR, ambient, confessional R&B." },
      { tag:"[Falsetto]",     desc:"High register above the break. Best for neo-soul, R&B, indie pop." },
      { tag:"[Raspy]",        desc:"Gritty, textured vocal tone. Best for blues, rock, dark hip hop." },
      { tag:"[Breathy]",      desc:"Airy, soft texture. Best for lo-fi, dream pop, sensual R&B." }
    ],
    production: [
      { tag:"[Sidechain]",    desc:"Pumping compression — the kick ducks the other elements. Best for house, techno, EDM, any electronic music." },
      { tag:"[Lo-Fi]",        desc:"Applies vinyl crackle, tape saturation, frequency roll-off. Best for lo-fi hip hop, indie, any production wanting vintage warmth." },
      { tag:"[Dry Mix]",      desc:"Removes excess reverb — close, intimate sound. Best for jazz, blues, intimate R&B, any production that sounds too wet." },
      { tag:"[Heavy Bass]",   desc:"Increases sub-bass presence significantly. Best for hip hop, trap, bass music, any genre needing more low end." },
      { tag:"[808]",          desc:"Activates 808 bass drum and sub-bass engine. Best for trap, hip hop, any genre requiring 808 production." },
      { tag:"[Distortion]",   desc:"Adds harmonic distortion. Best for rock, blues, industrial, any guitar-forward production." },
      { tag:"[Reverb]",       desc:"Adds spacious room/hall reverb. Best for ambient, cinematic, any production needing space." },
      { tag:"[Cinematic]",    desc:"Wide, dramatic production with large dynamic range. Best for film scores, trailers, epic productions." },
      { tag:"[Orchestral]",   desc:"Adds strings, brass, and orchestral arrangement. Best for classical, cinematic, hip hop with orchestral samples." },
      { tag:"[Vintage]",      desc:"Period-accurate production characteristics. Best for old school hip hop, classic R&B, 60s-80s era music." },
      { tag:"[Live Drums]",   desc:"Shifts drum programming toward organic, live-sounding patterns. Best for jazz, soul, rock, neo-soul, any acoustic genre." },
      { tag:"[Minimalist]",   desc:"Strips back arrangement — fewer elements, more space. Best for ambient, intimate R&B, minimal techno, any sparse production." }
    ],
    moodMeta: [
      { tag:"[Dark]",        desc:"Shifts harmonic palette toward minor, dissonant, tense. Best for dark trap, noir jazz, minor-key anything." },
      { tag:"[Euphoric]",    desc:"High-energy, uplifting — major key, bright synths. Best for festival EDM, uplifting trance, pop anthems." },
      { tag:"[Melancholic]", desc:"Bittersweet, introspective — works with minor keys. Best for R&B ballads, indie, slow blues, reflective hip hop." },
      { tag:"[Aggressive]",  desc:"High BPM feel, distorted elements, intense performance. Best for drill, heavy metal, dark trap, industrial techno." },
      { tag:"[Chill]",       desc:"Low tempo, relaxed arrangement, warm tones. Best for lo-fi, chillout, ambient, late night R&B." },
      { tag:"[Dreamy]",      desc:"Hazy, reverb-heavy, slow attack on instruments. Best for cloud rap, ambient, PBR&B, experimental R&B." },
      { tag:"[Epic]",        desc:"Large-scale, climactic — climactic builds. Best for cinematic scores, big room EDM, orchestral hip hop." },
      { tag:"[Tense]",       desc:"Unresolved harmonic movement, building anxiety. Best for horror, thriller scores, dark ambient." }
    ]
  },

  // ─── ARTIST REFERENCES ───────────────────────────────────────
  // Source: Suno v5 Prompt Engineering guide, Chapter 6
  artistRefs: {
    "Jazz": {
      "Bebop":         ["Charlie Parker","Dizzy Gillespie","Bud Powell","Thelonious Monk","Art Tatum"],
      "Cool / Modal":  ["Miles Davis (Kind of Blue era)","Bill Evans","John Coltrane (A Love Supreme era)"],
      "Hard Bop":      ["Lee Morgan","Horace Silver","Sonny Rollins","Cannonball Adderley"],
      "Fusion":        ["Weather Report","Herbie Hancock (Headhunters era)","Mahavishnu Orchestra"],
      "Contemporary":  ["Kamasi Washington","Brad Mehldau","Ambrose Akinmusire","Snarky Puppy"]
    },
    "Blues": {
      "Delta":         ["Robert Johnson","Son House","Charley Patton","Mississippi John Hurt"],
      "Chicago":       ["Muddy Waters","Howlin' Wolf","Buddy Guy","Otis Rush","Junior Wells"],
      "Texas":         ["Stevie Ray Vaughan","Albert Collins","T-Bone Walker","Freddie King"],
      "Blues Rock":    ["Eric Clapton (Cream era)","Jimi Hendrix","Gary Moore","Joe Bonamassa"],
      "Soul Blues":    ["Bobby Bland","B.B. King","Albert King","Etta James"]
    },
    "Hip Hop": {
      "Boom Bap":      ["J Dilla","Pete Rock","DJ Premier","Large Professor","RZA"],
      "West Coast":    ["Dr. Dre (Chronic era)","DJ Quik","The Neptunes (West Coast work)"],
      "Trap":          ["Metro Boomin","Southside","Wheezy","TM88","Pi'erre Bourne"],
      "Lo-Fi":         ["Nujabes","J Dilla (Donuts era)","Knxwledge","Sango"]
    },
    "R&B / Soul": {
      "Neo-Soul":         ["D'Angelo","Erykah Badu","Lauryn Hill","Maxwell","Musiq Soulchild"],
      "Contemporary R&B": ["The Weeknd","Frank Ocean","SZA","H.E.R.","Khalid"],
      "Classic Soul":     ["Marvin Gaye","Al Green","Aretha Franklin","Otis Redding","Curtis Mayfield"],
      "Funk":             ["James Brown","Sly Stone","Parliament-Funkadelic","Prince","Earth Wind & Fire"]
    },
    "Electronic": {
      "Deep House":       ["Larry Heard (Mr. Fingers)","Kerri Chandler"],
      "Techno":           ["Plastikman (Richie Hawtin)","Robert Hood","Surgeon","Ben Klock"],
      "Melodic Dubstep":  ["Flux Pavilion","Excision","Nero","Knife Party"],
      "Trance":           ["Paul van Dyk","Ferry Corsten","Tiesto (early era)","Above & Beyond"]
    }
  },

  // ─── CONFLICT RULES ──────────────────────────────────────────
  conflicts: {
    hard: [
      { tags:["[No Vocals]","[Female Vocal]"],   reason:"Cannot remove vocals and specify female vocals." },
      { tags:["[No Vocals]","[Male Vocal]"],     reason:"Cannot remove vocals and specify male vocals." },
      { tags:["[No Vocals]","[Powerful]"],       reason:"[Powerful] is a vocal delivery tag — conflicts with No Vocals." },
      { tags:["[No Vocals]","[Whispered]"],      reason:"[Whispered] is a vocal delivery tag — conflicts with No Vocals." },
      { tags:["[No Vocals]","[Falsetto]"],       reason:"[Falsetto] is a vocal delivery tag — conflicts with No Vocals." },
      { tags:["[No Vocals]","[Raspy]"],          reason:"[Raspy] is a vocal delivery tag — conflicts with No Vocals." },
      { tags:["[No Vocals]","[Breathy]"],        reason:"[Breathy] is a vocal delivery tag — conflicts with No Vocals." },
      { tags:["[Instrumental]","[Female Vocal]"],reason:"Instrumental track conflicts with specifying a vocal type." },
      { tags:["[Instrumental]","[Male Vocal]"],  reason:"Instrumental track conflicts with specifying a vocal type." },
      { tags:["[Powerful]","[Whispered]"],       reason:"Contradictory vocal delivery styles." }
    ],
    softMoods: [
      { pair:["melancholic","euphoric"],  reason:"Opposing emotional registers — pick one dominant mood." },
      { pair:["dark","uplifting"],        reason:"Conflicting energy — may produce incoherent result." },
      { pair:["aggressive","peaceful"],   reason:"Contradictory energy levels." },
      { pair:["nostalgic","futuristic"],  reason:"Opposing temporal aesthetics may conflict." }
    ]
  },

  // ─── LYRICS TAGS ─────────────────────────────────────────────
  lyricsTags: {
    structural: ["[Intro]","[Verse 1]","[Verse 2]","[Verse 3]","[Pre-Chorus]","[Chorus]","[Post-Chorus]","[Bridge]","[Outro]","[Hook]","[Rap Verse]","[Spoken Word]","[Interlude]","[Break]","[Drop]","[Build]","[Instrumental Break]","[Solo]"],
    delivery:   ["[Powerful]","[Whispered]","[Falsetto]","[Raspy]","[Smooth]","[Spoken]","[Melodic]","[Aggressive]","[Tender]","[Breathy]","[Operatic]","[Growling]"]
  },

  commonExcludes:["vocals","drums","piano","guitar","bass","strings","brass","hi-hat","reverb","distortion","synth"]
};
