/* RadarBR — Imóveis Module: Listing, Filters, On-Click Entorno POIs, Data Analysis, 4-Mode Route Simulator & Personal Routine (localStorage) */
(() => {
  "use strict";

  const STORAGE_KEYS = {
    prefs: "radarbr_imoveis_prefs_v1",
    routine: "radarbr_routine_v1",
  };

  const RADIUS_STEPS = [
    { val: 500, label: "500m" },
    { val: 1000, label: "1km" },
    { val: 2000, label: "2km" },
    { val: 5000, label: "5km" },
  ];

  // Utility POI categories (US Rent-site style: Municipal/State/Private Schools, Churches, Markets, Health, etc.)
  const POI_CATEGORIES = {
    escola_municipal: {
      id: "escola_municipal",
      label: "Esc. Municipal",
      plural: "Escolas Municipais",
      color: "#2563eb",
      weight: 10,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>`,
    },
    escola_estadual: {
      id: "escola_estadual",
      label: "Esc. Estadual",
      plural: "Escolas Estaduais",
      color: "#4f46e5",
      weight: 10,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 20V9l7-4 7 4v11"/><path d="M9 20v-5h6v5"/></svg>`,
    },
    escola_particular: {
      id: "escola_particular",
      label: "Esc. Particular",
      plural: "Escolas Particulares",
      color: "#7c3aed",
      weight: 10,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-4 10 4-10 4-10-4z"/><path d="M12 13v7M7 11.5V17c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5.5"/></svg>`,
    },
    igreja: {
      id: "igreja",
      label: "Igrejas",
      plural: "Igrejas & Templos",
      color: "#9333ea",
      weight: 8,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v5M9.5 5.5h5M5 21V11l7-4 7 4v10H5z"/><path d="M10 21v-5h4v5"/></svg>`,
    },
    mercado: {
      id: "mercado",
      label: "Mercados",
      plural: "Mercados & Supermercados",
      color: "#15803d",
      weight: 18,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M3 4h2.5l2.2 10.5h10.8l2-7.5H6.5"/></svg>`,
    },
    farmacia: {
      id: "farmacia",
      label: "Farmácias",
      plural: "Farmácias",
      color: "#0d9488",
      weight: 12,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>`,
    },
    saude: {
      id: "saude",
      label: "Saúde",
      plural: "Hospitais & UPAs",
      color: "#dc2626",
      weight: 12,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.7-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 10c0 5.3-7 10-7 10z"/><path d="M12 8v5M9.5 10.5h5"/></svg>`,
    },
    parque: {
      id: "parque",
      label: "Parques",
      plural: "Parques & Praças",
      color: "#059669",
      weight: 10,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-7M7 14l5-9 5 9H7z"/><path d="M9 10l3-6 3 6"/></svg>`,
    },
    academia: {
      id: "academia",
      label: "Academias",
      plural: "Academias",
      color: "#ea580c",
      weight: 6,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9v6M18 9v6M3 10.5v3M21 10.5v3M6 12h12"/></svg>`,
    },
    padaria: {
      id: "padaria",
      label: "Padarias",
      plural: "Padarias & Cafés",
      color: "#b45309",
      weight: 7,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-4z"/><path d="M16 12h2a2.5 2.5 0 0 1 0 5h-2"/></svg>`,
    },
    pet: {
      id: "pet",
      label: "Pet",
      plural: "Áreas Pet & Vet",
      color: "#db2777",
      weight: 5,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="9" r="1.5"/><circle cx="11" cy="6.5" r="1.5"/><circle cx="15" cy="7.5" r="1.5"/><circle cx="17.5" cy="11" r="1.5"/><path d="M9 14.5c0-2 1.8-3.5 3.5-3.5s3.5 1.5 3.5 3.5c0 2.5-1.4 3.5-3.5 3.5S9 17 9 14.5z"/></svg>`,
    },
  };

  const ROUTINE_TYPES = {
    trabalho: { label: "Trabalho", color: "#0369a1", emoji: "💼" },
    casa: { label: "Onde moro", color: "#0f766e", emoji: "🏠" },
    escola: { label: "Escola", color: "#be185d", emoji: "🎓" },
    outro: { label: "Local", color: "#4338ca", emoji: "📍" },
  };

  const TRAVEL_MODES = {
    car: { id: "car", label: "Carro", emoji: "🚗", osrmProfile: "driving", kmh: 34, roadFactor: 1.28, color: "#1d4ed8" },
    moto: { id: "moto", label: "Moto", emoji: "🏍️", osrmProfile: "driving", kmh: 41, roadFactor: 1.25, color: "#ea580c" },
    bike: { id: "bike", label: "Bike", emoji: "🚲", osrmProfile: "cycling", kmh: 15, roadFactor: 1.22, color: "#059669" },
    walk: { id: "walk", label: "A pé", emoji: "🚶", osrmProfile: "walking", kmh: 4.8, roadFactor: 1.18, color: "#7c3aed" },
  };

  const imv = {
    citySlug: "campo-grande-ms",
    cityMeta: null,
    cityGeo: null,
    houses: [],
    pois: [],
    ciclovias: [],

    // Filters
    query: "",
    finalidade: "todas", // "todas" | "aluguel" | "compra"
    tipoQuick: "", // "" | "casa" | "apto" | "chacara"
    sort: "novas",
    onlyNovas: false,
    onlyPets: false,
    onlyQuintal: false,
    onlyMoveis: false,
    onlyFavs: false,
    onlyHidden: false,
    savedFilter: "all",
    priceMin: null,
    priceMax: null,
    minQuartos: 0,
    minBanheiros: 0,
    minVagas: 0,
    bairroFilter: "",

    // Selection & Entorno (POIs stay HIDDEN until selectedHouseId is set!)
    selectedHouseId: null,
    safetyFloatCollapsed: false,
    radiusMeters: 2000,
    activePoiCats: new Set(Object.keys(POI_CATEGORIES)),
    showRoutinePins: true,
    showCiclovias: false,

    // Gallery & Lightbox
    galleryIdx: 0,
    lightboxPhotos: [],
    lightboxIdx: 0,

    // Route Simulation
    sim: null, // { houseId, targetId, targetName, targetLat, targetLng, mode: 'car'|'moto'|'bike'|'walk', routesByProfile, loading, animating, progress }
    routeCache: new Map(),

    // Pick-on-map for Personal Routine
    pickingRoutineOnMap: false,

    // User prefs & Routine (localStorage)
    prefs: {}, // { [citySlug]: { favs:[], hidden:[], compare:[], status:{}, notes:{} } }
    routines: {}, // { [citySlug]: [ { id, tipo, nome, endereco, lat, lng } ] }
  };

  // Leaflet layers (owned by Imóveis module)
  let houseLayer = null;
  let radiusLayer = null;
  let poiLayer = null;
  let cicloviaLayer = null;
  let routineLayer = null;
  let routeLayer = null;
  let animMarker = null;
  let animFrameId = null;
  const houseMarkers = new Map();
  let simReqSeq = 0;

  // ==================== STORAGE ====================
  function loadStorage() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.prefs);
      if (p) imv.prefs = JSON.parse(p) || {};
    } catch {
      imv.prefs = {};
    }
    try {
      const r = localStorage.getItem(STORAGE_KEYS.routine);
      if (r) imv.routines = JSON.parse(r) || {};
    } catch {
      imv.routines = {};
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(imv.prefs));
    } catch {}
  }

  function saveRoutines() {
    try {
      localStorage.setItem(STORAGE_KEYS.routine, JSON.stringify(imv.routines));
    } catch {}
  }

  function getCityPrefs() {
    if (!imv.prefs[imv.citySlug]) {
      imv.prefs[imv.citySlug] = { favs: [], hidden: [], compare: [], status: {}, notes: {} };
    }
    const p = imv.prefs[imv.citySlug];
    if (!Array.isArray(p.favs)) p.favs = [];
    if (!Array.isArray(p.hidden)) p.hidden = [];
    if (!Array.isArray(p.compare)) p.compare = [];
    if (!p.status) p.status = {};
    if (!p.notes) p.notes = {};
    return p;
  }

  function getCityRoutines() {
    if (!Array.isArray(imv.routines[imv.citySlug])) {
      imv.routines[imv.citySlug] = [];
    }
    return imv.routines[imv.citySlug];
  }

  // ==================== GEO & FORMAT HELPERS ====================
  function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDist(meters) {
    if (!Number.isFinite(meters)) return "—";
    if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
  }

  function estimateModeMinutes(straightMeters, modeId, roadMetersOverride = null) {
    const m = TRAVEL_MODES[modeId] || TRAVEL_MODES.car;
    const roadMeters = roadMetersOverride ?? straightMeters * m.roadFactor;
    const mins = Math.max(1, Math.round((roadMeters / 1000 / m.kmh) * 60));
    return mins;
  }

  function formatMinutes(min) {
    if (!Number.isFinite(min)) return "—";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const rem = min % 60;
    return rem ? `${h}h${String(rem).padStart(2, "0")}` : `${h}h`;
  }

  function formatMoney(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return "Sob consulta";
    return "R$ " + Math.round(n).toLocaleString("pt-BR");
  }

  function formatShortPrice(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return "Consultar";
    if (n >= 1000000) return `R$ ${(n / 1000000).toFixed(2).replace(".", ",")}M`;
    if (n >= 10000) return `R$ ${Math.round(n / 1000)}k`;
    return `R$ ${Math.round(n).toLocaleString("pt-BR")}`;
  }

  function parseNumericPrice(raw) {
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
    if (!raw) return 0;
    const cleaned = String(raw).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  // ==================== DATA INGESTION & ENRICHMENT ====================
  function ingestPois(poisJson) {
    imv.pois = Array.isArray(poisJson?.pois)
      ? poisJson.pois
          .filter((p) => p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
          .map((p, idx) => ({
            id: String(p.id || `poi-${idx + 1}`),
            nome: String(p.nome || "Ponto de interesse"),
            categoria: POI_CATEGORIES[p.categoria] ? p.categoria : p.categoria === "cafe" ? "padaria" : "mercado",
            rede: String(p.rede || ""),
            lat: Number(p.lat),
            lng: Number(p.lng),
            detalhe: String(p.detalhe || ""),
          }))
      : [];
    imv.ciclovias = Array.isArray(poisJson?.ciclovias) ? poisJson.ciclovias : [];
  }

  function computeHouseEntorno(house) {
    // Nearby POIs sorted by distance
    const byCat = {};
    for (const catId of Object.keys(POI_CATEGORIES)) byCat[catId] = [];

    for (const p of imv.pois) {
      const dist = haversineMeters(house.lat, house.lng, p.lat, p.lng);
      if (byCat[p.categoria]) {
        byCat[p.categoria].push({ ...p, dist });
      }
    }

    let score = 0;
    let walkCount = 0;
    let schoolScore = 0;

    for (const [catId, list] of Object.entries(byCat)) {
      list.sort((a, b) => a.dist - b.dist);
      const nearest = list[0];
      const meta = POI_CATEGORIES[catId];
      if (nearest) {
        // Decay curve for US rent-site convenience score
        const factor =
          nearest.dist <= 600
            ? 1
            : nearest.dist <= 1200
            ? 0.78
            : nearest.dist <= 2000
            ? 0.55
            : nearest.dist <= 3500
            ? 0.3
            : 0.1;
        score += meta.weight * factor;
        if (nearest.dist <= 1000) walkCount++;
        if (catId.startsWith("escola_")) schoolScore += factor * 33.3;
      }
    }

    house.entornoByCat = byCat;
    house.entornoScore = Math.min(99, Math.max(18, Math.round(score)));
    house.walkScore = Math.min(99, Math.max(15, Math.round((walkCount / 8) * 100)));
    house.schoolScore = Math.min(99, Math.max(15, Math.round(schoolScore)));

    // Commutes to user's personal routine places
    const routines = getCityRoutines();
    house.commutes = routines.map((r) => {
      const dist = haversineMeters(house.lat, house.lng, r.lat, r.lng);
      return {
        id: r.id,
        tipo: r.tipo,
        nome: r.nome,
        endereco: r.endereco,
        lat: r.lat,
        lng: r.lng,
        dist,
        carMin: estimateModeMinutes(dist, "car"),
        motoMin: estimateModeMinutes(dist, "moto"),
        bikeMin: estimateModeMinutes(dist, "bike"),
        walkMin: estimateModeMinutes(dist, "walk"),
      };
    });
  }

  function recomputeAllEntornos() {
    for (const h of imv.houses) computeHouseEntorno(h);
  }

  function ingestHouses(casasJson) {
    const core = window.RadarBR;
    const rawList = Array.isArray(casasJson)
      ? casasJson
      : Array.isArray(casasJson?.casas)
      ? casasJson.casas
      : Array.isArray(casasJson?.imoveis)
      ? casasJson.imoveis
      : [];

    const normalized = rawList
      .filter((x) => x && typeof x === "object")
      .map((raw, idx) => {
        const coords = core.resolveCoords(raw, idx + 30000, "house");
        const fin = core.normalizeText(raw.finalidade || "").includes("comp") || core.normalizeText(raw.finalidade || "").includes("vend")
          ? "compra"
          : "aluguel";
        const preco = parseNumericPrice(raw.preco);
        const condominio = raw.condominio != null ? parseNumericPrice(raw.condominio) : null;
        const iptu = raw.iptu != null ? parseNumericPrice(raw.iptu) : null;
        const totalMensal = fin === "aluguel" ? preco + (condominio || 0) + (iptu || 0) : preco;
        const area = Number(raw.area_m2) > 0 ? Number(raw.area_m2) : null;
        const terreno = Number(raw.terreno_m2) > 0 ? Number(raw.terreno_m2) : null;
        const tipoStr = String(raw.tipo || (raw.chacara ? "Chácara" : raw.casa === false ? "Apartamento" : "Casa"));
        const tipoNorm = core.normalizeText(tipoStr);
        const isChacara = Boolean(raw.chacara) || tipoNorm.includes("chacara") || tipoNorm.includes("sitio") || tipoNorm.includes("fazenda");
        const isApto =
          raw.casa === false ||
          tipoNorm.includes("apartamento") ||
          tipoNorm.includes("apto") ||
          tipoNorm.includes("flat") ||
          tipoNorm.includes("kitnet") ||
          tipoNorm.includes("studio") ||
          tipoNorm.includes("cobertura");
        const fotos = Array.isArray(raw.fotos) ? raw.fotos.filter((f) => typeof f === "string" && f.trim()) : [];

        return {
          id: String(raw.id || `imv-${idx + 1}`),
          codigo: String(raw.codigo || ""),
          titulo: String(raw.titulo || `${tipoStr} em ${raw.bairro || imv.cityMeta?.nome || ""}`),
          finalidade: fin,
          tipo: tipoStr,
          isCasa: !isApto && !isChacara,
          isApto,
          isChacara,
          preco,
          condominio,
          iptu,
          totalMensal,
          pricePerM2: area && preco > 0 ? Math.round(preco / area) : null,
          bairro: String(raw.bairro || ""),
          endereco: String(raw.endereco || ""),
          lat: coords.lat,
          lng: coords.lng,
          precisao: coords.precisao,
          quartos: Number(raw.quartos) || 0,
          suites: Number(raw.suites) || 0,
          banheiros: Number(raw.banheiros) || 0,
          vagas: Number(raw.vagas) || 0,
          area_m2: area,
          terreno_m2: terreno,
          aceita_pets: Boolean(raw.aceita_pets),
          quintal: Boolean(raw.quintal),
          moveis: Boolean(raw.moveis || raw.mobiliada),
          nova: Boolean(raw.nova),
          destaque: Boolean(raw.destaque),
          descricao: String(raw.descricao || ""),
          nota_grokbot: String(raw.nota_grokbot || ""),
          tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
          fotos,
          link: typeof raw.link === "string" ? raw.link.trim() : "",
          portal: String(raw.portal || casasJson?.fonte || ""),
          encontrado_em: String(raw.encontrado_em || ""),
        };
      });

    // Slight spiral jitter for exact overlapping house coords
    const buckets = new Map();
    for (const h of normalized) {
      const k = `${h.lat.toFixed(4)},${h.lng.toFixed(4)}`;
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(h);
    }
    for (const g of buckets.values()) {
      if (g.length <= 1) continue;
      g.forEach((h, i) => {
        if (i === 0) return;
        const ang = ((i * 137.5) * Math.PI) / 180;
        const r = 0.00045 + Math.floor(i / 6) * 0.0003;
        h.lat = Number((h.lat + Math.sin(ang) * r).toFixed(5));
        h.lng = Number((h.lng + Math.cos(ang) * r).toFixed(5));
      });
    }

    imv.houses = normalized;
    recomputeAllEntornos();
    populateBairroFilter();
    populateSortOptions();
  }

  function populateBairroFilter() {
    const sel = document.getElementById("filterBairroSelect");
    if (!sel) return;
    const set = new Set(imv.houses.map((h) => h.bairro).filter(Boolean));
    const sorted = [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const cur = imv.bairroFilter;
    sel.innerHTML =
      `<option value="">Todos os bairros</option>` +
      sorted.map((b) => `<option value="${window.RadarBR.escapeHtml(b)}">${window.RadarBR.escapeHtml(b)}</option>`).join("");
    sel.value = set.has(cur) ? cur : "";
  }

  function populateSortOptions() {
    const sel = document.getElementById("imoveisSortSelect");
    if (!sel) return;
    const routines = getCityRoutines();
    const baseOpts = [
      { v: "novas", l: "Novidades primeiro" },
      { v: "score", l: "Melhor entorno (score)" },
      { v: "preco_asc", l: "Menor preço" },
      { v: "preco_desc", l: "Maior preço" },
      { v: "m2_asc", l: "Menor R$/m²" },
      { v: "area_desc", l: "Maior área" },
    ];
    const routineOpts = routines.map((r) => ({
      v: `routine:${r.id}`,
      l: `Perto de: ${r.nome}`,
    }));
    const all = [...routineOpts, ...baseOpts];
    sel.innerHTML = all.map((o) => `<option value="${window.RadarBR.escapeHtml(o.v)}">${window.RadarBR.escapeHtml(o.l)}</option>`).join("");
    if (all.some((o) => o.v === imv.sort)) sel.value = imv.sort;
    else {
      imv.sort = "novas";
      sel.value = "novas";
    }
  }

  // ==================== FILTERING & SORTING ====================
  function getFilteredHouses() {
    const core = window.RadarBR;
    const prefs = getCityPrefs();
    const isSavedView = !core.isDesktop() && core.getState().mobileView === "salvos";
    const q = core.normalizeText(imv.query);

    const list = imv.houses.filter((h) => {
      const isHidden = prefs.hidden.includes(h.id);
      const isFav = prefs.favs.includes(h.id);
      const status = prefs.status[h.id] || "";

      if (isSavedView) {
        if (imv.savedFilter === "ocultos") return isHidden;
        if (isHidden) return false;
        if (imv.savedFilter === "fav") return isFav;
        if (imv.savedFilter === "visitar") return status === "visitar";
        if (imv.savedFilter === "visitada") return status === "visitada";
        return isFav || Boolean(status) || Boolean(prefs.notes[h.id]);
      }

      if (imv.onlyHidden) {
        if (!isHidden) return false;
      } else if (isHidden) {
        return false;
      }

      if (imv.finalidade !== "todas" && h.finalidade !== imv.finalidade) return false;
      if (imv.tipoQuick === "casa" && !h.isCasa) return false;
      if (imv.tipoQuick === "apto" && !h.isApto) return false;
      if (imv.tipoQuick === "chacara" && !h.isChacara) return false;
      if (imv.onlyNovas && !h.nova) return false;
      if (imv.onlyPets && !h.aceita_pets) return false;
      if (imv.onlyQuintal && !h.quintal) return false;
      if (imv.onlyMoveis && !h.moveis) return false;
      if (imv.onlyFavs && !isFav) return false;

      if (imv.priceMin != null && h.preco < imv.priceMin) return false;
      if (imv.priceMax != null && h.preco > imv.priceMax) return false;
      if (imv.minQuartos > 0 && h.quartos < imv.minQuartos) return false;
      if (imv.minBanheiros > 0 && h.banheiros < imv.minBanheiros) return false;
      if (imv.minVagas > 0 && h.vagas < imv.minVagas) return false;
      if (imv.bairroFilter && core.normalizeText(h.bairro) !== core.normalizeText(imv.bairroFilter)) return false;

      if (q) {
        const hay = core.normalizeText(
          `${h.titulo} ${h.bairro} ${h.endereco} ${h.tipo} ${h.codigo} ${h.portal} ${h.descricao} ${h.tags.join(" ")}`
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (imv.sort.startsWith("routine:")) {
        const rid = imv.sort.slice(8);
        const da = a.commutes?.find((c) => c.id === rid)?.dist ?? 1e9;
        const db = b.commutes?.find((c) => c.id === rid)?.dist ?? 1e9;
        return da - db;
      }
      if (imv.sort === "score") return (b.entornoScore || 0) - (a.entornoScore || 0);
      if (imv.sort === "preco_asc") return (a.preco || 1e12) - (b.preco || 1e12);
      if (imv.sort === "preco_desc") return (b.preco || 0) - (a.preco || 0);
      if (imv.sort === "m2_asc") return (a.pricePerM2 || 1e12) - (b.pricePerM2 || 1e12);
      if (imv.sort === "area_desc") return (b.area_m2 || 0) - (a.area_m2 || 0);
      // Default: novas + destaque + recent
      if (a.nova !== b.nova) return a.nova ? -1 : 1;
      if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
      return (b.encontrado_em || "").localeCompare(a.encontrado_em || "");
    });

    return list;
  }

  function countAdvancedFilters() {
    let n = 0;
    if (imv.priceMin != null) n++;
    if (imv.priceMax != null) n++;
    if (imv.minQuartos > 0) n++;
    if (imv.minBanheiros > 0) n++;
    if (imv.minVagas > 0) n++;
    if (imv.bairroFilter) n++;
    return n;
  }

  function hasAnyFilter() {
    return (
      imv.query.trim() ||
      imv.finalidade !== "todas" ||
      imv.tipoQuick ||
      imv.onlyNovas ||
      imv.onlyPets ||
      imv.onlyQuintal ||
      imv.onlyMoveis ||
      imv.onlyFavs ||
      imv.onlyHidden ||
      countAdvancedFilters() > 0
    );
  }

  function resetImoveisFilters() {
    imv.query = "";
    imv.finalidade = "todas";
    imv.tipoQuick = "";
    imv.onlyNovas = false;
    imv.onlyPets = false;
    imv.onlyQuintal = false;
    imv.onlyMoveis = false;
    imv.onlyFavs = false;
    imv.onlyHidden = false;
    imv.priceMin = null;
    imv.priceMax = null;
    imv.minQuartos = 0;
    imv.minBanheiros = 0;
    imv.minVagas = 0;
    imv.bairroFilter = "";

    const si = document.getElementById("imoveisSearchInput");
    if (si) si.value = "";
    const cs = document.getElementById("clearImoveisSearchBtn");
    if (cs) cs.hidden = true;
    refreshAllImoveis();
  }

  // ==================== MAP LAYERS (CLEAN BY DEFAULT; POIs ONLY ON CLICK!) ====================
  function ensureLayers(map) {
    if (!map) return;
    if (!radiusLayer) radiusLayer = L.layerGroup().addTo(map);
    if (!cicloviaLayer) cicloviaLayer = L.layerGroup().addTo(map);
    if (!routeLayer) routeLayer = L.layerGroup().addTo(map);
    if (!poiLayer) poiLayer = L.layerGroup().addTo(map);
    if (!routineLayer) routineLayer = L.layerGroup().addTo(map);
    if (!houseLayer) houseLayer = L.layerGroup().addTo(map);
  }

  function clearAllImoveisLayers() {
    if (houseLayer) houseLayer.clearLayers();
    if (poiLayer) poiLayer.clearLayers();
    if (radiusLayer) radiusLayer.clearLayers();
    if (cicloviaLayer) cicloviaLayer.clearLayers();
    if (routineLayer) routineLayer.clearLayers();
    clearRouteSimulation();
    houseMarkers.clear();
  }

  function renderHousePins(visibleList) {
    const core = window.RadarBR;
    const map = core.getMap();
    if (!map || core.getState().mainTab !== "imoveis") return;
    ensureLayers(map);

    houseLayer.clearLayers();
    houseMarkers.clear();

    for (const h of visibleList) {
      const isSelected = h.id === imv.selectedHouseId;
      const priceTxt = formatShortPrice(h.preco);
      const novaStar = h.nova ? `<span class="house-pin__star">★</span>` : "";
      const icon = L.divIcon({
        className: "house-pin-wrap",
        html: `<div class="house-pin ${h.nova ? "house-pin--nova" : ""} ${isSelected ? "is-selected" : ""}" data-pin-id="${core.escapeHtml(h.id)}"><span class="house-pin__dot"></span>${novaStar}<span>${core.escapeHtml(priceTxt)}</span></div>`,
        iconSize: [0, 0],
      });
      const marker = L.marker([h.lat, h.lng], {
        icon,
        zIndexOffset: isSelected ? 700 : h.nova ? 300 : 150,
      }).addTo(houseLayer);

      marker.on("click", () => selectHouse(h.id, { openDrawer: true, fly: true }));
      houseMarkers.set(h.id, { marker, house: h });
    }
  }

  // ONLY render POIs, radius circle, and routine pins when a house is clicked/selected!
  function renderSelectedEntornoOnMap() {
    const core = window.RadarBR;
    const map = core.getMap();
    if (!map) return;
    ensureLayers(map);

    poiLayer.clearLayers();
    radiusLayer.clearLayers();
    cicloviaLayer.clearLayers();
    routineLayer.clearLayers();

    const poiDock = document.getElementById("poiLayerDock");
    const radiusGroup = document.getElementById("radiusPillGroup");
    const cycleRadiusBtn = document.getElementById("cycleRadiusBtn");
    const mapHint = document.getElementById("imoveisMapHint");

    if (core.getState().mainTab !== "imoveis") {
      if (poiDock) poiDock.hidden = true;
      return;
    }

    const house = imv.houses.find((h) => h.id === imv.selectedHouseId);
    if (!house) {
      // Keep map 100% clean when no property is selected!
      if (poiDock) poiDock.hidden = true;
      if (radiusGroup) radiusGroup.hidden = true;
      if (cycleRadiusBtn) cycleRadiusBtn.hidden = true;
      if (mapHint) {
        mapHint.textContent = "Clique em um imóvel para ver escolas, igrejas, mercados e simular rotas";
      }
      return;
    }

    // Show radius controls & POI filter dock
    if (poiDock) poiDock.hidden = false;
    if (radiusGroup) radiusGroup.hidden = false;
    if (cycleRadiusBtn) cycleRadiusBtn.hidden = false;

    // 1. Radius circle around selected property
    L.circle([house.lat, house.lng], {
      radius: imv.radiusMeters,
      color: "#15803d",
      weight: 1.8,
      dashArray: "6 6",
      fillColor: "#22c55e",
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(radiusLayer);

    // 2. Nearby POIs within radius
    const catCounts = {};
    let totalShownPois = 0;

    for (const [catId, list] of Object.entries(house.entornoByCat || {})) {
      const inRadius = list.filter((p) => p.dist <= imv.radiusMeters);
      catCounts[catId] = inRadius.length;
      if (!imv.activePoiCats.has(catId)) continue;

      const meta = POI_CATEGORIES[catId];
      for (const p of inRadius) {
        totalShownPois++;
        const icon = L.divIcon({
          className: "poi-pin-wrap",
          html: `<div class="poi-pin" style="background:${meta.color}" title="${core.escapeHtml(p.nome)} (${formatDist(p.dist)})">${meta.icon}</div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([p.lat, p.lng], { icon, zIndexOffset: 240 }).addTo(poiLayer);
        marker.bindPopup(() => createPoiPopupHtml(house, p, meta));
      }
    }

    // 3. Optional cycleways near selected property
    if (imv.showCiclovias) {
      for (const c of imv.ciclovias) {
        if (!Array.isArray(c.coords) || c.coords.length < 2) continue;
        L.polyline(c.coords, { color: "#059669", weight: 4, opacity: 0.75, dashArray: "8 5" })
          .bindPopup(`<div class="poi-popup"><h4 class="poi-popup__title">🚲 ${core.escapeHtml(c.nome)}</h4><p class="poi-popup__desc">${core.escapeHtml(c.detalhe || "")}</p></div>`)
          .addTo(cicloviaLayer);
      }
    }

    // 4. User's personal routine pins (Trabalho, Onde moro, Escola...)
    const routines = getCityRoutines();
    if (imv.showRoutinePins && routines.length) {
      for (const r of routines) {
        const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
        const dist = haversineMeters(house.lat, house.lng, r.lat, r.lng);
        const icon = L.divIcon({
          className: "routine-pin-wrap",
          html: `<div class="routine-pin" style="background:${meta.color}"><span>${meta.emoji}</span><span>${core.escapeHtml(r.nome)}</span></div>`,
          iconSize: [0, 0],
        });
        const m = L.marker([r.lat, r.lng], { icon, zIndexOffset: 520 }).addTo(routineLayer);
        m.bindPopup(() => createRoutinePopupHtml(house, r, dist));
      }
    }

    if (mapHint) {
      mapHint.textContent = `Entorno em ${formatDist(imv.radiusMeters)}: ${totalShownPois} utilidades visíveis`;
    }

    renderPoiDockBar(catCounts, routines.length);
  }

  function createPoiPopupHtml(house, poi, meta) {
    const core = window.RadarBR;
    const car = estimateModeMinutes(poi.dist, "car");
    const moto = estimateModeMinutes(poi.dist, "moto");
    const bike = estimateModeMinutes(poi.dist, "bike");
    const walk = estimateModeMinutes(poi.dist, "walk");

    const wrap = document.createElement("div");
    wrap.className = "poi-popup";
    wrap.innerHTML = `
      <span class="poi-popup__cat" style="background:${meta.color}">${core.escapeHtml(meta.label)} · ${formatDist(poi.dist)}</span>
      <h4 class="poi-popup__title">${core.escapeHtml(poi.nome)}</h4>
      ${poi.detalhe ? `<p class="poi-popup__desc">${core.escapeHtml(poi.detalhe)}</p>` : ""}
      <div class="poi-popup__times">
        <span>🚗 ${formatMinutes(car)}</span>
        <span>🏍️ ${formatMinutes(moto)}</span>
        <span>🚲 ${formatMinutes(bike)}</span>
        <span>🚶 ${formatMinutes(walk)}</span>
      </div>
      <button type="button" class="poi-popup__btn">Simular rota até aqui</button>
    `;
    wrap.querySelector(".poi-popup__btn").addEventListener("click", () => {
      simulateRoute(house.id, {
        id: poi.id,
        nome: poi.nome,
        lat: poi.lat,
        lng: poi.lng,
        tipoLabel: meta.label,
      });
    });
    return wrap;
  }

  function createRoutinePopupHtml(house, r, dist) {
    const core = window.RadarBR;
    const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
    const wrap = document.createElement("div");
    wrap.className = "poi-popup";
    wrap.innerHTML = `
      <span class="poi-popup__cat" style="background:${meta.color}">${meta.emoji} ${core.escapeHtml(meta.label)} · ${formatDist(dist)}</span>
      <h4 class="poi-popup__title">${core.escapeHtml(r.nome)}</h4>
      ${r.endereco ? `<p class="poi-popup__desc">${core.escapeHtml(r.endereco)}</p>` : ""}
      <div class="poi-popup__times">
        <span>🚗 ${formatMinutes(estimateModeMinutes(dist, "car"))}</span>
        <span>🏍️ ${formatMinutes(estimateModeMinutes(dist, "moto"))}</span>
        <span>🚲 ${formatMinutes(estimateModeMinutes(dist, "bike"))}</span>
        <span>🚶 ${formatMinutes(estimateModeMinutes(dist, "walk"))}</span>
      </div>
      <button type="button" class="poi-popup__btn">Simular rota (Carro/Moto/Bike/A pé)</button>
    `;
    wrap.querySelector(".poi-popup__btn").addEventListener("click", () => {
      simulateRoute(house.id, { id: r.id, nome: r.nome, lat: r.lat, lng: r.lng, tipoLabel: meta.label });
    });
    return wrap;
  }

  function renderPoiDockBar(catCounts, routineCount) {
    const bar = document.getElementById("poiLayerBar");
    if (!bar) return;
    const core = window.RadarBR;

    const parts = Object.values(POI_CATEGORIES).map((meta) => {
      const cnt = catCounts[meta.id] || 0;
      const on = imv.activePoiCats.has(meta.id);
      return `
        <button type="button" class="cat-toggle ${on ? "is-on" : ""}" data-poi-cat="${meta.id}" aria-pressed="${on}">
          <span class="cat-toggle__dot" style="background:${meta.color}">${meta.icon}</span>
          <span>${core.escapeHtml(meta.label)}</span>
          <span class="cat-toggle__count" style="background:${meta.color}22;color:${meta.color}">${cnt}</span>
        </button>
      `;
    });

    if (routineCount > 0) {
      parts.unshift(`
        <button type="button" class="cat-toggle ${imv.showRoutinePins ? "is-on" : ""}" id="toggleRoutinePinsBtn">
          <span class="cat-toggle__dot" style="background:#0369a1">📍</span>
          <span>Meus Locais</span>
          <span class="cat-toggle__count" style="background:#0369a122;color:#0369a1">${routineCount}</span>
        </button>
      `);
    }

    parts.push(`
      <button type="button" class="cat-toggle" id="clearSelectedHouseBtn" title="Ocultar pins de entorno e limpar seleção">
        <span>✕ Limpar entorno</span>
      </button>
    `);

    bar.innerHTML = parts.join("");

    bar.querySelectorAll("[data-poi-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.poiCat;
        if (imv.activePoiCats.has(id)) imv.activePoiCats.delete(id);
        else imv.activePoiCats.add(id);
        renderSelectedEntornoOnMap();
      });
    });

    const rb = document.getElementById("toggleRoutinePinsBtn");
    if (rb) {
      rb.addEventListener("click", () => {
        imv.showRoutinePins = !imv.showRoutinePins;
        renderSelectedEntornoOnMap();
      });
    }

    const cb = document.getElementById("clearSelectedHouseBtn");
    if (cb) {
      cb.addEventListener("click", () => closeDetailDrawer(true));
    }
  }

  function setRadius(meters) {
    imv.radiusMeters = meters;
    const step = RADIUS_STEPS.find((s) => s.val === meters) || RADIUS_STEPS[2];
    const lbl = document.getElementById("cycleRadiusLabel");
    if (lbl) lbl.textContent = step.label;
    document.querySelectorAll("[data-radius]").forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.radius) === meters);
    });
    renderSelectedEntornoOnMap();
    if (imv.selectedHouseId) renderDetailDrawerBody();
  }

  // ==================== LISTING & CAROUSEL RENDERING ====================
  function renderRoutineStrip() {
    const strip = document.getElementById("imoveisRoutineStrip");
    const badge = document.getElementById("routineCountBadge");
    const routines = getCityRoutines();
    const core = window.RadarBR;

    if (badge) {
      badge.textContent = String(routines.length);
      badge.hidden = routines.length === 0;
    }

    if (!strip) return;
    if (routines.length === 0) {
      strip.innerHTML = `
        <button type="button" class="routine-mini-pill routine-mini-pill--add" id="stripAddRoutineBtn">
          + Adicionar Trabalho, Casa ou Escola para simular tempos
        </button>
      `;
    } else {
      strip.innerHTML =
        routines
          .map((r) => {
            const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
            return `<button type="button" class="routine-mini-pill" data-open-routine>${meta.emoji} ${core.escapeHtml(r.nome)}</button>`;
          })
          .join("") +
        `<button type="button" class="routine-mini-pill routine-mini-pill--add" id="stripAddRoutineBtn">+ Editar</button>`;
    }

    const addBtn = document.getElementById("stripAddRoutineBtn");
    if (addBtn) addBtn.addEventListener("click", openRoutineModal);
    strip.querySelectorAll("[data-open-routine]").forEach((b) => b.addEventListener("click", openRoutineModal));
  }

  function updateImoveisCounters(visibleList) {
    const prefs = getCityPrefs();
    const novasCount = imv.houses.filter((h) => h.nova && !prefs.hidden.includes(h.id)).length;
    const favCount = prefs.favs.filter((id) => imv.houses.some((h) => h.id === id)).length;
    const hiddenCount = prefs.hidden.filter((id) => imv.houses.some((h) => h.id === id)).length;

    document.querySelectorAll("[data-nova-count]").forEach((el) => (el.textContent = String(novasCount)));
    document.querySelectorAll("[data-fav-count]").forEach((el) => (el.textContent = String(favCount)));
    document.querySelectorAll("[data-hidden-count]").forEach((el) => (el.textContent = String(hiddenCount)));

    const novaChip = document.querySelector('[data-imv-toggle="novas"]');
    if (novaChip) novaChip.hidden = novasCount === 0;
    const hiddenChip = document.querySelector('[data-imv-toggle="ocultos"]');
    if (hiddenChip) hiddenChip.hidden = hiddenCount === 0;
    const savedHiddenPill = document.querySelector('[data-saved-filter="ocultos"]');
    if (savedHiddenPill) savedHiddenPill.hidden = hiddenCount === 0;

    const tabCnt = document.getElementById("tabImoveisCount");
    if (tabCnt) {
      tabCnt.textContent = String(visibleList.length);
      tabCnt.hidden = imv.houses.length === 0;
    }
    const navCnt = document.getElementById("navImoveisCount");
    if (navCnt) {
      navCnt.textContent = String(visibleList.length);
      navCnt.hidden = imv.houses.length === 0;
    }

    const savedDot = document.getElementById("navSavedDot");
    if (savedDot) savedDot.hidden = favCount === 0 && Object.keys(prefs.status).length === 0;

    const cmpCount = prefs.compare.filter((id) => imv.houses.some((h) => h.id === id)).length;
    const cmpBtn = document.getElementById("compareOpenBtn");
    const cmpBadge = document.getElementById("compareCount");
    const mobCmpBtn = document.getElementById("mobileCompareBtn");
    const mobCmpBadge = document.getElementById("mobileCompareCount");
    if (cmpBadge) cmpBadge.textContent = String(cmpCount);
    if (cmpBtn) cmpBtn.hidden = cmpCount === 0;
    if (mobCmpBadge) mobCmpBadge.textContent = String(cmpCount);
    if (mobCmpBtn) mobCmpBtn.hidden = cmpCount === 0;

    const advCnt = countAdvancedFilters();
    const fBadge = document.getElementById("imoveisFilterBadge");
    if (fBadge) {
      fBadge.textContent = String(advCnt);
      fBadge.hidden = advCnt === 0;
    }

    const resEl = document.getElementById("imoveisResultsCount");
    if (resEl) {
      const total = imv.houses.length;
      resEl.textContent =
        total === 0
          ? `Nenhum imóvel em ${imv.cityMeta?.nome || "cidade"}`
          : visibleList.length === total
          ? `${total} ${total === 1 ? "imóvel" : "imóveis"} em ${imv.cityMeta?.nome || ""}`
          : `Mostrando ${visibleList.length} de ${total} imóveis`;
    }

    const resetBtn = document.getElementById("resetImoveisFiltersBtn");
    if (resetBtn) resetBtn.hidden = !hasAnyFilter();
  }

  function renderListings(visibleList) {
    const core = window.RadarBR;
    const prefs = getCityPrefs();
    const container = document.getElementById("listingsContainer");
    const emptyEl = document.getElementById("imoveisEmptyState");
    if (!container) return;

    if (visibleList.length === 0) {
      container.innerHTML = "";
      if (emptyEl) {
        emptyEl.hidden = false;
        const t = document.getElementById("imoveisEmptyTitle");
        const d = document.getElementById("imoveisEmptyDesc");
        if (imv.houses.length === 0) {
          if (t) t.textContent = `Sem imóveis carregados em ${imv.cityMeta?.nome || ""}`;
          if (d) d.textContent = `Os dados de imóveis serão exibidos aqui assim que data/${imv.citySlug}/casas.json for atualizado.`;
        } else {
          if (t) t.textContent = "Nenhum imóvel com esses filtros";
          if (d) d.textContent = "Tente limpar algum filtro ou ampliar a busca.";
        }
      }
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    container.innerHTML = visibleList
      .map((h) => {
        const isFav = prefs.favs.includes(h.id);
        const isCmp = prefs.compare.includes(h.id);
        const isSel = h.id === imv.selectedHouseId;
        const cover = h.fotos[0] || "";
        const specs = [];
        if (h.quartos) specs.push(`${h.quartos} qto${h.quartos > 1 ? "s" : ""}${h.suites ? ` (${h.suites} suíte${h.suites > 1 ? "s" : ""})` : ""}`);
        if (h.banheiros) specs.push(`${h.banheiros} banh.`);
        if (h.vagas) specs.push(`${h.vagas} vaga${h.vagas > 1 ? "s" : ""}`);
        if (h.area_m2) specs.push(`${h.area_m2} m²`);
        if (h.terreno_m2 && h.terreno_m2 !== h.area_m2) specs.push(`Terreno ${h.terreno_m2} m²`);

        const extras = [];
        if (h.condominio) extras.push(`Cond. ${formatMoney(h.condominio)}`);
        if (h.iptu) extras.push(`IPTU ${formatMoney(h.iptu)}`);

        const commuteChips = (h.commutes || [])
          .slice(0, 2)
          .map((c) => {
            const meta = ROUTINE_TYPES[c.tipo] || ROUTINE_TYPES.outro;
            return `<span class="commute-chip">${meta.emoji} ${core.escapeHtml(c.nome)}: ${formatDist(c.dist)} · 🚗 ${c.carMin}m</span>`;
          })
          .join("");

        return `
          <article class="house-card ${isSel ? "is-selected" : ""}" data-house-id="${core.escapeHtml(h.id)}" role="listitem">
            <div class="house-card__media">
              ${
                cover
                  ? `<img src="${core.escapeHtml(cover)}" alt="${core.escapeHtml(h.titulo)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><div class="house-card__placeholder" hidden>🏠 ${core.escapeHtml(h.tipo)}</div>`
                  : `<div class="house-card__placeholder">🏠 ${core.escapeHtml(h.tipo)}</div>`
              }
              <div class="house-card__badges">
                <span class="h-badge h-badge--${h.finalidade}">${h.finalidade === "aluguel" ? "Aluguel" : "Venda"}</span>
                ${h.nova ? `<span class="h-badge h-badge--nova">★ Nova</span>` : ""}
              </div>
              <span class="h-badge h-badge--score" title="Índice de utilidades próximas (escolas, mercados, igrejas, saúde)">Entorno ${h.entornoScore}/100</span>
              ${h.fotos.length > 1 ? `<span class="h-badge h-badge--photos">📷 ${h.fotos.length}</span>` : ""}
              <div class="house-card__actions">
                <button type="button" class="card-act-btn ${isCmp ? "is-on" : ""}" data-act="compare" title="Comparar" aria-label="Comparar">
                  <svg viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="6" height="12" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="11.5" y="4" width="6" height="12" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>
                </button>
                <button type="button" class="card-act-btn ${isFav ? "is-fav" : ""}" data-act="fav" title="Favoritar" aria-label="Favoritar">
                  <svg viewBox="0 0 20 20" fill="${isFav ? "currentColor" : "none"}"><path d="M10 16.5C10 16.5 3.5 12.2 3.5 7.4C3.5 5.2 5.2 3.5 7.3 3.5C8.6 3.5 9.6 4.2 10 5.1C10.4 4.2 11.4 3.5 12.7 3.5C14.8 3.5 16.5 5.2 16.5 7.4C16.5 12.2 10 16.5 10 16.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div class="house-card__body">
              <div class="house-card__price-row">
                <span class="house-card__price">${formatMoney(h.preco)}${h.finalidade === "aluguel" ? `<small>/mês</small>` : ""}</span>
                ${h.pricePerM2 ? `<span class="house-card__ppm2">R$ ${h.pricePerM2.toLocaleString("pt-BR")}/m²</span>` : ""}
              </div>
              ${extras.length ? `<div class="house-card__extras">${core.escapeHtml(extras.join(" · "))}${h.finalidade === "aluguel" ? ` · Total ${formatMoney(h.totalMensal)}` : ""}</div>` : ""}
              <h3 class="house-card__title">${core.escapeHtml(h.titulo)}</h3>
              <p class="house-card__loc">${core.escapeHtml([h.bairro, h.endereco].filter(Boolean).join(" · ") || imv.cityMeta?.rotulo || "")}</p>
              ${specs.length ? `<div class="house-card__specs">${specs.map((s) => `<span>${core.escapeHtml(s)}</span>`).join("")}</div>` : ""}
              ${commuteChips ? `<div class="house-card__commutes">${commuteChips}</div>` : ""}
            </div>
          </article>
        `;
      })
      .join("");

    container.querySelectorAll(".house-card").forEach((card) => {
      const id = card.dataset.houseId;
      card.addEventListener("click", (e) => {
        const actBtn = e.target.closest("[data-act]");
        if (actBtn) {
          e.stopPropagation();
          if (actBtn.dataset.act === "fav") toggleFav(id);
          if (actBtn.dataset.act === "compare") toggleCompare(id);
          return;
        }
        selectHouse(id, { openDrawer: true, fly: true });
      });
      card.addEventListener("mouseenter", () => {
        const pin = document.querySelector(`.house-pin[data-pin-id="${CSS.escape(id)}"]`);
        if (pin) pin.classList.add("is-hovered");
      });
      card.addEventListener("mouseleave", () => {
        document.querySelectorAll(".house-pin.is-hovered").forEach((n) => n.classList.remove("is-hovered"));
      });
    });
  }

  function renderMobileCarousel(visibleList) {
    const wrap = document.getElementById("mapCarousel");
    if (!wrap) return;
    const core = window.RadarBR;
    if (visibleList.length === 0) {
      wrap.innerHTML = "";
      return;
    }
    wrap.innerHTML = visibleList
      .slice(0, 30)
      .map((h) => {
        const cover = h.fotos[0] || "";
        return `
          <div class="carousel-card ${h.id === imv.selectedHouseId ? "is-selected" : ""}" data-car-id="${core.escapeHtml(h.id)}">
            ${
              cover
                ? `<img class="carousel-card__img" src="${core.escapeHtml(cover)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
                : `<div class="carousel-card__img" style="display:grid;place-items:center;font-size:22px">🏠</div>`
            }
            <div class="carousel-card__info">
              <div class="carousel-card__price">${formatMoney(h.preco)}${h.finalidade === "aluguel" ? "/mês" : ""}</div>
              <div class="carousel-card__title">${core.escapeHtml(h.titulo)}</div>
              <div class="carousel-card__sub">${core.escapeHtml(h.bairro)} · Entorno ${h.entornoScore}/100</div>
            </div>
          </div>
        `;
      })
      .join("");

    wrap.querySelectorAll(".carousel-card").forEach((c) => {
      c.addEventListener("click", () => selectHouse(c.dataset.carId, { openDrawer: true, fly: true }));
    });
  }

  // ==================== DETAIL DRAWER + AMERICAN RENT-SITE DATA ANALYSIS ====================
  const VIOLENT_CRIME_TYPES = new Set(["homicidio", "roubo", "arma", "agressao", "violencia_sexual"]);
  const PROPERTY_CRIME_TYPES = new Set(["furto", "invasao", "veiculo"]);

  function computeSafetyAndTrafficAnalysis(house) {
    const core = window.RadarBR;
    const st = core.getState();
    const crimes = Array.isArray(st.crimes) ? st.crimes : [];
    const traffic = Array.isArray(st.traffic) ? st.traffic : [];
    const radiusM = 1500;
    const houseBairro = core.normalizeText(house.bairro || "");

    const nowMs = Date.now();
    const cutoff30 = nowMs - 30 * 86400000;

    const isNearHouse = (ev) => {
      const d = haversineMeters(house.lat, house.lng, ev.lat, ev.lng);
      if (d <= radiusM) return true;
      if (houseBairro && ev.bairro) {
        const eb = core.normalizeText(ev.bairro);
        if (eb && (eb === houseBairro || eb.includes(houseBairro) || houseBairro.includes(eb))) return true;
      }
      return false;
    };

    // Determine effective monitoring window (up to 30 days)
    const crimeWindowDays = 30;
    const nearCrimes30 = crimes.filter((c) => (!c.timestampMs || c.timestampMs >= cutoff30) && isNearHouse(c));
    const violent30 = nearCrimes30.filter((c) => VIOLENT_CRIME_TYPES.has(c.tipo));
    const prop30 = nearCrimes30.filter((c) => PROPERTY_CRIME_TYPES.has(c.tipo));

    let crimeLevel = "good";
    let crimeBadge = "Tranquilo";
    let crimeLead = "";
    let crimeSub = "";

    if (crimes.length === 0) {
      crimeBadge = "Sem dados";
      crimeLead = "Ainda não há registros policiais carregados para esta cidade.";
      crimeSub = "A análise será atualizada automaticamente quando o Radar receber ocorrências.";
    } else if (violent30.length === 0) {
      crimeLead = `A região não observou crimes violentos nos últimos ${crimeWindowDays} dias.`;
      if (nearCrimes30.length === 0) {
        crimeLevel = "good";
        crimeBadge = "Baixa incidência";
        crimeSub = `Nenhuma ocorrência policial registrada no bairro ou num raio de 1,5 km neste período.`;
      } else if (prop30.length <= 2) {
        crimeLevel = "good";
        crimeBadge = "Tranquilo";
        crimeSub = `${nearCrimes30.length} registro(s) de menor gravidade nas proximidades (${prop30.length} furto/patrimônio).`;
      } else {
        crimeLevel = "warn";
        crimeBadge = "Atenção moderada";
        crimeSub = `Atenção a patrimônio: ${prop30.length} registros de furto, invasão ou veículo nas proximidades em ${crimeWindowDays} dias.`;
      }
    } else if (violent30.length === 1) {
      crimeLevel = "warn";
      crimeBadge = "Atenção moderada";
      crimeLead = `A região registrou 1 crime violento nos últimos ${crimeWindowDays} dias.`;
      crimeSub =
        nearCrimes30.length > 1
          ? `Total de ${nearCrimes30.length} ocorrências policiais no bairro ou raio de 1,5 km (${prop30.length} de patrimônio).`
          : `Único registro policial na área imediata (raio de 1,5 km) neste período.`;
    } else {
      crimeLevel = "alert";
      crimeBadge = "Atenção";
      crimeLead = `Foram registrados ${violent30.length} crimes violentos nas proximidades nos últimos ${crimeWindowDays} dias.`;
      crimeSub = `Total de ${nearCrimes30.length} ocorrências no bairro/raio de 1,5 km (${prop30.length} furtos/invasões/veículos).`;
    }

    // Traffic analysis
    const validTrafficTs = traffic.map((t) => t.timestampMs).filter((ms) => Number.isFinite(ms) && ms > 0);
    const oldestTrafficDays = validTrafficTs.length
      ? Math.max(1, Math.min(30, Math.round((nowMs - Math.min(...validTrafficTs)) / 86400000)))
      : 30;
    const trafficWindowLabel = oldestTrafficDays < 20 ? `nos últimos ${oldestTrafficDays} dias monitorados` : `nos últimos 30 dias`;

    const nearTraffic = traffic.filter((t) => (!t.timestampMs || t.timestampMs >= cutoff30) && isNearHouse(t));
    const severeTraffic = nearTraffic.filter(
      (t) => t.tipo === "fatal" || t.tipo === "atropelamento" || t.gravidade === "fatal" || t.gravidade === "grave"
    );

    let trafficLevel = "good";
    let trafficBadge = "Trânsito calmo";
    let trafficLead = "";
    let trafficSub = "";

    if (traffic.length === 0) {
      trafficBadge = "Sem dados";
      trafficLead = "Ainda não há registros de trânsito carregados para esta cidade.";
      trafficSub = "Os indicadores viários aparecerão automaticamente após a coleta do Radar.";
    } else if (nearTraffic.length === 0) {
      trafficLevel = "good";
      trafficBadge = "Trânsito calmo";
      trafficLead = `A região não apresenta acidentes de trânsito registrados ${trafficWindowLabel}.`;
      trafficSub = `Nenhum acidente encontrado no bairro ou num raio de 1,5 km deste imóvel.`;
    } else if (nearTraffic.length <= 2 && severeTraffic.length === 0) {
      trafficLevel = "good";
      trafficBadge = "Poucos acidentes";
      trafficLead = `A região não apresenta muitos acidentes de trânsito (${nearTraffic.length} registro${nearTraffic.length > 1 ? "s" : ""} ${trafficWindowLabel}).`;
      trafficSub = `Sem registros de acidentes graves, fatais ou atropelamentos nas vias próximas.`;
    } else if (severeTraffic.length > 0) {
      trafficLevel = nearTraffic.length >= 4 || severeTraffic.length >= 2 ? "alert" : "warn";
      trafficBadge = "Atenção viária";
      trafficLead = `Foram registrados ${nearTraffic.length} acidentes nas vias próximas ${trafficWindowLabel}.`;
      trafficSub = `Inclui ${severeTraffic.length} ocorrência(s) grave(s)/fatal(is) ou atropelamento — atenção em avenidas e cruzamentos do entorno.`;
    } else {
      trafficLevel = "warn";
      trafficBadge = "Movimento moderado";
      trafficLead = `A região teve ${nearTraffic.length} acidentes de trânsito registrados ${trafficWindowLabel}.`;
      trafficSub = `Sem ocorrências graves/fatais no período, mas há fluxo viário ativo nas redondezas.`;
    }

    return {
      crimeLevel,
      crimeBadge,
      crimeLead,
      crimeSub,
      trafficLevel,
      trafficBadge,
      trafficLead,
      trafficSub,
      totalCrimesCity: crimes.length,
      totalTrafficCity: traffic.length,
    };
  }

  function computePriceBenchmark(house) {
    const sameFin = imv.houses.filter((h) => h.finalidade === house.finalidade && h.preco > 0);
    if (!sameFin.length || !house.preco) return null;

    const avgCityPrice = Math.round(sameFin.reduce((s, h) => s + h.preco, 0) / sameFin.length);
    const sameBairro = sameFin.filter(
      (h) => window.RadarBR.normalizeText(h.bairro) === window.RadarBR.normalizeText(house.bairro)
    );
    const avgBairroPrice =
      sameBairro.length >= 2
        ? Math.round(sameBairro.reduce((s, h) => s + h.preco, 0) / sameBairro.length)
        : null;

    const withM2 = sameFin.filter((h) => h.pricePerM2);
    const avgCityM2 = withM2.length ? Math.round(withM2.reduce((s, h) => s + h.pricePerM2, 0) / withM2.length) : null;

    const ref = avgBairroPrice || avgCityPrice;
    const diffPct = ref ? Math.round(((house.preco - ref) / ref) * 100) : 0;
    const pctPos = Math.min(100, Math.max(8, Math.round((house.preco / (ref * 1.6)) * 100)));

    return { avgCityPrice, avgBairroPrice, sameBairroCount: sameBairro.length, avgCityM2, diffPct, pctPos };
  }

  function selectHouse(id, { openDrawer = true, fly = true } = {}) {
    const house = imv.houses.find((h) => h.id === id);
    if (!house) return;
    imv.selectedHouseId = id;
    imv.galleryIdx = 0;

    clearRouteSimulation();
    renderHousePins(getFilteredHouses());
    renderSelectedEntornoOnMap();

    document.querySelectorAll(".house-card").forEach((c) => c.classList.toggle("is-selected", c.dataset.houseId === id));
    document.querySelectorAll(".carousel-card").forEach((c) => c.classList.toggle("is-selected", c.dataset.carId === id));

    const map = window.RadarBR.getMap();
    if (fly && map) {
      map.flyTo([house.lat, house.lng], Math.max(map.getZoom(), 14), { duration: 0.45 });
    }

    if (openDrawer) {
      openDetailDrawer();
    }
  }

  function openDetailDrawer() {
    const drawer = document.getElementById("detailDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (!drawer) return;
    renderDetailDrawerBody();
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.hidden = false;
  }

  function hideSafetyFloatingCard() {
    const card = document.getElementById("safetyFloatingCard");
    if (card) {
      card.hidden = true;
      card.innerHTML = "";
    }
  }

  function renderSafetyFloatingCard(house, safety) {
    const card = document.getElementById("safetyFloatingCard");
    if (!card) return;
    const core = window.RadarBR;
    if (!house || core.getState().mainTab !== "imoveis") {
      hideSafetyFloatingCard();
      return;
    }

    card.hidden = false;
    card.classList.toggle("is-collapsed", imv.safetyFloatCollapsed);

    card.innerHTML = `
      <div class="safety-float__head">
        <div class="safety-float__title">
          <strong>Análise Rápida · Segurança &amp; Trânsito</strong>
          <small>${core.escapeHtml(house.bairro || imv.cityMeta?.nome || "")} · Raio 1,5 km</small>
        </div>
        <button type="button" class="safety-float__toggle" id="safetyFloatToggleBtn" aria-expanded="${!imv.safetyFloatCollapsed}">
          ${imv.safetyFloatCollapsed ? "Expandir ▾" : "Recolher ▴"}
        </button>
      </div>
      <div class="safety-float__body">
        <div class="safety-grid">
          <div class="safety-card safety-card--${safety.crimeLevel}">
            <div class="safety-card__head">
              <span class="safety-card__title">🛡️ Segurança / Crimes</span>
              <span class="safety-pill safety-pill--${safety.crimeLevel}">${core.escapeHtml(safety.crimeBadge)}</span>
            </div>
            <p class="safety-card__lead">${core.escapeHtml(safety.crimeLead)}</p>
            <p class="safety-card__sub">${core.escapeHtml(safety.crimeSub)}</p>
          </div>

          <div class="safety-card safety-card--${safety.trafficLevel}">
            <div class="safety-card__head">
              <span class="safety-card__title">🚦 Trânsito &amp; Acidentes</span>
              <span class="safety-pill safety-pill--${safety.trafficLevel}">${core.escapeHtml(safety.trafficBadge)}</span>
            </div>
            <p class="safety-card__lead">${core.escapeHtml(safety.trafficLead)}</p>
            <p class="safety-card__sub">${core.escapeHtml(safety.trafficSub)}</p>
          </div>
        </div>
        <div class="safety-foot">
          <span>Dados do Radar (mapa limpo)</span>
          <button type="button" class="link-btn" id="safetyFloatOpenRadarBtn">Abrir Radar →</button>
        </div>
      </div>
    `;

    document.getElementById("safetyFloatToggleBtn")?.addEventListener("click", () => {
      imv.safetyFloatCollapsed = !imv.safetyFloatCollapsed;
      renderSafetyFloatingCard(house, safety);
    });
    document.getElementById("safetyFloatOpenRadarBtn")?.addEventListener("click", () => {
      core.setMainTab("radar", { fit: true });
    });
  }

  function closeDetailDrawer(clearSelection = true) {
    const drawer = document.getElementById("detailDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (drawer) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.hidden = true;

    if (clearSelection) {
      imv.selectedHouseId = null;
      hideSafetyFloatingCard();
      clearRouteSimulation();
      renderHousePins(getFilteredHouses());
      renderSelectedEntornoOnMap(); // Hides all POI pins again!
      document.querySelectorAll(".house-card.is-selected, .carousel-card.is-selected").forEach((el) => el.classList.remove("is-selected"));
    }
  }

  function renderDetailDrawerBody() {
    const core = window.RadarBR;
    const house = imv.houses.find((h) => h.id === imv.selectedHouseId);
    const body = document.getElementById("drawerBody");
    if (!house || !body) return;

    const prefs = getCityPrefs();
    const isFav = prefs.favs.includes(house.id);
    const isCmp = prefs.compare.includes(house.id);
    const isHidden = prefs.hidden.includes(house.id);
    const curStatus = prefs.status[house.id] || "";
    const curNote = prefs.notes[house.id] || "";

    const favBtn = document.getElementById("drawerFavBtn");
    if (favBtn) favBtn.classList.toggle("is-fav", isFav);
    const cmpBtn = document.getElementById("drawerCompareBtn");
    if (cmpBtn) cmpBtn.classList.toggle("is-on", isCmp);
    const hideBtn = document.getElementById("drawerHideBtn");
    if (hideBtn) hideBtn.classList.toggle("is-on", isHidden);

    // Gallery HTML
    const photos = house.fotos;
    const curPhoto = photos[imv.galleryIdx] || "";
    const galleryHtml = photos.length
      ? `
        <div class="detail-gallery">
          <img id="detailMainPhoto" src="${core.escapeHtml(curPhoto)}" alt="${core.escapeHtml(house.titulo)}" referrerpolicy="no-referrer">
          ${photos.length > 1 ? `<button type="button" class="detail-gallery__nav detail-gallery__nav--prev" id="detailPhotoPrev">‹</button><button type="button" class="detail-gallery__nav detail-gallery__nav--next" id="detailPhotoNext">›</button>` : ""}
          <span class="detail-gallery__counter">${imv.galleryIdx + 1} / ${photos.length}</span>
        </div>
      `
      : "";

    // Price Benchmark (American Rent-site analysis)
    const bench = computePriceBenchmark(house);
    const benchHtml = bench
      ? `
        <div class="price-bench">
          <div class="price-bench__row">
            <span>Este imóvel</span>
            <strong>${formatMoney(house.preco)}${house.pricePerM2 ? ` (${formatMoney(house.pricePerM2)}/m²)` : ""}</strong>
          </div>
          <div class="price-bench__bar"><div class="price-bench__fill" style="width:${bench.pctPos}%"></div></div>
          <div class="price-bench__row">
            <span>${bench.avgBairroPrice ? `Média em ${core.escapeHtml(house.bairro)} (${bench.sameBairroCount})` : `Média da cidade`}</span>
            <strong>${formatMoney(bench.avgBairroPrice || bench.avgCityPrice)}${bench.avgCityM2 ? ` · Cidade ${formatMoney(bench.avgCityM2)}/m²` : ""}</strong>
          </div>
          <div class="price-bench__verdict ${bench.diffPct > 12 ? "price-bench__verdict--high" : ""}">
            ${
              bench.diffPct <= -8
                ? `↓ ${Math.abs(bench.diffPct)}% abaixo da média ${bench.avgBairroPrice ? "do bairro" : "da cidade"}`
                : bench.diffPct >= 8
                ? `↑ ${bench.diffPct}% acima da média ${bench.avgBairroPrice ? "do bairro" : "da cidade"}`
                : `≈ Na média ${bench.avgBairroPrice ? "do bairro" : "da cidade"} (${bench.diffPct >= 0 ? "+" : ""}${bench.diffPct}%)`
            }
          </div>
        </div>
      `
      : "";

    // Commutes section (User's personal routine: Trabalho, Casa, Escola...)
    const routines = getCityRoutines();
    const commuteHtml = routines.length
      ? `
        <div class="commute-cards">
          ${(house.commutes || [])
            .map((c) => {
              const meta = ROUTINE_TYPES[c.tipo] || ROUTINE_TYPES.outro;
              return `
                <div class="commute-card">
                  <div class="commute-card__top">
                    <span class="commute-card__name">${meta.emoji} ${core.escapeHtml(c.nome)}</span>
                    <span class="commute-card__dist">${formatDist(c.dist)}</span>
                  </div>
                  <div class="commute-card__modes">
                    <button type="button" class="commute-mode-pill" data-sim-routine="${core.escapeHtml(c.id)}" data-sim-mode="car">🚗<strong>${formatMinutes(c.carMin)}</strong>Carro</button>
                    <button type="button" class="commute-mode-pill" data-sim-routine="${core.escapeHtml(c.id)}" data-sim-mode="moto">🏍️<strong>${formatMinutes(c.motoMin)}</strong>Moto</button>
                    <button type="button" class="commute-mode-pill" data-sim-routine="${core.escapeHtml(c.id)}" data-sim-mode="bike">🚲<strong>${formatMinutes(c.bikeMin)}</strong>Bike</button>
                    <button type="button" class="commute-mode-pill" data-sim-routine="${core.escapeHtml(c.id)}" data-sim-mode="walk">🚶<strong>${formatMinutes(c.walkMin)}</strong>A pé</button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `
      : `
        <div style="background:var(--sky-soft);border:1px dashed rgba(2,132,199,0.35);border-radius:12px;padding:12px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#0369a1;font-weight:600">Adicione seu Trabalho, Onde mora ou Escola para simular tempos de Carro, Moto, Bike e A pé!</p>
          <button type="button" class="btn-outline-emerald" id="drawerAddRoutineBtn">+ Adicionar Meus Locais</button>
        </div>
      `;

    // Nearby Utilities Breakdown (Escolas Municipais, Estaduais, Particulares, Igrejas, Mercados...)
    const nearbyGroupsHtml = Object.values(POI_CATEGORIES)
      .map((meta) => {
        const allCat = house.entornoByCat?.[meta.id] || [];
        const inRad = allCat.filter((p) => p.dist <= imv.radiusMeters);
        const topList = inRad.length ? inRad.slice(0, 3) : allCat.slice(0, 1);
        if (!topList.length) return "";
        return `
          <div class="nearby-group">
            <div class="nearby-group__head">
              <span class="nearby-group__badge">
                <span class="nearby-group__dot" style="background:${meta.color}">${meta.icon}</span>
                <span>${core.escapeHtml(meta.plural)}</span>
              </span>
              <span>${inRad.length > 0 ? `${inRad.length} em ${formatDist(imv.radiusMeters)}` : `Mais próx.: ${formatDist(topList[0].dist)}`}</span>
            </div>
            ${topList
              .map(
                (p) => `
              <div class="nearby-item">
                <div class="nearby-item__info">
                  <div class="nearby-item__name">${core.escapeHtml(p.nome)}</div>
                  <div class="nearby-item__meta">${formatDist(p.dist)} · 🚗 ${estimateModeMinutes(p.dist, "car")}m · 🚲 ${estimateModeMinutes(p.dist, "bike")}m · 🚶 ${estimateModeMinutes(p.dist, "walk")}m</div>
                </div>
                <button type="button" class="nearby-sim-btn" data-sim-poi="${core.escapeHtml(p.id)}">Simular</button>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      })
      .join("");

    const safety = computeSafetyAndTrafficAnalysis(house);
    renderSafetyFloatingCard(house, safety);
    const safetyHtml = `
      <div class="detail-sec detail-sec--safety">
        <h3 class="detail-sec__title">
          <span>Análise Rápida · Segurança &amp; Trânsito</span>
          <span>Raio 1,5 km / Bairro</span>
        </h3>
        <div class="safety-grid">
          <div class="safety-card safety-card--${safety.crimeLevel}">
            <div class="safety-card__head">
              <span class="safety-card__title">🛡️ Segurança / Crimes</span>
              <span class="safety-pill safety-pill--${safety.crimeLevel}">${core.escapeHtml(safety.crimeBadge)}</span>
            </div>
            <p class="safety-card__lead">${core.escapeHtml(safety.crimeLead)}</p>
            <p class="safety-card__sub">${core.escapeHtml(safety.crimeSub)}</p>
          </div>

          <div class="safety-card safety-card--${safety.trafficLevel}">
            <div class="safety-card__head">
              <span class="safety-card__title">🚦 Trânsito &amp; Acidentes</span>
              <span class="safety-pill safety-pill--${safety.trafficLevel}">${core.escapeHtml(safety.trafficBadge)}</span>
            </div>
            <p class="safety-card__lead">${core.escapeHtml(safety.trafficLead)}</p>
            <p class="safety-card__sub">${core.escapeHtml(safety.trafficSub)}</p>
          </div>
        </div>
        <div class="safety-foot">
          <span>Resumo baseado nos registros do Radar (sem exibir no mapa de imóveis)</span>
          <button type="button" class="link-btn" id="drawerOpenRadarBtn">Abrir Radar →</button>
        </div>
      </div>
    `;

    const descHtml =
      house.descricao || house.nota_grokbot || house.tags.length
        ? `
        <div class="detail-sec">
          <h3 class="detail-sec__title"><span>Descrição &amp; Detalhes</span></h3>
          ${house.nota_grokbot ? `<p style="margin:0 0 8px;padding:9px 11px;border-radius:10px;background:var(--emerald-soft);color:var(--emerald-dark);font-size:12px;font-weight:600">${core.escapeHtml(house.nota_grokbot)}</p>` : ""}
          ${house.descricao ? `<p style="margin:0 0 8px;font-size:12.5px;color:var(--ink-muted);line-height:1.5">${core.escapeHtml(house.descricao)}</p>` : ""}
          ${
            house.tags.length
              ? `<div style="display:flex;flex-wrap:wrap;gap:5px">${house.tags
                  .map((t) => `<span style="padding:3px 9px;border-radius:99px;background:var(--bg);border:1px solid var(--border);font-size:11px;font-weight:700;color:var(--ink-muted)">${core.escapeHtml(t)}</span>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      `
        : "";

    body.innerHTML = `
      ${galleryHtml}

      <div class="detail-sec">
        <div class="detail-price-box">
          <span class="detail-price">${formatMoney(house.preco)}${house.finalidade === "aluguel" ? `<small style="font-size:13px;font-weight:600;color:var(--ink-subtle)">/mês</small>` : ""}</span>
          <span class="h-badge h-badge--${house.finalidade}">${house.finalidade === "aluguel" ? "Aluguel" : "Venda"} · ${core.escapeHtml(house.tipo)}</span>
        </div>
        ${
          house.condominio || house.iptu
            ? `<div style="font-size:12px;color:var(--ink-muted);margin-top:2px">${[
                house.condominio ? `Condomínio ${formatMoney(house.condominio)}` : "",
                house.iptu ? `IPTU ${formatMoney(house.iptu)}` : "",
                house.finalidade === "aluguel" ? `Total ${formatMoney(house.totalMensal)}/mês` : "",
              ]
                .filter(Boolean)
                .join(" · ")}</div>`
            : ""
        }
        <h2 class="detail-title">${core.escapeHtml(house.titulo)}</h2>
        <p class="detail-addr">${core.escapeHtml([house.endereco, house.bairro, imv.cityMeta?.rotulo].filter(Boolean).join(" · "))}</p>

        <div class="detail-specs-grid">
          <div class="spec-tile"><strong>${house.quartos || "—"}</strong><span>Quartos${house.suites ? ` (${house.suites}s)` : ""}</span></div>
          <div class="spec-tile"><strong>${house.banheiros || "—"}</strong><span>Banheiros</span></div>
          <div class="spec-tile"><strong>${house.vagas || "—"}</strong><span>Vagas</span></div>
          <div class="spec-tile"><strong>${house.area_m2 ? `${house.area_m2}m²` : "—"}</strong><span>Área útil</span></div>
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          ${
            house.link
              ? `<a class="btn-emerald" style="flex:1" href="${core.escapeHtml(house.link)}" target="_blank" rel="noopener noreferrer">Abrir anúncio original ↗</a>`
              : ""
          }
          ${house.portal ? `<span class="btn-ghost-sm">${core.escapeHtml(house.portal)}${house.codigo ? ` · Ref ${core.escapeHtml(house.codigo)}` : ""}</span>` : ""}
        </div>
      </div>

      <div class="detail-sec">
        <h3 class="detail-sec__title">
          <span>Análise do Imóvel &amp; Entorno</span>
          <span>Raio: ${formatDist(imv.radiusMeters)}</span>
        </h3>
        <div class="analysis-score-row" style="margin-bottom:0">
          <div class="score-box">
            <div class="score-box__val">${house.entornoScore}<small>/100</small></div>
            <div class="score-box__lbl">Entorno Geral</div>
          </div>
          <div class="score-box">
            <div class="score-box__val">${house.walkScore}<small>/100</small></div>
            <div class="score-box__lbl">Caminhabilidade</div>
          </div>
          <div class="score-box">
            <div class="score-box__val">${house.schoolScore}<small>/100</small></div>
            <div class="score-box__lbl">Escolas próx.</div>
          </div>
        </div>
      </div>

      ${descHtml}

      <div class="detail-sec">
        ${benchHtml}
        <div class="nearby-groups">${nearbyGroupsHtml}</div>
      </div>

      ${safetyHtml}

      <div class="detail-sec">
        <h3 class="detail-sec__title">
          <span>Simulação da Sua Rotina</span>
          <button type="button" class="link-btn link-btn--emerald" id="drawerManageRoutineBtn">Gerenciar locais</button>
        </h3>
        ${commuteHtml}
      </div>

      <div class="detail-sec">
        <h3 class="detail-sec__title"><span>Minhas Anotações (salvas no navegador)</span></h3>
        <div class="status-pills">
          ${[
            { id: "", label: "Sem status" },
            { id: "visitar", label: "Quero visitar" },
            { id: "visitada", label: "Visitado" },
            { id: "descartada", label: "Descartado" },
          ]
            .map((s) => `<button type="button" class="status-pill ${curStatus === s.id ? "is-active" : ""}" data-house-status="${s.id}">${s.label}</button>`)
            .join("")}
        </div>
        <textarea class="notes-textarea" id="houseNoteInput" placeholder="Escreva suas anotações sobre este imóvel…">${core.escapeHtml(curNote)}</textarea>
      </div>
    `;

    // Bind gallery events
    const mainPhoto = document.getElementById("detailMainPhoto");
    if (mainPhoto) mainPhoto.addEventListener("click", () => openLightbox(photos, imv.galleryIdx));
    const prevBtn = document.getElementById("detailPhotoPrev");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        imv.galleryIdx = (imv.galleryIdx - 1 + photos.length) % photos.length;
        renderDetailDrawerBody();
      });
    }
    const nextBtn = document.getElementById("detailPhotoNext");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        imv.galleryIdx = (imv.galleryIdx + 1) % photos.length;
        renderDetailDrawerBody();
      });
    }

    // Bind routine & radar shortcut buttons
    const mgrBtn = document.getElementById("drawerManageRoutineBtn");
    if (mgrBtn) mgrBtn.addEventListener("click", openRoutineModal);
    const addBtn = document.getElementById("drawerAddRoutineBtn");
    if (addBtn) addBtn.addEventListener("click", openRoutineModal);
    const radarBtn = document.getElementById("drawerOpenRadarBtn");
    if (radarBtn) {
      radarBtn.addEventListener("click", () => {
        core.setMainTab("radar", { fit: true });
      });
    }

    // Bind commute simulation clicks
    body.querySelectorAll("[data-sim-routine]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rid = btn.dataset.simRoutine;
        const mode = btn.dataset.simMode || "car";
        const r = getCityRoutines().find((x) => x.id === rid);
        if (!r) return;
        const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
        if (!core.isDesktop()) {
          closeDetailDrawer(false);
          core.switchMobileView("mapa");
        }
        simulateRoute(house.id, { id: r.id, nome: r.nome, lat: r.lat, lng: r.lng, tipoLabel: meta.label }, mode);
      });
    });

    // Bind POI simulation clicks
    body.querySelectorAll("[data-sim-poi]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pid = btn.dataset.simPoi;
        const poi = imv.pois.find((x) => x.id === pid);
        if (!poi) return;
        const meta = POI_CATEGORIES[poi.categoria] || POI_CATEGORIES.mercado;
        if (!core.isDesktop()) {
          closeDetailDrawer(false);
          core.switchMobileView("mapa");
        }
        simulateRoute(house.id, { id: poi.id, nome: poi.nome, lat: poi.lat, lng: poi.lng, tipoLabel: meta.label }, "car");
      });
    });

    // Bind status & notes
    body.querySelectorAll("[data-house-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const st = btn.dataset.houseStatus;
        if (st) prefs.status[house.id] = st;
        else delete prefs.status[house.id];
        savePrefs();
        renderDetailDrawerBody();
        updateImoveisCounters(getFilteredHouses());
      });
    });

    const noteEl = document.getElementById("houseNoteInput");
    if (noteEl) {
      noteEl.addEventListener("input", () => {
        const val = noteEl.value.trim();
        if (val) prefs.notes[house.id] = val;
        else delete prefs.notes[house.id];
        savePrefs();
      });
    }
  }

  // ==================== MULTI-MODAL ROUTE SIMULATOR (CARRO / MOTO / BIKE / A PÉ) ====================
  async function fetchOsrmRoute(lat1, lng1, lat2, lng2, osrmProfile) {
    const cacheKey = `${osrmProfile}:${lat1.toFixed(4)},${lng1.toFixed(4)}->${lat2.toFixed(4)},${lng2.toFixed(4)}`;
    if (imv.routeCache.has(cacheKey)) return imv.routeCache.get(cacheKey);

    const coordsParam = `${lng1},${lat1};${lng2},${lat2}`;
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordsParam}?overview=full&geometries=geojson`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5500);
      const resp = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (resp.ok) {
        const data = await resp.json();
        const route = data?.routes?.[0];
        if (route?.geometry?.coordinates?.length >= 2) {
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const res = {
            coords,
            distanceMeters: route.distance,
            durationSec: route.duration,
            source: "OSRM",
          };
          imv.routeCache.set(cacheKey, res);
          return res;
        }
      }
    } catch {
      // Fallback to realistic geometric curve
    }

    const straight = haversineMeters(lat1, lng1, lat2, lng2);
    const steps = 24;
    const coords = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const curve = Math.sin(f * Math.PI) * 0.0012;
      coords.push([lat1 + (lat2 - lat1) * f + curve, lng1 + (lng2 - lng1) * f - curve * 0.6]);
    }
    const factor = osrmProfile === "walking" ? 1.18 : osrmProfile === "cycling" ? 1.22 : 1.28;
    const res = {
      coords,
      distanceMeters: straight * factor,
      durationSec: null,
      source: "Estimativa",
    };
    imv.routeCache.set(cacheKey, res);
    return res;
  }

  function stopRouteAnimation() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (imv.sim) imv.sim.animating = false;
  }

  function clearRouteSimulation() {
    stopRouteAnimation();
    if (routeLayer) routeLayer.clearLayers();
    animMarker = null;
    imv.sim = null;
    const hud = document.getElementById("routeSimHud");
    if (hud) {
      hud.hidden = true;
      hud.innerHTML = "";
    }
  }

  function getSimulatedModeMetrics(sim, modeId) {
    const mode = TRAVEL_MODES[modeId];
    const r = sim.routesByProfile[mode.osrmProfile] || sim.activeRoute;
    const dist = r ? r.distanceMeters : haversineMeters(sim.house.lat, sim.house.lng, sim.target.lat, sim.target.lng) * mode.roadFactor;
    let mins;
    if (modeId === "car" && r?.durationSec) mins = Math.max(1, Math.round((r.durationSec / 60) * 1.15));
    else if (modeId === "moto" && r?.durationSec) mins = Math.max(1, Math.round((r.durationSec / 60) * 0.88));
    else mins = estimateModeMinutes(dist, modeId, dist);
    return { dist, mins };
  }

  function drawSimulatedRoute() {
    const map = window.RadarBR.getMap();
    if (!map || !imv.sim?.activeRoute) return;
    ensureLayers(map);
    routeLayer.clearLayers();
    animMarker = null;

    const mode = TRAVEL_MODES[imv.sim.mode] || TRAVEL_MODES.car;
    const coords = imv.sim.activeRoute.coords;

    // Shadow casing + main route line
    L.polyline(coords, { color: "#ffffff", weight: 8, opacity: 0.85 }).addTo(routeLayer);
    const poly = L.polyline(coords, {
      color: mode.color,
      weight: 4.5,
      opacity: 0.95,
      dashArray: imv.sim.mode === "walk" ? "4 8" : null,
    }).addTo(routeLayer);

    // Destination marker
    const endIcon = L.divIcon({
      className: "routine-pin-wrap",
      html: `<div class="routine-pin" style="background:${mode.color}"><span>${mode.emoji}</span><span>${window.RadarBR.escapeHtml(imv.sim.target.nome)}</span></div>`,
      iconSize: [0, 0],
    });
    L.marker([imv.sim.target.lat, imv.sim.target.lng], { icon: endIcon, zIndexOffset: 620 }).addTo(routeLayer);

    // Animated vehicle marker at start
    const vIcon = L.divIcon({
      className: "poi-pin-wrap",
      html: `<div class="sim-vehicle-marker" style="background:${mode.color}">${mode.emoji}</div>`,
      iconSize: [0, 0],
    });
    animMarker = L.marker(coords[0], { icon: vIcon, zIndexOffset: 680 }).addTo(routeLayer);

    map.fitBounds(poly.getBounds(), {
      paddingTopLeft: [48, 86],
      paddingBottomRight: [48, 130],
      maxZoom: 15,
      animate: true,
    });
  }

  function startRouteAnimation() {
    if (!imv.sim?.activeRoute || !animMarker) return;
    stopRouteAnimation();
    const coords = imv.sim.activeRoute.coords;
    if (coords.length < 2) return;

    imv.sim.animating = true;
    renderRouteSimHud();

    const durationMs = 5500;
    const startTime = performance.now();

    function step(now) {
      if (!imv.sim || !imv.sim.animating || !animMarker) return;
      const t = ((now - startTime) % durationMs) / durationMs;
      const posFloat = t * (coords.length - 1);
      const i0 = Math.floor(posFloat);
      const i1 = Math.min(coords.length - 1, i0 + 1);
      const frac = posFloat - i0;
      const lat = coords[i0][0] + (coords[i1][0] - coords[i0][0]) * frac;
      const lng = coords[i0][1] + (coords[i1][1] - coords[i0][1]) * frac;
      animMarker.setLatLng([lat, lng]);
      animFrameId = requestAnimationFrame(step);
    }

    animFrameId = requestAnimationFrame(step);
  }

  function renderRouteSimHud() {
    const hud = document.getElementById("routeSimHud");
    if (!hud) return;
    const core = window.RadarBR;
    if (!imv.sim) {
      hud.hidden = true;
      return;
    }

    hud.hidden = false;
    const { house, target, mode, loading, animating, activeRoute } = imv.sim;
    const curMetrics = getSimulatedModeMetrics(imv.sim, mode);
    const routines = getCityRoutines();

    const targetsHtml = routines.length
      ? `
        <div class="route-sim__targets">
          ${routines
            .map((r) => {
              const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
              return `<button type="button" class="route-sim__target ${target.id === r.id ? "is-active" : ""}" data-switch-target="${core.escapeHtml(r.id)}">${meta.emoji} ${core.escapeHtml(r.nome)}</button>`;
            })
            .join("")}
        </div>
      `
      : "";

    hud.innerHTML = `
      <div class="route-sim__head">
        <div>
          <h4 class="route-sim__title">Rota até ${core.escapeHtml(target.nome)}</h4>
          <p class="route-sim__sub">${core.escapeHtml(house.bairro || house.titulo)} · ${loading ? "Calculando rota…" : `${formatDist(curMetrics.dist)} (${activeRoute?.source || "Rota"})`}</p>
        </div>
        <button type="button" class="route-sim__close" id="simCloseBtn" aria-label="Fechar simulação">×</button>
      </div>
      ${targetsHtml}
      <div class="route-sim__modes">
        ${Object.values(TRAVEL_MODES)
          .map((m) => {
            const met = getSimulatedModeMetrics(imv.sim, m.id);
            return `
              <button type="button" class="sim-mode-btn ${mode === m.id ? "is-active" : ""}" data-sim-switch-mode="${m.id}">
                <span>${m.emoji} ${m.label}</span>
                <strong>${formatMinutes(met.mins)}</strong>
              </button>
            `;
          })
          .join("")}
      </div>
      <div class="route-sim__foot">
        <span>${TRAVEL_MODES[mode].emoji} ${TRAVEL_MODES[mode].label}: <strong>${formatMinutes(curMetrics.mins)}</strong> · ${formatDist(curMetrics.dist)}</span>
        <button type="button" class="btn-outline-emerald" id="simPlayPauseBtn">${animating ? "⏸ Pausar" : "▶ Animar"}</button>
      </div>
    `;

    document.getElementById("simCloseBtn").addEventListener("click", clearRouteSimulation);
    document.getElementById("simPlayPauseBtn").addEventListener("click", () => {
      if (imv.sim.animating) {
        stopRouteAnimation();
        renderRouteSimHud();
      } else {
        startRouteAnimation();
      }
    });

    hud.querySelectorAll("[data-sim-switch-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextMode = btn.dataset.simSwitchMode;
        if (!imv.sim || imv.sim.mode === nextMode) return;
        simulateRoute(house.id, target, nextMode);
      });
    });

    hud.querySelectorAll("[data-switch-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = getCityRoutines().find((x) => x.id === btn.dataset.switchTarget);
        if (!r) return;
        const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
        simulateRoute(house.id, { id: r.id, nome: r.nome, lat: r.lat, lng: r.lng, tipoLabel: meta.label }, imv.sim.mode);
      });
    });
  }

  async function simulateRoute(houseId, target, mode = "car") {
    const house = imv.houses.find((h) => h.id === houseId);
    if (!house || !target) return;
    const reqId = ++simReqSeq;
    stopRouteAnimation();

    const prevRoutes =
      imv.sim && imv.sim.house.id === houseId && imv.sim.target.id === target.id ? imv.sim.routesByProfile : {};

    imv.sim = {
      house,
      target,
      mode: TRAVEL_MODES[mode] ? mode : "car",
      routesByProfile: prevRoutes,
      activeRoute: null,
      loading: true,
      animating: false,
    };
    renderRouteSimHud();

    const profile = TRAVEL_MODES[imv.sim.mode].osrmProfile;
    const route = await fetchOsrmRoute(house.lat, house.lng, target.lat, target.lng, profile);
    if (reqId !== simReqSeq || !imv.sim) return;

    imv.sim.routesByProfile[profile] = route;
    imv.sim.activeRoute = route;
    imv.sim.loading = false;
    drawSimulatedRoute();
    startRouteAnimation();
  }

  // ==================== PERSONAL ROUTINE MODAL (localStorage + GEOCODE + MAP PICK) ====================
  function openRoutineModal() {
    renderRoutineModalList();
    resetRoutineForm();
    document.getElementById("routineModal").hidden = false;
  }

  function closeRoutineModal() {
    document.getElementById("routineModal").hidden = true;
  }

  function resetRoutineForm() {
    document.getElementById("routineFormHeading").textContent = "Adicionar novo local";
    document.getElementById("routineTypeInput").value = "trabalho";
    document.getElementById("routineNameInput").value = "";
    document.getElementById("routineAddressInput").value = "";
    document.getElementById("routineLatInput").value = "";
    document.getElementById("routineLngInput").value = "";
    document.getElementById("routineEditIdInput").value = "";
    document.getElementById("routineCancelEditBtn").hidden = true;
    const st = document.getElementById("routineCoordsStatus");
    st.textContent = "Informe um endereço e clique em Buscar, ou marque no mapa";
    st.classList.remove("is-ready");
  }

  function setRoutineCoords(lat, lng, label) {
    document.getElementById("routineLatInput").value = String(Number(lat).toFixed(5));
    document.getElementById("routineLngInput").value = String(Number(lng).toFixed(5));
    const st = document.getElementById("routineCoordsStatus");
    st.textContent = `✓ Local definido: ${label || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`}`;
    st.classList.add("is-ready");
  }

  function renderRoutineModalList() {
    const listEl = document.getElementById("routineList");
    const core = window.RadarBR;
    const routines = getCityRoutines();
    if (!routines.length) {
      listEl.innerHTML = `<div style="padding:10px 12px;border-radius:12px;background:var(--bg);font-size:12px;color:var(--ink-muted)">Nenhum local salvo em <strong>${core.escapeHtml(imv.cityMeta?.nome || "")}</strong> ainda. Adicione seu trabalho, casa atual ou escola abaixo.</div>`;
      return;
    }

    listEl.innerHTML = routines
      .map((r) => {
        const meta = ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro;
        return `
          <div class="routine-item">
            <div class="routine-item__info">
              <div class="routine-item__name">${meta.emoji} ${core.escapeHtml(r.nome)} <small style="color:var(--ink-subtle);font-weight:600">(${meta.label})</small></div>
              <div class="routine-item__addr">${core.escapeHtml(r.endereco || `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`)}</div>
            </div>
            <div class="routine-item__acts">
              <button type="button" class="btn-ghost-sm" data-edit-routine="${core.escapeHtml(r.id)}">Editar</button>
              <button type="button" class="btn-ghost-sm" style="color:var(--crimson)" data-del-routine="${core.escapeHtml(r.id)}">Remover</button>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll("[data-edit-routine]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = routines.find((x) => x.id === btn.dataset.editRoutine);
        if (!r) return;
        document.getElementById("routineFormHeading").textContent = `Editar: ${r.nome}`;
        document.getElementById("routineTypeInput").value = r.tipo;
        document.getElementById("routineNameInput").value = r.nome;
        document.getElementById("routineAddressInput").value = r.endereco || "";
        document.getElementById("routineEditIdInput").value = r.id;
        document.getElementById("routineCancelEditBtn").hidden = false;
        setRoutineCoords(r.lat, r.lng, r.endereco || r.nome);
      });
    });

    listEl.querySelectorAll("[data-del-routine]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delRoutine;
        imv.routines[imv.citySlug] = getCityRoutines().filter((x) => x.id !== id);
        saveRoutines();
        recomputeAllEntornos();
        populateSortOptions();
        renderRoutineModalList();
        refreshAllImoveis();
        if (imv.selectedHouseId) renderDetailDrawerBody();
        window.RadarBR.showToast("Local removido");
      });
    });
  }

  async function geocodeAddressForCity(query) {
    const core = window.RadarBR;
    const norm = core.normalizeText(query);
    if (!norm) return null;

    // 1. Check local POIs & neighborhoods first (instant & offline-safe)
    const poiMatch = imv.pois.find((p) => core.normalizeText(p.nome).includes(norm));
    if (poiMatch) return { lat: poiMatch.lat, lng: poiMatch.lng, label: poiMatch.nome };

    const bairros = imv.cityGeo?.bairros || {};
    const bairroKey = Object.keys(bairros).find((k) => k === norm || norm.includes(k) || k.includes(norm));

    // 2. Try Nominatim OpenStreetMap restricted to current city
    try {
      const cityQuery = `${query}, ${imv.cityMeta?.nome || "Campo Grande"}, ${imv.cityMeta?.uf || "MS"}, Brasil`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cityQuery)}`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const resp = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      clearTimeout(t);
      if (resp.ok) {
        const arr = await resp.json();
        if (arr?.[0]) {
          return {
            lat: Number(arr[0].lat),
            lng: Number(arr[0].lon),
            label: arr[0].display_name.split(",").slice(0, 2).join(", "),
          };
        }
      }
    } catch {
      // Fallback to neighborhood match below
    }

    if (bairroKey) {
      return { lat: bairros[bairroKey].lat, lng: bairros[bairroKey].lng, label: `Bairro ${bairroKey}` };
    }
    return null;
  }

  function startPickingRoutineOnMap() {
    imv.pickingRoutineOnMap = true;
    closeRoutineModal();
    const core = window.RadarBR;
    if (!core.isDesktop()) core.switchMobileView("mapa");
    const name = document.getElementById("routineNameInput").value.trim() || "seu local";
    document.getElementById("mapPickText").textContent = `Clique no mapa para marcar: ${name}`;
    document.getElementById("mapPickBanner").hidden = false;
    const mapEl = document.getElementById("map");
    if (mapEl) mapEl.style.cursor = "crosshair";
  }

  function cancelPickingRoutineOnMap(reopenModal = false) {
    imv.pickingRoutineOnMap = false;
    document.getElementById("mapPickBanner").hidden = true;
    const mapEl = document.getElementById("map");
    if (mapEl) mapEl.style.cursor = "";
    if (reopenModal) document.getElementById("routineModal").hidden = false;
  }

  // ==================== FAVORITES / COMPARE / HIDE / LIGHTBOX ====================
  function toggleFav(id) {
    const prefs = getCityPrefs();
    const i = prefs.favs.indexOf(id);
    if (i >= 0) prefs.favs.splice(i, 1);
    else prefs.favs.push(id);
    savePrefs();
    refreshAllImoveis();
    if (imv.selectedHouseId === id) renderDetailDrawerBody();
  }

  function toggleCompare(id) {
    const prefs = getCityPrefs();
    const i = prefs.compare.indexOf(id);
    if (i >= 0) {
      prefs.compare.splice(i, 1);
    } else {
      if (prefs.compare.length >= 4) {
        window.RadarBR.showToast("Máximo de 4 imóveis na comparação");
        return;
      }
      prefs.compare.push(id);
    }
    savePrefs();
    refreshAllImoveis();
    if (imv.selectedHouseId === id) renderDetailDrawerBody();
  }

  function toggleHide(id) {
    const prefs = getCityPrefs();
    const i = prefs.hidden.indexOf(id);
    if (i >= 0) {
      prefs.hidden.splice(i, 1);
      window.RadarBR.showToast("Imóvel restaurado");
    } else {
      prefs.hidden.push(id);
      window.RadarBR.showToast("Imóvel ocultado");
      if (imv.selectedHouseId === id) closeDetailDrawer(true);
    }
    savePrefs();
    refreshAllImoveis();
  }

  function openCompareModal() {
    const core = window.RadarBR;
    const prefs = getCityPrefs();
    const items = prefs.compare.map((id) => imv.houses.find((h) => h.id === id)).filter(Boolean);
    const body = document.getElementById("compareModalBody");
    if (!items.length) {
      body.innerHTML = `<p style="color:var(--ink-muted)">Nenhum imóvel selecionado para comparar.</p>`;
    } else {
      const routines = getCityRoutines();
      const rows = [
        { label: "Finalidade", fn: (h) => (h.finalidade === "aluguel" ? "Aluguel" : "Venda") },
        { label: "Preço", fn: (h) => `<strong>${formatMoney(h.preco)}</strong>` },
        { label: "Cond. + IPTU", fn: (h) => `${h.condominio ? formatMoney(h.condominio) : "—"} / ${h.iptu ? formatMoney(h.iptu) : "—"}` },
        { label: "Valor / m²", fn: (h) => (h.pricePerM2 ? `R$ ${h.pricePerM2.toLocaleString("pt-BR")}/m²` : "—") },
        { label: "Bairro", fn: (h) => core.escapeHtml(h.bairro || "—") },
        { label: "Quartos / Vagas", fn: (h) => `${h.quartos || "—"} qtos · ${h.banheiros || "—"} banh. · ${h.vagas || "—"} vagas` },
        { label: "Área útil", fn: (h) => (h.area_m2 ? `${h.area_m2} m²` : "—") },
        { label: "Score Entorno", fn: (h) => `<strong>${h.entornoScore}/100</strong> (Caminh.: ${h.walkScore})` },
        ...routines.map((r) => ({
          label: `${(ROUTINE_TYPES[r.tipo] || ROUTINE_TYPES.outro).emoji} ${r.nome}`,
          fn: (h) => {
            const c = h.commutes?.find((x) => x.id === r.id);
            return c ? `${formatDist(c.dist)} · 🚗 ${c.carMin}m · 🚲 ${c.bikeMin}m` : "—";
          },
        })),
      ];

      body.innerHTML = `
        <div style="overflow-x:auto">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Critério</th>
                ${items
                  .map(
                    (h) => `
                  <th>
                    <div style="font-weight:800;color:var(--ink)">${core.escapeHtml(h.titulo)}</div>
                    <button type="button" class="link-btn" data-rm-cmp="${core.escapeHtml(h.id)}">Remover</button>
                  </th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                <tr>
                  <th>${core.escapeHtml(row.label)}</th>
                  ${items.map((h) => `<td>${row.fn(h)}</td>`).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;

      body.querySelectorAll("[data-rm-cmp]").forEach((btn) => {
        btn.addEventListener("click", () => {
          toggleCompare(btn.dataset.rmCmp);
          openCompareModal();
        });
      });
    }
    document.getElementById("compareModal").hidden = false;
  }

  function openLightbox(photos, idx = 0) {
    if (!photos.length) return;
    imv.lightboxPhotos = photos;
    imv.lightboxIdx = idx;
    updateLightbox();
    document.getElementById("photoLightbox").hidden = false;
  }

  function updateLightbox() {
    document.getElementById("lightboxImg").src = imv.lightboxPhotos[imv.lightboxIdx] || "";
    document.getElementById("lightboxCaption").textContent = `${imv.lightboxIdx + 1} / ${imv.lightboxPhotos.length}`;
  }

  // ==================== REFRESH & LIFECYCLE ====================
  function refreshAllImoveis() {
    const visible = getFilteredHouses();
    updateImoveisCounters(visible);
    renderRoutineStrip();
    renderListings(visible);
    renderMobileCarousel(visible);
    renderHousePins(visible);
    renderSelectedEntornoOnMap();

    // Sync filter chip active classes
    document.querySelectorAll("[data-finalidade]").forEach((b) => b.classList.toggle("is-active", b.dataset.finalidade === imv.finalidade));
    document.querySelectorAll("[data-imv-tipo]").forEach((b) => b.classList.toggle("is-active", b.dataset.imvTipo === imv.tipoQuick));
    document.querySelectorAll("[data-imv-toggle]").forEach((b) => {
      const t = b.dataset.imvToggle;
      const on =
        (t === "novas" && imv.onlyNovas) ||
        (t === "pets" && imv.onlyPets) ||
        (t === "quintal" && imv.onlyQuintal) ||
        (t === "moveis" && imv.onlyMoveis) ||
        (t === "favoritas" && imv.onlyFavs) ||
        (t === "ocultos" && imv.onlyHidden);
      b.classList.toggle("is-active", on);
    });
  }

  function fitToImoveis(preferPoints = true) {
    const map = window.RadarBR.getMap();
    if (!map) return;
    const visible = getFilteredHouses();
    if (preferPoints && visible.length >= 2) {
      map.fitBounds(L.latLngBounds(visible.map((h) => [h.lat, h.lng])), {
        paddingTopLeft: [44, window.RadarBR.isDesktop() ? 74 : 134],
        paddingBottomRight: [44, window.RadarBR.isDesktop() ? 74 : 120],
        maxZoom: 14,
        animate: true,
      });
      return;
    }
    if (preferPoints && visible.length === 1) {
      map.flyTo([visible[0].lat, visible[0].lng], 14, { duration: 0.45 });
      return;
    }
    const center = imv.cityGeo?.centro || imv.cityMeta?.centro || { lat: -20.4697, lng: -54.6201 };
    const zoom = imv.cityGeo?.zoom || imv.cityMeta?.zoom || 12;
    map.flyTo([center.lat, center.lng], zoom, { duration: 0.45 });
  }

  // ==================== BIND UI EVENTS ====================
  function bindImoveisEvents() {
    const searchInput = document.getElementById("imoveisSearchInput");
    const clearSearch = document.getElementById("clearImoveisSearchBtn");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        imv.query = searchInput.value;
        if (clearSearch) clearSearch.hidden = !imv.query;
        refreshAllImoveis();
      });
    }
    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        imv.query = "";
        clearSearch.hidden = true;
        refreshAllImoveis();
      });
    }

    document.querySelectorAll("[data-finalidade]").forEach((btn) => {
      btn.addEventListener("click", () => {
        imv.finalidade = btn.dataset.finalidade;
        refreshAllImoveis();
      });
    });

    const sortSel = document.getElementById("imoveisSortSelect");
    if (sortSel) {
      sortSel.addEventListener("change", () => {
        imv.sort = sortSel.value;
        refreshAllImoveis();
      });
    }

    document.querySelectorAll("[data-imv-tipo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        imv.tipoQuick = imv.tipoQuick === btn.dataset.imvTipo ? "" : btn.dataset.imvTipo;
        refreshAllImoveis();
      });
    });

    document.querySelectorAll("[data-imv-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.imvToggle;
        if (k === "novas") imv.onlyNovas = !imv.onlyNovas;
        if (k === "pets") imv.onlyPets = !imv.onlyPets;
        if (k === "quintal") imv.onlyQuintal = !imv.onlyQuintal;
        if (k === "moveis") imv.onlyMoveis = !imv.onlyMoveis;
        if (k === "favoritas") imv.onlyFavs = !imv.onlyFavs;
        if (k === "ocultos") imv.onlyHidden = !imv.onlyHidden;
        refreshAllImoveis();
      });
    });

    document.getElementById("resetImoveisFiltersBtn")?.addEventListener("click", resetImoveisFilters);
    document.getElementById("imoveisEmptyResetBtn")?.addEventListener("click", resetImoveisFilters);

    // Saved pills (mobile)
    document.querySelectorAll("[data-saved-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        imv.savedFilter = btn.dataset.savedFilter;
        document.querySelectorAll("[data-saved-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
        refreshAllImoveis();
      });
    });

    // Radius controls
    document.querySelectorAll("[data-radius]").forEach((btn) => {
      btn.addEventListener("click", () => setRadius(Number(btn.dataset.radius)));
    });
    document.getElementById("cycleRadiusBtn")?.addEventListener("click", () => {
      const idx = RADIUS_STEPS.findIndex((s) => s.val === imv.radiusMeters);
      const next = RADIUS_STEPS[(idx + 1) % RADIUS_STEPS.length];
      setRadius(next.val);
      window.RadarBR.showToast(`Raio do entorno: ${next.label}`);
    });

    // Drawer controls
    document.getElementById("closeDrawerBtn")?.addEventListener("click", () => closeDetailDrawer(true));
    document.getElementById("drawerBackdrop")?.addEventListener("click", () => closeDetailDrawer(false));
    document.getElementById("drawerPeekMapBtn")?.addEventListener("click", () => {
      closeDetailDrawer(false);
      window.RadarBR.switchMobileView("mapa");
    });
    document.getElementById("drawerFavBtn")?.addEventListener("click", () => imv.selectedHouseId && toggleFav(imv.selectedHouseId));
    document.getElementById("drawerCompareBtn")?.addEventListener("click", () => imv.selectedHouseId && toggleCompare(imv.selectedHouseId));
    document.getElementById("drawerHideBtn")?.addEventListener("click", () => imv.selectedHouseId && toggleHide(imv.selectedHouseId));

    // Filters Modal
    document.getElementById("openFiltersModalBtn")?.addEventListener("click", () => {
      document.getElementById("filterPriceMin").value = imv.priceMin ?? "";
      document.getElementById("filterPriceMax").value = imv.priceMax ?? "";
      document.getElementById("filterMinQuartos").value = String(imv.minQuartos);
      document.getElementById("filterMinBanheiros").value = String(imv.minBanheiros);
      document.getElementById("filterMinVagas").value = String(imv.minVagas);
      document.getElementById("filterBairroSelect").value = imv.bairroFilter;
      document.getElementById("filtersModal").hidden = false;
    });
    document.getElementById("modalApplyFiltersBtn")?.addEventListener("click", () => {
      const pMin = Number(document.getElementById("filterPriceMin").value);
      const pMax = Number(document.getElementById("filterPriceMax").value);
      imv.priceMin = pMin > 0 ? pMin : null;
      imv.priceMax = pMax > 0 ? pMax : null;
      imv.minQuartos = Number(document.getElementById("filterMinQuartos").value) || 0;
      imv.minBanheiros = Number(document.getElementById("filterMinBanheiros").value) || 0;
      imv.minVagas = Number(document.getElementById("filterMinVagas").value) || 0;
      imv.bairroFilter = document.getElementById("filterBairroSelect").value || "";
      document.getElementById("filtersModal").hidden = true;
      refreshAllImoveis();
    });
    document.getElementById("modalResetFiltersBtn")?.addEventListener("click", () => {
      document.getElementById("filtersModal").hidden = true;
      resetImoveisFilters();
    });

    // Routine Modal triggers
    document.getElementById("openRoutineBtn")?.addEventListener("click", openRoutineModal);
    document.getElementById("sidebarRoutineBtn")?.addEventListener("click", openRoutineModal);
    document.getElementById("navRoutineBtn")?.addEventListener("click", openRoutineModal);
    document.getElementById("routinePickMapBtn")?.addEventListener("click", startPickingRoutineOnMap);
    document.getElementById("cancelMapPickBtn")?.addEventListener("click", () => cancelPickingRoutineOnMap(true));
    document.getElementById("routineCancelEditBtn")?.addEventListener("click", resetRoutineForm);

    document.getElementById("routineGeocodeBtn")?.addEventListener("click", async () => {
      const addr = document.getElementById("routineAddressInput").value.trim();
      if (!addr) {
        window.RadarBR.showToast("Digite um endereço ou bairro primeiro");
        return;
      }
      const btn = document.getElementById("routineGeocodeBtn");
      btn.textContent = "…";
      btn.disabled = true;
      const res = await geocodeAddressForCity(addr);
      btn.textContent = "Buscar";
      btn.disabled = false;
      if (res) {
        setRoutineCoords(res.lat, res.lng, res.label);
      } else {
        window.RadarBR.showToast("Endereço não encontrado. Tente marcar no mapa.");
      }
    });

    document.getElementById("routineForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const tipo = document.getElementById("routineTypeInput").value;
      const nome = document.getElementById("routineNameInput").value.trim();
      const endereco = document.getElementById("routineAddressInput").value.trim();
      let lat = Number(document.getElementById("routineLatInput").value);
      let lng = Number(document.getElementById("routineLngInput").value);
      const editId = document.getElementById("routineEditIdInput").value;

      if (!nome) return;

      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
        if (endereco) {
          const geo = await geocodeAddressForCity(endereco);
          if (geo) {
            lat = geo.lat;
            lng = geo.lng;
          }
        }
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
        window.RadarBR.showToast("Busque um endereço válido ou clique em 'Marcar no mapa'");
        return;
      }

      const list = getCityRoutines();
      if (editId) {
        const existing = list.find((x) => x.id === editId);
        if (existing) {
          existing.tipo = tipo;
          existing.nome = nome;
          existing.endereco = endereco;
          existing.lat = lat;
          existing.lng = lng;
        }
      } else {
        list.push({
          id: `loc-${Date.now().toString(36)}`,
          tipo,
          nome,
          endereco,
          lat,
          lng,
        });
      }

      saveRoutines();
      recomputeAllEntornos();
      populateSortOptions();
      renderRoutineModalList();
      resetRoutineForm();
      refreshAllImoveis();
      if (imv.selectedHouseId) renderDetailDrawerBody();
      window.RadarBR.showToast("Local salvo no navegador!");
    });

    // Compare Modal
    document.getElementById("compareOpenBtn")?.addEventListener("click", openCompareModal);
    document.getElementById("mobileCompareBtn")?.addEventListener("click", openCompareModal);

    // Close modals
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = document.getElementById(btn.dataset.closeModal);
        if (m) m.hidden = true;
      });
    });
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.hidden = true;
      });
    });

    // Lightbox
    document.getElementById("lightboxCloseBtn")?.addEventListener("click", () => {
      document.getElementById("photoLightbox").hidden = true;
    });
    document.getElementById("lightboxPrevBtn")?.addEventListener("click", () => {
      imv.lightboxIdx = (imv.lightboxIdx - 1 + imv.lightboxPhotos.length) % imv.lightboxPhotos.length;
      updateLightbox();
    });
    document.getElementById("lightboxNextBtn")?.addEventListener("click", () => {
      imv.lightboxIdx = (imv.lightboxIdx + 1) % imv.lightboxPhotos.length;
      updateLightbox();
    });
  }

  // ==================== PUBLIC HOOKS FOR app.js ====================
  window.RadarBRImoveis = {
    onMapReady(map) {
      ensureLayers(map);
      map.on("click", (e) => {
        if (imv.pickingRoutineOnMap) {
          setRoutineCoords(e.latlng.lat, e.latlng.lng, `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
          cancelPickingRoutineOnMap(true);
          window.RadarBR.showToast("Ponto capturado no mapa!");
        }
      });
    },

    onCityDataLoaded({ citySlug, cityMeta, cityGeo, casasJson, poisJson }) {
      imv.citySlug = citySlug;
      imv.cityMeta = cityMeta;
      imv.cityGeo = cityGeo;
      imv.selectedHouseId = null;
      hideSafetyFloatingCard();
      imv.bairroFilter = "";
      closeDetailDrawer(false);
      clearRouteSimulation();

      ingestPois(poisJson);
      ingestHouses(casasJson);
    },

    onActivate({ fit = true } = {}) {
      refreshAllImoveis();
      if (fit) fitToImoveis(true);
    },

    onDeactivate() {
      hideSafetyFloatingCard();
      closeDetailDrawer(false);
      clearAllImoveisLayers();
      const poiDock = document.getElementById("poiLayerDock");
      if (poiDock) poiDock.hidden = true;
    },

    onMobileViewChange(view) {
      const inlineF = document.getElementById("imoveisInlineFilters");
      const savedH = document.getElementById("savedHead");
      if (window.RadarBR.getState().mainTab === "imoveis") {
        const isSaved = view === "salvos";
        if (inlineF) inlineF.hidden = isSaved;
        if (savedH) savedH.hidden = !isSaved;
        refreshAllImoveis();
      }
    },

    fitToImoveis,
  };

  loadStorage();
  bindImoveisEvents();
})();
