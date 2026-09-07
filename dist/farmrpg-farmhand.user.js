// ==UserScript==
// @name Farm RPG Farmhand
// @description Farmhand for Farm RPG (fork of anstosa/farmrpg-farmhand) — inventory cap tracker, dependable perk automation with an on-screen indicator, mining support, and notification fixes
// @version 1.1.34
// @author Ansel Santosa <568242+anstosa@users.noreply.github.com>
// @match https://farmrpg.com/*
// @match https://www.farmrpg.com/*
// @match https://alpha.farmrpg.com/*
// @connect github.com
// @connect raw.githubusercontent.com
// @downloadURL https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/reed-mods/dist/farmrpg-farmhand.user.js
// @grant GM.deleteValue
// @grant GM.getValue
// @grant GM.listValues
// @grant GM.setClipboard
// @grant GM.setValue
// @grant GM.xmlHttpRequest
// @icon https://www.google.com/s2/favicons?sz=64&domain=farmrpg.com
// @license MIT
// @namespace https://github.com/anstosa/farmrpg-farmhand
// @updateURL https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/reed-mods/dist/farmrpg-farmhand.meta.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 3413:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getLocationNames = exports.getLocationEntries = exports.locationDataState = exports.questDataState = exports.pageDataState = exports.isItem = exports.getBasicItems = exports.getAbridgedItem = exports.itemDataState = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(6747);
exports.itemDataState = new state_1.CachedState(state_1.StorageKey.ITEM_DATA, (state, itemName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!itemName) {
        return;
    }
    const previous = state.state[itemName];
    if (previous) {
        return previous;
    }
    if (!itemName) {
        return;
    }
    const response = yield fetch(`https://buddy.farm/page-data/i/${(0, requests_1.nameToSlug)(itemName)}/page-data.json`);
    const data = (yield response.json());
    const item = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.farmrpg) === null || _c === void 0 ? void 0 : _c.items) === null || _d === void 0 ? void 0 : _d[0];
    if (!item) {
        console.error(`Item ${itemName} not found`);
        return previous;
    }
    return item;
}), {
    // seconds — this was under 3 hours despite saying a week; item data on
    // buddy.farm barely changes, so honour the week that was intended
    timeout: 60 * 60 * 24 * 7, // 1 week
});
const getAbridgedItem = (itemName) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield exports.itemDataState.get({ query: itemName, lazy: true });
    return item
        ? {
            __typename: item.__typename,
            id: item.id,
            image: item.image,
            name: item.name,
        }
        : {
            __typename: "FarmRPG_Item",
            id: 0,
            image: "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2aWV3Qm94PScwIDAgMTIwIDEyMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc+PGRlZnM+PGxpbmUgaWQ9J2wnIHgxPSc2MCcgeDI9JzYwJyB5MT0nNycgeTI9JzI3JyBzdHJva2U9JyM2YzZjNmMnIHN0cm9rZS13aWR0aD0nMTEnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcvPjwvZGVmcz48Zz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnIHRyYW5zZm9ybT0ncm90YXRlKDMwIDYwLDYwKScvPjx1c2UgeGxpbms6aHJlZj0nI2wnIG9wYWNpdHk9Jy4yNycgdHJhbnNmb3JtPSdyb3RhdGUoNjAgNjAsNjApJy8+PHVzZSB4bGluazpocmVmPScjbCcgb3BhY2l0eT0nLjI3JyB0cmFuc2Zvcm09J3JvdGF0ZSg5MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnIHRyYW5zZm9ybT0ncm90YXRlKDEyMCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMjcnIHRyYW5zZm9ybT0ncm90YXRlKDE1MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuMzcnIHRyYW5zZm9ybT0ncm90YXRlKDE4MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNDYnIHRyYW5zZm9ybT0ncm90YXRlKDIxMCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNTYnIHRyYW5zZm9ybT0ncm90YXRlKDI0MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNjYnIHRyYW5zZm9ybT0ncm90YXRlKDI3MCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuNzUnIHRyYW5zZm9ybT0ncm90YXRlKDMwMCA2MCw2MCknLz48dXNlIHhsaW5rOmhyZWY9JyNsJyBvcGFjaXR5PScuODUnIHRyYW5zZm9ybT0ncm90YXRlKDMzMCA2MCw2MCknLz48L2c+PC9zdmc+",
            name: itemName,
        };
});
exports.getAbridgedItem = getAbridgedItem;
const getBasicItems = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { items } = (_a = (yield exports.pageDataState.get())) !== null && _a !== void 0 ? _a : {};
    return (_b = items === null || items === void 0 ? void 0 : items.map(({ name, image }) => ({ name, image }))) !== null && _b !== void 0 ? _b : [];
});
exports.getBasicItems = getBasicItems;
const isItem = (name) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const items = yield (0, exports.getBasicItems)();
    const searchName = (_a = requests_1.NAME_OVERRIDES[name]) !== null && _a !== void 0 ? _a : name;
    return items.some((item) => item.name === searchName);
});
exports.isItem = isItem;
exports.pageDataState = new state_1.CachedState(state_1.StorageKey.PAGE_DATA, () => __awaiter(void 0, void 0, void 0, function* () {
    const pages = {
        townsfolk: [],
        questlines: [],
        quizzes: [],
        quests: [],
        items: [],
        pages: [],
    };
    const response = yield fetch("https://buddy.farm/search.json");
    const data = (yield response.json());
    for (const page of data) {
        // eslint-disable-next-line unicorn/prefer-switch
        if (page.type === "Townsfolk") {
            pages.townsfolk.push(page);
        }
        else if (page.type === "Questline") {
            pages.questlines.push(page);
        }
        else if (page.type === "Schoolhouse Quiz") {
            pages.quizzes.push(page);
        }
        else if (page.href.startsWith("/q/")) {
            pages.quests.push(page);
        }
        else if (page.href.startsWith("/i/")) {
            pages.items.push(page);
        }
        else {
            pages.pages.push(page);
        }
    }
    return pages;
}), {
    timeout: 60 * 60 * 24, // 1 day
    defaultState: {
        townsfolk: [],
        questlines: [],
        quizzes: [],
        quests: [],
        items: [],
        pages: [],
    },
});
// Quest requirements, keyed by the quest's display name — the game's quest list
// gives ids and titles, buddy.farm indexes by slug, and the title is the only
// thing the two share. Cached for a week alongside item data; quest definitions
// change about as often.
exports.questDataState = new state_1.CachedState(state_1.StorageKey.QUEST_DATA, (state, questName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!questName) {
        return;
    }
    const previous = state.state[questName];
    if (previous) {
        return previous;
    }
    const response = yield fetch(`https://buddy.farm/page-data/q/${(0, requests_1.nameToSlug)(questName)}/page-data.json`);
    if (!response.ok) {
        return previous;
    }
    const data = (yield response.json());
    const quest = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.farmrpg) === null || _c === void 0 ? void 0 : _c.quests) === null || _d === void 0 ? void 0 : _d[0];
    if (!quest) {
        console.error(`Quest ${questName} not found`);
        return previous;
    }
    return quest;
}), {
    timeout: 60 * 60 * 24 * 7, // 1 week
});
// A location's in-game id, so drop advice can link straight to the place
// rather than just naming it.
//
// buddy.farm mirrors the game's own database ids -- verified against ten items
// whose ids Reed's Craftworks page reported independently, all exact -- and the
// id lives on the page's `pageContext`, not on the location record itself.
exports.locationDataState = new state_1.CachedState(state_1.StorageKey.LOCATION_DATA, (state, locationName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (!locationName) {
        return;
    }
    const previous = state.state[locationName];
    if (previous) {
        return previous;
    }
    const response = yield fetch(`https://buddy.farm/page-data/l/${(0, requests_1.nameToSlug)(locationName)}/page-data.json`);
    if (!response.ok) {
        return previous;
    }
    const data = (yield response.json());
    const location = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.farmrpg) === null || _c === void 0 ? void 0 : _c.locations) === null || _d === void 0 ? void 0 : _d[0];
    const id = (_f = (_e = data === null || data === void 0 ? void 0 : data.result) === null || _e === void 0 ? void 0 : _e.pageContext) === null || _f === void 0 ? void 0 : _f.id;
    if (!location || !id) {
        return previous;
    }
    // Prefer the profile that assumes no perks, so a quoted rate is one the
    // player can definitely hit; fall back to whatever exists if every profile
    // needs one. Rates are per item, so the best across profiles is kept.
    const profiles = (_g = location.dropRates) !== null && _g !== void 0 ? _g : [];
    const plain = profiles.filter((profile) => !profile.ironDepot && !profile.runecube);
    const best = new Map();
    for (const profile of plain.length > 0 ? plain : profiles) {
        for (const entry of (_h = profile.items) !== null && _h !== void 0 ? _h : []) {
            if (!((_j = entry.item) === null || _j === void 0 ? void 0 : _j.name) || !entry.rate) {
                continue;
            }
            const existing = best.get(entry.item.name);
            if (!existing || entry.rate < existing.rate) {
                best.set(entry.item.name, {
                    id: entry.item.id,
                    name: entry.item.name,
                    rate: entry.rate,
                });
            }
        }
    }
    return {
        drops: [...best.values()].sort((a, b) => a.rate - b.rate),
        id,
        name: location.name,
        type: location.type,
    };
}), {
    timeout: 60 * 60 * 24 * 7, // 1 week
});
// Every location buddy.farm knows, for matching a page title against. They land
// in the catch-all `pages` bucket, identified by their /l/ href.
const getLocationEntries = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { pages } = (_a = (yield exports.pageDataState.get())) !== null && _a !== void 0 ? _a : {};
    return (pages !== null && pages !== void 0 ? pages : [])
        .filter((page) => page.href.startsWith("/l/"))
        .map((page) => ({ image: page.image, name: page.name }));
});
exports.getLocationEntries = getLocationEntries;
const getLocationNames = () => __awaiter(void 0, void 0, void 0, function* () {
    const entries = yield (0, exports.getLocationEntries)();
    return entries.map((entry) => entry.name);
});
exports.getLocationNames = getLocationNames;


/***/ }),

/***/ 498:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gatherRecipeGraph = void 0;
const api_1 = __webpack_require__(3413);
const craftPlanner_1 = __webpack_require__(5825);
// Walking the graph is kept apart from planning against it on purpose: the
// planner is pure arithmetic and unit-testable with no DOM and no network,
// while this half is the only piece that talks to buddy.farm.
const MAX_NODES = 250;
const toNode = (item) => {
    var _a;
    return ({
        canCraft: item.canCraft,
        craftingLevel: item.craftingLevel,
        id: item.id,
        image: item.image,
        ingredients: ((_a = item.recipeItems) !== null && _a !== void 0 ? _a : []).map((entry) => ({
            name: entry.item.name,
            quantity: entry.quantity,
        })),
        item,
        name: item.name,
    });
};
// Walk the recipe tree from `roots` down to items with no recipe, fetching each
// item's buddy.farm page exactly once. Breadth-first and batched so a deep tree
// costs one round of parallel requests per level rather than one per node. Item
// data is cached in GM storage for a week, so this is nearly free after the
// first walk.
const gatherRecipeGraph = (roots) => __awaiter(void 0, void 0, void 0, function* () {
    const nodes = new Map();
    const unknown = new Set();
    let truncated = false;
    let frontier = [...new Set(roots)];
    for (let depth = 0; depth < craftPlanner_1.MAX_DEPTH && frontier.length > 0; depth++) {
        const batch = frontier.filter((name) => !nodes.has(name) && !unknown.has(name));
        if (batch.length === 0) {
            break;
        }
        if (nodes.size + batch.length > MAX_NODES) {
            truncated = true;
            break;
        }
        const items = yield Promise.all(batch.map((name) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield api_1.itemDataState.get({ query: name });
            }
            catch (_a) { }
        })));
        const next = [];
        for (const [index, item] of items.entries()) {
            const name = batch[index];
            if (!item) {
                unknown.add(name);
                continue;
            }
            const node = toNode(item);
            // key by the name we asked for as well as the canonical one, so lookups
            // by either spelling hit (buddy.farm renames a few, see NAME_OVERRIDES)
            nodes.set(name, node);
            nodes.set(node.name, node);
            if (node.canCraft) {
                next.push(...node.ingredients.map((entry) => entry.name));
            }
        }
        frontier = next;
    }
    if (frontier.length > 0) {
        truncated = true;
    }
    return { nodes, unknown, truncated };
});
exports.gatherRecipeGraph = gatherRecipeGraph;


/***/ }),

/***/ 6747:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.nameToSlug = exports.NAME_OVERRIDES = void 0;
exports.NAME_OVERRIDES = {
    "Gold Pea": "Gold Peas",
    "Gold Pepper": "Gold Peppers",
    "Mega Beet": "Mega Beet Seeds",
    "Mega Sunflower": "Mega Sunflower Seeds",
    "Mega Cotton": "Mega Cotton Seeds",
    Pea: "Peas",
    Pepper: "Peppers",
    Pine: "Pine Tree",
};
const nameToSlug = (name) => {
    var _a;
    let slug = (_a = exports.NAME_OVERRIDES[name]) !== null && _a !== void 0 ? _a : name;
    // delete item markings
    slug = slug.replaceAll("*", "");
    // trim whitespace
    slug = slug.trim();
    // lowercase
    slug = slug.toLowerCase();
    // replace punctuation and whitespace with hyphens
    slug = slug.replaceAll(/[^\da-z]/g, "-");
    return slug;
};
exports.nameToSlug = nameToSlug;


/***/ }),

/***/ 4938:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.withdrawSilver = exports.depositSilver = exports.statsState = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const processStats = (root) => {
    var _a;
    const matches = (_a = root.body.textContent) === null || _a === void 0 ? void 0 : _a.match(/[^\d,]+([\d,]+)[^\d,]+([\d,]+)[^\d,]+([\d,]+)/);
    if (!matches || matches.length < 4) {
        return { silver: 0, gold: 0, ancientCoins: 0 };
    }
    const [_, silverMatch, goldMatch, ancientCoinsMatch] = matches;
    const silver = Number(silverMatch.replaceAll(",", ""));
    const gold = Number(goldMatch.replaceAll(",", ""));
    const ancientCoins = Number(ancientCoinsMatch.replaceAll(",", ""));
    return { silver, gold, ancientCoins };
};
exports.statsState = new state_1.CachedState(state_1.StorageKey.STATS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.GET_STATS }));
    return processStats(response);
}), {
    interceptors: [
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.GET_STATS })],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                state.set(processStats(yield (0, requests_1.getDocument)(response)));
            }),
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.DEPOSIT_SILVER }),
            ],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const [_, query] = (0, requests_2.parseUrl)(response.url);
                if (!previous) {
                    return;
                }
                yield state.set(Object.assign(Object.assign({}, previous), { silver: previous.silver - Number(query.get("amt")) }));
            }),
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.WITHDRAW_SILVER }),
            ],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const [_, query] = (0, requests_2.parseUrl)(response.url);
                if (!previous) {
                    return;
                }
                yield state.set(Object.assign(Object.assign({}, previous), { silver: previous.silver + Number(query.get("amt")) }));
            }),
        },
    ],
    defaultState: {
        silver: 0,
        gold: 0,
        ancientCoins: 0,
    },
});
const depositSilver = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.DEPOSIT_SILVER, amt: amount.toString() }));
});
exports.depositSilver = depositSilver;
const withdrawSilver = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({
        go: page_1.WorkerGo.WITHDRAW_SILVER,
        amt: amount.toString(),
    }));
});
exports.withdrawSilver = withdrawSilver;


/***/ }),

/***/ 920:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.restoreQueue = exports.setQueueRunning = exports.activateSet = exports.craftworksState = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3300);
const craftworks_1 = __webpack_require__(7831);
const page_1 = __webpack_require__(7952);
// The Craftworks queue, fetched rather than read off the page in view, so the
// home panel can report on it from anywhere.
//
// No `defaultState`, for the same reason as the inventory snapshot: `set()`
// merges over an object default, and a queue whose slots were removed must
// replace the old list outright rather than keep asserting stale slots. A
// parse that finds no slots returns undefined and keeps the last good read.
exports.craftworksState = new state_1.CachedState(state_1.StorageKey.CRAFTWORKS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_1.getHTML)(page_1.Page.CRAFTWORKS, new URLSearchParams());
    const slots = (0, craftworks_1.parseSlots)(response.body);
    if (slots.length === 0) {
        return;
    }
    return {
        maxSlots: (0, craftworks_1.getMaxSlots)(response.body),
        sets: (0, craftworks_1.parseSavedSets)(response.body),
        slots,
        updatedAt: Date.now(),
    };
}), {
    timeout: 5 * 60, // 5 minutes
});
// worker.php answers these with a bare word ("success", "cannotadd"), not JSON
// or HTML, so this goes through fetch directly. It still passes through the
// patched window.fetch, so the usual interceptors observe it.
const postWorker = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch((0, requests_1.toUrl)(page_1.Page.WORKER, query), {
        credentials: "include",
        method: "POST",
        mode: "cors",
    });
    const text = yield response.text();
    return text.trim();
});
// Load a saved set from anywhere, the way the perk manager loads a perk set.
//
// The game's own button fires `removeallcw` fire-and-forget, waits a fixed
// 500ms, then activates — so a failed activation leaves the queue wiped with
// nothing to restore it. This awaits the wipe, refuses to continue if it did
// not come back, and hands the caller the previous queue either way so a
// failure can be walked back. That is why it is worth reimplementing here
// rather than forwarding a click: the copy is strictly safer than the original.
const activateSet = (setId_1, previous_1, ...args_1) => __awaiter(void 0, [setId_1, previous_1, ...args_1], void 0, function* (setId, previous, autoPlay = false) {
    try {
        yield postWorker(new URLSearchParams({ go: "removeallcw" }));
    }
    catch (_a) {
        // nothing was wiped, so nothing is lost
        return {
            message: "Could not clear the queue; nothing was changed.",
            ok: false,
            previous,
        };
    }
    try {
        const result = yield postWorker(new URLSearchParams({ go: "activatecwset", id: setId }));
        if (result !== "success") {
            return {
                message: `The queue was cleared but the set did not load (${result || "no response"}).`,
                ok: false,
                previous,
            };
        }
    }
    catch (_b) {
        return {
            message: "The queue was cleared but the set did not load.",
            ok: false,
            previous,
        };
    }
    if (autoPlay) {
        // a freshly loaded set is no use sitting paused, and whether it arrives
        // paused depends on how the set was saved -- so assert it either way
        try {
            yield postWorker(new URLSearchParams({ go: "playallcw" }));
        }
        catch (_c) {
            // the set did load; failing to start it is not worth failing the whole
            // operation over, and the queue toggle can start it
        }
    }
    yield exports.craftworksState.get({ ignoreCache: true });
    return { message: "Set loaded.", ok: true, previous };
});
exports.activateSet = activateSet;
// Start or stop every slot. Neither call takes parameters, and both are
// reversible, so this needs no confirmation the way loading a set does.
const setQueueRunning = (play) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield postWorker(new URLSearchParams({ go: play ? "playallcw" : "pauseallcw" }));
        yield exports.craftworksState.get({ ignoreCache: true });
        return result === "success" || result === "";
    }
    catch (_a) {
        return false;
    }
});
exports.setQueueRunning = setQueueRunning;
// Put a queue back, in order. Appending each item to the bottom reproduces the
// original order without needing the reorder endpoint.
const restoreQueue = (slots) => __awaiter(void 0, void 0, void 0, function* () {
    let restored = 0;
    for (const slot of slots) {
        if (!slot.id) {
            continue;
        }
        try {
            const result = yield postWorker(new URLSearchParams({ go: "addcwitem", id: slot.id, pos: "bot" }));
            if (result === "success") {
                restored += 1;
            }
        }
        catch (_a) {
            break;
        }
    }
    yield exports.craftworksState.get({ ignoreCache: true });
    return restored;
});
exports.restoreQueue = restoreQueue;


/***/ }),

/***/ 6228:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.harvestAll = exports.withFarmingPerks = exports.farmIdState = exports.farmStatusState = exports.CropStatus = void 0;
const perks_1 = __webpack_require__(5543);
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const popup_1 = __webpack_require__(469);
var CropStatus;
(function (CropStatus) {
    CropStatus["EMPTY"] = "empty";
    CropStatus["GROWING"] = "growing";
    CropStatus["READY"] = "ready";
})(CropStatus || (exports.CropStatus = CropStatus = {}));
const processFarmStatus = (root) => {
    const statusText = root.textContent;
    if (!statusText) {
        return {
            status: CropStatus.EMPTY,
            count: 0,
            readyAt: Number.POSITIVE_INFINITY,
        };
    }
    // 36 READY!
    const count = Number(statusText.split(" ")[0]);
    let status = CropStatus.EMPTY;
    let readyAt = Number.POSITIVE_INFINITY;
    if (statusText.toLowerCase().includes("growing")) {
        status = CropStatus.GROWING;
        // new sure when ready, check again in a minute
        readyAt = Date.now() + 60 * 1000;
    }
    else if (statusText.toLowerCase().includes("ready")) {
        status = CropStatus.READY;
        readyAt = Date.now();
    }
    return { status, count, readyAt };
};
const processFarmPage = (root) => {
    var _a;
    const plots = root.querySelectorAll("#croparea #crops .col-25");
    const count = plots.length;
    let status = CropStatus.EMPTY;
    let readyAt = Number.POSITIVE_INFINITY;
    for (const plot of plots) {
        const image = plot.querySelector("img");
        if ((image === null || image === void 0 ? void 0 : image.style.opacity) === "1") {
            status = CropStatus.READY;
            readyAt = Date.now();
        }
        else if (status === CropStatus.EMPTY) {
            status = CropStatus.GROWING;
            readyAt = Math.min(readyAt, Date.now() + Number((_a = image === null || image === void 0 ? void 0 : image.dataset.seconds) !== null && _a !== void 0 ? _a : "60") * 1000);
        }
    }
    return { status, count, readyAt };
};
const scheduledUpdates = {};
exports.farmStatusState = new state_1.CachedState(state_1.StorageKey.FARM_STATUS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.FARM, new URLSearchParams());
    return processFarmPage(response.body);
}), {
    timeout: 5,
    // Live status, so don't keep it between sessions. A five-second value
    // written to storage means last session's crop status is still sitting there
    // at the next load, where it can merge into the first update and show a
    // banner for crops that aren't ready — before any of this session's data has
    // arrived. Every other live state here opts out the same way.
    persist: false,
    defaultState: {
        status: CropStatus.EMPTY,
        count: 4,
        readyAt: Number.POSITIVE_INFINITY,
    },
    interceptors: [
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.READY_COUNT })],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                state.set(processFarmStatus(root.body));
            }),
        },
        {
            match: [page_1.Page.FARM, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                yield state.set(processFarmPage(root.body));
            }),
        },
        {
            match: [page_1.Page.HOME_PATH, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                const linkStatus = root.body.querySelector("a[href^='xfarm.php'] .item-after");
                if (!linkStatus) {
                    return;
                }
                yield state.set(processFarmStatus(linkStatus));
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.FARM_STATUS })],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const raw = yield response.text();
                const rawPlots = raw.split(";");
                if (rawPlots.length < ((_a = previous === null || previous === void 0 ? void 0 : previous.count) !== null && _a !== void 0 ? _a : 4)) {
                    yield state.set(Object.assign(Object.assign({}, previous), { status: CropStatus.EMPTY }));
                    return;
                }
                let status = CropStatus.EMPTY;
                for (const plot of rawPlots) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const [plotId, percent, secondsLeft, secondsSince] = plot.split("-");
                    const percentReady = Number(percent);
                    if (percentReady === 100) {
                        status = CropStatus.READY;
                        break;
                    }
                    else if (percentReady > 0) {
                        status = CropStatus.GROWING;
                    }
                }
                yield state.set(Object.assign(Object.assign({}, previous), { status }));
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.HARVEST_ALL })],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set(Object.assign(Object.assign({}, previous), { status: CropStatus.EMPTY }));
                const { drops } = (yield response.json());
                const [page] = (0, page_1.getPage)();
                const settings = yield (0, settings_1.getSettingValues)();
                if (page !== page_1.Page.FARM || settings[settings_1.SettingId.HARVEST_NOTIFICATIONS]) {
                    (0, popup_1.showPopup)({
                        title: "Harvested Crops",
                        contentHTML: `
              ${Object.values(drops)
                            .map((drop) => `
                    <img
                      src="${drop.img}"
                      style="
                        vertical-align: middle;
                        width: 18px;
                      "
                    >
                    (x${drop.qty})
                  `)
                            .join("&nbsp;")}
            `,
                        actions: [
                            {
                                name: "Replant",
                                buttonClass: "btnblue",
                                callback: () => __awaiter(void 0, void 0, void 0, function* () {
                                    const farmId = yield exports.farmIdState.get();
                                    if (!farmId) {
                                        console.error("No farm id found");
                                        return;
                                    }
                                    yield (0, exports.withFarmingPerks)(() => __awaiter(void 0, void 0, void 0, function* () {
                                        var _a;
                                        if (page === page_1.Page.FARM) {
                                            (_a = document
                                                .querySelector(".plantallbtn")) === null || _a === void 0 ? void 0 : _a.click();
                                        }
                                        else {
                                            yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({
                                                go: page_1.WorkerGo.PLANT_ALL,
                                                id: String(farmId),
                                            }));
                                        }
                                    }));
                                }),
                            },
                        ],
                    });
                }
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.PLANT_ALL })],
            callback: (state, previous) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set(Object.assign(Object.assign({}, previous), { status: CropStatus.GROWING }));
            }),
        },
    ],
});
const updateStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = exports.farmStatusState.read();
    if (!state) {
        return;
    }
    if (state.status !== CropStatus.READY && state.readyAt < Date.now()) {
        // time's up — verify against the real farm page instead of assuming ready
        yield exports.farmStatusState.get({ ignoreCache: true });
    }
});
// automatically update crops when finished
exports.farmStatusState.onUpdate((state) => {
    if (!state) {
        return;
    }
    if (scheduledUpdates[state.readyAt]) {
        return;
    }
    scheduledUpdates[state.readyAt] = setTimeout(updateStatus, state.readyAt - Date.now());
});
const processFarmId = (root) => {
    var _a;
    const farmIdRaw = (_a = root.querySelector("#farm")) === null || _a === void 0 ? void 0 : _a.textContent;
    return farmIdRaw ? Number(farmIdRaw) : undefined;
};
exports.farmIdState = new state_1.CachedState(state_1.StorageKey.FARM_ID, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.FARM, new URLSearchParams());
    return processFarmId(response.body);
}), {
    timeout: Number.POSITIVE_INFINITY,
    defaultState: -1,
    interceptors: [
        {
            match: [page_1.Page.FARM, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                yield state.set(processFarmId(root.body));
            }),
        },
        {
            match: [page_1.Page.HOME_PATH, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                const status = root.body.querySelector("a[href^='xfarm.php'] .item-after span");
                if (!status) {
                    return;
                }
                yield state.set(Number(status.dataset.id));
            }),
        },
    ],
});
// Makes sure the right perks are equipped for a harvest/replant roll, then
// rolls it. The farm perks are whichever set is named "Farming", or Default
// when there's no such set (where most players, Reed included, keep them).
//
// This is a GATED ACTION — the harvest is fired the instant the switch resolves
// and its yield depends on the perks — so it uses the same contract as the item
// page quick actions: `force` (the optimistic active-set cache drifts, and when
// it wrongly reads "already on" the switch is skipped and the harvest rolls
// under whatever is really equipped) and `settle` (the game acks
// activateperkset BEFORE it finishes equipping, so an action fired immediately
// after runs under the OLD perks). That is exactly what went wrong harvesting
// from the crops-ready banner on an item page: the quick-sell/craft set is left
// equipped there on purpose, so the harvest was a real cross-set switch and,
// unsettled, rolled under the selling/crafting perks.
//
// It stays snappy where it always was: activatePerkSet short-circuits on
// `confirmedEquippedSetId` BEFORE it looks at `force`, so harvesting from Home
// or the farm — where the reconciler has already confirmed Default equipped —
// costs zero requests. Only a genuine cross-set harvest pays the settle.
const withFarmingPerks = (action) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield (0, settings_1.getSettingValues)();
    if (!settings[settings_1.SettingId.PERK_MANAGER]) {
        yield action();
        return;
    }
    const farmingPerks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.FARMING);
    const defaultPerks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.DEFAULT);
    const harvestPerks = farmingPerks !== null && farmingPerks !== void 0 ? farmingPerks : defaultPerks;
    if (harvestPerks) {
        yield (0, perks_1.activatePerkSet)(harvestPerks, { force: true, settle: true });
    }
    yield action();
    // Only a dedicated Farming set needs putting away; without one we harvested
    // under Default and are already where the reconciler wants us. No settle and
    // no reset here — nothing reads the perks after this, so the clean-slate
    // round-trip would only add the lag that made harvest feel slow before.
    if (farmingPerks && defaultPerks) {
        yield (0, perks_1.activatePerkSet)(defaultPerks, { reset: false });
    }
});
exports.withFarmingPerks = withFarmingPerks;
const harvestAll = () => (0, exports.withFarmingPerks)(() => __awaiter(void 0, void 0, void 0, function* () {
    const farmId = yield exports.farmIdState.get();
    yield (0, requests_2.getJSON)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.HARVEST_ALL, id: String(farmId) }));
}));
exports.harvestAll = harvestAll;


/***/ }),

/***/ 7046:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.chatState = exports.musicState = exports.darkModeState = exports.betaState = exports.userIdState = exports.usernameState = void 0;
const state_1 = __webpack_require__(4782);
exports.usernameState = new state_1.CachedState(state_1.StorageKey.USERNAME, () => {
    var _a;
    return Promise.resolve(((_a = document.querySelector("#logged_in_username")) === null || _a === void 0 ? void 0 : _a.textContent) || undefined);
}, {
    timeout: Number.POSITIVE_INFINITY, // never expire
    persist: false,
    defaultState: "",
});
exports.userIdState = new state_1.CachedState(state_1.StorageKey.USERNAME, () => {
    var _a;
    const userIdRaw = (_a = document.querySelector("#logged_in_userid")) === null || _a === void 0 ? void 0 : _a.textContent;
    return Promise.resolve(userIdRaw ? Number(userIdRaw) : undefined);
}, {
    timeout: Number.POSITIVE_INFINITY, // never expire
    persist: false,
    defaultState: -1,
});
exports.betaState = new state_1.CachedState(state_1.StorageKey.IS_BETA, () => { var _a; return Promise.resolve(((_a = document.querySelector("#is_beta")) === null || _a === void 0 ? void 0 : _a.textContent) === "1"); }, {
    timeout: Number.POSITIVE_INFINITY, // never expire
    persist: false,
    defaultState: false,
});
exports.darkModeState = new state_1.CachedState(state_1.StorageKey.IS_DARK_MODE, () => { var _a; return Promise.resolve(((_a = document.querySelector("#dark_mode")) === null || _a === void 0 ? void 0 : _a.textContent) === "1"); }, {
    timeout: Number.POSITIVE_INFINITY, // never expire
    persist: false,
    defaultState: false,
});
exports.musicState = new state_1.CachedState(state_1.StorageKey.IS_MUSIC_ENABLED, () => { var _a; return Promise.resolve(((_a = document.querySelector("#dark_mode")) === null || _a === void 0 ? void 0 : _a.textContent) === "1"); }, {
    timeout: Number.POSITIVE_INFINITY, // never expire
    persist: false,
    defaultState: true,
});
exports.chatState = new state_1.CachedState(state_1.StorageKey.IS_CHAT_ENABLED, () => { var _a; return Promise.resolve(((_a = document.querySelector("#chat")) === null || _a === void 0 ? void 0 : _a.textContent) === "1"); }, {
    timeout: Number.POSITIVE_INFINITY, // never expire
    persist: false,
    defaultState: true,
});


/***/ }),

/***/ 4514:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.publishInventoryPage = exports.inventoryState = exports.toInventorySnapshot = exports.parseInventoryPage = exports.getRowCount = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
// e.g. "you cannot store more than 200 of any one item"
const INVENTORY_CAP_PATTERN = /more than ([\d,]+) of any/g;
// count text of an inventory row, excluding any badge the cap warnings appended
const getRowCount = (after) => {
    const countText = [...after.childNodes]
        .filter((node) => !(node instanceof HTMLElement && node.classList.contains("fh-cap-badge")))
        .map((node) => { var _a; return (_a = node.textContent) !== null && _a !== void 0 ? _a : ""; })
        .join("");
    return Number(countText.replaceAll(",", "").trim());
};
exports.getRowCount = getRowCount;
// An inventory row's title is the item name followed by a description and
// sometimes a status flag:
//
//   <div class="item-title">Iron<br><span>A pressing need</span>MAX ON HAND</div>
//
// so reading its textContent yields "Iron\n A pressing needMAX ON HAND". That
// was cosmetic while only the cap tracker used it, but these names are the keys
// of the inventory snapshot the planner looks items up by, and a mangled key
// matches nothing — every lookup for such an item silently reported zero on
// hand. The name is the leading text node, before any markup.
const getRowName = (title) => {
    var _a, _b;
    if (!title) {
        return undefined;
    }
    for (const node of title.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            if (text) {
                return text;
            }
            continue;
        }
        // stop at the first element: anything past it is description or status
        break;
    }
    return (_b = title.textContent) === null || _b === void 0 ? void 0 : _b.trim().split("\n")[0].trim();
};
// Parse every item row out of an inventory page DOM, plus the storage cap.
// This is the whole inventory, unfiltered — the cap tracker narrows it down to
// the at/near-cap rows, the craft planner wants all of it. Returns undefined
// when the page carries no cap text at all, which is how a fetch that landed
// somewhere else (a login redirect, an error page) is told apart from a
// genuinely empty inventory.
const parseInventoryPage = (root) => {
    var _a, _b, _c, _d;
    // the page can mention several caps (e.g. the wagon upgrade pitch quotes
    // the next tier's number), so use the smallest match: that is always the
    // player's current cap
    const caps = [...((_a = root.textContent) !== null && _a !== void 0 ? _a : "").matchAll(INVENTORY_CAP_PATTERN)]
        .map((match) => Number(match[1].replaceAll(",", "")))
        .filter((value) => value > 0);
    if (caps.length === 0) {
        return undefined;
    }
    const cap = Math.min(...caps);
    const rows = [];
    for (const row of root.querySelectorAll(".list-group li")) {
        if (row.classList.contains("item-divider")) {
            continue;
        }
        const after = row.querySelector(".item-after");
        const link = (_b = row.querySelector("a.item-link")) !== null && _b !== void 0 ? _b : row.querySelector("a");
        if (!after || !link) {
            continue;
        }
        const count = (0, exports.getRowCount)(after);
        if (Number.isNaN(count)) {
            continue;
        }
        const image = row.querySelector(".item-media img");
        const name = getRowName(row.querySelector(".item-title"));
        if (!name) {
            continue;
        }
        rows.push({
            count,
            href: (_c = link.getAttribute("href")) !== null && _c !== void 0 ? _c : "inventory.php",
            image: (_d = image === null || image === void 0 ? void 0 : image.getAttribute("src")) !== null && _d !== void 0 ? _d : undefined,
            name,
        });
    }
    return { cap, rows };
};
exports.parseInventoryPage = parseInventoryPage;
const toInventorySnapshot = (page) => {
    var _a;
    const quantities = {};
    for (const row of page.rows) {
        // the page lists an item once, but sum defensively rather than let a
        // duplicate row silently overwrite the real count
        quantities[row.name] = ((_a = quantities[row.name]) !== null && _a !== void 0 ? _a : 0) + row.count;
    }
    return { cap: page.cap, quantities, updatedAt: Date.now() };
};
exports.toInventorySnapshot = toInventorySnapshot;
// The player's current inventory, as a name -> count map.
//
// No `defaultState`: with an object default, `set` merges over the previous
// value, which for a full snapshot is wrong — an item spent down to zero drops
// off the page entirely and a merge would keep asserting the stale count. With
// no default, a fresh snapshot replaces the old one wholesale, and `set(undefined)`
// (a parse that produced nothing) keeps the last good one instead of asserting
// an empty inventory.
exports.inventoryState = new state_1.CachedState(state_1.StorageKey.INVENTORY, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_1.getHTML)(page_1.Page.INVENTORY, new URLSearchParams());
    const page = (0, exports.parseInventoryPage)(response.body);
    return page ? (0, exports.toInventorySnapshot)(page) : undefined;
}), {
    timeout: 10 * 60, // 10 minutes
});
// Publish an already-parsed page into the snapshot. Callers that fetched or
// rendered the inventory for their own reasons use this so the planner rides
// along on a request that already happened instead of issuing its own.
const publishInventoryPage = (page) => {
    exports.inventoryState.set((0, exports.toInventorySnapshot)(page));
};
exports.publishInventoryPage = publishInventoryPage;


/***/ }),

/***/ 202:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collectAll = exports.kitchenStatusState = exports.OvenStatus = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const popup_1 = __webpack_require__(469);
const time_1 = __webpack_require__(4435);
var OvenStatus;
(function (OvenStatus) {
    OvenStatus["EMPTY"] = "empty";
    OvenStatus["COOKING"] = "cooking";
    OvenStatus["ATTENTION"] = "attention";
    OvenStatus["READY"] = "complete";
})(OvenStatus || (exports.OvenStatus = OvenStatus = {}));
const processKitchenStatus = (root) => {
    const statusText = root === null || root === void 0 ? void 0 : root.textContent;
    if (!statusText) {
        // leave count untouched; only the kitchen page knows how many ovens exist
        return {
            status: OvenStatus.EMPTY,
            allReady: false,
            checkAt: Number.POSITIVE_INFINITY,
        };
    }
    let status = OvenStatus.EMPTY;
    let checkAt = Number.POSITIVE_INFINITY;
    let allReady = false;
    if (statusText.toLowerCase().includes("cooking")) {
        status = OvenStatus.COOKING;
        checkAt = Date.now() + 60 * 1000;
    }
    else if (statusText.toLowerCase().includes("attention")) {
        status = OvenStatus.ATTENTION;
        checkAt = Date.now() + 60 * 1000;
        // something needs attention, figure out what
        exports.kitchenStatusState.get();
    }
    else if (statusText.toLowerCase().includes("ready")) {
        status = OvenStatus.READY;
        checkAt = Number.POSITIVE_INFINITY;
        allReady = true;
    }
    return { status, checkAt, allReady };
};
const processKitchenPage = (root) => {
    const ovens = root.querySelectorAll("a[href^='oven.php']");
    const count = ovens.length;
    let status = OvenStatus.EMPTY;
    let checkAt = Number.POSITIVE_INFINITY;
    let allReady = true;
    for (const oven of ovens) {
        const statusText = oven.querySelector(".item-after span");
        if (!(statusText === null || statusText === void 0 ? void 0 : statusText.dataset.countdownTo)) {
            continue;
        }
        const doneDate = (0, time_1.timestampToDate)(statusText.dataset.countdownTo);
        const now = new Date();
        if (doneDate < now) {
            status = OvenStatus.READY;
            checkAt = Math.min(checkAt, Number.POSITIVE_INFINITY);
            break;
        }
        const tasks = oven.querySelectorAll("img:not(.itemimg)");
        if (tasks.length > 0 &&
            [OvenStatus.EMPTY, OvenStatus.COOKING].includes(status)) {
            status = OvenStatus.ATTENTION;
            if (allReady && tasks.length !== 3) {
                allReady = false;
            }
        }
        else if (status === OvenStatus.EMPTY) {
            status = OvenStatus.COOKING;
        }
        checkAt = Math.min(checkAt, Date.now() + 60 * 1000);
    }
    return {
        allReady,
        checkAt,
        count,
        status,
    };
};
const scheduledUpdates = {};
// Stirring, tasting and seasoning are what clear "Ovens need attention", and
// nothing was watching for them: only `seasonmealsall` had an interceptor at all
// (and the wrong one — a copy of the collect handler, which declared the ovens
// EMPTY and popped a "meals collected" message for a seasoning). So doing the
// actions left the status on ATTENTION and the banner nagged for work already
// done until something else happened to refresh the kitchen.
//
// What each oven still needs afterwards is only knowable from the kitchen page,
// so these re-read it rather than guessing. `ignoreCache` is required: `set()`
// stamps the state as freshly updated, so a plain `get()` inside five seconds of
// an action returns the very value we are trying to replace.
//
// Watching the three names WorkerGo knows only covers the kitchen list's "all"
// buttons. The same work is done one oven at a time from oven.php?num=N, whose
// actions have different names that aren't in WorkerGo at all — so tending or
// collecting an oven from its own page left the status untouched and the banner
// still asking for it. Rather than guess at names, this matches any oven-shaped
// worker action, which also covers whatever the game adds next.
const MEAL_ACTION_PATTERN = /cook|meal|season|stir|taste/;
// these two have interceptors of their own below, which do more than re-read
const OWN_INTERCEPTORS = new Set([
    page_1.WorkerGo.COLLECT_ALL_MEALS,
    page_1.WorkerGo.COOK_ALL,
]);
let scheduledMealRefresh;
const mealActionInterceptor = {
    // every worker action, filtered in the callback (the match only compares the
    // keys it's given, so an empty query matches them all)
    match: [page_1.Page.WORKER, new URLSearchParams()],
    callback: (state, previous, response) => {
        var _a;
        const [, query] = (0, requests_2.parseUrl)(response.url);
        const go = (_a = query.get("go")) !== null && _a !== void 0 ? _a : "";
        if (!MEAL_ACTION_PATTERN.test(go) || OWN_INTERCEPTORS.has(go)) {
            return Promise.resolve();
        }
        // Tending an oven is a burst of clicks, and each one would otherwise cost a
        // kitchen page read; wait for the burst to finish and read once.
        clearTimeout(scheduledMealRefresh);
        scheduledMealRefresh = setTimeout(() => {
            state.get({ ignoreCache: true });
        }, 600);
        return Promise.resolve();
    },
};
exports.kitchenStatusState = new state_1.CachedState(state_1.StorageKey.KITHCEN_STATUS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.KITCHEN, new URLSearchParams());
    return processKitchenPage(response.body);
}), {
    timeout: 5,
    // live status — see the note on farmStatusState
    persist: false,
    defaultState: {
        status: OvenStatus.EMPTY,
        count: 0,
        allReady: false,
        checkAt: Number.POSITIVE_INFINITY,
    },
    interceptors: [
        {
            match: [page_1.Page.HOME_PATH, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                const kitchenStatus = root === null || root === void 0 ? void 0 : root.querySelector("a[href='kitchen.php'] .item-after span");
                yield state.set(processKitchenStatus(kitchenStatus || undefined));
            }),
        },
        {
            match: [page_1.Page.KITCHEN, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                yield state.set(processKitchenPage(root.body));
            }),
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.COLLECT_ALL_MEALS }),
            ],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c;
                const root = yield (0, requests_1.getDocument)(response);
                const successCount = (_c = (_b = (_a = root.body.textContent) === null || _a === void 0 ? void 0 : _a.match(/success/g)) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
                if (successCount) {
                    (0, popup_1.showPopup)({
                        title: "Success!",
                        contentHTML: `${successCount} meal${successCount === 1 ? "" : "s"} collected`,
                    });
                }
                yield state.set(Object.assign(Object.assign({}, previous), { status: OvenStatus.EMPTY, checkAt: Number.POSITIVE_INFINITY }));
                // Clearing the banner immediately is right, but EMPTY is only a guess:
                // collect takes the ready meals and leaves anything still cooking, so
                // confirm against the kitchen page. `ignoreCache` because the `set()`
                // above just stamped this state as fresh.
                yield state.get({ ignoreCache: true });
            }),
        },
        mealActionInterceptor,
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.COOK_ALL })],
            callback: (state, previous) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set(Object.assign(Object.assign({}, previous), { status: OvenStatus.COOKING, checkAt: Date.now() + 60 * 1000 }));
            }),
        },
    ],
});
const updateStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.kitchenStatusState.get({ doNotFetch: true });
    if (!state) {
        return;
    }
    if (state.checkAt < Date.now()) {
        yield exports.kitchenStatusState.get();
    }
});
// automatically update crops when finished
exports.kitchenStatusState.onUpdate((state) => {
    if (!state) {
        return;
    }
    if (scheduledUpdates[state.checkAt]) {
        return;
    }
    scheduledUpdates[state.checkAt] = setTimeout(updateStatus, state.checkAt - Date.now());
});
const collectAll = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.COLLECT_ALL_MEALS }));
});
exports.collectAll = collectAll;


/***/ }),

/***/ 8955:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collectMailbox = exports.mailboxState = exports.mergeContents = void 0;
const state_1 = __webpack_require__(4782);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const api_1 = __webpack_require__(3413);
const notifications_1 = __webpack_require__(6783);
const popup_1 = __webpack_require__(469);
const mergeContents = (contents) => {
    const results = [];
    for (const { item, count } of contents) {
        const existing = results.find((result) => result.item === item);
        if (existing) {
            existing.count += count;
        }
        else {
            results.push({ item, count });
        }
    }
    return results;
};
exports.mergeContents = mergeContents;
const processPostoffice = (root) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // get contents
    const contents = [];
    const mailboxList = (0, page_1.getListByTitle)(/Your Mailbox/, root.body);
    const itemWrappers = (_a = mailboxList === null || mailboxList === void 0 ? void 0 : mailboxList.querySelectorAll(".collectbtnnc")) !== null && _a !== void 0 ? _a : [];
    for (const itemWrapper of itemWrappers) {
        const from = ((_c = (_b = itemWrapper.querySelector("span")) === null || _b === void 0 ? void 0 : _b.textContent) !== null && _c !== void 0 ? _c : "").replace("From ", "");
        const item = (_e = (_d = itemWrapper.querySelector("strong")) === null || _d === void 0 ? void 0 : _d.textContent) !== null && _e !== void 0 ? _e : "";
        const count = Number((_h = (_g = (_f = itemWrapper
            .querySelector(".item-after")) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.replaceAll(/,|x/g, "")) !== null && _h !== void 0 ? _h : "0");
        contents.push({ from, item, count });
    }
    // get size
    const increaseCard = (0, page_1.getCardByTitle)("Increase Mailbox Size", root.body);
    const size = Number((_k = (_j = increaseCard === null || increaseCard === void 0 ? void 0 : increaseCard.querySelector("strong")) === null || _j === void 0 ? void 0 : _j.textContent) !== null && _k !== void 0 ? _k : "5");
    return { contents, size };
};
exports.mailboxState = new state_1.CachedState(state_1.StorageKey.MAILBOX, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.POST_OFFICE);
    return processPostoffice(response);
}), {
    persist: false,
    defaultState: {
        contents: [],
        size: 5,
    },
    interceptors: [
        {
            match: [page_1.Page.POST_OFFICE, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set(processPostoffice(yield (0, requests_1.getDocument)(response)));
            }),
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.COLLECT_ALL_MAIL_ITEMS }),
            ],
            callback: (state, previous) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set(Object.assign(Object.assign({}, previous), { contents: [] }));
            }),
        },
    ],
});
const collectMailbox = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.mailboxState.get();
    if (!state) {
        return;
    }
    const mergedItems = (0, exports.mergeContents)(state.contents);
    const items = yield Promise.all(mergedItems.map((mail) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            item: yield api_1.itemDataState.get({ query: mail.item }),
            count: mail.count,
        });
    })));
    (0, notifications_1.removeNotification)(notifications_1.NotificationId.MAILBOX);
    (0, popup_1.showPopup)({
        title: "Collected Mail",
        contentHTML: `
      ${items
            .map((mail) => mail.item
            ? `
              <img
                src="${mail.item.image}"
                style="
                  vertical-align: middle;
                  width: 18px;
                "
              >
              (x${mail.count})
            `
            : ``)
            .join("&nbsp;")}
    `,
    });
    yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.COLLECT_ALL_MAIL_ITEMS }));
});
exports.collectMailbox = collectMailbox;


/***/ }),

/***/ 283:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.masteryState = exports.parseMasteryPage = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
// Pull the in-progress mastery rows out of the mastery page.
//
// Every row lives in one list under "Mastery In-Progress", grouped by collapsed
// tier headings — the collapsed tiers carry `style="display:none"`, so matching
// on the class alone (rather than anything about visibility) is what gets all
// of them rather than only the expanded ones.
const parseMasteryPage = (root) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const entries = [];
    for (const row of root.querySelectorAll("li[class*='tier-t']")) {
        const name = (_b = (_a = row.querySelector(".item-title strong")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
        if (!name) {
            continue;
        }
        const progress = /([\d,]+)\s*\/\s*([\d,]+)\s*progress/i.exec((_d = (_c = row.querySelector(".item-title")) === null || _c === void 0 ? void 0 : _c.textContent) !== null && _d !== void 0 ? _d : "");
        if (!progress) {
            continue;
        }
        const value = Number(progress[1].replaceAll(",", ""));
        const required = Number(progress[2].replaceAll(",", ""));
        if (Number.isNaN(value) || Number.isNaN(required) || required <= 0) {
            continue;
        }
        const id = (_g = /id=(\d+)/.exec((_f = (_e = row.querySelector("a")) === null || _e === void 0 ? void 0 : _e.getAttribute("href")) !== null && _f !== void 0 ? _f : "")) === null || _g === void 0 ? void 0 : _g[1];
        entries.push({
            id: id ? Number(id) : undefined,
            name,
            remaining: Math.max(0, required - value),
            required,
            tier: (_j = (_h = [...row.classList]
                .find((token) => token.startsWith("tier-"))) === null || _h === void 0 ? void 0 : _h.slice(5)) !== null && _j !== void 0 ? _j : "",
            value,
        });
    }
    return entries;
};
exports.parseMasteryPage = parseMasteryPage;
// No `defaultState`, matching the other snapshots: a fresh read must replace
// the previous list outright rather than merge over it, and a parse that finds
// nothing keeps the last good read instead of asserting an empty one.
exports.masteryState = new state_1.CachedState(state_1.StorageKey.MASTERY, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_1.getHTML)(page_1.Page.MASTERY, new URLSearchParams());
    const entries = (0, exports.parseMasteryPage)(response.body);
    if (entries.length === 0) {
        return;
    }
    return { entries, updatedAt: Date.now() };
}), {
    timeout: 30 * 60, // 30 minutes
});


/***/ }),

/***/ 2022:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mealsStatusState = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const time_1 = __webpack_require__(4435);
const scheduledUpdates = {};
const processMealStatus = (root) => {
    var _a;
    const mealList = (0, page_1.getListByTitle)(/Time-based Effects/, root);
    if (!mealList) {
        return { meals: [] };
    }
    const meals = [];
    for (const mealWrapper of mealList.children) {
        const mealName = (_a = mealWrapper.querySelector("strong")) === null || _a === void 0 ? void 0 : _a.textContent;
        if (!mealName) {
            continue;
        }
        const meal = mealName;
        const countdown = mealWrapper.querySelector("[data-countdown-to]");
        const finishedAt = (countdown === null || countdown === void 0 ? void 0 : countdown.dataset.countdownTo)
            ? (0, time_1.timestampToDate)(countdown.dataset.countdownTo).getTime()
            : Date.now();
        meals.push({ meal, finishedAt });
    }
    return { meals };
};
exports.mealsStatusState = new state_1.CachedState(state_1.StorageKey.MEALS_STATUS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.HOME_PATH);
    return processMealStatus(response.body);
}), {
    // live status — see the note on farmStatusState. Cooking meals carry ready
    // times, so a list kept from a previous session is stale by definition.
    persist: false,
    defaultState: {
        meals: [],
    },
    interceptors: [
        {
            match: [page_1.Page.HOME_PATH, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                yield state.set(processMealStatus(root.body));
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.USE_ITEM })],
            callback: () => __awaiter(void 0, void 0, void 0, function* () {
                // request homepage to trigger meals state update
                yield (0, requests_2.getHTML)(page_1.Page.HOME_PATH);
            }),
        },
    ],
});
const removeFinishedMeals = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const state = yield exports.mealsStatusState.get({ doNotFetch: true });
    yield exports.mealsStatusState.set({
        // keep the meals that are STILL RUNNING. This test was the wrong way round
        // (`<`), so every time a meal's timer came due it kept the meal that had
        // just finished and threw away the ones still ticking — the "N meals
        // active" banner then sat there listing an expired meal for the rest of the
        // session, which is exactly the "it thinks I haven't done it yet" shape.
        meals: (_a = state === null || state === void 0 ? void 0 : state.meals.filter((meal) => meal.finishedAt > Date.now())) !== null && _a !== void 0 ? _a : [],
    });
});
// automatically remove meals when finished
exports.mealsStatusState.onUpdate((state) => {
    var _a;
    for (const meal of (_a = state === null || state === void 0 ? void 0 : state.meals) !== null && _a !== void 0 ? _a : []) {
        const { finishedAt } = meal;
        if (scheduledUpdates[finishedAt]) {
            continue;
        }
        scheduledUpdates[finishedAt] = setTimeout(removeFinishedMeals, finishedAt - Date.now());
    }
});


/***/ }),

/***/ 4735:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.exportToNotes = exports.setNotes = exports.notesState = exports.encodeData = exports.eraseData = exports.FARMHAND_SUFFIX = exports.FARMHAND_PREFIX = void 0;
const state_1 = __webpack_require__(4782);
const settings_1 = __webpack_require__(126);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const popup_1 = __webpack_require__(469);
exports.FARMHAND_PREFIX = "\n==== START FARMHAND SETTINGS ====\n";
exports.FARMHAND_SUFFIX = "\n==== END FARMHAND SETTINGS ====";
const eraseData = (notes) => {
    const start = notes.indexOf(exports.FARMHAND_PREFIX);
    const end = notes.indexOf(exports.FARMHAND_SUFFIX);
    if (start === -1 || end === -1) {
        return notes;
    }
    return notes.slice(0, start) + notes.slice(end + exports.FARMHAND_SUFFIX.length);
};
exports.eraseData = eraseData;
const encodeData = () => __awaiter(void 0, void 0, void 0, function* () {
    const exportedSettings = Object.values((0, settings_1.getSettings)());
    for (const setting of exportedSettings) {
        setting.data = yield (0, settings_1.getData)(setting, "");
    }
    return `${exports.FARMHAND_PREFIX}${JSON.stringify(exportedSettings)}${exports.FARMHAND_SUFFIX}`;
});
exports.encodeData = encodeData;
const processHome = (root) => {
    const notesField = root.querySelector(".player_notes");
    if (!notesField) {
        return { notes: "", hasNotes: false };
    }
    const rawNotes = notesField.value;
    const start = rawNotes.indexOf(exports.FARMHAND_PREFIX);
    const end = rawNotes.indexOf(exports.FARMHAND_SUFFIX);
    if (start === -1 || end === -1) {
        console.debug(`[SYNC] No settings found in notes`);
        return { notes: rawNotes, hasNotes: false };
    }
    const settingsString = rawNotes.slice(start + exports.FARMHAND_PREFIX.length, end);
    const settings = JSON.parse(settingsString);
    (() => __awaiter(void 0, void 0, void 0, function* () {
        let hasChanged = false;
        for (const setting of settings) {
            const settingChanged = yield (0, settings_1.setSetting)(setting);
            const dataChanged = yield (0, settings_1.setData)(setting, setting.data);
            if (!hasChanged && (settingChanged || dataChanged)) {
                hasChanged = true;
            }
        }
        console.debug(`[SYNC] Imported settings from notes`, settings);
        if (hasChanged) {
            yield (0, popup_1.showPopup)({
                title: "Farmhand Settings Synced!",
                contentHTML: "Page will reload to apply",
            });
            location.reload();
        }
    }))();
    return { notes: (0, exports.eraseData)(rawNotes), hasNotes: true };
};
exports.notesState = new state_1.CachedState(state_1.StorageKey.NOTES, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.HOME_PATH);
    return processHome(response);
}), {
    interceptors: [
        {
            match: [page_1.Page.HOME_PATH, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                state.set(processHome(yield (0, requests_1.getDocument)(response)));
            }),
        },
    ],
    defaultState: {
        notes: "",
        hasNotes: false,
    },
});
const setNotes = (notes) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, requests_2.postData)(page_1.Page.WORKER, {
        content: `${(0, exports.eraseData)(notes)}${yield (0, exports.encodeData)()}`,
    }, new URLSearchParams({ go: page_1.WorkerGo.NOTES }));
});
exports.setNotes = setNotes;
const exportToNotes = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.notesState.get();
    if (!state) {
        console.error("Sync failed");
        return;
    }
    if (!state.hasNotes) {
        console.warn(`[SYNC] Notes disabled or not available, skipping sync`);
        return;
    }
    yield (0, exports.setNotes)(state.notes);
    console.debug(`[SYNC] Exported settings to notes`);
});
exports.exportToNotes = exportToNotes;
(0, settings_1.registerExportToNotes)(exports.exportToNotes);


/***/ }),

/***/ 5543:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activatePerkSet = exports.isActivePerkSet = exports.getPerkStatus = exports.primePerkStatus = exports.getConfirmedEquippedSetId = exports.getCurrentPerkSet = exports.getActivityPerksSet = exports.perksState = exports.onPerkStatusChange = exports.setPerkStatusNote = exports.PerkActivity = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
var PerkActivity;
(function (PerkActivity) {
    PerkActivity["DEFAULT"] = "Default";
    PerkActivity["COOKING"] = "Cooking";
    PerkActivity["CRAFTING"] = "Crafting";
    PerkActivity["FISHING"] = "Fishing";
    PerkActivity["EXPLORING"] = "Exploring";
    PerkActivity["FARMING"] = "Farming";
    PerkActivity["SELLING"] = "Selling";
    PerkActivity["FRIENDSHIP"] = "Friendship";
    PerkActivity["TEMPLE"] = "Temple";
    PerkActivity["LOCKSMITH"] = "Locksmith";
    PerkActivity["MINING"] = "Mining";
    PerkActivity["WHEEL"] = "Wheel";
    PerkActivity["VAULT"] = "Vault";
    // optional shared set for the town-cluster activities (temple / wheel /
    // locksmith / vault); when present it is used in place of their own sets
    PerkActivity["TOWN"] = "Town";
    PerkActivity["UNKNOWN"] = "Unknown";
})(PerkActivity || (exports.PerkActivity = PerkActivity = {}));
const processPerks = (root) => {
    var _a, _b, _c;
    const perkSets = [];
    const setList = (0, page_1.getListByTitle)("My Perk Sets", root.body);
    const setWrappers = (_a = setList === null || setList === void 0 ? void 0 : setList.querySelectorAll(".item-title")) !== null && _a !== void 0 ? _a : [];
    let currentPerkSetId;
    for (const setWrapper of setWrappers) {
        const link = setWrapper.querySelector("a");
        const name = (_c = (_b = link === null || link === void 0 ? void 0 : link.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
        const id = Number(link === null || link === void 0 ? void 0 : link.dataset.id);
        const isActive = setWrapper.querySelector(".fa-check");
        if (isActive) {
            currentPerkSetId = id;
        }
        perkSets.push({ name, id });
    }
    return { perkSets, currentPerkSetId };
};
// The id of the set we last drove the game to via a completed activateperkset
// switch, cleared whenever resetPerks() wipes the slate or the perks page is
// (re)loaded. Unlike the optimistic currentPerkSetId cache (set from the request
// URL the instant a switch is SENT, so it drifts from what's really equipped),
// this is written only AFTER a switch finishes — including its settle wait — so
// it's a trustworthy "these perks are genuinely equipped right now" signal. It
// lets a repeated switch to the already-equipped set skip the whole
// reset+activate+settle round-trip: the common case of quick-selling a stack of
// items one after another, where the reconciler leaves the perks alone between
// item pages, so the set the first sell equipped is still on for the rest. The
// first sell pays the ~1s; the rest are instant, until you navigate to a normal
// page and the reconciler reverts.
let confirmedEquippedSet;
// The set a switch is currently in flight to, if any — drives the indicator's
// "switching…" state so a switch is visible while it happens (including the
// settle wait) rather than only after it lands.
let pendingPerkSet;
const perkStatusListeners = [];
let statusNote;
const setPerkStatusNote = (note) => {
    if (statusNote === note) {
        return;
    }
    statusNote = note;
    notifyPerkStatus();
};
exports.setPerkStatusNote = setPerkStatusNote;
const onPerkStatusChange = (listener) => {
    perkStatusListeners.push(listener);
};
exports.onPerkStatusChange = onPerkStatusChange;
const notifyPerkStatus = () => {
    for (const listener of perkStatusListeners) {
        listener();
    }
};
const setConfirmedEquipped = (set) => {
    confirmedEquippedSet = set;
    notifyPerkStatus();
};
exports.perksState = new state_1.CachedState(state_1.StorageKey.PERKS_SETS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.PERKS);
    return processPerks(response);
}), {
    timeout: 60 * 60 * 24, // 1 day
    defaultState: {
        perkSets: [],
        currentPerkSetId: undefined,
    },
    interceptors: [
        {
            match: [page_1.Page.PERKS, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                // the perks page is where a set can be manually re-equipped/edited,
                // which our fast-path flag can't see — drop it so the next switch
                // re-verifies instead of trusting a possibly-stale assumption
                setConfirmedEquipped(undefined);
                yield state.set(processPerks(yield (0, requests_1.getDocument)(response)));
            }),
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.ACTIVATE_PERK_SET }),
            ],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const [_, query] = (0, requests_2.parseUrl)(response.url);
                yield state.set(Object.assign(Object.assign({}, previous), { currentPerkSetId: Number(query.get("id")) }));
            }),
        },
    ],
});
const getActivityPerksSet = (activity, options) => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.perksState.get(options);
    return state === null || state === void 0 ? void 0 : state.perkSets.find(({ name }) => name.toLowerCase() === activity.toLowerCase());
});
exports.getActivityPerksSet = getActivityPerksSet;
const getCurrentPerkSet = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.perksState.get(options);
    return state === null || state === void 0 ? void 0 : state.perkSets.find(({ id }) => id === (state === null || state === void 0 ? void 0 : state.currentPerkSetId));
});
exports.getCurrentPerkSet = getCurrentPerkSet;
// The set we last confirmed genuinely equipped (see confirmedEquippedSet), or
// undefined when unknown. Trustworthy where the currentPerkSetId cache isn't,
// because it's only written after a switch fully completes.
const getConfirmedEquippedSetId = () => confirmedEquippedSet === null || confirmedEquippedSet === void 0 ? void 0 : confirmedEquippedSet.id;
exports.getConfirmedEquippedSetId = getConfirmedEquippedSetId;
// What to display as the currently equipped set. Prefers the set we confirmed
// ourselves; falls back to the game's own selected-set cache (unconfirmed —
// it's the optimistic one) so the indicator still says something useful before
// this session has driven a switch.
// Read the game's perk sets once if nothing has needed them yet. Until something
// does, there is no set name to show and the indicator can't draw itself — which
// is why it used to appear only after the first switch of a session (a harvest,
// or arriving on an activity page) rather than on the first page load. The state
// is cached for a day and persisted, so this costs one read.
let statusPrimed = false;
const primePerkStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    if (statusPrimed) {
        return;
    }
    statusPrimed = true;
    yield exports.perksState.get();
    notifyPerkStatus();
});
exports.primePerkStatus = primePerkStatus;
const getPerkStatus = () => {
    if (pendingPerkSet) {
        return {
            name: pendingPerkSet.name,
            isPending: true,
            isConfirmed: false,
            note: statusNote,
        };
    }
    if (confirmedEquippedSet) {
        return {
            name: confirmedEquippedSet.name,
            isPending: false,
            isConfirmed: true,
            note: statusNote,
        };
    }
    const state = exports.perksState.read();
    const current = state === null || state === void 0 ? void 0 : state.perkSets.find(({ id }) => id === (state === null || state === void 0 ? void 0 : state.currentPerkSetId));
    return {
        name: current === null || current === void 0 ? void 0 : current.name,
        isPending: false,
        isConfirmed: false,
        note: statusNote,
    };
};
exports.getPerkStatus = getPerkStatus;
const isActivePerkSet = (set, options) => __awaiter(void 0, void 0, void 0, function* () {
    const current = yield (0, exports.getCurrentPerkSet)(options);
    return Boolean(current && current.id === set.id);
});
exports.isActivePerkSet = isActivePerkSet;
// Perk switches are serialized through this chain. Activating a set is an
// async server round-trip, and two switches overlapping — e.g. a quick-sell
// and a quick-craft fired on the same page within a few hundred ms — would
// race and leave a set selected but only partially applied. Chaining runs them
// one at a time, in call order, so each finishes before the next begins.
let perkSwitchChain = Promise.resolve();
// The game acknowledges activateperkset (responds "success") BEFORE it has
// finished equipping the set's perks, so an action fired immediately after —
// the quick-sell/craft/give click — can run under the OLD perks: a 50-silver
// item sold for 55 (+10% gold perk only) right after activating the selling
// set, vs the full 80 (+60%) once it settled. On the FORCED paths (the caller
// is about to act on these perks) we wait this long after the switch for the
// game to apply them. Unforced switches (the reconciler's revert to Default,
// withFarmingPerks) don't act on the perks immediately and stay fast.
const PERK_SETTLE_MS = 1000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Clear every equipped perk before loading a set (upstream behaviour). Loading
// from an EMPTY slate is what makes the game equip a set fully; switching
// set-to-set without it leaves the game diffing off the previous full set and
// dropping/lagging perks. Default ON — see the `reset` option for the one
// exception.
const resetPerks = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const state = yield exports.perksState.get();
    yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.RESET_PERKS }));
    // perks are now cleared, so nothing is confirmed-equipped anymore
    setConfirmedEquipped(undefined);
    yield exports.perksState.set({
        perkSets: (_a = state === null || state === void 0 ? void 0 : state.perkSets) !== null && _a !== void 0 ? _a : [],
        currentPerkSetId: undefined,
    });
});
// Resolves to whether an actual switch was performed — false when it no-op'd
// because the set was already equipped (fast path or guard). Callers use this
// to only show a "…perks activated" banner when perks really changed, instead
// of on every revisit to e.g. a town building that's already on the Town set.
const activatePerkSet = (set, { force = false, settle = false, reset = true } = {}) => {
    const task = perkSwitchChain.then(() => __awaiter(void 0, void 0, void 0, function* () {
        // We already drove the game to this exact set and nothing has reset the
        // slate since, so it's genuinely equipped — skip the whole round-trip
        // (reset + activate + settle). This is the trustworthy fast path: unlike
        // the optimistic isActivePerkSet cache below, confirmedEquippedSet is
        // only set after a switch fully completes, so even forced callers (the
        // quick actions, which distrust that cache) can safely short-circuit here.
        // It's what makes back-to-back quick-sells after the first one instant.
        // Returning before the pending flag is raised also keeps the indicator
        // still: a no-op switch shouldn't flicker "switching…".
        if ((confirmedEquippedSet === null || confirmedEquippedSet === void 0 ? void 0 : confirmedEquippedSet.id) === set.id) {
            return false;
        }
        if (!force && (yield (0, exports.isActivePerkSet)(set))) {
            return false;
        }
        console.debug(`Activating ${set.name} Perks`);
        // eslint-disable-next-line require-atomic-updates
        pendingPerkSet = set;
        notifyPerkStatus();
        try {
            if (reset) {
                yield resetPerks();
            }
            yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({
                go: page_1.WorkerGo.ACTIVATE_PERK_SET,
                id: set.id.toString(),
            }));
            if (settle) {
                yield delay(PERK_SETTLE_MS);
            }
        }
        finally {
            // cleared (and announced) even if the switch throws, so a failed switch
            // can't leave the indicator stuck on "switching…"
            // eslint-disable-next-line require-atomic-updates
            pendingPerkSet = undefined;
            notifyPerkStatus();
        }
        // record that this set is now genuinely equipped so the next switch to it
        // can take the fast path above. Safe despite the awaits: every write runs
        // inside perkSwitchChain, which serializes switches, so there's no
        // concurrent reassignment to race with.
        setConfirmedEquipped(set);
        return true;
    }));
    perkSwitchChain = task.catch(() => {
        // swallow: a failed switch must not break the chain for the next one
    });
    return task;
};
exports.activatePerkSet = activatePerkSet;


/***/ }),

/***/ 2850:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collectPets = exports.petState = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const api_1 = __webpack_require__(3413);
const mail_1 = __webpack_require__(8955);
const notifications_1 = __webpack_require__(6783);
const popup_1 = __webpack_require__(469);
const processPets = (root) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // get contents
    const contents = [];
    const listTitle = (0, page_1.getTitle)("All Items Found", root.body);
    const list = (_b = (_a = listTitle === null || listTitle === void 0 ? void 0 : listTitle.nextElementSibling) === null || _a === void 0 ? void 0 : _a.nextElementSibling) === null || _b === void 0 ? void 0 : _b.firstElementChild;
    const itemWrappers = (_c = list === null || list === void 0 ? void 0 : list.querySelectorAll("li")) !== null && _c !== void 0 ? _c : [];
    for (const itemWrapper of itemWrappers) {
        const from = ((_e = (_d = itemWrapper.querySelector("span")) === null || _d === void 0 ? void 0 : _d.textContent) !== null && _e !== void 0 ? _e : "").replace("From ", "");
        const item = (_g = (_f = itemWrapper.querySelector("strong")) === null || _f === void 0 ? void 0 : _f.textContent) !== null && _g !== void 0 ? _g : "";
        const count = Number((_k = (_j = (_h = itemWrapper
            .querySelector(".item-after")) === null || _h === void 0 ? void 0 : _h.textContent) === null || _j === void 0 ? void 0 : _j.replaceAll(",", "")) !== null && _k !== void 0 ? _k : "0");
        contents.push({ from, item, count });
    }
    return contents;
};
exports.petState = new state_1.CachedState(state_1.StorageKey.PETS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.PETS);
    return processPets(response);
}), {
    persist: false,
    defaultState: [],
    interceptors: [
        {
            match: [page_1.Page.PETS, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set(processPets(yield (0, requests_1.getDocument)(response)));
            }),
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.COLLECT_ALL_PET_ITEMS }),
            ],
            callback: (state) => __awaiter(void 0, void 0, void 0, function* () {
                yield state.set([]);
            }),
        },
    ],
});
const collectPets = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.petState.get();
    if (!state) {
        return;
    }
    const mergedItems = (0, mail_1.mergeContents)(state);
    const items = yield Promise.all(mergedItems.map((mail) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            item: yield api_1.itemDataState.get({ query: mail.item }),
            count: mail.count,
        });
    })));
    (0, notifications_1.removeNotification)(notifications_1.NotificationId.PETS);
    (0, popup_1.showPopup)({
        title: "Collected Pet Items",
        contentHTML: `
      ${items
            .map((mail) => mail.item
            ? `
              <img
                src="${mail.item.image}"
                style="
                  vertical-align: middle;
                  width: 18px;
                "
              >
              (x${mail.count})
            `
            : ``)
            .join("&nbsp;")}
    `,
    });
    yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.COLLECT_ALL_PET_ITEMS }));
});
exports.collectPets = collectPets;


/***/ }),

/***/ 303:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getQuestGoals = exports.parseActiveQuests = void 0;
const page_1 = __webpack_require__(7952);
const api_1 = __webpack_require__(3413);
// Read the player's open requests off the quests page. Same selectors the quest
// tagging feature has used since upstream, so this is proven markup rather than
// a fresh guess: each request is an `li` whose link carries the quest id and
// whose `.item-title strong` is the title.
const parseActiveQuests = (root) => {
    var _a, _b, _c;
    const list = (0, page_1.getListByTitle)(/Active Requests/, root);
    if (!list) {
        return [];
    }
    const quests = [];
    for (const element of list.querySelectorAll("li")) {
        const link = element.querySelector("a");
        const href = (_a = link === null || link === void 0 ? void 0 : link.getAttribute("href")) !== null && _a !== void 0 ? _a : "";
        const id = href.split("?id=")[1];
        const title = (_c = (_b = element
            .querySelector(".item-title strong")) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim();
        if (!id || !title) {
            continue;
        }
        quests.push({ href, id, title });
    }
    return quests;
};
exports.parseActiveQuests = parseActiveQuests;
// Turn open requests into goals by looking their requirements up on buddy.farm.
//
// The game's quest list gives ids and titles but not requirements, and the
// title is the only key the two sources share — so a quest buddy.farm has not
// indexed (a brand new or event request) simply drops out rather than being
// reported as needing nothing.
const getQuestGoals = (quests) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const details = yield Promise.all(quests.map((quest) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield api_1.questDataState.get({ query: quest.title });
        }
        catch (_a) { }
    })));
    const goals = [];
    const unmatched = [];
    for (const [index, detail] of details.entries()) {
        const quest = quests[index];
        if (!detail) {
            unmatched.push(quest.title);
            continue;
        }
        const needs = ((_a = detail.requiredItems) !== null && _a !== void 0 ? _a : []).map((entry) => ({
            name: entry.item.name,
            quantity: entry.quantity,
        }));
        if (needs.length === 0) {
            // a request that wants only silver or a level has no item bottleneck
            continue;
        }
        goals.push({
            href: quest.href,
            kind: "quest",
            label: quest.title,
            needs,
        });
    }
    return { goals, unmatched };
});
exports.getQuestGoals = getQuestGoals;


/***/ }),

/***/ 4203:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.playerMailboxState = void 0;
const state_1 = __webpack_require__(4782);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const users_1 = __webpack_require__(5254);
// `user` is who the page was requested for, when that's known. The id and name
// are read from the page first, but falling back to the requested player means a
// change to the mailbox page's own markup costs us the capacity line at worst,
// rather than the whole mailbox.
const processMailbox = (root, user) => {
    var _a, _b, _c, _d, _e, _f;
    const idField = root.querySelector("#mb_to_id");
    const id = (idField === null || idField === void 0 ? void 0 : idField.value) || (user === null || user === void 0 ? void 0 : user.id);
    if (!id) {
        return;
    }
    const profileLink = root.querySelector("a[href^='profile']");
    const [, queryString] = (_b = (_a = profileLink === null || profileLink === void 0 ? void 0 : profileLink.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.split("?")) !== null && _b !== void 0 ? _b : [];
    const username = (_c = new URLSearchParams(queryString).get("user_name")) !== null && _c !== void 0 ? _c : user === null || user === void 0 ? void 0 : user.username;
    if (!username) {
        return;
    }
    const cards = root.querySelectorAll(".card");
    let capacity;
    for (const card of cards) {
        // This mailbox has 36 / 1,800 items in it currently.
        const match = (_d = card.textContent) === null || _d === void 0 ? void 0 : _d.match(/This mailbox has [\d,]+ \/ ([\d,]+) items in it currently/);
        if (!match) {
            continue;
        }
        const [_, max] = match;
        capacity = Number(max.replaceAll(",", ""));
        break;
    }
    const lookingFor = (_f = (_e = (0, page_1.getCardByTitle)("Looking For", root.body)) === null || _e === void 0 ? void 0 : _e.textContent) !== null && _f !== void 0 ? _f : "";
    const timestamp = Date.now();
    return {
        id,
        username,
        capacity,
        lookingFor,
        timestamp,
    };
};
exports.playerMailboxState = new state_1.CachedState(state_1.StorageKey.PLAYER_MAILBOXES, (state, userName) => __awaiter(void 0, void 0, void 0, function* () {
    const previous = state.read(userName);
    if (previous) {
        return previous;
    }
    if (!userName) {
        return;
    }
    const user = yield users_1.userState.get({ query: userName });
    if (!user) {
        return;
    }
    const response = yield (0, requests_2.getHTML)(page_1.Page.MAILBOX, new URLSearchParams({ id: user.id }));
    return processMailbox(response, user);
}), {
    persist: true,
    // seconds — see the note in users.ts; this was under 3 hours, not a week
    timeout: 60 * 60 * 24, // 1 day
    interceptors: [
        {
            match: [page_1.Page.MAILBOX, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const mailbox = processMailbox(yield (0, requests_1.getDocument)(response));
                if (!mailbox) {
                    return;
                }
                yield state.set(mailbox, mailbox.username);
            }),
        },
    ],
});


/***/ }),

/***/ 5254:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.userState = void 0;
const state_1 = __webpack_require__(4782);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
// The profile page carries the player's id in the Add Friend button, and — on
// the rebuilt profile page, which has no such button — in the link to their
// mailbox. Both are checked, so this works on old and current markup, and on a
// profile fetched without a session (where the social buttons aren't rendered).
const getUserId = (root) => {
    var _a, _b, _c, _d;
    const addFriendId = (_a = root.querySelector(".addfriendbtn")) === null || _a === void 0 ? void 0 : _a.dataset.id;
    if (addFriendId) {
        return addFriendId;
    }
    const mailboxLink = root.querySelector("a[href*='mailbox.php?id=']");
    const [, queryString] = (_c = (_b = mailboxLink === null || mailboxLink === void 0 ? void 0 : mailboxLink.getAttribute("href")) === null || _b === void 0 ? void 0 : _b.split("?")) !== null && _c !== void 0 ? _c : [];
    return (_d = new URLSearchParams(queryString).get("id")) !== null && _d !== void 0 ? _d : undefined;
};
// The username used to be a .sharelink; the rebuilt profile page shows it as a
// copy-the-@mention link instead.
const getNameLink = (root) => { var _a; return (_a = root.querySelector(".sharelink")) !== null && _a !== void 0 ? _a : root.querySelector(".copy-to-clipboard"); };
const processProfile = (root) => {
    var _a, _b, _c, _d, _e, _f;
    const id = getUserId(root);
    if (!id) {
        return;
    }
    const nameLink = getNameLink(root);
    if (!nameLink) {
        return;
    }
    const username = (_a = nameLink.textContent) === null || _a === void 0 ? void 0 : _a.trim();
    if (!username) {
        return;
    }
    const colorClass = (_c = (_b = nameLink.parentElement) === null || _b === void 0 ? void 0 : _b.className) !== null && _c !== void 0 ? _c : "";
    const bioCard = (0, page_1.getCardByTitle)("Public Bio", root.body);
    const bio = (_d = bioCard === null || bioCard === void 0 ? void 0 : bioCard.textContent) !== null && _d !== void 0 ? _d : "";
    const image = root.querySelector("#img");
    const emblem = (_f = (_e = image === null || image === void 0 ? void 0 : image.querySelector("img")) === null || _e === void 0 ? void 0 : _e.src) !== null && _f !== void 0 ? _f : "";
    const timestamp = Date.now();
    return {
        id,
        bio,
        username,
        colorClass,
        emblem,
        timestamp,
    };
};
exports.userState = new state_1.CachedState(state_1.StorageKey.PLAYERS, (state, userName) => __awaiter(void 0, void 0, void 0, function* () {
    const previous = state.read(userName);
    if (previous) {
        return previous;
    }
    if (!userName) {
        return;
    }
    const response = yield (0, requests_2.getHTML)(page_1.Page.PROFILE, new URLSearchParams({ user_name: userName.replaceAll(" ", "+") }));
    return yield processProfile(response);
}), {
    persist: true,
    // seconds — the old 60 * 24 * 7 read as a week but is under 3 hours, so
    // every player got re-fetched several times a day
    timeout: 60 * 60 * 24, // 1 day
    interceptors: [
        {
            match: [page_1.Page.PROFILE, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = processProfile(yield (0, requests_1.getDocument)(response));
                if (!user) {
                    return;
                }
                yield state.set(user, user.username);
            }),
        },
    ],
});


/***/ }),

/***/ 3300:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.watchQueries = exports.onFetchResponse = exports.registerQueryInterceptor = exports.queryInterceptors = exports.toUrl = exports.urlMatches = exports.parseUrl = exports.getJSON = exports.postData = exports.getHTML = void 0;
const requests_1 = __webpack_require__(3813);
// The game is served from several hosts — farmrpg.com, www.farmrpg.com and
// alpha.farmrpg.com all serve it in full, and none of them redirects to another.
// So requests must stay on whichever host the page was actually loaded from.
// Addressing a fixed host instead meant that anywhere but farmrpg.com every
// request went cross-origin (no session cookie), and response URLs failed the
// prefix test below, which silently disabled every interceptor — including on
// alpha, which the script already claimed to support.
const GAME_ORIGIN = window.location.origin;
const getHTML = (page, query) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch((0, exports.toUrl)(page, query), {
        method: "POST",
        mode: "cors",
        credentials: "include",
    });
    return (0, requests_1.getDocument)(response);
});
exports.getHTML = getHTML;
const postData = (page, data, query) => __awaiter(void 0, void 0, void 0, function* () {
    const body = new URLSearchParams(data).toString();
    const response = yield fetch((0, exports.toUrl)(page, query), {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    });
    return (0, requests_1.getDocument)(response);
});
exports.postData = postData;
const getJSON = (page, query) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch((0, exports.toUrl)(page, query), {
        method: "POST",
        mode: "cors",
        credentials: "include",
    });
    // No dispatch here: watchQueries' fetch wrapper already ran the interceptors
    // for this response. Doing it a second time ran every matching interceptor
    // twice — harmless while the second pass died on an already-consumed body,
    // but once each interceptor got its own clone (1.1.3) both passes succeeded,
    // so harvesting fired the "Harvested Crops" popup twice. The two modals sat
    // exactly on top of each other, so Replant looked like it needed two clicks:
    // the first one replanted and closed the top popup, revealing its twin.
    return yield response.json();
});
exports.getJSON = getJSON;
const parseUrl = (url) => {
    // https://farmrpg.com/worker.php?cachebuster=271544&go=getchat&room=giveaways
    const truncatedUrl = url.replace(`${GAME_ORIGIN}/`, "");
    // worker.php?cachebuster=271544&go=getchat&room=giveaways
    const [pageRaw, queryRaw] = truncatedUrl.split("?");
    const page = pageRaw.replace(".php", "");
    // worker
    const query = new URLSearchParams(queryRaw);
    // cachebuster=271544&go=getchat&room=giveaways
    return [page, query];
};
exports.parseUrl = parseUrl;
const urlMatches = (url, targetPage, targetQuery) => {
    const [page, query] = (0, exports.parseUrl)(url);
    if (page !== targetPage) {
        return false;
    }
    for (const key of targetQuery.keys()) {
        if (query.get(key) !== targetQuery.get(key)) {
            return false;
        }
    }
    return true;
};
exports.urlMatches = urlMatches;
const toUrl = (page, query) => {
    query = query !== null && query !== void 0 ? query : new URLSearchParams();
    query.set("cachebuster", Date.now().toString());
    // don't actually use URLSearchParams.toString() because FarmRPG expects non-encoded "+" chars
    const queryStringSegments = [];
    for (const [key, value] of query.entries()) {
        queryStringSegments.push(`${key}=${value}`);
    }
    return `${GAME_ORIGIN}/${page}.php?${queryStringSegments.join("&")}`;
};
exports.toUrl = toUrl;
exports.queryInterceptors = [];
const registerQueryInterceptor = (interceptor) => {
    exports.queryInterceptors.push(interceptor);
};
exports.registerQueryInterceptor = registerQueryInterceptor;
const onFetchResponse = (response) => __awaiter(void 0, void 0, void 0, function* () {
    // only check game URLs
    if (!response.url.startsWith(GAME_ORIGIN)) {
        return;
    }
    // A response body can only be read once, and more than one interceptor can
    // match the same URL — the farm page has two, one watching crop status and one
    // watching the farm id. Sharing the response meant the first one to read it
    // consumed it, so the second threw "Body has already been consumed" as an
    // unhandled rejection and silently lost its update. Each interceptor gets its
    // own copy, taken up front and synchronously: the awaits below would otherwise
    // give whoever asked for this response time to consume it first.
    const matches = [];
    for (const [state, interceptor] of exports.queryInterceptors) {
        if ((0, exports.urlMatches)(response.url, ...interceptor.match)) {
            matches.push([state, interceptor, response.clone()]);
        }
    }
    for (const [state, interceptor, body] of matches) {
        console.debug(`[STATE] fetch intercepted ${response.url}`, interceptor);
        const previous = yield state.get({ doNotFetch: true });
        interceptor.callback(state, previous, body);
    }
});
exports.onFetchResponse = onFetchResponse;
const watchQueries = () => {
    (function (open) {
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener("readystatechange", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this.readyState !== 4) {
                        return;
                    }
                    // only check game URLs
                    if (!this.responseURL.startsWith(GAME_ORIGIN)) {
                        return;
                    }
                    for (const [state, interceptor] of exports.queryInterceptors) {
                        if ((0, exports.urlMatches)(this.responseURL, ...interceptor.match)) {
                            console.debug(`[STATE] XMLHttpRequest intercepted ${this.responseURL}`, interceptor);
                            const previous = yield state.get({ doNotFetch: true });
                            interceptor.callback(state, previous, {
                                headers: new Headers(),
                                ok: this.status >= 200 && this.status < 300,
                                redirected: false,
                                status: this.status,
                                statusText: this.statusText,
                                type: "default",
                                url: this.responseURL,
                                text: () => Promise.resolve(this.responseText),
                                json: () => Promise.resolve(JSON.parse(this.responseText)),
                                formData: () => Promise.resolve(new FormData()),
                                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                                blob: () => Promise.resolve(new Blob([this.responseText])),
                            });
                        }
                    }
                });
            }, false);
            // eslint-disable-next-line prefer-rest-params
            Reflect.apply(open, this, arguments);
        };
    })(XMLHttpRequest.prototype.open);
    const originalFetch = window.fetch;
    window.fetch = (input, init) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield originalFetch(input, init);
        if (!response.hasBeenIntercepted) {
            response.hasBeenIntercepted = true;
            (0, exports.onFetchResponse)(response.clone());
        }
        return response;
    });
    const originalFetchWorker = fetchWorker;
    fetchWorker = (action, parameters) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield originalFetchWorker(action, parameters);
        if (!response.hasBeenIntercepted) {
            response.hasBeenIntercepted = true;
            (0, exports.onFetchResponse)(response.clone());
        }
        return response;
    });
};
exports.watchQueries = watchQueries;


/***/ }),

/***/ 4435:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.timestampToDate = void 0;
const timestampToDate = (timestamp) => new Date(`${timestamp}-05:00`);
exports.timestampToDate = timestampToDate;


/***/ }),

/***/ 2427:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.latestVersionState = exports.CHANGELOG_URL = exports.SCRIPT_URL = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
// This fork is installed from its own build rather than from Greasy Fork, so
// the update check has to ask the fork. Asking Greasy Fork means being told
// upstream's version forever, and being offered an "update" that would replace
// this script with the one it was forked from.
const REPOSITORY = "bwalkerr/farmrpg-farmhand";
const BRANCH = "reed-mods";
// where the script is installed from; opening it offers the update
exports.SCRIPT_URL = `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/dist/farmrpg-farmhand.user.js`;
// the metadata-only build — a few hundred bytes rather than the whole script
const META_URL = `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/dist/farmrpg-farmhand.meta.js`;
// the changelog lives in the fork's README
exports.CHANGELOG_URL = `https://github.com/${REPOSITORY}/blob/${BRANCH}/README.md`;
exports.latestVersionState = new state_1.CachedState(state_1.StorageKey.LATEST_VERSION, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const response = yield (0, requests_1.corsFetch)(META_URL);
    const metadata = yield response.text();
    return ((_a = /^\/\/\s*@version\s+(\S+)/m.exec(metadata)) === null || _a === void 0 ? void 0 : _a[1]) || "1.0.0";
}), {
    timeout: 60 * 60 * 6, // 6 hours
    defaultState: "1.0.0",
});


/***/ }),

/***/ 8477:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.autocompleteItems = void 0;
const api_1 = __webpack_require__(3413);
const autocomplete_1 = __webpack_require__(4067);
const settings_1 = __webpack_require__(126);
const SETTING_AUTOCOMPLETE_ITEMS = {
    id: settings_1.SettingId.AUTOCOMPLETE_ITEMS,
    title: "Chat: Autocomplete ((items))",
    description: "Auto-complete item names in chat",
    type: "boolean",
    defaultValue: true,
};
exports.autocompleteItems = {
    settings: [SETTING_AUTOCOMPLETE_ITEMS],
    onInitialize: (settings) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.AUTOCOMPLETE_ITEMS]) {
            return;
        }
        (0, autocomplete_1.registerAutocomplete)({
            trigger: /\(\(([^]+)/,
            getItems: api_1.getBasicItems,
            prefix: "((",
            suffix: "))",
            bail: (text) => { var _a, _b; return ((_b = (_a = text.match(/(\(\(|\)\))/g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) % 2 === 0; },
        });
    },
};


/***/ }),

/***/ 5881:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.autocompleteUsers = void 0;
const autocomplete_1 = __webpack_require__(4067);
const settings_1 = __webpack_require__(126);
const SETTING_AUTOCOMPLETE_USERS = {
    id: settings_1.SettingId.AUTOCOMPLETE_USERS,
    title: "Chat: Autocomplete @Users:",
    description: "Auto-complete usernames in chat",
    type: "boolean",
    defaultValue: true,
};
const getUsers = () => {
    var _a, _b, _c;
    const users = {};
    const messages = document.querySelectorAll(".chat-txt");
    for (const message of messages) {
        const image = (_b = (_a = message.querySelector(".chip-media img")) === null || _a === void 0 ? void 0 : _a.src) !== null && _b !== void 0 ? _b : "";
        const username = (_c = message.querySelector(".chip-label a")) === null || _c === void 0 ? void 0 : _c.textContent;
        if (username && !users[username]) {
            users[username] = { name: username, image };
        }
    }
    return Object.values(users);
};
exports.autocompleteUsers = {
    settings: [SETTING_AUTOCOMPLETE_USERS],
    onInitialize: (settings) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.AUTOCOMPLETE_USERS]) {
            return;
        }
        (0, autocomplete_1.registerAutocomplete)({
            trigger: /@([^]+)/,
            getItems: () => __awaiter(void 0, void 0, void 0, function* () { return yield getUsers(); }),
            prefix: "@",
            suffix: ":",
            bail: (text) => { var _a, _b; return ((_b = (_a = text.match(/(@|:)/g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) % 2 === 0; },
        });
    },
};


/***/ }),

/***/ 8092:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.banker = void 0;
const bank_1 = __webpack_require__(4938);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const confirmation_1 = __webpack_require__(3906);
const popup_1 = __webpack_require__(469);
const theme_1 = __webpack_require__(1178);
const SETTING_BANKER = {
    id: settings_1.SettingId.BANKER,
    title: "Bank: Banker",
    description: `
    * Automatically calculates your target balance (minimum balance required to maximize your daily interest)<br>
    * Adds an option *Deposit Target Balance* which deposits up to your target balance<br>
    * Adds an option to *Withdraw Interest* which withdraws any earnings on top of your target balance
  `,
    type: "boolean",
    defaultValue: true,
};
exports.banker = {
    settings: [SETTING_BANKER],
    onPageLoad: (settings, page) => {
        var _a, _b, _c, _d;
        // make sure the banker is enabled
        if (!settings[settings_1.SettingId.BANKER]) {
            return;
        }
        // make sure we are on the bank page
        if (page !== page_1.Page.BANK) {
            return;
        }
        // make sure page content has loaded
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        // get parameters
        const aboutCard = (0, page_1.getCardByTitle)("About the bank");
        if (!aboutCard) {
            console.error("About card not found");
            return;
        }
        const parameters = aboutCard.querySelectorAll("strong");
        const interestRate = Number((_a = parameters[0].textContent) === null || _a === void 0 ? void 0 : _a.replaceAll("%", "")) / 100;
        const maxInterest = Number((_b = parameters[1].textContent) === null || _b === void 0 ? void 0 : _b.replaceAll(",", ""));
        const balanceCard = aboutCard.nextElementSibling;
        if (!balanceCard) {
            console.error("balance card not found");
            return;
        }
        const balanceParameters = balanceCard.querySelectorAll("strong");
        const balance = Number((_c = balanceParameters[0].textContent) === null || _c === void 0 ? void 0 : _c.replaceAll(",", "").replaceAll(" Silver", ""));
        const formatter = new Intl.NumberFormat();
        // calculate target balance
        const targetBalance = Math.ceil(maxInterest / interestRate);
        let targetBalanceDiv = document.querySelector(".fh-banker-target-balance");
        if (!targetBalanceDiv) {
            targetBalanceDiv = document.createElement("div");
            targetBalanceDiv.classList.add("card-content-inner");
            targetBalanceDiv.classList.add("fh-banker-target-balance");
            targetBalanceDiv.innerHTML = `
      Target Balance: <strong style="color: ${targetBalance === balance ? theme_1.TEXT_SUCCESS : theme_1.TEXT_WARNING}">${formatter.format(targetBalance)} Silver</strong>
    `;
            (_d = balanceCard.firstElementChild) === null || _d === void 0 ? void 0 : _d.append(targetBalanceDiv);
        }
        const availableInterest = Math.max(0, balance - targetBalance);
        // use title to find the bulk options section
        const bulkOptionsList = (0, page_1.getListByTitle)("Bulk Options");
        if (!bulkOptionsList) {
            console.error("Bulk Options list not found");
            return;
        }
        // deposit target balance button
        let depositTargetLi = document.querySelector(".fh-banker-deposit-target");
        if (!depositTargetLi) {
            const missingFromTarget = Math.max(0, targetBalance - balance);
            depositTargetLi = document.createElement("li");
            depositTargetLi.innerHTML = `
      <a
        href="#"
        data-view=".view-main"
        class="item-link close-panel fh-banker-deposit-target"
      >
        <div class="item-content">
          <div class="item-inner">
            <div class="item-title">
              <i class="fa fa-fw fa-arrow-right"></i>
              Deposit Target Balance
            </div>
            <div class="item-after">${formatter.format(missingFromTarget)} Silver</div>
          </div>
        </div>
      </a>
    `;
            depositTargetLi.addEventListener("click", (event) => {
                event.preventDefault();
                if (missingFromTarget === 0) {
                    return;
                }
                (0, confirmation_1.showConfirmation)(`Deposit ${formatter.format(missingFromTarget)} Silver?`, () => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, bank_1.depositSilver)(missingFromTarget);
                    yield (0, popup_1.showPopup)({
                        title: "Success!",
                        contentHTML: "You deposited Silver!",
                    });
                    window.location.reload();
                }));
            });
            bulkOptionsList.insertBefore(depositTargetLi, 
            // eslint-disable-next-line unicorn/prefer-at
            bulkOptionsList.children[bulkOptionsList.children.length - 1]);
        }
        // withdraw interest button
        let withdrawInterestLi = document.querySelector(".fh-banker-withdraw-interest");
        if (!withdrawInterestLi) {
            withdrawInterestLi = document.createElement("li");
            withdrawInterestLi.innerHTML = `
      <a
        href="#"
        data-view=".view-main"
        class="item-link close-panel fh-banker-withdraw-interest"
      >
        <div class="item-content">
          <div class="item-inner">
            <div class="item-title">
              <i class="fa fa-fw fa-arrow-left"></i>
              Withdraw Interest
            </div>
            <div class="item-after">${formatter.format(availableInterest)} Silver</div>
          </div>
        </div>
      </a>
    `;
            withdrawInterestLi.addEventListener("click", (event) => {
                event.preventDefault();
                if (availableInterest === 0) {
                    return;
                }
                (0, confirmation_1.showConfirmation)(`Withdraw ${formatter.format(availableInterest)} Silver?`, () => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, bank_1.withdrawSilver)(availableInterest);
                    yield (0, popup_1.showPopup)({
                        title: "Success!",
                        contentHTML: "You withdrew Silver!",
                    });
                    window.location.reload();
                }));
            });
            bulkOptionsList.insertBefore(withdrawInterestLi, 
            // eslint-disable-next-line unicorn/prefer-at
            bulkOptionsList.children[bulkOptionsList.children.length - 1]);
        }
    },
};


/***/ }),

/***/ 5299:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.briefingPanel = void 0;
const craftworks_1 = __webpack_require__(920);
const goals_1 = __webpack_require__(1267);
const craftworks_2 = __webpack_require__(7831);
const theme_1 = __webpack_require__(1178);
const recipes_1 = __webpack_require__(498);
const api_1 = __webpack_require__(3413);
const suggestions_1 = __webpack_require__(9262);
const focus_1 = __webpack_require__(7167);
const requests_1 = __webpack_require__(3300);
const quests_1 = __webpack_require__(303);
const settings_1 = __webpack_require__(126);
const inventory_1 = __webpack_require__(4514);
const gameLinks_1 = __webpack_require__(1616);
const mastery_1 = __webpack_require__(283);
const promise_1 = __webpack_require__(6762);
const page_1 = __webpack_require__(7952);
const unlimited_1 = __webpack_require__(4808);
const craftPlanner_1 = __webpack_require__(5825);
const SETTING_BRIEFING_PANEL = {
    id: settings_1.SettingId.BRIEFING_PANEL,
    title: "Briefing: Floating panel",
    description: `
    A button above the bottom bar that opens your goals, the Craftworks queue,
    your open requests and where to go, from any page
  `,
    type: "boolean",
    defaultValue: true,
};
const BUTTON_ID = "fh-briefing-button";
const PANEL_ID = "fh-briefing-panel";
const STYLE_ID = "fh-briefing-style";
const MAX_LISTED = 5;
// Bottom-left, mirroring the cap tracker's floating fallback on the right, so
// the two never collide and both clear the bottom bar.
const EDGE_OFFSET = "8px";
const BOTTOM_OFFSET = "62px";
const TABS = [
    { id: "now", label: "Now" },
    { id: "goals", label: "Goals" },
    { id: "sets", label: "Sets" },
    // "Queue" rather than "Craftworks": four labels have to fit 380px, and the
    // panel is already inside Craftworks by context
    { id: "craftworks", label: "Queue" },
];
const injectStyles = () => {
    if (document.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    document.head.insertAdjacentHTML("beforeend", `<style id="${STYLE_ID}">
      #${BUTTON_ID} {
        position: fixed;
        left: ${EDGE_OFFSET};
        bottom: ${BOTTOM_OFFSET};
        z-index: 5000;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid ${theme_1.BORDER_GRAY};
        background: rgba(20, 20, 20, 0.92);
        color: ${theme_1.TEXT_GRAY};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        transition: transform 140ms ease, color 140ms ease,
          border-color 140ms ease;
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
      }
      #${BUTTON_ID}:hover { color: ${theme_1.TEXT_WHITE}; border-color: #5a5a5a; }
      #${BUTTON_ID}:active { transform: scale(0.94); }
      #${BUTTON_ID}[data-open="true"] {
        color: ${theme_1.TEXT_WHITE};
        transform: rotate(90deg);
      }
      #${BUTTON_ID} .fh-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        background: ${theme_1.TEXT_WARNING};
        color: #111;
        font-size: 11px;
        font-weight: bold;
        line-height: 18px;
        text-align: center;
      }
      #${PANEL_ID} {
        position: fixed;
        left: ${EDGE_OFFSET};
        bottom: calc(${BOTTOM_OFFSET} + 52px);
        z-index: 5001;
        width: 380px;
        max-width: calc(100vw - 16px);
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid ${theme_1.BORDER_GRAY};
        background: rgba(18, 18, 19, 0.97);
        box-shadow: 0 10px 34px rgba(0, 0, 0, 0.55);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 140ms ease, transform 140ms ease;
      }
      #${PANEL_ID}[data-open="true"] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      #${PANEL_ID} .fh-briefing-body {
        overflow-y: auto;
        overscroll-behavior: contain;
        flex: 1 1 auto;
      }
      #${PANEL_ID} .fh-briefing-body::-webkit-scrollbar { width: 8px; }
      #${PANEL_ID} .fh-briefing-body::-webkit-scrollbar-thumb {
        background: #3a3a3a;
        border-radius: 4px;
      }
      #${PANEL_ID} .fh-briefing-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .fh-briefing-refresh {
        cursor: pointer;
        color: ${theme_1.TEXT_GRAY};
        font-size: 11px;
      }
      #${PANEL_ID} .fh-briefing-refresh:hover { color: ${theme_1.TEXT_WHITE}; }
      #${PANEL_ID} .fh-briefing-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
        border-bottom: 1px solid ${theme_1.BORDER_GRAY};
        padding-bottom: 8px;
      }
      #${PANEL_ID} .fh-tab {
        flex: 1 1 0;
        text-align: center;
        padding: 5px 8px;
        border-radius: 7px;
        font-size: 12px;
        cursor: pointer;
        color: ${theme_1.TEXT_GRAY};
        background: transparent;
        transition: background 120ms ease, color 120ms ease;
        user-select: none;
      }
      #${PANEL_ID} .fh-tab:hover { color: ${theme_1.TEXT_WHITE}; }
      #${PANEL_ID} .fh-tab[data-active="true"] {
        color: ${theme_1.TEXT_WHITE};
        background: rgba(255, 255, 255, 0.09);
      }
      #${PANEL_ID} .fh-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 8px;
      }
      #${PANEL_ID} .fh-chip {
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid ${theme_1.BORDER_GRAY};
        font-size: 11px;
        cursor: pointer;
        color: ${theme_1.TEXT_GRAY};
        user-select: none;
        transition: background 120ms ease, color 120ms ease,
          border-color 120ms ease;
      }
      #${PANEL_ID} .fh-chip:hover { color: ${theme_1.TEXT_WHITE}; }
      #${PANEL_ID} .fh-chip[data-active="true"] {
        color: ${theme_1.TEXT_WHITE};
        background: rgba(255, 255, 255, 0.11);
        border-color: #5a5a5a;
      }
      #${PANEL_ID} .fh-goal { margin-bottom: 10px; }
      #${PANEL_ID} .fh-goal-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }
      #${PANEL_ID} .fh-goal-remove {
        cursor: pointer;
        color: #6a6a6a;
        font-size: 14px;
        line-height: 1;
      }
      #${PANEL_ID} .fh-goal-remove:hover { color: ${theme_1.TEXT_ERROR}; }
      #${PANEL_ID} .fh-bar {
        height: 4px;
        border-radius: 2px;
        background: #2a2a2a;
        margin: 4px 0 3px;
        overflow: hidden;
      }
      #${PANEL_ID} .fh-bar > div {
        height: 100%;
        border-radius: 2px;
        background: ${theme_1.TEXT_SUCCESS};
        transition: width 200ms ease;
      }
    </style>`);
};
// Inline so it always draws: the game mixes Font Awesome 4 and 6 and neither
// set is guaranteed to carry a given glyph.
const ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h11M3 12h8M3 18h11" />
    <path d="M16 15l3 3 5-6" />
  </svg>`;
const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
// What the badge is counting, in words.
//
// The number alone mixes three unrelated things, so "1" could be a dead slot,
// a mis-ordered queue or a request waiting to be handed in. The tooltip says
// which, and both callers build it the same way so the figure cannot mean one
// thing before the panel is opened and another after.
const summarizeAttention = (advice, readyRequests) => {
    const parts = [];
    if (advice && advice.dead.length > 0) {
        parts.push(`${plural(advice.dead.length, "slot")} at cap`);
    }
    if (advice && advice.ordering.length > 0) {
        parts.push(`${plural(advice.ordering.length, "slot")} out of order`);
    }
    if (readyRequests > 0) {
        parts.push(`${plural(readyRequests, "request")} ready`);
    }
    return {
        count: (advice ? advice.dead.length + advice.ordering.length : 0) +
            readyRequests,
        parts,
    };
};
const setBadge = (count, parts, isStale = false) => {
    const button = document.querySelector(`#${BUTTON_ID}`);
    if (!button) {
        return;
    }
    button.title =
        parts.length > 0
            ? `Farmhand briefing — ${parts.join(", ")}${isStale ? " (from the last read)" : ""}`
            : "Farmhand briefing";
    const existing = button.querySelector(".fh-badge");
    if (count <= 0) {
        existing === null || existing === void 0 ? void 0 : existing.remove();
        return;
    }
    const badge = existing !== null && existing !== void 0 ? existing : document.createElement("span");
    badge.className = "fh-badge";
    badge.textContent = String(count);
    if (!existing) {
        button.append(badge);
    }
};
const makeHeading = (text) => {
    const heading = document.createElement("div");
    heading.textContent = text;
    heading.style.color = theme_1.TEXT_WHITE;
    heading.style.fontSize = "11px";
    heading.style.fontWeight = "bold";
    heading.style.letterSpacing = "0.4px";
    heading.style.textTransform = "uppercase";
    heading.style.margin = "12px 0 4px";
    return heading;
};
const formatHits = (hits) => hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);
const fetchActiveQuests = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, requests_1.getHTML)(page_1.Page.QUESTS, new URLSearchParams());
        return (0, quests_1.parseActiveQuests)(response.body);
    }
    catch (_a) {
        return undefined;
    }
});
// Everything the three tabs need, gathered once. Switching tabs re-renders from
// this rather than re-fetching, so only the refresh control costs requests.
const loadContext = (force) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const settings = yield (0, settings_1.getSettingValues)();
    const unlimited = (0, unlimited_1.parseUnlimitedItems)(String((_a = settings[settings_1.SettingId.UNLIMITED_ITEMS]) !== null && _a !== void 0 ? _a : ""));
    const [snapshot, craftworks, quests, goals, mastery, basicItems] = yield Promise.all([
        (0, promise_1.orUndefined)(inventory_1.inventoryState.get({ ignoreCache: force })),
        (0, promise_1.orUndefined)(craftworks_1.craftworksState.get({ ignoreCache: force })),
        fetchActiveQuests(),
        (0, goals_1.getGoals)(),
        (0, promise_1.orUndefined)(mastery_1.masteryState.get({ ignoreCache: force })),
        (0, promise_1.orUndefined)((0, api_1.getBasicItems)()),
    ]);
    const inventory = (_b = snapshot === null || snapshot === void 0 ? void 0 : snapshot.quantities) !== null && _b !== void 0 ? _b : {};
    const cap = snapshot === null || snapshot === void 0 ? void 0 : snapshot.cap;
    const advice = craftworks
        ? (0, craftworks_2.adviseOnSlots)(craftworks.slots, cap, unlimited)
        : undefined;
    const questGoals = quests ? yield (0, quests_1.getQuestGoals)(quests) : undefined;
    const graph = yield (0, recipes_1.gatherRecipeGraph)([
        ...((_c = questGoals === null || questGoals === void 0 ? void 0 : questGoals.goals) !== null && _c !== void 0 ? _c : []).flatMap((goal) => goal.needs.map((need) => need.name)),
        ...((_d = advice === null || advice === void 0 ? void 0 : advice.roots.map((root) => root.name)) !== null && _d !== void 0 ? _d : []),
        ...goals.map((goal) => goal.name),
    ]);
    return {
        advice,
        cap,
        craftworks,
        goalProgress: goals.map((goal) => { var _a; return (0, goals_1.getGoalProgress)(graph, goal, inventory, unlimited, (_a = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _a !== void 0 ? _a : []); }),
        goals,
        graph,
        inventory,
        itemNames: (basicItems !== null && basicItems !== void 0 ? basicItems : []).map((item) => item.name),
        mastery: (_e = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _e !== void 0 ? _e : [],
        questGoals,
        statuses: (0, focus_1.getGoalStatuses)(graph, (_f = questGoals === null || questGoals === void 0 ? void 0 : questGoals.goals) !== null && _f !== void 0 ? _f : [], inventory, unlimited),
        unlimited,
    };
});
// Takes exactly what to source. It used to fold in quest bottlenecks itself
// regardless of caller, which meant the Goals tab quoted trips for items no
// tracked goal wanted — each tab now decides what its own list means.
const renderWhereToGo = (body, context, missing) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { graph } = context;
    const sourcing = (0, craftPlanner_1.planSourcing)(graph, missing);
    if (sourcing.locations.length === 0) {
        return;
    }
    body.append(makeHeading("Where to go"));
    const top = sourcing.locations.slice(0, MAX_LISTED);
    const references = yield Promise.all(top.map((entry) => (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: entry.location }))));
    for (const [index, entry] of top.entries()) {
        const color = entry.items.length > 1 ? theme_1.TEXT_SUCCESS : theme_1.TEXT_GRAY;
        const parts = [
            (0, gameLinks_1.makeLocationLink)(entry.location, references[index], color),
            ` ~${formatHits(entry.hits)} ${entry.type === "fishing" ? "casts" : "explores"} — `,
        ];
        for (const [itemIndex, item] of entry.items.slice(0, 4).entries()) {
            if (itemIndex > 0) {
                parts.push(", ");
            }
            parts.push((0, gameLinks_1.makeItemLink)(item.name, (_a = graph.nodes.get(item.name)) === null || _a === void 0 ? void 0 : _a.id, color));
        }
        body.append((0, gameLinks_1.makeLinkedLine)(color, parts));
    }
});
const renderNow = (body, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { advice, goalProgress, graph, questGoals, statuses } = context;
    const ready = statuses.filter((status) => status.isReady);
    const nearlyDone = (0, focus_1.getNearlyDone)(statuses);
    if (ready.length > 0) {
        body.append(makeHeading("Ready to turn in"));
        for (const status of ready.slice(0, MAX_LISTED)) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, [
                (0, gameLinks_1.makeQuestLink)(status.goal.label, status.goal.href, theme_1.TEXT_SUCCESS),
            ]));
        }
    }
    if (nearlyDone.length > 0) {
        body.append(makeHeading("One item away"));
        for (const status of nearlyDone.slice(0, MAX_LISTED)) {
            const [only] = status.missing;
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
                (0, gameLinks_1.makeQuestLink)(status.goal.label, status.goal.href, theme_1.TEXT_WARNING),
                ` — ${only.quantity.toLocaleString()} × `,
                (0, gameLinks_1.makeItemLink)(only.name, (_a = graph.nodes.get(only.name)) === null || _a === void 0 ? void 0 : _a.id, theme_1.TEXT_WARNING),
            ]));
        }
    }
    if (advice && advice.dead.length + advice.ordering.length > 0) {
        body.append(makeHeading("Craftworks needs a hand"));
        for (const slot of advice.dead.slice(0, MAX_LISTED)) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_ERROR, [
                (0, gameLinks_1.makeItemLink)(slot.name, Number(slot.id) || undefined, theme_1.TEXT_ERROR),
                " is at cap — dead slot",
            ]));
        }
        for (const { producer, slot } of advice.ordering) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
                `move #${producer.position} ${producer.name} above #${slot.position} ${slot.name}`,
            ]));
        }
    }
    // Craftworks says what a slot is out of but never how many it is short by,
    // so a blocker counts as one unit; a request's shortfall is exact. Both are
    // the same trip, which is why they merge rather than being listed twice.
    yield renderWhereToGo(body, context, (0, focus_1.mergeMissing)((0, focus_1.rankBottlenecks)(statuses).map((entry) => ({
        name: entry.name,
        quantity: entry.maxNeeded,
    })), ((_b = advice === null || advice === void 0 ? void 0 : advice.roots) !== null && _b !== void 0 ? _b : []).map((root) => ({ name: root.name, quantity: 1 })), 
    // tracked goals steer this list too, so setting a goal changes where the
    // panel sends you rather than only what the Goals tab says
    ...goalProgress.map((entry) => entry.missing)));
    if (body.childNodes.length === 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, ["Nothing needs attention."]));
    }
    const { unmatched } = questGoals !== null && questGoals !== void 0 ? questGoals : {};
    if (unmatched === null || unmatched === void 0 ? void 0 : unmatched.length) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [`not on buddy.farm: ${unmatched.join(", ")}`]));
    }
});
const renderGoals = (body, context, rerender) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { goalProgress, goals, graph } = context;
    if (goals.length === 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            "No goals yet — pick one below, or use “Track as goal” on any item page.",
        ]));
    }
    for (const progress of goalProgress) {
        const { canMakeNow, goal, have, missing, ratio } = progress;
        const row = document.createElement("div");
        row.className = "fh-goal";
        const top = document.createElement("div");
        top.className = "fh-goal-top";
        const name = document.createElement("div");
        name.style.fontSize = "12px";
        name.append((0, gameLinks_1.makeItemLink)(goal.name, (_a = graph.nodes.get(goal.name)) === null || _a === void 0 ? void 0 : _a.id, ratio >= 1 ? theme_1.TEXT_SUCCESS : theme_1.TEXT_WHITE));
        const remove = document.createElement("span");
        remove.className = "fh-goal-remove";
        remove.textContent = "×";
        remove.title = `Stop tracking ${goal.name}`;
        remove.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.stopPropagation();
            yield (0, goals_1.removeGoal)(goal.name);
            rerender();
        }));
        top.append(name, remove);
        const bar = document.createElement("div");
        bar.className = "fh-bar";
        const fill = document.createElement("div");
        fill.style.width = `${Math.round(ratio * 100)}%`;
        if (ratio < 1) {
            fill.style.background = theme_1.TEXT_WARNING;
        }
        bar.append(fill);
        const detail = ratio >= 1
            ? `ready — ${have} on hand${canMakeNow > 0 ? `, ${canMakeNow} craftable` : ""}`
            : `${have}/${goal.quantity} made · ${canMakeNow} craftable now`;
        row.append(top, bar, (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [detail]));
        if (missing.length > 0) {
            const parts = ["short: "];
            for (const [index, entry] of missing.slice(0, 4).entries()) {
                if (index > 0) {
                    parts.push(", ");
                }
                parts.push(`${entry.quantity.toLocaleString()} × `, (0, gameLinks_1.makeItemLink)(entry.name, (_b = graph.nodes.get(entry.name)) === null || _b === void 0 ? void 0 : _b.id, theme_1.TEXT_WARNING));
            }
            row.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, parts));
        }
        body.append(row);
    }
    // only what the tracked goals themselves need
    if (goalProgress.length > 0) {
        yield renderWhereToGo(body, context, (0, focus_1.mergeMissing)(...goalProgress.map((entry) => entry.missing)));
    }
    renderSuggestions(body, context, rerender);
});
// Panel-scoped, not persisted: a filter is a way to read the list right now,
// not a preference worth carrying between sessions.
let suggestionFilter = "all";
const FILTER_LABELS = [
    { id: "all", label: "All" },
    { id: "set", label: "Sets" },
    { id: "mastery", label: "Mastery" },
    { id: "quest", label: "Requests" },
];
// Suggestions are offered, never auto-adopted. Mastery alone would add hundreds
// of entries and the tab would stop being a place to look for what matters, so
// the player promotes the few they actually intend to chase.
//
// Unfiltered, each source contributes a few so no one of them crowds the others
// out. Picking a category then shows far more of it — filtering is for reading
// deeper into one source, not only for hiding the rest.
const PER_SOURCE_UNFILTERED = 3;
const PER_SOURCE_FILTERED = 10;
const renderSuggestions = (body, context, rerender) => {
    var _a, _b;
    const { cap, craftworks, goals, graph, inventory, itemNames, mastery, questGoals, } = context;
    const bySource = {
        mastery: (0, suggestions_1.getMasterySuggestions)(mastery, inventory, cap, goals, PER_SOURCE_FILTERED),
        quest: (0, suggestions_1.getQuestSuggestions)((_a = questGoals === null || questGoals === void 0 ? void 0 : questGoals.goals) !== null && _a !== void 0 ? _a : [], inventory, goals, PER_SOURCE_FILTERED),
        set: (0, suggestions_1.getSetSuggestions)((_b = craftworks === null || craftworks === void 0 ? void 0 : craftworks.sets) !== null && _b !== void 0 ? _b : [], itemNames, goals, inventory, PER_SOURCE_FILTERED),
    };
    const total = bySource.set.length + bySource.mastery.length + bySource.quest.length;
    if (total === 0) {
        return;
    }
    body.append(makeHeading("Suggested"));
    const chips = document.createElement("div");
    chips.className = "fh-chips";
    const list = document.createElement("div");
    body.append(chips, list);
    const drawList = () => {
        var _a, _b;
        list.textContent = "";
        const shown = suggestionFilter === "all"
            ? [
                // saved sets first: goals the player has already been keeping
                ...bySource.set.slice(0, PER_SOURCE_UNFILTERED),
                ...bySource.mastery.slice(0, PER_SOURCE_UNFILTERED),
                ...bySource.quest.slice(0, PER_SOURCE_UNFILTERED),
            ]
            : bySource[suggestionFilter];
        for (const chip of chips.children) {
            chip.dataset.active = String(chip.dataset.filter === suggestionFilter);
        }
        for (const suggestion of shown) {
            const row = document.createElement("div");
            row.className = "fh-goal-top";
            row.style.marginBottom = "4px";
            const text = (0, gameLinks_1.makeLinkedLine)(suggestion.isFrozen ? theme_1.TEXT_ERROR : theme_1.TEXT_GRAY, [
                (0, gameLinks_1.makeItemLink)(suggestion.name, (_a = suggestion.id) !== null && _a !== void 0 ? _a : (_b = graph.nodes.get(suggestion.name)) === null || _b === void 0 ? void 0 : _b.id, suggestion.isFrozen ? theme_1.TEXT_ERROR : theme_1.TEXT_WHITE),
                ` ${suggestion.quantity.toLocaleString()} more — ${suggestion.reason}`,
            ]);
            text.style.marginBottom = "0";
            const add = document.createElement("span");
            add.className = "fh-goal-remove";
            add.style.color = theme_1.TEXT_SUCCESS;
            add.textContent = "+";
            add.title = `Track ${suggestion.name}`;
            add.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
                event.stopPropagation();
                yield (0, goals_1.addGoal)(suggestion.name, suggestion.quantity, suggestion.source === "mastery" ? "mastery" : undefined);
                rerender();
            }));
            row.append(text, add);
            list.append(row);
        }
    };
    const select = (filter) => {
        suggestionFilter = filter;
        drawList();
    };
    for (const entry of FILTER_LABELS) {
        const count = entry.id === "all" ? total : bySource[entry.id].length;
        // a category with nothing in it is not worth a chip
        if (count === 0) {
            continue;
        }
        const chip = document.createElement("span");
        chip.className = "fh-chip";
        chip.dataset.filter = entry.id;
        chip.textContent = `${entry.label} ${count}`;
        chip.addEventListener("click", (event) => {
            event.stopPropagation();
            select(entry.id);
        });
        chips.append(chip);
    }
    // a filter left over from a previous draw may no longer have any entries
    if (suggestionFilter !== "all" && bySource[suggestionFilter].length === 0) {
        suggestionFilter = "all";
    }
    drawList();
};
// Start/stop for the whole queue. Both calls are reversible and take no
// parameters, so unlike loading a set this needs no confirmation.
const makeQueueToggle = (craftworks, reload) => {
    const running = craftworks.slots.filter((slot) => !slot.isPaused).length;
    const isRunning = running > 0;
    const toggle = document.createElement("a");
    toggle.href = "#";
    toggle.style.fontSize = "11px";
    toggle.style.whiteSpace = "nowrap";
    toggle.style.textDecoration = "underline";
    toggle.style.color = isRunning ? theme_1.TEXT_WARNING : theme_1.TEXT_SUCCESS;
    toggle.textContent = isRunning ? "pause all" : "start all";
    toggle.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        event.stopPropagation();
        toggle.textContent = isRunning ? "pausing…" : "starting…";
        toggle.style.color = theme_1.TEXT_GRAY;
        const ok = yield (0, craftworks_1.setQueueRunning)(!isRunning);
        if (!ok) {
            toggle.textContent = "failed — try again";
            toggle.style.color = theme_1.TEXT_ERROR;
            return;
        }
        reload();
    }));
    return toggle;
};
const renderCraftworks = (body, context, reload) => {
    var _a, _b, _c;
    const { advice, cap, craftworks, goals, graph, inventory, mastery, unlimited, } = context;
    if (!advice || !craftworks) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, ["Could not read the Craftworks queue."]));
        return;
    }
    const maxSlots = (_a = craftworks.maxSlots) !== null && _a !== void 0 ? _a : craftworks.slots.length;
    const free = maxSlots - craftworks.slots.length;
    const summary = document.createElement("div");
    summary.className = "fh-goal-top";
    summary.style.marginBottom = "4px";
    const summaryText = (0, gameLinks_1.makeLinkedLine)(advice.working.length > 0 ? theme_1.TEXT_GRAY : theme_1.TEXT_WARNING, [
        `${advice.working.length} of ${craftworks.slots.length} slots crafting`,
        free > 0 ? `, ${free} free` : "",
    ]);
    summaryText.style.marginBottom = "0";
    summary.append(summaryText, makeQueueToggle(craftworks, reload));
    body.append(summary);
    for (const slot of craftworks.slots) {
        const isDead = advice.dead.includes(slot);
        const isStalled = slot.blockedOn.length > 0 && !isDead;
        let color = theme_1.TEXT_SUCCESS;
        if (isDead) {
            color = theme_1.TEXT_ERROR;
        }
        else if (isStalled) {
            color = theme_1.TEXT_WARNING;
        }
        const parts = [
            `${slot.position}. `,
            (0, gameLinks_1.makeItemLink)(slot.name, Number(slot.id) || undefined, color),
        ];
        if (isDead) {
            parts.push(" — at cap, dead slot");
        }
        else if (slot.isPaused) {
            parts.push(" — paused");
        }
        else if (isStalled) {
            parts.push(` — out of ${slot.blockedOn.map((entry) => entry.name).join(", ")}`);
        }
        else {
            parts.push(" — crafting");
        }
        body.append((0, gameLinks_1.makeLinkedLine)(color, parts));
    }
    const active = ((_b = craftworks.sets) !== null && _b !== void 0 ? _b : []).find((set) => set.isActive);
    if (active) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [`active set: ${active.name}`]));
    }
    renderSetLoader(body, context, reload);
    const frozen = (0, suggestions_1.getFrozenMastery)(mastery, inventory, cap);
    if (frozen.length > 0) {
        body.append(makeHeading("Mastery frozen at cap"));
        for (const entry of frozen.slice(0, MAX_LISTED)) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_ERROR, [
                (0, gameLinks_1.makeItemLink)(entry.name, entry.id, theme_1.TEXT_ERROR),
                ` ${entry.value.toLocaleString()}/${entry.required.toLocaleString()} — ${entry.remaining.toLocaleString()} more, but you are at cap so none of it counts`,
            ]));
        }
    }
    if (advice.supplied.length > 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            `auto-bought, ignore: ${advice.supplied
                .map((entry) => entry.name)
                .join(", ")}`,
        ]));
    }
    // Suggestions are goal-driven when there are goals; otherwise the queue's own
    // stalled slots are the only thing there is to reason from.
    const desired = goals.length > 0
        ? (0, goals_1.getDesiredQueue)(graph, goals, inventory, unlimited)
        : advice.roots
            .filter((root) => { var _a; return (_a = graph.nodes.get(root.name)) === null || _a === void 0 ? void 0 : _a.canCraft; })
            .map((root) => ({ name: root.name, quantity: 1 }));
    const suggestions = (0, craftworks_2.suggestQueueChanges)(desired, craftworks.slots, inventory, cap, maxSlots, unlimited);
    if (suggestions.length > 0) {
        body.append(makeHeading("Suggested changes"));
        for (const suggestion of suggestions) {
            const color = suggestion.action === "drop" ? theme_1.TEXT_ERROR : theme_1.TEXT_SUCCESS;
            body.append((0, gameLinks_1.makeLinkedLine)(color, [
                suggestion.action === "drop" ? "remove " : "add ",
                (0, gameLinks_1.makeItemLink)(suggestion.name, (_c = graph.nodes.get(suggestion.name)) === null || _c === void 0 ? void 0 : _c.id, color),
                ` — ${suggestion.reason}`,
            ]));
        }
        if (goals.length === 0) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
                "Track a goal to get suggestions aimed at something.",
            ]));
        }
    }
};
// Loading a set is destructive: it clears the queue first. So it takes two
// presses -- the second states exactly how many items it will clear -- and on
// failure it offers to put the old queue back, which the game's own button
// cannot do because it never knew what was there.
const makeSetLoadControl = (set, context, reload, onFailure) => {
    var _a, _b;
    const slots = (_b = (_a = context.craftworks) === null || _a === void 0 ? void 0 : _a.slots) !== null && _b !== void 0 ? _b : [];
    const action = document.createElement("a");
    action.href = "#";
    action.style.color = theme_1.TEXT_SUCCESS;
    action.style.fontSize = "12px";
    action.style.textDecoration = "underline";
    action.textContent = "load";
    let armed = false;
    action.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        event.stopPropagation();
        if (!armed) {
            armed = true;
            action.textContent = `confirm — clears ${slots.length} item${slots.length === 1 ? "" : "s"}`;
            action.style.color = theme_1.TEXT_WARNING;
            return;
        }
        action.textContent = "loading…";
        action.style.color = theme_1.TEXT_GRAY;
        // a set you just chose should start working immediately
        const result = yield (0, craftworks_1.activateSet)(set.id, slots, true);
        if (result.ok) {
            reload();
            return;
        }
        onFailure((0, gameLinks_1.makeMutedText)(` ${result.message}`));
        action.textContent = "put the old queue back";
        action.style.color = theme_1.TEXT_ERROR;
        action.addEventListener("click", (undoEvent) => __awaiter(void 0, void 0, void 0, function* () {
            undoEvent.preventDefault();
            undoEvent.stopPropagation();
            action.textContent = "restoring…";
            const restored = yield (0, craftworks_1.restoreQueue)(result.previous);
            action.textContent = `restored ${restored} of ${result.previous.length}`;
            reload();
        }), { once: true });
    }));
    return action;
};
const renderSetLoader = (body, context, reload) => {
    var _a;
    const { craftworks, goals, itemNames } = context;
    if (!craftworks) {
        return;
    }
    const recommended = (0, suggestions_1.getRecommendedSet)(goals, (_a = craftworks.sets) !== null && _a !== void 0 ? _a : [], itemNames);
    if (!recommended) {
        return;
    }
    const line = (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, [
        `“${recommended.name}” matches your ${recommended.goalName} goal — `,
    ]);
    line.append(makeSetLoadControl(recommended, context, reload, (node) => line.append(node)));
    body.append(line);
};
// Every saved set, loadable in place. The recommendation alone was too easy to
// miss: it only appears when a tracked goal happens to share a name with a set,
// so a queue of location loadouts showed nothing at all.
const renderSets = (body, context, reload) => {
    var _a;
    const { craftworks, goals, itemNames } = context;
    const sets = (_a = craftworks === null || craftworks === void 0 ? void 0 : craftworks.sets) !== null && _a !== void 0 ? _a : [];
    if (!craftworks || sets.length === 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, ["No saved sets found on the Craftworks page."]));
        return;
    }
    const recommended = (0, suggestions_1.getRecommendedSet)(goals, sets, itemNames);
    for (const set of sets) {
        const row = document.createElement("div");
        row.className = "fh-goal-top";
        row.style.marginBottom = "5px";
        const isRecommended = (recommended === null || recommended === void 0 ? void 0 : recommended.id) === set.id;
        let color = theme_1.TEXT_GRAY;
        if (set.isActive) {
            color = theme_1.TEXT_WHITE;
        }
        else if (isRecommended) {
            color = theme_1.TEXT_SUCCESS;
        }
        let suffix = "";
        if (set.isActive) {
            suffix = " · loaded";
        }
        else if (isRecommended) {
            suffix = ` · matches your ${recommended === null || recommended === void 0 ? void 0 : recommended.goalName} goal`;
        }
        const label = (0, gameLinks_1.makeLinkedLine)(color, [`${set.name}${suffix}`]);
        label.style.marginBottom = "0";
        row.append(label);
        // reloading the set already in place would re-run a destructive activation
        // for no change
        if (!set.isActive) {
            row.append(makeSetLoadControl(set, context, reload, (node) => label.append(node)));
        }
        body.append(row);
    }
};
// One button and one panel for the whole session, hung off document.body.
//
// Framework7 keeps the page you came from in the DOM, so anything appended
// inside a page element gets duplicated as you navigate and the retained copy's
// listeners point at a detached tree — which is exactly how the first attempt
// at this ended up drawn twice with only one of them responding. Living on the
// body sidesteps page swaps entirely, and the same trick keeps the cap tracker
// single.
const ensurePanel = () => {
    if (document.querySelector(`#${BUTTON_ID}`)) {
        return;
    }
    injectStyles();
    const button = document.createElement("div");
    button.id = BUTTON_ID;
    button.title = "Farmhand briefing";
    button.innerHTML = ICON;
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    const head = document.createElement("div");
    head.className = "fh-briefing-head";
    const title = document.createElement("div");
    title.textContent = "Briefing";
    title.style.color = theme_1.TEXT_WHITE;
    title.style.fontWeight = "bold";
    const refresh = document.createElement("span");
    refresh.className = "fh-briefing-refresh";
    refresh.textContent = "refresh";
    head.append(title, refresh);
    const tabs = document.createElement("div");
    tabs.className = "fh-briefing-tabs";
    const body = document.createElement("div");
    body.className = "fh-briefing-body";
    panel.append(head, tabs, body);
    document.body.append(button, panel);
    let active = "now";
    let context;
    const draw = () => {
        body.textContent = "";
        if (!context) {
            return;
        }
        for (const tab of tabs.children) {
            tab.dataset.active = String(tab.dataset.tab === active);
        }
        switch (active) {
            case "now": {
                renderNow(body, context);
                break;
            }
            case "goals": {
                renderGoals(body, context, () => {
                    // a removed goal changes the list itself, so reload before redrawing
                    load(false);
                });
                break;
            }
            case "sets": {
                renderSets(body, context, () => load(true));
                break;
            }
            default: {
                renderCraftworks(body, context, () => load(true));
            }
        }
    };
    const load = (force) => __awaiter(void 0, void 0, void 0, function* () {
        body.textContent = "";
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, ["Reading your farm…"]));
        context = yield loadContext(force);
        const attention = summarizeAttention(context.advice, context.statuses.filter((status) => status.isReady).length);
        setBadge(attention.count, attention.parts);
        draw();
    });
    const selectTab = (id) => {
        active = id;
        draw();
    };
    for (const tab of TABS) {
        const element = document.createElement("div");
        element.className = "fh-tab";
        element.dataset.tab = tab.id;
        element.textContent = tab.label;
        element.addEventListener("click", (event) => {
            event.stopPropagation();
            selectTab(tab.id);
        });
        tabs.append(element);
    }
    // Nothing is fetched until the panel is opened. It costs three page fetches
    // plus buddy.farm lookups, and the home page already refetches itself every
    // minute while a meal cooks, so an eager panel would become a steady
    // background load.
    let hasLoaded = false;
    const setOpen = (open) => {
        panel.dataset.open = String(open);
        button.dataset.open = String(open);
        if (open && !hasLoaded) {
            hasLoaded = true;
            load(false);
        }
    };
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(panel.dataset.open !== "true");
    });
    refresh.addEventListener("click", (event) => {
        event.stopPropagation();
        load(true);
    });
    panel.addEventListener("click", (event) => {
        const target = event.target;
        if (target === null || target === void 0 ? void 0 : target.closest("a")) {
            setOpen(false);
            return;
        }
        event.stopPropagation();
    });
    document.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });
    setOpen(false);
    primeBadge();
};
// Show a count before the panel has ever been opened, using only what is
// already in GM storage. `doNotFetch` means this cannot cost a request, so a
// stale-but-free number beats no number at all; opening the panel corrects it.
const primeBadge = () => __awaiter(void 0, void 0, void 0, function* () {
    const [snapshot, craftworks] = yield Promise.all([
        (0, promise_1.orUndefined)(inventory_1.inventoryState.get({ doNotFetch: true })),
        (0, promise_1.orUndefined)(craftworks_1.craftworksState.get({ doNotFetch: true })),
    ]);
    if (!craftworks) {
        return;
    }
    // requests are not counted here: reading them costs a fetch, and this runs
    // before the panel has been opened. Marked stale so the tooltip says so
    // rather than implying it is the whole picture.
    const advice = (0, craftworks_2.adviseOnSlots)(craftworks.slots, snapshot === null || snapshot === void 0 ? void 0 : snapshot.cap);
    const attention = summarizeAttention(advice, 0);
    setBadge(attention.count, attention.parts, true);
});
exports.briefingPanel = {
    settings: [SETTING_BRIEFING_PANEL],
    onInitialize: (settings) => {
        if (!settings[settings_1.SettingId.BRIEFING_PANEL]) {
            return;
        }
        ensurePanel();
    },
    onPageLoad: (settings) => {
        var _a, _b;
        if (!settings[settings_1.SettingId.BRIEFING_PANEL]) {
            (_a = document.querySelector(`#${BUTTON_ID}`)) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = document.querySelector(`#${PANEL_ID}`)) === null || _b === void 0 ? void 0 : _b.remove();
            return;
        }
        // cheap: returns immediately once the button exists. Covers the case where
        // initialization ran before the game shell was ready.
        ensurePanel();
    },
};


/***/ }),

/***/ 2273:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buddyFarm = void 0;
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(6747);
const settings_1 = __webpack_require__(126);
const SETTING_BUDDY_FARM = {
    id: settings_1.SettingId.BUDDY_FARM,
    title: "Item: Buddy's Almanac",
    description: "Add shortcut to look up items and quests on buddy.farm",
    type: "boolean",
    defaultValue: true,
};
exports.buddyFarm = {
    settings: [SETTING_BUDDY_FARM],
    onPageLoad: (settings, page) => {
        var _a, _b, _c, _d, _e;
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.BUDDY_FARM]) {
            return;
        }
        // make sure page content has loaded
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        // handle item pages
        if (page === page_1.Page.ITEM) {
            // find header to get item data
            const itemHeader = document.querySelector(".sharelink");
            if (!itemHeader) {
                console.error("Item header not found");
                return;
            }
            // get name and link for item
            const itemName = (_a = itemHeader.textContent) !== null && _a !== void 0 ? _a : "";
            const itemLink = `https://buddy.farm/i/${(0, requests_1.nameToSlug)(itemName)}`;
            // use title to find item details section
            const titles = currentPage.querySelectorAll(".content-block-title");
            const itemDetailsTitle = [...titles].find((title) => title.textContent === "Item Details");
            const itemDetailsCard = itemDetailsTitle === null || itemDetailsTitle === void 0 ? void 0 : itemDetailsTitle.nextElementSibling;
            const itemDetailsList = itemDetailsCard === null || itemDetailsCard === void 0 ? void 0 : itemDetailsCard.querySelector("ul");
            if (!itemDetailsList) {
                console.error("Item Details list not found");
                return;
            }
            // remove existing link
            (_b = document.querySelector(".fh-buddyshortcut")) === null || _b === void 0 ? void 0 : _b.remove();
            // create a new item detail for buddy.farm link
            const buddyFarmLinkLi = document.createElement("li");
            buddyFarmLinkLi.classList.add("close-panel");
            buddyFarmLinkLi.classList.add("fh-buddyshortcut");
            buddyFarmLinkLi.innerHTML = `
      <div class="item-content">
        <div class="item-media">
          <a
            href="https://buddy.farm"
            onclick="window.open('https://buddy.farm', '_blank');return false;"
          >
            <img src="https://buddy.farm/icons/icon-256x256.png" class="itemimg">
          </a>
        </div>
        <div class="item-inner">
          <div class="item-title">
            Buddy's Almanac
            <br><span style="font-size: 11px">Lookup item on buddy.farm</span>
          </div>
          <div class="item-after">
            <a
              href="${itemLink}"
              onclick="window.open('${itemLink}', '_blank');return false;"
              class="button btngreen"
              style="height:28px"
            >OPEN</a>
          </div>
        </div>
      </div>
    `;
            // insert at top
            itemDetailsList.insertBefore(buddyFarmLinkLi, itemDetailsList.firstChild);
        }
        // handle quest pages
        if (page === page_1.Page.QUEST) {
            // find header to get item data
            const questHeader = currentPage.querySelector(".item-title");
            if (!questHeader) {
                console.error("Quest header not found");
                return;
            }
            // get name and link for item
            const questName = (_c = questHeader.textContent) !== null && _c !== void 0 ? _c : "";
            const questLink = `https://buddy.farm/q/${(0, requests_1.nameToSlug)(questName)}`;
            // find last card to insert
            const card = (_d = (0, page_1.getCardByTitle)("This Help Request is Visible")) !== null && _d !== void 0 ? _d : (0, page_1.getCardByTitle)("This Help Request is Hidden");
            if (!card) {
                console.error("last card not found");
                return;
            }
            // remove existing link
            (_e = document.querySelector(".fh-buddyshortcut")) === null || _e === void 0 ? void 0 : _e.remove();
            // create a new item detail for buddy.farm link
            const buddyFarmLink = document.createElement("div");
            buddyFarmLink.classList.add("list-block");
            buddyFarmLink.classList.add("fh-buddyshortcut");
            buddyFarmLink.innerHTML = `
        <ul>
          <li>
            <div class="item-content">
              <div class="item-media">
                <a
                  href="https://buddy.farm"
                  onclick="window.open('https://buddy.farm', '_blank');return false;"
                >
                  <img src="https://buddy.farm/icons/icon-256x256.png" class="itemimg">
                </a>
              </div>
              <div class="item-inner">
                <div class="item-title">
                  Buddy's Almanac
                  <br><span style="font-size: 11px">Lookup item on buddy.farm</span>
                </div>
                <div class="item-after">
                  <a
                    href="${questLink}"
                    onclick="window.open('${questLink}', '_blank');return false;"
                    class="button btngreen"
                    style="height:28px"
                  >OPEN</a>
                </div>
              </div>
            </div>
          </li>
        </ul>
      `;
            // insert at top
            card.insertBefore(buddyFarmLink, card.firstChild);
        }
    },
};


/***/ }),

/***/ 6922:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.chatNav = void 0;
const theme_1 = __webpack_require__(1178);
const openAutocomplete = (dropdown) => {
    const currentLink = document.querySelector(".cclinkselected");
    const links = [
        ...document.querySelectorAll("#desktopchatpanel .cclink"),
    ];
    if (!links || !currentLink) {
        return;
    }
    links.sort((a, b) => { var _a, _b, _c; return (_c = (_a = a.textContent) === null || _a === void 0 ? void 0 : _a.localeCompare((_b = b.textContent) !== null && _b !== void 0 ? _b : "")) !== null && _c !== void 0 ? _c : 0; });
    const menu = document.createElement("div");
    menu.classList.add("fh-chatdropdown-menu");
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.position = "absolute";
    menu.style.top = "100%";
    menu.style.left = "0";
    menu.style.width = "100%";
    menu.style.background = theme_1.BACKGROUND_DARK;
    menu.style.zIndex = "9999";
    for (const link of links) {
        if (link.dataset.channel === currentLink.dataset.channel) {
            continue;
        }
        const option = document.createElement("div");
        option.textContent = link.textContent;
        option.style.cursor = "pointer";
        option.style.padding = "10px";
        option.addEventListener("click", () => {
            link.click();
            closeAutocomplete();
        });
        menu.append(option);
    }
    dropdown.append(menu);
};
const closeAutocomplete = () => {
    var _a;
    (_a = document.querySelector(".fh-chatdropdown-menu")) === null || _a === void 0 ? void 0 : _a.remove();
};
exports.chatNav = {
    onInitialize: () => {
        document.head.insertAdjacentHTML(`beforeend`, `
      <style>
        /* Hide original chat nav */
        .cclink {
          display: none !important;
        }
      <style>
    `);
    },
    onChatLoad: () => {
        const currentLink = document.querySelector(".cclinkselected");
        if (!currentLink) {
            return;
        }
        const dropdowns = [
            ...document.querySelectorAll(".fh-chatdropdown"),
        ];
        // create dropdowns if we haven't
        if (dropdowns.length === 0) {
            for (const title of document.querySelectorAll(".content-block-title.item-input")) {
                title.style.margin = "0";
                title.style.marginTop = "-5px";
                title.style.overflow = "visible";
                title.style.display = "flex";
                const dropdown = document.createElement("div");
                dropdown.classList.add("fh-chatdropdown");
                dropdown.style.cursor = "pointer";
                dropdown.style.textTransform = "titlecase";
                dropdown.style.width = "calc(100% - 44px)";
                dropdown.style.height = "44px";
                dropdown.style.display = "flex";
                dropdown.style.alignContent = "center";
                dropdown.style.justifyContent = "center";
                dropdown.style.flexWrap = "wrap";
                dropdowns.push(dropdown);
                dropdown.addEventListener("click", () => {
                    const menu = document.querySelector(".fh-chatdropdown-menu");
                    if (menu) {
                        closeAutocomplete();
                    }
                    else {
                        openAutocomplete(title);
                    }
                });
                title.append(dropdown);
                const refresh = document.createElement("i");
                refresh.classList.add("fa");
                refresh.classList.add("fw");
                refresh.classList.add("fa-refresh");
                refresh.style.cursor = "pointer";
                refresh.style.width = "44px";
                refresh.style.height = "44px";
                refresh.style.display = "flex";
                refresh.style.alignItems = "center";
                refresh.style.justifyContent = "center";
                refresh.addEventListener("click", () => {
                    var _a;
                    (_a = document.querySelector(".cclinkselected")) === null || _a === void 0 ? void 0 : _a.click();
                });
                title.append(refresh);
            }
        }
        // update dropdown content
        for (const dropdown of dropdowns) {
            if (dropdown.dataset.channel !== currentLink.dataset.channel) {
                dropdown.innerHTML = `
          ${currentLink.textContent}
          <i class="fa fw fa-caret-down" style="margin-left: 5px;"></i>
        `;
                dropdown.dataset.channel = currentLink.dataset.channel;
            }
        }
    },
};


/***/ }),

/***/ 2742:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cleanupExplore = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_EXPLORE_IMPROVED = {
    id: settings_1.SettingId.EXPLORE_IMPROVED,
    title: "Explore: Improved Layout",
    description: "Larger icons and stable sort",
    type: "boolean",
    defaultValue: true,
};
let maxHeight = 0;
exports.cleanupExplore = {
    settings: [SETTING_EXPLORE_IMPROVED],
    onPageLoad: (settings, page) => {
        if (!page || ![page_1.Page.AREA, page_1.Page.FISHING].includes(page)) {
            return;
        }
        if (!settings[settings_1.SettingId.EXPLORE_IMPROVED]) {
            return;
        }
        // get console
        const console = document.querySelector("#consoletxt");
        if (!console || !console.parentElement) {
            return;
        }
        console.parentElement.style.height = "200px";
        const observer = new MutationObserver(() => {
            const results = console.querySelector("span[style='font-size:11px']");
            if (!results) {
                return;
            }
            const icons = results.querySelectorAll("img");
            if (!icons) {
                return;
            }
            const sortedIcons = [...icons].sort((a, b) => a.src.localeCompare(b.src));
            const improvedLayout = document.createElement("div");
            improvedLayout.style.display = "flex";
            improvedLayout.style.flexWrap = "wrap";
            improvedLayout.style.justifyContent = "center";
            improvedLayout.style.alignItems = "center";
            improvedLayout.style.gap = "10px";
            improvedLayout.style.width = "100%";
            improvedLayout.style.marginTop = "10px";
            improvedLayout.innerHTML = `
      ${sortedIcons
                .map((icon) => {
                var _a, _b;
                return `
            <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
              <img src="${icon.src}" style="${icon.getAttribute("style")};width:36px!important">
              <span style="text-size:13px;">${(_b = (_a = icon.nextSibling) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()}</span>
            </div>
          `;
            })
                .join("")}
    `;
            results.style.display = "none";
            setTimeout(() => {
                maxHeight = Math.max(console.offsetHeight, maxHeight);
                console.style.minHeight = `${maxHeight}px`;
                console.style.display = "block";
            });
            results.after(improvedLayout);
        });
        observer.observe(console, { childList: true });
    },
};


/***/ }),

/***/ 5870:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cleanupHome = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_HIDE_PLAYERS = {
    id: settings_1.SettingId.HOME_HIDE_PLAYERS,
    title: "Home: Hide players",
    description: "Hide Online, new, find players options",
    type: "boolean",
    defaultValue: false,
};
const SETTING_HIDE_THEME = {
    id: settings_1.SettingId.HOME_HIDE_THEME,
    title: "Home: Hide theme switcher",
    description: "Hide theme switcher on homepage",
    type: "boolean",
    defaultValue: false,
};
const SETTING_HIDE_FOOTER = {
    id: settings_1.SettingId.HOME_HIDE_FOOTER,
    title: "Home: Hide footer",
    description: "Hide footer (Privacy, CoC, T&C, Support) ",
    type: "boolean",
    defaultValue: false,
};
const SETTING_COMPRESS_SKILLS = {
    id: settings_1.SettingId.HOME_COMPRESS_SKILLS,
    title: "Home: Compress Skills",
    description: "Hide Level 99 skills",
    type: "boolean",
    defaultValue: true,
};
exports.cleanupHome = {
    settings: [
        SETTING_HIDE_PLAYERS,
        SETTING_HIDE_THEME,
        SETTING_HIDE_FOOTER,
        SETTING_COMPRESS_SKILLS,
    ],
    onInitialize: (settings) => {
        if (settings[settings_1.SettingId.HOME_HIDE_PLAYERS]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            /* Hide players card */
            [data-page="${page_1.Page.HOME_PAGE}"] .content-block-title ~ .content-block-title ~ .content-block-title ~ .content-block-title ~ .content-block-title,
            [data-page="${page_1.Page.HOME_PAGE}"] .content-block-title ~ .content-block-title ~ .content-block-title ~ .content-block-title ~ .content-block-title + .card {
              display: none !important;
            }
          <style>
        `);
        }
        if (settings[settings_1.SettingId.HOME_HIDE_THEME]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            /* Hide theme switcher */
            [data-page="${page_1.Page.HOME_PAGE}"] .page-content > p:nth-of-type(1),
            [data-page="${page_1.Page.HOME_PAGE}"] .page-content > p:nth-of-type(2) {
              display: none !important;
            }
          <style>
        `);
        }
        if (settings[settings_1.SettingId.HOME_HIDE_FOOTER]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            [data-page="${page_1.Page.HOME_PAGE}"] .page-content > p:last-of-type,
            [data-page="${page_1.Page.HOME_PAGE}"] .page-content > div:last-of-type {
              display: none !important;
            }
          <style>
        `);
        }
    },
    onPageLoad: (settings, page) => {
        var _a, _b;
        if (page !== page_1.Page.HOME_PAGE) {
            return;
        }
        if (!settings[settings_1.SettingId.HOME_COMPRESS_SKILLS]) {
            return;
        }
        // get wrappers
        const skillsCard = (0, page_1.getCardByTitle)(/my skills/i);
        const skillsTitle = skillsCard === null || skillsCard === void 0 ? void 0 : skillsCard.previousElementSibling;
        const skillsCardInner = skillsCard === null || skillsCard === void 0 ? void 0 : skillsCard.querySelector(".card-content-inner");
        if (skillsCard && skillsTitle && skillsCardInner) {
            // new row
            const newRow = document.createElement("div");
            newRow.classList.add("row");
            newRow.style.marginBottom = "0";
            newRow.style.display = "flex";
            newRow.style.justifyContent = "space-around";
            // get all skills
            const skills = skillsCard === null || skillsCard === void 0 ? void 0 : skillsCard.querySelectorAll(".col-33");
            let x99 = 0;
            for (const skill of skills) {
                const progress = skill.querySelector("div");
                if (!progress) {
                    continue;
                }
                if (progress.classList.contains("progressbar-infinite")) {
                    x99++;
                }
                else {
                    newRow.append(skill);
                }
            }
            skillsCardInner.prepend(newRow);
            (_a = newRow.nextElementSibling) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = newRow.nextElementSibling) === null || _b === void 0 ? void 0 : _b.remove();
            skillsTitle.style.textTransform = "none";
            skillsTitle.textContent = `MY SKILLS (${x99}x99)`;
            const shinyBar = document.createElement("div");
            shinyBar.classList.add("progressbar-infinite");
            shinyBar.classList.add("color-multi");
            shinyBar.style.width = "100%";
            skillsTitle.after(shinyBar);
        }
    },
};


/***/ }),

/***/ 4056:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collapseItemImage = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_COLLAPSE_ITEM = {
    id: settings_1.SettingId.COLLAPSE_ITEM,
    title: "Item: Collapse Item Image",
    description: "Move item image in header to save space",
    type: "boolean",
    defaultValue: false,
};
exports.collapseItemImage = {
    settings: [SETTING_COLLAPSE_ITEM],
    onInitialize: (settings) => {
        if (settings[settings_1.SettingId.COLLAPSE_ITEM]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            /* Hide item image and description */
            [data-page="item"] #img {
              display: none !important;
            }
            
            /* Hide first section title */
            [data-page="item"] #img + .content-block-title {
              display: none !important;
            }
          </style>
        `);
        }
    },
    onPageLoad: (settings, page) => {
        // make sure we're on the item page
        if (page !== page_1.Page.ITEM) {
            return;
        }
        const itemImage = document.querySelector("#img img");
        if (!itemImage) {
            console.error("Item image not found");
            return;
        }
        // wait for animations
        const sharelink = document.querySelector(".view-main .center .sharelink");
        if (!sharelink) {
            return;
        }
        let smallImage = sharelink.querySelector("img");
        if (!smallImage) {
            smallImage = document.createElement("img");
        }
        sharelink.style.display = "flex";
        sharelink.style.alignItems = "center";
        sharelink.style.gap = "10px";
        smallImage.src = itemImage.src;
        smallImage.style.width = "30px";
        sharelink.prepend(smallImage);
    },
};


/***/ }),

/***/ 8181:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.compactSilver = void 0;
const settings_1 = __webpack_require__(126);
const SETTING_COMPACT_SILVER = {
    id: settings_1.SettingId.COMPACT_SILVER,
    title: "Wallet: Compact silver",
    description: "Display compact numbers for silver over 1M",
    type: "boolean",
    defaultValue: true,
};
exports.compactSilver = {
    settings: [SETTING_COMPACT_SILVER],
    onQuestLoad: () => {
        var _a, _b, _c;
        for (const silver of document.querySelectorAll("#statszone span:first-child")) {
            if (!silver || silver.dataset.compactSilver) {
                continue;
            }
            const icon = silver.querySelector("img");
            const amount = Number((_b = (_a = icon === null || icon === void 0 ? void 0 : icon.nextSibling) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().replaceAll(",", ""));
            if (Number.isNaN(amount)) {
                continue;
            }
            if (amount < 1000000) {
                continue;
            }
            (_c = icon === null || icon === void 0 ? void 0 : icon.nextSibling) === null || _c === void 0 ? void 0 : _c.replaceWith(amount > 1000000000
                ? // eslint-disable-next-line no-irregular-whitespace
                    ` ${(amount / 1000000000).toFixed(1)}B  `
                : // eslint-disable-next-line no-irregular-whitespace
                    ` ${(amount / 1000000).toFixed(1)}M  `);
            silver.dataset.compactSilver = "true";
        }
    },
};


/***/ }),

/***/ 223:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.compressChat = void 0;
const theme_1 = __webpack_require__(1178);
const settings_1 = __webpack_require__(126);
const SETTING_CHAT_COMPRESS = {
    id: settings_1.SettingId.CHAT_COMPRESS,
    title: "Chat: Compress messages",
    description: "Compress chat messages to make more visible at once",
    type: "boolean",
    defaultValue: true,
};
exports.compressChat = {
    settings: [SETTING_CHAT_COMPRESS],
    onInitialize: (settings) => {
        // move spacing from panel margin to message padding regardless of setting
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          .page-content {
            padding-right: 0 !important; 
            margin-right: -2px !important;
          }
          #desktopchatpanel {
            border-color: ${theme_1.BORDER_GRAY};
            border-top: 0 !important;
          }
          #mobilechatpanel .content-block,
          #desktopchatpanel .content-block {
            padding: 0 !important;
          }
          #mobilechatpanel .card,
          #desktopchatpanel .card {
            margin: 0 !important;
          }
          .chat-txt {
            margin: 0 !important;
            padding: 8px !important
          }
        <style>
      `);
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.CHAT_COMPRESS]) {
            return;
        }
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          /* Reduce chat spacing */
          .chat-txt {
            margin: 0 !important;
            padding: 4px !important
          }

          /* Hide timestamp */
          .chat-txt span:first-of-type,
          .chat-txt br:first-of-type {
            display: none !important;
          }
        <style>
      `);
    },
};


/***/ }),

/***/ 2827:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.navigationStyle = void 0;
const settings_1 = __webpack_require__(126);
const SETTING_NAVIGATION_COMPRESS = {
    id: settings_1.SettingId.NAV_COMPRESS,
    title: "Menu: Reduce Whitespace",
    description: `Reduces whitespace in navigation to make space for more items`,
    type: "boolean",
    defaultValue: false,
};
const SETTING_NAVIGATION_HIDE_LOGO = {
    id: settings_1.SettingId.NAV_HIDE_LOGO,
    title: "Menu: Hide Logo",
    description: `Hides Farm RPG logo in Navigation`,
    type: "boolean",
    defaultValue: true,
};
const SETTING_NAVIGATION_ALIGN_BOTTOM = {
    id: settings_1.SettingId.NAV_ALIGN_BOTTOM,
    title: "Menu: Align to Bottom",
    description: `Aligns Navigation menu to bottom of screen for easier reach on mobile`,
    type: "boolean",
    defaultValue: false,
};
const SETTINGS_NAVIGATION_ADD_MENU = {
    id: settings_1.SettingId.NAV_ADD_MENU,
    title: "Menu: Add Shortcut to Bottom",
    description: `Adds navigation menu shortcut to bottom bar for easier reach on mobile`,
    type: "boolean",
    defaultValue: true,
};
exports.navigationStyle = {
    settings: [
        SETTING_NAVIGATION_COMPRESS,
        SETTING_NAVIGATION_HIDE_LOGO,
        SETTINGS_NAVIGATION_ADD_MENU,
        SETTING_NAVIGATION_ALIGN_BOTTOM,
    ],
    onInitialize: (settings) => {
        var _a;
        // hide buttons until we can replace them
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          .icon.icon-bars,
          .refreshbtn .f7-icons {
            display: none !important;
          }
        <style>
      `);
        // align toolbar more consistently
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          .toolbar-inner {
            display: flex !important;
            justify-content: end !important;
            padding: 0 !important;
          }

          @media (min-width: 768px) {
            .fh-menu {
              display: none !important;
            }
          }

          .toolbar-inner > a {
            height: 100%;
            border: 0;
            background: transparent;
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 15px !important;
            border-radius: 0 !important;
          }
        <style>
      `);
        if (settings[settings_1.SettingId.NAV_COMPRESS]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            /* Reduce nav item spacing */
            .panel-left .item-inner {
              padding-top: 4px !important;
              padding-bottom: 4px !important;
            }
            .panel-left .item-content,
            .panel-left .item-inner {
              min-height: 0 !important;
            }
          <style>
        `);
        }
        if (settings[settings_1.SettingId.NAV_HIDE_LOGO]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            /* Hide nav logo */
            .panel-left .page-content div[align="center"] {
              display: none !important;
            }
            
            /* Hide extra padding */
            .panel-left .page,
            .panel-left .page-content {
              padding-bottom: 0 !important;
            }
          <style>
        `);
        }
        if (settings[settings_1.SettingId.NAV_ALIGN_BOTTOM]) {
            document.head.insertAdjacentHTML("beforeend", `
          <style>
            /* Align nav down */
            .panel-left .page-content .list-block {
              margin-top: 24px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: end !important;
              height: 100% !important;
            }
          <style>
        `);
        }
        // responsive bottom links
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          /* responsive bottom links */
          @media (max-width: 420px) {
          .toolbar-inner > .button i {
            margin-right: 50px !important;
          }
          .toolbar-inner > .button {
            display: block !important;
            width: 28px !important;
          }
        <style>
      `);
        if (settings[SETTINGS_NAVIGATION_ADD_MENU.id]) {
            const homeButton = document.querySelector("#homebtn");
            if (!homeButton) {
                console.error("Home button not found");
                return;
            }
            const menuButton = document.createElement("a");
            menuButton.dataset.panel = "left";
            menuButton.classList.add("fh-menu");
            menuButton.classList.add("button");
            menuButton.classList.add("open-panel");
            menuButton.style.fontSize = "12px";
            menuButton.style.paddingLeft = "5px";
            menuButton.style.paddingRight = "8px";
            menuButton.style.display = "flex";
            menuButton.style.alignItems = "center";
            menuButton.style.gap = "2px";
            menuButton.innerHTML = `
        <i class="fa fa-fw fa-bars"></i>
        Menu
      `;
            (_a = homeButton.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(menuButton, homeButton);
        }
    },
    onPageLoad: () => {
        for (const icon of document.querySelectorAll(".icon.icon-bars")) {
            icon.style.color = "white";
            icon.classList.remove("icon");
            icon.classList.remove("icon-bars");
            icon.classList.add("fa");
            icon.classList.add("fw");
            icon.classList.add("fa-bars");
        }
        for (const refresh of document.querySelectorAll(".refreshbtn")) {
            refresh.style.color = "white";
            refresh.classList.remove("fv-icons");
            refresh.textContent = "";
            refresh.classList.add("fa");
            refresh.classList.add("fw");
            refresh.classList.add("fa-refresh");
        }
    },
};


/***/ }),

/***/ 3995:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.craftPlanner = void 0;
const goals_1 = __webpack_require__(1267);
const theme_1 = __webpack_require__(1178);
const craftPlanner_1 = __webpack_require__(5825);
const recipes_1 = __webpack_require__(498);
const page_1 = __webpack_require__(7952);
const inventory_1 = __webpack_require__(4514);
const api_1 = __webpack_require__(3413);
const gameLinks_1 = __webpack_require__(1616);
const promise_1 = __webpack_require__(6762);
const unlimited_1 = __webpack_require__(4808);
const craftworks_1 = __webpack_require__(7831);
const settings_1 = __webpack_require__(126);
const SETTING_CRAFT_PLANNER = {
    id: settings_1.SettingId.CRAFT_PLANNER,
    title: "Item: Craft planner",
    description: `
    On craftable items, work the whole recipe tree out against your inventory:
    how many you can make now, the sub-crafts, what you're short of, and where
    to go get it
  `,
    type: "boolean",
    defaultValue: true,
};
const SETTING_UNLIMITED_ITEMS = {
    id: settings_1.SettingId.UNLIMITED_ITEMS,
    title: "Planning: Always-available items",
    description: `
    Comma-separated items a perk buys for you automatically. They are never
    counted as missing and never generate an explore trip
  `,
    type: "string",
    defaultValue: "Iron, Nails",
    placeholder: "Iron, Nails",
};
const CONTAINER_ID = "fh-craft-planner";
const makeLine = (color, text) => {
    const line = document.createElement("div");
    line.style.color = color;
    line.style.fontSize = "12px";
    line.style.lineHeight = "1.5";
    line.textContent = text;
    return line;
};
const makeHeading = (text) => {
    const heading = document.createElement("div");
    heading.textContent = text;
    heading.style.color = theme_1.TEXT_WHITE;
    heading.style.fontSize = "12px";
    heading.style.fontWeight = "bold";
    heading.style.margin = "10px 0 4px";
    return heading;
};
const formatHits = (hits) => hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);
const renderPlan = (output, graph, plan, maxCraftable, inventory, cap, locations, unlimited) => {
    var _a, _b, _c, _d;
    output.textContent = "";
    output.append(makeLine(maxCraftable > 0 ? theme_1.TEXT_SUCCESS : theme_1.TEXT_GRAY, maxCraftable > 0
        ? `You can make ${maxCraftable.toLocaleString()} right now.`
        : "You can't make any right now."));
    // sub-crafts, deepest first — that order never needs a later step's output
    const subSteps = plan.steps.filter((step) => step.name !== plan.target);
    if (subSteps.length > 0) {
        output.append(makeHeading("Craft in this order"));
        for (const step of subSteps) {
            output.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
                `${step.quantity.toLocaleString()} × `,
                (0, gameLinks_1.makeItemLink)(step.name, (_a = graph.nodes.get(step.name)) === null || _a === void 0 ? void 0 : _a.id, theme_1.TEXT_GRAY),
            ]));
        }
        output.append(makeLine(theme_1.TEXT_GRAY, `${plan.quantity.toLocaleString()} × ${plan.target}`));
    }
    if (plan.missing.length === 0) {
        output.append(makeLine(theme_1.TEXT_SUCCESS, `You have everything for ${plan.quantity}.`));
    }
    else {
        output.append(makeHeading("Short of"));
        for (const entry of plan.missing) {
            output.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
                `${entry.quantity.toLocaleString()} × `,
                (0, gameLinks_1.makeItemLink)(entry.name, (_b = graph.nodes.get(entry.name)) === null || _b === void 0 ? void 0 : _b.id, theme_1.TEXT_WARNING),
            ]));
        }
        const sourcing = (0, craftPlanner_1.planSourcing)(graph, plan.missing);
        if (sourcing.locations.length > 0) {
            output.append(makeHeading("Where to go"));
            for (const location of sourcing.locations) {
                const parts = [
                    (0, gameLinks_1.makeLocationLink)(location.location, locations.get(location.location), theme_1.TEXT_SUCCESS),
                    ` — ~${formatHits(location.hits)} ${location.type === "fishing" ? "casts" : "explores"} (`,
                ];
                for (const [index, item] of location.items.entries()) {
                    if (index > 0) {
                        parts.push(", ");
                    }
                    parts.push(`${item.quantity.toLocaleString()} `, (0, gameLinks_1.makeItemLink)(item.name, (_c = graph.nodes.get(item.name)) === null || _c === void 0 ? void 0 : _c.id, theme_1.TEXT_SUCCESS));
                }
                parts.push(")");
                output.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, parts));
            }
        }
        if (sourcing.unsourced.length > 0) {
            output.append(makeLine(theme_1.TEXT_GRAY, `No drop location on buddy.farm for: ${sourcing.unsourced.join(", ")}`));
        }
    }
    // Craftworks holds 8 for Reed (6 base + 2 Patreon); assume the common case
    // rather than fetching the page just to read the number back
    const queue = (0, craftworks_1.planCraftworksQueue)(plan, inventory, cap, 8, unlimited);
    if (queue.entries.length > 1) {
        output.append(makeHeading("Craftworks queue for this"));
        for (const entry of queue.entries) {
            output.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
                `${entry.position}. `,
                (0, gameLinks_1.makeItemLink)(entry.name, (_d = graph.nodes.get(entry.name)) === null || _d === void 0 ? void 0 : _d.id, theme_1.TEXT_GRAY),
                ` (${entry.quantity.toLocaleString()} needed)`,
            ]));
        }
        for (const entry of queue.dropped) {
            output.append(makeLine(theme_1.TEXT_GRAY, `skip ${entry.name} — ${entry.reason}`));
        }
        if (queue.targetOmitted) {
            output.append(makeLine(theme_1.TEXT_GRAY, `${plan.target} itself doesn't fit — craft it by hand once the chain fills.`));
        }
    }
    if (plan.truncated) {
        output.append(makeLine(theme_1.TEXT_GRAY, "Recipe tree was cut short; treat this as a floor."));
    }
    if (plan.unknown.length > 0) {
        output.append(makeLine(theme_1.TEXT_GRAY, `No buddy.farm data for: ${plan.unknown.join(", ")}`));
    }
};
exports.craftPlanner = {
    settings: [SETTING_CRAFT_PLANNER, SETTING_UNLIMITED_ITEMS],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (page !== page_1.Page.ITEM) {
            return;
        }
        if (!settings[settings_1.SettingId.CRAFT_PLANNER]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        const itemName = (_b = (_a = currentPage
            .querySelector(".sharelink")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
        if (!itemName) {
            return;
        }
        // the item page is re-rendered on navigation; never stack two cards
        (_c = currentPage.querySelector(`#${CONTAINER_ID}`)) === null || _c === void 0 ? void 0 : _c.remove();
        const graph = yield (0, recipes_1.gatherRecipeGraph)([itemName]);
        const root = graph.nodes.get(itemName);
        // nothing to plan for something that isn't crafted
        if (!(root === null || root === void 0 ? void 0 : root.canCraft) || root.ingredients.length === 0) {
            return;
        }
        const snapshot = yield inventory_1.inventoryState.get();
        const inventory = (_d = snapshot === null || snapshot === void 0 ? void 0 : snapshot.quantities) !== null && _d !== void 0 ? _d : {};
        const unlimited = (0, unlimited_1.parseUnlimitedItems)(String((_e = settings[settings_1.SettingId.UNLIMITED_ITEMS]) !== null && _e !== void 0 ? _e : ""));
        const card = document.createElement("div");
        card.id = CONTAINER_ID;
        card.className = "card";
        const content = document.createElement("div");
        content.className = "card-content";
        const inner = document.createElement("div");
        inner.className = "card-content-inner";
        inner.style.borderLeft = `3px solid ${theme_1.BORDER_GRAY}`;
        inner.style.paddingLeft = "10px";
        const title = document.createElement("div");
        title.textContent = "Craft plan";
        title.style.color = theme_1.TEXT_WHITE;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "6px";
        inner.append(title);
        const controls = document.createElement("div");
        controls.style.alignItems = "center";
        controls.style.display = "flex";
        controls.style.gap = "8px";
        controls.style.marginBottom = "6px";
        const label = document.createElement("span");
        label.textContent = "Quantity";
        label.style.color = theme_1.TEXT_GRAY;
        label.style.fontSize = "12px";
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.value = "1";
        (0, theme_1.applyStyles)(input, Object.assign(Object.assign({}, theme_1.INPUT_STYLES), { minWidth: "90px" }));
        const track = document.createElement("a");
        track.className = "button";
        track.href = "#";
        track.style.marginLeft = "auto";
        track.style.maxWidth = "130px";
        const tracked = yield (0, goals_1.getGoals)();
        const setTrackLabel = (isTracked) => {
            track.textContent = isTracked ? "Tracking ✓" : "Track as goal";
        };
        setTrackLabel(tracked.some((goal) => goal.name === itemName));
        track.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            const goals = yield (0, goals_1.getGoals)();
            const isTracked = goals.some((goal) => goal.name === itemName);
            yield (isTracked
                ? (0, goals_1.removeGoal)(itemName)
                : (0, goals_1.addGoal)(itemName, Math.max(1, Math.floor(Number(input.value) || 1))));
            setTrackLabel(!isTracked);
        }));
        controls.append(label, input, track);
        inner.append(controls);
        const output = document.createElement("div");
        inner.append(output);
        content.append(inner);
        card.append(content);
        const details = (0, page_1.getCardByTitle)("Item Details");
        if (details) {
            details.after(card);
        }
        else {
            (_f = currentPage.querySelector(".content-block")) === null || _f === void 0 ? void 0 : _f.append(card);
        }
        // the graph and the inventory are already in hand, so re-planning on every
        // keystroke is pure arithmetic — no requests, no debounce needed
        const maxCraftable = (0, craftPlanner_1.getMaxCraftable)(graph, itemName, inventory, unlimited);
        // resolve every location the plan could name, once, so re-planning on each
        // keystroke stays synchronous
        const locations = new Map();
        const names = new Set((0, craftPlanner_1.planSourcing)(graph, (0, craftPlanner_1.planCraft)(graph, itemName, 1, inventory).missing).locations.map((entry) => entry.location));
        yield Promise.all([...names].map((name) => __awaiter(void 0, void 0, void 0, function* () {
            const ref = yield (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: name }));
            if (ref) {
                locations.set(name, ref);
            }
        })));
        const update = () => {
            const quantity = Math.max(1, Math.floor(Number(input.value) || 1));
            renderPlan(output, graph, (0, craftPlanner_1.planCraft)(graph, itemName, quantity, inventory, unlimited), maxCraftable, inventory, snapshot === null || snapshot === void 0 ? void 0 : snapshot.cap, locations, unlimited);
        };
        input.addEventListener("input", update);
        if (maxCraftable > 1) {
            input.value = String(maxCraftable);
        }
        update();
    }),
};


/***/ }),

/***/ 6969:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.craftworksAdvisor = void 0;
const craftworks_1 = __webpack_require__(7831);
const theme_1 = __webpack_require__(1178);
const recipes_1 = __webpack_require__(498);
const craftPlanner_1 = __webpack_require__(5825);
const api_1 = __webpack_require__(3413);
const page_1 = __webpack_require__(7952);
const goals_1 = __webpack_require__(1267);
const suggestions_1 = __webpack_require__(9262);
const inventory_1 = __webpack_require__(4514);
const gameLinks_1 = __webpack_require__(1616);
const promise_1 = __webpack_require__(6762);
const unlimited_1 = __webpack_require__(4808);
const settings_1 = __webpack_require__(126);
const SETTING_CRAFTWORKS_ADVISOR = {
    id: settings_1.SettingId.CRAFTWORKS_ADVISOR,
    title: "Craftworks: Queue advisor",
    description: `
    Summarize the Craftworks queue: slots that can't craft, what each stalled
    slot is waiting on, ordering mistakes, and where to go get the blockers
  `,
    type: "boolean",
    defaultValue: true,
};
const CONTAINER_ID = "fh-craftworks-advisor";
const makeLine = (color, text) => {
    const line = document.createElement("div");
    line.style.color = color;
    line.style.fontSize = "12px";
    line.style.lineHeight = "1.5";
    line.style.marginBottom = "3px";
    line.textContent = text;
    return line;
};
const makeHeading = (text) => {
    const heading = document.createElement("div");
    heading.textContent = text;
    heading.style.color = theme_1.TEXT_WHITE;
    heading.style.fontSize = "12px";
    heading.style.fontWeight = "bold";
    heading.style.margin = "10px 0 4px";
    return heading;
};
const formatHits = (hits) => hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);
// Recommend the saved set that matches a tracked goal, and offer to load it by
// clicking the game's own button.
//
// The activation is deliberately NOT reimplemented. The game fires
// `worker.php?go=removeallcw` -- which wipes the whole queue -- then activates
// the set 500ms later, and the wipe has no failure handler: if the second call
// never lands, the queue is simply gone. Driving the real button runs the
// game's own sequence, timing and refresh instead of a copy that could drift.
const renderSetRecommendation = (container) => __awaiter(void 0, void 0, void 0, function* () {
    const currentPage = (0, page_1.getCurrentPage)();
    if (!currentPage) {
        return;
    }
    const sets = (0, craftworks_1.parseSavedSets)(currentPage);
    if (sets.length === 0) {
        return;
    }
    const [goals, items] = yield Promise.all([(0, goals_1.getGoals)(), (0, api_1.getBasicItems)()]);
    const recommended = (0, suggestions_1.getRecommendedSet)(goals, sets, items.map((item) => item.name));
    if (!recommended) {
        return;
    }
    const button = currentPage.querySelector(`.activatecwsetbtn[data-id="${recommended.id}"]`);
    const line = (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, [
        `Your “${recommended.name}” set matches your ${recommended.goalName} goal.`,
    ]);
    container.append(line);
    if (!button) {
        return;
    }
    const load = document.createElement("a");
    load.href = "#";
    load.textContent = "Load that set";
    load.style.color = theme_1.TEXT_SUCCESS;
    load.style.fontSize = "12px";
    load.style.textDecoration = "underline";
    load.addEventListener("click", (event) => {
        event.preventDefault();
        // one deliberate press, forwarded to the game's own control
        button.click();
    });
    const warning = (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
        "— loading a set clears the current queue first ",
    ]);
    warning.append(load);
    container.append(warning);
});
const renderAdvice = (container, slots, maxSlots, unlimited) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const snapshot = yield inventory_1.inventoryState.get();
    const cap = snapshot === null || snapshot === void 0 ? void 0 : snapshot.cap;
    const advice = (0, craftworks_1.adviseOnSlots)(slots, cap, unlimited);
    yield renderSetRecommendation(container);
    const summary = document.createElement("div");
    summary.style.color = theme_1.TEXT_GRAY;
    summary.style.fontSize = "12px";
    summary.style.marginBottom = "6px";
    const freeSlots = maxSlots ? maxSlots - slots.length : 0;
    summary.textContent = `${advice.working.length} of ${slots.length} slots are crafting${freeSlots > 0 ? `, ${freeSlots} slot${freeSlots === 1 ? "" : "s"} free` : ""}.`;
    container.append(summary);
    if (advice.dead.length > 0) {
        container.append(makeHeading("At cap — these slots can't craft"));
        for (const slot of advice.dead) {
            container.append(makeLine(theme_1.TEXT_ERROR, `#${slot.position} ${slot.name} — ${slot.inventory.toLocaleString()}${cap ? ` / ${cap.toLocaleString()}` : ""}. Free the slot or spend some down.`));
        }
    }
    if (advice.ordering.length > 0) {
        container.append(makeHeading("Wrong order"));
        for (const { blocker, producer, slot } of advice.ordering) {
            container.append(makeLine(theme_1.TEXT_WARNING, `#${slot.position} ${slot.name} waits on ${blocker}, but #${producer.position} ${producer.name} makes it — the queue runs top-down, so move #${producer.position} above #${slot.position}.`));
        }
    }
    if (advice.paused.length > 0) {
        container.append(makeLine(theme_1.TEXT_GRAY, `Paused: ${advice.paused
            .map((slot) => `#${slot.position} ${slot.name}`)
            .join(", ")}`));
    }
    if (advice.blockers.size === 0) {
        if (advice.dead.length === 0) {
            container.append(makeLine(theme_1.TEXT_SUCCESS, "Nothing is stalled."));
        }
        return;
    }
    if (advice.upstream.length > 0) {
        container.append(makeLine(theme_1.TEXT_GRAY, `Clears on its own: ${advice.upstream
            .map((blocker) => { var _a; return `${blocker.name} (#${(_a = blocker.producer) === null || _a === void 0 ? void 0 : _a.position} makes it)`; })
            .join(", ")}`));
    }
    if (advice.roots.length === 0) {
        return;
    }
    // only the root blockers are worth looking up: the rest are already being
    // made by a slot above the one waiting on them
    const names = advice.roots.map((blocker) => blocker.name);
    let graph;
    try {
        graph = yield (0, recipes_1.gatherRecipeGraph)(names);
    }
    catch (_c) {
        container.append(makeLine(theme_1.TEXT_GRAY, "Could not reach buddy.farm for drop locations."));
        return;
    }
    container.append(makeHeading("Stalled on"));
    const byLocation = new Map();
    const craftable = [];
    const queued = new Set(slots.map((slot) => slot.name));
    for (const blocker of advice.roots) {
        const { name } = blocker;
        const node = graph.nodes.get(name);
        const consumers = blocker.slots
            .map((slot) => `#${slot.position} ${slot.name}`)
            .join(", ");
        const source = (0, craftPlanner_1.getBaselineSource)((0, craftPlanner_1.getDropSources)(node === null || node === void 0 ? void 0 : node.item));
        const details = [];
        if (source) {
            details.push(`${source.location} — 1 per ${formatHits(source.rate)} ${source.type === "fishing" ? "casts" : "explores"}`);
            const existing = (_a = byLocation.get(source.location)) !== null && _a !== void 0 ? _a : {
                blockers: [],
                hits: 0,
                type: source.type,
            };
            existing.blockers.push(name);
            // one unit's worth, since the game never says how many it is short by
            existing.hits += source.rate;
            byLocation.set(source.location, existing);
        }
        if ((node === null || node === void 0 ? void 0 : node.canCraft) && !queued.has(name)) {
            craftable.push(name);
            details.push("craftable — could take the free slot");
        }
        container.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
            (0, gameLinks_1.makeItemLink)(name, node === null || node === void 0 ? void 0 : node.id, theme_1.TEXT_WARNING),
            ` → blocks ${consumers}`,
            details.length > 0 ? ` · ${details.join(" · ")}` : " · no known source",
        ]));
    }
    // same ordering as the planner: most blockers cleared first, cheapest trip
    // breaking ties
    const locations = [...byLocation.entries()].sort((a, b) => b[1].blockers.length - a[1].blockers.length || a[1].hits - b[1].hits);
    if (locations.length > 0) {
        container.append(makeHeading("Where to go"));
        const references = yield Promise.all(locations.map(([location]) => (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: location }))));
        for (const [index, [location, entry]] of locations.entries()) {
            const color = entry.blockers.length > 1 ? theme_1.TEXT_SUCCESS : theme_1.TEXT_GRAY;
            const parts = [
                (0, gameLinks_1.makeLocationLink)(location, references[index], color),
                " — ",
            ];
            for (const [blockerIndex, blocker] of entry.blockers.entries()) {
                if (blockerIndex > 0) {
                    parts.push(", ");
                }
                parts.push((0, gameLinks_1.makeItemLink)(blocker, (_b = graph.nodes.get(blocker)) === null || _b === void 0 ? void 0 : _b.id, color));
            }
            parts.push(` (${formatHits(entry.hits)} ${entry.type === "fishing" ? "casts" : "explores"} for one of each)`);
            container.append((0, gameLinks_1.makeLinkedLine)(color, parts));
        }
    }
    if (craftable.length > 0 && (maxSlots !== null && maxSlots !== void 0 ? maxSlots : 0) > slots.length) {
        container.append(makeLine(theme_1.TEXT_SUCCESS, `Free slot: adding ${craftable[0]} above the slot that needs it would unstall it without exploring.`));
    }
});
exports.craftworksAdvisor = {
    settings: [SETTING_CRAFTWORKS_ADVISOR],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (page !== page_1.Page.CRAFTWORKS) {
            return;
        }
        if (!settings[settings_1.SettingId.CRAFTWORKS_ADVISOR]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        // the page re-renders on every add/remove/pause, so drop a stale card
        // rather than stack a second one on top of it
        (_a = currentPage.querySelector(`#${CONTAINER_ID}`)) === null || _a === void 0 ? void 0 : _a.remove();
        const slots = (0, craftworks_1.parseSlots)(currentPage);
        if (slots.length === 0) {
            return;
        }
        const card = document.createElement("div");
        card.id = CONTAINER_ID;
        card.className = "card fh-craftworks-advisor";
        const content = document.createElement("div");
        content.className = "card-content";
        const inner = document.createElement("div");
        inner.className = "card-content-inner";
        inner.style.borderLeft = `3px solid ${theme_1.BORDER_GRAY}`;
        inner.style.paddingLeft = "10px";
        const title = document.createElement("div");
        title.textContent = "Queue advisor";
        title.style.color = theme_1.TEXT_WHITE;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "6px";
        inner.append(title);
        content.append(inner);
        card.append(content);
        // sit directly above the queue it is describing
        const list = (_b = currentPage.querySelector(".cwitems")) === null || _b === void 0 ? void 0 : _b.closest(".card");
        if (list === null || list === void 0 ? void 0 : list.parentElement) {
            list.parentElement.insertBefore(card, list);
        }
        else {
            (_c = currentPage.querySelector(".content-block")) === null || _c === void 0 ? void 0 : _c.append(card);
        }
        yield renderAdvice(inner, slots, (0, craftworks_1.getMaxSlots)(currentPage), (0, unlimited_1.parseUnlimitedItems)(String((_d = settings[settings_1.SettingId.UNLIMITED_ITEMS]) !== null && _d !== void 0 ? _d : "")));
    }),
};


/***/ }),

/***/ 2224:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.customNavigation = void 0;
const theme_1 = __webpack_require__(1178);
const settings_1 = __webpack_require__(126);
const confirmation_1 = __webpack_require__(3906);
const SETTING_CUSTOM_NAVIGATION = {
    id: settings_1.SettingId.NAV_CUSTOM,
    title: "Customize Navigation",
    description: `
    Enables customization of the Navigation menu<br>
    (click the gear in the navigation menu to configure)
  `,
    type: "boolean",
    defaultValue: true,
};
const state = {
    isEditing: false,
};
const DEFAULT_NAVIGATION = [
    { icon: "home", text: "Home", path: "index.php" },
    { icon: "user", text: "My Profile", path: "profile.php" },
    { icon: "list", text: "My Inventory", path: "inventory.php" },
    { icon: "wrench", text: "My Workshop", path: "workshop.php" },
    { icon: "spoon", text: "My Kitchen", path: "kitchen.php" },
    { icon: "inbox", text: "My Mailbox", path: "postoffice.php" },
    { icon: "envelope", text: "My Messages", path: "messages.php" },
    { icon: "users", text: "My Friends", path: "friends.php" },
    { icon: "gear", text: "My Settings", path: "settings.php" },
    { icon: "building", text: "Town", path: "town.php" },
    { icon: "book", text: "Library", path: "wiki.php" },
    { icon: "info-circle", text: "About / Updates", path: "about.php" },
    { icon: "close", text: "Logout", path: "logout.php" },
];
const icons = (() => {
    const stylesheet = [...document.styleSheets].find(({ href }) => href === null || href === void 0 ? void 0 : href.includes("fontawesome"));
    const icons = [];
    if (!stylesheet) {
        console.error("Could not find fontawesome stylesheet");
        return icons;
    }
    for (const rule of stylesheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) {
            continue;
        }
        if (rule.style.length !== 1) {
            continue;
        }
        if (!rule.style.content) {
            continue;
        }
        const selector = rule.selectorText;
        const aliases = selector.split(", ");
        icons.push(aliases[0].slice(4, -8));
    }
    return icons.sort();
})();
const renderNavigation = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (force = false) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { items } = yield (0, settings_1.getData)(SETTING_CUSTOM_NAVIGATION, { items: DEFAULT_NAVIGATION });
    const navigationList = document.querySelector(".panel-left ul");
    if (!navigationList) {
        console.error("Could not find navigation list");
        return;
    }
    if (!force && navigationList.dataset.isCustomized) {
        // already rendered
        return;
    }
    const navigationTitleLeft = document.querySelector(".panel-left .navbar .left");
    if (!navigationTitleLeft) {
        console.error("Could not find navigation title");
        return;
    }
    navigationTitleLeft.innerHTML = "";
    if (state.isEditing) {
        const resetButton = document.createElement("i");
        resetButton.style.cursor = "pointer";
        resetButton.classList.add("fa");
        resetButton.classList.add("fa-fw");
        resetButton.classList.add("fa-arrow-left-rotate");
        resetButton.addEventListener("click", () => {
            (0, confirmation_1.showConfirmation)("Reset Navigation?", () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items: DEFAULT_NAVIGATION });
                state.isEditing = false;
                renderNavigation(true);
            }));
        });
        navigationTitleLeft.append(resetButton);
    }
    navigationList.innerHTML = "";
    navigationList.dataset.isCustomized = "true";
    navigationList.dataset.isEditing = String(state.isEditing);
    for (const item of items) {
        const currentIndex = items.indexOf(item);
        const navigationItem = document.createElement("li");
        navigationItem.innerHTML = `
      <a
        href="${item.path}"
        data-view=".view-main"
        class="item-link close-panel"
      >
        <div
          class="item-content"
          style="
            display: flex;
            flex-direction: column;
            gap: 4px;
          "
        >
          <div
            class="item-inner"
            style="
              background-image: none;
              display: flex;
              justify-content: space-between;
              padding-right: 15px;
              width: 100%;
            "
          >
            <div class="item-title">
              <i class="fa fa-fw fa-${item.icon}"></i>
              <span class="fh-item">${item.text}</span>
            </div>
            ${state.isEditing
            ? `
                  <div>
                    <i class="fa fa-fw ${state.editingIndex === currentIndex
                ? "fa-check"
                : "fa-pencil"} fh-edit"></i>
                    <i class="fa fa-fw fa-trash fh-delete"></i>
                  </div>
                `
            : '<i class="fa fa-fw fa-chevron-right"></i>'}
          </div>
          ${state.isEditing && state.editingIndex === currentIndex
            ? `
                <div
                  style="
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding-right: 15px;
                  "
                >
                  <input
                    type="text"
                    class="fh-text"
                    value="${item.text}"
                    style="
                      flex: 1;
                      border: 1px solid ${theme_1.BORDER_GRAY};
                      margin-left: 20px;
                      margin-right: 10px;
                      height: 30px;
                      padding: 10px;
                    "
                  >
                  <i class="fa fa-fw fa-arrow-down fh-down"></i>
                  <i class="fa fa-fw fa-arrow-up fh-up"></i>
                </div>
                <div
                  style="
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding-right: 15px;
                  "
                >
                  <input
                    type="text"
                    class="fh-path"
                    value="${item.path}"
                    style="
                      flex: 1;
                      border: 1px solid ${theme_1.BORDER_GRAY};
                      margin-left: 20px;
                      height: 30px;
                      padding: 10px;
                      font-family: monospace;
                    "
                  >
                </div>
                <div
                  style="
                    display: flex;
                    gap: 4px;
                    margin-top: 10px;
                    height: 200px;
                    width: 100%;
                    overflow-y: scroll;
                    flex-wrap: wrap;
                  "
                  class="fh-icons"
                >
                  ${icons
                .map((icon) => `
                        <i
                          class="fa fa-fw fa-${icon}"
                          data-icon="${icon}"
                        ></i>
                      `)
                .join("")}
                </div>
              `
            : ""}
        </div>
      </a>
    `;
        (_a = navigationItem
            .querySelector(".fh-icons")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            event.preventDefault();
            event.stopPropagation();
            if (!event.target) {
                return;
            }
            item.icon = (_a = event.target.dataset.icon) !== null && _a !== void 0 ? _a : "";
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            renderNavigation(true);
        }));
        (_b = navigationItem
            .querySelector(".fh-text")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        (_c = navigationItem
            .querySelector(".fh-text")) === null || _c === void 0 ? void 0 : _c.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            item.text = event.target.value;
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            renderNavigation(true);
        }));
        (_d = navigationItem
            .querySelector(".fh-text")) === null || _d === void 0 ? void 0 : _d.addEventListener("keyup", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const itemText = navigationItem.querySelector(".fh-item");
            if (!itemText) {
                return;
            }
            itemText.textContent = event.target.value;
        });
        (_e = navigationItem
            .querySelector(".fh-path")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        (_f = navigationItem
            .querySelector(".fh-path")) === null || _f === void 0 ? void 0 : _f.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            item.path = event.target.value;
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            renderNavigation(true);
        }));
        (_g = navigationItem
            .querySelector(".fh-up")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            if (currentIndex === 0) {
                return;
            }
            items.splice(currentIndex, 1);
            items.splice(currentIndex - 1, 0, item);
            state.editingIndex = currentIndex - 1;
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            renderNavigation(true);
        }));
        (_h = navigationItem
            .querySelector(".fh-down")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            if (currentIndex === items.length - 1) {
                return;
            }
            items.splice(currentIndex, 1);
            items.splice(currentIndex + 1, 0, item);
            state.editingIndex = currentIndex + 1;
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            renderNavigation(true);
        }));
        (_j = navigationItem
            .querySelector(".fh-edit")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (state.editingIndex === currentIndex) {
                delete state.editingIndex;
            }
            else {
                state.editingIndex = currentIndex;
            }
            renderNavigation(true);
        });
        (_k = navigationItem
            .querySelector(".fh-delete")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            items.splice(currentIndex, 1);
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            renderNavigation(true);
        }));
        navigationList.append(navigationItem);
    }
    if (state.isEditing) {
        const addNavigationItem = document.createElement("li");
        addNavigationItem.innerHTML = `
      <a
        href="#"
        class="item-link close-panel"
      >
        <div
          class="item-content"
          style="
            display: flex;
            flex-direction: column;
            gap: 4px;
          "
        >
          <div
            class="item-inner"
            style="
              background-image: none;
              display: flex;
              justify-content: space-between;
              padding-right: 15px;
              width: 100%;
            "
          >
            <div class="item-title">
              <i class="fa fa-fw fa-plus"></i>
              <span class="fh-item">Add Navigation Item</span>
            </div>
          </div>
        </div>
      </a>
    `;
        addNavigationItem.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            items.push({
                icon: "sack-dollar",
                text: "Tip anstosa",
                path: "profile.php?user_name=anstosa",
            });
            yield (0, settings_1.setData)(SETTING_CUSTOM_NAVIGATION, { items });
            state.editingIndex = items.length - 1;
            renderNavigation(true);
        }));
        navigationList.append(addNavigationItem);
    }
});
exports.customNavigation = {
    settings: [SETTING_CUSTOM_NAVIGATION],
    onMenuLoad: (settings) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.NAV_CUSTOM]) {
            return;
        }
        // add configuration icon
        const navigationTitleRight = document.querySelector(".panel-left .navbar .right");
        if (!navigationTitleRight) {
            console.error("Could not find navigation title");
            return;
        }
        if (navigationTitleRight.children.length === 0) {
            const configurationButton = document.createElement("i");
            configurationButton.style.cursor = "pointer";
            configurationButton.classList.add("fa");
            configurationButton.classList.add("fa-fw");
            configurationButton.classList.add("fa-cog");
            configurationButton.addEventListener("click", () => {
                state.isEditing = !state.isEditing;
                if (state.isEditing) {
                    configurationButton.classList.remove("fa-cog");
                    configurationButton.classList.add("fa-check");
                }
                else {
                    configurationButton.classList.remove("fa-check");
                    configurationButton.classList.add("fa-cog");
                }
                renderNavigation(true);
            });
            navigationTitleRight.append(configurationButton);
        }
        renderNavigation();
    },
};


/***/ }),

/***/ 5164:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dismissableChatBanners = void 0;
const settings_1 = __webpack_require__(126);
const popup_1 = __webpack_require__(469);
const state_1 = __webpack_require__(4782);
const SETTING_CHAT_DISMISSABLE_BANNERS = {
    id: settings_1.SettingId.CHAT_DISMISSABLE_BANNERS,
    title: "Chat: Dismissable Banners",
    description: `
    Adds × in chat banners to dismiss them<br>
    Disable this to show dismissed banners again
  `,
    buttonText: "Reset",
    buttonAction: () => __awaiter(void 0, void 0, void 0, function* () {
        const keys = yield GM.listValues();
        for (const key of keys) {
            if (key.startsWith(state_1.StorageKey.CHAT_BANNERS)) {
                yield GM.deleteValue(key);
            }
        }
        yield (0, popup_1.showPopup)({
            title: "Chat banners reset",
            contentHTML: "Previously dismissed chat banners will be shown again",
        });
    }),
    type: "boolean",
    defaultValue: true,
};
// https://stackoverflow.com/a/7616484/714282
const hashBanner = (banner) => {
    var _a, _b;
    const string = (_a = banner.textContent) !== null && _a !== void 0 ? _a : "";
    let hash = 0;
    if (string.length === 0) {
        return hash;
    }
    for (let index = 0; index < string.length; index++) {
        const code = (_b = string.codePointAt(index)) !== null && _b !== void 0 ? _b : 0;
        hash = (hash << 5) - hash + code;
        hash = Math.trunc(hash);
    }
    return hash;
};
exports.dismissableChatBanners = {
    settings: [SETTING_CHAT_DISMISSABLE_BANNERS],
    onChatLoad: (settings) => __awaiter(void 0, void 0, void 0, function* () {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.CHAT_DISMISSABLE_BANNERS]) {
            return;
        }
        const bannerElements = document.querySelectorAll("#desktopchatpanel .card, #mobilechatpanel .card");
        const { hiddenBanners } = yield (0, settings_1.getData)(settings_1.SettingId.CHAT_DISMISSABLE_BANNERS, {
            hiddenBanners: [],
        });
        for (const banner of bannerElements) {
            const bannerKey = hashBanner(banner).toString();
            // hide banner if dismissed
            const isDismissed = (hiddenBanners === null || hiddenBanners === void 0 ? void 0 : hiddenBanners.includes(bannerKey)) || false;
            if (isDismissed) {
                banner.remove();
                continue;
            }
            // skip adding close button if it already exists
            if (banner.querySelector(".fh-close")) {
                continue;
            }
            // add close button
            const closeButton = document.createElement("div");
            closeButton.classList.add("fh-close");
            closeButton.textContent = "×";
            closeButton.style.position = "absolute";
            closeButton.style.top = "2px";
            closeButton.style.right = "2px";
            closeButton.style.cursor = "pointer";
            closeButton.addEventListener("click", () => {
                banner.remove();
                (0, settings_1.setData)(settings_1.SettingId.CHAT_DISMISSABLE_BANNERS, {
                    hiddenBanners: [...hiddenBanners, bannerKey],
                });
            });
            banner.append(closeButton);
        }
    }),
};


/***/ }),

/***/ 6030:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.exploreFirst = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_EXPLORE_FIRST = {
    id: settings_1.SettingId.EXPLORE_FIRST,
    title: "Item: Prioritize Explore",
    description: "Move Exploring, Fishing, and Mining above Crafting and Cooking",
    type: "boolean",
    defaultValue: true,
};
const moveSectionUp = (title) => {
    const itemDetailsCard = (0, page_1.getCardByTitle)("Item Details");
    if (!itemDetailsCard) {
        return;
    }
    const titleElement = (0, page_1.getTitle)(title);
    const cardElement = titleElement === null || titleElement === void 0 ? void 0 : titleElement.nextElementSibling;
    const listElement = cardElement === null || cardElement === void 0 ? void 0 : cardElement.nextElementSibling;
    if (listElement) {
        itemDetailsCard.after(listElement);
    }
    if (cardElement) {
        itemDetailsCard.after(cardElement);
    }
    if (titleElement) {
        itemDetailsCard.after(titleElement);
    }
};
exports.exploreFirst = {
    settings: [SETTING_EXPLORE_FIRST],
    onPageLoad: (settings, page) => {
        // make sure we're on the item page
        if (page !== page_1.Page.ITEM) {
            return;
        }
        // make sure we're enabled
        if (!settings[settings_1.SettingId.EXPLORE_FIRST]) {
            return;
        }
        moveSectionUp("Exploring");
        moveSectionUp("Fishing");
        moveSectionUp("Mining");
    },
};


/***/ }),

/***/ 8973:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.farmhandSettings = void 0;
const notes_1 = __webpack_require__(4735);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const popup_1 = __webpack_require__(469);
const getWrapper = ({ id, type, value }, children) => {
    switch (type) {
        case "boolean": {
            return `
        <div
          class="item-inner"
          role="checkbox"
          id="${id}-aria"
          aria-labelledby="${id}"
          aria-checked="${value ? "true" : "false"}"
        >
          ${children}
        </div>
      `;
        }
        case "number": {
            return `
        <div
          class="item-inner"
          role="spinbutton"
          id="${id}-aria"
          aria-labelledby="${id}"
          aria-valuenow="${value}"
        >
          ${children}
        </div>
      `;
        }
        case "string": {
            return `
        <div
          class="item-inner"
          role="textbox"
          id="${id}-aria"
          aria-labelledby="${id}"
        >
          ${children}
        </div>
      `;
        }
        default: {
            return `
        <div
          class="item-inner"
          id="${id}-aria"
          aria-labelledby="${id}"
        >
          ${children}
        </div>
      `;
        }
    }
};
const getField = (setting, children) => {
    var _a;
    switch (setting.type) {
        case "boolean": {
            return `
        <label class="label-switch">
          <input
            type="checkbox"
            class="settings_checkbox"
            id="${setting.id}"
            name="${setting.id}"
            value="${setting.value ? 1 : 0}"
            ${setting.value ? 'checked=""' : ""}"
          >
          <div class="checkbox"></div>
          ${children}
        </label>
      `;
        }
        case "string":
        case "number": {
            return `
        <div class="item-after">
          <input
            type="text"
            name="${setting.id}"
            placeholder="${(_a = setting.placeholder) !== null && _a !== void 0 ? _a : ""}"
            value="${setting.value}"
            class="inlineinputsm fh-input"
            style="
              width: 100px !important;
            "
          >
          ${children}
        </div>
      `;
        }
        default: {
            return "";
        }
    }
};
const getValue = ({ id, type }, currentPage) => {
    const input = currentPage.querySelector(`[name=${id}]`);
    switch (type) {
        case "boolean": {
            const wrapper = currentPage.querySelector(`[id=${id}-aria]`);
            return wrapper.getAttribute("aria-checked") === "true";
        }
        case "number": {
            return Number(input.value);
        }
        case "string": {
            return input.value;
        }
        default: {
            return input.value;
        }
    }
};
const SETTING_EXPORT = {
    id: settings_1.SettingId.EXPORT,
    title: "Settings: Export",
    description: "Exports Farmhand Settings to sync to other device",
    type: "string",
    defaultValue: "",
    buttonText: "Export",
    buttonAction: (settings, settingWrapper) => __awaiter(void 0, void 0, void 0, function* () {
        const exportedSettings = Object.values((0, settings_1.getSettings)());
        for (const setting of exportedSettings) {
            setting.data = yield (0, settings_1.getData)(setting, "");
        }
        const exportString = JSON.stringify(exportedSettings);
        GM.setClipboard(exportString);
        (0, popup_1.showPopup)({
            title: "Settings Exported to clipboard",
            contentHTML: "Open Farm RPG on another device with Farmhand installed to import",
        });
        const input = settingWrapper.querySelector(".fh-input");
        if (input) {
            input.value = exportString;
        }
    }),
};
const SETTING_IMPORT = {
    id: settings_1.SettingId.IMPORT,
    title: "Settings: Import",
    description: "Paste export into box and click Import",
    type: "string",
    defaultValue: "",
    placeholder: "Paste Here",
    buttonText: "Import",
    buttonAction: (settings, settingWrapper) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const input = (_a = settingWrapper.querySelector(".fh-input")) === null || _a === void 0 ? void 0 : _a.value;
        const importedSettings = JSON.parse((_c = (_b = input === null || input === void 0 ? void 0 : input.replace(notes_1.FARMHAND_PREFIX, "")) === null || _b === void 0 ? void 0 : _b.replace(notes_1.FARMHAND_SUFFIX, "")) !== null && _c !== void 0 ? _c : "[]");
        for (const setting of importedSettings) {
            yield (0, settings_1.setSetting)(setting);
            if (setting.data) {
                yield (0, settings_1.setData)(setting, setting.data);
            }
        }
        yield (0, popup_1.showPopup)({
            title: "Farmhand Settings Imported!",
            contentHTML: "Page will reload to apply",
        });
        window.location.reload();
    }),
};
exports.farmhandSettings = {
    settings: [SETTING_EXPORT, SETTING_IMPORT],
    onInitialize: () => {
        document.head.insertAdjacentHTML("beforeend", `
      <style>
        /* Allow action buttons next to switches */
        .label-switch {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          width: auto !important; 
        }
      <style>
    `);
    },
    onPageLoad: (settingValues, page) => {
        var _a;
        // make sure we are on the settings page
        if (page !== page_1.Page.SETTINGS_OPTIONS) {
            return;
        }
        // make sure page content has loaded
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        // insert at end of first card
        const settingsList = currentPage.querySelector("#settingsform_options ul");
        if (!settingsList) {
            console.error("Settings list not found");
            return;
        }
        // add section
        let farmhandSettingsLi = settingsList.querySelector(".fh-settings-title");
        if (farmhandSettingsLi) {
            // already rendered
            return;
        }
        farmhandSettingsLi = document.createElement("li");
        farmhandSettingsLi.classList.add("list-group-title");
        farmhandSettingsLi.classList.add("item-divider");
        farmhandSettingsLi.classList.add("fh-settings-title");
        farmhandSettingsLi.textContent = "Farmhand Settings";
        settingsList.append(farmhandSettingsLi);
        // add settings
        for (const setting of (0, settings_1.getSettings)()) {
            setting.value = settingValues[setting.id];
            const hasButton = setting.buttonText && setting.buttonAction;
            const settingLi = document.createElement("li");
            settingLi.innerHTML = `
        <div
          class="item-content"
          style="
            display: flex;
            gap: 15px;
            justify-content: space-between;
          "
        >
          ${getWrapper(setting, `
            <div
              class="item-title label"
              style="
                flex: 1;
                white-space: normal;
              "
            >
              <label
                id="${setting.id}"
                for="${setting.id}">
                  ${setting.title}
              </label>
              <br>
              <div style="font-size: 11px">${setting.description}</div>
            </div>
            ${getField(setting, hasButton
                ? `
                  <button
                    class="button btngreen fh-action"
                    style="margin-left: 8px"
                  >${setting.buttonText}</button>
                `
                : "")}
            `)}
      </div>
      `;
            (_a = settingLi
                .querySelector(".fh-action")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => {
                var _a;
                event.preventDefault();
                event.stopPropagation();
                (_a = setting.buttonAction) === null || _a === void 0 ? void 0 : _a.call(setting, settingValues, settingLi);
            });
            settingsList.append(settingLi);
        }
        // hook into save button
        const saveButton = currentPage.querySelector("#settings_options");
        if (!saveButton) {
            console.error("Save button not found");
            return;
        }
        saveButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
            saveButton.textContent = "Saving...";
            yield Promise.all(Object.values((0, settings_1.getSettings)()).map((setting) => {
                setting.value = getValue(setting, currentPage);
                return (0, settings_1.setSetting)(setting);
            }));
            setTimeout(() => window.location.reload(), 1000);
        }));
    },
};


/***/ }),

/***/ 2100:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fishinInBarrel = void 0;
const settings_1 = __webpack_require__(126);
const SETTING_FISH_IN_BARREL = {
    id: settings_1.SettingId.FISH_IN_BARREL,
    title: "Fishing: Barrel Mode",
    description: "Fish always appear in middle of pond",
    type: "boolean",
    defaultValue: true,
};
exports.fishinInBarrel = {
    settings: [SETTING_FISH_IN_BARREL],
    onInitialize: (settings) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.FISH_IN_BARREL]) {
            return;
        }
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          /* Move fish to middle */
          .fish {
            position: absolute;
            top: calc(50% - 30px);
            left: calc(50% - 30px);
          }
        <style>
      `);
    },
};


/***/ }),

/***/ 9361:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fleaMarket = void 0;
const settings_1 = __webpack_require__(126);
const SETTING_FLEA_MARKET = {
    id: settings_1.SettingId.FLEA_MARKET,
    title: "Flea Market: Disable",
    description: "Flea Market is disabled because it's a waste of gold",
    type: "boolean",
    defaultValue: true,
};
exports.fleaMarket = {
    settings: [SETTING_FLEA_MARKET],
    onInitialize: (settings) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.FLEA_MARKET]) {
            return;
        }
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          /* Hide Flea Market in Town */
          a[href="flea.php"] {
            display: none;
          }

          /* Hide Flea Market Page */
          .page[page="flea"] {
            display: none;
          }

          /* Hide Flea Market in Inventory */
          .close-panel:has(a[href="flea.php"]) {
            display: none;
          }
        <style>
      `);
    },
};


/***/ }),

/***/ 8697:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.focusDashboard = void 0;
const theme_1 = __webpack_require__(1178);
const recipes_1 = __webpack_require__(498);
const page_1 = __webpack_require__(7952);
const focus_1 = __webpack_require__(7167);
const quests_1 = __webpack_require__(303);
const inventory_1 = __webpack_require__(4514);
const api_1 = __webpack_require__(3413);
const gameLinks_1 = __webpack_require__(1616);
const promise_1 = __webpack_require__(6762);
const unlimited_1 = __webpack_require__(4808);
const settings_1 = __webpack_require__(126);
const SETTING_FOCUS_DASHBOARD = {
    id: settings_1.SettingId.FOCUS_DASHBOARD,
    title: "Quests: Focus dashboard",
    description: `
    On the quests page, cross your open requests against your inventory: what
    you can turn in now, what's one item away, and which materials are holding
    up the most requests
  `,
    type: "boolean",
    defaultValue: true,
};
const CONTAINER_ID = "fh-focus-dashboard";
const MAX_LISTED = 6;
const makeLine = (color, text) => {
    const line = document.createElement("div");
    line.style.color = color;
    line.style.fontSize = "12px";
    line.style.lineHeight = "1.5";
    line.style.marginBottom = "3px";
    line.textContent = text;
    return line;
};
const makeHeading = (text) => {
    const heading = document.createElement("div");
    heading.textContent = text;
    heading.style.color = theme_1.TEXT_WHITE;
    heading.style.fontSize = "12px";
    heading.style.fontWeight = "bold";
    heading.style.margin = "10px 0 4px";
    return heading;
};
const formatHits = (hits) => hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);
const render = (container, goals, unlimited) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const snapshot = yield inventory_1.inventoryState.get();
    const inventory = (_a = snapshot === null || snapshot === void 0 ? void 0 : snapshot.quantities) !== null && _a !== void 0 ? _a : {};
    // one walk covering every item any open request wants, so the whole board is
    // costed from a single batch of buddy.farm lookups
    const graph = yield (0, recipes_1.gatherRecipeGraph)(goals.flatMap((goal) => goal.needs.map((need) => need.name)));
    const statuses = (0, focus_1.getGoalStatuses)(graph, goals, inventory, unlimited);
    const ready = statuses.filter((status) => status.isReady);
    const nearlyDone = (0, focus_1.getNearlyDone)(statuses);
    const bottlenecks = (0, focus_1.rankBottlenecks)(statuses);
    container.append(makeLine(theme_1.TEXT_GRAY, `${goals.length} open request${goals.length === 1 ? "" : "s"} costed against your inventory.`));
    if (ready.length > 0) {
        container.append(makeHeading("Ready to turn in"));
        for (const status of ready) {
            container.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, [
                (0, gameLinks_1.makeQuestLink)(status.goal.label, status.goal.href, theme_1.TEXT_SUCCESS),
            ]));
        }
    }
    if (nearlyDone.length > 0) {
        container.append(makeHeading("One item away"));
        for (const status of nearlyDone.slice(0, MAX_LISTED)) {
            const [only] = status.missing;
            container.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
                (0, gameLinks_1.makeQuestLink)(status.goal.label, status.goal.href, theme_1.TEXT_WARNING),
                ` — ${only.quantity.toLocaleString()} × `,
                (0, gameLinks_1.makeItemLink)(only.name, (_b = graph.nodes.get(only.name)) === null || _b === void 0 ? void 0 : _b.id, theme_1.TEXT_WARNING),
            ]));
        }
    }
    if (bottlenecks.length > 0) {
        container.append(makeHeading("Holding up the most"));
        for (const entry of bottlenecks.slice(0, MAX_LISTED)) {
            const color = entry.goalsGated > 1 ? theme_1.TEXT_WARNING : theme_1.TEXT_GRAY;
            container.append((0, gameLinks_1.makeLinkedLine)(color, [
                (0, gameLinks_1.makeItemLink)(entry.name, (_c = graph.nodes.get(entry.name)) === null || _c === void 0 ? void 0 : _c.id, color),
                ` — ${entry.goalsGated > 1
                    ? `blocks ${entry.goalsGated} requests`
                    : `blocks ${entry.goals[0]}`}, need up to ${entry.maxNeeded.toLocaleString()}`,
            ]));
        }
        const sourcing = (0, focus_1.getFocusSourcing)(graph, bottlenecks);
        if (sourcing.locations.length > 0) {
            container.append(makeHeading("Where to go"));
            const references = yield Promise.all(sourcing.locations.map((entry) => (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: entry.location }))));
            for (const [index, location] of sourcing.locations.entries()) {
                const color = location.items.length > 1 ? theme_1.TEXT_SUCCESS : theme_1.TEXT_GRAY;
                const parts = [
                    (0, gameLinks_1.makeLocationLink)(location.location, references[index], color),
                    " — ",
                ];
                for (const [itemIndex, item] of location.items.entries()) {
                    if (itemIndex > 0) {
                        parts.push(", ");
                    }
                    parts.push((0, gameLinks_1.makeItemLink)(item.name, (_d = graph.nodes.get(item.name)) === null || _d === void 0 ? void 0 : _d.id, color));
                }
                parts.push(` (~${formatHits(location.hits)} ${location.type === "fishing" ? "casts" : "explores"})`);
                container.append((0, gameLinks_1.makeLinkedLine)(color, parts));
            }
        }
    }
    else if (ready.length === statuses.length && statuses.length > 0) {
        container.append(makeLine(theme_1.TEXT_SUCCESS, "Every open request is ready to hand in."));
    }
});
exports.focusDashboard = {
    settings: [SETTING_FOCUS_DASHBOARD],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (page !== page_1.Page.QUESTS) {
            return;
        }
        if (!settings[settings_1.SettingId.FOCUS_DASHBOARD]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        (_a = currentPage.querySelector(`#${CONTAINER_ID}`)) === null || _a === void 0 ? void 0 : _a.remove();
        const quests = (0, quests_1.parseActiveQuests)();
        if (quests.length === 0) {
            return;
        }
        const card = document.createElement("div");
        card.id = CONTAINER_ID;
        card.className = "card";
        const content = document.createElement("div");
        content.className = "card-content";
        const inner = document.createElement("div");
        inner.className = "card-content-inner";
        inner.style.borderLeft = `3px solid ${theme_1.BORDER_GRAY}`;
        inner.style.paddingLeft = "10px";
        const title = document.createElement("div");
        title.textContent = "Focus";
        title.style.color = theme_1.TEXT_WHITE;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "6px";
        inner.append(title);
        const status = makeLine(theme_1.TEXT_GRAY, "Costing your open requests…");
        inner.append(status);
        content.append(inner);
        card.append(content);
        const heading = (0, page_1.getTitle)(/Active Requests/);
        if (heading) {
            heading.before(card);
        }
        else {
            (_b = currentPage.querySelector(".content-block")) === null || _b === void 0 ? void 0 : _b.prepend(card);
        }
        const { goals, unmatched } = yield (0, quests_1.getQuestGoals)(quests);
        status.remove();
        if (goals.length === 0) {
            inner.append(makeLine(theme_1.TEXT_GRAY, "No requirements found for your open requests."));
            return;
        }
        yield render(inner, goals, (0, unlimited_1.parseUnlimitedItems)(String((_c = settings[settings_1.SettingId.UNLIMITED_ITEMS]) !== null && _c !== void 0 ? _c : "")));
        if (unmatched.length > 0) {
            inner.append(makeLine(theme_1.TEXT_GRAY, `Not on buddy.farm, so not costed: ${unmatched.join(", ")}`));
        }
    }),
};


/***/ }),

/***/ 4894:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fieldNotifications = void 0;
const farm_1 = __webpack_require__(6228);
const notifications_1 = __webpack_require__(6783);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const requests_1 = __webpack_require__(3300);
const SETTING_HARVEST_NOTIFICATIONS = {
    id: settings_1.SettingId.HARVEST_NOTIFICATIONS,
    title: "Farm: Harvest Notifications",
    description: `
    Show notification when crops are ready to harvest
  `,
    type: "boolean",
    defaultValue: true,
};
const SETTING_HARVEST_POPUP = {
    id: settings_1.SettingId.HARVEST_POPUP,
    title: "Farm: Harvest Popup",
    description: `
    Show popup on Farm page when crops are harvested with the harvest results including bonuses</br>
    (popup is always shown if havesting from other pages via the notification)
  `,
    type: "boolean",
    defaultValue: true,
};
const SETTING_EMPTY_NOTIFICATIONS = {
    id: settings_1.SettingId.FIELD_EMPTY_NOTIFICATIONS,
    title: "Farm: Empty Notifications",
    description: `
    Show notification when fields are empty
  `,
    type: "boolean",
    defaultValue: true,
};
(0, notifications_1.registerNotificationHandler)(notifications_1.Handler.HARVEST, farm_1.harvestAll);
const renderFields = (settings, state) => __awaiter(void 0, void 0, void 0, function* () {
    const farmId = yield farm_1.farmIdState.get();
    if (!state) {
        return;
    }
    if (state.status === farm_1.CropStatus.EMPTY &&
        settings[settings_1.SettingId.FIELD_EMPTY_NOTIFICATIONS]) {
        (0, notifications_1.sendNotification)({
            class: "btnorange",
            id: notifications_1.NotificationId.FIELD,
            text: "Fields are empty!",
            href: (0, requests_1.toUrl)(page_1.Page.FARM, new URLSearchParams({ id: String(farmId) })),
            excludePages: [page_1.Page.FARM],
        });
    }
    else if (state.status === farm_1.CropStatus.READY &&
        settings[settings_1.SettingId.HARVEST_NOTIFICATIONS]) {
        const farmUrl = (0, requests_1.toUrl)(page_1.Page.FARM, new URLSearchParams({ id: String(farmId) }));
        (0, notifications_1.sendNotification)({
            class: "btngreen",
            id: notifications_1.NotificationId.FIELD,
            text: "Crops are ready!",
            href: farmUrl,
            actions: [
                { text: "View", href: farmUrl },
                {
                    text: "Harvest",
                    handler: notifications_1.Handler.HARVEST,
                },
            ],
            excludePages: [page_1.Page.FARM],
        });
    }
    else {
        (0, notifications_1.removeNotification)(notifications_1.NotificationId.FIELD);
    }
});
exports.fieldNotifications = {
    settings: [
        SETTING_HARVEST_NOTIFICATIONS,
        SETTING_HARVEST_POPUP,
        SETTING_EMPTY_NOTIFICATIONS,
    ],
    onInitialize: (settings) => {
        farm_1.farmStatusState.onUpdate((state) => renderFields(settings, state));
    },
};


/***/ }),

/***/ 5454:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.highlightSelfInChat = void 0;
const theme_1 = __webpack_require__(1178);
const settings_1 = __webpack_require__(126);
const apis_1 = __webpack_require__(7046);
const SETTING_CHAT_HIGHLIGHT_SELF = {
    id: settings_1.SettingId.CHAT_HIGHLIGHT_SELF,
    title: "Chat: Highlight self",
    description: "Highlight messages in chat where you are @mentioned",
    type: "boolean",
    defaultValue: true,
};
exports.highlightSelfInChat = {
    settings: [SETTING_CHAT_HIGHLIGHT_SELF],
    onChatLoad: (settings) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.CHAT_HIGHLIGHT_SELF]) {
            return;
        }
        const username = yield apis_1.usernameState.get();
        if (!username) {
            console.error("Could not find username");
            return;
        }
        const tags = document.querySelectorAll(`span a[href='profile.php?user_name=${username}']`);
        for (const tag of tags) {
            tag.style.color = theme_1.TEXT_WARNING;
            const message = (_a = tag.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
            if (!message) {
                console.error("Could not find message");
                continue;
            }
            message.style.backgroundColor = theme_1.ALERT_YELLOW_BACKGROUND;
            message.style.border = `1px solid ${theme_1.ALERT_YELLOW_BORDER}`;
        }
    }),
};


/***/ }),

/***/ 1108:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.improvedInputs = void 0;
const theme_1 = __webpack_require__(1178);
const dropdown_1 = __webpack_require__(9946);
const api_1 = __webpack_require__(3413);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_IMPROVED_INPUTS = {
    id: settings_1.SettingId.IMPROVED_INPUTS,
    title: "UI: Improved Inputs",
    description: "Consistent button and field styling and improved item selector UI",
    type: "boolean",
    defaultValue: true,
};
exports.improvedInputs = {
    settings: [SETTING_IMPROVED_INPUTS],
    onInitialize: (settings) => {
        if (!settings[settings_1.SettingId.IMPROVED_INPUTS]) {
            return;
        }
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          .newinput,
          .searchbar input[type="search"],
          input[type="number"]:not(#vaultcode),
          input[type="text"]:not(#chat_txt_desktop, #chat_txt_mobile) {
            ${(0, theme_1.toCSS)(theme_1.INPUT_STYLES)}
          }

          .searchbar .searchbar-input {
            height: auto;
          }

          .modal {
            border-radius: 0;
            border: 2px solid #c5c5c5;
            border-bottom: 0;
            overflow: visible;
          }

          .list-block .item-after {
            max-height: initial;
          }

          .pages .button:not([class*=".btn"]),
          .modal-button,
          .button.btngreen,
          .tosswellbtn,
          .cookallbtn {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_GREEN_STYLES)}
          }

          .modal-button {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 -2px;
            height: 44px !important;
            width: calc(100% + 4px) !important;
          }
          
          .modal-button:last-child {
            margin-bottom: -2px;
          }

          select, .inlineinputlg {
            ${(0, theme_1.toCSS)(theme_1.INPUT_STYLES)}
          }
          
          .button.btnred[class*="btn"] {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_RED_STYLES)} 
          }

          .button.btnorange[class*="btn"] {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_ORANGE_STYLES)}
          }
          
          .button.btnblue[class*="btn"] {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_BLUE_STYLES)}
          }

          button[class*="qty"] {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_GRAY_DARK_STYLES)}
          }
          
          .button.btnpurple[class*="btn"] {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_PURPLE_STYLES)}
          }

          .button.btngray[class*="btn"] {
            ${(0, theme_1.toCSS)(theme_1.BUTTON_GRAY_STYLES)}
          }

          .buttons-row .button[class*="btn"] {
            height: inherit !important;
            width: inherit !important;
            flex: 1 !important;
          }
        </style>
      `);
    },
    onPageLoad: (settings) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!settings[settings_1.SettingId.IMPROVED_INPUTS]) {
            return;
        }
        (0, dropdown_1.clearDropdown)();
        const selectors = (_a = (0, page_1.getCurrentPage)()) === null || _a === void 0 ? void 0 : _a.querySelectorAll("select");
        for (const selector of selectors !== null && selectors !== void 0 ? selectors : []) {
            const options = yield Promise.all([...selector.options].map((option) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                if (option.dataset.name === "Shovel") {
                    const shovel = yield (0, api_1.getAbridgedItem)("Shovel");
                    return {
                        name: "Dig Up",
                        quantity: Number(option.dataset.amt),
                        icon: (_a = shovel === null || shovel === void 0 ? void 0 : shovel.image) !== null && _a !== void 0 ? _a : "",
                        value: option.value,
                        proxyOption: option,
                    };
                }
                const text = (_c = (_b = option.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
                if (text === "--- select ---" ||
                    text === "Nothing Selected" ||
                    !text) {
                    return;
                }
                // Only the inventory-style selects suffix a count, as "Wood (1,234)".
                // Plenty of selects list plain names instead -- the Craftworks item
                // picker and its set-image picker are two, several hundred options
                // between them -- so a missing count is an ordinary shape, not a
                // parse failure. Those carry the name in `data-name`; fall back to
                // the label otherwise, and skip the buddy.farm lookups entirely,
                // since without a count there is no icon or quantity to show.
                const match = text.match(/^(.*) \(([\d,]+)\)$/);
                if (!match) {
                    return {
                        name: (_d = option.dataset.name) !== null && _d !== void 0 ? _d : text,
                        value: option.value,
                        proxyOption: option,
                    };
                }
                const [, name, quantity] = match;
                if (!(yield (0, api_1.isItem)(name))) {
                    // a counted option that is not a catalogued item is legitimate
                    // (game-only entries buddy.farm has never indexed); show the label
                    console.debug("[Farmhand] option is not a known item", name);
                    return {
                        name: text,
                        value: option.value,
                        proxyOption: option,
                    };
                }
                const item = yield (0, api_1.getAbridgedItem)(name);
                return {
                    name,
                    quantity: Number(quantity.replaceAll(",", "")),
                    icon: item.image,
                    value: option.value,
                    proxyOption: option,
                };
            })));
            (0, dropdown_1.replaceSelect)(selector, options.filter((option) => option !== undefined));
        }
    }),
};


/***/ }),

/***/ 6660:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.inventoryCapWarnings = void 0;
const theme_1 = __webpack_require__(1178);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3300);
const inventory_1 = __webpack_require__(4514);
const settings_1 = __webpack_require__(126);
const SETTING_INVENTORY_CAP_WARNINGS = {
    id: settings_1.SettingId.INVENTORY_CAP_WARNINGS,
    title: "Inventory: Cap warnings",
    description: "Highlight items at or near your inventory cap so drops don't go to waste",
    type: "boolean",
    defaultValue: true,
};
const SETTING_INVENTORY_CAP_TRACKER = {
    id: settings_1.SettingId.INVENTORY_CAP_TRACKER,
    title: "Inventory: Cap tracker box",
    description: `
    Show items at or near your inventory cap in a small box above the bottom
    bar; click an item to open its page
  `,
    type: "boolean",
    defaultValue: true,
};
const NEAR_CAP_RATIO = 0.9;
const MAX_TRACKER_ITEMS = 20;
const PASSIVE_REFRESH_MS = 10 * 60 * 1000;
const ACTIVE_DEBOUNCE_MS = 1500;
const ACTIVE_MIN_INTERVAL_MS = 15 * 1000;
const capTrackerState = {
    cap: 0,
    isFetching: false,
    items: [],
    updatedAt: 0,
};
const isInventoryPage = () => (window.location.hash || window.location.pathname).includes("inventory.php");
// narrow a parsed inventory page down to the at/near-cap rows. The parse
// itself is shared with the craft planner (api/farmrpg/apis/inventory), which
// wants every row; this is the only consumer that filters.
const collectCapItems = (root) => {
    const page = (0, inventory_1.parseInventoryPage)(root);
    if (!page) {
        return undefined;
    }
    // the planner rides along on whatever fetch or page render got us here
    // rather than issuing an inventory request of its own
    (0, inventory_1.publishInventoryPage)(page);
    const { cap, rows } = page;
    const items = [];
    for (const row of rows) {
        if (row.count === 0 || row.count < cap * NEAR_CAP_RATIO) {
            continue;
        }
        items.push({
            count: row.count,
            href: row.href,
            image: row.image,
            isAtCap: row.count >= cap,
            name: row.name,
        });
    }
    return { cap, items };
};
const renderTrackerItem = (item) => {
    const anchor = document.createElement("a");
    anchor.href = item.href;
    const count = item.count.toLocaleString();
    const cap = capTrackerState.cap.toLocaleString();
    anchor.title = `${item.name}: ${count} / ${cap}`;
    anchor.style.display = "block";
    anchor.style.lineHeight = "0";
    anchor.style.borderRadius = "5px";
    anchor.style.border = `2px solid ${item.isAtCap ? theme_1.TEXT_ERROR : theme_1.TEXT_WARNING}`;
    if (item.image) {
        const icon = document.createElement("img");
        icon.src = item.image;
        icon.style.width = "22px";
        icon.style.height = "22px";
        icon.style.borderRadius = "3px";
        icon.style.display = "block";
        anchor.append(icon);
    }
    else {
        anchor.style.lineHeight = "22px";
        anchor.style.padding = "0 4px";
        anchor.style.fontSize = "12px";
        anchor.style.color = theme_1.TEXT_WHITE;
        anchor.textContent = item.name;
    }
    return anchor;
};
const imageBasename = (source) => { var _a; return ((_a = source.split("/").pop()) !== null && _a !== void 0 ? _a : "").split("?")[0]; };
// per-location drop lists, learned from the game's own explore/fishing
// responses (the location pages themselves don't list what drops there).
// persisted so each location only needs to be learned once.
const LOCATION_DROPS_KEY = "fhCapTrackerLocationDrops";
let locationDrops = {};
let locationDropsLoaded = false;
const COLLAPSED_KEY = "fhCapTrackerCollapsed";
let isCollapsed = false;
const setCollapsed = (value) => {
    isCollapsed = value;
    GM.setValue(COLLAPSED_KEY, value);
    scheduleRender();
};
const loadLocationDrops = () => {
    if (locationDropsLoaded) {
        return;
    }
    locationDropsLoaded = true;
    GM.getValue(COLLAPSED_KEY, false)
        .then((value) => {
        isCollapsed = Boolean(value);
        scheduleRender();
    })
        .catch(() => {
        // ignore load failures; default to expanded
    });
    GM.getValue(LOCATION_DROPS_KEY, {})
        .then((value) => {
        locationDrops = value !== null && value !== void 0 ? value : {};
        scheduleRender();
    })
        .catch(() => {
        // ignore failures; stale data is fine here
    });
};
// which worker actions teach us drops, and the location type they belong to
const LEARN_ACTION_TYPES = {
    explore: "explore",
    fishcaught: "fishing",
    castnet: "fishing",
};
const learnLocationDrops = (actionGo, response) => {
    const type = LEARN_ACTION_TYPES[actionGo];
    if (!type) {
        return;
    }
    const [, query] = (0, requests_1.parseUrl)(response.url);
    const id = query.get("id");
    if (!id) {
        return;
    }
    response
        .text()
        .then((html) => {
        var _a;
        const key = `${type}:${id}`;
        const existing = new Set((_a = locationDrops[key]) !== null && _a !== void 0 ? _a : []);
        let changed = false;
        for (const match of html.matchAll(/img\/items\/([^"'?]+)/g)) {
            if (!existing.has(match[1])) {
                existing.add(match[1]);
                changed = true;
            }
        }
        if (changed) {
            locationDrops[key] = [...existing];
            GM.setValue(LOCATION_DROPS_KEY, locationDrops);
            scheduleRender();
        }
    })
        .catch(() => {
        // ignore failures; stale data is fine here
    });
};
// current location key when on a fishing or explore page
const getLocationKey = () => {
    const url = window.location.hash || window.location.pathname;
    let match = url.match(/fishing\.php\?[^#]*\bid=(\d+)/);
    if (match) {
        return `fishing:${match[1]}`;
    }
    match = url.match(/area\.php\?[^#]*\bid=(\d+)/);
    if (match) {
        return `explore:${match[1]}`;
    }
    // mining.php?id=N is the dig board itself (mine.php is the mine list),
    // so the key works for any number of mines
    match = url.match(/mining\.php\?[^#]*\bid=(\d+)/);
    if (match) {
        return `mining:${match[1]}`;
    }
    return undefined;
};
// digging reveals a found item as an image tile on the dig board: a
// discovered cell (.checkCell) holds an <img> of the item, which is the same
// signal the auto-miner reads to spot discoveries. learn a mine's drops
// straight off the board, restricted to img/items/ paths so only real item
// icons are learned (misses/hits/traps render font icons, not item images),
// and so the learned basenames match the inventory rows we filter against.
const learnFromMiningPage = (key) => {
    var _a, _b, _c;
    const existing = new Set((_a = locationDrops[key]) !== null && _a !== void 0 ? _a : []);
    let changed = false;
    const root = (_b = (0, page_1.getCurrentPage)()) !== null && _b !== void 0 ? _b : document;
    for (const image of root.querySelectorAll(".checkCell img[src*='img/items/']")) {
        const name = imageBasename((_c = image.getAttribute("src")) !== null && _c !== void 0 ? _c : "");
        if (name && !existing.has(name)) {
            existing.add(name);
            changed = true;
        }
    }
    if (changed) {
        locationDrops[key] = [...existing];
        GM.setValue(LOCATION_DROPS_KEY, locationDrops);
        scheduleRender();
    }
};
// explore/fishing drops arrive via intercepted responses, but a mine's drops
// are only visible as tiles on the board, so scrape them whenever a mine page
// is (re)shown. kept separate from rendering so the render stays a pure paint.
const learnCurrentLocation = () => {
    const key = getLocationKey();
    if (key === null || key === void 0 ? void 0 : key.startsWith("mining:")) {
        learnFromMiningPage(key);
    }
};
const renderCapTracker = () => {
    let box = document.querySelector("#fh-cap-tracker");
    const key = getLocationKey();
    const learned = key ? locationDrops[key] : undefined;
    // filter to this location's known drops; before a location has been
    // learned (first visit), show everything rather than nothing
    const visible = learned && learned.length > 0
        ? capTrackerState.items.filter((item) => item.image && learned.includes(imageBasename(item.image)))
        : capTrackerState.items;
    if (visible.length === 0) {
        box === null || box === void 0 ? void 0 : box.remove();
        return;
    }
    if (!box) {
        box = document.createElement("div");
        box.id = "fh-cap-tracker";
        box.classList.add("fh-cap-tracker");
        box.style.gap = "4px";
        box.style.pointerEvents = "auto";
        const statsZone = document.querySelector("#statszone_main");
        if (statsZone) {
            // single line in the bottom bar, right of the currency counts
            box.style.display = "inline-flex";
            box.style.flexWrap = "nowrap";
            box.style.verticalAlign = "middle";
            box.style.marginLeft = "14px";
            statsZone.append(box);
        }
        else {
            box.style.display = "flex";
            box.style.flexWrap = "wrap";
            box.style.justifyContent = "flex-end";
            box.style.maxWidth = "180px";
            box.style.padding = "5px 6px";
            box.style.borderRadius = "6px";
            box.style.border = `1px solid ${theme_1.BORDER_GRAY}`;
            box.style.backgroundColor = "rgba(20, 20, 20, 0.92)";
            box.style.position = "fixed";
            box.style.right = "8px";
            box.style.bottom = "62px";
            box.style.zIndex = "5000";
            document.body.append(box);
        }
    }
    const shown = visible.slice(0, MAX_TRACKER_ITEMS);
    const signature = JSON.stringify([
        capTrackerState.cap,
        visible.length,
        isCollapsed,
        shown,
    ]);
    if (box.dataset.fhSignature === signature) {
        return;
    }
    box.dataset.fhSignature = signature;
    box.innerHTML = "";
    if (isCollapsed) {
        const atCapCount = visible.filter((item) => item.isAtCap).length;
        const nearCapCount = visible.length - atCapCount;
        const summary = document.createElement("span");
        summary.style.cursor = "pointer";
        summary.style.display = "inline-flex";
        summary.style.gap = "6px";
        summary.style.alignItems = "center";
        summary.style.fontWeight = "bold";
        summary.title = `${atCapCount} at cap · ${nearCapCount} near cap — click to expand`;
        const atCapNumber = document.createElement("span");
        atCapNumber.style.color = theme_1.TEXT_ERROR;
        atCapNumber.textContent = String(atCapCount);
        const nearCapNumber = document.createElement("span");
        nearCapNumber.style.color = theme_1.TEXT_WARNING;
        nearCapNumber.textContent = String(nearCapCount);
        summary.append(atCapNumber, nearCapNumber);
        summary.addEventListener("click", () => setCollapsed(false));
        box.append(summary);
        return;
    }
    for (const item of shown) {
        box.append(renderTrackerItem(item));
    }
    if (visible.length > shown.length) {
        const more = document.createElement("a");
        more.href = "inventory.php";
        more.textContent = `+${visible.length - shown.length}`;
        more.title = "More items at/near cap — open inventory";
        more.style.color = theme_1.TEXT_WARNING;
        more.style.fontWeight = "bold";
        more.style.fontSize = "12px";
        more.style.alignSelf = "center";
        more.style.padding = "0 3px";
        box.append(more);
    }
    const collapseButton = document.createElement("span");
    collapseButton.textContent = "\u2212";
    collapseButton.title = "Collapse";
    collapseButton.style.cursor = "pointer";
    collapseButton.style.color = theme_1.TEXT_GRAY;
    collapseButton.style.fontWeight = "bold";
    collapseButton.style.fontSize = "14px";
    collapseButton.style.alignSelf = "center";
    collapseButton.style.padding = "0 3px";
    collapseButton.addEventListener("click", () => setCollapsed(true));
    box.append(collapseButton);
};
// every state change funnels through here: mutate, then ask for a repaint.
// renders coalesce into a single microtask, so a burst of mutations repaints
// once and no mutation site has to remember to call the renderer.
let isRenderScheduled = false;
const scheduleRender = () => {
    if (isRenderScheduled) {
        return;
    }
    isRenderScheduled = true;
    queueMicrotask(() => {
        isRenderScheduled = false;
        renderCapTracker();
    });
};
const updateFromRoot = (root) => {
    const result = collectCapItems(root);
    if (!result) {
        return;
    }
    capTrackerState.cap = result.cap;
    capTrackerState.items = result.items;
    capTrackerState.updatedAt = Date.now();
    scheduleRender();
};
const fetchCapTrackerNow = () => __awaiter(void 0, void 0, void 0, function* () {
    if (capTrackerState.isFetching) {
        return;
    }
    capTrackerState.isFetching = true;
    try {
        const response = yield (0, requests_1.getHTML)(page_1.Page.INVENTORY, new URLSearchParams());
        // mark updated even if parsing fails so we don't hammer the server
        // eslint-disable-next-line require-atomic-updates
        capTrackerState.updatedAt = Date.now();
        const result = collectCapItems(response.body);
        if (result) {
            // eslint-disable-next-line require-atomic-updates
            capTrackerState.cap = result.cap;
            // eslint-disable-next-line require-atomic-updates
            capTrackerState.items = result.items;
            scheduleRender();
        }
    }
    catch (_a) {
        // ignore fetch failures; the next refresh will retry
    }
    finally {
        // eslint-disable-next-line require-atomic-updates
        capTrackerState.isFetching = false;
    }
});
// passive background refresh, at most every 10 minutes
const refreshCapTracker = () => {
    if (Date.now() - capTrackerState.updatedAt < PASSIVE_REFRESH_MS) {
        return;
    }
    fetchCapTrackerNow();
};
// active refresh: while the player is fishing/exploring/harvesting/selling,
// the game's own worker.php calls trigger a debounced, throttled refresh —
// a short delay batches bursts of actions, and refreshes run at most every 15s
let isTrackerEnabled = false;
let activeTimer;
let lastActiveFetchAt = 0;
const markCapTrackerActive = () => {
    if (!isTrackerEnabled || activeTimer) {
        return;
    }
    const wait = Math.max(ACTIVE_DEBOUNCE_MS, lastActiveFetchAt + ACTIVE_MIN_INTERVAL_MS - Date.now());
    activeTimer = setTimeout(() => {
        activeTimer = undefined;
        lastActiveFetchAt = Date.now();
        fetchCapTrackerNow();
    }, wait);
};
// game actions that change inventory counts
const ACTION_GOS = [
    "fishcaught",
    "castnet",
    "sellalluserfish",
    "explore",
    "harvestall",
    "sellitem",
    "useitem",
    "openitem",
];
// interceptors only observe responses; no state is attached to them
const noopState = {
    get: () => Promise.resolve(undefined),
};
for (const actionGo of ACTION_GOS) {
    (0, requests_1.registerQueryInterceptor)([
        noopState,
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: actionGo })],
            callback: (_state, _previous, response) => {
                markCapTrackerActive();
                learnLocationDrops(actionGo, response);
                return Promise.resolve();
            },
        },
    ]);
}
// digging has no documented worker action, so while the player is in a mine
// treat any non-polling worker response as activity for the live refresh
const POLLING_GOS = new Set([
    "getchat",
    "getstats",
    "farmstatus",
    "readycount",
    "notes",
]);
(0, requests_1.registerQueryInterceptor)([
    noopState,
    {
        match: [page_1.Page.WORKER, new URLSearchParams()],
        callback: (_state, _previous, response) => {
            var _a;
            const key = getLocationKey();
            if (key === null || key === void 0 ? void 0 : key.startsWith("mining:")) {
                const [, query] = (0, requests_1.parseUrl)(response.url);
                if (!POLLING_GOS.has((_a = query.get("go")) !== null && _a !== void 0 ? _a : "")) {
                    markCapTrackerActive();
                    // the board repaints the discovered cell just after the response
                    setTimeout(() => {
                        learnFromMiningPage(key);
                        scheduleRender();
                    }, 400);
                }
            }
            return Promise.resolve();
        },
    },
]);
// quick sell / give / craft change inventory through the item page's own
// buttons rather than the worker actions above, so those clicks would otherwise
// leave the tracker stale. one delegated listener schedules the same throttled
// refresh for all three: it catches a direct click on the native button, and
// the quickSellSafely / perkManagement proxies each click through to that same
// native button, so their proxied clicks bubble here too.
const QUICK_ACTION_SELECTOR = ".quicksellbtn, .quicksellbtnnc, .quickgivebtn, .quickcraftbtn";
document.addEventListener("click", (event) => {
    var _a;
    const target = event.target;
    if ((_a = target === null || target === void 0 ? void 0 : target.closest) === null || _a === void 0 ? void 0 : _a.call(target, QUICK_ACTION_SELECTOR)) {
        markCapTrackerActive();
    }
}, true);
const renderInventoryCapWarnings = () => {
    const root = (0, page_1.getCurrentPage)();
    if (!root) {
        return;
    }
    const result = collectCapItems(root);
    if (!result) {
        return;
    }
    const { cap } = result;
    let atCap = 0;
    let nearCap = 0;
    for (const row of root.querySelectorAll(".list-group li")) {
        if (row.classList.contains("item-divider")) {
            continue;
        }
        const after = row.querySelector(".item-after");
        if (!after) {
            continue;
        }
        const count = (0, inventory_1.getRowCount)(after);
        if (Number.isNaN(count) || count === 0) {
            continue;
        }
        const isAtCap = count >= cap;
        const isNearCap = !isAtCap && count >= cap * NEAR_CAP_RATIO;
        if (isAtCap) {
            atCap += 1;
        }
        else if (isNearCap) {
            nearCap += 1;
        }
        else {
            continue;
        }
        if (after.querySelector(".fh-cap-badge")) {
            continue;
        }
        const badge = document.createElement("span");
        badge.classList.add("fh-cap-badge");
        badge.style.fontWeight = "bold";
        badge.style.marginLeft = "5px";
        badge.style.color = isAtCap ? theme_1.TEXT_ERROR : theme_1.TEXT_WARNING;
        badge.textContent = isAtCap ? "MAX" : "NEAR";
        after.append(badge);
    }
    const parts = [];
    if (atCap > 0) {
        const plural = atCap === 1 ? "" : "s";
        parts.push(`${atCap} item${plural} at the ${cap.toLocaleString()} cap`);
    }
    if (nearCap > 0) {
        parts.push(`${nearCap} near cap`);
    }
    let summary = root.querySelector(".fh-cap-summary");
    const list = root.querySelector(".list-group");
    if (!summary && (list === null || list === void 0 ? void 0 : list.parentElement) && parts.length > 0) {
        summary = document.createElement("div");
        summary.classList.add("fh-cap-summary");
        summary.style.padding = "8px 15px";
        summary.style.fontWeight = "bold";
        summary.style.color = theme_1.TEXT_WARNING;
        list.parentElement.insertBefore(summary, list);
    }
    if (summary) {
        const text = parts.length > 0 ? `⚠ ${parts.join(" · ")}` : "";
        if (summary.textContent !== text) {
            summary.textContent = text;
        }
    }
};
exports.inventoryCapWarnings = {
    settings: [SETTING_INVENTORY_CAP_WARNINGS, SETTING_INVENTORY_CAP_TRACKER],
    onPageLoad: (settings) => {
        const isInventory = isInventoryPage();
        if (settings[settings_1.SettingId.INVENTORY_CAP_WARNINGS] && isInventory) {
            renderInventoryCapWarnings();
        }
        isTrackerEnabled = Boolean(settings[settings_1.SettingId.INVENTORY_CAP_TRACKER]);
        if (!isTrackerEnabled) {
            return;
        }
        loadLocationDrops();
        if (isInventory) {
            // refresh tracker data from the live inventory page for free
            const root = (0, page_1.getCurrentPage)();
            if (root) {
                updateFromRoot(root);
            }
        }
        learnCurrentLocation();
        scheduleRender();
        refreshCapTracker();
    },
    // the stats bar lives in the toolbar; re-mount if the game rewrites it
    onQuestLoad: (settings) => {
        if (!settings[settings_1.SettingId.INVENTORY_CAP_TRACKER]) {
            return;
        }
        learnCurrentLocation();
        scheduleRender();
    },
};


/***/ }),

/***/ 9737:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.kitchenNotifications = void 0;
const kitchen_1 = __webpack_require__(202);
const notifications_1 = __webpack_require__(6783);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const requests_1 = __webpack_require__(3300);
const SETTING_COMPLETE_NOTIFICATIONS = {
    id: settings_1.SettingId.KITCHEN_COMPLETE_NOTIFICATIONS,
    title: "Kitchen: Meals ready notification",
    description: `
    Show notification when meals are ready to collect
  `,
    type: "boolean",
    defaultValue: true,
};
const SETTING_ATTENTION_NOTIFICATIONS = {
    id: settings_1.SettingId.ATTENTION_NOTIFICATIONS,
    title: "Kitchen: Ovens attention notification",
    description: `
    Show notification when ovens need attention
  `,
    type: "boolean",
    defaultValue: true,
};
const SETTING_ATTENTION_VERBOSE = {
    id: settings_1.SettingId.ATTENTION_NOTIFICATIONS_VERBOSE,
    title: "Kitchen: Ovens attention notification (all actions)",
    description: `
    Show notifications when any oven needs attention for any action
    (normally only shows when all three actions are available for all ovens)
  `,
    type: "boolean",
    defaultValue: false,
};
const SETTING_EMPTY_NOTIFICATIONS = {
    id: settings_1.SettingId.KITCHEN_EMPTY_NOTIFICATIONS,
    title: "Kitchen: Ovens empty notification",
    description: `
    Show notification when ovens are empty
  `,
    type: "boolean",
    defaultValue: true,
};
(0, notifications_1.registerNotificationHandler)(notifications_1.Handler.COLLECT_MEALS, kitchen_1.collectAll);
// timestamp of the last kitchen page check for oven ownership
let lastOvenCountCheckAt = 0;
const renderOvens = (settings, state) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!state) {
        return;
    }
    if (state.status === kitchen_1.OvenStatus.EMPTY &&
        settings[settings_1.SettingId.KITCHEN_EMPTY_NOTIFICATIONS]) {
        // zero ovens means the kitchen isn't unlocked yet, so there is nothing to
        // cook; confirm against the kitchen page (throttled) before notifying
        let hasOvens = ((_a = state.count) !== null && _a !== void 0 ? _a : 0) > 0;
        if (!hasOvens && Date.now() - lastOvenCountCheckAt > 5 * 60 * 1000) {
            lastOvenCountCheckAt = Date.now();
            const kitchenState = yield kitchen_1.kitchenStatusState.get();
            hasOvens = Boolean(kitchenState && ((_b = kitchenState.count) !== null && _b !== void 0 ? _b : 0) > 0);
        }
        if (!hasOvens) {
            (0, notifications_1.removeNotification)(notifications_1.NotificationId.OVEN);
            return;
        }
        (0, notifications_1.sendNotification)({
            class: "btnorange",
            id: notifications_1.NotificationId.OVEN,
            text: "Ovens are empty!",
            href: (0, requests_1.toUrl)(page_1.Page.KITCHEN, new URLSearchParams()),
            excludePages: [page_1.Page.KITCHEN],
        });
    }
    else if (state.status === kitchen_1.OvenStatus.ATTENTION &&
        settings[settings_1.SettingId.ATTENTION_NOTIFICATIONS]) {
        // This re-read the state it had just been handed, from inside that state's
        // own update listener, to decide something the condition above has already
        // decided: the test was `settings[ATTENTION_NOTIFICATIONS] || allReady`
        // inside a branch that requires ATTENTION_NOTIFICATIONS, so it was always
        // true. (It reads as an attempt to honour the "all actions" setting, which
        // is a separate matter — see SETTING_ATTENTION_VERBOSE, still unused.)
        (0, notifications_1.sendNotification)({
            class: "btnorange",
            id: notifications_1.NotificationId.OVEN,
            text: "Ovens need attention",
            href: (0, requests_1.toUrl)(page_1.Page.KITCHEN, new URLSearchParams()),
            excludePages: [page_1.Page.KITCHEN],
        });
    }
    else if (state.status === kitchen_1.OvenStatus.READY &&
        settings[settings_1.SettingId.KITCHEN_COMPLETE_NOTIFICATIONS]) {
        (0, notifications_1.sendNotification)({
            class: "btngreen",
            id: notifications_1.NotificationId.OVEN,
            text: "Meals are ready!",
            href: (0, requests_1.toUrl)(page_1.Page.KITCHEN, new URLSearchParams()),
            actions: [
                { text: "View", href: (0, requests_1.toUrl)(page_1.Page.KITCHEN, new URLSearchParams()) },
                {
                    text: "Collect",
                    handler: notifications_1.Handler.COLLECT_MEALS,
                },
            ],
            excludePages: [page_1.Page.KITCHEN],
        });
    }
    else {
        (0, notifications_1.removeNotification)(notifications_1.NotificationId.OVEN);
    }
});
exports.kitchenNotifications = {
    settings: [
        SETTING_COMPLETE_NOTIFICATIONS,
        SETTING_ATTENTION_NOTIFICATIONS,
        SETTING_ATTENTION_VERBOSE,
        SETTING_EMPTY_NOTIFICATIONS,
    ],
    onInitialize: (settings) => {
        kitchen_1.kitchenStatusState.onUpdate((state) => renderOvens(settings, state));
    },
};


/***/ }),

/***/ 7092:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.linkifyQuickCraft = void 0;
const page_1 = __webpack_require__(7952);
const api_1 = __webpack_require__(3413);
exports.linkifyQuickCraft = {
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // make sure we're on the item page
        if (page !== page_1.Page.ITEM) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        const missingIngredientsWrapper = currentPage.querySelector("span[style='color:red']");
        if (!missingIngredientsWrapper) {
            return;
        }
        const missingIngredients = (_a = missingIngredientsWrapper.textContent) === null || _a === void 0 ? void 0 : _a.split(", ");
        missingIngredientsWrapper.textContent = "";
        for (const ingredient of missingIngredients !== null && missingIngredients !== void 0 ? missingIngredients : []) {
            const data = yield api_1.itemDataState.get({ query: ingredient });
            if (!data) {
                console.error(`No data for ${ingredient}`);
                continue;
            }
            const link = document.createElement("a");
            link.dataset.view = ".view-main";
            link.href = `item.php?id=${data.id}`;
            link.textContent = ingredient;
            link.style.color = "red";
            link.style.marginRight = "5px";
            link.style.display = "block";
            missingIngredientsWrapper.append(link);
        }
    }),
};


/***/ }),

/***/ 1028:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.locationAdvisor = void 0;
const craftworks_1 = __webpack_require__(7831);
const craftworks_2 = __webpack_require__(920);
const locationAdvice_1 = __webpack_require__(4764);
const recipes_1 = __webpack_require__(498);
const page_1 = __webpack_require__(7952);
const goals_1 = __webpack_require__(1267);
const api_1 = __webpack_require__(3413);
const inventory_1 = __webpack_require__(4514);
const mastery_1 = __webpack_require__(283);
const focus_1 = __webpack_require__(7167);
const promise_1 = __webpack_require__(6762);
const unlimited_1 = __webpack_require__(4808);
const settings_1 = __webpack_require__(126);
const theme_1 = __webpack_require__(1178);
const SETTING_LOCATION_ADVISOR = {
    id: settings_1.SettingId.LOCATION_ADVISOR,
    title: "Explore: What's here for you",
    description: `
    On explore and fishing pages, show which of your needs drop here and which
    items you are at cap on, whose drops are being discarded
  `,
    type: "boolean",
    defaultValue: true,
};
const CONTAINER_ID = "fh-location-advisor";
const MAX_ROWS = 5;
const formatRate = (rate) => rate >= 100 ? Math.round(rate).toLocaleString() : rate.toFixed(1);
// Built in the game's own list idiom -- media icon, title, right-aligned value
// -- so it reads as part of the page rather than as something bolted on.
const makeRow = (image, title, detail, after, color) => {
    const row = document.createElement("li");
    const content = document.createElement("div");
    content.className = "item-content";
    const media = document.createElement("div");
    media.className = "item-media";
    if (image) {
        const icon = document.createElement("img");
        icon.src = image;
        icon.style.width = "32px";
        media.append(icon);
    }
    const inner = document.createElement("div");
    inner.className = "item-inner";
    const titleElement = document.createElement("div");
    titleElement.className = "item-title";
    titleElement.style.color = color;
    titleElement.textContent = title;
    if (detail) {
        const sub = document.createElement("div");
        sub.style.color = theme_1.TEXT_GRAY;
        sub.style.fontSize = "11px";
        sub.textContent = detail;
        titleElement.append(sub);
    }
    const afterElement = document.createElement("div");
    afterElement.className = "item-after";
    afterElement.textContent = after;
    inner.append(titleElement, afterElement);
    content.append(media, inner);
    row.append(content);
    return row;
};
const render = (currentPage, settings) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    const locations = yield (0, api_1.getLocationEntries)();
    // The navbar holds the name — "Mount Banon&nbsp;<a …>info</a>" — so take its
    // leading text node, which excludes the info link's own label. The header
    // picture is the fallback; it costs nothing, since buddy.farm's search index
    // already carries an image per location, but it cannot separate places that
    // share one (pond.png is both Small Pond and Farm Pond).
    const centre = document.querySelector(".navbar-on-center .center");
    const title = (_f = (_d = (_c = (_b = [...((_a = centre === null || centre === void 0 ? void 0 : centre.childNodes) !== null && _a !== void 0 ? _a : [])]
        .find((node) => node.nodeType === Node.TEXT_NODE)) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : (_e = centre === null || centre === void 0 ? void 0 : centre.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "";
    const header = currentPage.querySelector("img[src*='/img/items/']");
    const name = (_g = (0, locationAdvice_1.matchLocationName)(title, locations.map((entry) => entry.name))) !== null && _g !== void 0 ? _g : (header
        ? (0, locationAdvice_1.matchLocationByImage)((_h = header.getAttribute("src")) !== null && _h !== void 0 ? _h : "", locations)
        : undefined);
    if (!name) {
        console.debug("[Farmhand] could not identify location from", {
            image: header === null || header === void 0 ? void 0 : header.getAttribute("src"),
            title,
        });
        return;
    }
    let location = yield (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: name }));
    // Entries cached by a build that predates drop tables carry no `drops`, and
    // the cache lives a week, so without this the advisor stays silently dead
    // until it expires. Refetch once when the shape is old.
    if (location && !location.drops) {
        location = yield (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: name, ignoreCache: true }));
    }
    if (!((_j = location === null || location === void 0 ? void 0 : location.drops) === null || _j === void 0 ? void 0 : _j.length)) {
        console.debug("[Farmhand] no drop data for location", name, location);
        return;
    }
    const unlimited = (0, unlimited_1.parseUnlimitedItems)(String((_k = settings[settings_1.SettingId.UNLIMITED_ITEMS]) !== null && _k !== void 0 ? _k : ""));
    // Everything here is cached or local. Quests are deliberately left out: this
    // page is clicked over and over, and costing them means fetching quests.php
    // each time, which the briefing panel already does on demand.
    const [snapshot, craftworks, mastery, goals] = yield Promise.all([
        (0, promise_1.orUndefined)(inventory_1.inventoryState.get()),
        (0, promise_1.orUndefined)(craftworks_2.craftworksState.get({ doNotFetch: true })),
        (0, promise_1.orUndefined)(mastery_1.masteryState.get({ doNotFetch: true })),
        (0, goals_1.getGoals)(),
    ]);
    const inventory = (_l = snapshot === null || snapshot === void 0 ? void 0 : snapshot.quantities) !== null && _l !== void 0 ? _l : {};
    const cap = snapshot === null || snapshot === void 0 ? void 0 : snapshot.cap;
    const advice = craftworks
        ? (0, craftworks_1.adviseOnSlots)(craftworks.slots, cap, unlimited)
        : undefined;
    const blockers = (_m = advice === null || advice === void 0 ? void 0 : advice.roots) !== null && _m !== void 0 ? _m : [];
    const graph = yield (0, recipes_1.gatherRecipeGraph)([
        ...goals.map((goal) => goal.name),
        ...blockers.map((blocker) => blocker.name),
    ]);
    const reasons = new Map();
    const goalMissing = goals.map((goal) => {
        var _a, _b;
        const progress = (0, goals_1.getGoalProgress)(graph, goal, inventory, unlimited, (_a = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _a !== void 0 ? _a : []);
        for (const entry of progress.missing) {
            reasons.set(entry.name, [
                ...((_b = reasons.get(entry.name)) !== null && _b !== void 0 ? _b : []),
                `for ${goal.name}`,
            ]);
        }
        return progress.missing;
    });
    for (const blocker of blockers) {
        reasons.set(blocker.name, [
            ...((_o = reasons.get(blocker.name)) !== null && _o !== void 0 ? _o : []),
            `blocks ${blocker.slots.map((slot) => slot.name).join(", ")}`,
        ]);
    }
    const { needed, wasted } = (0, locationAdvice_1.getLocationAdvice)(location.drops, (0, focus_1.mergeMissing)(...goalMissing, blockers.map((blocker) => ({ name: blocker.name, quantity: 1 }))), reasons, inventory, cap, (_p = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _p !== void 0 ? _p : []);
    if (needed.length === 0 && wasted.length === 0) {
        console.debug("[Farmhand] nothing to report here", {
            atCap: Object.entries(inventory).filter(([, count]) => cap !== undefined && count >= cap).length,
            blockers: blockers.length,
            cap,
            drops: location.drops.length,
            goals: goals.length,
            location: name,
        });
        return;
    }
    // the page gives the banked figure its own element; the text form is the
    // fallback for anywhere that does not
    const staminaText = (_r = (_q = currentPage.querySelector("#stamina")) === null || _q === void 0 ? void 0 : _q.textContent) !== null && _r !== void 0 ? _r : "";
    const stamina = Number(staminaText.replaceAll(",", "").trim()) ||
        (0, locationAdvice_1.parseStamina)((_s = currentPage.textContent) !== null && _s !== void 0 ? _s : "");
    // mirror the page's own card > card-content > list-block > ul nesting so this
    // sits in the layout rather than on top of it
    const block = document.createElement("div");
    block.className = "card";
    block.id = CONTAINER_ID;
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    const listBlock = document.createElement("div");
    listBlock.className = "list-block disable-select";
    const list = document.createElement("ul");
    listBlock.append(list);
    cardContent.append(listBlock);
    block.append(cardContent);
    for (const entry of needed.slice(0, MAX_ROWS)) {
        // an estimate you cannot afford today is worth saying out loud
        const affordable = stamina === undefined || entry.attempts <= stamina;
        list.append(makeRow(undefined, entry.name, entry.reasons.join(" · "), `1 per ${formatRate(entry.rate)}${entry.quantity > 1
            ? ` · ${Math.round(entry.attempts).toLocaleString()} for ${entry.quantity.toLocaleString()}`
            : ""}`, affordable ? theme_1.TEXT_SUCCESS : theme_1.TEXT_WARNING));
    }
    for (const entry of wasted.slice(0, MAX_ROWS)) {
        list.append(makeRow(undefined, `${entry.name} — at cap, drops discarded`, entry.masteryRemaining
            ? `mastery frozen at ${(_t = entry.masteryValue) === null || _t === void 0 ? void 0 : _t.toLocaleString()}/${(_u = entry.masteryRequired) === null || _u === void 0 ? void 0 : _u.toLocaleString()}`
            : "", entry.count.toLocaleString(), theme_1.TEXT_ERROR));
    }
    const heading = document.createElement("div");
    heading.className = "content-block-title";
    heading.id = `${CONTAINER_ID}-title`;
    heading.textContent = stamina
        ? `Here for you (${stamina.toLocaleString()} stamina)`
        : "Here for you";
    const set = (0, locationAdvice_1.findLocationSet)(name, (_v = craftworks === null || craftworks === void 0 ? void 0 : craftworks.sets) !== null && _v !== void 0 ? _v : [], locations.map((entry) => entry.name));
    if (set && !set.isActive) {
        list.append(makeRow(undefined, `Your “${set.name}” set isn't loaded`, "open the briefing panel's Sets tab to switch", "", theme_1.TEXT_GRAY));
    }
    // sit directly under the Continue / Eat / Drink card
    const actions = (_w = currentPage
        .querySelector("#exploreoptions")) === null || _w === void 0 ? void 0 : _w.closest(".card");
    if (actions) {
        actions.after(heading, block);
    }
    else {
        (_x = currentPage.querySelector(".content-block")) === null || _x === void 0 ? void 0 : _x.append(heading, block);
    }
});
exports.locationAdvisor = {
    settings: [SETTING_LOCATION_ADVISOR],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (page !== page_1.Page.AREA && page !== page_1.Page.FISHING) {
            return;
        }
        if (!settings[settings_1.SettingId.LOCATION_ADVISOR]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        // the explore page rerenders on every click; never stack a second block
        (_a = currentPage.querySelector(`#${CONTAINER_ID}`)) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = currentPage.querySelector(`#${CONTAINER_ID}-title`)) === null || _b === void 0 ? void 0 : _b.remove();
        yield render(currentPage, settings);
    }),
};


/***/ }),

/***/ 8124:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.chatMailboxStats = void 0;
const theme_1 = __webpack_require__(1178);
const userMailboxes_1 = __webpack_require__(4203);
const settings_1 = __webpack_require__(126);
const users_1 = __webpack_require__(5254);
const SETTING_CHAT_MAILBOX_STATS = {
    id: settings_1.SettingId.CHAT_MAILBOX_STATS,
    title: "Chat: Mailbox Size",
    description: "Show mailbox Size next to usernames in chat",
    type: "boolean",
    defaultValue: true,
};
const renderInfoPopup = (userElement, username) => __awaiter(void 0, void 0, void 0, function* () {
    const formatter = new Intl.NumberFormat();
    const user = yield users_1.userState.get({ query: username });
    const mailbox = yield userMailboxes_1.playerMailboxState.get({ query: username });
    if (userElement.dataset.popup !== "open") {
        return;
    }
    // The mailbox page and the profile page are read separately, and either can
    // come back unreadable when the game changes its markup. Rather than showing
    // nothing at all — which looks exactly like a broken hover — show whichever
    // details did load, and say so when none did.
    if (!user && !mailbox) {
        return;
    }
    const wrapper = userElement.parentElement;
    if (!wrapper) {
        return;
    }
    wrapper.style.position = "relative";
    const infoPopup = document.createElement("div");
    infoPopup.classList.add("fh-mailbox-info");
    infoPopup.style.display = "flex";
    infoPopup.style.flexDirection = "column";
    infoPopup.style.alignItems = "start";
    infoPopup.style.gap = "5px";
    infoPopup.style.padding = "5px";
    infoPopup.style.position = "absolute";
    infoPopup.style.backgroundColor = theme_1.BACKGROUND_DARK;
    infoPopup.style.borderWidth = "1px";
    infoPopup.style.borderStyle = "solid";
    infoPopup.style.borderColor = theme_1.BORDER_GRAY;
    infoPopup.style.top = "15px";
    infoPopup.style.left = "0px";
    infoPopup.style.zIndex = "9999";
    infoPopup.style.width = "200px";
    infoPopup.style.fontWeight = "normal";
    infoPopup.style.whiteSpace = "normal";
    infoPopup.style.pointerEvents = "none";
    const rows = [];
    if ((mailbox === null || mailbox === void 0 ? void 0 : mailbox.capacity) !== undefined) {
        rows.push(["Mailbox", formatter.format(mailbox.capacity)]);
    }
    if (mailbox === null || mailbox === void 0 ? void 0 : mailbox.lookingFor) {
        rows.push(["Looking For", mailbox.lookingFor]);
    }
    if (user === null || user === void 0 ? void 0 : user.bio) {
        rows.push(["Bio", user.bio]);
    }
    if (rows.length === 0) {
        rows.push(["No details", "this player's profile couldn't be read"]);
    }
    for (const [label, value] of rows) {
        const row = document.createElement("div");
        const labelElement = document.createElement("strong");
        labelElement.textContent = `${label}: `;
        row.append(labelElement);
        // as text, not markup — bios and Looking For are written by players
        row.append(document.createTextNode(value));
        infoPopup.append(row);
    }
    userElement.after(infoPopup);
});
const openInfoPopup = (userElement) => __awaiter(void 0, void 0, void 0, function* () {
    closeInfoPopups();
    const username = userElement.textContent;
    if (!username) {
        return;
    }
    userElement.classList.add("fh-mailbox-info-loading");
    try {
        yield renderInfoPopup(userElement, username);
    }
    catch (error) {
        // a failed profile or mailbox read used to leave the label stuck on the
        // name, so a hover looked like it was loading forever
        console.error(`Failed to load chat info for ${username}`, error);
    }
    finally {
        userElement.classList.remove("fh-mailbox-info-loading");
    }
});
const closeInfoPopups = () => {
    for (const popup of document.querySelectorAll(".fh-mailbox-info")) {
        popup.remove();
    }
};
exports.chatMailboxStats = {
    settings: [SETTING_CHAT_MAILBOX_STATS],
    onInitialize: (settings) => {
        if (!settings[settings_1.SettingId.CHAT_MAILBOX_STATS]) {
            return;
        }
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          .chip-label {
            overflow: visible !important;
          }
          .fh-mailbox-info-loading::before {
            content: "(loading...) ";
            font-size: 10px;
            color: white;
          }
        </style>
      `);
    },
    onChatLoad: (settings) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.CHAT_MAILBOX_STATS]) {
            return;
        }
        const users = document.querySelectorAll(`.chip a[href^='profile.php']`);
        for (const userElement of users) {
            if (userElement === null || userElement === void 0 ? void 0 : userElement.dataset.initialized) {
                continue;
            }
            // This guard was never armed: nothing set `initialized`, and onChatLoad
            // runs on every mutation of the chat panel — so each new message re-bound
            // all five handlers to every name still on screen. Hovering an older name
            // then ran the popup once per accumulated copy, and each touch queued
            // another long-press timer.
            userElement.dataset.initialized = "true";
            userElement.addEventListener("mouseover", () => {
                userElement.dataset.popup = "open";
                openInfoPopup(userElement);
            });
            let timer;
            userElement.addEventListener("touchstart", () => {
                userElement.dataset.popup = "open";
                timer = setTimeout(() => {
                    openInfoPopup(userElement);
                    userElement.dataset.ignoreClick = "true";
                }, 500);
            });
            userElement.addEventListener("touchend", () => {
                clearTimeout(timer);
            });
            userElement.addEventListener("mouseout", () => {
                userElement.dataset.popup = "closed";
                closeInfoPopups();
            });
            userElement.addEventListener("click", (event) => {
                if (userElement.dataset.ignoreClick) {
                    event.preventDefault();
                    delete userElement.dataset.ignoreClick;
                }
            });
            userElement.addEventListener("contextmenu", (event) => {
                if (userElement.dataset.ignoreClick) {
                    event.preventDefault();
                    delete userElement.dataset.ignoreClick;
                }
            });
        }
    },
};


/***/ }),

/***/ 6297:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mailboxNotifications = void 0;
const mail_1 = __webpack_require__(8955);
const notifications_1 = __webpack_require__(6783);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3300);
(0, notifications_1.registerNotificationHandler)(notifications_1.Handler.COLLECT_MAIL, mail_1.collectMailbox);
const renderNotification = (state) => __awaiter(void 0, void 0, void 0, function* () {
    state = state !== null && state !== void 0 ? state : (yield mail_1.mailboxState.get());
    if (!state) {
        return;
    }
    let mailboxCount = 0;
    for (const mail of state.contents) {
        mailboxCount += mail.count;
    }
    if (!state || state.contents.length === 0) {
        (0, notifications_1.removeNotification)(notifications_1.NotificationId.MAILBOX);
        return;
    }
    (0, notifications_1.sendNotification)({
        class: "btnpurple",
        id: notifications_1.NotificationId.MAILBOX,
        text: `Mailbox is ready! (${mailboxCount} / ${state.size})`,
        href: (0, requests_1.toUrl)(page_1.Page.POST_OFFICE),
        replacesHref: `${page_1.Page.POST_OFFICE}.php`,
        actions: [
            {
                text: "View",
                href: (0, requests_1.toUrl)(page_1.Page.POST_OFFICE),
            },
            {
                text: "Collect",
                handler: notifications_1.Handler.COLLECT_MAIL,
            },
        ],
        excludePages: [page_1.Page.POST_OFFICE],
    });
});
exports.mailboxNotifications = {
    onInitialize: () => {
        mail_1.mailboxState.onUpdate((state) => renderNotification(state));
    },
    onNotificationLoad: () => {
        const mailboxNotification = document.querySelector(`a[href="${page_1.Page.POST_OFFICE}.php"].button.btnpurple`);
        if (mailboxNotification) {
            renderNotification();
        }
    },
};


/***/ }),

/***/ 9735:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.maxContainers = void 0;
const debounce_1 = __webpack_require__(4276);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_MAX_CONTAINERS = {
    id: settings_1.SettingId.MAX_CONTAINERS,
    title: "Locksmith: Max containers",
    description: "Open max containers by default (instead of 1)",
    type: "boolean",
    defaultValue: true,
};
exports.maxContainers = {
    settings: [SETTING_MAX_CONTAINERS],
    onPageLoad: (settings, page) => {
        if (!settings[settings_1.SettingId.MAX_CONTAINERS]) {
            return;
        }
        if (page !== page_1.Page.LOCKSMITH) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        const observer = new MutationObserver((0, debounce_1.debounce)(() => {
            // get inputs
            const inputs = document.querySelectorAll("input.qty[type='number']");
            // if we only have 1 input, we can't be sure whether the user or the app changed it
            if (inputs.length <= 1) {
                return;
            }
            // if any of them are not 1, the app didn't do it
            if ([...inputs].some((input) => ["0", "1"].includes(input.value))) {
                return;
            }
            // get buttons
            const buttons = document.querySelectorAll("button.lsmaxqty");
            for (const button of buttons) {
                button.click();
            }
        }));
        observer.observe(currentPage, { childList: true, subtree: true });
    },
};


/***/ }),

/***/ 1103:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.maxCows = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
exports.maxCows = {
    onPageLoad: (settings, page) => {
        if (page !== page_1.Page.PASTURE) {
            return;
        }
        if (!settings[settings_1.SettingId.MAX_ANIMALS]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        // max buy cows
        (() => {
            var _a;
            const pigTitle = (0, page_1.getTitle)(/Cows/);
            const match = (_a = pigTitle === null || pigTitle === void 0 ? void 0 : pigTitle.textContent) === null || _a === void 0 ? void 0 : _a.match(/(\d+) \/ (\d+)/);
            if (!match) {
                return;
            }
            const [_, current, max] = match;
            if (!current || !max) {
                return;
            }
            const maxBuy = Number(max) - Number(current);
            const buyField = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(".addamt");
            if (!buyField) {
                return;
            }
            buyField.value = maxBuy.toString();
        })();
        // max slaughter
        (() => {
            var _a;
            const slaughterSelector = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(".levelid");
            if (!slaughterSelector) {
                return;
            }
            if (slaughterSelector.options.length > 1) {
                slaughterSelector.selectedIndex = 1;
            }
            const match = (_a = slaughterSelector.options[1].textContent) === null || _a === void 0 ? void 0 : _a.match(/\((\d+)\)/);
            if (!match) {
                return;
            }
            const maxSlaughter = Number(match[1]);
            const amountField = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(".levelamt");
            if (!amountField) {
                return;
            }
            amountField.value = maxSlaughter.toString();
        })();
    },
};


/***/ }),

/***/ 2934:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.maxPigs = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_MAX_ANIMALS = {
    id: settings_1.SettingId.MAX_ANIMALS,
    title: "Farm: Buy Max Animals",
    description: "Buy max animals by default (instead of 1)",
    type: "boolean",
    defaultValue: true,
};
exports.maxPigs = {
    settings: [SETTING_MAX_ANIMALS],
    onPageLoad: (settings, page) => {
        if (page !== page_1.Page.PIG_PEN) {
            return;
        }
        if (!settings[settings_1.SettingId.MAX_ANIMALS]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        // max buy pigs
        (() => {
            var _a;
            const pigTitle = (0, page_1.getTitle)(/Pigs/);
            const match = (_a = pigTitle === null || pigTitle === void 0 ? void 0 : pigTitle.textContent) === null || _a === void 0 ? void 0 : _a.match(/(\d+) \/ (\d+)/);
            if (!match) {
                return;
            }
            const [_, current, max] = match;
            if (!current || !max) {
                return;
            }
            const maxBuy = Number(max) - Number(current);
            const buyField = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(".addamt");
            if (!buyField) {
                return;
            }
            buyField.value = maxBuy.toString();
        })();
        // max slaughter
        (() => {
            var _a;
            const slaughterSelector = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(".levelid");
            if (!slaughterSelector) {
                return;
            }
            if (slaughterSelector.options.length > 1) {
                slaughterSelector.selectedIndex = 1;
            }
            const match = (_a = slaughterSelector.options[1].textContent) === null || _a === void 0 ? void 0 : _a.match(/\((\d+)\)/);
            if (!match) {
                return;
            }
            const maxSlaughter = Number(match[1]);
            const amountField = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(".levelamt");
            if (!amountField) {
                return;
            }
            amountField.value = maxSlaughter.toString();
        })();
    },
};


/***/ }),

/***/ 5792:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mealNotifications = void 0;
const meals_1 = __webpack_require__(2022);
const notifications_1 = __webpack_require__(6783);
const settings_1 = __webpack_require__(126);
const SETTING_MEAL_NOTIFICATIONS = {
    id: settings_1.SettingId.MEAL_NOTIFICATIONS,
    title: "Meal Notifications",
    description: `
    Show notification when meals are active with their countdowns
  `,
    type: "boolean",
    defaultValue: true,
};
let mealInterval;
const renderMeals = () => __awaiter(void 0, void 0, void 0, function* () {
    const mealStatus = yield meals_1.mealsStatusState.get();
    if (!mealStatus || mealStatus.meals.length === 0) {
        clearInterval(mealInterval);
        (0, notifications_1.removeNotification)(notifications_1.NotificationId.MEAL);
        return;
    }
    (0, notifications_1.sendNotification)({
        class: "btnorange",
        id: notifications_1.NotificationId.MEAL,
        text: `${mealStatus.meals.length} meal${mealStatus.meals.length === 1 ? "" : "s"} active: ${mealStatus.meals
            .map((active) => {
            const now = new Date();
            const diffSeconds = active.finishedAt / 1000 - now.getTime() / 1000;
            const minutes = Math.floor(diffSeconds / 60);
            const seconds = Math.floor(diffSeconds % 60);
            if (minutes < 0 && seconds < 0) {
                meals_1.mealsStatusState.set({
                    meals: mealStatus.meals.filter((meal) => meal.meal !== active.meal),
                });
                return `${active.meal} (EXPIRED!)`;
            }
            const timeRemaining = `${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`;
            return `${active.meal} (${timeRemaining})`;
        })
            .join(", ")}`,
    });
    if (!mealInterval) {
        mealInterval = setInterval(renderMeals, 1 * 1000);
    }
});
exports.mealNotifications = {
    settings: [SETTING_MEAL_NOTIFICATIONS],
    onInitialize: (settings) => {
        if (!settings[settings_1.SettingId.MEAL_NOTIFICATIONS]) {
            return;
        }
        meals_1.mealsStatusState.onUpdate(renderMeals);
    },
};


/***/ }),

/***/ 4414:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.miner = void 0;
const theme_1 = __webpack_require__(1178);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_MINER = {
    id: settings_1.SettingId.MINER,
    title: "Mining: Auto Miner",
    description: "Adds button to take the next suggested action",
    type: "boolean",
    defaultValue: true,
};
const SETTING_MINER_EXPLOSIVES = {
    id: settings_1.SettingId.MINER_EXPLOSIVES,
    title: "Mining: Use Explosives",
    description: "Use explosives as suggested action",
    type: "boolean",
    defaultValue: true,
};
const SETTING_MINER_BOMBS = {
    id: settings_1.SettingId.MINER_BOMBS,
    title: "Mining: Use Bombs",
    description: "Use bombs as suggested action",
    type: "boolean",
    defaultValue: false,
};
const getStatus = (cell) => {
    var _a, _b, _c;
    if (!cell.classList.contains("marked")) {
        return "unexplored";
    }
    const icon = cell.firstElementChild;
    if (!icon) {
        return "unknown";
    }
    if (icon.tagName === "IMG") {
        return "discovered";
    }
    if ((_a = icon.getAttribute("style")) === null || _a === void 0 ? void 0 : _a.includes("color:yellow")) {
        return "miss";
    }
    if ((_b = cell.getAttribute("style")) === null || _b === void 0 ? void 0 : _b.includes("background-color:#cc0000;")) {
        return "trap";
    }
    if ((_c = icon.getAttribute("style")) === null || _c === void 0 ? void 0 : _c.includes("color:black")) {
        return "hit";
    }
    if (icon.classList.contains("fa-pickaxe")) {
        return "extra";
    }
    if (icon.classList.contains("fa-sparkles")) {
        return "xp";
    }
    return "unknown";
};
const getCellAt = (board, x, y) => {
    const rowIndex = y - 1;
    if (rowIndex < 0 || rowIndex >= board.length) {
        return undefined;
    }
    const columnIndex = x - 1;
    if (columnIndex < 0 || columnIndex >= board[rowIndex].length) {
        return undefined;
    }
    return board[rowIndex][columnIndex];
};
const fillHints = (board) => {
    const cells = board.flat();
    // mark candidates
    for (const cell of cells) {
        if (cell.status !== "unexplored") {
            cell.isCandidate = false;
            continue;
        }
        let hasDirection = false;
        const left = getCellAt(board, cell.x - 1, cell.y);
        if (left && ["unexplored", "hit"].includes(left.status)) {
            hasDirection = true;
        }
        const right = getCellAt(board, cell.x + 1, cell.y);
        if (right && ["unexplored", "hit"].includes(right.status)) {
            hasDirection = true;
        }
        const up = getCellAt(board, cell.x, cell.y - 1);
        if (up && ["unexplored", "hit"].includes(up.status)) {
            hasDirection = true;
        }
        const down = getCellAt(board, cell.x, cell.y + 1);
        if (down && ["unexplored", "hit"].includes(down.status)) {
            hasDirection = true;
        }
        cell.isCandidate = hasDirection;
    }
    // count candidate directions
    for (const cell of cells) {
        if (!cell.isCandidate) {
            continue;
        }
        let candidateDirectionCount = 0;
        const left = getCellAt(board, cell.x - 1, cell.y);
        if (left === null || left === void 0 ? void 0 : left.isCandidate) {
            candidateDirectionCount++;
        }
        const right = getCellAt(board, cell.x + 1, cell.y);
        if (right === null || right === void 0 ? void 0 : right.isCandidate) {
            candidateDirectionCount++;
        }
        const up = getCellAt(board, cell.x, cell.y - 1);
        if (up === null || up === void 0 ? void 0 : up.isCandidate) {
            candidateDirectionCount++;
        }
        const down = getCellAt(board, cell.x, cell.y + 1);
        if (down === null || down === void 0 ? void 0 : down.isCandidate) {
            candidateDirectionCount++;
        }
        cell.candidateDirectionCount = candidateDirectionCount;
    }
    // mark next to hits
    for (const cell of cells) {
        if (cell.status !== "hit") {
            continue;
        }
        const left = getCellAt(board, cell.x - 1, cell.y);
        const isLeftCandidate = left && left.isCandidate;
        const isLeftHit = left && left.status === "hit";
        const right = getCellAt(board, cell.x + 1, cell.y);
        const isRightCandidate = right && right.isCandidate;
        const isRightHit = right && right.status === "hit";
        const top = getCellAt(board, cell.x, cell.y - 1);
        const isTopCandidate = top && top.isCandidate;
        const isTopHit = top && top.status === "hit";
        const bottom = getCellAt(board, cell.x, cell.y + 1);
        const isBottomCandidate = bottom && bottom.isCandidate;
        const isBottomHit = bottom && bottom.status === "hit";
        if (left && isLeftCandidate) {
            left.isNextToHit = true;
            if (isRightHit) {
                left.isInlineWithHit = true;
            }
        }
        if (right && isRightCandidate) {
            right.isNextToHit = true;
            if (isLeftHit) {
                right.isInlineWithHit = true;
            }
        }
        if (top && isTopCandidate) {
            top.isNextToHit = true;
            if (isBottomHit) {
                top.isInlineWithHit = true;
            }
        }
        if (bottom && isBottomCandidate) {
            bottom.isNextToHit = true;
            if (isTopHit) {
                bottom.isInlineWithHit = true;
            }
        }
    }
};
const tryCell = (cell) => {
    cell.element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
};
exports.miner = {
    settings: [SETTING_MINER, SETTING_MINER_EXPLOSIVES, SETTING_MINER_BOMBS],
    onPageLoad: (settings, page) => {
        if (page !== page_1.Page.MINING) {
            return;
        }
        if (!settings[settings_1.SettingId.MINER]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        const magicButton = document.createElement("div");
        magicButton.style.position = "absolute";
        magicButton.style.right = "20px";
        magicButton.style.bottom = "80px";
        magicButton.style.cursor = "pointer";
        magicButton.style.zIndex = "999999";
        magicButton.style.height = "60px";
        magicButton.style.width = "60px";
        magicButton.style.borderRadius = "100%";
        magicButton.style.backgroundColor = theme_1.BUTTON_GREEN_BACKGROUND;
        magicButton.style.borderWidth = "2px";
        magicButton.style.borderColor = theme_1.BUTTON_GREEN_BORDER;
        magicButton.style.borderStyle = "solid";
        magicButton.style.color = theme_1.TEXT_WHITE;
        magicButton.style.display = "flex";
        magicButton.style.justifyContent = "center";
        magicButton.style.alignItems = "center";
        magicButton.innerHTML = `<i class="fa fa-wand-sparkles fa-2x fa-fw" />`;
        magicButton.addEventListener("click", () => {
            var _a, _b, _c;
            // try again if no attempts left
            const tryAgainButton = currentPage.querySelector(".resetlevelbtn");
            const attemptsLeft = Number((_b = (_a = currentPage.querySelector("#attempts")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "1");
            if (attemptsLeft === 0 && tryAgainButton) {
                tryAgainButton.click();
                return;
            }
            // go to next level if available
            const nextLevelButton = currentPage.querySelector(".nextlevelbtn");
            if (nextLevelButton && nextLevelButton.style.display !== "none") {
                nextLevelButton.click();
                return;
            }
            // use explosives if available
            const explosivesButton = currentPage.querySelector(".useexplosivebtn:not(.disabled)");
            if (explosivesButton) {
                explosivesButton.click();
                return;
            }
            // otherwise use pickaxe
            const picks = currentPage.querySelector("#pickaxes");
            if (!picks) {
                return;
            }
            const pickCount = Number(((_c = picks.textContent) === null || _c === void 0 ? void 0 : _c.trim().replaceAll(",", "")) || "0");
            // no picks, make more
            if (!pickCount) {
                picks.click();
            }
            // get boared state
            const board = [];
            const cells = currentPage.querySelectorAll(".checkCell");
            const size = Math.sqrt(cells.length);
            for (let rowIndex = 0; rowIndex < size; rowIndex++) {
                board.push([]);
                for (let columnIndex = 0; columnIndex < size; columnIndex++) {
                    const cell = cells[rowIndex * size + columnIndex];
                    board[rowIndex].push({
                        element: cell,
                        isMarked: cell.classList.contains("marked"),
                        x: Number(cell.dataset.x),
                        y: Number(cell.dataset.y),
                        status: getStatus(cell),
                    });
                }
            }
            // fill in deductions
            fillHints(board);
            // get candidates
            const candidates = board.flat().filter((cell) => cell.isCandidate);
            // get inline with hits first
            const inlineWithHits = candidates.filter((cell) => cell.isInlineWithHit);
            // if there are any, click the first one
            if (inlineWithHits.length > 0) {
                tryCell(inlineWithHits[0]);
                return;
            }
            // get candidates next to hits
            const nextToHits = candidates.filter((cell) => cell.isNextToHit);
            // if there are any, click the first one
            if (nextToHits.length > 0) {
                tryCell(nextToHits[0]);
                return;
            }
            // click the most promising candidate
            const first4DirectionCandidate = candidates.find((cell) => cell.candidateDirectionCount === 4);
            if (first4DirectionCandidate) {
                tryCell(first4DirectionCandidate);
                return;
            }
            const first3DirectionCandidate = candidates.find((cell) => cell.candidateDirectionCount === 3);
            if (first3DirectionCandidate) {
                tryCell(first3DirectionCandidate);
                return;
            }
            const first2DirectionCandidate = candidates.find((cell) => cell.candidateDirectionCount === 2);
            if (first2DirectionCandidate) {
                tryCell(first2DirectionCandidate);
                return;
            }
            // pick a random 1 direction candidate
            tryCell(candidates[Math.floor(Math.random() * candidates.length) || 0]);
        });
        currentPage.append(magicButton);
    },
};


/***/ }),

/***/ 4417:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.moveUpdateToTop = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_UPDATE_AT_TOP = {
    id: settings_1.SettingId.UPDATE_AT_TOP,
    title: "Home: Move updates to top",
    description: `
    Move the most recent update to the top of the home page and make it hidable
  `,
    type: "boolean",
    defaultValue: true,
};
exports.moveUpdateToTop = {
    settings: [SETTING_UPDATE_AT_TOP],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // make sure we're on the home page
        if (page !== page_1.Page.HOME_PAGE) {
            return;
        }
        // get the recent card and title
        const recentUpdatesCard = (0, page_1.getCardByTitle)("Most Recent Update");
        const recentUpdatesTitle = recentUpdatesCard === null || recentUpdatesCard === void 0 ? void 0 : recentUpdatesCard.previousElementSibling;
        if (!recentUpdatesCard || !recentUpdatesTitle) {
            return;
        }
        // get the latest title
        const latestUpdate = (_a = recentUpdatesCard.querySelector("strong")) === null || _a === void 0 ? void 0 : _a.textContent;
        if (!latestUpdate) {
            return;
        }
        // check if it's newer
        const { latestRead } = yield (0, settings_1.getData)(settings_1.SettingId.UPDATE_AT_TOP, {
            latestRead: "",
        });
        if (latestUpdate === latestRead) {
            return;
        }
        // move to top
        const home = (0, page_1.getCurrentPage)();
        if (!home) {
            return;
        }
        const firstTitle = (0, page_1.getTitle)("Where do you want to go?");
        if (!firstTitle) {
            return;
        }
        firstTitle.before(recentUpdatesTitle);
        firstTitle.before(recentUpdatesCard);
        // add hide button
        let hideButton = recentUpdatesTitle.querySelector(".fh-hide-update");
        if (!hideButton) {
            hideButton = document.createElement("a");
            hideButton.classList.add("fh-hide-update");
            hideButton.style.marginLeft = "10px";
            hideButton.style.cursor = "pointer";
            hideButton.textContent = "Hide";
            hideButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                // mark current as read
                yield (0, settings_1.setData)(settings_1.SettingId.UPDATE_AT_TOP, { latestRead: latestUpdate });
                window.location.reload();
            }));
            recentUpdatesTitle.append(hideButton);
        }
    }),
};


/***/ }),

/***/ 3008:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderPerkIndicator = void 0;
const perks_1 = __webpack_require__(5543);
const settings_1 = __webpack_require__(126);
// A small "● Crafting" pill in the bottom stats bar, right of the currency
// counts and the cap tracker, showing which perk set is equipped right now.
//
// It replaces the old "…perks activated" notification banner, which was
// inserted into the page's own content — so it shoved everything below it down,
// including the button under your finger on a quick-sell — and which announced
// an *intent* to switch rather than a switch that happened (it was sent
// unconditionally, so during the cache-drift bug it claimed "Selling perks
// activated" while the sale rolled under Default). This reads the live switch
// state instead, so it can only say Crafting once the game has really been
// driven there.
//
// The bottom bar is the one placement in this game that has survived testing:
// mid-screen right and top collide with the chat panel, bottom-left is the
// game's own help tracker, and the left nav never rendered.
const INDICATOR_ID = "fh-perk-indicator";
// gray for the resting/default set, orange for an activity set that's on
const COLOR_RESTING = "#9e9e9e";
const COLOR_ACTIVE = "#f0932b";
const isRestingSet = (name) => name.trim().toLowerCase() === "default";
// The game boots with <body class="f7-booting"> and only clears it in
// index-app.js, on the line right after `new Framework7()` and its addView()
// calls — the same line that sets window.farmAppReady. Adding our own elements
// to the page inside that window is what took the whole game down in 1.0.68:
// the game's init threw, farmAppReady stayed false, and its boot handler then
// swallowed every click on the page.
//
// So we wait. This is also why the cap tracker has never caused trouble in this
// same bar — its data arrives from a fetch, so it always mounts well after boot.
// Nothing here is on a critical path; being a moment late costs nothing.
const isGameBooted = () => !document.body.classList.contains("f7-booting");
const BOOT_POLL_MS = 250;
const BOOT_POLL_LIMIT = 40; // ~10s, then give up until the next page load
let bootPollsLeft = BOOT_POLL_LIMIT;
let bootPoll;
// The pill shares the stats bar with the cap tracker, and both simply append
// themselves — so which one ends up on the left came down to who mounted first.
// The tracker waits on an inventory fetch, so on a cold load we win the race and
// sit left of it; on a reload with cached data it wins and we sit right. Rather
// than depend on that timing, we keep "last child" as a maintained property: fix
// the position on every render, and watch the bar so a later arrival (the
// tracker mounting, or the game rewriting the toolbar) is corrected at once.
const keepRightmost = (statsZone, pill) => {
    if (statsZone.lastElementChild !== pill) {
        statsZone.append(pill);
    }
};
let observedStatsZone;
let orderObserver;
const watchOrder = (statsZone) => {
    // the game rebuilds the toolbar as you navigate, so re-observe when the bar
    // we're watching is no longer the one on screen
    if (observedStatsZone === statsZone) {
        return;
    }
    orderObserver === null || orderObserver === void 0 ? void 0 : orderObserver.disconnect();
    orderObserver = new MutationObserver(() => {
        const pill = document.querySelector(`#${INDICATOR_ID}`);
        // only ever move ourselves, and only while we're actually in this bar —
        // if the game dropped the pill, the next render remounts it
        if ((pill === null || pill === void 0 ? void 0 : pill.parentElement) === statsZone) {
            keepRightmost(statsZone, pill);
        }
    });
    // childList only: this fires when something is added to or removed from the
    // bar, and our own move settles on the next callback (we're last, so no-op)
    orderObserver.observe(statsZone, { childList: true });
    observedStatsZone = statsZone;
};
const buildIndicator = () => {
    const pill = document.createElement("span");
    pill.id = INDICATOR_ID;
    pill.style.display = "inline-flex";
    pill.style.alignItems = "center";
    pill.style.gap = "4px";
    pill.style.marginLeft = "10px";
    pill.style.verticalAlign = "middle";
    pill.style.fontSize = "11px";
    pill.style.whiteSpace = "nowrap";
    const dot = document.createElement("span");
    dot.dataset.fhRole = "dot";
    dot.style.width = "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "50%";
    dot.style.flexShrink = "0";
    pill.append(dot);
    const label = document.createElement("span");
    label.dataset.fhRole = "label";
    pill.append(label);
    return pill;
};
const renderPerkIndicator = () => __awaiter(void 0, void 0, void 0, function* () {
    // never touch the DOM while the game is still initializing (see isGameBooted)
    if (!isGameBooted()) {
        if (!bootPoll && bootPollsLeft > 0) {
            bootPollsLeft -= 1;
            bootPoll = setTimeout(() => {
                bootPoll = undefined;
                (0, exports.renderPerkIndicator)().catch((error) => {
                    console.error("Failed to render perk indicator", error);
                });
            }, BOOT_POLL_MS);
        }
        return;
    }
    bootPollsLeft = BOOT_POLL_LIMIT;
    // Read everything asynchronous FIRST. Past this point the function is
    // synchronous, which is what keeps it single-mount: renders are triggered
    // from several places at once (page load, quest load, every switch), and when
    // an await sat between "is there a pill?" and "append one" two of them could
    // interleave, both see none, and both mount one — two pills side by side.
    const settings = yield (0, settings_1.getSettingValues)();
    const status = (0, perks_1.getPerkStatus)();
    const statsZone = document.querySelector("#statszone_main");
    if (!statsZone) {
        return;
    }
    // sweep any strays from that race before deciding what to draw
    const [pillElement, ...duplicates] = document.querySelectorAll(`#${INDICATOR_ID}`);
    for (const duplicate of duplicates) {
        duplicate.remove();
    }
    let pill = pillElement;
    if (!settings[settings_1.SettingId.PERK_MANAGER] || !status.name) {
        pill === null || pill === void 0 ? void 0 : pill.remove();
        return;
    }
    // mount once and reuse, exactly like the cap tracker in this same bar. The
    // game rebuilds the toolbar as you navigate, so re-attach an orphaned pill
    // rather than building a second one
    if (!pill) {
        pill = buildIndicator();
        statsZone.append(pill);
    }
    // stay to the right of the currency counts and the cap tracker, whichever
    // order we happened to mount in (also re-attaches an orphaned pill)
    keepRightmost(statsZone, pill);
    watchOrder(statsZone);
    const signature = `${status.name}|${status.isPending}|${status.isConfirmed}`;
    if (pill.dataset.fhSignature === signature) {
        return;
    }
    pill.dataset.fhSignature = signature;
    const color = isRestingSet(status.name) ? COLOR_RESTING : COLOR_ACTIVE;
    const dot = pill.querySelector("[data-fh-role='dot']");
    const label = pill.querySelector("[data-fh-role='label']");
    if (!dot || !label) {
        return;
    }
    // in flight: hollow dot + faded label, so a real switch is visible while it
    // happens (the settle wait makes it ~1s — long enough to see it land)
    dot.style.backgroundColor = status.isPending ? "transparent" : color;
    dot.style.border = status.isPending ? `1px solid ${color}` : "none";
    label.textContent = status.isPending ? `${status.name}…` : status.name;
    label.style.color = color;
    pill.style.opacity = status.isPending ? "0.6" : "1";
    if (status.isPending) {
        pill.title = `Switching to the ${status.name} perk set…`;
    }
    else if (status.isConfirmed) {
        pill.title = `${status.name} perks equipped`;
    }
    else {
        pill.title = `${status.name} perk set selected (not verified this session)`;
    }
});
exports.renderPerkIndicator = renderPerkIndicator;
// re-render whenever a switch starts or finishes
(0, perks_1.onPerkStatusChange)(() => {
    (0, exports.renderPerkIndicator)().catch((error) => {
        console.error("Failed to render perk indicator", error);
    });
});


/***/ }),

/***/ 682:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.perkManagment = void 0;
const perks_1 = __webpack_require__(5543);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const quickSellSafely_1 = __webpack_require__(8760);
const perkIndicator_1 = __webpack_require__(3008);
const SETTING_PERK_MANAGER = {
    id: settings_1.SettingId.PERK_MANAGER,
    title: "Perks: Auto manage",
    description: `
    1. Save your default perks set as "Default"<br>
    2. Save perks for "Cooking", "Crafting", "Farming", "Fishing", "Exploring", "Mining", "Selling", "Friendship", "Temple", "Locksmith", or "Wheel" activities<br>
    3. Activity perk sets will automatically be enabled for those activities and reverted to "Default" after
  `,
    type: "boolean",
    defaultValue: true,
};
// the temple was identified by data-page "mailitems" when this feature was
// written; newer game versions serve it as temple.php, so accept either
const isTemplePage = (page) => page === page_1.Page.TEMPLE ||
    /\btemple[_a-z]*\.php/.test(window.location.hash || window.location.pathname);
// mining spans the location page (data-page "mining") and the dig board
// (mine.php), which may not share the same page identity
const isMiningPage = (page) => page === page_1.Page.MINING ||
    /\bmin(?:e|ing)\.php/.test(window.location.hash || window.location.pathname);
// Every activity location (explore areas, fishing spots, mines) is served by
// location.php?type=<activity>&id=<n>, and they can share a page identity — so
// matching on the page id alone risks putting Exploring perks on a fishing spot.
// The URL's own type is the authoritative signal, so prefer it where present.
const getLocationType = () => {
    const location = window.location.hash || window.location.pathname;
    if (!/\blocation\.php/.test(location)) {
        return undefined;
    }
    const type = new URLSearchParams(location.split("?")[1]).get("type");
    return type === null || type === void 0 ? void 0 : type.toLowerCase();
};
const isLocationOfType = (...prefixes) => {
    const type = getLocationType();
    return Boolean(type && prefixes.some((prefix) => type.startsWith(prefix)));
};
// the town hub (town.php) — an unknown page to getPage(), so match on the URL.
// including it in the cluster keeps Town perks active while you bounce between
// town buildings via the hub, instead of reverting to Default at the hub and
// re-switching to Town at every building.
const isTownHubPage = () => /\btown\.php/.test(window.location.hash || window.location.pathname);
// town-cluster activities and how to recognize their pages. these are all done
// together in the town area, so they share one "Town" perk set
// (PerkActivity.TOWN) to avoid thrashing between sets; each still falls back to
// its own set when no Town set exists. The Town set now also holds the selling
// perks, so the farmers market belongs here too — the whole town area stays on
// Town, and (via activatePerkSet's guard) only switches once on entry.
const TOWN_CLUSTER = [
    { activity: perks_1.PerkActivity.TOWN, matches: () => isTownHubPage() },
    { activity: perks_1.PerkActivity.TEMPLE, matches: isTemplePage },
    { activity: perks_1.PerkActivity.WHEEL, matches: (page) => page === page_1.Page.WHEEL },
    {
        activity: perks_1.PerkActivity.LOCKSMITH,
        matches: (page) => page === page_1.Page.LOCKSMITH,
    },
    { activity: perks_1.PerkActivity.VAULT, matches: (page) => page === page_1.Page.VAULT },
    // market's own-set fallback is Selling (for anyone without a Town set)
    {
        activity: perks_1.PerkActivity.SELLING,
        matches: (page) => page === page_1.Page.FARMERS_MARKET,
    },
];
// Quick-sell, quick-craft and quick-give all share ONE consolidated perk set,
// so clicking between them never swaps perks — swapping between sets is what
// caused every switch-timing bug in this feature. That set is the one named
// "Crafting"; it holds the selling, crafting and friendship perks together.
const getQuickActionPerks = () => (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.CRAFTING);
// Force the consolidated set active and settle, so its perks are actually
// equipped (not just labelled active) before the caller fires the native action.
// The stats-bar indicator (perkIndicator.ts) shows which set is on throughout —
// it replaced the old "…perks activated" banner, which pushed the page (and the
// button under your finger) down every time it appeared.
//
// GIVE is the exception: the friendship/give perks live in BOTH the Default set
// and the consolidated set, so if either is already equipped there's nothing to
// switch — skip the ~1s activation entirely and let the give fire immediately.
// (Selling and crafting perks are NOT in Default, so those always switch.)
// Sell and craft need no such check: activatePerkSet no-ops instantly via its
// confirmedEquippedSetId fast path when the set is already on.
const activateQuickActionPerks = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (action = "sell") {
    const perks = yield getQuickActionPerks();
    if (!perks) {
        return;
    }
    if (action === "give") {
        const defaultPerks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.DEFAULT);
        const activeId = (0, perks_1.getConfirmedEquippedSetId)();
        const giveAlreadyCovered = activeId !== undefined &&
            (activeId === perks.id || activeId === (defaultPerks === null || defaultPerks === void 0 ? void 0 : defaultPerks.id));
        if (giveAlreadyCovered) {
            return;
        }
    }
    yield (0, perks_1.activatePerkSet)(perks, { force: true, settle: true });
});
// Replace the native quick-craft button with a proxy that activates the
// consolidated set first, then fires the native action and stops — the
// reconciler reverts to Default when you navigate away. No-op if the native
// button is absent or already proxied.
//
// Quick-sell and quick-give are NOT installed here: quickSellSafely.ts already
// proxies both (.quicksellbtn / .quickgivebtn) with lock-safety and runs the
// shared onQuicksellClick callback below, which activates the same consolidated
// set. Installing a second give proxy here was dead code (quickSellSafely runs
// first and wins) and made give's lock-safety silently depend on feature order.
const installQuickActionProxy = (nativeSelector, label) => {
    var _a, _b;
    const nativeButton = (_a = (0, page_1.getCurrentPage)()) === null || _a === void 0 ? void 0 : _a.querySelector(nativeSelector);
    if (!nativeButton || nativeButton.style.display) {
        return;
    }
    nativeButton.style.display = "none";
    const proxyButton = document.createElement("button");
    proxyButton.classList.add("button", "btngreen");
    proxyButton.style.height = "28px;";
    proxyButton.textContent = label;
    proxyButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        yield activateQuickActionPerks();
        nativeButton.click();
    }));
    (_b = nativeButton.parentElement) === null || _b === void 0 ? void 0 : _b.insertBefore(proxyButton, nativeButton);
};
// Quick-sell, registered once at module scope (registering per page-load would
// stack duplicate callbacks). Returning true never blocks the sale; the
// reconciler restores Default when you navigate away.
(0, quickSellSafely_1.onQuicksellClick)((_event, action) => __awaiter(void 0, void 0, void 0, function* () {
    const { value: isEnabled } = yield (0, settings_1.getSetting)(SETTING_PERK_MANAGER);
    if (isEnabled) {
        yield activateQuickActionPerks(action);
    }
    return true;
}));
// Resolves the one activity set the given (live) page calls for, or undefined
// when the page isn't an activity page (→ revert to Default). A page matches at
// most one activity, so the first hit wins; a matched page whose set isn't
// configured falls through to Default, exactly like the old branch table.
const getPageActivation = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const directMatches = [
        { activity: perks_1.PerkActivity.CRAFTING, matches: page === page_1.Page.WORKSHOP },
        // The kitchen and the individual ovens (oven.php?num=N) are one activity —
        // cooking is started and tended from both, and bouncing between the list and
        // an oven shouldn't swap sets. Neither is a resting page, so with no
        // "Cooking" set this resolves to nothing and the perks are simply left as
        // they are, exactly like any other non-activity page.
        {
            activity: perks_1.PerkActivity.COOKING,
            matches: page === page_1.Page.KITCHEN || page === page_1.Page.OVEN,
        },
        // location.php's own type wins over the page id, and is checked first, so a
        // fishing spot can't be mistaken for an explore area (see getLocationType)
        {
            activity: perks_1.PerkActivity.FISHING,
            matches: isLocationOfType("fish") || page === page_1.Page.FISHING,
        },
        {
            activity: perks_1.PerkActivity.MINING,
            matches: isLocationOfType("mine", "mining") || isMiningPage(page),
        },
        {
            activity: perks_1.PerkActivity.EXPLORING,
            matches: isLocationOfType("explore") || page === page_1.Page.AREA,
        },
        // The farm is listed so it's explicit rather than accidental: with a
        // "Farming" set it's used here; without one (farm perks living in Default,
        // the usual setup) this resolves to nothing and the farm falls through to
        // the Default revert below, which is what it needs — the farm page's own
        // Harvest All button is the game's, not ours, so it isn't gated the way the
        // crops-ready notification is and must not run under a stale activity set.
        { activity: perks_1.PerkActivity.FARMING, matches: page === page_1.Page.FARM },
        // the farmers market is handled in TOWN_CLUSTER below: the Town set now
        // holds the selling perks, so the market stays on Town like the rest of
        // the town area (falling back to a Selling set only if no Town set exists)
        {
            activity: perks_1.PerkActivity.FRIENDSHIP,
            matches: page === page_1.Page.FRIENDSHIP || page === page_1.Page.MAILBOX,
        },
    ];
    for (const { activity, matches } of directMatches) {
        if (!matches) {
            continue;
        }
        const set = yield (0, perks_1.getActivityPerksSet)(activity);
        return set ? { activity, set } : undefined;
    }
    // town-cluster page: prefer the shared "Town" set, else the activity's own
    const townSet = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.TOWN);
    for (const { activity, matches } of TOWN_CLUSTER) {
        if (!matches(page)) {
            continue;
        }
        const set = townSet !== null && townSet !== void 0 ? townSet : (yield (0, perks_1.getActivityPerksSet)(activity));
        if (!set) {
            continue;
        }
        return { activity: townSet ? perks_1.PerkActivity.TOWN : activity, set };
    }
    return undefined;
});
// Pages that put perks back to Default. Everywhere else that isn't an activity
// page simply LEAVES THE CURRENT SET ALONE — browsing to an item, your
// inventory, a quest or a profile in the middle of an activity is not a signal
// that you're done with it, and reverting there cost a full switch out and
// another one back when you returned. So an activity set now stays on until you
// actually go somewhere that means "done": home, or the farm.
//
// This is safe because everything that actually spends perks is gated on its
// own set rather than trusting whatever happens to be equipped: harvest and
// replant force the farm perks (withFarmingPerks), quick-sell/craft/give force
// the consolidated set, and the workshop, market, town and activity locations
// are activity pages in their own right. The one exception is the farm page's
// native Harvest All button, which is the game's and not gated by us — which is
// exactly why the farm stays a revert point.
const isRestingPage = (page) => page === page_1.Page.HOME_PAGE || page === page_1.Page.HOME_PATH || page === page_1.Page.FARM;
// The single source of truth for page-scoped perk switching. Resolves the set
// the *live* page calls for (via getPage(), NOT the argument handed to
// onPageLoad) and switches to it, going back to Default on a resting page.
// Idempotent: the SPA fires onPageLoad several times per navigation,
// sometimes with a stale page — the old branch table let one run activate the
// activity set while another fell through and reverted to Default, and whoever
// landed last won, nondeterministically leaving e.g. the market under Default
// (partial sell perks). Keying every run off the same live page makes the
// duplicate runs agree on the same set, so the redundant ones no-op via the
// activatePerkSet guard instead of fighting each other.
// Runs a page-driven switch and leaves a record of how it went, which the
// indicator can show in debug mode. A failed switch was invisible before: the
// switch chain swallows failures to protect the next switch, so there was no way
// to tell a request that failed from a page that was never recognised — and on a
// phone there's no console to check either way.
const switchTo = (set, where) => __awaiter(void 0, void 0, void 0, function* () {
    (0, perks_1.setPerkStatusNote)(`${where} → ${set.name}`);
    try {
        const switched = yield (0, perks_1.activatePerkSet)(set, { settle: true });
        (0, perks_1.setPerkStatusNote)(`${where} → ${set.name}${switched ? "" : " (already on)"}`);
    }
    catch (error) {
        console.error(`Failed to activate the ${set.name} perk set`, error);
        (0, perks_1.setPerkStatusNote)(`${where} → ${set.name} FAILED`);
    }
});
const reconcilePerksForCurrentPage = () => __awaiter(void 0, void 0, void 0, function* () {
    const { value: isEnabled } = yield (0, settings_1.getSetting)(SETTING_PERK_MANAGER);
    if (!isEnabled) {
        return;
    }
    const [page] = (0, page_1.getPage)();
    // `page` is the live page id, or undefined when the page can't be identified
    const where = page !== null && page !== void 0 ? page : "unknown page";
    // don't touch perks on the perks page so you can edit sets freely
    if (page === page_1.Page.PERKS) {
        (0, perks_1.setPerkStatusNote)(`${where}: left alone`);
        return;
    }
    const defaultPerks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.DEFAULT);
    if (!defaultPerks) {
        console.warn("Default perk set not found");
        (0, perks_1.setPerkStatusNote)("no Default set");
        return;
    }
    const activation = yield getPageActivation(page);
    if (activation) {
        yield switchTo(activation.set, where);
        return;
    }
    // Not an activity page, and not a resting one either — you're browsing
    // mid-activity (an item, your inventory, a quest), so leave the perks where
    // they are. This also covers the two cases that used to need their own
    // guards: item pages, where the quick actions manage perks themselves and a
    // revert would fire on top of a just-activated set; and an unidentifiable
    // page (getCurrentPage() momentarily returns null mid-render), which is not a
    // reliable "you've left the activity" signal and once caused the workshop to
    // reset and re-activate Crafting on every single craft.
    if (!isRestingPage(page)) {
        (0, perks_1.setPerkStatusNote)(`${where}: keeping current set`);
        return;
    }
    // back to Default (settle: the game acks the switch before it equips, so
    // without waiting the label flips to Default while the previous set's perks
    // stay on)
    yield switchTo(defaultPerks, where);
});
exports.perkManagment = {
    settings: [SETTING_PERK_MANAGER],
    onPageLoad: (settings) => __awaiter(void 0, void 0, void 0, function* () {
        if (!settings[settings_1.SettingId.PERK_MANAGER]) {
            return;
        }
        // page-scoped perk switching, driven by the live page (idempotent, so the
        // SPA's duplicate onPageLoad calls converge instead of racing)
        yield reconcilePerksForCurrentPage();
        // Mount/refresh the equipped-set indicator AFTER the reconcile, never
        // before: the game rebuilds the bottom bar as you navigate, and the perk
        // state isn't read yet on the very first load, so there'd be nothing to
        // show anyway. When the reconcile switched, the status listener has already
        // drawn it; this covers the no-op case. (renderPerkIndicator waits out the
        // game's own boot on its own — see isGameBooted there.)
        yield (0, perkIndicator_1.renderPerkIndicator)();
        // the quick-craft proxy lives on item pages; skip the workshop, where the
        // reconciler already scopes perks. (quick-sell and quick-give are handled
        // by quickSellSafely.ts — see installQuickActionProxy's note.)
        const [page] = (0, page_1.getPage)();
        if (page !== page_1.Page.WORKSHOP) {
            installQuickActionProxy(".quickcraftbtn", "CRAFT");
        }
    }),
    onQuestLoad: (settings) => __awaiter(void 0, void 0, void 0, function* () {
        if (!settings[settings_1.SettingId.PERK_MANAGER]) {
            return;
        }
        yield (0, perkIndicator_1.renderPerkIndicator)();
    }),
};


/***/ }),

/***/ 8278:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.petNotifications = void 0;
const pets_1 = __webpack_require__(2850);
const notifications_1 = __webpack_require__(6783);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3300);
(0, notifications_1.registerNotificationHandler)(notifications_1.Handler.COLLECT_PETS, pets_1.collectPets);
const renderNotification = (state) => __awaiter(void 0, void 0, void 0, function* () {
    state = state !== null && state !== void 0 ? state : (yield pets_1.petState.get());
    if (!state) {
        return;
    }
    let petCount = 0;
    for (const mail of state) {
        petCount += mail.count;
    }
    if (!state || (state === null || state === void 0 ? void 0 : state.length) === 0) {
        (0, notifications_1.removeNotification)(notifications_1.NotificationId.PETS);
        return;
    }
    (0, notifications_1.sendNotification)({
        class: "btnorange",
        id: notifications_1.NotificationId.PETS,
        text: `Your pets have ${petCount} items ready!`,
        href: (0, requests_1.toUrl)(page_1.Page.PETS),
        replacesHref: `${page_1.Page.PETS}.php?${new URLSearchParams({
            from: "home",
        }).toString()}`,
        actions: [
            {
                text: "View",
                href: (0, requests_1.toUrl)(page_1.Page.PETS),
            },
            {
                text: "Collect",
                handler: notifications_1.Handler.COLLECT_PETS,
            },
        ],
        excludePages: [page_1.Page.PETS],
    });
});
exports.petNotifications = {
    onInitialize: () => {
        pets_1.petState.onUpdate((state) => renderNotification(state));
    },
    onNotificationLoad: () => {
        const petsNotification = document.querySelector(`a[href="${page_1.Page.PETS}.php?from=home"]`);
        if (petsNotification) {
            renderNotification();
        }
    },
};


/***/ }),

/***/ 1768:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.questCollapse = void 0;
const settings_1 = __webpack_require__(126);
const page_1 = __webpack_require__(7952);
const SETTING_QUEST_COLLAPSE = {
    id: settings_1.SettingId.QUEST_COLLAPSE,
    title: "Quest: Global collapse status",
    description: "Remember the quest details collapse status globally instead of per-quest",
    type: "boolean",
    defaultValue: true,
};
exports.questCollapse = {
    settings: [SETTING_QUEST_COLLAPSE],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.QUEST_COLLAPSE]) {
            return;
        }
        // make sure we're on a quest page
        if (page !== page_1.Page.QUEST) {
            return;
        }
        // find accordion item
        const accordion = document.querySelector(".accordion-helprequest");
        if (!accordion) {
            console.error("Item header not found");
            return;
        }
        const isCollapsed = !accordion.classList.contains("accordion-item-expanded");
        const link = accordion.querySelector("a");
        if (!link) {
            return;
        }
        const questCollapse = yield (0, settings_1.getData)(settings_1.SettingId.QUEST_COLLAPSE, {
            questCollapse: true,
        });
        link.addEventListener("click", () => {
            setTimeout(() => {
                (0, settings_1.setData)(settings_1.SettingId.QUEST_COLLAPSE, {
                    questCollapse: !accordion.classList.contains("accordion-item-expanded"),
                });
            }, 500);
        });
        if (isCollapsed && !questCollapse) {
            accordion.classList.add("accordion-item-expanded");
        }
        if (!isCollapsed && questCollapse) {
            accordion.classList.remove("accordion-item-expanded");
        }
    }),
};


/***/ }),

/***/ 9524:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.questTagging = void 0;
const settings_1 = __webpack_require__(126);
const page_1 = __webpack_require__(7952);
const theme_1 = __webpack_require__(1178);
const SETTING_QUEST_TAGGING = {
    id: settings_1.SettingId.QUEST_TAGGING,
    title: "Quest: Tagging",
    description: `Mark requests as high or low priority`,
    type: "boolean",
    defaultValue: true,
};
const renderQuests = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { starred, low } = yield (0, settings_1.getData)(SETTING_QUEST_TAGGING, { starred: [], low: [] });
    const list = (0, page_1.getListByTitle)(/Active Requests/);
    if (!list) {
        return;
    }
    const quests = [];
    for (const element of list.querySelectorAll("li")) {
        const id = (_b = (_a = element
            .querySelector("a")) === null || _a === void 0 ? void 0 : _a.getAttribute("href")) === null || _b === void 0 ? void 0 : _b.split("?id=")[1];
        if (!id) {
            continue;
        }
        const title = ((_c = element.querySelector(".item-title strong")) === null || _c === void 0 ? void 0 : _c.textContent) || "";
        const isLow = low.includes(id);
        const isStarred = starred.includes(id);
        quests.push({ element, id, isLow, isStarred, title });
        const progress = element.querySelector(".progressbar span");
        if (progress) {
            progress.style.backgroundColor = isStarred ? "gold" : "#007aff";
        }
        (_d = element.querySelector(".item-media")) === null || _d === void 0 ? void 0 : _d.setAttribute("style", `
        opacity: ${isLow ? 0.65 : 1};
        filter: grayscale(${isLow ? 100 : 0}%)
      `);
        (_e = element.querySelector(".item-inner")) === null || _e === void 0 ? void 0 : _e.setAttribute("style", `
        opacity: ${isLow ? 0.65 : 1};
        filter: grayscale(${isLow ? 100 : 0}%)
      `);
        element.remove();
        (_f = element.querySelector(".fh-quest-buttons")) === null || _f === void 0 ? void 0 : _f.remove();
        const buttons = document.createElement("div");
        buttons.className = "fh-quest-buttons";
        buttons.style.height = "45px";
        buttons.style.display = "flex";
        buttons.style.flexDirection = "column";
        buttons.style.alignItems = "center";
        buttons.style.justifyContent = "space-between";
        buttons.style.marginRight = "15px";
        const starButton = document.createElement("i");
        starButton.className = "fas fa-fw fa-star";
        starButton.style.color = isStarred ? "gold" : theme_1.TEXT_GRAY;
        starButton.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            if (starred.includes(id)) {
                starred.splice(starred.indexOf(id), 1);
            }
            else {
                starred.push(id);
            }
            yield (0, settings_1.setData)(SETTING_QUEST_TAGGING, { starred, low });
            renderQuests();
        }));
        const lowButton = document.createElement("i");
        lowButton.className = "fas fa-fw fa-chevron-down";
        lowButton.style.color = isLow ? "#007aff" : theme_1.TEXT_GRAY;
        lowButton.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
            event.preventDefault();
            event.stopPropagation();
            if (low.includes(id)) {
                low.splice(low.indexOf(id), 1);
            }
            else {
                low.push(id);
            }
            yield (0, settings_1.setData)(SETTING_QUEST_TAGGING, { starred, low });
            renderQuests();
        }));
        buttons.append(starButton);
        buttons.append(lowButton);
        (_g = element.querySelector(".item-content")) === null || _g === void 0 ? void 0 : _g.prepend(buttons);
    }
    quests.sort((a, b) => {
        if (a.isStarred && !b.isStarred) {
            return -1;
        }
        if (!a.isStarred && b.isStarred) {
            return 1;
        }
        if (a.isLow && !b.isLow) {
            return 1;
        }
        if (!a.isLow && b.isLow) {
            return -1;
        }
        return a.title.localeCompare(b.title);
    });
    for (const quest of quests) {
        list.append(quest.element);
    }
});
exports.questTagging = {
    settings: [SETTING_QUEST_TAGGING],
    onPageLoad: (settings, page) => {
        // make sure setting is enabled
        if (!settings[settings_1.SettingId.QUEST_TAGGING]) {
            return;
        }
        // make sure we're on the quests page
        if (page !== page_1.Page.QUESTS) {
            return;
        }
        // load quests
        renderQuests();
    },
};


/***/ }),

/***/ 3710:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.quests = void 0;
const theme_1 = __webpack_require__(1178);
exports.quests = {
    onInitialize: () => {
        document.head.insertAdjacentHTML("beforeend", `
      <style>
        /* make room for minimize button */
        #statszone > div {
          padding-right: 15px !important;
        }
        /* make line prettier */
        #statszone hr {
          height: 1px;
          background-color: ${theme_1.BORDER_GRAY};
          border: none;
        }
      <style>
    `);
    },
    onQuestLoad: () => {
        var _a;
        const popup = document.querySelector(".aqp");
        if (!popup) {
            return;
        }
        popup.dataset.isMinimized = (_a = popup.dataset.isMinimized) !== null && _a !== void 0 ? _a : "false";
        // skip adding close button if it already exists
        if (popup.querySelector(".fh-minimize")) {
            return;
        }
        const minimizeButton = document.createElement("i");
        minimizeButton.classList.add("fh-minimize");
        minimizeButton.classList.add("fa");
        minimizeButton.classList.add("fw");
        minimizeButton.classList.add("fa-chevron-down");
        minimizeButton.style.position = "absolute";
        minimizeButton.style.top = "10px";
        minimizeButton.style.right = "10px";
        minimizeButton.style.cursor = "pointer";
        minimizeButton.addEventListener("click", () => {
            if (popup.dataset.isMinimized === "true") {
                minimizeButton.classList.remove("fa-chevron-up");
                minimizeButton.classList.add("fa-chevron-down");
                popup.style.top = "auto";
                popup.dataset.isMinimized = "false";
            }
            else {
                minimizeButton.classList.remove("fa-chevron-down");
                minimizeButton.classList.add("fa-chevron-up");
                popup.style.top = "70px";
                popup.dataset.isMinimized = "true";
            }
        });
        popup.append(minimizeButton);
    },
};


/***/ }),

/***/ 8760:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.quicksellSafely = exports.onQuicksellClick = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_QUICKSELL_SAFELY = {
    id: settings_1.SettingId.QUICKSELL_SAFELY,
    title: "Item: Safe Quick Sell",
    description: "If item is locked, also lock the Quick Sell and Quick Give buttons",
    type: "boolean",
    defaultValue: true,
};
const state = {
    onQuicksellClick: [],
};
const onQuicksellClick = (callback) => {
    state.onQuicksellClick.push(callback);
};
exports.onQuicksellClick = onQuicksellClick;
exports.quicksellSafely = {
    settings: [SETTING_QUICKSELL_SAFELY],
    onPageLoad: (settings, page) => {
        var _a, _b, _c, _d, _e, _f;
        // make sure we're on the right page
        if (page !== page_1.Page.ITEM) {
            return;
        }
        const isSafetyOn = settings[settings_1.SettingId.QUICKSELL_SAFELY];
        const lockButton = (_a = (0, page_1.getCurrentPage)()) === null || _a === void 0 ? void 0 : _a.querySelector(".lockbtn");
        const unlockButton = (_b = (0, page_1.getCurrentPage)()) === null || _b === void 0 ? void 0 : _b.querySelector(".unlockbtn");
        const isLocked = unlockButton && !lockButton;
        const quicksellButton = (_c = (0, page_1.getCurrentPage)()) === null || _c === void 0 ? void 0 : _c.querySelector(".quicksellbtn, .quicksellbtnnc");
        if (quicksellButton && !quicksellButton.style.display) {
            quicksellButton.style.display = "none";
            const proxyButton = document.createElement("button");
            proxyButton.classList.add("button");
            proxyButton.classList.add(isSafetyOn && isLocked ? "btnred" : "btngreen");
            proxyButton.style.height = "28px;";
            if (!isSafetyOn || !isLocked) {
                proxyButton.textContent = "SELL";
            }
            if (isSafetyOn && isLocked) {
                const lock = document.createElement("i");
                lock.classList.add("f7-icons");
                lock.style.fontSize = "17px";
                lock.textContent = "unlock_fill";
                proxyButton.append(lock);
            }
            proxyButton.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
                if (isSafetyOn && isLocked) {
                    unlockButton.click();
                    return;
                }
                for (const callback of state.onQuicksellClick) {
                    if (!(yield callback(event, "sell"))) {
                        return;
                    }
                }
                quicksellButton.click();
            }));
            (_d = quicksellButton.parentElement) === null || _d === void 0 ? void 0 : _d.insertBefore(proxyButton, quicksellButton);
        }
        const quickgiveButton = (_e = (0, page_1.getCurrentPage)()) === null || _e === void 0 ? void 0 : _e.querySelector(".quickgivebtn");
        if (quickgiveButton && !quickgiveButton.style.display) {
            quickgiveButton.style.display = "none";
            const proxyButton = document.createElement("button");
            proxyButton.classList.add("button");
            proxyButton.classList.add(isSafetyOn && isLocked ? "btnred" : "btngreen");
            proxyButton.style.height = "28px;";
            if (!isSafetyOn || !isLocked) {
                proxyButton.textContent = "GIVE";
            }
            if (isSafetyOn && isLocked) {
                const lock = document.createElement("i");
                lock.classList.add("f7-icons");
                lock.style.fontSize = "17px";
                lock.textContent = "unlock_fill";
                proxyButton.append(lock);
            }
            proxyButton.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
                if (isSafetyOn && isLocked) {
                    unlockButton.click();
                    return;
                }
                for (const callback of state.onQuicksellClick) {
                    if (!(yield callback(event, "give"))) {
                        return;
                    }
                }
                quickgiveButton.click();
            }));
            (_f = quickgiveButton.parentElement) === null || _f === void 0 ? void 0 : _f.insertBefore(proxyButton, quickgiveButton);
        }
    },
};


/***/ }),

/***/ 3026:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.vaultSolver = void 0;
const vault_1 = __webpack_require__(2279);
const theme_1 = __webpack_require__(1178);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_VAULT_SOLVER = {
    id: settings_1.SettingId.VAULT_SOLVER,
    title: "Vault: Auto Solver",
    description: "Auto-fill solution suggestions in the vault input box",
    type: "boolean",
    defaultValue: true,
};
const generateButton = (digit, currentCode, info) => {
    const digitInfo = info.find((d) => d.digit === digit);
    const currentPosition = currentCode.length;
    let buttonStyles = theme_1.BUTTON_VAULT_GRAY_STYLES;
    if (currentPosition > 4) {
        buttonStyles = theme_1.BUTTON_GRAY_STYLES;
    }
    else if (digitInfo === null || digitInfo === void 0 ? void 0 : digitInfo.correctPositions.includes(currentPosition)) {
        buttonStyles = theme_1.BUTTON_VAULT_BLUE_STYLES;
    }
    else if (digitInfo === null || digitInfo === void 0 ? void 0 : digitInfo.possiblePositions.includes(currentPosition)) {
        buttonStyles = theme_1.BUTTON_VAULT_YELLOW_STYLES;
    }
    return `
    <button
      data-input="${digit}"
      style="${(0, theme_1.toCSS)(buttonStyles)};"
    >${digit}</button>
  `;
};
const renderKeyboard = (input, info) => {
    var _a, _b;
    if (!input) {
        return;
    }
    (_a = document.querySelector(".fh-vault-keyboard")) === null || _a === void 0 ? void 0 : _a.remove();
    const submitButton = document.querySelector(".vcbtn");
    if (!submitButton) {
        return;
    }
    const keyboard = document.createElement("div");
    keyboard.classList.add("fh-vault-keyboard");
    keyboard.style.display = "grid";
    keyboard.style.gridTemplateColumns = "repeat(3, 1fr)";
    keyboard.style.gap = "15px";
    keyboard.style.padding = "15px";
    keyboard.innerHTML = `
    ${generateButton(1, input.value, info)}
    ${generateButton(2, input.value, info)}
    ${generateButton(3, input.value, info)}
    ${generateButton(4, input.value, info)}
    ${generateButton(5, input.value, info)}
    ${generateButton(6, input.value, info)}
    ${generateButton(7, input.value, info)}
    ${generateButton(8, input.value, info)}
    ${generateButton(9, input.value, info)}
    <button data-input="backspace" style="${(0, theme_1.toCSS)(input.value.length === 0 ? theme_1.BUTTON_GRAY_STYLES : theme_1.BUTTON_BLUE_STYLES)};"><i class="fa fa-fw fa-delete-left"></i></button>
    ${generateButton(0, input.value, info)}
    <button data-input="submit" style="${(0, theme_1.toCSS)(input.value.length === 4 ? theme_1.BUTTON_GREEN_STYLES : theme_1.BUTTON_GRAY_STYLES)};">Submit</button>
  `;
    keyboard.addEventListener("click", (event) => {
        const target = event.target;
        if (!target.dataset.input) {
            return;
        }
        if (target.dataset.input === "backspace") {
            input.value = input.value.slice(0, -1);
            renderKeyboard(input, info);
            return;
        }
        if (target.dataset.input === "submit") {
            submitButton.click();
            return;
        }
        input.value += target.dataset.input;
        renderKeyboard(input, info);
    });
    (_b = submitButton.parentElement) === null || _b === void 0 ? void 0 : _b.before(keyboard);
    submitButton.style.display = "none";
};
exports.vaultSolver = {
    settings: [SETTING_VAULT_SOLVER],
    onPageLoad: (settings, page) => {
        var _a;
        if (page !== page_1.Page.VAULT) {
            return;
        }
        if (!settings[settings_1.SettingId.VAULT_SOLVER]) {
            return;
        }
        const currentPage = (0, page_1.getCurrentPage)();
        if (!currentPage) {
            return;
        }
        const input = document.querySelector("#vaultcode");
        input === null || input === void 0 ? void 0 : input.setAttribute("inputmode", "none");
        let info = (0, vault_1.generateDigitInfo)();
        const guessElements = document.querySelectorAll("[data-page='crack'] .row");
        const guesses = [];
        for (const [, guessElement] of guessElements.entries()) {
            const digitElements = guessElement.querySelectorAll(".col-25");
            if (digitElements.length > 0) {
                const guess = [0, 0, 0, 0];
                const hints = [vault_1.Hint.NONE, vault_1.Hint.NONE, vault_1.Hint.NONE, vault_1.Hint.NONE];
                for (const [position, digitElement] of digitElements.entries()) {
                    guess[position] = Number((_a = digitElement.textContent) === null || _a === void 0 ? void 0 : _a.slice(-1));
                    hints[position] =
                        // eslint-disable-next-line no-nested-ternary
                        digitElement.dataset.type === "B"
                            ? vault_1.Hint.CORRECT
                            : digitElement.dataset.type === "Y"
                                ? vault_1.Hint.CLOSE
                                : vault_1.Hint.NONE;
                }
                guesses.push(guess);
                info = (0, vault_1.applyGuess)(info, guess, hints);
            }
        }
        renderKeyboard(input, info);
        const guess = (0, vault_1.generateGuess)(info, guesses.length).join("");
        if (input) {
            input.value = guess;
        }
        const magicButton = document.createElement("div");
        magicButton.style.position = "absolute";
        magicButton.style.right = "20px";
        magicButton.style.bottom = "80px";
        magicButton.style.cursor = "pointer";
        magicButton.style.zIndex = "999999";
        magicButton.style.height = "60px";
        magicButton.style.width = "60px";
        magicButton.style.borderRadius = "100%";
        magicButton.style.backgroundColor = theme_1.BUTTON_GREEN_BACKGROUND;
        magicButton.style.borderWidth = "2px";
        magicButton.style.borderColor = theme_1.BUTTON_GREEN_BORDER;
        magicButton.style.borderStyle = "solid";
        magicButton.style.color = theme_1.TEXT_WHITE;
        magicButton.style.display = "flex";
        magicButton.style.justifyContent = "center";
        magicButton.style.alignItems = "center";
        magicButton.innerHTML = `<i class="fa fa-wand-sparkles fa-2x fa-fw" />`;
        magicButton.addEventListener("click", () => {
            var _a;
            // click new vault button if available
            const newVaultButton = currentPage.querySelector(".resetbtn");
            if (newVaultButton) {
                newVaultButton.click();
                return;
            }
            // click more guesses button if available
            const moreTriesButton = currentPage.querySelector(".moretriesbtn");
            if (moreTriesButton) {
                moreTriesButton.click();
            }
            // otherwise, submit the suggested guess
            if (input) {
                input.value = guess;
                (_a = currentPage.querySelector(".vcbtn")) === null || _a === void 0 ? void 0 : _a.click();
            }
        });
        currentPage.append(magicButton);
    },
};


/***/ }),

/***/ 70:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versionManager = void 0;
const api_1 = __webpack_require__(2427);
const requests_1 = __webpack_require__(3813);
const notifications_1 = __webpack_require__(6783);
const popup_1 = __webpack_require__(469);
const isVersion = (version) => version.split(".").length === 3;
const normalizeVersion = (version) => version.split("-")[0];
// Compares release numbers the way you'd read them aloud: the first part that
// differs decides, and a missing part counts as zero. The old version returned
// true as soon as ANY part of the candidate was larger, whatever its position,
// so 1.0.31 counted as newer than 1.1.0 — which is how this fork ended up being
// offered an "update" to the upstream script it was forked from.
const isVersionHigher = (test, current) => {
    var _a, _b;
    const testParts = test.split(".").map(Number);
    const currentParts = current.split(".").map(Number);
    const length = Math.max(testParts.length, currentParts.length);
    for (let index = 0; index < length; index++) {
        const testPart = (_a = testParts[index]) !== null && _a !== void 0 ? _a : 0;
        const currentPart = (_b = currentParts[index]) !== null && _b !== void 0 ? _b : 0;
        if (testPart !== currentPart) {
            return testPart > currentPart;
        }
    }
    return false;
};
const currentVersion = normalizeVersion( true && "1.1.34" !== void 0 ? "1.1.34" : "1.0.0");
(0, notifications_1.registerNotificationHandler)(notifications_1.Handler.CHANGES, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const response = yield (0, requests_1.corsFetch)(api_1.CHANGELOG_URL);
    const htmlString = yield response.text();
    const document = new DOMParser().parseFromString(htmlString, "text/html");
    const body = document.querySelector(".markdown-body");
    if (!body) {
        console.error("Failed to get README body");
        return;
    }
    let contentHTML = "";
    for (const child of body.children) {
        if (child.classList.contains("markdown-heading")) {
            const version = normalizeVersion((_a = child.textContent) !== null && _a !== void 0 ? _a : "1.0.0");
            if (isVersion(version) && isVersionHigher(version, currentVersion)) {
                contentHTML += `
          <h2>${version}</h2>
          <ul>${(_b = child.nextElementSibling) === null || _b === void 0 ? void 0 : _b.innerHTML}</ul>
        `;
            }
        }
    }
    (0, popup_1.showPopup)({ title: "Farmhand Changelog", contentHTML, align: "left" });
}));
(0, notifications_1.registerNotificationHandler)(notifications_1.Handler.UPDATE, () => window.open(api_1.SCRIPT_URL));
exports.versionManager = {
    onInitialize: () => __awaiter(void 0, void 0, void 0, function* () {
        const latestVersion = yield api_1.latestVersionState.get();
        if (!latestVersion) {
            console.error("Failed to get latest version");
            return;
        }
        if (isVersionHigher(latestVersion, currentVersion)) {
            (0, notifications_1.sendNotification)({
                class: "btnblue",
                id: notifications_1.NotificationId.UPDATE,
                text: `Farmhand update available: ${currentVersion} → ${latestVersion}`,
                actions: [
                    {
                        text: "View Changes",
                        handler: notifications_1.Handler.CHANGES,
                    },
                    {
                        text: "Update",
                        handler: notifications_1.Handler.UPDATE,
                    },
                ],
            });
        }
        else {
            (0, notifications_1.removeNotification)(notifications_1.NotificationId.UPDATE);
        }
    }),
};


/***/ }),

/***/ 6217:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const autocomplete_1 = __webpack_require__(4067);
const autocompleteItems_1 = __webpack_require__(8477);
const autocompleteUsers_1 = __webpack_require__(5881);
const banker_1 = __webpack_require__(8092);
const briefingPanel_1 = __webpack_require__(5299);
const buddyfarm_1 = __webpack_require__(2273);
const mailboxInChat_1 = __webpack_require__(8124);
const chatNav_1 = __webpack_require__(6922);
const cleanupExplore_1 = __webpack_require__(2742);
const cleanupHome_1 = __webpack_require__(5870);
const collapseItemImage_1 = __webpack_require__(4056);
const compactSilver_1 = __webpack_require__(8181);
const compressChat_1 = __webpack_require__(223);
const confirmation_1 = __webpack_require__(3906);
const craftPlanner_1 = __webpack_require__(3995);
const craftworksAdvisor_1 = __webpack_require__(6969);
const customNavigation_1 = __webpack_require__(2224);
const dismissableChatBanners_1 = __webpack_require__(5164);
const exploreFirst_1 = __webpack_require__(6030);
const farmhandSettings_1 = __webpack_require__(8973);
const harvestNotifications_1 = __webpack_require__(4894);
const fishInBarrel_1 = __webpack_require__(2100);
const fleaMarket_1 = __webpack_require__(9361);
const focusDashboard_1 = __webpack_require__(8697);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const highlightSelfInChat_1 = __webpack_require__(5454);
const improvedInputs_1 = __webpack_require__(1108);
const inventoryCapWarnings_1 = __webpack_require__(6660);
const kitchenNotifications_1 = __webpack_require__(9737);
const linkifyQuickCraft_1 = __webpack_require__(7092);
const locationAdvisor_1 = __webpack_require__(1028);
const mailboxNotifications_1 = __webpack_require__(6297);
const maxContainers_1 = __webpack_require__(9735);
const maxCows_1 = __webpack_require__(1103);
const maxPigs_1 = __webpack_require__(2934);
const mealNotifications_1 = __webpack_require__(5792);
const miner_1 = __webpack_require__(4414);
const moveUpdateToTop_1 = __webpack_require__(4417);
const compressNavigation_1 = __webpack_require__(2827);
const notifications_1 = __webpack_require__(6783);
const perkManagement_1 = __webpack_require__(682);
const petNotifications_1 = __webpack_require__(8278);
const popup_1 = __webpack_require__(469);
const requests_1 = __webpack_require__(3300);
const questCollapse_1 = __webpack_require__(1768);
const quests_1 = __webpack_require__(3710);
const questTagging_1 = __webpack_require__(9524);
const quickSellSafely_1 = __webpack_require__(8760);
const vaultSolver_1 = __webpack_require__(3026);
const versionManager_1 = __webpack_require__(70);
const FEATURES = [
    // internal
    notifications_1.notifications,
    confirmation_1.confirmations,
    popup_1.popups,
    autocomplete_1.autocomplete,
    versionManager_1.versionManager,
    // UI
    improvedInputs_1.improvedInputs,
    briefingPanel_1.briefingPanel,
    // home
    cleanupHome_1.cleanupHome,
    moveUpdateToTop_1.moveUpdateToTop,
    // kitchen
    kitchenNotifications_1.kitchenNotifications,
    mealNotifications_1.mealNotifications,
    // farm,
    harvestNotifications_1.fieldNotifications,
    maxPigs_1.maxPigs,
    maxCows_1.maxCows,
    // flea market
    fleaMarket_1.fleaMarket,
    // items
    buddyfarm_1.buddyFarm,
    collapseItemImage_1.collapseItemImage,
    quickSellSafely_1.quicksellSafely,
    linkifyQuickCraft_1.linkifyQuickCraft,
    exploreFirst_1.exploreFirst,
    craftPlanner_1.craftPlanner,
    // craftworks
    craftworksAdvisor_1.craftworksAdvisor,
    // inventory
    inventoryCapWarnings_1.inventoryCapWarnings,
    // quests
    quests_1.quests,
    focusDashboard_1.focusDashboard,
    questCollapse_1.questCollapse,
    questTagging_1.questTagging,
    compactSilver_1.compactSilver,
    // bank
    banker_1.banker,
    // mailbox
    mailboxNotifications_1.mailboxNotifications,
    // pets
    petNotifications_1.petNotifications,
    // vault
    vaultSolver_1.vaultSolver,
    // mining
    miner_1.miner,
    // locksmith
    maxContainers_1.maxContainers,
    // fishing
    fishInBarrel_1.fishinInBarrel,
    // explore
    perkManagement_1.perkManagment,
    cleanupExplore_1.cleanupExplore,
    locationAdvisor_1.locationAdvisor,
    // chat
    chatNav_1.chatNav,
    compressChat_1.compressChat,
    dismissableChatBanners_1.dismissableChatBanners,
    highlightSelfInChat_1.highlightSelfInChat,
    autocompleteItems_1.autocompleteItems,
    autocompleteUsers_1.autocompleteUsers,
    mailboxInChat_1.chatMailboxStats,
    // nav
    compressNavigation_1.navigationStyle,
    customNavigation_1.customNavigation,
    // settings
    farmhandSettings_1.farmhandSettings,
];
for (const feature of FEATURES) {
    (0, settings_1.registerSettings)(...((_a = feature.settings) !== null && _a !== void 0 ? _a : []));
}
const watchSubtree = (selector, handler, filter) => {
    const target = document.querySelector(selector);
    if (!target) {
        console.error(`${selector} not found`);
        return;
    }
    const handle = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const settings = yield (0, settings_1.getSettingValues)();
        const [page, parameters] = (0, page_1.getPage)();
        // console.debug(`${selector} Load`, page, parameters);
        for (const feature of FEATURES) {
            (_a = feature[handler]) === null || _a === void 0 ? void 0 : _a.call(feature, settings, page, parameters);
        }
    });
    const observer = new MutationObserver((mutations) => {
        var _a, _b;
        for (const mutation of mutations) {
            // only respond to tree changes
            if (mutation.type !== "childList") {
                continue;
            }
            if (mutation.addedNodes.length === 0) {
                continue;
            }
            const anyFirstPartyChanges = [...mutation.addedNodes].some((node) => { var _a; return (_a = node.className) === null || _a === void 0 ? void 0 : _a.includes("fh"); });
            if (anyFirstPartyChanges) {
                continue;
            }
            if (filter) {
                for (const node of mutation.addedNodes) {
                    if ((_b = (_a = node).matches) === null || _b === void 0 ? void 0 : _b.call(_a, filter)) {
                        handle();
                    }
                }
            }
            else {
                handle();
            }
        }
    });
    observer.observe(target, { childList: true, subtree: true });
    handle();
};
// eslint-disable-next-line unicorn/prefer-top-level-await
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line unicorn/prefer-module
        "use strict";
        console.info("STARTING Farmhand by Ansel Santosa");
        console.info("Running migrations...");
        const keys = yield GM.listValues();
        for (const key of keys) {
            const value = yield GM.getValue(key, null);
            if (key.startsWith("chatBanners")) {
                console.info(`Deleting legacy chat banners ${key}`, value);
                yield GM.deleteValue(key);
                continue;
            }
            if (key === "customNav_data" && typeof value === "string") {
                console.info(`Migrating legacy custom nav ${key}`, value);
                const items = JSON.parse(value);
                yield GM.setValue(key, { items });
                continue;
            }
            if (typeof value === "string") {
                console.info(`Deleting setting ${key} with invalid data format`, value);
                yield GM.deleteValue(key);
                continue;
            }
            if (key.startsWith("state_") &&
                (!Array.isArray(value) ||
                    value.length !== 2 ||
                    typeof value[0] !== "object" ||
                    typeof value[1] !== "object")) {
                console.info(`Deleting ${key} with invalid data format`, value);
                yield GM.deleteValue(key);
                continue;
            }
            if (key.endsWith("_data") && typeof value !== "object") {
                console.info(`Deleting setting ${key} with invalid data format`, value);
                yield GM.deleteValue(key);
            }
        }
        console.info("Migrations complete");
        // initialize
        console.info("Running initializers...");
        const settings = yield (0, settings_1.getSettingValues)();
        for (const { onInitialize } of FEATURES) {
            if (onInitialize) {
                onInitialize(settings);
            }
        }
        // run any interceptors for the first page
        const currentPage = (0, page_1.getCurrentPage)();
        if (currentPage) {
            console.info(`Running interceptors for ${currentPage.dataset.page}...`);
            for (const [state, interceptor] of requests_1.queryInterceptors) {
                const url = window.location.href.replace("/index.php#!", "");
                if ((0, requests_1.urlMatches)(url, ...interceptor.match)) {
                    const previous = yield state.get({ doNotFetch: true });
                    interceptor.callback(state, previous, {
                        headers: new Headers(),
                        ok: true,
                        redirected: false,
                        status: 200,
                        statusText: "OK",
                        type: "default",
                        url,
                        text: () => Promise.resolve(currentPage.innerHTML),
                        json: () => Promise.resolve({}),
                        formData: () => Promise.resolve(new FormData()),
                        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                        blob: () => Promise.resolve(new Blob([])),
                    });
                }
            }
        }
        else {
            console.warn("Failed to find first page");
        }
        console.info("Registering query interceptors...");
        yield (0, requests_1.watchQueries)();
        console.info("Registering DOM watchers...");
        // double watches because the page and nav load at different times but
        // separating the handlers makes everything harder
        watchSubtree(".view-main .pages", "onPageLoad", ".page");
        watchSubtree(".view-main .navbar", "onPageLoad", ".navbar-inner");
        watchSubtree(".view-main .pages", "onNotificationLoad", ".page > .button");
        // watch quest popup
        watchSubtree(".view-main .toolbar", "onQuestLoad");
        // watch menu
        watchSubtree(".view-left", "onMenuLoad");
        // watch desktop and mobile versions of chat
        watchSubtree("#mobilechatpanel", "onChatLoad");
        watchSubtree("#desktopchatpanel", "onChatLoad");
        console.info("Farmhand running!");
    });
})();


/***/ }),

/***/ 5818:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRandom = void 0;
const getRandom = (array) => array[Math.floor(Math.random() * array.length)];
exports.getRandom = getRandom;


/***/ }),

/***/ 4067:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.autocomplete = exports.registerInputListeners = exports.registerAutocomplete = void 0;
const theme_1 = __webpack_require__(1178);
const state = {
    currentIndex: 0,
    autocompletes: [],
};
const processInput = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let activeAutocomplete;
    const text = input.value;
    const processedInput = { text };
    for (const autocomplete of state.autocompletes) {
        // "@anstosa: LF ((or"
        if ((_a = autocomplete === null || autocomplete === void 0 ? void 0 : autocomplete.bail) === null || _a === void 0 ? void 0 : _a.call(autocomplete, text)) {
            continue;
        }
        // "@anstosa: LF ((or"
        const match = text.match(autocomplete.trigger);
        // "or"
        if (!match || match.length < 2) {
            continue;
        }
        const search = match[1];
        const items = yield autocomplete.getItems();
        const filteredItems = items.filter(({ name }) => { var _a; return name.toLowerCase().includes((_a = search.toLowerCase()) !== null && _a !== void 0 ? _a : ""); });
        activeAutocomplete = autocomplete;
        processedInput.search = search;
        processedInput.match = match;
        processedInput.items = items;
        processedInput.filteredItems = filteredItems;
    }
    state.activeAutocomplete = activeAutocomplete;
    return processedInput;
});
const applyInput = (input, item) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { filteredItems, search, match, text } = yield processInput(input);
    if (!state.activeAutocomplete) {
        return;
    }
    const { prefix, suffix } = state.activeAutocomplete;
    if (!search || !match || !filteredItems) {
        return;
    }
    // eslint-disable-next-line require-atomic-updates
    input.value = [
        text.slice(0, match.index),
        prefix,
        item.name,
        suffix,
        text.slice(((_a = match.index) !== null && _a !== void 0 ? _a : 0) + match[0].length),
    ].join("");
    closeAutocomplete();
});
const autocompleteSearchControlHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (!event.target) {
        return;
    }
    if (!state.activeAutocomplete) {
        return;
    }
    if (!["Enter", "ArrowDown", "ArrowUp", "Escape"].includes(event.key)) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const input = event.target;
    const { filteredItems, search, match } = yield processInput(input);
    if (!search || !match || !filteredItems) {
        closeAutocomplete();
        return;
    }
    // eslint-disable-next-line unicorn/prefer-switch
    if (event.key === "Enter") {
        closeAutocomplete();
        yield applyInput(input, filteredItems[state.currentIndex]);
    }
    else if (event.key === "ArrowDown") {
        state.currentIndex = Math.min(state.currentIndex + 1, filteredItems.length - 1);
        renderAutocomplete(input, filteredItems);
    }
    else if (event.key === "ArrowUp") {
        state.currentIndex = Math.max(state.currentIndex - 1, 0);
        renderAutocomplete(input, filteredItems);
    }
    else if (event.key === "Escape") {
        closeAutocomplete();
    }
});
const autocompleteSearchItemHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (!event.target) {
        return;
    }
    const input = event.target;
    const { filteredItems, match } = yield processInput(input);
    if (!match || !filteredItems) {
        closeAutocomplete();
        return;
    }
    renderAutocomplete(input, filteredItems);
});
const closeAutocomplete = () => {
    var _a;
    (_a = document.querySelector(".fh-autocomplete")) === null || _a === void 0 ? void 0 : _a.remove();
};
const renderAutocomplete = (input, items) => {
    closeAutocomplete();
    const offset = input.getBoundingClientRect();
    const wrapper = document.createElement("div");
    wrapper.classList.add("fh-autocomplete");
    wrapper.style.position = "fixed";
    wrapper.style.top = `${offset.top + offset.height}px`;
    wrapper.style.left = `${offset.left}px`;
    wrapper.style.width = `${offset.width}px`;
    wrapper.style.maxHeight = `${window.innerHeight - offset.top - offset.height}px`;
    wrapper.style.zIndex = "99999";
    wrapper.innerHTML = `
    ${items
        .map(({ name, image }, index) => `
          <div
            class="fh-autocomplete-item"
            data-index="${index}"
            style="
              display: flex;
              align-items: center;
              color: white;
              gap: 5px;
              width: 100%;
              cursor: pointer;
              padding: 8px;
              background-color: ${index === state.currentIndex
        ? theme_1.BUTTON_BLUE_BACKGROUND
        : theme_1.BACKGROUND_DARK};
            "
          >
            <img
              src="${image}"
              style="
                width: 25px;
                height: 25px;
              ">
            ${name}
          </div>
        `)
        .join("")}
  `;
    for (const item of wrapper.querySelectorAll(".fh-autocomplete-item")) {
        wrapper.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
            closeAutocomplete();
            yield applyInput(input, items[Number(item.dataset.index)]);
        }));
    }
    document.body.append(wrapper);
};
const registerAutocomplete = (autocomplete) => {
    state.autocompletes.push(autocomplete);
};
exports.registerAutocomplete = registerAutocomplete;
const registerInputListeners = (input) => {
    input.addEventListener("keypress", autocompleteSearchItemHandler);
    input.addEventListener("keydown", autocompleteSearchControlHandler);
};
exports.registerInputListeners = registerInputListeners;
exports.autocomplete = {
    onInitialize: () => {
        document.head.insertAdjacentHTML("beforeend", `
      <style>
        .fh-autocomplete-item:hover {
          background-color: ${theme_1.BUTTON_BLUE_BACKGROUND};
        }
      <style>
    `);
    },
    onChatLoad: () => {
        for (const input of document.querySelectorAll(`
      #mobilechatpanel input[type="text"],
      #desktopchatpanel input[type='text']
    `)) {
            (0, exports.registerInputListeners)(input);
        }
    },
};


/***/ }),

/***/ 3906:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.confirmations = exports.showConfirmation = void 0;
const showConfirmation = (message, onYes, onNo) => {
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");
    overlay.classList.add("modal-overlay-visible");
    document.body.append(overlay);
    const modal = document.createElement("div");
    modal.classList.add("actions-modal");
    modal.classList.add("modal-in");
    modal.innerHTML = `
      <div class="actions-modal-group">
        <div class="actions-modal-label">${message}</div>
        <div class="actions-modal-button">Yes</div>
        <div class="actions-modal-button color-red">Cancel</div>
      </div>
    `;
    const buttons = modal.querySelectorAll(".actions-modal-button");
    const yesButton = buttons[0];
    yesButton.addEventListener("click", () => {
        overlay === null || overlay === void 0 ? void 0 : overlay.classList.remove("modal-overlay-visible");
        modal.remove();
        onYes();
    });
    const noButton = buttons[1];
    noButton.addEventListener("click", () => {
        overlay === null || overlay === void 0 ? void 0 : overlay.classList.remove("modal-overlay-visible");
        modal.remove();
        onNo === null || onNo === void 0 ? void 0 : onNo();
    });
    document.body.append(modal);
};
exports.showConfirmation = showConfirmation;
exports.confirmations = {
    onInitialize: () => {
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          /* fix confirmation position */
          .actions-modal-group {
            margin-bottom: 0 !important;
          }
        <style>
      `);
    },
};


/***/ }),

/***/ 5825:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.planSourcing = exports.getBaselineSource = exports.getDropSources = exports.getMaxCraftable = exports.planCraft = exports.MAX_DEPTH = void 0;
const unlimited_1 = __webpack_require__(4808);
// A recipe tree deep enough to reach raw drops from anything in the game, with
// room to spare. The limit exists to stop a malformed or cyclic recipe graph
// from hanging the page, not because real recipes come close to it.
exports.MAX_DEPTH = 12;
// Expand `quantity` of `target` into the sub-crafts and raw materials it needs,
// spending `inventory` as it goes.
//
// The inventory is a single shared pool consumed depth-first, so an ingredient
// needed by two different branches is never counted twice — the first branch to
// ask for it gets it. The target itself is always crafted in full: holding 3
// already does not reduce a request to craft 5 more.
const planCraft = (graph, target, quantity, inventory, unlimited = unlimited_1.NO_UNLIMITED) => {
    const pool = Object.assign({}, inventory);
    const spend = {};
    const missing = {};
    const stepsByName = new Map();
    const unknown = new Set();
    const { nodes } = graph;
    let { truncated } = graph;
    const addMissing = (name, amount) => {
        var _a;
        missing[name] = ((_a = missing[name]) !== null && _a !== void 0 ? _a : 0) + amount;
    };
    const addStep = (name, amount, depth) => {
        const existing = stepsByName.get(name);
        if (existing) {
            existing.quantity += amount;
            // an item needed at two depths has to be crafted before the deeper of
            // its consumers, so the larger depth is the one that orders it
            existing.depth = Math.max(existing.depth, depth);
            return;
        }
        stepsByName.set(name, { depth, name, quantity: amount });
    };
    const expand = (name, want, depth, chain) => {
        var _a, _b;
        if (want <= 0) {
            return;
        }
        // spend what's on hand before making more
        const onHand = Math.min((_a = pool[name]) !== null && _a !== void 0 ? _a : 0, want);
        if (onHand > 0) {
            pool[name] -= onHand;
            spend[name] = ((_b = spend[name]) !== null && _b !== void 0 ? _b : 0) + onHand;
        }
        const remaining = want - onHand;
        if (remaining <= 0) {
            return;
        }
        // a perk buys this on demand, so the shortfall is not one the player has
        // to go and solve
        if ((0, unlimited_1.isUnlimited)(unlimited, name)) {
            return;
        }
        const node = nodes.get(name);
        if (!node) {
            unknown.add(name);
            addMissing(name, remaining);
            return;
        }
        // a recipe that reaches itself would recurse forever; stop and report the
        // rest as raw rather than guessing which way round the cycle goes
        if (chain.has(name)) {
            truncated = true;
            addMissing(name, remaining);
            return;
        }
        if (!node.canCraft || node.ingredients.length === 0 || depth >= exports.MAX_DEPTH) {
            if (depth >= exports.MAX_DEPTH) {
                truncated = true;
            }
            addMissing(name, remaining);
            return;
        }
        addStep(name, remaining, depth);
        const nextChain = new Set(chain).add(name);
        for (const ingredient of node.ingredients) {
            expand(ingredient.name, ingredient.quantity * remaining, depth + 1, nextChain);
        }
    };
    const root = nodes.get(target);
    if (root && root.canCraft && root.ingredients.length > 0) {
        addStep(root.name, quantity, 0);
        const chain = new Set([target, root.name]);
        for (const ingredient of root.ingredients) {
            expand(ingredient.name, ingredient.quantity * quantity, 1, chain);
        }
    }
    else if (root) {
        addMissing(root.name, quantity);
    }
    else {
        unknown.add(target);
        addMissing(target, quantity);
    }
    return {
        missing: Object.entries(missing)
            .map(([name, amount]) => ({ name, quantity: amount }))
            .sort((a, b) => b.quantity - a.quantity),
        spend,
        // deepest first is a valid crafting order: nothing at depth N needs
        // anything produced at a depth shallower than N
        steps: [...stepsByName.values()].sort((a, b) => b.depth - a.depth),
        target,
        quantity,
        truncated,
        unknown: [...unknown],
    };
};
exports.planCraft = planCraft;
// Largest quantity of `target` the inventory covers outright. Doubling search
// for an upper bound, then a bisect — `planCraft` is pure and cheap once the
// graph is in hand, so this costs no requests.
const getMaxCraftable = (graph, target, inventory, unlimited = unlimited_1.NO_UNLIMITED, limit = 10000) => {
    const fits = (quantity) => (0, exports.planCraft)(graph, target, quantity, inventory, unlimited).missing.length ===
        0;
    if (!fits(1)) {
        return 0;
    }
    let low = 1;
    let high = 2;
    while (high <= limit && fits(high)) {
        low = high;
        high *= 2;
    }
    high = Math.min(high, limit);
    while (low + 1 < high) {
        const middle = Math.floor((low + high) / 2);
        if (fits(middle)) {
            low = middle;
        }
        else {
            high = middle;
        }
    }
    return low;
};
exports.getMaxCraftable = getMaxCraftable;
// Every place an item drops, best rate first. Entries whose location is null
// (farm and seed yields, which buddy.farm records without a location) are
// skipped — they are not somewhere you can go.
const getDropSources = (item) => {
    var _a;
    if (!item) {
        return [];
    }
    const sources = [];
    for (const entry of (_a = item.dropRatesItems) !== null && _a !== void 0 ? _a : []) {
        const rates = entry.dropRates;
        const location = rates === null || rates === void 0 ? void 0 : rates.location;
        if (!(location === null || location === void 0 ? void 0 : location.name) || !entry.rate) {
            continue;
        }
        sources.push({
            ironDepot: rates.ironDepot === true,
            location: location.name,
            manualFishing: rates.manualFishing === true,
            rate: entry.rate,
            runecube: rates.runecube === true,
            seed: rates.seed === true,
            type: location.type === "fishing" ? "fishing" : "explore",
        });
    }
    return sources.sort((a, b) => a.rate - b.rate);
};
exports.getDropSources = getDropSources;
// The best rate available without assuming a perk the player may not have,
// falling back to the overall best when every profile needs one.
const getBaselineSource = (sources) => { var _a; return (_a = sources.find((source) => !source.ironDepot && !source.runecube)) !== null && _a !== void 0 ? _a : sources[0]; };
exports.getBaselineSource = getBaselineSource;
// Roll a list of missing items up into the places to go get them, so a plan
// that needs eight different raws turns into two or three explore targets with
// a hit count each.
const planSourcing = (graph, missing) => {
    var _a;
    const byLocation = new Map();
    const unsourced = [];
    for (const entry of missing) {
        const node = graph.nodes.get(entry.name);
        const source = (0, exports.getBaselineSource)((0, exports.getDropSources)(node === null || node === void 0 ? void 0 : node.item));
        if (!source) {
            unsourced.push(entry.name);
            continue;
        }
        const existing = (_a = byLocation.get(source.location)) !== null && _a !== void 0 ? _a : {
            hits: 0,
            items: [],
            location: source.location,
            type: source.type,
        };
        existing.hits += entry.quantity * source.rate;
        existing.items.push({
            name: entry.name,
            quantity: entry.quantity,
            rate: source.rate,
        });
        byLocation.set(source.location, existing);
    }
    return {
        // Most needs covered first, cheapest trip breaking ties. Sorting by total
        // hits put the longest grind at the top, which answers "what will cost me
        // most" rather than "where should I go" — one trip that clears three
        // shortfalls beats one that clears a single expensive one.
        locations: [...byLocation.values()].sort((a, b) => b.items.length - a.items.length || a.hits - b.hits),
        unsourced,
    };
};
exports.planSourcing = planSourcing;


/***/ }),

/***/ 7831:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseSavedSets = exports.suggestQueueChanges = exports.planCraftworksQueue = exports.adviseOnSlots = exports.getMaxSlots = exports.parseMaxSlots = exports.parseSlots = void 0;
const unlimited_1 = __webpack_require__(4808);
// Reading the Craftworks queue and reasoning about it, kept free of rendering
// and of any import that needs a browser so it can be unit-tested directly.
//
// The queue crafts top-down and only when every ingredient is in stock, so the
// two things that quietly waste a slot are an item sitting at the inventory cap
// (it can never craft) and a producer placed below the slot that consumes it.
// "You can add up to <strong>8</strong> items total to the Craftworks."
const MAX_SLOTS_PATTERN = /add up to\s*(?:<strong>)?\s*(\d+)\s*(?:<\/strong>)?\s*items total/i;
const parseSlots = (root) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const slots = [];
    const rows = root.querySelectorAll(".cwitems li[data-name], li.close-panel[data-name]");
    for (const [index, row] of [...rows].entries()) {
        const name = (_a = row.dataset.name) === null || _a === void 0 ? void 0 : _a.trim();
        if (!name) {
            continue;
        }
        const status = row.querySelector(".item-title .disable-select");
        const statusText = (_b = status === null || status === void 0 ? void 0 : status.textContent) !== null && _b !== void 0 ? _b : "";
        const inventoryMatch = /Inventory:\s*([\d,]+)/.exec(statusText);
        const positionText = (_d = (_c = row
            .querySelector(".item-media span")) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim();
        const blockedOn = [];
        // the "Out of:" list is the game telling us exactly what stalled the slot,
        // which is far more reliable than re-deriving it from the recipe
        if (/out of:/i.test(statusText)) {
            for (const link of (_e = status === null || status === void 0 ? void 0 : status.querySelectorAll("a")) !== null && _e !== void 0 ? _e : []) {
                const blockerName = (_f = link.textContent) === null || _f === void 0 ? void 0 : _f.trim();
                if (!blockerName) {
                    continue;
                }
                blockedOn.push({
                    id: (_j = (_h = /id=(\d+)/.exec((_g = link.getAttribute("href")) !== null && _g !== void 0 ? _g : "")) === null || _h === void 0 ? void 0 : _h[1]) !== null && _j !== void 0 ? _j : "",
                    name: blockerName,
                });
            }
        }
        slots.push({
            blockedOn,
            id: (_k = row.dataset.id) !== null && _k !== void 0 ? _k : "",
            inventory: Number((_m = (_l = inventoryMatch === null || inventoryMatch === void 0 ? void 0 : inventoryMatch[1]) === null || _l === void 0 ? void 0 : _l.replaceAll(",", "")) !== null && _m !== void 0 ? _m : "0"),
            // red is the game's own "you are at the cap" marker on this row
            isCapRed: /color:\s*red/i.test((_o = status === null || status === void 0 ? void 0 : status.getAttribute("style")) !== null && _o !== void 0 ? _o : ""),
            isPaused: row.querySelector(".playcwbtn") !== null ||
                /\(paused\)/i.test((_p = row.textContent) !== null && _p !== void 0 ? _p : ""),
            name,
            position: Number(positionText) || index + 1,
        });
    }
    return slots;
};
exports.parseSlots = parseSlots;
// "items total" is load-bearing: the Upgrade Craftworks card further down the
// same page says "You can add up to 6 items to the Craftworks (Excluding
// Patreon extra slots)", which is the base allowance, not the real cap. Only
// the top card says "items total", and that is the number that matters.
const parseMaxSlots = (text) => {
    const match = MAX_SLOTS_PATTERN.exec(text);
    return match ? Number(match[1]) : undefined;
};
exports.parseMaxSlots = parseMaxSlots;
const getMaxSlots = (root) => { var _a; return (0, exports.parseMaxSlots)((_a = root.textContent) !== null && _a !== void 0 ? _a : ""); };
exports.getMaxSlots = getMaxSlots;
// Read the queue and work out which slots are actually producing, which are
// stalled and on what, and which are stalled on something a *lower* slot makes
// (the queue runs top-down, so a producer below its consumer never unblocks it).
//
// Blockers are then split in two, because they call for opposite responses: one
// an earlier slot already produces will clear itself once that slot runs, while
// one nothing in the queue makes is the actual reason the queue is stalled and
// the only kind worth spending explores on.
const adviseOnSlots = (slots, cap, unlimited = unlimited_1.NO_UNLIMITED) => {
    var _a;
    const positionByName = new Map(slots.map((slot) => [slot.name, slot]));
    const advice = {
        blockers: new Map(),
        dead: [],
        ordering: [],
        paused: [],
        roots: [],
        supplied: [],
        upstream: [],
        working: [],
    };
    for (const slot of slots) {
        const isAtCap = cap ? slot.inventory >= cap : slot.isCapRed;
        if (isAtCap) {
            advice.dead.push(slot);
            continue;
        }
        if (slot.isPaused) {
            advice.paused.push(slot);
            continue;
        }
        if (slot.blockedOn.length === 0) {
            advice.working.push(slot);
            continue;
        }
        for (const blocker of slot.blockedOn) {
            const producer = positionByName.get(blocker.name);
            const existing = (_a = advice.blockers.get(blocker.name)) !== null && _a !== void 0 ? _a : {
                name: blocker.name,
                producer,
                slots: [],
            };
            existing.slots.push(slot);
            advice.blockers.set(blocker.name, existing);
            if (producer && producer.position > slot.position) {
                advice.ordering.push({ blocker: blocker.name, producer, slot });
            }
        }
    }
    for (const blocker of advice.blockers.values()) {
        // a producer that is itself dead (at cap) or paused will not actually
        // deliver, so its consumers are still stalled on something real
        const isLive = blocker.producer &&
            !advice.dead.includes(blocker.producer) &&
            !advice.paused.includes(blocker.producer);
        if (isLive) {
            advice.upstream.push(blocker);
        }
        else if ((0, unlimited_1.isUnlimited)(unlimited, blocker.name)) {
            // a perk buys this on demand, so it is not something to go and get
            advice.supplied.push(blocker);
        }
        else {
            advice.roots.push(blocker);
        }
    }
    return advice;
};
exports.adviseOnSlots = adviseOnSlots;
// Turn a craft plan into an ordered Craftworks queue.
//
// `plan.steps` already comes out deepest-first, which is exactly the order the
// queue needs: every producer sits above the slot that consumes it, so one pass
// down the queue carries the chain as far as the materials allow. Anything
// already at the inventory cap is left out — it would occupy a slot and never
// craft — and if there are more steps than slots the shallow end is dropped,
// because the deep items are the ones that unblock everything above them.
const planCraftworksQueue = (plan, inventory, cap, maxSlots, unlimited = unlimited_1.NO_UNLIMITED) => {
    var _a;
    const dropped = [];
    const eligible = [];
    for (const step of plan.steps) {
        if ((0, unlimited_1.isUnlimited)(unlimited, step.name)) {
            continue;
        }
        if (cap !== undefined && ((_a = inventory[step.name]) !== null && _a !== void 0 ? _a : 0) >= cap) {
            dropped.push({ name: step.name, reason: "already at cap" });
            continue;
        }
        eligible.push({ name: step.name, quantity: step.quantity });
    }
    const kept = eligible.slice(0, Math.max(0, maxSlots));
    for (const step of eligible.slice(Math.max(0, maxSlots))) {
        dropped.push({ name: step.name, reason: "no free slot" });
    }
    return {
        dropped,
        entries: kept.map((step, index) => ({
            name: step.name,
            position: index + 1,
            quantity: step.quantity,
        })),
        targetOmitted: !kept.some((step) => step.name === plan.target),
    };
};
exports.planCraftworksQueue = planCraftworksQueue;
// What to change about the queue to serve a set of goals.
//
// `desired` arrives deepest-first, which is the order the queue wants, so
// additions keep that order and land above whatever consumes them. Slots
// sitting at the cap are proposed for removal first, since freeing one is what
// makes room for an addition — a queue that is nominally full is usually not.
const suggestQueueChanges = (desired, slots, inventory, cap, maxSlots, unlimited = unlimited_1.NO_UNLIMITED) => {
    const queued = new Set(slots.map((slot) => slot.name));
    const suggestions = [];
    const dead = slots.filter((slot) => cap !== undefined && slot.inventory >= cap);
    for (const slot of dead) {
        suggestions.push({
            action: "drop",
            name: slot.name,
            reason: "at cap, so the slot never crafts",
        });
    }
    const room = Math.max(0, maxSlots - slots.length) + dead.length;
    if (room === 0) {
        return suggestions;
    }
    const additions = desired.filter((entry) => {
        var _a;
        return !queued.has(entry.name) &&
            !(0, unlimited_1.isUnlimited)(unlimited, entry.name) &&
            !(cap !== undefined && ((_a = inventory[entry.name]) !== null && _a !== void 0 ? _a : 0) >= cap);
    });
    for (const [index, entry] of additions.slice(0, room).entries()) {
        suggestions.push({
            action: "add",
            name: entry.name,
            position: index + 1,
            reason: `${entry.quantity.toLocaleString()} needed`,
        });
    }
    return suggestions;
};
exports.suggestQueueChanges = suggestQueueChanges;
// The saved Craftworks sets listed under "My Item Sets".
//
// Only names, ids and which one is active are readable. Each row does carry a
// `data-items` attribute, but it holds the *current* queue rather than that
// set's contents — identical across every row — and it sits inside an HTML
// comment. Reading a set's real contents would mean activating it, which
// overwrites the live queue, so everything here works from the name alone.
const parseSavedSets = (root) => {
    var _a, _b;
    const sets = [];
    for (const link of root.querySelectorAll("a.activatecwsetbtn[data-id]")) {
        const name = (_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim();
        const { id } = link.dataset;
        if (!name || !id || sets.some((set) => set.id === id)) {
            continue;
        }
        const title = link.closest(".item-title");
        sets.push({
            id,
            // the game paints the active set teal and prefixes a check icon
            isActive: /color:\s*teal/i.test((_b = title === null || title === void 0 ? void 0 : title.getAttribute("style")) !== null && _b !== void 0 ? _b : "") ||
                link.querySelector(".fa-check") !== null,
            name,
        });
    }
    return sets;
};
exports.parseSavedSets = parseSavedSets;


/***/ }),

/***/ 4276:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.debounce = void 0;
const debounce = (callback, timeout = 300) => {
    let timer;
    return (...parameters) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            Reflect.apply(callback, this, parameters);
        }, timeout);
    };
};
exports.debounce = debounce;


/***/ }),

/***/ 9946:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.clearDropdown = exports.replaceSelect = void 0;
const theme_1 = __webpack_require__(1178);
const getOptionName = ({ name, quantity }) => {
    if (quantity === undefined) {
        return name;
    }
    const formatter = new Intl.NumberFormat();
    return `${name} (${formatter.format(quantity)})`;
};
const replaceSelect = (proxySelect, options) => {
    if (proxySelect.dataset.hasProxied === "true") {
        return;
    }
    proxySelect.style.display = "none";
    const selector = document.createElement("div");
    selector.classList.add("fh-item-selector");
    (0, theme_1.applyStyles)(selector, theme_1.INPUT_STYLES);
    selector.style.display = "flex";
    selector.style.alignItems = "center";
    selector.style.justifyContent = "center";
    selector.style.gap = "4px";
    selector.style.cursor = "pointer";
    const menu = document.createElement("div");
    menu.classList.add("fh-item-selector-menu");
    menu.style.padding = "10px 0";
    menu.style.display = "none";
    menu.style.position = "fixed";
    menu.style.zIndex = "9999";
    menu.style.background = theme_1.BACKGROUND_DARK;
    menu.style.border = `2px solid ${theme_1.BORDER_GRAY}`;
    menu.style.overflowY = "auto";
    menu.style.maxHeight = "406px";
    menu.style.fontSize = "17px";
    menu.style.color = theme_1.TEXT_GRAY;
    menu.style.marginTop = "-2px";
    const selectedOption = options.find((option) => option.value === proxySelect.value);
    selector.innerHTML = `
    ${(selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.icon)
        ? `<img src="${selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.icon}" style="width:16px; "/>`
        : ""}
    ${selectedOption ? getOptionName(selectedOption) : "Select an item"}
  `;
    selector.addEventListener("click", () => {
        const offset = selector.getBoundingClientRect();
        menu.style.top = `${offset.y + offset.height}px`;
        menu.style.right = `${window.innerWidth - offset.right}px`;
        menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
    for (const option of options) {
        const optionElement = document.createElement("div");
        optionElement.textContent = `${option.name} (${option.quantity})`;
        optionElement.style.textAlign = "left";
        optionElement.style.padding = "2px 10px";
        optionElement.style.display = "flex";
        optionElement.style.alignItems = "center";
        optionElement.style.gap = "4px";
        optionElement.style.cursor = "pointer";
        optionElement.innerHTML = `
      ${option.icon ? `<img src="${option.icon}" style="width:16px;" />` : ""}
      ${getOptionName(option)}
    `;
        optionElement.addEventListener("click", () => {
            proxySelect.value = option.value;
            proxySelect.dispatchEvent(new Event("change"));
            proxySelect.dataset.hasProxied = "false";
            menu.remove();
            selector.remove();
            (0, exports.replaceSelect)(proxySelect, options);
        });
        menu.append(optionElement);
    }
    proxySelect.after(selector);
    document.body.append(menu);
    proxySelect.dataset.hasProxied = "true";
};
exports.replaceSelect = replaceSelect;
const clearDropdown = () => { var _a; return (_a = document === null || document === void 0 ? void 0 : document.querySelector(".fh-item-selector-menu")) === null || _a === void 0 ? void 0 : _a.remove(); };
exports.clearDropdown = clearDropdown;


/***/ }),

/***/ 7167:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mergeMissing = exports.getFocusSourcing = exports.getNearlyDone = exports.rankBottlenecks = exports.getGoalStatuses = void 0;
const unlimited_1 = __webpack_require__(4808);
const craftPlanner_1 = __webpack_require__(5825);
// Work out what each goal is still short of.
//
// Every goal is measured against the *full* inventory rather than a pool shared
// between them. Goals are alternatives competing for the same materials, not a
// batch to be completed at once, so "what would it take to finish this one" is
// the question worth answering; a shared pool would make the second goal in an
// arbitrary order look worse than the first for no real reason.
const getGoalStatuses = (graph, goals, inventory, unlimited = unlimited_1.NO_UNLIMITED) => {
    var _a, _b, _c;
    const statuses = [];
    for (const goal of goals) {
        const missing = new Map();
        for (const need of goal.needs) {
            // a quest wants the item itself, so spend inventory first and only then
            // fall back to crafting — planCraft always builds its target in full,
            // which is right for "make me N more" and wrong for "hand over N"
            if ((0, unlimited_1.isUnlimited)(unlimited, need.name)) {
                continue;
            }
            const held = (_a = inventory[need.name]) !== null && _a !== void 0 ? _a : 0;
            const shortfall = need.quantity - held;
            if (shortfall <= 0) {
                continue;
            }
            const node = graph.nodes.get(need.name);
            if ((node === null || node === void 0 ? void 0 : node.canCraft) && node.ingredients.length > 0) {
                // craft the shortfall, spending everything except what this need
                // already took off the shelf
                const pool = Object.assign(Object.assign({}, inventory), { [need.name]: 0 });
                const plan = (0, craftPlanner_1.planCraft)(graph, need.name, shortfall, pool, unlimited);
                for (const entry of plan.missing) {
                    missing.set(entry.name, ((_b = missing.get(entry.name)) !== null && _b !== void 0 ? _b : 0) + entry.quantity);
                }
                continue;
            }
            missing.set(need.name, ((_c = missing.get(need.name)) !== null && _c !== void 0 ? _c : 0) + shortfall);
        }
        const missingList = [...missing.entries()]
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity);
        statuses.push({
            goal,
            isReady: missingList.length === 0,
            missing: missingList,
        });
    }
    return statuses;
};
exports.getGoalStatuses = getGoalStatuses;
// Rank raw materials by how much of the backlog they unblock. This is the
// "what should I go get" answer: one item gating five goals beats one gating a
// single goal even when the single goal needs far more of it.
const rankBottlenecks = (statuses) => {
    var _a;
    const byName = new Map();
    for (const status of statuses) {
        if (status.isReady) {
            continue;
        }
        for (const entry of status.missing) {
            const existing = (_a = byName.get(entry.name)) !== null && _a !== void 0 ? _a : {
                goals: [],
                goalsGated: 0,
                maxNeeded: 0,
                name: entry.name,
                totalNeeded: 0,
            };
            existing.goalsGated += 1;
            existing.goals.push(status.goal.label);
            existing.maxNeeded = Math.max(existing.maxNeeded, entry.quantity);
            existing.totalNeeded += entry.quantity;
            byName.set(entry.name, existing);
        }
    }
    return [...byName.values()].sort((a, b) => b.goalsGated - a.goalsGated || b.maxNeeded - a.maxNeeded);
};
exports.rankBottlenecks = rankBottlenecks;
// Goals that are one item short. These are the highest-leverage thing on the
// board: a single trip finishes them outright.
const getNearlyDone = (statuses) => statuses.filter((status) => !status.isReady && status.missing.length === 1);
exports.getNearlyDone = getNearlyDone;
// Where to go for the top bottlenecks, reusing the item-page roll-up so both
// surfaces quote the same numbers.
const getFocusSourcing = (graph, bottlenecks, limit = 6) => (0, craftPlanner_1.planSourcing)(graph, bottlenecks.slice(0, limit).map((entry) => ({
    name: entry.name,
    quantity: entry.maxNeeded,
})));
exports.getFocusSourcing = getFocusSourcing;
// Fold several shortfall lists into one, taking the largest ask for any item
// rather than the sum.
//
// The lists come from sources that overlap: a request short of 40 Steel and a
// Craftworks slot stalled on Steel are the same trip, not two. Summing would
// inflate the hit count for exactly the materials that matter most, which is
// the opposite of useful when the point is deciding where to spend an hour.
const mergeMissing = (...lists) => {
    var _a;
    const byName = new Map();
    for (const list of lists) {
        for (const entry of list) {
            byName.set(entry.name, Math.max((_a = byName.get(entry.name)) !== null && _a !== void 0 ? _a : 0, entry.quantity));
        }
    }
    return [...byName.entries()]
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity);
};
exports.mergeMissing = mergeMissing;


/***/ }),

/***/ 1616:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeMutedText = exports.makeLinkedLine = exports.makeQuestLink = exports.makeLocationLink = exports.toLocationHref = exports.makeItemLink = exports.makeLink = exports.applyLinkStyle = void 0;
const theme_1 = __webpack_require__(1178);
// Framework7 only routes a click through its own navigation when the anchor
// declares which view to load into. Without this the link does a full page
// load, which drops the SPA state and takes seconds — the same attribute the
// quick-craft linkifier sets.
const VIEW = ".view-main";
const applyLinkStyle = (link, color) => {
    link.dataset.view = VIEW;
    link.style.color = color;
    link.style.textDecoration = "underline";
    link.style.textDecorationStyle = "dotted";
    link.style.textUnderlineOffset = "2px";
};
exports.applyLinkStyle = applyLinkStyle;
const makeLink = (href, text, color) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    (0, exports.applyLinkStyle)(link, color);
    return link;
};
exports.makeLink = makeLink;
// An item's own page. buddy.farm's item ids are the game's item ids, so an id
// from a recipe lookup addresses the game page directly.
const makeItemLink = (name, id, color) => {
    if (!id) {
        const span = document.createElement("span");
        span.textContent = name;
        span.style.color = color;
        return span;
    }
    return (0, exports.makeLink)(`item.php?id=${id}`, name, color);
};
exports.makeItemLink = makeItemLink;
// Explore areas and fishing spots are different pages in the game.
const toLocationHref = (location) => location.type === "fishing"
    ? `fishing.php?id=${location.id}`
    : `area.php?id=${location.id}`;
exports.toLocationHref = toLocationHref;
const makeLocationLink = (name, location, color) => {
    if (!location) {
        const span = document.createElement("span");
        span.textContent = name;
        span.style.color = color;
        return span;
    }
    return (0, exports.makeLink)((0, exports.toLocationHref)(location), name, color);
};
exports.makeLocationLink = makeLocationLink;
const makeQuestLink = (title, href, color) => {
    if (!href) {
        const span = document.createElement("span");
        span.textContent = title;
        span.style.color = color;
        return span;
    }
    return (0, exports.makeLink)(href, title, color);
};
exports.makeQuestLink = makeQuestLink;
// A line of mixed text and links. Plain strings become text nodes, so callers
// build "4 x Emberstone — Mount Banon" without hand-assembling spans.
const makeLinkedLine = (color, parts) => {
    const line = document.createElement("div");
    line.style.color = color;
    line.style.fontSize = "12px";
    line.style.lineHeight = "1.5";
    line.style.marginBottom = "3px";
    for (const part of parts) {
        line.append(part);
    }
    return line;
};
exports.makeLinkedLine = makeLinkedLine;
const makeMutedText = (text) => {
    const span = document.createElement("span");
    span.textContent = text;
    span.style.color = theme_1.TEXT_GRAY;
    return span;
};
exports.makeMutedText = makeMutedText;


/***/ }),

/***/ 1267:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDesiredQueue = exports.getGoalProgress = exports.removeGoal = exports.addGoal = exports.setGoals = exports.getGoals = void 0;
const settings_1 = __webpack_require__(126);
const craftPlanner_1 = __webpack_require__(5825);
const unlimited_1 = __webpack_require__(4808);
// Goals live under their own storage key rather than a feature's, because two
// features read them: the panel lists them and the item page adds to them.
const GOALS_KEY = "farmhandGoals";
const getGoals = () => __awaiter(void 0, void 0, void 0, function* () {
    const { goals } = yield (0, settings_1.getData)(GOALS_KEY, { goals: [] });
    return Array.isArray(goals) ? goals : [];
});
exports.getGoals = getGoals;
const setGoals = (goals) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, settings_1.setData)(GOALS_KEY, { goals });
});
exports.setGoals = setGoals;
// Adding a goal that is already tracked replaces its quantity rather than
// stacking a second entry, so the item page's button is idempotent.
const addGoal = (name, quantity, kind) => __awaiter(void 0, void 0, void 0, function* () {
    const goals = yield (0, exports.getGoals)();
    const existing = goals.find((goal) => goal.name === name);
    const next = existing
        ? goals.map((goal) => goal.name === name ? Object.assign(Object.assign({}, goal), { kind, quantity }) : goal)
        : [...goals, { addedAt: Date.now(), kind, name, quantity }];
    yield (0, exports.setGoals)(next);
    return next;
});
exports.addGoal = addGoal;
const removeGoal = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const goals = yield (0, exports.getGoals)();
    const next = goals.filter((goal) => goal.name !== name);
    yield (0, exports.setGoals)(next);
    return next;
});
exports.removeGoal = removeGoal;
// Progress toward a tracked goal.
//
// `have` and `canMakeNow` are added together because both represent goal units
// the player effectively already has — one sitting in the inventory, one a
// button press away. Counting only finished stock would show no movement at all
// while a long materials grind was actually being won.
const getGoalProgress = (graph, goal, inventory, unlimited = unlimited_1.NO_UNLIMITED, mastery = []) => {
    var _a;
    // A mastery goal is "acquire N more", not "hold N". Measuring it against the
    // inventory reported it finished the moment the shelf held more than the
    // remainder -- 99 Cave Paste read as done when the tier still wanted one more
    // to be made. Mastery progress is the only thing that answers it, and reading
    // it live means the figure keeps up as the tier fills.
    if (goal.kind === "mastery") {
        const entry = mastery.find((item) => item.name === goal.name);
        if (entry) {
            const plan = (0, craftPlanner_1.planCraft)(graph, goal.name, entry.remaining, inventory, unlimited);
            return {
                canMakeNow: Math.min(entry.remaining, (0, craftPlanner_1.getMaxCraftable)(graph, goal.name, inventory, unlimited)),
                goal,
                have: entry.value,
                missing: entry.remaining > 0 ? plan.missing : [],
                ratio: Math.min(1, entry.value / entry.required),
            };
        }
    }
    const have = (_a = inventory[goal.name]) !== null && _a !== void 0 ? _a : 0;
    const outstanding = Math.max(0, goal.quantity - have);
    if (outstanding === 0) {
        return { canMakeNow: 0, goal, have, missing: [], ratio: 1 };
    }
    // the finished ones on hand are not raw material for the rest, so they are
    // taken off the shelf before costing what is left
    const pool = Object.assign(Object.assign({}, inventory), { [goal.name]: 0 });
    const canMakeNow = Math.min(outstanding, (0, craftPlanner_1.getMaxCraftable)(graph, goal.name, pool, unlimited));
    const plan = (0, craftPlanner_1.planCraft)(graph, goal.name, outstanding, pool, unlimited);
    return {
        canMakeNow,
        goal,
        have,
        missing: plan.missing,
        ratio: Math.min(1, (have + canMakeNow) / goal.quantity),
    };
};
exports.getGoalProgress = getGoalProgress;
// The sub-crafts every tracked goal needs, deepest-first across all of them.
//
// An item wanted by two goals keeps the deeper of its two positions, so the
// merged order is still one every goal can be built from top to bottom.
const getDesiredQueue = (graph, goals, inventory, unlimited = unlimited_1.NO_UNLIMITED) => {
    var _a, _b, _c;
    const byName = new Map();
    for (const goal of goals) {
        // a mastery goal always wants more made, whatever is on the shelf
        const have = goal.kind === "mastery" ? 0 : (_a = inventory[goal.name]) !== null && _a !== void 0 ? _a : 0;
        const outstanding = Math.max(0, goal.quantity - have);
        if (outstanding === 0) {
            continue;
        }
        const plan = (0, craftPlanner_1.planCraft)(graph, goal.name, outstanding, Object.assign(Object.assign({}, inventory), { [goal.name]: 0 }), unlimited);
        for (const step of plan.steps) {
            const existing = byName.get(step.name);
            byName.set(step.name, {
                depth: Math.max((_b = existing === null || existing === void 0 ? void 0 : existing.depth) !== null && _b !== void 0 ? _b : 0, step.depth),
                quantity: ((_c = existing === null || existing === void 0 ? void 0 : existing.quantity) !== null && _c !== void 0 ? _c : 0) + step.quantity,
            });
        }
    }
    return [...byName.entries()]
        .sort((a, b) => b[1].depth - a[1].depth)
        .map(([name, entry]) => ({ name, quantity: entry.quantity }));
};
exports.getDesiredQueue = getDesiredQueue;


/***/ }),

/***/ 4764:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseStamina = exports.matchLocationByImage = exports.imageBasename = exports.matchLocationName = exports.findLocationSet = exports.getLocationAdvice = void 0;
// What this location is worth to you right now.
//
// Two halves that the game never puts together. `needed` is the intersection of
// what drops here with what your plans are short of, so a location is judged by
// your backlog rather than by its raw table. `wasted` is the opposite and the
// more useful half: items you are already at the cap on that drop here, whose
// every drop is discarded — and where mastery is still in progress, that is
// also mastery progress being thrown away, since mastery counts acquisition.
const getLocationAdvice = (drops, missing, reasonsByItem, inventory, cap, mastery) => {
    var _a, _b;
    const dropByName = new Map(drops.map((drop) => [drop.name, drop]));
    const needed = [];
    for (const entry of missing) {
        const drop = dropByName.get(entry.name);
        if (!drop) {
            continue;
        }
        needed.push({
            attempts: entry.quantity * drop.rate,
            id: drop.id,
            name: entry.name,
            quantity: entry.quantity,
            rate: drop.rate,
            reasons: (_a = reasonsByItem.get(entry.name)) !== null && _a !== void 0 ? _a : [],
        });
    }
    // cheapest to finish first: this is a list of what to do while standing here
    needed.sort((a, b) => a.attempts - b.attempts);
    const wasted = [];
    if (cap !== undefined) {
        const masteryByName = new Map(mastery.map((entry) => [entry.name, entry]));
        for (const drop of drops) {
            const count = (_b = inventory[drop.name]) !== null && _b !== void 0 ? _b : 0;
            if (count < cap) {
                continue;
            }
            const progress = masteryByName.get(drop.name);
            wasted.push({
                count,
                id: drop.id,
                masteryRemaining: progress && progress.remaining > 0 ? progress.remaining : undefined,
                masteryRequired: progress === null || progress === void 0 ? void 0 : progress.required,
                masteryValue: progress === null || progress === void 0 ? void 0 : progress.value,
                name: drop.name,
            });
        }
        // the ones with mastery still owed are the expensive mistakes
        wasted.sort((a, b) => {
            var _a, _b;
            return Number(b.masteryRemaining !== undefined) -
                Number(a.masteryRemaining !== undefined) ||
                ((_a = a.masteryRemaining) !== null && _a !== void 0 ? _a : 0) - ((_b = b.masteryRemaining) !== null && _b !== void 0 ? _b : 0);
        });
    }
    return { needed, wasted };
};
exports.getLocationAdvice = getLocationAdvice;
// Find the saved set that belongs to this location.
//
// Players name these loosely — "Explore - Mount Banon", "Misty Forest",
// "explore - highland hills" — so the location name appearing anywhere in the
// set name is the signal.
//
// Containment alone is not enough, though: "Misty Forest" contains "Forest", so
// standing in Forest would claim the Misty Forest set, and a word-boundary test
// does not help because it genuinely contains that word. A set therefore belongs
// to the *most specific* location it names — the longest of every known location
// name found in it — which gives "Misty Forest" to Misty Forest and leaves
// Forest with nothing.
const findLocationSet = (locationName, sets, allLocationNames) => {
    var _a;
    const needle = locationName.trim().toLowerCase();
    if (!needle) {
        return undefined;
    }
    const names = [...allLocationNames].map((name) => name.toLowerCase());
    const matches = sets.filter((set) => {
        const label = set.name.trim().toLowerCase();
        if (!label.includes(needle)) {
            return false;
        }
        const mostSpecific = names
            .filter((name) => label.includes(name))
            .sort((a, b) => b.length - a.length)[0];
        return mostSpecific === needle;
    });
    if (matches.length === 0) {
        return undefined;
    }
    // an already-loaded match is the answer regardless of length: there is
    // nothing to suggest changing
    return ((_a = matches.find((set) => set.isActive)) !== null && _a !== void 0 ? _a : matches.sort((a, b) => b.name.length - a.name.length)[0]);
};
exports.findLocationSet = findLocationSet;
// Match a page title against the known location names. Exact first, then a
// containment test, because the navbar sometimes decorates the name.
const matchLocationName = (title, locationNames) => {
    const cleaned = title.trim().toLowerCase();
    if (!cleaned) {
        return undefined;
    }
    const names = [...locationNames];
    const exact = names.find((name) => name.toLowerCase() === cleaned);
    if (exact) {
        return exact;
    }
    // longest wins, so "Gary's Crushroom Expanded" is not shadowed by "Gary's
    // Crushroom"
    return names
        .filter((name) => cleaned.includes(name.toLowerCase()))
        .sort((a, b) => b.length - a.length)[0];
};
exports.matchLocationName = matchLocationName;
const imageBasename = (source) => { var _a, _b; return (_b = (_a = source.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split("?")[0].toLowerCase()) !== null && _b !== void 0 ? _b : ""; };
exports.imageBasename = imageBasename;
// Identify a location from the picture at the top of its page.
//
// The explore page prints no name anywhere in its body — the header image is
// the only identifier — and buddy.farm's search index already carries an image
// per location, so this costs nothing extra. A basename shared by more than one
// location (pond.png belongs to both Small Pond and Farm Pond) is treated as
// unknown rather than guessed at.
const matchLocationByImage = (source, locations) => {
    const needle = (0, exports.imageBasename)(source);
    if (!needle) {
        return undefined;
    }
    const matches = locations.filter((location) => (0, exports.imageBasename)(location.image) === needle);
    return matches.length === 1 ? matches[0].name : undefined;
};
exports.matchLocationByImage = matchLocationByImage;
// "23,034 / 85 Stamina" -> 23034.
//
// The left figure is the stamina actually banked, which runs far above the
// right one because consumables stack past it; the right is only the natural
// maximum. So the left is the number that says how much exploring is affordable
// right now, and the right is ignored.
const parseStamina = (text) => {
    const match = /([\d,]+)\s*\/\s*[\d,]+\s*stamina/i.exec(text);
    if (!match) {
        return undefined;
    }
    const value = Number(match[1].replaceAll(",", ""));
    return Number.isNaN(value) ? undefined : value;
};
exports.parseStamina = parseStamina;


/***/ }),

/***/ 6783:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.notifications = exports.removeNotification = exports.sendNotification = exports.registerNotificationHandler = exports.Handler = exports.NotificationId = void 0;
const page_1 = __webpack_require__(7952);
const object_1 = __webpack_require__(7968);
const KEY_NOTIFICATIONS = "notifications";
var NotificationId;
(function (NotificationId) {
    NotificationId["FIELD"] = "field";
    NotificationId["MAILBOX"] = "mailbox";
    NotificationId["MEAL"] = "meal";
    NotificationId["OVEN"] = "oven";
    NotificationId["PERKS"] = "perks";
    NotificationId["PETS"] = "pets";
    NotificationId["UPDATE"] = "update";
})(NotificationId || (exports.NotificationId = NotificationId = {}));
var Handler;
(function (Handler) {
    Handler["CHANGES"] = "updateChanges";
    Handler["COLLECT_MAIL"] = "collectMail";
    Handler["COLLECT_MEALS"] = "collectMeals";
    Handler["COLLECT_PETS"] = "collectPets";
    Handler["HARVEST"] = "harvest";
    Handler["UPDATE"] = "update";
})(Handler || (exports.Handler = Handler = {}));
const isHandlerNotificationAction = (action) => "handler" in action;
const isHandlerNotification = (notification) => "handler" in notification;
const isLinkNotification = (notification) => "href" in notification;
const isTextNotification = (notification) => !isHandlerNotification(notification) && !isLinkNotification(notification);
const state = {
    notifications: [],
};
const notificationHandlers = new Map();
const registerNotificationHandler = (handlerName, handler) => {
    notificationHandlers.set(handlerName, handler);
};
exports.registerNotificationHandler = registerNotificationHandler;
const sendNotification = (notification) => {
    state.notifications = [
        ...state.notifications.filter(({ id }) => id !== notification.id),
        notification,
    ];
    renderNotifications(true);
};
exports.sendNotification = sendNotification;
const removeNotification = (notification) => {
    const notificationId = (0, object_1.isObject)(notification)
        ? notification.id
        : notification;
    state.notifications = state.notifications.filter(({ id }) => id !== notificationId);
    renderNotifications();
};
exports.removeNotification = removeNotification;
// What a banner should look like on the page: its id, colour, text and the
// labels of its actions. Stamped onto the element as it's drawn, so a later
// render can tell whether the page already shows the current state instead of
// just counting how many banners are on it.
const toSignature = (notification) => {
    var _a, _b, _c;
    return [
        notification.id,
        (_a = notification.class) !== null && _a !== void 0 ? _a : "",
        notification.text,
        ...((_c = (_b = notification.actions) === null || _b === void 0 ? void 0 : _b.map((action) => action.text)) !== null && _c !== void 0 ? _c : []),
    ].join("|");
};
const renderNotifications = (force = false) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const pageContent = (_a = (0, page_1.getCurrentPage)()) === null || _a === void 0 ? void 0 : _a.querySelector(".page-content");
    if (!pageContent) {
        console.error("Page content not found");
        return;
    }
    // What belongs on THIS page. Excluded notifications used to be skipped from
    // inside the render loop with a `return`, which — since notifications render
    // in id order — also dropped every notification sorted after the excluded
    // one: on the farm page, where "field" is excluded, that silently killed the
    // oven, meal, pets and update banners too. Filtering up front fixes that, and
    // gives the no-op check below the right number to compare against (against
    // the unfiltered total it could never match on a page with an exclusion, so
    // every render wiped and rebuilt every banner).
    //
    // A notification is excluded if EITHER signal says we are on its own page: the
    // page element's `data-page`, or the route in the address bar. Matching on
    // `data-page` alone means one attribute the game is free to rename decides
    // whether "Meals are ready!" is hidden while you are standing in the kitchen —
    // and when it doesn't match, the banner nags about work you are already there
    // to do. The perk code stopped trusting that attribute by itself for the same
    // reason.
    const currentPage = (0, page_1.getCurrentPage)();
    // Banners belong to the page you are looking at, and only that one. Framework7
    // keeps the page you came from in the DOM — banners and all — so every render
    // left a second, frozen copy sitting in a hidden page, ready to be shown again
    // the moment you navigated back. Since this render only ever touches the
    // current page's own container, those copies were never corrected or cleared;
    // they are the "banner that won't go away" when the thing it announced is long
    // since done. Sweep them on every render: whatever the page you land on should
    // be showing is drawn below.
    //
    // Scoped to the main view, and skipped entirely if the page we're drawing
    // into isn't in it: getCurrentPage() searches the whole document, and the
    // side panel holds a view of its own whose pages carry the same classes. If
    // that ever wins, drawing into the panel is the old, harmless mistake —
    // sweeping the real page's banners on the way there would not be.
    if (pageContent.closest(".view-main")) {
        for (const stray of document.querySelectorAll(".view-main .fh-notification")) {
            if (!pageContent.contains(stray)) {
                stray.remove();
            }
        }
    }
    const pageIds = new Set([currentPage === null || currentPage === void 0 ? void 0 : currentPage.dataset.page, (0, page_1.getHashPage)()]);
    const visibleNotifications = state.notifications
        .filter(({ excludePages }) => !(excludePages === null || excludePages === void 0 ? void 0 : excludePages.some((page) => pageIds.has(page))))
        .toSorted((a, b) => a.id.localeCompare(b.id) || 0);
    // Skip the rebuild only if what's on the page is what we would draw. This
    // compared the NUMBER of banners before, which the game's own navigation
    // defeats: Framework7 keeps the page you came from in the DOM, banners and
    // all, and re-shows that same element when you go back — so a page you return
    // to arrives carrying the banners it had when you left. Same count, so the
    // render bailed out and the old text stayed: "Crops are ready!" after you
    // harvested, "Ovens need attention" after you attended to them. Whichever
    // banner was on the page you keep coming back to looked frozen in time, which
    // is why this seemed to be about one page rather than all of them.
    const notifications = pageContent.querySelectorAll(".fh-notification");
    // Sorted on both sides so this doesn't quietly depend on the order the elements
    // go in below (they're prepended, which reverses them). The order itself comes
    // from the id sort above, so it can't change unless the set does.
    const rendered = [...notifications]
        .map((element) => { var _a; return (_a = element.dataset.fhSignature) !== null && _a !== void 0 ? _a : ""; })
        .toSorted()
        .join("");
    const expected = visibleNotifications
        .map((notification) => toSignature(notification))
        .toSorted()
        .join("");
    if (!force && rendered === expected) {
        return;
    }
    for (const notification of notifications) {
        notification.remove();
    }
    // add new notifications
    for (const notification of visibleNotifications) {
        // replace native notification if relevant
        if (notification.replacesHref) {
            const link = currentPage === null || currentPage === void 0 ? void 0 : currentPage.querySelector(`a[href="${notification.replacesHref}"]`);
            if ((_b = link === null || link === void 0 ? void 0 : link.classList) === null || _b === void 0 ? void 0 : _b.contains("button")) {
                link.remove();
            }
            if ((_d = (_c = link === null || link === void 0 ? void 0 : link.parentElement) === null || _c === void 0 ? void 0 : _c.classList) === null || _d === void 0 ? void 0 : _d.contains("button")) {
                link.parentElement.remove();
            }
        }
        const notificationElement = document.createElement(isTextNotification(notification) ? "span" : "a");
        notificationElement.classList.add("button");
        notificationElement.classList.add("fh-notification");
        notificationElement.style.cursor = isTextNotification(notification)
            ? "default"
            : "pointer";
        if (notification.class) {
            notificationElement.classList.add(notification.class);
        }
        notificationElement.textContent = notification.text;
        notificationElement.dataset.fhSignature = toSignature(notification);
        if (isHandlerNotification(notification)) {
            notificationElement.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
                event.preventDefault();
                event.stopPropagation();
                const handler = notificationHandlers.get(notification.handler);
                if (handler) {
                    yield handler(notification);
                }
                else {
                    console.error(`Handler not found: ${notification.handler}`);
                }
                (0, exports.removeNotification)(notification);
                renderNotifications();
            }));
        }
        else if (isLinkNotification(notification)) {
            notificationElement.setAttribute("href", notification.href);
        }
        for (const action of (_e = notification.actions) !== null && _e !== void 0 ? _e : []) {
            notificationElement.append(document.createTextNode(((_f = notification.actions) === null || _f === void 0 ? void 0 : _f.indexOf(action)) === 0 ? " " : " / "));
            const actionElement = document.createElement("a");
            actionElement.classList.add("fh-notification-action");
            actionElement.style.cursor = "pointer";
            actionElement.textContent = action.text;
            if (isHandlerNotificationAction(action)) {
                actionElement.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
                    actionElement.textContent = "Loading...";
                    event.preventDefault();
                    event.stopPropagation();
                    const handler = notificationHandlers.get(action.handler);
                    if (handler) {
                        yield handler(notification);
                    }
                    else {
                        console.error(`Handler not found: ${action.handler}`);
                    }
                    renderNotifications();
                }));
            }
            else {
                actionElement.href = action.href;
            }
            notificationElement.append(actionElement);
        }
        if ((_g = pageContent.firstElementChild) === null || _g === void 0 ? void 0 : _g.classList.contains("pull-to-refresh-layer")) {
            pageContent.insertBefore(notificationElement, pageContent.children[1]);
        }
        else {
            pageContent.prepend(notificationElement);
        }
    }
};
// Re-draw when the game slides a different page into view. onPageLoad is driven
// by a childList observer, so it only fires when a page element is ADDED —
// which going BACK doesn't do: Framework7 keeps the previous page in the DOM and
// re-shows it by changing its class. So on back-navigation nothing here ran, and
// the page arrived showing whatever banners it had when you left it, with no
// render to correct them. Watching the class instead catches every transition,
// forward and back.
//
// Cheap to be wrong about: a render whose result matches what's already drawn
// returns without touching the DOM.
let renderTimeout;
const scheduleRender = () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => renderNotifications(), 100);
};
const watchPageTransitions = () => {
    const pages = document.querySelector(".view-main .pages");
    if (!pages) {
        console.error("Pages not found");
        return;
    }
    const observer = new MutationObserver((mutations) => {
        var _a, _b;
        for (const mutation of mutations) {
            // Only a page's own class, never a descendant's: with subtree watching,
            // the classes this render puts on the banners it creates would otherwise
            // schedule another render, and so on.
            if ((_b = (_a = mutation.target).matches) === null || _b === void 0 ? void 0 : _b.call(_a, ".page")) {
                scheduleRender();
                return;
            }
        }
    });
    observer.observe(pages, {
        attributeFilter: ["class"],
        attributes: true,
        subtree: true,
    });
};
exports.notifications = {
    onInitialize: () => {
        watchPageTransitions();
    },
    onPageLoad: () => {
        setTimeout(renderNotifications, 500);
    },
};


/***/ }),

/***/ 7968:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isObject = void 0;
const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;
exports.isObject = isObject;


/***/ }),

/***/ 7952:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getListByTitle = exports.getCardByTitle = exports.getTitle = exports.setTitle = exports.getCurrentPage = exports.getPreviousPage = exports.getHashPage = exports.getPage = exports.WorkerGo = exports.Page = void 0;
var Page;
(function (Page) {
    Page["AREA"] = "area";
    Page["BANK"] = "bank";
    Page["CRAFTWORKS"] = "craftworks";
    Page["BIO"] = "settings_bio";
    Page["FARM"] = "xfarm";
    Page["FARMERS_MARKET"] = "market";
    Page["FISHING"] = "fishing";
    Page["FRIENDSHIP"] = "npclevels";
    Page["HOME_PAGE"] = "index-1";
    Page["HOME_PATH"] = "index";
    Page["INVENTORY"] = "inventory";
    Page["ITEM"] = "item";
    Page["KITCHEN"] = "kitchen";
    Page["LOCKSMITH"] = "locksmith";
    Page["MAILBOX"] = "mailbox";
    Page["MASTERY"] = "mastery";
    Page["MINING"] = "mining";
    Page["OVEN"] = "oven";
    Page["PASTURE"] = "pasture";
    Page["PERKS"] = "perks";
    Page["PETS"] = "allpetitems";
    Page["PIG_PEN"] = "pigpen";
    Page["POST_OFFICE"] = "postoffice";
    Page["PROFILE"] = "profile";
    Page["QUEST"] = "quest";
    Page["QUESTS"] = "quests";
    Page["SETTINGS"] = "settings";
    Page["SETTINGS_OPTIONS"] = "settings_options";
    Page["TEMPLE"] = "mailitems";
    Page["VAULT"] = "crack";
    Page["WELL"] = "well";
    Page["WHEEL"] = "spin";
    Page["WORKER"] = "worker";
    Page["WORKSHOP"] = "workshop";
})(Page || (exports.Page = Page = {}));
var WorkerGo;
(function (WorkerGo) {
    WorkerGo["ACTIVATE_PERK_SET"] = "activateperkset";
    WorkerGo["SET_BIO"] = "settings_bio";
    WorkerGo["COLLECT_ALL_PET_ITEMS"] = "collectallpetitems";
    WorkerGo["COLLECT_ALL_MAIL_ITEMS"] = "collectallmailitems";
    WorkerGo["COLLECT_ALL_MEALS"] = "cookreadyall";
    WorkerGo["COOK_ALL"] = "cookitemall";
    WorkerGo["DEPOSIT_SILVER"] = "depositsilver";
    WorkerGo["FARM_STATUS"] = "farmstatus";
    WorkerGo["GET_STATS"] = "getstats";
    WorkerGo["HARVEST_ALL"] = "harvestall";
    WorkerGo["NOTES"] = "notes";
    WorkerGo["PLANT_ALL"] = "plantall";
    WorkerGo["READY_COUNT"] = "readycount";
    WorkerGo["RESET_PERKS"] = "resetperks";
    WorkerGo["SEASON_MEALS"] = "seasonmealsall";
    WorkerGo["STIR_MEALS"] = "stirmealsall";
    WorkerGo["TASTE_MEALS"] = "tastemealsall";
    WorkerGo["USE_ITEM"] = "useitem";
    WorkerGo["WITHDRAW_SILVER"] = "withdrawalsilver";
})(WorkerGo || (exports.WorkerGo = WorkerGo = {}));
// get page and parameters if any
const getPage = () => {
    const currentPage = (0, exports.getCurrentPage)();
    const page = currentPage === null || currentPage === void 0 ? void 0 : currentPage.dataset.page;
    const parameters = new URLSearchParams(window.location.hash.split("?")[1]);
    return [page, parameters];
};
exports.getPage = getPage;
// The route the game is currently on, read from the address bar
// (`#!/kitchen.php` -> `kitchen`). A second opinion on top of `getPage()`, whose
// `data-page` attribute this fork has found unreliable often enough that the
// perk code matches several pages by URL instead. Undefined on the shell itself,
// where there is no route yet.
const getHashPage = () => {
    const [path] = window.location.hash.replace(/^#!?\/*/, "").split("?");
    return path ? path.replace(".php", "") : undefined;
};
exports.getHashPage = getHashPage;
const getPreviousPage = () => document.querySelector(".page-on-left");
exports.getPreviousPage = getPreviousPage;
const getCurrentPage = () => document.querySelector(".page-on-center, .page-from-right-to-center, .view-main .page:only-child");
exports.getCurrentPage = getCurrentPage;
const setTitle = (title) => {
    const nav = document.querySelector(".navbar-on-center");
    if (!nav) {
        console.error("Navbar not found");
        return;
    }
    const text = nav === null || nav === void 0 ? void 0 : nav.querySelector("center");
    if (!text) {
        console.error("Center text not found");
        return;
    }
    text.textContent = title;
};
exports.setTitle = setTitle;
const getTitle = (searchTitle, root) => {
    var _a;
    const currentPage = root !== null && root !== void 0 ? root : (0, exports.getCurrentPage)();
    if (!currentPage) {
        console.error("Current page not found");
        return null;
    }
    const titles = currentPage.querySelectorAll(".content-block-title");
    const targetTitle = [...titles].find((title) => searchTitle instanceof RegExp
        ? searchTitle.test(title.textContent || "")
        : title.textContent === searchTitle);
    return (_a = targetTitle) !== null && _a !== void 0 ? _a : null;
};
exports.getTitle = getTitle;
const getCardByTitle = (searchTitle, root) => {
    const targetTitle = (0, exports.getTitle)(searchTitle, root);
    if (!targetTitle) {
        console.error(`${searchTitle} title not found`);
        return null;
    }
    return targetTitle.nextElementSibling;
};
exports.getCardByTitle = getCardByTitle;
const getListByTitle = (searchTitle, root) => {
    const targetCard = (0, exports.getCardByTitle)(searchTitle, root);
    if (!targetCard) {
        console.error(`${searchTitle} card not found`);
        return null;
    }
    return targetCard.querySelector("ul");
};
exports.getListByTitle = getListByTitle;


/***/ }),

/***/ 469:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.popups = exports.showPopup = void 0;
const showPopup = ({ title, contentHTML, align, okText, actions, }) => new Promise((resolve) => {
    var _a;
    let overlay = document.querySelector(".modal-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.classList.add("modal-overlay");
        document.body.append(overlay);
    }
    overlay.classList.add("modal-overlay-visible");
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.classList.add("modal-in");
    modal.style.display = "block";
    modal.style.width = "auto";
    modal.style.maxWidth = "75vw";
    modal.style.maxHeight = "75vh";
    modal.innerHTML = `
      <div
        class="modal-inner"
        style="
          text-align: ${align !== null && align !== void 0 ? align : "center"};
          display: flex;
          flex-direction: column;
          height: 100%;
        "
      >
        <div class="modal-title">${title}</div>
        <div
          class="modal-text"
          style="
            overflow-y: auto;
            flex: 1;
          "
        >${contentHTML}</div>
      </div>
      <div
        class="
          modal-buttons
          modal-buttons-vertical
          modal-buttons-${((_a = actions === null || actions === void 0 ? void 0 : actions.length) !== null && _a !== void 0 ? _a : 0) + 1}
        ">
        ${actions
        ? actions
            .map(({ name, buttonClass }, index) => `
              <span
                class="modal-button modal-button-bold fh-action button ${buttonClass}"
                data-index="${index}"
              >
                ${name}
              </span>`)
            .join("")
        : ""}
        <span class="modal-button fh-ok">${okText !== null && okText !== void 0 ? okText : "OK"}</span>
      </div>
    `;
    if (actions) {
        for (const [index, { callback }] of actions.entries()) {
            const button = modal.querySelector(`.fh-action[data-index='${index}']`);
            button === null || button === void 0 ? void 0 : button.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                button.textContent = "Loading...";
                yield callback();
                overlay === null || overlay === void 0 ? void 0 : overlay.classList.remove("modal-overlay-visible");
                modal.remove();
                resolve();
            }));
        }
    }
    const okButton = modal.querySelector(".fh-ok");
    okButton === null || okButton === void 0 ? void 0 : okButton.addEventListener("click", () => {
        overlay === null || overlay === void 0 ? void 0 : overlay.classList.remove("modal-overlay-visible");
        modal.remove();
        resolve();
    });
    document.body.append(modal);
    const offset = modal.getBoundingClientRect();
    modal.style.marginTop = `-${offset.height / 2}px`;
    modal.style.marginLeft = `-${offset.width / 2}px`;
});
exports.showPopup = showPopup;
exports.popups = {
    onInitialize: () => {
        document.head.insertAdjacentHTML("beforeend", `
        <style>
          /* hide duplicate modal overlays */
          .modal-overlay-visible ~ .modal-overlay-visible {
            opacity: 0;
          }
        <style>
      `);
        // click outside to close
        document.body.addEventListener("click", (event) => {
            var _a, _b;
            if (event.target.classList.contains("modal-overlay")) {
                const buttons = document.querySelectorAll(".modal .modal-button");
                (_b = (_a = [...buttons]) === null || _a === void 0 ? void 0 : _a.at(-1)) === null || _b === void 0 ? void 0 : _b.click();
            }
        });
    },
};


/***/ }),

/***/ 6762:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.orUndefined = void 0;
// Resolve to undefined instead of rejecting.
//
// Every caller here is decorating the page with extra detail — a drop location,
// a queue read — so a failed lookup should leave that detail out, not take the
// whole panel down with it. Written once because the lint rule against a bare
// `undefined` return and TypeScript's refusal to accept `void` in its place
// cannot both be satisfied inline.
const orUndefined = (promise) => 
// eslint-disable-next-line unicorn/no-useless-undefined
promise.catch(() => undefined);
exports.orUndefined = orUndefined;


/***/ }),

/***/ 3813:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDocument = exports.corsFetch = void 0;
const corsFetch = (url, options) => new Promise((resolve, reject) => {
    var _a;
    GM.xmlHttpRequest(Object.assign(Object.assign({}, options), { method: (_a = options === null || options === void 0 ? void 0 : options.method) !== null && _a !== void 0 ? _a : "GET", url, onload: (response) => {
            resolve({
                headers: new Headers(),
                ok: response.status >= 200 && response.status < 300,
                redirected: url !== response.finalUrl,
                status: response.status,
                statusText: response.statusText,
                type: "default",
                url: response.finalUrl,
                text: () => Promise.resolve(response.responseText),
                json: () => Promise.resolve(JSON.parse(response.responseText)),
                formData: () => Promise.resolve(new FormData()),
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                blob: () => Promise.resolve(new Blob([response.responseText])),
            });
        }, onerror: reject, onabort: reject, ontimeout: reject }));
});
exports.corsFetch = corsFetch;
const getDocument = (response) => __awaiter(void 0, void 0, void 0, function* () {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const htmlString = yield response.text();
    return new DOMParser().parseFromString(htmlString, "text/html");
});
exports.getDocument = getDocument;


/***/ }),

/***/ 126:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerExportToNotes = exports.setSetting = exports.getSetting = exports.setData = exports.getData = exports.getSettingValues = exports.getDefaultSettings = exports.getSettings = exports.registerSettings = exports.SettingId = void 0;
var SettingId;
(function (SettingId) {
    SettingId["ATTENTION_NOTIFICATIONS"] = "attentionNotifications";
    SettingId["ATTENTION_NOTIFICATIONS_VERBOSE"] = "attentionNotificationsVerbose";
    SettingId["AUTOCOMPLETE_ITEMS"] = "autocompleteItems";
    SettingId["AUTOCOMPLETE_USERS"] = "autocompleteUsers";
    SettingId["BANKER"] = "banker";
    SettingId["BRIEFING_PANEL"] = "briefingPanel";
    SettingId["BUDDY_FARM"] = "buddyFarm";
    SettingId["CHAT_COMPRESS"] = "compressChat";
    SettingId["CHAT_DISMISSABLE_BANNERS"] = "dismissableChatBanners";
    SettingId["CHAT_HIGHLIGHT_SELF"] = "highlightSelfInChat";
    SettingId["CHAT_MAILBOX_STATS"] = "chatMailboxStats";
    SettingId["COLLAPSE_ITEM"] = "collapseItem";
    SettingId["COMPACT_SILVER"] = "compactSilver";
    SettingId["CRAFT_PLANNER"] = "craftPlanner";
    SettingId["CRAFTWORKS_ADVISOR"] = "craftworksAdvisor";
    SettingId["EXPLORE_FIRST"] = "exploreFirst";
    SettingId["FOCUS_DASHBOARD"] = "focusDashboard";
    SettingId["EXPLORE_IMPROVED"] = "exploreImproved";
    SettingId["EXPORT"] = "export";
    SettingId["FIELD_EMPTY_NOTIFICATIONS"] = "fieldEmptyNotifications";
    SettingId["FISH_IN_BARREL"] = "fishInBarrel";
    SettingId["FLEA_MARKET"] = "fleaMarket";
    SettingId["HARVEST_NOTIFICATIONS"] = "harvestNotifications";
    SettingId["HARVEST_POPUP"] = "harvestPopup";
    SettingId["HOME_COMPRESS_SKILLS"] = "homeCompressSkills";
    SettingId["HOME_HIDE_FOOTER"] = "homeHideFooter";
    SettingId["HOME_HIDE_PLAYERS"] = "homeHidePlayers";
    SettingId["HOME_HIDE_THEME"] = "homeHideTheme";
    SettingId["IMPORT"] = "import";
    SettingId["IMPROVED_INPUTS"] = "improvedInputs";
    SettingId["INVENTORY_CAP_TRACKER"] = "inventoryCapTracker";
    SettingId["INVENTORY_CAP_WARNINGS"] = "inventoryCapWarnings";
    SettingId["KITCHEN_COMPLETE_NOTIFICATIONS"] = "readyNotifications";
    SettingId["KITCHEN_EMPTY_NOTIFICATIONS"] = "kitchenEmptyNotifications";
    SettingId["LOCATION_ADVISOR"] = "locationAdvisor";
    SettingId["MAX_ANIMALS"] = "maxAnimals";
    SettingId["MAX_CONTAINERS"] = "maxContainers";
    SettingId["MEAL_NOTIFICATIONS"] = "mealNotifications";
    SettingId["MINER"] = "miner";
    SettingId["MINER_BOMBS"] = "minerBombs";
    SettingId["MINER_EXPLOSIVES"] = "minerExplosives";
    SettingId["NAV_ADD_MENU"] = "bottomMenu";
    SettingId["NAV_ALIGN_BOTTOM"] = "alignBottomNav";
    SettingId["NAV_COMPRESS"] = "compressNav";
    SettingId["NAV_CUSTOM"] = "customNav";
    SettingId["NAV_HIDE_LOGO"] = "noLogoNav";
    SettingId["PERK_MANAGER"] = "perkManager";
    SettingId["QUEST_COLLAPSE"] = "questCollapse";
    SettingId["QUEST_TAGGING"] = "questTagging";
    SettingId["QUICKSELL_SAFELY"] = "quicksellSafely";
    SettingId["UNLIMITED_ITEMS"] = "unlimitedItems";
    SettingId["UPDATE_AT_TOP"] = "updateAtTop";
    SettingId["VAULT_SOLVER"] = "vaultSolver";
})(SettingId || (exports.SettingId = SettingId = {}));
const settings = [];
const registerSettings = (...newSettings) => {
    settings.push(...newSettings);
};
exports.registerSettings = registerSettings;
const getSettings = () => settings;
exports.getSettings = getSettings;
const getDefaultSettings = () => {
    var _a;
    const settings = {};
    for (const setting of (0, exports.getSettings)()) {
        settings[setting.id] = (_a = setting === null || setting === void 0 ? void 0 : setting.value) !== null && _a !== void 0 ? _a : setting.defaultValue;
    }
    return settings;
};
exports.getDefaultSettings = getDefaultSettings;
const getSettingValues = () => __awaiter(void 0, void 0, void 0, function* () {
    const settings = {};
    for (const setting of (0, exports.getSettings)()) {
        settings[setting.id] = yield GM.getValue(setting.id, setting.defaultValue);
    }
    return settings;
});
exports.getSettingValues = getSettingValues;
const toDataKey = (setting) => typeof setting === "string" ? `${setting}_data` : `${setting.id}_data`;
const getData = (setting, defaultValue) => __awaiter(void 0, void 0, void 0, function* () {
    const key = toDataKey(setting);
    if (!key) {
        return defaultValue;
    }
    const value = yield GM.getValue(key, defaultValue);
    if (typeof value !== "object") {
        return defaultValue;
    }
    return value;
});
exports.getData = getData;
const setData = (setting, data) => __awaiter(void 0, void 0, void 0, function* () {
    const key = toDataKey(setting);
    if (!key) {
        return false;
    }
    if (typeof data !== "object") {
        return false;
    }
    const previous = yield GM.getValue(key, null);
    yield GM.setValue(key, data);
    const changed = JSON.stringify(previous) !== JSON.stringify(data);
    if (changed) {
        yield exportToNotes();
    }
    return changed;
});
exports.setData = setData;
const getSetting = (setting) => __awaiter(void 0, void 0, void 0, function* () {
    return (Object.assign(Object.assign({}, setting), { value: yield GM.getValue(setting.id, setting.defaultValue) }));
});
exports.getSetting = getSetting;
const setSetting = (setting) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const previous = yield GM.getValue(setting.id, setting.defaultValue);
    const value = (_a = setting.value) !== null && _a !== void 0 ? _a : setting.defaultValue;
    yield GM.setValue(setting.id, value);
    const changed = previous !== value;
    if (changed) {
        yield exportToNotes();
    }
    return changed;
});
exports.setSetting = setSetting;
// hack to avoid circular dependency
let _exportToNotes;
const registerExportToNotes = (exporter) => {
    _exportToNotes = exporter;
};
exports.registerExportToNotes = registerExportToNotes;
const exportToNotes = () => { var _a; return (_a = _exportToNotes === null || _exportToNotes === void 0 ? void 0 : _exportToNotes()) !== null && _a !== void 0 ? _a : Promise.resolve(); };


/***/ }),

/***/ 4782:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CachedState = exports.StorageKey = void 0;
const object_1 = __webpack_require__(7968);
const requests_1 = __webpack_require__(3300);
var StorageKey;
(function (StorageKey) {
    StorageKey["CHAT_BANNERS"] = "chatBanners";
    StorageKey["CRAFTWORKS"] = "craftworks";
    StorageKey["CURRENT_PERKS_SET_ID"] = "currentPerksSetId";
    StorageKey["FARM_ID"] = "farmId";
    StorageKey["FARM_STATE"] = "farmState";
    StorageKey["FARM_STATUS"] = "farmStatus";
    StorageKey["INVENTORY"] = "inventory";
    StorageKey["IS_BETA"] = "isBeta";
    StorageKey["IS_CHAT_ENABLED"] = "isChatEnabled";
    StorageKey["IS_DARK_MODE"] = "isDarkMode";
    StorageKey["IS_MUSIC_ENABLED"] = "isMusicEnabled";
    StorageKey["ITEM_DATA"] = "items";
    StorageKey["KITHCEN_STATUS"] = "kitchenStatus";
    StorageKey["LATEST_VERSION"] = "latestVersion";
    StorageKey["LOCATION_DATA"] = "locationData";
    StorageKey["MAILBOX"] = "mailbox";
    StorageKey["MASTERY"] = "mastery";
    StorageKey["MEALS_STATUS"] = "mealsStatus";
    StorageKey["NOTES"] = "notes";
    StorageKey["PAGE_DATA"] = "pageData";
    StorageKey["PERKS_SETS"] = "perkSets";
    StorageKey["PETS"] = "pets";
    StorageKey["PLAYER_MAILBOXES"] = "playerMailboxes";
    StorageKey["PLAYERS"] = "players";
    StorageKey["QUEST_DATA"] = "questData";
    StorageKey["RECENT_UPDATE"] = "recentUpdate";
    StorageKey["STATS"] = "stats";
    StorageKey["USERNAME"] = "username";
    StorageKey["USER_ID"] = "userId";
})(StorageKey || (exports.StorageKey = StorageKey = {}));
const QUERYLESS_KEY = "__QUERYLESS__";
const toQueryKey = (query) => query !== null && query !== void 0 ? query : QUERYLESS_KEY;
const lazyQueue = [];
let isProcessingQueue = false;
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    if (isProcessingQueue) {
        return;
    }
    isProcessingQueue = true;
    while (lazyQueue.length > 0) {
        const task = lazyQueue.shift();
        if (task) {
            yield task();
        }
    }
    // eslint-disable-next-line require-atomic-updates
    isProcessingQueue = false;
}), 1000);
class CachedState {
    constructor(key, fetch, { defaultState, timeout, interceptors = [], persist = true, }) {
        this.state = {};
        this.defaultState = defaultState;
        this.fetch = fetch;
        this.gettingByQuery = {};
        this.key = `state_${key}`;
        this.persist = persist;
        this.state = {};
        this.timeout = timeout !== null && timeout !== void 0 ? timeout : 60;
        this.updateListeners = [];
        this.updatedAtByQuery = {};
        for (const interceptor of interceptors) {
            (0, requests_1.registerQueryInterceptor)([this, interceptor]);
        }
        this.load();
    }
    onUpdate(callback) {
        this.updateListeners.push(callback);
    }
    read(query) {
        return this.state[toQueryKey(query)];
    }
    get() {
        return __awaiter(this, arguments, void 0, function* ({ ignoreCache, doNotFetch, query, lazy, } = {}) {
            const queryKey = toQueryKey(query);
            const existingPromise = this.gettingByQuery[queryKey];
            if (existingPromise) {
                console.debug(`[STATE] Waiting for ${this.key} fetch`, existingPromise);
                return yield existingPromise;
            }
            const newPromise = new Promise((resolve) => {
                const queryKey = toQueryKey(query);
                const previous = this.read(query);
                const expires = this.updatedAtByQuery[queryKey] + this.timeout * 1000;
                if (!doNotFetch && (!previous || ignoreCache || expires < Date.now())) {
                    if (lazy) {
                        resolve(previous);
                        lazyQueue.push(() => this.fetch(this, query).then((result) => this.set(result, query)));
                        return;
                    }
                    console.debug(`[STATE] Fetching ${this.key} (query: ${queryKey})`, {
                        ignoreCache,
                        updatedAt: this.updatedAtByQuery[queryKey],
                        timeout: this.timeout,
                        previous,
                    });
                    this.fetch(this, query).then((result) => resolve(this.set(result, query)));
                }
                else {
                    console.debug(`[STATE] Returning cached ${this.key} (query: ${queryKey})`, {
                        ignoreCache,
                        updatedAt: this.updatedAtByQuery[queryKey],
                        timeout: this.timeout,
                        previous,
                    });
                    resolve(this.read(query));
                }
            });
            this.gettingByQuery[queryKey] = newPromise;
            const result = yield newPromise;
            delete this.gettingByQuery[queryKey];
            return result;
        });
    }
    set(input, query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const queryKey = toQueryKey(query);
            const previous = this.state[queryKey];
            const value = (0, object_1.isObject)(this.defaultState)
                ? Object.assign(Object.assign(Object.assign({}, this.defaultState), previous), input) : (_a = input !== null && input !== void 0 ? input : previous) !== null && _a !== void 0 ? _a : this.defaultState;
            if (!value) {
                delete this.state[queryKey];
                console.debug(`[STATE] Deleting ${this.key}.${queryKey}`, undefined, this.state);
                return;
            }
            console.debug(`[STATE] Setting ${this.key}.${queryKey}`, value, this.state);
            this.state[queryKey] = value;
            this.updatedAtByQuery[queryKey] = value === undefined ? 0 : Date.now();
            for (const listener of this.updateListeners) {
                listener(value);
            }
            yield this.save();
            return value;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.persist) {
                return;
            }
            yield GM.setValue(this.key, [this.updatedAtByQuery, this.state]);
        });
    }
    // reads the persisted tuples out of GM storage
    // [updatedAtByQuery, state]
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.persist) {
                return;
            }
            const [updatedAtByQuery, state] = yield GM.getValue(this.key, [{}, {}]);
            this.updatedAtByQuery = updatedAtByQuery;
            this.state = state;
        });
    }
}
exports.CachedState = CachedState;


/***/ }),

/***/ 9262:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRecommendedSet = exports.getSetSuggestions = exports.matchSetNameToItem = exports.getQuestSuggestions = exports.getMasterySuggestions = exports.getFrozenMastery = void 0;
// Mastery is earned by acquiring an item, and an item sitting at the inventory
// cap cannot be acquired — crafting stalls and drops are discarded. So a capped
// item with mastery in progress is not merely a wasted Craftworks slot, it is
// mastery progress that has stopped dead. That is worth saying out loud, because
// nothing in the game connects the two screens.
const getFrozenMastery = (entries, inventory, cap) => {
    if (cap === undefined) {
        return [];
    }
    return entries
        .filter((entry) => { var _a; return entry.remaining > 0 && ((_a = inventory[entry.name]) !== null && _a !== void 0 ? _a : 0) >= cap; })
        .sort((a, b) => a.remaining - b.remaining);
};
exports.getFrozenMastery = getFrozenMastery;
// Mastery tiers worth chasing, nearest first.
//
// Ranked by units still needed rather than percentage: 1 unit off a 100-unit
// tier is a trip to the shop, while 8% off a 1,000,000-unit tier is a month.
// Percentage would rank those the wrong way round.
const getMasterySuggestions = (entries, inventory, cap, tracked, limit = 5) => {
    const already = new Set(tracked.map((goal) => goal.name));
    return entries
        .filter((entry) => entry.remaining > 0 && !already.has(entry.name))
        .sort((a, b) => a.remaining - b.remaining)
        .slice(0, limit)
        .map((entry) => {
        var _a;
        const isFrozen = cap !== undefined && ((_a = inventory[entry.name]) !== null && _a !== void 0 ? _a : 0) >= cap;
        return {
            id: entry.id,
            isFrozen,
            name: entry.name,
            quantity: entry.remaining,
            reason: isFrozen
                ? `mastery ${entry.value.toLocaleString()}/${entry.required.toLocaleString()} — frozen at cap`
                : `mastery ${entry.value.toLocaleString()}/${entry.required.toLocaleString()}`,
            source: "mastery",
        };
    });
};
exports.getMasterySuggestions = getMasterySuggestions;
// Quest requirements the inventory does not already cover.
//
// The suggestion is for the shortfall, not the full requirement, so accepting
// one produces a goal that finishes the quest rather than one that overshoots
// by whatever is already on the shelf.
const getQuestSuggestions = (goals, inventory, tracked, limit = 5) => {
    var _a;
    const already = new Set(tracked.map((goal) => goal.name));
    const byName = new Map();
    for (const goal of goals) {
        for (const need of goal.needs) {
            if (already.has(need.name)) {
                continue;
            }
            const shortfall = need.quantity - ((_a = inventory[need.name]) !== null && _a !== void 0 ? _a : 0);
            if (shortfall <= 0) {
                continue;
            }
            const existing = byName.get(need.name);
            // one item can serve several requests; keep the largest ask so accepting
            // the suggestion satisfies all of them
            if (!existing || shortfall > existing.quantity) {
                byName.set(need.name, {
                    name: need.name,
                    quantity: shortfall,
                    reason: `for ${goal.label}`,
                    source: "quest",
                });
            }
        }
    }
    return [...byName.values()]
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, limit);
};
exports.getQuestSuggestions = getQuestSuggestions;
// Words players append to a set name that is otherwise just the thing they are
// building — "Lantern prereqs" is a Lantern goal.
const SET_NAME_SUFFIXES = [
    "prereqs",
    "prereq",
    "prereqs.",
    "parts",
    "mats",
    "materials",
    "chain",
    "line",
];
// Work out which item a saved Craftworks set is aiming at, from its name alone.
//
// Set contents are unreadable without activating the set, so the name is all
// there is. Matching is case-insensitive because players are casual about it
// ("Fancy table"), and a trailing qualifier is stripped so "Lantern prereqs"
// still resolves. Anything that does not resolve to a real item — a location
// loadout like "Explore - Mount Banon" — simply returns undefined.
const matchSetNameToItem = (setName, itemNames) => {
    const byLower = new Map();
    for (const name of itemNames) {
        byLower.set(name.toLowerCase(), name);
    }
    const cleaned = setName.trim().toLowerCase();
    const direct = byLower.get(cleaned);
    if (direct) {
        return direct;
    }
    for (const suffix of SET_NAME_SUFFIXES) {
        if (cleaned.endsWith(` ${suffix}`)) {
            const trimmed = cleaned.slice(0, -suffix.length - 1).trim();
            const match = byLower.get(trimmed);
            if (match) {
                return match;
            }
        }
    }
    return undefined;
};
exports.matchSetNameToItem = matchSetNameToItem;
// Saved sets named after an item are goals the player has already been keeping
// by hand; surface them as suggestions so the tool can see what they are
// building. Inference from a name, so it is offered rather than adopted.
const getSetSuggestions = (sets, itemNames, tracked, inventory, limit = 4) => {
    var _a;
    const already = new Set(tracked.map((goal) => goal.name));
    const names = [...itemNames];
    const seen = new Set();
    const suggestions = [];
    for (const set of sets) {
        const item = (0, exports.matchSetNameToItem)(set.name, names);
        if (!item || already.has(item) || seen.has(item)) {
            continue;
        }
        seen.add(item);
        suggestions.push({
            name: item,
            quantity: Math.max(1, 1 - ((_a = inventory[item]) !== null && _a !== void 0 ? _a : 0)),
            reason: set.isActive
                ? `your active set “${set.name}”`
                : `your saved set “${set.name}”`,
            source: "set",
        });
    }
    // the set currently loaded is the one being worked on right now
    return suggestions
        .sort((a, b) => Number(b.reason.includes("active")) -
        Number(a.reason.includes("active")))
        .slice(0, limit);
};
exports.getSetSuggestions = getSetSuggestions;
// The saved set that matches a tracked goal and is not already loaded.
//
// Matching runs the same name inference as getSetSuggestions, in reverse: the
// player named a set after the thing it builds, so a goal for that thing means
// that set is the one to load. The active set is excluded because recommending
// it would be advice to re-run a destructive activation for no change.
const getRecommendedSet = (goals, sets, itemNames) => {
    const names = [...itemNames];
    const wanted = new Set(goals.map((goal) => goal.name.toLowerCase()));
    for (const set of sets) {
        if (set.isActive) {
            continue;
        }
        const item = (0, exports.matchSetNameToItem)(set.name, names);
        if (item && wanted.has(item.toLowerCase())) {
            return { goalName: item, id: set.id, name: set.name };
        }
    }
    return undefined;
};
exports.getRecommendedSet = getRecommendedSet;


/***/ }),

/***/ 1178:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BUTTON_VAULT_BLUE_STYLES = exports.BUTTON_VAULT_YELLOW_STYLES = exports.BUTTON_VAULT_GRAY_STYLES = exports.BUTTON_GRAY_DARK_STYLES = exports.BUTTON_GRAY_STYLES = exports.BUTTON_PURPLE_STYLES = exports.BUTTON_RED_STYLES = exports.BUTTON_GREEN_DARK_STYLES = exports.BUTTON_ORANGE_STYLES = exports.BUTTON_BLUE_STYLES = exports.BUTTON_GREEN_STYLES = exports.generateButton = exports.BUTTON_GRAY_BORDER = exports.BUTTON_GRAY_BACKGROUND = exports.BUTTON_PURPLE_BORDER = exports.BUTTON_PURPLE_BACKGROUND = exports.BUTTON_RED_BORDER = exports.BUTTON_RED_BACKGROUND = exports.BUTTON_BLUE_BORDER = exports.BUTTON_BLUE_BACKGROUND = exports.BUTTON_ORANGE_BORDER = exports.BUTTON_ORANGE_BACKGROUND = exports.BUTTON_GREEN_DARK_BORDER = exports.BUTTON_GREEN_DARK_BACKGROUND = exports.BUTTON_GREEN_BORDER = exports.BUTTON_GREEN_BACKGROUND = exports.INPUT_STYLES = exports.INPUT_BORDER = exports.INPUT_PADDING = exports.BACKGROUND_DARK = exports.BACKGROUND_BLACK = exports.BACKGROUND_WHITE = exports.BORDER_GRAY = exports.TEXT_BLACK = exports.TEXT_SUCCESS = exports.TEXT_WARNING = exports.TEXT_ERROR = exports.TEXT_GRAY = exports.TEXT_WHITE = exports.ALERT_YELLOW_BORDER = exports.ALERT_YELLOW_BACKGROUND = exports.LINK_RED = exports.LINK_GREEN = exports.toCSS = exports.camelToKebab = exports.applyStyles = exports.important = void 0;
const important = (style) => `${style} !important`;
exports.important = important;
const applyStyles = (element, styles) => {
    for (const [key, input] of Object.entries(styles)) {
        const [value, priority] = input.split("!");
        element.style.setProperty(key, value, priority);
    }
};
exports.applyStyles = applyStyles;
const camelToKebab = (input) => input.replaceAll(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
exports.camelToKebab = camelToKebab;
const toCSS = (style) => Object.entries(style)
    .map(([key, value]) => `${(0, exports.camelToKebab)(key)}: ${value}`)
    .join(";\n");
exports.toCSS = toCSS;
// links
exports.LINK_GREEN = "#90EE90";
exports.LINK_RED = "#ED143D";
// alerts
exports.ALERT_YELLOW_BACKGROUND = "#351C04";
exports.ALERT_YELLOW_BORDER = "#41260D";
// text
exports.TEXT_WHITE = "#FFFFFF";
exports.TEXT_GRAY = "#BBBBBB";
exports.TEXT_ERROR = "#FF0000";
exports.TEXT_WARNING = "#FFA500";
exports.TEXT_SUCCESS = "#30D611";
exports.TEXT_BLACK = "#000000";
// borders
exports.BORDER_GRAY = "#393939";
// backgrounds
exports.BACKGROUND_WHITE = "#FFFFFF";
exports.BACKGROUND_BLACK = "#111111";
exports.BACKGROUND_DARK = "#161718";
exports.INPUT_PADDING = "9px 12px";
exports.INPUT_BORDER = `2px solid ${exports.BORDER_GRAY}`;
exports.INPUT_STYLES = {
    background: (0, exports.important)(exports.BACKGROUND_DARK),
    border: (0, exports.important)(exports.INPUT_BORDER),
    borderRadius: (0, exports.important)("0"),
    fontSize: (0, exports.important)("14px"),
    boxShadow: (0, exports.important)("none"),
    color: (0, exports.important)(exports.TEXT_WHITE),
    height: (0, exports.important)("36px"),
    padding: (0, exports.important)(exports.INPUT_PADDING),
    minWidth: (0, exports.important)("100px"),
};
// buttons
exports.BUTTON_GREEN_BACKGROUND = "#003300";
exports.BUTTON_GREEN_BORDER = "#006600";
exports.BUTTON_GREEN_DARK_BACKGROUND = "#001900";
exports.BUTTON_GREEN_DARK_BORDER = "#003300";
exports.BUTTON_ORANGE_BACKGROUND = "#532A02";
exports.BUTTON_ORANGE_BORDER = "#8B4A0D";
exports.BUTTON_BLUE_BACKGROUND = "#101059";
exports.BUTTON_BLUE_BORDER = "#19199B";
exports.BUTTON_RED_BACKGROUND = "#330000";
exports.BUTTON_RED_BORDER = "#660000";
exports.BUTTON_PURPLE_BACKGROUND = "#3A204C";
exports.BUTTON_PURPLE_BORDER = "#4A315C";
exports.BUTTON_GRAY_BACKGROUND = "#444444";
exports.BUTTON_GRAY_BORDER = "#666666";
const generateButton = (background, border, borderStyle = "solid") => ({
    background: (0, exports.important)(background),
    border: (0, exports.important)(`2px ${borderStyle} ${border}`),
    borderRadius: (0, exports.important)("0"),
    boxShadow: (0, exports.important)("none"),
    color: (0, exports.important)(exports.TEXT_WHITE),
    fontSize: (0, exports.important)("14px"),
    cursor: (0, exports.important)("pointer"),
    lineHeight: (0, exports.important)("1"),
    height: (0, exports.important)("36px"),
    padding: (0, exports.important)(exports.INPUT_PADDING),
    width: (0, exports.important)("auto"),
});
exports.generateButton = generateButton;
exports.BUTTON_GREEN_STYLES = (0, exports.generateButton)(exports.BUTTON_GREEN_BACKGROUND, exports.BUTTON_GREEN_BORDER);
exports.BUTTON_BLUE_STYLES = (0, exports.generateButton)(exports.BUTTON_BLUE_BACKGROUND, exports.BUTTON_BLUE_BORDER);
exports.BUTTON_ORANGE_STYLES = (0, exports.generateButton)(exports.BUTTON_ORANGE_BACKGROUND, exports.BUTTON_ORANGE_BORDER);
exports.BUTTON_GREEN_DARK_STYLES = (0, exports.generateButton)(exports.BUTTON_GREEN_DARK_BACKGROUND, exports.BUTTON_GREEN_DARK_BORDER);
exports.BUTTON_RED_STYLES = (0, exports.generateButton)(exports.BUTTON_RED_BACKGROUND, exports.BUTTON_RED_BORDER);
exports.BUTTON_PURPLE_STYLES = (0, exports.generateButton)(exports.BUTTON_PURPLE_BACKGROUND, exports.BUTTON_PURPLE_BORDER);
exports.BUTTON_GRAY_STYLES = (0, exports.generateButton)(exports.BUTTON_GRAY_BACKGROUND, exports.BUTTON_GRAY_BORDER);
exports.BUTTON_GRAY_DARK_STYLES = (0, exports.generateButton)(exports.BORDER_GRAY, exports.BORDER_GRAY);
exports.BUTTON_VAULT_GRAY_STYLES = (0, exports.generateButton)("#666666", "gray");
exports.BUTTON_VAULT_YELLOW_STYLES = (0, exports.generateButton)("#999900", "#CCCC00", "dashed");
exports.BUTTON_VAULT_BLUE_STYLES = (0, exports.generateButton)("#0E7CA6", "#33C7FF");


/***/ }),

/***/ 4808:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isUnlimited = exports.parseUnlimitedItems = exports.NO_UNLIMITED = void 0;
exports.NO_UNLIMITED = new Set();
// Names are compared case-insensitively so a typed setting like "iron, nails"
// still matches the game's "Iron" and "Nails".
const parseUnlimitedItems = (value) => new Set(value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean));
exports.parseUnlimitedItems = parseUnlimitedItems;
const isUnlimited = (unlimited, name) => unlimited.has(name.trim().toLowerCase());
exports.isUnlimited = isUnlimited;


/***/ }),

/***/ 2279:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateGuess = exports.applyGuess = exports.getPossibleDigits = exports.couldHaveDigit = exports.hasDigit = exports.canSolve = exports.generateDigitInfo = exports.isCorrect = exports.Hint = void 0;
const array_1 = __webpack_require__(5818);
var Hint;
(function (Hint) {
    Hint["NONE"] = "\u274C";
    Hint["CORRECT"] = "\u2705";
    Hint["CLOSE"] = "\uD83D\uDFE7";
})(Hint || (exports.Hint = Hint = {}));
const isCorrect = (hints) => hints.every((h) => h === Hint.CORRECT);
exports.isCorrect = isCorrect;
const generateDigitInfo = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => ({
    correctPositions: [],
    possiblePositions: [0, 1, 2, 3],
    digit,
}));
exports.generateDigitInfo = generateDigitInfo;
const canSolve = (info) => {
    const correctPositions = [];
    for (const digitInfo of info) {
        if (digitInfo.correctPositions.length > 0) {
            correctPositions.push(...digitInfo.correctPositions);
        }
    }
    return correctPositions.length === 4;
};
exports.canSolve = canSolve;
const hasDigit = (info) => info.correctPositions.length > 0 ||
    (info.possiblePositions.length > 0 && info.possiblePositions.length < 4);
exports.hasDigit = hasDigit;
const couldHaveDigit = (info) => info.correctPositions.length > 0 || info.possiblePositions.length > 0;
exports.couldHaveDigit = couldHaveDigit;
const getPossibleDigits = (info, position) => {
    const uncalledDigits = [];
    const calledDigits = [];
    for (const digitInfo of info) {
        if (digitInfo.correctPositions.includes(position)) {
            return [digitInfo.digit];
        }
        if ((0, exports.couldHaveDigit)(digitInfo) &&
            digitInfo.possiblePositions.includes(position)) {
            if (digitInfo.correctPositions.length === 0) {
                uncalledDigits.push(digitInfo.digit);
            }
            else {
                calledDigits.push(digitInfo.digit);
            }
        }
    }
    return [...uncalledDigits, ...calledDigits];
};
exports.getPossibleDigits = getPossibleDigits;
const applyGuess = (info, guess, hints) => {
    for (const [position, digit] of guess.entries()) {
        const digitInfo = info[digit];
        switch (hints[position]) {
            case Hint.CORRECT: {
                digitInfo.correctPositions.push(position);
                digitInfo.possiblePositions = digitInfo.possiblePositions.filter((p) => p !== position);
                break;
            }
            case Hint.CLOSE: {
                digitInfo.possiblePositions = digitInfo.possiblePositions.filter((p) => p !== position);
                break;
            }
            case Hint.NONE: {
                digitInfo.possiblePositions = [];
                break;
            }
        }
    }
    const confirmedDigits = [];
    for (const digitInfo of info) {
        if (confirmedDigits.length === 4) {
            digitInfo.correctPositions = [];
            digitInfo.possiblePositions = [];
        }
        else if ((0, exports.hasDigit)(digitInfo)) {
            confirmedDigits.push(digitInfo.digit);
        }
    }
    return info;
};
exports.applyGuess = applyGuess;
const generateGuess = (info, guessIndex) => {
    if (guessIndex === 0) {
        return [0, 1, 2, 3];
    }
    if (guessIndex === 1) {
        return [4, 5, 6, 7];
    }
    const guess = guessIndex === 2 ? [8, 9] : [];
    while (guess.length < 4) {
        const position = guess.length;
        const possibilities = (0, exports.getPossibleDigits)(info, position);
        guess[position] = (() => {
            for (const digit of possibilities) {
                if (!guess.includes(digit)) {
                    return digit;
                }
            }
            return (0, array_1.getRandom)(possibilities);
        })();
    }
    return guess;
};
exports.generateGuess = generateGuess;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(6217);
/******/ 	
/******/ })()
;