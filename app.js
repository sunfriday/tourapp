const STORAGE_PREFIX = "tourapp.route.customTile.v1";
const TRIP_DAYS = [
  {
    date: "2026-09-25",
    label: "9/25 周五",
    title: "抵达 + 圣淘沙日落",
    badge: "首日预览",
    items: [
      ["12:30", "CZ353 抵达 / Arrive at SIN", "入境后直接去酒店放行李。"],
      ["18:00", "iFly Singapore / 新加坡风洞飞行", "需要提前 check-in，延误则挪到 9/29。"],
      ["18:50", "Skyline Luge / 新加坡天际滑车", "把 Skyride 缆车留给日落。"],
    ],
  },
  {
    date: "2026-09-26",
    label: "9/26 周六",
    title: "殖民建筑 + 滨海湾夜景",
    badge: "拍照主线",
    items: [
      ["09:30", "Civic District / 市政区", "莱佛士酒店、赞美广场、圣安德烈座堂。"],
      ["17:30", "Merlion Park / 鱼尾狮公园", "傍晚拍 Marina Bay Sands 天际线。"],
      ["19:45", "Garden Rhapsody / 花园狂想曲", "接滨海湾花园中秋节庆典。"],
    ],
  },
  {
    date: "2026-09-27",
    label: "9/27 周日",
    title: "环球影城整日",
    badge: "主题乐园日",
    items: [
      ["09:20", "Universal Studios Singapore / 新加坡环球影城", "先拍环球球，开园后直接进热门项目队列。"],
      ["10:00", "热门项目优先 / Rides First", "上午集中处理排队压力。"],
      ["18:30", "VivoCity / 怡丰城", "Sanrio 月漫花园，吃饭后撤退。"],
    ],
  },
  {
    date: "2026-09-28",
    label: "9/28 周一",
    title: "水上探险 + 金沙夜景",
    badge: "天气敏感",
    items: [
      ["10:00", "Adventure Cove / 水上探险乐园", "尽量开园入场，热门滑道先玩。"],
      ["19:00", "Lau Pa Sat / 老巴刹沙爹街", "晚餐吃沙爹，之后步行到滨海湾。"],
      ["21:00", "Spectra / 滨海湾金沙光影水舞秀", "用夜景结束水上乐园日。"],
    ],
  },
  {
    date: "2026-09-29",
    label: "9/29 周二",
    title: "换酒店 + 自由购物",
    badge: "轻松日",
    items: [
      ["10:30", "换酒店 / Hotel Transfer", "Roxy 退房后打车去 Frasers House 寄存行李。"],
      ["13:00", "自由逛街 / Flexible Shopping", "Orchard Road 或 Bugis Junction 二选一。"],
      ["19:00", "Kampong Gelam / 甘榜格南", "步行逛 Haji Lane 和 Sultan Mosque。"],
    ],
  },
  {
    date: "2026-09-30",
    label: "9/30 周三",
    title: "星耀樟宜半日",
    badge: "返程日",
    items: [
      ["08:45", "前往机场 / To Airport", "从 Frasers House 打车去樟宜机场。"],
      ["10:00", "Jewel Changi / 星耀樟宜", "雨漩涡、Canopy Park、午餐。"],
      ["12:10", "进安检 / Security", "CZ354 13:45 起飞，别把机场日排满。"],
    ],
  },
];

const WEATHER_LABELS = {
  0: "晴",
  1: "大致晴",
  2: "局部多云",
  3: "多云",
  45: "有雾",
  48: "雾凇",
  51: "小毛雨",
  53: "毛雨",
  55: "较强毛雨",
  61: "小雨",
  63: "阵雨",
  65: "大雨",
  80: "短时阵雨",
  81: "阵雨",
  82: "强阵雨",
  95: "雷阵雨",
  96: "雷阵雨",
  99: "强雷阵雨",
};

const WEATHER_CACHE_KEY = "tourapp.weather.hourly.v1";

const getTodayDateKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getTodayTripDay = () => TRIP_DAYS.find((day) => day.date === getTodayDateKey());

