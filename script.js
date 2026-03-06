const BASE_ELO = 1200;

let champions = [];
let currentMatch = [];
let CURRENT_VERSION = null;
let currentSlot = 1;
let cachedSortedPool = [];

/* ---------- DYNAMIC STABILITY TARGET ---------- */

function getRequiredGames(poolSize){

    if(poolSize >= 100) return 20;
    if(poolSize >= 40)  return 18;
    if(poolSize >= 20)  return 15;
    if(poolSize >= 10)  return 12;
    if(poolSize >= 5)   return 8;
    return 6; // tiny pools (2–4 champs)
}

/* ---------- SLOT ROLE STORAGE ---------- */

let slotRoleFilters = {
    1: "All",
    2: "All",
    3: "All"
};

function getCurrentRoleFilter(){
    return slotRoleFilters[currentSlot] || "All";
}

/* ---------- MANUAL ROLE OVERRIDES (ARRAY FORMAT) ---------- */

/* ===== OFFICIAL ROLE LIST (from Wiki roster) ===== */

const ROLE_OVERRIDES = {
  "Aatrox": ["Top"],
  "Ahri": ["Mid"],
  "Akali": ["Mid", "Top"],
  "Akshan": ["Mid", "ADC"],
  "Alistar": ["Support"],
  "Ambessa": ["Top"],
  "Amumu": ["Jungle", "Support"],
  "Anivia": ["Mid"],
  "Annie": ["Mid", "Support"],
  "Aphelios": ["ADC"],
  "Ashe": ["ADC", "Support"],
  "Aurelion Sol": ["Mid"],
  "Aurora": ["Mid", "Top"],
  "Azir": ["Mid"],
  "Bard": ["Support"],
  "Bel'Veth": ["Jungle"],
  "Blitzcrank": ["Support"],
  "Brand": ["Support", "Mid"],
  "Braum": ["Support"],
  "Briar": ["Jungle"],
  "Caitlyn": ["ADC"],
  "Camille": ["Top"],
  "Cassiopeia": ["Mid"],
  "Cho'Gath": ["Top", "Mid"],
  "Corki": ["Mid", "ADC"],
  "Darius": ["Top"],
  "Diana": ["Jungle", "Mid"],
  "Dr. Mundo": ["Top"],
  "Draven": ["ADC"],
  "Ekko": ["Mid", "Jungle"],
  "Elise": ["Jungle"],
  "Evelynn": ["Jungle"],
  "Ezreal": ["ADC"],
  "Fiddlesticks": ["Jungle"],
  "Fiora": ["Top"],
  "Fizz": ["Mid"],
  "Galio": ["Mid", "Support"],
  "Gangplank": ["Top"],
  "Garen": ["Top"],
  "Gnar": ["Top"],
  "Gragas": ["Top", "Jungle", "Mid"],
  "Graves": ["Jungle"],
  "Gwen": ["Top"],
  "Hecarim": ["Jungle"],
  "Heimerdinger": ["Mid", "Top", "Support"],
  "Hwei": ["Mid"],
  "Illaoi": ["Top"],
  "Irelia": ["Top", "Mid"],
  "Ivern": ["Jungle"],
  "Janna": ["Support"],
  "Jarvan IV": ["Jungle"],
  "Jax": ["Top", "Jungle"],
  "Jayce": ["Top", "Mid"],
  "Jhin": ["ADC"],
  "Jinx": ["ADC"],
  "K'Sante": ["Top"],
  "Kai'Sa": ["ADC"],
  "Kalista": ["ADC"],
  "Karma": ["Support", "Mid"],
  "Karthus": ["Jungle", "Mid"],
  "Kassadin": ["Mid"],
  "Katarina": ["Mid"],
  "Kayle": ["Top", "Mid"],
  "Kayn": ["Jungle"],
  "Kennen": ["Top"],
  "Kha'Zix": ["Jungle"],
  "Kindred": ["Jungle"],
  "Kled": ["Top"],
  "Kog'Maw": ["ADC"],
  "LeBlanc": ["Mid"],
  "Lee Sin": ["Jungle"],
  "Leona": ["Support"],
  "Lillia": ["Jungle"],
  "Lissandra": ["Mid"],
  "Lucian": ["ADC", "Mid"],
  "Lulu": ["Support"],
  "Lux": ["Support", "Mid"],
  "Malphite": ["Top"],
  "Malzahar": ["Mid"],
  "Maokai": ["Jungle", "Support"],
  "Master Yi": ["Jungle"],
  "Mel": ["Mid"],
  "Milio": ["Support"],
  "Miss Fortune": ["ADC"],
  "Mordekaiser": ["Top"],
  "Morgana": ["Support", "Jungle", "Mid"],
  "Naafiri": ["Mid", "Jungle"],
  "Nami": ["Support"],
  "Nasus": ["Top"],
  "Nautilus": ["Support"],
  "Neeko": ["Mid", "Support"],
  "Nidalee": ["Jungle"],
  "Nilah": ["ADC"],
  "Nocturne": ["Jungle"],
  "Nunu & Willump": ["Jungle"],
  "Olaf": ["Top", "Jungle"],
  "Orianna": ["Mid"],
  "Ornn": ["Top"],
  "Pantheon": ["Top", "Support", "Mid"],
  "Poppy": ["Top", "Jungle"],
  "Pyke": ["Support"],
  "Qiyana": ["Mid", "Jungle"],
  "Quinn": ["Top"],
  "Rakan": ["Support"],
  "Rammus": ["Jungle"],
  "Rek'Sai": ["Jungle"],
  "Rell": ["Support"],
  "Renata Glasc": ["Support"],
  "Renekton": ["Top"],
  "Rengar": ["Jungle", "Top"],
  "Riven": ["Top"],
  "Rumble": ["Top"],
  "Ryze": ["Mid", "Top"],
  "Samira": ["ADC"],
  "Sejuani": ["Jungle"],
  "Senna": ["Support", "ADC"],
  "Seraphine": ["Support", "Mid"],
  "Sett": ["Top"],
  "Shaco": ["Jungle", "Support"],
  "Shen": ["Top"],
  "Shyvana": ["Jungle"],
  "Singed": ["Top"],
  "Sion": ["Top"],
  "Sivir": ["ADC"],
  "Skarner": ["Jungle"],
  "Smolder": ["ADC"],
  "Sona": ["Support"],
  "Soraka": ["Support"],
  "Swain": ["Mid", "ADC", "Support"],
  "Sylas": ["Mid"],
  "Syndra": ["Mid"],
  "Tahm Kench": ["Support", "Top"],
  "Taliyah": ["Mid", "Jungle"],
  "Talon": ["Mid", "Jungle"],
  "Taric": ["Support"],
  "Teemo": ["Top"],
  "Thresh": ["Support"],
  "Tristana": ["ADC", "Mid"],
  "Trundle": ["Top", "Jungle"],
  "Tryndamere": ["Top"],
  "Twisted Fate": ["Mid"],
  "Twitch": ["ADC"],
  "Udyr": ["Jungle"],
  "Urgot": ["Top"],
  "Varus": ["ADC"],
  "Vayne": ["ADC", "Top"],
  "Veigar": ["Mid"],
  "Vel'Koz": ["Support", "Mid"],
  "Vex": ["Mid"],
  "Vi": ["Jungle"],
  "Viego": ["Jungle"],
  "Viktor": ["Mid"],
  "Vladimir": ["Mid", "Top"],
  "Volibear": ["Top", "Jungle"],
  "Warwick": ["Jungle"],
  "Wukong": ["Jungle", "Top"],
  "Xayah": ["ADC"],
  "Xerath": ["Support", "Mid"],
  "Xin Zhao": ["Jungle"],
  "Yasuo": ["Mid", "Top"],
  "Yone": ["Mid", "Top"],
  "Yorick": ["Top"],
  "Yuumi": ["Support"],
  "Zac": ["Jungle"],
  "Zed": ["Mid"],
  "Zeri": ["ADC"],
  "Ziggs": ["Mid", "ADC"],
  "Zilean": ["Support", "Mid"],
  "Zoe": ["Mid"],
  "Zyra": ["Support", "Mid"]
};

/* ---------- GET LATEST VERSION ---------- */

async function getLatestVersion(){
    const res = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const versions = await res.json();
    return versions[0];
}

function getActiveTiers(poolSize){

    if(poolSize >= 80) return ["S+","S","A","B","C","D"];
    if(poolSize >= 40) return ["S+","S","A","B","C"];
    if(poolSize >= 20) return ["S+","S","A","B"];
    if(poolSize >= 10) return ["S+","S","A"];
    return ["S+","S"];
}

/* ---------- STRONG ANTI-REPEAT ---------- */

let recentMatches = [];
let recentChampions = [];

const MATCH_HISTORY_LIMIT = 8;   // how many past matches we remember
const CHAMPION_COOLDOWN = 3;     // soft cooldown per champion

/* ---------- ROLE DETECTION (RETURNS ARRAY) ---------- */

function detectRoleLabel(tags, champId, champName){

    // ⭐ manual override first
    // ⭐ try by display name first (best match to wiki)
    if (champName && ROLE_OVERRIDES[champName]) {
        return ROLE_OVERRIDES[champName];
    }

    // ⭐ fallback to Riot id if ever needed
    if (champId && ROLE_OVERRIDES[champId]) {
        return ROLE_OVERRIDES[champId];
    }

    const roles = [];

    if(tags.includes("Fighter") || tags.includes("Tank"))
        roles.push("Top");

    if(tags.includes("Assassin"))
        roles.push("Jungle","Mid");

    if(tags.includes("Mage"))
        roles.push("Mid");

    if(tags.includes("Marksman"))
        roles.push("ADC");

    if(tags.includes("Support"))
        roles.push("Support");

    const unique = [...new Set(roles)];

    if(unique.length === 0) return ["Top"];

    return unique;
}