const getDefaultTripDay = () => getTodayTripDay() || TRIP_DAYS[0];

const getRouteDayKey = (day) => day.date.slice(5).replace("-", "");

const getTripDayByRouteKey = (routeDay) => TRIP_DAYS.find((day) => getRouteDayKey(day) === routeDay);

let activeRouteDay = getRouteDayKey(getDefaultTripDay());

const renderHomePlan = () => {
  const todayTripDay = getTodayTripDay();
  const day = todayTripDay;
  const cardEl = document.querySelector(".home-itinerary-card");
  const titleEl = document.querySelector("#home-plan-title");
  const badgeEl = document.querySelector("#home-plan-badge");
  const routeCardEl = document.querySelector("#home-route-card");

  if (!routeCardEl) return;
  routeCardEl.innerHTML = "";

  if (!day) {
    if (cardEl) cardEl.hidden = true;
    return;
  }

  if (cardEl) cardEl.hidden = false;
  if (titleEl) titleEl.textContent = "当日行程";
  if (badgeEl) badgeEl.textContent = day.label;

  const sourceCard = document.querySelector(`.route-view .route-planner[data-route-day="${getRouteDayKey(day)}"]`);

  if (!sourceCard) {
    const fallback = document.createElement("ol");
    fallback.className = "journey-list compact";
    day.items.forEach(([time, title, description]) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <time>${time}</time>
        <div>
          <strong>${title}</strong>
          <p>${description}</p>
        </div>
      `;
      fallback.append(item);
    });
    routeCardEl.append(fallback);
    return;
  }

  const homeCard = sourceCard.cloneNode(true);
  homeCard.hidden = false;
  homeCard.removeAttribute("hidden");
  homeCard.classList.add("home-route-copy");
  homeCard.querySelectorAll(".tile-editor").forEach((editor) => editor.remove());
  routeCardEl.append(homeCard);
  setupCustomTiles(homeCard);
};

const setupViewTabs = () => {
  const buttons = document.querySelectorAll(".bottom-tabs [data-tab-target]");
  const views = document.querySelectorAll(".app-view");

  const activate = (target) => {
    views.forEach((view) => {
      const active = view.dataset.view === target;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    });

    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.tabTarget === target);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => activate(button.dataset.tabTarget));
  });
};

const setupRouteDayTabs = () => {
  const buttons = document.querySelectorAll(".day-tabs [data-route-day]");
  const cards = document.querySelectorAll(".route-view .route-planner[data-route-day]");

  const activate = (day) => {
    activeRouteDay = day;
    cards.forEach((card) => {
      const active = card.dataset.routeDay === day;
      card.hidden = !active;
    });

    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.routeDay === day);
    });

  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => activate(button.dataset.routeDay));
  });

  activate(activeRouteDay);
};

const formatHour = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(11, 16);
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const renderHourlyWeather = (hours) => {
  const strip = document.querySelector("#hourly-weather-strip");
  if (!strip) return;

  strip.innerHTML = "";
  hours.forEach((hour) => {
    const tile = document.createElement("article");
    tile.className = "hourly-weather-tile";
    tile.innerHTML = `
      <span>${hour.time}</span>
      <strong>${hour.temperature}°</strong>
      <p>${hour.label}</p>
      <small>降雨 ${hour.rain}%</small>
    `;
    strip.append(tile);
  });
};

const renderWeatherFallback = () => {
  const fallback = [
    { time: "现在", temperature: 29, label: "多云", rain: 35 },
    { time: "+1h", temperature: 30, label: "局部多云", rain: 30 },
    { time: "+2h", temperature: 30, label: "阵雨风险", rain: 45 },
    { time: "+3h", temperature: 29, label: "短时阵雨", rain: 50 },
    { time: "+4h", temperature: 28, label: "多云", rain: 38 },
    { time: "+5h", temperature: 28, label: "闷热", rain: 32 },
  ];
  renderHourlyWeather(fallback);
};

const readWeatherCache = () => {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    const cached = raw ? JSON.parse(raw) : null;
    return Array.isArray(cached?.hours) ? cached.hours : null;
  } catch {
    return null;
  }
};

const writeWeatherCache = (hours) => {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ hours, savedAt: Date.now() }));
  } catch {
    // Local storage may be blocked; live weather can still render.
  }
};

const updateWeather = async () => {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: "1.3521",
      longitude: "103.8198",
      hourly: "temperature_2m,precipitation_probability,weather_code",
      timezone: "Asia/Singapore",
      forecast_days: "2",
    }).toString();

    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather request failed");

    const data = await response.json();
    const now = Date.now();
    const startIndex = data.hourly.time.findIndex((value) => new Date(value).getTime() >= now - 30 * 60 * 1000);
    const safeStart = Math.max(startIndex, 0);
    const hours = data.hourly.time.slice(safeStart, safeStart + 6).map((time, index) => {
      const sourceIndex = safeStart + index;
      const code = data.hourly.weather_code[sourceIndex];
      return {
        time: formatHour(time),
        temperature: Math.round(data.hourly.temperature_2m[sourceIndex]),
        label: WEATHER_LABELS[code] || "天气变化",
        rain: data.hourly.precipitation_probability[sourceIndex] ?? 0,
      };
    });

    if (hours.length < 6) throw new Error("Not enough hourly weather");

    writeWeatherCache(hours);
    renderHourlyWeather(hours);
  } catch {
    const cachedHours = readWeatherCache();
    if (cachedHours) {
      renderHourlyWeather(cachedHours);
      return;
    }

    renderWeatherFallback();
  }
};

const registerOfflineCache = () => {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
  navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => registration.update())
    .catch(() => {
      // Offline cache is an enhancement; the app should still run without it.
    });
};

const readSavedTile = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSavedTile = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const removeSavedTile = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures; the visible tile can still reset.
  }
};

const closeEditor = (tile) => {
  tile.classList.remove("is-editing");
  tile.querySelector(".tile-editor")?.remove();
};

const showSavedHint = (tile, text) => {
  const button = tile.querySelector(".tile-edit-button");
  if (!button) return;

  const original = button.textContent;
  button.textContent = text;
  button.disabled = true;
  window.setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 900);
};

const openEditor = (tile) => {
  if (tile.classList.contains("is-editing")) {
    closeEditor(tile);
    return;
  }

  document.querySelectorAll(".custom-tile.is-editing").forEach(closeEditor);

  const titleEl = tile.querySelector(".custom-title");
  const contentEl = tile.querySelector(".custom-content");
  const key = tile.dataset.storageKey;
  const defaultTitle = tile.dataset.defaultTitle || titleEl.textContent;
  const defaultContent = tile.dataset.defaultContent || contentEl.textContent;

  const form = document.createElement("form");
  form.className = "tile-editor";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "标题";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = titleEl.textContent;
  titleInput.maxLength = 20;

  const contentLabel = document.createElement("label");
  contentLabel.textContent = "内容";
  const contentInput = document.createElement("textarea");
  contentInput.value = contentEl.textContent;
  contentInput.rows = 3;
  contentInput.maxLength = 120;

  const actions = document.createElement("div");
  actions.className = "tile-editor-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.textContent = "保存";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "取消";
  cancelButton.addEventListener("click", () => closeEditor(tile));

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.textContent = "恢复默认";
  resetButton.addEventListener("click", () => {
    removeSavedTile(key);
    syncTileContent(key, defaultTitle, defaultContent);
    closeEditor(tile);
    showSavedHint(tile, "↺");
  });

  titleLabel.append(titleInput);
  contentLabel.append(contentInput);
  actions.append(saveButton, cancelButton, resetButton);
  form.append(titleLabel, contentLabel, actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextTitle = titleInput.value.trim() || defaultTitle;
    const nextContent = contentInput.value.trim() || defaultContent;

    writeSavedTile(key, { title: nextTitle, content: nextContent });
    syncTileContent(key, nextTitle, nextContent);
    closeEditor(tile);
    showSavedHint(tile, "✓");
  });

  tile.append(form);
  tile.classList.add("is-editing");
  titleInput.focus();
  titleInput.select();
};

const getStorageDayIndex = (dayCard, fallbackIndex) => {
  const routeDay = dayCard.dataset.routeDay;
  const tripIndex = TRIP_DAYS.findIndex((day) => getRouteDayKey(day) === routeDay);
  return tripIndex >= 0 ? tripIndex : fallbackIndex;
};

const syncTileContent = (key, title, content) => {
  document.querySelectorAll(".custom-tile[data-storage-key]").forEach((candidate) => {
    if (candidate.dataset.storageKey !== key) return;
    const titleEl = candidate.querySelector(".custom-title");
    const contentEl = candidate.querySelector(".custom-content");
    if (titleEl) titleEl.textContent = title;
    if (contentEl) contentEl.textContent = content;
  });
};

const setupCustomTiles = (root = document) => {
  const planners = root.matches?.(".route-planner")
    ? [root, ...root.querySelectorAll(".route-planner")]
    : [...root.querySelectorAll(".route-planner")];

  planners.forEach((dayCard, dayIndex) => {
    const storageDayIndex = getStorageDayIndex(dayCard, dayIndex);

    dayCard.querySelectorAll(".custom-tile").forEach((tile, tileIndex) => {
      const titleEl =
        tile.querySelector(".custom-title") ||
        tile.querySelector(".custom-tile-header span") ||
        tile.querySelector(":scope > span");
      const contentEl = tile.querySelector(".custom-content") || tile.querySelector(":scope > p");
      if (!titleEl || !contentEl) return;

      const key = tile.dataset.storageKey || `${STORAGE_PREFIX}.${storageDayIndex}.${tileIndex}`;
      tile.dataset.storageKey = key;
      if (!tile.dataset.defaultTitle) tile.dataset.defaultTitle = titleEl.textContent;
      if (!tile.dataset.defaultContent) tile.dataset.defaultContent = contentEl.textContent;

      titleEl.classList.add("custom-title");
      contentEl.classList.add("custom-content");

      const saved = readSavedTile(key);
      if (saved?.title) titleEl.textContent = saved.title;
      if (saved?.content) contentEl.textContent = saved.content;

      let header = tile.querySelector(".custom-tile-header");
      if (!header) {
        header = document.createElement("div");
        header.className = "custom-tile-header";
        tile.insertBefore(header, titleEl);
        header.append(titleEl);
      }

      const currentButton = header.querySelector(".tile-edit-button");
      const editButton = currentButton ? currentButton.cloneNode(true) : document.createElement("button");
      editButton.type = "button";
      editButton.className = "tile-edit-button";
      editButton.textContent = "✎";
      editButton.title = "编辑";
      editButton.setAttribute("aria-label", `编辑${titleEl.textContent}`);
      editButton.addEventListener("click", () => openEditor(tile));
      if (currentButton) {
        currentButton.replaceWith(editButton);
      } else {
        header.append(editButton);
      }
    });
  });
};

const PACKING_STORAGE_KEY = "tourapp.packing.items.v1";
const DEFAULT_PACKING_ITEMS = [
  { id: "passport", text: "护照与入境资料", done: true, starred: false, updatedAt: 4 },
  { id: "waterproof-phone-bag", text: "防水手机袋", done: true, starred: false, updatedAt: 3 },
  { id: "uss-light-bag", text: "环球轻便包", done: false, starred: false, updatedAt: 2 },
  { id: "aircon-jacket", text: "冷气外套", done: false, starred: false, updatedAt: 1 },
];

const packingListEl = document.querySelector("#packing-list");
const packingForm = document.querySelector("#packing-form");
const packingInput = document.querySelector("#packing-input");
const packingResetButton = document.querySelector("#packing-reset");

const createItemId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const CONTACT_STORAGE_KEY = "tourapp.contacts.v1";
const CONTACT_FIELDS = ["initials", "phone", "passport"];

const contactListEl = document.querySelector("#contact-list");
const contactForm = document.querySelector("#contact-form");
const contactAddTrigger = document.querySelector("#contact-add-trigger");
const contactSheet = document.querySelector("#contact-sheet");
const contactSheetTitle = document.querySelector("#contact-sheet-title");
const contactSheetClose = document.querySelector("#contact-sheet-close");
const contactInputs = {
  initials: document.querySelector("#contact-initials"),
  phone: document.querySelector("#contact-phone"),
  passport: document.querySelector("#contact-passport"),
};

const readContacts = () => {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let contacts = readContacts();
let editingContactId = null;
let openContactActionsId = null;

const saveContacts = () => {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // Local storage may be blocked; keep the current session interactive.
  }
};

const readContactFormValues = (inputs) =>
  CONTACT_FIELDS.reduce((values, field) => {
    values[field] = inputs[field]?.value.trim() || "";
    return values;
  }, {});

const hasContactValue = (contact) => CONTACT_FIELDS.some((field) => Boolean(contact[field]));

const clearContactForm = () => {
  CONTACT_FIELDS.forEach((field) => {
    if (contactInputs[field]) contactInputs[field].value = "";
  });
};

const fillContactForm = (contact) => {
  CONTACT_FIELDS.forEach((field) => {
    if (contactInputs[field]) contactInputs[field].value = contact?.[field] || "";
  });
};

const openContactSheet = (contact = null) => {
  editingContactId = contact?.id || null;
  openContactActionsId = null;
  fillContactForm(contact);
  if (contactSheetTitle) contactSheetTitle.textContent = contact ? "修改联系人" : "新增联系人";
  renderContactList();
  if (contactSheet) contactSheet.hidden = false;
  window.requestAnimationFrame(() => {
    contactInputs.initials?.focus({ preventScroll: true });
    contactInputs.initials?.select();
  });
};

const closeContactSheet = () => {
  editingContactId = null;
  clearContactForm();
  if (contactSheet) contactSheet.hidden = true;
};

const renderContactList = () => {
  if (!contactListEl) return;

  contactListEl.innerHTML = "";

  if (contacts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "contact-empty";
    empty.textContent = "还没有联系人。";
    contactListEl.append(empty);
    return;
  }

  contacts.forEach((contact) => {
    const row = document.createElement("div");
    row.className = "contact-item";
    if (openContactActionsId === contact.id) row.classList.add("is-actions-open");

    const values = document.createElement("div");
    values.className = "contact-values";
    values.addEventListener("pointerdown", (event) => {
      values.dataset.startX = String(event.clientX);
    });
    values.addEventListener("pointerup", (event) => {
      const startX = Number(values.dataset.startX);
      if (!Number.isFinite(startX)) return;
      const deltaX = event.clientX - startX;
      if (deltaX < -28) {
        openContactActionsId = contact.id;
      } else if (deltaX > 28) {
        openContactActionsId = null;
      }
      renderContactList();
    });

    CONTACT_FIELDS.forEach((field) => {
      const value = document.createElement("span");
      value.textContent = contact[field] || "-";
      values.append(value);
    });

    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "contact-icon-button";
    editButton.textContent = "✎";
    editButton.title = "编辑";
    editButton.setAttribute("aria-label", "编辑联系人");
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const latestContact = contacts.find((candidate) => candidate.id === contact.id);
      if (latestContact) openContactSheet(latestContact);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "contact-icon-button danger";
    deleteButton.textContent = "×";
    deleteButton.title = "删除";
    deleteButton.setAttribute("aria-label", "删除联系人");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const displayName = contact.initials || contact.phone || contact.passport || "这个联系人";
      if (!window.confirm(`确认删除 ${displayName} 吗？`)) return;
      contacts = contacts.filter((candidate) => candidate.id !== contact.id);
      openContactActionsId = null;
      saveContacts();
      renderContactList();
    });

    actions.append(editButton, deleteButton);
    row.append(values, actions);
    contactListEl.append(row);
  });
};

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextContact = { id: editingContactId || createItemId(), ...readContactFormValues(contactInputs) };
  if (!hasContactValue(nextContact)) return;

  contacts = editingContactId
    ? contacts.map((contact) => (contact.id === editingContactId ? nextContact : contact))
    : [...contacts, nextContact];
  closeContactSheet();
  saveContacts();
  renderContactList();
});

contactAddTrigger?.addEventListener("click", () => openContactSheet());
contactSheetClose?.addEventListener("click", closeContactSheet);
contactSheet?.addEventListener("click", (event) => {
  if (event.target === contactSheet) closeContactSheet();
});

const normalizePackingItems = (items) =>
  items.map((item, index) => ({
    id: item.id || createItemId(),
    text: item.text || "",
    done: Boolean(item.done),
    starred: Boolean(item.starred),
    updatedAt: Number(item.updatedAt) || index + 1,
  }));

const sortPackingItems = (items) =>
  [...items].sort((first, second) => {
    if (first.starred !== second.starred) return first.starred ? -1 : 1;
    if (first.done !== second.done) return first.done ? 1 : -1;
    return (second.updatedAt || 0) - (first.updatedAt || 0);
  });

const readPackingItems = () => {
  try {
    const raw = localStorage.getItem(PACKING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizePackingItems(Array.isArray(parsed) ? parsed : DEFAULT_PACKING_ITEMS);
  } catch {
    return normalizePackingItems(DEFAULT_PACKING_ITEMS);
  }
};

let packingItems = readPackingItems();
let editingPackingId = null;

const savePackingItems = () => {
  try {
    localStorage.setItem(PACKING_STORAGE_KEY, JSON.stringify(packingItems));
  } catch {
    // Local storage may be blocked; keep the current session interactive.
  }
};

const renderPackingList = () => {
  if (!packingListEl) return;

  packingListEl.innerHTML = "";

  if (packingItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "packing-empty";
    empty.textContent = "还没有物品，先添加一个。";
    packingListEl.append(empty);
    return;
  }

  sortPackingItems(packingItems).forEach((item) => {
    const row = document.createElement("div");
    row.className = "packing-item";
    if (item.done) row.classList.add("is-done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.setAttribute("aria-label", `完成 ${item.text}`);
    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      savePackingItems();
      renderPackingList();
    });

    row.append(checkbox);

    const starButton = document.createElement("button");
    starButton.type = "button";
    starButton.className = "packing-star-button";
    starButton.textContent = item.starred ? "★" : "☆";
    starButton.title = item.starred ? "取消星标" : "设为星标";
    starButton.setAttribute("aria-label", `${item.starred ? "取消星标" : "设为星标"} ${item.text}`);
    starButton.setAttribute("aria-pressed", String(item.starred));
    starButton.addEventListener("click", () => {
      item.starred = !item.starred;
      item.updatedAt = Date.now();
      savePackingItems();
      renderPackingList();
    });

    row.append(starButton);

    if (editingPackingId === item.id) {
      const editForm = document.createElement("form");
      editForm.className = "packing-edit-form";

      const input = document.createElement("input");
      input.type = "text";
      input.value = item.text;
      input.maxLength = 30;

      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "保存";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "取消";
      cancelButton.addEventListener("click", () => {
        editingPackingId = null;
        renderPackingList();
      });

      editForm.append(input, saveButton, cancelButton);
      editForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const nextText = input.value.trim();
        if (nextText) item.text = nextText;
        item.updatedAt = Date.now();
        editingPackingId = null;
        savePackingItems();
        renderPackingList();
      });

      row.append(editForm);
      packingListEl.append(row);
      input.focus();
      input.select();
      return;
    }

    const text = document.createElement("span");
    text.className = "packing-name";
    text.textContent = item.text;

    const actions = document.createElement("div");
    actions.className = "packing-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "packing-icon-button";
    editButton.textContent = "✎";
    editButton.title = "编辑";
    editButton.setAttribute("aria-label", `编辑 ${item.text}`);
    editButton.addEventListener("click", () => {
      editingPackingId = item.id;
      renderPackingList();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.className = "packing-icon-button danger";
    deleteButton.title = "删除";
    deleteButton.setAttribute("aria-label", `删除 ${item.text}`);
    deleteButton.addEventListener("click", () => {
      packingItems = packingItems.filter((candidate) => candidate.id !== item.id);
      savePackingItems();
      renderPackingList();
    });

    actions.append(editButton, deleteButton);
    row.append(text, actions);
    packingListEl.append(row);
  });
};

packingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = packingInput.value.trim();
  if (!text) return;

  packingItems = [...packingItems, { id: createItemId(), text, done: false, starred: false, updatedAt: Date.now() }];
  packingInput.value = "";
  savePackingItems();
  renderPackingList();
});

packingResetButton?.addEventListener("click", () => {
  packingItems = normalizePackingItems(DEFAULT_PACKING_ITEMS);
  editingPackingId = null;
  savePackingItems();
  renderPackingList();
});

const TODO_STORAGE_KEY = "tourapp.todo.items.v1";
const DEFAULT_TODO_ITEMS = [
  { id: "book-ifly", text: "预约 iFly Singapore / 新加坡风洞飞行", done: false },
  { id: "uss-ticket", text: "确认 Universal Studios Singapore / 新加坡环球影城门票", done: false },
  { id: "download-map", text: "下载新加坡离线地图", done: false },
];

const todoListEl = document.querySelector("#todo-list");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");

const readTodoItems = () => {
  try {
    const raw = localStorage.getItem(TODO_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_TODO_ITEMS.map((item) => ({ ...item }));
  } catch {
    return DEFAULT_TODO_ITEMS.map((item) => ({ ...item }));
  }
};

let todoItems = readTodoItems();
let editingTodoId = null;

const saveTodoItems = () => {
  try {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todoItems));
  } catch {
    // Local storage may be blocked; keep the current session interactive.
  }
};

const renderTodoList = () => {
  if (!todoListEl) return;

  todoListEl.innerHTML = "";
  const activeItems = todoItems.filter((item) => !item.done);

  if (activeItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "todo-empty";
    empty.textContent = "当前没有待办任务。";
    todoListEl.append(empty);
    return;
  }

  activeItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.setAttribute("aria-label", `完成 ${item.text}`);
    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      saveTodoItems();
      renderTodoList();
    });

    row.append(checkbox);

    if (editingTodoId === item.id) {
      const editForm = document.createElement("form");
      editForm.className = "todo-edit-form";

      const input = document.createElement("input");
      input.type = "text";
      input.value = item.text;
      input.maxLength = 36;

      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "保存";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "取消";
      cancelButton.addEventListener("click", () => {
        editingTodoId = null;
        renderTodoList();
      });

      editForm.append(input, saveButton, cancelButton);
      editForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const nextText = input.value.trim();
        if (nextText) item.text = nextText;
        editingTodoId = null;
        saveTodoItems();
        renderTodoList();
      });

      row.append(editForm);
      todoListEl.append(row);
      input.focus();
      input.select();
      return;
    }

    const text = document.createElement("span");
    text.className = "todo-name";
    text.textContent = item.text;

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "todo-icon-button";
    editButton.textContent = "✎";
    editButton.title = "编辑";
    editButton.setAttribute("aria-label", `编辑 ${item.text}`);
    editButton.addEventListener("click", () => {
      editingTodoId = item.id;
      renderTodoList();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "todo-icon-button danger";
    deleteButton.textContent = "×";
    deleteButton.title = "删除";
    deleteButton.setAttribute("aria-label", `删除 ${item.text}`);
    deleteButton.addEventListener("click", () => {
      todoItems = todoItems.filter((candidate) => candidate.id !== item.id);
      saveTodoItems();
      renderTodoList();
    });

    actions.append(editButton, deleteButton);
    row.append(text, actions);
    todoListEl.append(row);
  });
};

todoForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  todoItems = [...todoItems, { id: createItemId(), text, done: false }];
  todoInput.value = "";
  saveTodoItems();
  renderTodoList();
});

setupCustomTiles(document);
setupViewTabs();
setupRouteDayTabs();
registerOfflineCache();
renderHomePlan();
document.querySelector("#weather-refresh")?.addEventListener("click", updateWeather);
updateWeather();
renderContactList();
renderPackingList();
renderTodoList();