/* ---------- LOAD CHAMPIONS ---------- */

async function loadChampions(){

    const saved = localStorage.getItem(getSlotKey());

    if(saved){
        champions = JSON.parse(saved);

        // 🔥 backfill safety
        champions.forEach(c=>{
            if(c.isNew === undefined) c.isNew = false;
            if(c.games === undefined) c.games = 0;
            if(c.wins === undefined) c.wins = 0;
            if(c.mu === undefined){
                c.mu = 1200;
            }

            if(c.sigma === undefined){
                c.sigma = 350;
            }
            if(c.enabled === undefined) c.enabled = true;

            // 🔥 convert old string roles → array
            if(typeof c.roleLabel === "string"){
                c.roleLabel = c.roleLabel.split("/");
            }

            if(!c.roleLabel && c.tags){
                c.roleLabel = detectRoleLabel(c.tags, c.id, c.name);
            }
        });

        startMatch();
        drawTierLists();
        updateStabilityDisplay();
        updateProgress();
        drawChampionPool();
        return;
    }

    CURRENT_VERSION = await getLatestVersion();

    const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/champion.json`
    );

    const data = await res.json();
    const champs = Object.values(data.data);

    champions = champs.map(c=>({
        id:c.id,
        name:c.name,
        image:`https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/champion/${c.image.full}`,
        tags:c.tags,
        mu:1200,
        sigma:350,
        wins:0,
        games:0,
        isNew:false,
        enabled:true, // ⭐ ADD THIS
        roleLabel: detectRoleLabel(c.tags, c.id, c.name)
    }));

    save();
    startMatch();
    drawTierLists();
    updateStabilityDisplay();
    updateProgress();
    drawChampionPool();
    updatePoolCounter();
}

/* ---------- ROLE FILTER ---------- */

function passesRoleFilter(champ){
    if(!champ.enabled) return false;

    const roleFilter = getCurrentRoleFilter();
    if(roleFilter === "All") return true;

    return champ.roleLabel.includes(roleFilter);
}

function setRoleFilter(role){

    // ⭐ save per slot
    slotRoleFilters[currentSlot] = role;

    highlightActiveRole();
    startMatch();
    drawTierLists();
    updateProgress();
    updateStabilityDisplay();
    drawChampionPool();
    updatePoolCounter();
}

function getSlotKey(){
    return `champions_slot_${currentSlot}`;
}

function rememberMatch(a, b) {
    // store pair key sorted (A|B same as B|A)
    const key = [a.id, b.id].sort().join("|");
    recentMatches.unshift(key);
    if (recentMatches.length > MATCH_HISTORY_LIMIT) {
        recentMatches.pop();
    }

    // champion cooldown memory
    recentChampions.unshift(a.id);
    recentChampions.unshift(b.id);

    if (recentChampions.length > MATCH_HISTORY_LIMIT * 2) {
        recentChampions = recentChampions.slice(0, MATCH_HISTORY_LIMIT * 2);
    }
}

function wasRecentPair(a, b) {
    const key = [a.id, b.id].sort().join("|");
    return recentMatches.includes(key);
}

function championCooldownScore(champId) {
    // lower is better
    let count = 0;
    for (let i = 0; i < CHAMPION_COOLDOWN && i < recentChampions.length; i++) {
        if (recentChampions[i] === champId) count++;
    }
    return count;
}

/* ---------- MATCHMAKING ---------- */

function startMatch() {

    const pool = champions.filter(passesRoleFilter);

    if (pool.length < 2) {

        currentMatch = [];

        const name1 = document.getElementById("name1");
        const name2 = document.getElementById("name2");

        if(name1) name1.textContent = "Not enough champions";
        if(name2) name2.textContent = "";

        return;
    }

    // 1. PRIORITIZATION LOGIC
    // Sort pool by games played (least games first)

    const priorityPool = [...pool].sort(
        (a, b) => (a.games || 0) - (b.games || 0)
    );

    // Pick Champion A with bias toward least played

    const bias = pool.length > 40 ? 1.6 : 1.9;

    const indexA = Math.floor(
        Math.pow(Math.random(), bias) * priorityPool.length
    );

    const a = priorityPool[indexA];

    /* ---------- SMART MATCHMAKING ---------- */

    let eloWindow = 200;

    if (pool.length < 40) eloWindow = 300;
    if (pool.length < 20) eloWindow = 500;
    if (pool.length < 10) eloWindow = 9999;

    let candidates = pool.filter(c => {

        if (c.id === a.id) return false;

        if (Math.abs(getRating(c) - getRating(a)) > eloWindow)
            return false;

        return true;

    });

    if (candidates.length === 0) {
        candidates = pool.filter(c => c.id !== a.id);
    }

    /* ---------- ANTI-REPEAT ---------- */

    let filtered = candidates.filter(c => !wasRecentPair(a, c));

    if (filtered.length < Math.max(2, Math.floor(pool.length * 0.15))) {
        filtered = candidates;
    }

    /* ---------- PRIORITY SORT ---------- */

    filtered.sort((x, y) => {

        const cooldownX = championCooldownScore(x.id);
        const cooldownY = championCooldownScore(y.id);

        if (cooldownX !== cooldownY)
            return cooldownX - cooldownY;

        return (x.games || 0) - (y.games || 0);

    });

    /* ---------- FINAL PICK ---------- */

    const topCandidates =
        filtered.slice(
            0,
            Math.max(1, Math.floor(filtered.length * 0.3))
        );

    const b =
        topCandidates[
            Math.floor(Math.random() * topCandidates.length)
        ];

    currentMatch = [a, b];

    rememberMatch(a, b);

    showMatch();
}

/* ---------- DISPLAY ---------- */

function showMatch(){

    if(!currentMatch.length) return;

    const [a,b]=currentMatch;

    document.getElementById("img1").src = a.image;
    document.getElementById("img2").src = b.image;

    document.getElementById("name1").textContent =
        `${a.name} | Est:${Math.round(a.mu)} | Rank:${Math.round(getRating(a))}`;

    document.getElementById("name2").textContent =
        `${b.name} | Est:${Math.round(b.mu)} | Rank:${Math.round(getRating(b))}`;

    document.getElementById("tier1").textContent =
        `Tier ${getTier(a)} • ${a.roleLabel.join("/")}`;

    document.getElementById("tier2").textContent =
        `Tier ${getTier(b)} • ${b.roleLabel.join("/")}`;
}

/* ---------- ELO ---------- */

function chooseWinner(i){

    if(!currentMatch.length) return;

    const winner=currentMatch[i-1];
    const loser=currentMatch[i===1?1:0];

    updateRatings(winner, loser);

    const pool = champions.filter(passesRoleFilter);
    const required = getRequiredGames(pool.length);

    if(winner.games >= required) winner.isNew = false;
    if(loser.games >= required) loser.isNew = false;

    save();
    startMatch();
    drawTierLists();
    updateProgress();
    updateStabilityDisplay(); // ⭐ ADD THIS
}

function expectedWin(a,b){

    const diff = a.mu - b.mu;
    const uncertainty = Math.sqrt(a.sigma*a.sigma + b.sigma*b.sigma);

    return 1/(1+Math.exp(-diff/uncertainty));
}

function updateRatings(winner, loser){

    const K = 32;

    const expected = expectedWin(winner, loser);

    const change = K * (1 - expected);

    winner.mu += change;
    loser.mu  -= change;

    winner.sigma = Math.max(60, winner.sigma * 0.97);
    loser.sigma  = Math.max(60, loser.sigma * 0.97);

    winner.games++;
    loser.games++;

    winner.wins++;
}

function getTierDistribution(poolSize){

    // ⭐ dynamic compression for small pools

    if(poolSize < 10){
        return [
            {tier:"S+", pct:0.5},
            {tier:"S", pct:0.5}
        ];
    }

    if(poolSize < 20){
        return [
            {tier:"S+", pct:0.20},
            {tier:"S", pct:0.30},
            {tier:"A", pct:0.30},
            {tier:"B", pct:0.20}
        ];
    }

    if(poolSize < 40){
        return [
            {tier:"S+", pct:0.10},
            {tier:"S", pct:0.20},
            {tier:"A", pct:0.25},
            {tier:"B", pct:0.25},
            {tier:"C", pct:0.20}
        ];
    }

    // ⭐ full distribution
    return [
        {tier:"S+", pct:0.05},
        {tier:"S", pct:0.15},
        {tier:"A", pct:0.25},
        {tier:"B", pct:0.25},
        {tier:"C", pct:0.20},
        {tier:"D", pct:0.10}
    ];
}

/* ---------- TIERS ---------- */

function getTier(champ){

    const pool = cachedSortedPool.length
        ? cachedSortedPool
        : champions
            .filter(passesRoleFilter)
            .sort((a,b)=>getRating(b)-getRating(a));

    if(pool.length === 0) return "S";

    const dist = getTierDistribution(pool.length);

    const index = pool.findIndex(c=>c.id === champ.id);
    if(index === -1) return "S";

    const positionPct = (index + 1) / pool.length;

    let cumulative = 0;

    for(const bucket of dist){
        cumulative += bucket.pct;
        if(positionPct <= cumulative){
            return bucket.tier;
        }
    }

    // fallback safety
    return dist[dist.length - 1].tier;
}

function getRating(champ){
    return champ.mu - 3*champ.sigma;
}

/* ---------- TIER BOARD ---------- */

function drawTierLists(){

    const pool = champions.filter(passesRoleFilter);
    const dist = getTierDistribution(pool.length);
    const activeTiers = dist.map(d => d.tier);

    const ALL_TIERS = ["S+","S","A","B","C","D"];

    // ⭐ show/hide tier columns using class (more reliable than style)
    ALL_TIERS.forEach(t => {

        const box = document.getElementById("tier-" + t);
        if (!box) return;

        box.innerHTML = "";

        const wrapper = box.parentElement;

        if (activeTiers.includes(t)) {
            wrapper.classList.remove("hidden");
        } else {
            wrapper.classList.add("hidden");
        }
    });

    // sort pool
    cachedSortedPool = [...pool].sort((a,b) => getRating(b) - getRating(a));
    const sorted = cachedSortedPool;

    // fill tiers
    sorted.forEach(c => {

        const tier = getTier(c);
        if (!activeTiers.includes(tier)) return;

        const div = document.createElement("div");
        div.className = "tierChamp";
        div.textContent =
            `${c.name} (${Math.round(getRating(c))}) — ${c.roleLabel.join("/")}`;

        const target = document.getElementById("tier-" + tier);
        if (target) target.appendChild(div);
    });

    updateStabilityDisplay();
}

/* ---------- EXPORT TXT ---------- */

function exportTxt(){

    const sorted = [...champions]
        .filter(passesRoleFilter)
        .sort((a,b)=>getRating(b)-getRating(a));
    
    if(sorted.length === 0){
        alert("No champions to export.");
        return;
    }

    const TIERS = ["S+","S","A","B","C","D"];

    let text = "Champion Elo Ranking\n";
    text += "====================\n\n";

    TIERS.forEach(tier=>{
        const tierChamps = sorted.filter(c=>getTier(c)===tier);
        if(tierChamps.length === 0) return;

        text += `===== TIER ${tier} =====\n`;

        tierChamps.forEach((c,i)=>{
            text += `${i+1}. ${c.name} — ${Math.round(getRating(c))} — ${c.roleLabel.join("/")}\n`;
        });

        text += "\n";
    });

    const blob = new Blob([text], {type:"text/plain"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "champion_elo_tiers.txt";
    a.click();

    URL.revokeObjectURL(url);
}

/* ---------- EXPORT/IMPORT ---------- */

function exportProgress(){

    const data = {
        champions: champions,
        version: CURRENT_VERSION,
        roleFilter: getCurrentRoleFilter() // ⭐ FIX
    };

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "champion_elo_progress.json";
    a.click();

    URL.revokeObjectURL(url);
}

function importProgress(event){

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
        try{
            const data = JSON.parse(e.target.result);

            if(!data.champions){
                alert("Invalid save file.");
                return;
            }

            champions = data.champions;
            CURRENT_VERSION = data.version || CURRENT_VERSION;
            slotRoleFilters[currentSlot] = data.roleFilter || "All";

            save();
            startMatch();
            drawTierLists();
            updateProgress();
            updateStabilityDisplay();
            drawChampionPool();

        }catch(err){
            alert("Error loading file.");
            console.error(err);
        }
    };

    reader.readAsText(file);
    event.target.value = "";
}

function updateProgress(){

    const pool = champions.filter(passesRoleFilter);

    const bar = document.getElementById("progressBar");
    const text = document.getElementById("progressText");

    if(pool.length === 0){
        if(text) text.textContent = "Checking...";
        if(bar) bar.style.width = "0%";
        return;
    }

    const required = getRequiredGames(pool.length);

    let totalGames = 0;

    pool.forEach(c=>{
        totalGames += Math.min(c.games || 0, required);
    });

    const maxGames = pool.length * required;
    const percent = Math.round((totalGames / maxGames) * 100);

    if(bar) bar.style.width = percent + "%";

    if(text) text.textContent =
        percent + "% completed (" +
        totalGames + "/" + maxGames +
        ") • Target: " + required + " games";
}

async function loadProgress() {
    const saved = localStorage.getItem(getSlotKey());

    if (saved) {
        champions = JSON.parse(saved);

        champions.forEach(c => {
            if (c.isNew === undefined) c.isNew = false;
            if (c.games === undefined) c.games = 0;
            if (c.wins === undefined) c.wins = 0;
            if (c.enabled === undefined) c.enabled = true;

            if (typeof c.roleLabel === "string") {
                c.roleLabel = c.roleLabel.split("/");
            }

            if (!c.roleLabel && c.tags) {
                c.roleLabel = detectRoleLabel(c.tags, c.id, c.name);
            }
        });

    } else {
        // ⭐ IMPORTANT: load fresh champions for this slot
        await loadChampions();
        return;
    }

    startMatch();
    drawTierLists();
    updateProgress();
    updateStabilityDisplay();
    drawChampionPool();
    updatePoolCounter();
}

function updateStabilityDisplay(){

    const badge = document.getElementById("stabilityBadge");
    const text = document.getElementById("stabilityText");

    if(!badge || !text) return;

    const pool = champions.filter(passesRoleFilter);

    if(pool.length === 0){
        badge.textContent = "Checking...";
        text.textContent = "";
        badge.style.background = "#666";
        return;
    }

    const required = getRequiredGames(pool.length);

    /* ---------- ⭐ HARD ZERO GUARD ---------- */

    let totalGames = 0;
    pool.forEach(c => totalGames += (c.games || 0));

    if (totalGames === 0) {
        badge.textContent = "Checking...";
        badge.style.background = "#666";
        text.textContent = "0% confidence";
        return;
    }

    /* ---------- ⭐ SMOOTH CONFIDENCE ---------- */

    let stabilityScore = 0;

    const POWER = 2.2; // ⭐ tuning knob (see below)

    pool.forEach(c=>{
        const games = c.games || 0;
        const ratio = Math.min(games / required, 1);

        // ⭐ slow early, smooth later
        const champConfidence = Math.pow(ratio, POWER);

        stabilityScore += champConfidence;
    });

    const percent = Math.round((stabilityScore / pool.length) * 100);

    /* ---------- BADGE LOGIC ---------- */

    if(percent < 30){
        badge.textContent = "Unstable";
        badge.style.background = "#e53935";
    }else if(percent < 70){
        badge.textContent = "Getting there";
        badge.style.background = "#fbc02d";
    }else if(percent < 95){
        badge.textContent = "Mostly stable";
        badge.style.background = "#43a047";
    }else{
        badge.textContent = "Stable";
        badge.style.background = "#2e7d32";
    }

    text.textContent = percent + "% confidence";
}

async function selectSlot(slotNumber) {
    currentSlot = slotNumber;
    highlightActiveSlot();

    champions = [];
    await loadProgress();

    highlightActiveRole(); // ⭐ IMPORTANT
}

function drawChampionPool(){
    const container = document.getElementById("championPool");
    if(!container) return;

    container.innerHTML = "";
    const sorted = [...champions].sort((a,b)=>a.name.localeCompare(b.name));

    sorted.forEach(champ=>{
        const roleFilter = getCurrentRoleFilter();
        if(roleFilter !== "All" && !champ.roleLabel.includes(roleFilter)) return;

        const card = document.createElement("div");
        card.className = "poolChamp" + (champ.enabled ? "" : " disabled");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = champ.enabled;

        // Optimized Toggle
        checkbox.onchange = () => {
            champ.enabled = checkbox.checked;
            // Update UI without rebuilding everything
            card.classList.toggle("disabled", !champ.enabled);
            save();
            startMatch();
            drawTierLists();
            updateProgress();
            updateStabilityDisplay();
            updatePoolCounter();
        };
        card.onclick = (e) => {

            // prevent double trigger if checkbox itself was clicked
            if(e.target === checkbox) return;

            champ.enabled = !champ.enabled;
            checkbox.checked = champ.enabled;

            card.classList.toggle("disabled", !champ.enabled);

            save();
            startMatch();
            drawTierLists();
            updateProgress();
            updateStabilityDisplay();
            updatePoolCounter();
        };

        const img = document.createElement("img");
        img.src = champ.image;
        const name = document.createElement("div");
        name.textContent = champ.name;

        card.appendChild(checkbox);
        card.appendChild(img);
        card.appendChild(name);
        container.appendChild(card);
    });
}

/* ---------- SELECT ALL / NONE ---------- */

/* ---------- SELECT ALL / NONE (VISIBLE ONLY) ---------- */

function setAllChampions(enabled){

    const roleFilter = getCurrentRoleFilter();

    let changed = false;

    champions.forEach(champ => {

        if(roleFilter !== "All" &&
           !champ.roleLabel.includes(roleFilter)){
            return;
        }

        if(champ.enabled !== enabled){
            champ.enabled = enabled;
            changed = true;
        }
    });

    if(!changed) return;

    save();

    startMatch();
    drawTierLists();
    updateProgress();
    updateStabilityDisplay();
    drawChampionPool();
    updatePoolCounter();
}

function highlightActiveRole(){

    const roleFilter = getCurrentRoleFilter();

    document.querySelectorAll("button[onclick^='setRoleFilter']").forEach(btn=>{
        btn.classList.remove("active");

        if(btn.textContent === roleFilter){
            btn.classList.add("active");
        }
    });
}

/* ---------- POOL COUNTER ---------- */

function updatePoolCounter(){

    const el = document.getElementById("poolCounter");
    if(!el) return;

    const roleFilter = getCurrentRoleFilter();

    const visible = champions.filter(c=>{
        if(roleFilter === "All") return true;
        return c.roleLabel.includes(roleFilter);
    });

    const enabledVisible = visible.filter(c=>c.enabled);

    const label = roleFilter === "All"
        ? "All Pool"
        : roleFilter + " Pool";

    el.textContent =
        `${label}: ${enabledVisible.length} / ${visible.length} selected`;
}

/* ---------- TOGGLE TIERLIST ---------- */

function toggleTierList(){
    const tiers = document.getElementById("tiers");

    if(tiers.style.display === "none"){
        tiers.style.display = "flex";
    } else {
        tiers.style.display = "none";
    }
}

/* ---------- SAVE / RESET ---------- */

function save(){
    localStorage.setItem(getSlotKey(), JSON.stringify(champions));
}

function resetAll(){
    if (!confirm(`Reset Slot ${currentSlot}?`)) return;

    // ⭐ reset stats BUT keep selection
    champions.forEach(c => {
        c.mu = 1200;
        c.sigma = 350;
        c.games = 0;
        c.wins = 0;
        c.isNew = false;
        // ⭐ IMPORTANT: DO NOT TOUCH c.enabled
    });

    // ⭐ clear matchmaking memory
    recentMatches = [];
    recentChampions = [];

    save();

    startMatch();
    drawTierLists();
    updateProgress();
    updateStabilityDisplay();
    updatePoolCounter();
}

function highlightActiveSlot(){

    document.querySelectorAll(".slotBtn").forEach(btn=>{
        btn.classList.remove("active");

        if(Number(btn.dataset.slot) === currentSlot){
            btn.classList.add("active");
        }
    });

}

/* ---------- START ---------- */

(async function(){
    await loadChampions();
    highlightActiveSlot();
    highlightActiveRole();
})();