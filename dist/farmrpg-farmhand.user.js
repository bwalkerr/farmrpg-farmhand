// ==UserScript==
// @name Farm RPG Farmhand
// @description Farmhand for Farm RPG (fork of anstosa/farmrpg-farmhand) — inventory cap tracker, dependable perk automation with an on-screen indicator, mining support, and notification fixes
// @version 1.1.80
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
exports.getLocationNames = exports.getLocationEntries = exports.townsfolkDataState = exports.locationDataState = exports.questDataState = exports.pageDataState = exports.isItem = exports.getBasicItems = exports.getAbridgedItem = exports.itemDataState = void 0;
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
    var _a, _b, _c, _d, _e, _f;
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
    // the page context's id is the game's quest id (verified: "Fake Fishing
    // I" is quest.php?id=1 in both), which is what lets a quest link in-game
    return Object.assign(Object.assign({}, quest), { id: (_f = (_e = data.result.pageContext) === null || _e === void 0 ? void 0 : _e.id) !== null && _f !== void 0 ? _f : quest.id });
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
    const chosen = plain.length > 0 ? plain : profiles;
    for (const profile of chosen) {
        for (const entry of (_h = profile.items) !== null && _h !== void 0 ? _h : []) {
            if (!((_j = entry.item) === null || _j === void 0 ? void 0 : _j.name) || !entry.rate) {
                continue;
            }
            const existing = best.get(entry.item.name);
            if (!existing || entry.rate < existing.rate) {
                best.set(entry.item.name, {
                    id: entry.item.id,
                    image: entry.item.image,
                    name: entry.item.name,
                    rate: entry.rate,
                });
            }
        }
    }
    // the per-hit figures come with the profile; take the best of the ones we
    // quoted rates from, so the two never describe different assumptions
    const silverPerHit = Math.max(...chosen.map((profile) => { var _a; return (_a = profile.silverPerHit) !== null && _a !== void 0 ? _a : 0; }));
    const xpPerHit = Math.max(...chosen.map((profile) => { var _a; return (_a = profile.xpPerHit) !== null && _a !== void 0 ? _a : 0; }));
    return {
        drops: [...best.values()].sort((a, b) => a.rate - b.rate),
        id,
        name: location.name,
        silverPerHit: silverPerHit > 0 ? silverPerHit : undefined,
        type: location.type,
        xpPerHit: xpPerHit > 0 ? xpPerHit : undefined,
    };
}), {
    timeout: 60 * 60 * 24 * 7, // 1 week
});
// A townsperson's loves, likes and hates, keyed by buddy.farm SLUG (the
// search index hands those out; names like "Charles Horsington III" don't slug
// predictably). Cached a week like items.
exports.townsfolkDataState = new state_1.CachedState(state_1.StorageKey.TOWNSFOLK_DATA, (state, slug) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!slug) {
        return;
    }
    const previous = state.state[slug];
    if (previous) {
        return previous;
    }
    const response = yield fetch(`https://buddy.farm/page-data/t/${slug}/page-data.json`);
    if (!response.ok) {
        return previous;
    }
    const data = (yield response.json());
    const npc = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.farmrpg) === null || _c === void 0 ? void 0 : _c.npcs) === null || _d === void 0 ? void 0 : _d[0];
    if (!npc) {
        console.error(`Townsperson ${slug} not found`);
        return previous;
    }
    return npc;
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
exports.restoreQueue = exports.setQueueRunning = exports.saveSet = exports.activateSet = exports.craftworksState = void 0;
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
// Save an ordered list of items as a named set WITHOUT touching the live queue.
//
// This is the game's own share-page button (`.saveitemsetbtn` -> `savecwset`
// with `cwsetname` and `cwitems`), which saves someone else's shared set as
// yours in one request; the only difference here is that the list comes from
// the panel's plan rather than a share code. `cwitems` is `id|1,id|2,...`, the
// same string craftworks.js builds from the queue when saving from the page.
// Loading the saved set afterwards is the usual (destructive, confirmed)
// activateSet.
const saveSet = (name, itemIds) => __awaiter(void 0, void 0, void 0, function* () {
    const cwitems = itemIds.map((id, index) => `${id}|${index + 1}`).join(",");
    let result;
    try {
        result = yield postWorker(new URLSearchParams({ go: "savecwset", cwsetname: name, cwitems }));
    }
    catch (_a) {
        return { message: "The set could not be saved.", ok: false };
    }
    switch (result) {
        case "success": {
            yield exports.craftworksState.get({ ignoreCache: true });
            return { message: "Set saved.", ok: true };
        }
        case "invalidname": {
            return {
                message: "The game rejected that set name (already used, or too long).",
                ok: false,
            };
        }
        case "missingfields": {
            return { message: "The game wanted a name and items.", ok: false };
        }
        default: {
            return {
                message: `The game answered "${result || "nothing"}".`,
                ok: false,
            };
        }
    }
});
exports.saveSet = saveSet;
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
exports.replantAll = exports.harvestAllFromFarmPage = exports.harvestAll = exports.farmIdState = exports.farmStatusState = exports.CropStatus = void 0;
const state_1 = __webpack_require__(4782);
const perks_1 = __webpack_require__(5543);
const requests_1 = __webpack_require__(3813);
const requests_2 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const diagnostics_1 = __webpack_require__(3747);
const popup_1 = __webpack_require__(469);
var CropStatus;
(function (CropStatus) {
    CropStatus["EMPTY"] = "empty";
    CropStatus["GROWING"] = "growing";
    CropStatus["READY"] = "ready";
})(CropStatus || (exports.CropStatus = CropStatus = {}));
// Reads the one-line field summary the game shows away from the farm page: the
// home screen's xfarm row and worker.php?go=readycount both land here.
//
// Text we can't read now returns undefined, which state.set() treats as "keep
// what you had". It used to fall through to a complete `{status: EMPTY}`
// object, so any summary without the word "growing" or "ready" in it — a bare
// "0" from readycount, which only says nothing is READY yet — asserted an empty
// field over crops that were growing fine. readycount is polled, so every poll
// re-asserted it: that is the "Fields are empty!" banner that follows you
// around until a reload. EMPTY now has to be stated, never assumed.
const processFarmStatus = (root) => {
    var _a;
    const statusText = (_a = root.textContent) === null || _a === void 0 ? void 0 : _a.trim();
    if (!statusText) {
        return undefined;
    }
    const text = statusText.toLowerCase();
    // "36 READY!", "12 Growing"
    const count = Number.parseInt(statusText);
    if (text.includes("ready")) {
        return {
            status: CropStatus.READY,
            count: Number.isNaN(count) ? 0 : count,
            readyAt: Date.now(),
        };
    }
    if (text.includes("growing")) {
        return {
            status: CropStatus.GROWING,
            count: Number.isNaN(count) ? 0 : count,
            // no way to tell when from this text, check again in a minute
            readyAt: Date.now() + 60 * 1000,
        };
    }
    if (text.includes("empty")) {
        return {
            status: CropStatus.EMPTY,
            count: 0,
            readyAt: Number.POSITIVE_INFINITY,
        };
    }
    // A bare number is readycount: more than none are ready, and zero says
    // nothing at all about whether the field is planted.
    if (/^\d+$/.test(statusText)) {
        return count > 0
            ? { status: CropStatus.READY, count, readyAt: Date.now() }
            : undefined;
    }
    (0, diagnostics_1.logDiagnostic)(`field: summary text not understood: "${statusText.slice(0, 40)}"`);
    return undefined;
};
const processFarmPage = (root) => {
    var _a;
    const plots = root.querySelectorAll("#croparea #crops .col-25");
    // No plots at all is a page we failed to read, not an empty field — the plots
    // are in the markup whether or not anything is planted in them, so the loop
    // below can only ever return EMPTY when it had nothing to look at (a farm.php
    // fetch that came back as the logged-out shell looks exactly like this).
    if (plots.length === 0) {
        console.debug("[FARM] No plots on the farm page, keeping status");
        return undefined;
    }
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
// Every crop-status update goes through here so the panel's log says which
// feed set it and to what. The harvest banner is nothing but this status; when
// it fails to show on a phone, this is the line that says whether the status
// ever reached READY, and from where.
const describeStatus = (status) => {
    const due = status.readyAt === Number.POSITIVE_INFINITY
        ? ""
        : `, ready in ${Math.max(0, Math.round((status.readyAt - Date.now()) / 60000))}m`;
    return `${status.status} x${status.count}${due}`;
};
const setFarmStatus = (state, status, source) => __awaiter(void 0, void 0, void 0, function* () {
    if (!status) {
        (0, diagnostics_1.logDiagnostic)(`field: ${source} unreadable, keeping status`);
        return;
    }
    (0, diagnostics_1.logDiagnostic)(`field: ${source} -> ${describeStatus(status)}`);
    yield state.set(status);
});
exports.farmStatusState = new state_1.CachedState(state_1.StorageKey.FARM_STATUS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.FARM, new URLSearchParams());
    const status = processFarmPage(response.body);
    (0, diagnostics_1.logDiagnostic)(status
        ? `field: farm page read -> ${describeStatus(status)}`
        : "field: farm page read unreadable, keeping status");
    return status;
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
                // undefined means we couldn't read it — say nothing rather than
                // overwriting a good status with a guess
                yield setFarmStatus(state, processFarmStatus(root.body), "readycount");
            }),
        },
        {
            match: [page_1.Page.FARM, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                yield setFarmStatus(state, processFarmPage(root.body), "farm page");
            }),
        },
        {
            match: [page_1.Page.HOME_PATH, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const root = yield (0, requests_1.getDocument)(response);
                const linkStatus = root.body.querySelector("a[href^='xfarm.php'] .item-after");
                if (!linkStatus) {
                    (0, diagnostics_1.logDiagnostic)("field: home page has no xfarm row");
                    return;
                }
                if (!((_a = linkStatus.textContent) === null || _a === void 0 ? void 0 : _a.trim())) {
                    // the row is filled in by the game's readycount poll later; the
                    // poll's reply has its own interceptor above
                    (0, diagnostics_1.logDiagnostic)("field: home page row is blank");
                    return;
                }
                yield setFarmStatus(state, processFarmStatus(linkStatus), "home page");
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.FARM_STATUS })],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const raw = yield response.text();
                const rawPlots = raw.split(";").filter((plot) => plot.trim());
                if (rawPlots.length === 0) {
                    (0, diagnostics_1.logDiagnostic)("field: farmstatus feed empty, keeping status");
                    return;
                }
                // A plot counts as planted if it has progress OR time left to run.
                // Progress alone is not enough: a crop planted seconds ago reports
                // 0%, so a fresh plant-all read as an entirely empty field and put
                // the banner up on the way out of the farm — the "I planted, and then
                // it told me the fields were empty" report. The old length check
                // (fewer entries than plots -> EMPTY) is gone with it: it compared
                // this feed against a count parsed out of unrelated summary text, and
                // a partly planted field is not what "Fields are empty!" means.
                let status = CropStatus.EMPTY;
                let readyAt = Number.POSITIVE_INFINITY;
                for (const plot of rawPlots) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const [plotId, percent, secondsLeft, secondsSince] = plot.split("-");
                    const percentReady = Number(percent);
                    const remaining = Number(secondsLeft);
                    if (percentReady >= 100) {
                        status = CropStatus.READY;
                        readyAt = Date.now();
                        break;
                    }
                    else if (percentReady > 0 || remaining > 0) {
                        status = CropStatus.GROWING;
                        // this feed is the only one that knows the real countdown
                        readyAt = Math.min(readyAt, Date.now() + (remaining > 0 ? remaining : 60) * 1000);
                    }
                }
                yield setFarmStatus(state, Object.assign(Object.assign({}, previous), { count: (_a = previous === null || previous === void 0 ? void 0 : previous.count) !== null && _a !== void 0 ? _a : 0, status, readyAt }), "farmstatus feed");
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.HARVEST_ALL })],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                yield setFarmStatus(state, Object.assign(Object.assign({}, previous), { count: (_a = previous === null || previous === void 0 ? void 0 : previous.count) !== null && _a !== void 0 ? _a : 0, status: CropStatus.EMPTY, readyAt: Number.POSITIVE_INFINITY }), "harvest all");
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
                                callback: () => (0, exports.replantAll)(page === page_1.Page.FARM),
                            },
                        ],
                    });
                }
            }),
        },
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.PLANT_ALL })],
            callback: (state, previous) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                // How long the new crop takes is not in this reply; read the farm
                // page for it in a minute rather than keeping the old readyAt.
                yield setFarmStatus(state, Object.assign(Object.assign({}, previous), { count: (_a = previous === null || previous === void 0 ? void 0 : previous.count) !== null && _a !== void 0 ? _a : 0, status: CropStatus.GROWING, readyAt: Date.now() + 60 * 1000 }), "plant all");
            }),
        },
    ],
});
const updateStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = exports.farmStatusState.read();
    if (!state) {
        return;
    }
    if (state.status !== CropStatus.READY && state.readyAt <= Date.now()) {
        // time's up — verify against the real farm page instead of assuming ready
        (0, diagnostics_1.logDiagnostic)("field: timer up, re-reading the farm page");
        yield exports.farmStatusState.get({ ignoreCache: true });
    }
});
// One pending re-check, moved to wherever the latest status says it belongs.
// This was a map keyed by readyAt, meant to stop the same moment being
// scheduled twice -- but nothing ever removed a key once its timer had fired,
// so a later status that carried the same readyAt scheduled NOTHING. That is
// every harvest and plant: both spread `...previous`, so the GROWING set after
// a replant kept the harvest's readyAt (already in the past, already in the
// map) and the farm page was never re-read. On the web the game's own
// readycount poll papered over it, since Reed sits on the home page where
// that poll runs; a phone that has navigated away from home never gets one,
// and the crop status stuck at "growing" for the session -- no harvest banner.
let pendingUpdate;
exports.farmStatusState.onUpdate((state) => {
    clearTimeout(pendingUpdate);
    pendingUpdate = undefined;
    if (!state ||
        state.status === CropStatus.READY ||
        state.readyAt === Number.POSITIVE_INFINITY) {
        return;
    }
    pendingUpdate = setTimeout(updateStatus, Math.max(0, state.readyAt - Date.now()));
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
// Which set a harvest or a replant should roll under: the one named "Farming",
// or Default when there is no such set -- where most players, Reed included,
// keep their farm perks. Undefined when auto-manage is off, which leaves the
// perks exactly as they are and just does the action.
//
// Resolved INSIDE the gated task (runGatedAction calls this when the task
// reaches the front of the perk queue), so it reads settings and sets as they
// are at the moment of the switch rather than when the button was clicked.
const getFarmingPerks = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const settings = yield (0, settings_1.getSettingValues)();
    if (!settings[settings_1.SettingId.PERK_MANAGER]) {
        return undefined;
    }
    const findSet = (options) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        return (_a = (yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.FARMING, options))) !== null && _a !== void 0 ? _a : (yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.DEFAULT, options));
    });
    // The sets come from a day-old read of the perks page, or from a read that
    // failed and left the list empty. Neither is a reason to harvest under
    // whatever happens to be on: read the page again before concluding there is
    // no farm set.
    const set = (_a = (yield findSet())) !== null && _a !== void 0 ? _a : (yield findSet({ ignoreCache: true }));
    if (!set) {
        (0, diagnostics_1.logDiagnostic)("harvest: no set named Farming or Default — harvesting with the perks as they are");
    }
    return set;
});
// Harvesting and replanting are GATED ACTIONS: the yield depends on the perks
// equipped at the moment the request lands, so the switch and the request run
// as one task on the perk queue (see runGatedAction). Nothing else can switch
// perks in between -- which is what went wrong harvesting from the crops-ready
// banner away from the farm: the switch was serialised but the harvest was not,
// so a page reconcile could start its resetperks() while the harvest was in
// flight and the crops came in with no perks applied at all, one per plot.
//
// Afterwards the perks are LEFT on the farm set -- no restore. This is how
// the wrap worked from the start (1.0.40): switch to Default if it isn't on,
// harvest, done; the next page you land on reconciles to whatever it calls
// for. 1.1.55-1.1.61 restored the page's own set right after the reply, and
// Reed watched it undo the switch before the harvest had visibly landed
// ("Default never turns green before the harvest is run"), then grow a 2 s
// settle, a verify read and a 1.5 s hold trying to make that safe. Reed's
// call: go back to leaving it. The cost is Default staying on in town until
// you navigate, which the reconciler fixes on the next page transition.
//
// The switch is FORCED: reset + activate + settle every time, even when the
// farm set is already confirmed on. A confirmation is only what we last saw
// the game do, and every "harvested with no perks" report so far has been a
// case of trusting state that had quietly gone stale. A whole field's yield
// rides on this one request; ~1.3 s and a visible amber → green on the pill
// before it goes out is the right price, and it is once per crop cycle.
const harvestAll = () => (0, perks_1.runGatedAction)({
    label: "harvest",
    set: getFarmingPerks,
    restore: false,
    force: true,
    action: () => __awaiter(void 0, void 0, void 0, function* () {
        const farmId = yield exports.farmIdState.get();
        yield (0, requests_2.getJSON)(page_1.Page.WORKER, new URLSearchParams({
            go: page_1.WorkerGo.HARVEST_ALL,
            id: String(farmId),
        }));
    }),
});
exports.harvestAll = harvestAll;
// The farm page's own Harvest All button, gated. It is the GAME's button, so
// until now it was the one harvest nothing stood in front of: arriving at the
// farm starts a reconcile whose first request is resetperks, and a click in
// the ~1.5 s before Default is back on harvested an EMPTY slate -- Reed:
// "harvested on the farm page as soon as I landed and only got 36, I guess I
// beat the swap". The click is fire-and-forget (the game runs its own request
// and repaints), so the queue is held afterwards like Plant All's.
const harvestAllFromFarmPage = (nativeClick) => (0, perks_1.runGatedAction)({
    label: "harvest",
    set: getFarmingPerks,
    restore: false,
    force: true,
    holdMs: PLANT_CLICK_HOLD_MS,
    action: () => Promise.resolve(nativeClick()),
});
exports.harvestAllFromFarmPage = harvestAllFromFarmPage;
// `fromFarmPage`: on the farm we click the game's own Plant All button so its
// UI updates, and a click is fire-and-forget -- the game runs its own request
// and we never see it finish. `holdMs` keeps the perk queue held for that
// window so nothing switches perks out from under it; away from the farm we
// fire the request ourselves and can simply await it.
const PLANT_CLICK_HOLD_MS = 1500;
const replantAll = (fromFarmPage) => __awaiter(void 0, void 0, void 0, function* () {
    const farmId = yield exports.farmIdState.get();
    if (!farmId) {
        console.error("No farm id found");
        return;
    }
    yield (0, perks_1.runGatedAction)({
        label: "replant",
        set: getFarmingPerks,
        restore: false,
        force: true,
        holdMs: fromFarmPage ? PLANT_CLICK_HOLD_MS : 0,
        action: () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (fromFarmPage) {
                (_a = document.querySelector(".plantallbtn")) === null || _a === void 0 ? void 0 : _a.click();
                return;
            }
            yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({
                go: page_1.WorkerGo.PLANT_ALL,
                id: String(farmId),
            }));
        }),
    });
});
exports.replantAll = replantAll;


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
const diagnostics_1 = __webpack_require__(3747);
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
    var _a, _b;
    const ovens = root.querySelectorAll("a[href^='oven.php']");
    const count = ovens.length;
    const readyOvens = [];
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
            // oven.php?num=N
            const number = Number(new URLSearchParams((_b = (_a = oven.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.split("?")[1]) !== null && _b !== void 0 ? _b : "").get("num"));
            if (number) {
                readyOvens.push(number);
            }
            continue;
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
        readyOvens,
        status,
    };
};
// Every oven-status update goes through here so the panel's log says which
// feed set it and to what -- the same shape as setFarmStatus in farm.ts, for
// the same reason: the oven banners are nothing but this status, and "the
// banner stayed after I took the meal" is only diagnosable if the log shows
// what was seen (or not seen) after the take.
const describeStatus = (status) => {
    const count = status.count === undefined ? "" : ` x${status.count}`;
    const due = status.checkAt === Number.POSITIVE_INFINITY
        ? ""
        : `, check in ${Math.max(0, Math.round((status.checkAt - Date.now()) / 60000))}m`;
    return `${status.status}${count}${due}`;
};
const setKitchenStatus = (state, status, source) => __awaiter(void 0, void 0, void 0, function* () {
    if (!status) {
        (0, diagnostics_1.logDiagnostic)(`ovens: ${source} unreadable, keeping status`);
        return;
    }
    (0, diagnostics_1.logDiagnostic)(`ovens: ${source} -> ${describeStatus(status)}`);
    yield state.set(status);
});
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
        // Name every worker action fired from the kitchen or an oven, matched or
        // not: the game's own buttons there are the ones this pattern has to
        // know, and the log is where a renamed one shows up.
        const [page] = (0, page_1.getPage)();
        if (page === page_1.Page.KITCHEN || page === page_1.Page.OVEN) {
            (0, diagnostics_1.logDiagnostic)(`ovens: worker ${go} on ${page}`);
        }
        if (!MEAL_ACTION_PATTERN.test(go) || OWN_INTERCEPTORS.has(go)) {
            return Promise.resolve();
        }
        // Tending an oven is a burst of clicks, and each one would otherwise cost a
        // kitchen page read; wait for the burst to finish and read once.
        clearTimeout(scheduledMealRefresh);
        scheduledMealRefresh = setTimeout(() => {
            (0, diagnostics_1.logDiagnostic)(`ovens: saw ${go}, re-reading the kitchen page`);
            state.get({ ignoreCache: true });
        }, 600);
        return Promise.resolve();
    },
};
exports.kitchenStatusState = new state_1.CachedState(state_1.StorageKey.KITHCEN_STATUS, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_2.getHTML)(page_1.Page.KITCHEN, new URLSearchParams());
    const status = processKitchenPage(response.body);
    (0, diagnostics_1.logDiagnostic)(status
        ? `ovens: kitchen page read -> ${describeStatus(status)}`
        : "ovens: kitchen page read unreadable, keeping status");
    return status;
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
                yield setKitchenStatus(state, processKitchenStatus(kitchenStatus || undefined), "home page");
            }),
        },
        {
            match: [page_1.Page.KITCHEN, new URLSearchParams()],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                const root = yield (0, requests_1.getDocument)(response);
                yield setKitchenStatus(state, processKitchenPage(root.body), "kitchen page");
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
                yield setKitchenStatus(state, Object.assign(Object.assign({}, previous), { allReady: false, status: OvenStatus.EMPTY, checkAt: Number.POSITIVE_INFINITY }), "collect all");
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
                yield setKitchenStatus(state, Object.assign(Object.assign({}, previous), { allReady: false, status: OvenStatus.COOKING, checkAt: Date.now() + 60 * 1000 }), "cook all");
            }),
        },
    ],
});
const updateStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.kitchenStatusState.get({ doNotFetch: true });
    if (!state) {
        return;
    }
    if (state.checkAt <= Date.now()) {
        yield exports.kitchenStatusState.get();
    }
});
// One pending re-check, moved with every update -- see the note on the same
// timer in farm.ts: keyed by checkAt, a moment that had already been scheduled
// once was never scheduled again.
let pendingUpdate;
exports.kitchenStatusState.onUpdate((state) => {
    clearTimeout(pendingUpdate);
    pendingUpdate = undefined;
    if (!state || state.checkAt === Number.POSITIVE_INFINITY) {
        return;
    }
    pendingUpdate = setTimeout(updateStatus, Math.max(0, state.checkAt - Date.now()));
});
// Collects every finished meal, one oven at a time. This sent `cookreadyall`,
// the kitchen's Collect All -- a button the game only draws for accounts that
// own the Farm Supply perk for it, and an action the server quietly ignores
// for everyone else: the request came back in 50 ms, the kitchen re-read
// still showed the meal, and the banner it had just cleared came straight
// back. The per-oven `cookready&oven=N` is what the oven page's own Collect
// Meal button sends, for every account.
//
// Which ovens are ready is only on the kitchen page, so read it first (fresh:
// the cached status may have come from the home page, which knows no oven
// numbers). Each reply is watched by mealActionInterceptor, which re-reads
// the kitchen once the burst is over and so clears the banner.
const collectAll = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const status = yield exports.kitchenStatusState.get({ ignoreCache: true });
    const readyOvens = (_a = status === null || status === void 0 ? void 0 : status.readyOvens) !== null && _a !== void 0 ? _a : [];
    if (readyOvens.length === 0) {
        (0, diagnostics_1.logDiagnostic)("ovens: nothing to collect");
        return;
    }
    let collected = 0;
    for (const oven of readyOvens) {
        const reply = yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.COLLECT_MEAL, oven: String(oven) }));
        if ((_b = reply.body.textContent) === null || _b === void 0 ? void 0 : _b.includes("success")) {
            collected += 1;
        }
        else {
            (0, diagnostics_1.logDiagnostic)(`ovens: collect oven ${oven} replied "${(_c = reply.body.textContent) === null || _c === void 0 ? void 0 : _c.trim().slice(0, 40)}"`);
        }
    }
    (0, diagnostics_1.logDiagnostic)(`ovens: collected ${collected} of ${readyOvens.length}`);
    if (collected > 0) {
        (0, popup_1.showPopup)({
            title: "Success!",
            contentHTML: `${collected} meal${collected === 1 ? "" : "s"} collected`,
        });
    }
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
// Every setting with its STORED value. The registered setting objects only
// carry a `value` once the settings page has drawn them, so exporting them
// as they are wrote a `value`-less list to the notes whenever anything else
// saved data (collapsing a quest, reading an update, starring a request) --
// and the importer below read a missing value as the default. Any device that
// then loaded the home page had every non-default setting put back to its
// default, with the "Settings Synced" reload to go with it.
const encodeData = () => __awaiter(void 0, void 0, void 0, function* () {
    const exportedSettings = [];
    for (const setting of (0, settings_1.getSettings)()) {
        exportedSettings.push(Object.assign(Object.assign({}, (yield (0, settings_1.getSetting)(setting))), { data: yield (0, settings_1.getData)(setting, "") }));
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
            // An entry with no value says nothing about that setting (a note
            // written by an older build): leave the stored value alone rather
            // than reading it as "back to the default".
            const settingChanged = setting.value === undefined ? false : yield (0, settings_1.setSetting)(setting);
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
exports.runGatedAction = exports.onPerkRestore = exports.equipPerkSet = exports.runPerkTask = exports.getPerkStatus = exports.getConfirmedEquippedSetId = exports.getCurrentPerkSet = exports.getActivityPerksSet = exports.perksState = exports.onPerkStatusChange = exports.setPerkStatusNote = exports.getPerkLog = exports.PerkActivity = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3813);
const page_1 = __webpack_require__(7952);
const requests_2 = __webpack_require__(3300);
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
// ---------------------------------------------------------------------------
// What we believe is equipped
// ---------------------------------------------------------------------------
// The set we last drove the game to with a switch that finished AND was
// acknowledged, cleared whenever the slate is wiped (every switch starts with
// resetperks) or a real visit to the perks page could have changed things
// behind our back.
//
// This is the only "what is equipped" signal anything switches on. The other
// one -- `currentPerkSetId` in the state below -- is written optimistically
// from the request URL the instant a switch is SENT, so it drifts from reality
// and every caller had to remember to pass `force` to get past it. Forgetting
// that flag was its own bug twice (1.1.54). It is display-only now.
let confirmedEquippedSet;
// The set a switch is currently in flight to, if any -- drives the indicator's
// "switching…" state so a switch is visible while it happens (including the
// settle wait) rather than only after it lands.
let pendingPerkSet;
const perkStatusListeners = [];
let statusNote;
const PERK_LOG_LIMIT = 24;
const perkLog = [];
const getPerkLog = () => perkLog;
exports.getPerkLog = getPerkLog;
const logPerk = (text) => {
    perkLog.push({ at: Date.now(), text });
    if (perkLog.length > PERK_LOG_LIMIT) {
        perkLog.shift();
    }
    console.debug(`[PERKS] ${text}`);
    notifyPerkStatus();
};
const setPerkStatusNote = (note) => {
    if (statusNote === note) {
        return;
    }
    statusNote = note;
    logPerk(note);
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
// A perk change that did not come from this module (the game's own buttons,
// see the worker interceptors below): whatever we had confirmed is no longer
// known to be on.
const noteOutsideChange = (what) => {
    if (confirmedEquippedSet) {
        logPerk(`perks changed outside Farmhand (${what}) — nothing confirmed`);
    }
    setConfirmedEquipped(undefined);
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
                const next = processPerks(yield (0, requests_1.getDocument)(response));
                // The perks page is where a set can be re-equipped or edited by hand,
                // which the fast path can't see -- so a real VISIT drops the
                // confirmation and makes the next switch re-verify.
                //
                // Only a visit, though. This fired on any read of perks.php, and the
                // reconciler reads it itself whenever the day-long cache lapses --
                // detached from the fetch, so it could land just after a switch we
                // watched complete and throw that confirmation away. The page
                // contradicting us (a different set shown active) is worth acting on
                // whoever asked for it.
                const isVisit = (0, page_1.getPage)()[0] === page_1.Page.PERKS || (0, page_1.getHashPage)() === page_1.Page.PERKS;
                if (isVisit || next.currentPerkSetId !== (confirmedEquippedSet === null || confirmedEquippedSet === void 0 ? void 0 : confirmedEquippedSet.id)) {
                    setConfirmedEquipped(undefined);
                }
                yield state.set(next);
            }),
        },
        // The game's own perk buttons send these same two requests, and a set
        // activated by hand from a RETAINED perks page (back navigation: no
        // fetch, so the visit interceptor above never fires) used to leave our
        // confirmation standing for a set that was no longer on. Every later
        // switch to that set then took the fast path over the wrong perks. A
        // reset or an activate we did not send ourselves drops the confirmation.
        {
            match: [page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.RESET_PERKS })],
            callback: () => {
                if (!pendingPerkSet) {
                    noteOutsideChange("reset");
                }
                return Promise.resolve();
            },
        },
        {
            match: [
                page_1.Page.WORKER,
                new URLSearchParams({ go: page_1.WorkerGo.ACTIVATE_PERK_SET }),
            ],
            callback: (state, previous, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const [_, query] = (0, requests_2.parseUrl)(response.url);
                const id = Number(query.get("id"));
                if ((pendingPerkSet === null || pendingPerkSet === void 0 ? void 0 : pendingPerkSet.id) !== id) {
                    noteOutsideChange((_b = (_a = previous === null || previous === void 0 ? void 0 : previous.perkSets.find((set) => set.id === id)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : `set ${id}`);
                }
                yield state.set(Object.assign(Object.assign({}, previous), { currentPerkSetId: id }));
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
// undefined when unknown.
const getConfirmedEquippedSetId = () => confirmedEquippedSet === null || confirmedEquippedSet === void 0 ? void 0 : confirmedEquippedSet.id;
exports.getConfirmedEquippedSetId = getConfirmedEquippedSetId;
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
// ---------------------------------------------------------------------------
// The switch engine
// ---------------------------------------------------------------------------
//
// ONE QUEUE, AND THE ACTION RUNS INSIDE IT.
//
// Every perk decision -- the page reconciler's revert, a harvest, a quick-sell
// -- is a task on `runPerkTask`, which runs them one at a time in call order.
// Two rules fall out of that, and between them they close the whole class of
// bug this feature has produced since it was written:
//
// 1. A task that ACTS on the perks it just equipped holds the queue across the
//    action. Before, only the SWITCHES were serialised; the action ran outside
//    the chain, so any switch queued in between -- a page-transition reconcile,
//    a second quick action -- began with resetperks() and pulled the perks out
//    from under an action already in flight. Perks are EMPTY between resetperks
//    and activateperkset, and an action landing in that window rolls with no
//    perks at all. That is a harvest coming back with exactly one crop per plot.
//
// 2. A task decides WHAT to switch to when it reaches the front of the queue,
//    not when it was scheduled. A reconcile scheduled mid-transition used to
//    capture the page it saw at the time and could apply it after the correct
//    one had landed (the 1.1.41 regression). Resolving in the slot means a
//    stale task re-resolves to the page you are actually on and no-ops.
//
// Nothing outside this file switches perks, and nothing inside it switches
// outside a task.
// The game acks activateperkset ("success") BEFORE it has finished equipping
// the set, so an action fired immediately after can run under the OLD perks: a
// 50-silver item sold for 55 (+10% gold perk only) instead of 80 (+60%). This
// used to be a flat wait after every real switch; now it is the floor for the
// perks-page polling below when the page cannot answer (a set of unknown size,
// or a page with nothing to count), and the polling exits as soon as the page
// shows the whole set on.
const PERK_SETTLE_MS = 1000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// ---------------------------------------------------------------------------
// Is the set actually on yet?
// ---------------------------------------------------------------------------
// The settle was a guess at how long the game takes to finish equipping after
// it says "success", and Reed's harvests said it was sometimes short (41 crops
// from a field that gives ~50 under Default and 36 under nothing: PART of the
// set on) and once plain wrong (36: NOTHING on, reset and activate both
// acknowledged, a full second waited). So the perks page is what decides now.
//
// What that page shows (Reed's paste, 2026-09-21): perks.php opens with a
// menu (Farm Supply Perks → supply.php, ...) and the "My Perk Sets" card, then
// one <li> per perk: an icon in .item-media that is the PERK's own (fa-timer
// on Quicker Farming, fa-check-double on Double Prizes -- these were first
// mistaken for state), the name and effect, and in .item-after a button. On a
// perk that is on that button is `button.resetonebtn` (reset this one).
// Counting those is the signal; the button a perk that is OFF carries has
// not been seen yet, so the signal is checked rather than trusted: read once
// right after the reset, when the slate is empty, and if the count did not
// drop the signal does not move with the perks and the settle is all there
// is for the session (logged).
//
// How many a set equips is learned, not known: the page never says what a set
// contains. The count a set was last seen fully on with is remembered per set
// name (ids change when a set is re-made). After a switch the page is polled
// until the count reaches that -- from the first read, so a game that is done
// in 300 ms costs 300 ms, not a flat second -- or, for a set of unknown size
// or one that comes up short (edited smaller), until three reads agree after
// at least the old settle.
const VERIFY_POLL_MS = 250;
const VERIFY_WINDOW_MS = 4000;
// v2: the 1.1.78 count (thematic icons) left sizes of 2 behind under the old key
const SET_SIZES_KEY = "fhPerkSetSizes2";
const ACTIVE_PERK_BUTTON = "li .item-after button.resetonebtn";
const ANY_PERK_BUTTON = "li .item-after button";
let setSizes;
// false once a read after a reset showed the count not moving
let isCountUsable = true;
const readPerksPage = () => __awaiter(void 0, void 0, void 0, function* () {
    let page;
    try {
        page = yield (0, requests_2.getHTML)(page_1.Page.PERKS);
    }
    catch (error) {
        logPerk(`could not read the perks page (${error instanceof Error ? error.message : String(error)})`);
        return undefined;
    }
    const { currentPerkSetId } = processPerks(page);
    const buttons = page.body.querySelectorAll(ANY_PERK_BUTTON).length;
    const active = page.body.querySelectorAll(ACTIVE_PERK_BUTTON).length;
    describePerksPage(page);
    return {
        activeId: currentPerkSetId,
        equipped: buttons > 0 ? active : undefined,
    };
});
// Once a session: the kinds of button the perk rows carry, with counts, so
// the button of a perk that is OFF shows up in the log Reed pastes.
let hasDescribedPerksPage = false;
const describePerksPage = (page) => {
    var _a, _b, _c;
    if (hasDescribedPerksPage) {
        return;
    }
    hasDescribedPerksPage = true;
    const kinds = new Map();
    for (const button of page.body.querySelectorAll(ANY_PERK_BUTTON)) {
        const kind = `${[...button.classList]
            .filter((name) => name !== "button")
            .join(".")}:${(_b = (_a = button.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : ""}`;
        kinds.set(kind, ((_c = kinds.get(kind)) !== null && _c !== void 0 ? _c : 0) + 1);
    }
    logPerk(`perks page buttons: ${[...kinds].map(([kind, count]) => `${kind} ×${count}`).join(" | ") ||
        "none"}`);
};
const loadSetSizes = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!setSizes) {
        const stored = yield GM.getValue(SET_SIZES_KEY, {});
        // only ever runs inside the perk queue, so nothing else can have loaded
        // it in the meantime
        // eslint-disable-next-line require-atomic-updates
        setSizes !== null && setSizes !== void 0 ? setSizes : (setSizes = stored !== null && stored !== void 0 ? stored : {});
    }
    return setSizes;
});
const rememberSetSize = (set, size, known) => {
    setSizes = Object.assign(Object.assign({}, setSizes), { [set.name]: size });
    GM.setValue(SET_SIZES_KEY, setSizes);
    logPerk(`${set.name} equips ${size} perks${known === undefined ? "" : ` (was ${known})`}`);
};
// Right after the reset: what the page shows with the slate empty. The
// floor every later read has to climb above -- and the check on the signal
// itself: a count that did not drop below what this set is known to equip
// is not counting equipped perks.
const readAfterReset = (set) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isCountUsable) {
        return undefined;
    }
    const sizes = yield loadSetSizes();
    const known = sizes[set.name];
    const reading = yield readPerksPage();
    if ((reading === null || reading === void 0 ? void 0 : reading.equipped) === undefined) {
        return undefined;
    }
    if (known !== undefined && known > 0 && reading.equipped >= known) {
        // only ever runs inside the perk queue
        // eslint-disable-next-line require-atomic-updates
        isCountUsable = false;
        logPerk(`perks page still shows ${reading.equipped} on right after the reset — its count does not follow the perks; verifying by settle only from here`);
        return undefined;
    }
    return reading.equipped;
});
// After reset + activate: hold the task until the page shows the set on.
// Resolves to the set that ended up on (a fresh id if the page showed another
// set active and a re-read found this set under a new one). Throws if the
// page still shows nothing above the post-reset floor at the end of the
// window: by then the slate has been cleared for seconds, and Reed's
// town→banner harvest of 2026-09-21 -- reset and activate both "success", a
// full second waited, 36 crops from 36 plots -- is what going on anyway
// looks like.
const waitUntilEquipped = (set, floor) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sizes = yield loadSetSizes();
    const known = sizes[set.name];
    const startedAt = Date.now();
    const counts = [];
    let hasReactivated = false;
    for (;;) {
        const reading = isCountUsable ? yield readPerksPage() : undefined;
        const elapsed = Date.now() - startedAt;
        if ((reading === null || reading === void 0 ? void 0 : reading.equipped) === undefined || floor === undefined) {
            // a guard on top of the settle, not a gate: a page that cannot answer
            // must not strand the action behind it
            if (reading && isCountUsable) {
                logPerk(`${set.name}: perks page has no perk rows — trusting the settle`);
            }
            yield delay(Math.max(0, PERK_SETTLE_MS - elapsed));
            return set;
        }
        // The page shows some other set as active: the activate did not take,
        // whatever it replied. A set deleted and re-made keeps its name and
        // changes its id, so look the name up again and activate that once.
        if (!hasReactivated &&
            reading.activeId !== undefined &&
            reading.activeId !== set.id) {
            hasReactivated = true;
            logPerk(`${set.name} (${set.id}) not active after activate — page shows set ${reading.activeId}; re-reading ids`);
            const fresh = (_a = (yield refreshSet(set))) !== null && _a !== void 0 ? _a : set;
            pendingPerkSet = fresh;
            yield sendActivate(fresh);
            set = fresh;
            yield delay(VERIFY_POLL_MS);
            continue;
        }
        const count = reading.equipped;
        counts.push(count);
        const isAboveFloor = count > floor;
        const isStable = elapsed >= PERK_SETTLE_MS &&
            counts.length >= 3 &&
            isAboveFloor &&
            counts.at(-2) === count &&
            counts.at(-3) === count;
        if ((known !== undefined && isAboveFloor && count >= known) || isStable) {
            if (count !== known) {
                rememberSetSize(set, count, known);
            }
            if (counts.length > 1) {
                logPerk(`${set.name}: ${counts[0]} of ${count} on at first read (${floor} after the reset), ${count} after ${(elapsed / 1000).toFixed(1)}s`);
            }
            return set;
        }
        if (elapsed > VERIFY_WINDOW_MS) {
            // only once the count has been seen to work for this set: a count that
            // never moves must not fail every switch for the session
            if (!isAboveFloor && known !== undefined && known > 0) {
                throw new Error(`${set.name} never came on — perks page shows ${count} on, same as right after the reset, after ${VERIFY_WINDOW_MS / 1000}s`);
            }
            logPerk(`${set.name}: still ${count} of ${known !== null && known !== void 0 ? known : "?"} on after ${VERIFY_WINDOW_MS / 1000}s (${floor} after the reset) — going on anyway`);
            return set;
        }
        yield delay(VERIFY_POLL_MS);
    }
});
// Before a forced switch to a set we already drove the game to: one read of
// the page, and if it shows this set active with everything it equips on,
// the switch is not needed. That read is of a set that has been sitting on
// for a while, so its count is a settled one -- if it is higher than what we
// had learned, the learned size was a partial and goes up. ~100 ms against
// the ~1.3 s of a round trip, which is most banner and farm-page harvests.
const isVerifiedOn = (set) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isCountUsable) {
        return false;
    }
    const sizes = yield loadSetSizes();
    const known = sizes[set.name];
    if (known === undefined || known === 0) {
        return false;
    }
    const reading = yield readPerksPage();
    if ((reading === null || reading === void 0 ? void 0 : reading.equipped) === undefined || reading.activeId !== set.id) {
        return false;
    }
    if (reading.equipped > known) {
        rememberSetSize(set, reading.equipped, known);
        return true;
    }
    return reading.equipped >= known;
});
// worker.php answers these two with the bare word "success". Anything else --
// an error page, a logged-out shell, a rate limit -- means we do NOT know what
// the game did, and the one thing we must not do then is record it as
// confirmed: a switch marked confirmed after a reset that landed and an
// activate that didn't leaves perks EMPTY, and every later switch to that set
// takes the fast path and never repairs it. Stuck empty for the session.
const isAcknowledged = (reply, what) => {
    var _a, _b;
    const text = (_b = (_a = reply.body.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
    if (/success/i.test(text)) {
        return true;
    }
    logPerk(`${what} was not acknowledged: "${text.slice(0, 60)}"`);
    return false;
};
// Clear every equipped perk before loading a set (upstream behaviour). Loading
// from an EMPTY slate is what makes the game equip a set fully; switching
// set-to-set without it leaves the game diffing off the previous full set and
// dropping/lagging perks, which showed up as a set selected but only half
// applied (and never self-repairing).
const clearPerks = () => __awaiter(void 0, void 0, void 0, function* () {
    const reply = yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({ go: page_1.WorkerGo.RESET_PERKS }));
    // perks are cleared (or in an unknown state) either way, so nothing is
    // confirmed-equipped anymore
    setConfirmedEquipped(undefined);
    const state = exports.perksState.read();
    if (state) {
        yield exports.perksState.set(Object.assign(Object.assign({}, state), { currentPerkSetId: undefined }));
    }
    return isAcknowledged(reply, "resetperks");
});
const sendActivate = (set) => __awaiter(void 0, void 0, void 0, function* () {
    const reply = yield (0, requests_2.getHTML)(page_1.Page.WORKER, new URLSearchParams({
        go: page_1.WorkerGo.ACTIVATE_PERK_SET,
        id: set.id.toString(),
    }));
    return isAcknowledged(reply, `activate ${set.name}`);
});
// The set's id is read off the perks page once a day; a set deleted and
// re-made in between keeps its name and changes its id, and the game does not
// say "success" to an id it no longer has. Re-read the page and look the
// name up again before giving up on the switch.
const refreshSet = (set) => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield exports.perksState.get({ ignoreCache: true });
    const fresh = state === null || state === void 0 ? void 0 : state.perkSets.find(({ name }) => name === set.name);
    if (fresh && fresh.id !== set.id) {
        logPerk(`${set.name} is now set ${fresh.id} (was ${set.id})`);
    }
    return fresh;
});
// Drive the game to `set`. Only callable from inside a task, which is what
// guarantees nothing else is touching the perks while the slate is empty.
// Resolves to whether a real switch happened (false = already confirmed on it),
// so callers can tell a change from a no-op.
//
// Throws if the game never acknowledged the activate. By then the slate has
// already been cleared, so the perks are EMPTY -- and a caller that went on to
// act anyway (a harvest) would roll with nothing equipped, one crop a plot.
// Failing the action keeps the crops in the ground for a harvest that works;
// the reconciler, which has no action behind it, just reports the failure.
const applySet = (set_1, ...args_1) => __awaiter(void 0, [set_1, ...args_1], void 0, function* (set, { force = false } = {}) {
    var _a;
    // We drove the game here and watched it land, and nothing has cleared the
    // slate since -- so it is genuinely equipped and the whole round trip
    // (reset + activate + settle) can be skipped. This is what makes back-to-back
    // quick-sells instant after the first one.
    if ((confirmedEquippedSet === null || confirmedEquippedSet === void 0 ? void 0 : confirmedEquippedSet.id) === set.id &&
        (!force || (yield isVerifiedOn(set)))) {
        return false;
    }
    pendingPerkSet = set;
    notifyPerkStatus();
    try {
        const wasCleared = yield clearPerks();
        const floor = yield readAfterReset(set);
        // Retried if the game doesn't say "success", because at this point the
        // slate is already EMPTY: an activate that goes missing here is not a switch
        // that didn't happen, it is every perk turned off until something switches
        // again. That is the state a harvest comes back from with one crop a plot.
        // The retry goes to the set's CURRENT id, in case the one we have is stale.
        let wasActivated = yield sendActivate(set);
        if (!wasActivated) {
            const fresh = (_a = (yield refreshSet(set))) !== null && _a !== void 0 ? _a : set;
            // ours, so the activate interceptor does not read the new id as the
            // game's own button being pressed
            pendingPerkSet = fresh;
            wasActivated = yield sendActivate(fresh);
            if (wasActivated) {
                set = fresh;
            }
        }
        if (!wasActivated) {
            throw new Error(`the game did not activate the ${set.name} set — perks are currently empty`);
        }
        set = yield waitUntilEquipped(set, floor);
        if (wasCleared) {
            // eslint-disable-next-line require-atomic-updates
            pendingPerkSet = undefined;
            setConfirmedEquipped(set);
        }
        else {
            // The activate landed but the reset before it was not acknowledged, so
            // the set may sit on top of leftovers. Don't claim it: the next switch to
            // this set pays the round trip again rather than trusting perks we never
            // saw confirmed.
            logPerk(`${set.name} may not be fully equipped — will re-apply`);
        }
        return true;
    }
    finally {
        // cleared (and announced) even if the switch throws, so a failed switch
        // can't leave the indicator stuck on "switching…"
        // eslint-disable-next-line require-atomic-updates
        pendingPerkSet = undefined;
        notifyPerkStatus();
    }
});
const session = { apply: applySet };
let perkQueue = Promise.resolve();
let isTaskRunning = false;
// How long a task waits for its turn before giving up on the queue and running
// anyway. Normal traffic never gets near this: a switch is ~1.3 s (reset +
// activate + settle), a gated action with its restore ~3-4 s, and even a few
// stacked up clear in seconds. Only a HUNG request (a fetch that neither
// resolves nor rejects) holds the queue this long, and without a limit that
// one hang would leave perk switching dead for the rest of the session,
// silently. Giving up is logged, and the abandoned task is dropped from the
// chain so everything after it runs normally.
const QUEUE_WAIT_LIMIT_MS = 30000;
// Run `task` with exclusive use of the perks: tasks run one at a time, in call
// order, and a task holds the queue until it resolves. Don't call it from
// inside another task -- anything a task needs is on the session it is given,
// and a task waiting on the queue it is itself holding would sit there until
// the wait limit above.
//
// There is deliberately NO shortcut for a task that arrives while another is
// running. 1.1.55 had one -- a "re-entrant" call ran inline -- keyed on a flag
// that only said SOME task was running, not that the caller was inside it. No
// caller is ever inside one (the post-action restore is called directly), so
// the shortcut fired only for the case it must never fire for: an independent
// click or page-transition reconcile landing mid-task, which then ran
// CONCURRENTLY with it, resets and activates interleaving. A banner harvest
// clicked within ~1.5 s of arriving on a page raced that page's own switch.
const runPerkTask = (task, label = "a perk task") => {
    if (isTaskRunning) {
        // so the log shows the wait, not just the two entries either side of it
        logPerk(`${label} is waiting for the perk queue`);
    }
    const previous = perkQueue;
    const run = (() => __awaiter(void 0, void 0, void 0, function* () {
        let waitTimeout;
        const gaveUp = yield Promise.race([
            previous.then(() => false),
            new Promise((resolve) => {
                waitTimeout = setTimeout(() => resolve(true), QUEUE_WAIT_LIMIT_MS);
            }),
        ]);
        clearTimeout(waitTimeout);
        if (gaveUp) {
            logPerk(`${label} waited ${QUEUE_WAIT_LIMIT_MS / 1000}s for the perk queue and ran anyway — a request may be hung`);
        }
        isTaskRunning = true;
        try {
            return yield task(session);
        }
        finally {
            // eslint-disable-next-line require-atomic-updates
            isTaskRunning = false;
        }
    }))();
    // a failed task must not break the queue for the next one
    perkQueue = run.catch(() => {
        // swallowed here only; runPerkTask's own caller still sees the rejection
    });
    return run;
};
exports.runPerkTask = runPerkTask;
// One-shot switch with no action behind it: the panel's manual "equip".
const equipPerkSet = (set) => (0, exports.runPerkTask)((perks) => perks.apply(set), `equip ${set.name}`);
exports.equipPerkSet = equipPerkSet;
let restorePerks;
const onPerkRestore = (restore) => {
    restorePerks = restore;
};
exports.onPerkRestore = onPerkRestore;
// Run an action under a specific perk set, with nothing able to switch perks
// from under it. This is the ONLY way to perform a perk-sensitive action.
const runGatedAction = ({ label, set, action, holdMs = 0, restore = true, force = false, }) => (0, exports.runPerkTask)((perks) => __awaiter(void 0, void 0, void 0, function* () {
    const target = yield set();
    if (target) {
        // said before the switch as well as after, so the log timestamps the
        // moment the action started waiting on perks, not just the moment it
        // stopped
        (0, exports.setPerkStatusNote)(`${label} → ${target.name}`);
        const startedAt = Date.now();
        let switched;
        try {
            switched = yield perks.apply(target, { force });
        }
        catch (error) {
            // the chip log is the one place Reed reads; say the action was
            // dropped, not just that an activate went unacknowledged
            (0, exports.setPerkStatusNote)(`${label} → ${target.name} FAILED — ${label} not run: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
        let outcome = " (already on)";
        if (switched) {
            outcome = ` (switched, ${((Date.now() - startedAt) / 1000).toFixed(1)}s)`;
        }
        else if (force) {
            outcome = " (verified on)";
        }
        (0, exports.setPerkStatusNote)(`${label} → ${target.name}${outcome}`);
    }
    else {
        (0, exports.setPerkStatusNote)(`${label}: no set to switch to`);
    }
    try {
        yield action();
    }
    finally {
        if (holdMs > 0) {
            yield delay(holdMs);
        }
        if (restore && restorePerks) {
            yield restorePerks(perks);
        }
    }
}), label);
exports.runGatedAction = runGatedAction;


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

/***/ 2161:
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
exports.findTownsfolkLink = exports.isSamePerson = exports.townsfolkState = exports.parseTownsfolkPage = void 0;
const state_1 = __webpack_require__(4782);
const requests_1 = __webpack_require__(3300);
const page_1 = __webpack_require__(7952);
// Words the game is likely to use next to the bonus townsperson. The page
// shape has never been captured, so this is a GUESS with a wide net: a hit is
// logged with the rule that fired, and a miss is logged asking for the markup.
const BONUS_TEXT = /\b(bonus|double|2x|extra|boost(?:ed)?|today(?:'s)?|daily|featured)\b/i;
// The visible lines of an element, one text node at a time: the game separates
// a name from its level and hearts with <br>, which textContent runs together,
// and whether its markup carries newlines between them is not something to
// depend on.
const textLines = (element) => {
    var _a, _b;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const lines = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const line = (_b = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "";
        if (line.length > 0) {
            lines.push(line);
        }
    }
    return lines;
};
const BADGE_CLASS = /star|bonus|daily|highlight|featured/i;
const BADGE_SELECTOR = '[class*="star"], [class*="bonus"], [class*="daily"], [class*="highlight"], [class*="featured"]';
const findHighlight = (anchor, name) => {
    var _a, _b;
    const container = (_a = anchor.closest("li")) !== null && _a !== void 0 ? _a : anchor;
    // (1) the row says so in words
    const said = textLines(container).find((line) => line !== name && BONUS_TEXT.test(line));
    if (said) {
        return { matchedBy: "text", reason: said.slice(0, 60) };
    }
    // (2) a badge-like element: a star icon, or a class that names the bonus
    const badge = container.querySelector(BADGE_SELECTOR);
    if (badge) {
        const className = [...badge.classList].find((entry) => BADGE_CLASS.test(entry));
        return {
            matchedBy: `badge .${className !== null && className !== void 0 ? className : badge.className}`,
            reason: "featured today",
        };
    }
    // (3) the row is painted: an inline background or border on the row, the
    // link or its title, which the plain rows do not carry
    for (const element of [
        container,
        anchor,
        anchor.querySelector(".item-title"),
        anchor.querySelector(".item-inner"),
    ]) {
        const style = (_b = element === null || element === void 0 ? void 0 : element.getAttribute("style")) !== null && _b !== void 0 ? _b : "";
        if (/background|border|box-shadow|outline/i.test(style)) {
            return {
                matchedBy: `style ${style.slice(0, 40)}`,
                reason: "featured today",
            };
        }
    }
    return undefined;
};
const parseTownsfolkPage = (root) => {
    var _a, _b, _c;
    const seen = new Map();
    let dailyFriend;
    for (const anchor of root.querySelectorAll("a[href]")) {
        const href = (_a = anchor.getAttribute("href")) !== null && _a !== void 0 ? _a : "";
        // a townsperson's own page, whatever the game calls it, carries an id;
        // navigation and the tab bar do not
        if (!/\?.*\bid=\d+/.test(href)) {
            continue;
        }
        // the visible name is the first line of the link's text; levels and
        // hearts follow it on their own lines
        const [name] = textLines(anchor);
        if (!name || seen.has(name.toLowerCase())) {
            continue;
        }
        const link = {
            href,
            image: (_c = (_b = anchor.querySelector("img")) === null || _b === void 0 ? void 0 : _b.getAttribute("src")) !== null && _c !== void 0 ? _c : undefined,
            name,
        };
        seen.set(name.toLowerCase(), link);
        if (!dailyFriend) {
            const highlight = findHighlight(anchor, name);
            if (highlight) {
                dailyFriend = Object.assign(Object.assign({}, link), highlight);
            }
        }
    }
    return { dailyFriend, links: [...seen.values()] };
};
exports.parseTownsfolkPage = parseTownsfolkPage;
exports.townsfolkState = new state_1.CachedState(state_1.StorageKey.TOWNSFOLK, () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, requests_1.getHTML)(page_1.Page.FRIENDSHIP, new URLSearchParams());
    const { dailyFriend, links } = (0, exports.parseTownsfolkPage)(response.body);
    if (links.length === 0) {
        console.warn("[Farmhand] no townsfolk links found on the townsfolk page");
    }
    else if (dailyFriend) {
        console.info(`[Farmhand] daily friend: ${dailyFriend.name} (${dailyFriend.matchedBy}: ${dailyFriend.reason})`);
    }
    else {
        console.info("[Farmhand] no daily-friend highlight recognised on the townsfolk page — the row's markup is needed to pin it");
    }
    return { dailyFriend, links, updatedAt: Date.now() };
}), {
    // the links change never, the daily friend changes at the game's reset;
    // an hour keeps the badge honest for the cost of one read per hour of play
    timeout: 60 * 60,
    defaultState: { links: [], updatedAt: 0 },
});
// Case-insensitive, and tolerant of the honorifics buddy.farm keeps that the
// game's list might not ("Charles Horsington III" vs "Charles").
const isSamePerson = (a, b) => {
    const left = a.trim().toLowerCase();
    const right = b.trim().toLowerCase();
    return left === right || left.startsWith(right) || right.startsWith(left);
};
exports.isSamePerson = isSamePerson;
const findTownsfolkLink = (links, name) => {
    var _a;
    const wanted = name.trim().toLowerCase();
    return ((_a = links.find((link) => link.name.toLowerCase() === wanted)) !== null && _a !== void 0 ? _a : links.find((link) => (0, exports.isSamePerson)(link.name, wanted)));
};
exports.findTownsfolkLink = findTownsfolkLink;


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
const diagnostics_1 = __webpack_require__(3747);
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
        yield runInterceptor(state, interceptor, body);
    }
});
exports.onFetchResponse = onFetchResponse;
// One interceptor, contained: a callback that throws (or rejects) is logged
// and the next one still runs. Without this a single bad parse took every
// interceptor queued after it for that response with it -- and in the XHR
// path below, which walks the whole registry in one loop, it took every
// interceptor registered after it, for every later response. The callback is
// started, not awaited, as it always was: some of them fetch, and the ones
// behind must not wait on that.
const runInterceptor = (state, interceptor, response) => __awaiter(void 0, void 0, void 0, function* () {
    const report = (error) => {
        console.error(`[STATE] Interceptor for ${response.url} failed`, interceptor, error);
    };
    try {
        const previous = yield state.get({ doNotFetch: true });
        Promise.resolve(interceptor.callback(state, previous, response)).catch(report);
    }
    catch (error) {
        report(error);
    }
});
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
                            yield runInterceptor(state, interceptor, {
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
    // The game's own request helper is a global of the PAGE's world. A
    // userscript manager that runs this script in an isolated world cannot see
    // it, and reading an undeclared name throws -- which, uncontained, ended
    // start-up here. `typeof` on an undeclared name is the one read that does
    // not throw.
    if (typeof fetchWorker !== "function") {
        (0, diagnostics_1.logDiagnostic)("request watchers: fetchWorker not visible, not wrapped");
        return;
    }
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

/***/ 2206:
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
exports.renderCapTab = void 0;
const inventoryCapWarnings_1 = __webpack_require__(6660);
const townsfolk_1 = __webpack_require__(2161);
const shared_1 = __webpack_require__(4073);
const api_1 = __webpack_require__(3413);
const gameLinks_1 = __webpack_require__(1616);
const promise_1 = __webpack_require__(6762);
const theme_1 = __webpack_require__(1178);
// The Cap tab: what is at or near the inventory cap, and what to DO about it.
//
// The tracker's row of icons said "these are full" and stopped there. The
// useful half is the way out: buddy.farm knows which townsperson loves or
// likes each item, and the game's own townsfolk page knows where each of them
// lives, so a full stack becomes a gift rather than a discarded drop.
// how many rows get the loves/likes lookup on one draw: each is one cached
// buddy.farm read, and the list is at-cap first so the ones that matter come
// first
const RELATIONSHIP_LOOKUPS = 16;
const getAffinities = (itemName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const item = yield (0, promise_1.orUndefined)(api_1.itemDataState.get({ query: itemName }));
    const entries = ((_a = item === null || item === void 0 ? void 0 : item.npcItems) !== null && _a !== void 0 ? _a : []);
    const affinities = [];
    for (const entry of entries) {
        const name = (_b = entry.npc) === null || _b === void 0 ? void 0 : _b.name;
        if (!name) {
            continue;
        }
        if (entry.relationship === "loves" || entry.relationship === "likes") {
            affinities.push({ name, relationship: entry.relationship });
        }
    }
    // loves before likes: it is the better gift, so it is the one to show first
    const rank = (affinity) => affinity.relationship === "loves" ? 0 : 1;
    return affinities.sort((a, b) => rank(a) - rank(b));
});
// Today's friend first, then loves before likes: a gift to the townsperson on
// bonus XP is worth more than the same gift tomorrow, whoever loves it.
const makeAffinityTags = (affinities, links, dailyFriend) => {
    const isDaily = (affinity) => dailyFriend !== undefined && (0, townsfolk_1.isSamePerson)(affinity.name, dailyFriend.name);
    const ordered = [...affinities].sort((a, b) => Number(isDaily(b)) - Number(isDaily(a)));
    return ordered.slice(0, 4).map((affinity) => {
        const link = (0, townsfolk_1.findTownsfolkLink)(links, affinity.name);
        const heart = affinity.relationship === "loves" ? "♥" : "♡";
        const daily = isDaily(affinity);
        let tone = "muted";
        if (daily) {
            tone = "ok";
        }
        else if (affinity.relationship === "loves") {
            tone = "accent";
        }
        const tag = (0, shared_1.makeTag)(`${daily ? "★ " : ""}${heart} ${affinity.name}`, tone, link === null || link === void 0 ? void 0 : link.href);
        tag.title = `${affinity.name} ${affinity.relationship} this${daily
            ? ` — and gets extra friendship XP today (${dailyFriend === null || dailyFriend === void 0 ? void 0 : dailyFriend.reason})`
            : ""}${link ? " — open their page to give it" : ""}`;
        return tag;
    });
};
// The townsperson on bonus friendship XP today, as a card at the top of the
// tab: it is the answer to "who do I give all this to" before any item is.
const makeDailyFriendCard = (friend) => {
    const { card, body } = (0, shared_1.makeCard)("Daily friend", {
        aside: "extra XP today",
        tone: "ok",
    });
    body.append((0, shared_1.makeRow)(`★ ${friend.name}`, {
        href: friend.href,
        icon: (0, shared_1.toIconUrl)(friend.image),
        sub: [friend.reason],
        tone: "ok",
    }));
    return card;
};
const makeCapRow = (item, cap) => (0, shared_1.makeRow)(item.name, {
    aside: [`${item.count.toLocaleString()} / ${cap.toLocaleString()}`],
    href: item.href,
    icon: (0, shared_1.toIconUrl)(item.image),
    tone: item.isAtCap ? "err" : "warn",
});
const renderCapTab = (body, onRefresh) => {
    const view = (0, inventoryCapWarnings_1.getCapTrackerView)();
    if (!view.isEnabled) {
        // The settings page is a link, not a direction: on a phone the menu route
        // to it is the very thing that has been hard to find.
        const empty = (0, shared_1.makeEmpty)("The cap tracker is off — turn on “Inventory: Cap tracker” in ");
        empty.append((0, gameLinks_1.makeLink)(gameLinks_1.SETTINGS_HREF, "Farmhand settings", "var(--fh-accent)"), ".");
        body.append(empty);
        return;
    }
    if (view.updatedAt === 0) {
        if (view.error && !view.isFetching) {
            // A failed read, said so, with the retry in hand rather than another
            // automatic attempt (which would loop on a persistent failure).
            const empty = (0, shared_1.makeEmpty)(`Could not read your inventory (${view.error}). `);
            const retry = document.createElement("span");
            retry.className = "fh-link";
            retry.textContent = "retry";
            retry.addEventListener("click", (event) => {
                event.stopPropagation();
                onRefresh();
            });
            empty.append(retry);
            body.append(empty);
            return;
        }
        // The first read used to come only from onPageLoad. Opening the tab is as
        // clear a request for it as there is, so ask for it here too; the tab
        // redraws on the tracker's change notice when it lands.
        if (!view.isFetching) {
            onRefresh();
        }
        body.append((0, shared_1.makeEmpty)("Reading your inventory…"));
        return;
    }
    // Read once for the tab: the daily friend for the card, the links for the
    // tags. The card lands asynchronously at the top, ahead of everything the
    // sync draw below puts there; the tags wait on the same read.
    const townsfolk = (0, promise_1.orUndefined)(townsfolk_1.townsfolkState.get());
    const dailyFriendSlot = document.createElement("div");
    body.append(dailyFriendSlot);
    townsfolk
        .then((snapshot) => {
        if ((snapshot === null || snapshot === void 0 ? void 0 : snapshot.dailyFriend) && dailyFriendSlot.isConnected) {
            dailyFriendSlot.replaceWith(makeDailyFriendCard(snapshot.dailyFriend));
        }
    })
        .catch((error) => {
        console.error("Failed to read the townsfolk page", error);
    });
    if (view.here) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("Drops here at or near cap", {
            aside: view.here.length > 0 ? String(view.here.length) : undefined,
            tone: view.here.some((item) => item.isAtCap) ? "err" : undefined,
        });
        if (view.here.length === 0) {
            cardBody.append((0, shared_1.makeEmpty)("Nothing — everything here still counts."));
        }
        else {
            const grid = document.createElement("div");
            grid.className = "fh-grid";
            for (const item of view.here) {
                const tile = document.createElement("a");
                tile.className = "fh-grid-item";
                tile.dataset.atCap = String(item.isAtCap);
                tile.href = item.href;
                tile.title = `${item.name}: ${item.count.toLocaleString()} / ${view.cap.toLocaleString()}${item.isAtCap ? " — at cap, thrown away" : " — near cap"}`;
                const icon = (0, shared_1.toIconUrl)(item.image);
                if (icon) {
                    const img = document.createElement("img");
                    img.src = icon;
                    img.alt = item.name;
                    tile.append(img);
                }
                else {
                    tile.textContent = item.name;
                    tile.style.lineHeight = "30px";
                    tile.style.padding = "0 6px";
                    tile.style.fontSize = "12px";
                    tile.style.color = theme_1.TEXT_WHITE;
                }
                grid.append(tile);
            }
            cardBody.append(grid);
        }
        body.append(card);
    }
    const atCap = view.items.filter((item) => item.isAtCap);
    const nearCap = view.items.filter((item) => !item.isAtCap);
    const rows = new Map();
    if (atCap.length > 0) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("At cap", {
            aside: (0, shared_1.plural)(atCap.length, "item"),
            tone: "err",
        });
        for (const item of atCap) {
            const row = makeCapRow(item, view.cap);
            rows.set(item.name, row);
            cardBody.append(row);
        }
        body.append(card);
    }
    if (nearCap.length > 0) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("Near cap", {
            aside: (0, shared_1.plural)(nearCap.length, "item"),
            tone: "warn",
        });
        for (const item of nearCap) {
            const row = makeCapRow(item, view.cap);
            rows.set(item.name, row);
            cardBody.append(row);
        }
        body.append(card);
    }
    if (view.items.length === 0) {
        body.append((0, shared_1.makeEmpty)("Nothing at or near cap."));
    }
    const foot = document.createElement("div");
    foot.className = "fh-foot";
    const refresh = document.createElement("span");
    refresh.className = "fh-link";
    refresh.textContent = view.isFetching ? "reading…" : "refresh";
    refresh.addEventListener("click", (event) => {
        event.stopPropagation();
        onRefresh();
    });
    foot.append(`cap ${view.cap.toLocaleString()} · inventory read ${(0, shared_1.formatAge)(view.updatedAt)} · `, refresh);
    body.append(foot);
    // Who would want each of these, filled in as the lookups land. The rows are
    // already on screen; a redraw in the meantime simply orphans these and the
    // next draw asks again (from cache, so it is instant the second time).
    const lookups = [...atCap, ...nearCap].slice(0, RELATIONSHIP_LOOKUPS);
    if (lookups.length === 0) {
        return;
    }
    const fill = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const [snapshot, ...affinities] = yield Promise.all([
            townsfolk,
            ...lookups.map((item) => getAffinities(item.name)),
        ]);
        const links = (_a = snapshot === null || snapshot === void 0 ? void 0 : snapshot.links) !== null && _a !== void 0 ? _a : [];
        for (const [index, item] of lookups.entries()) {
            const row = rows.get(item.name);
            const found = affinities[index];
            if (!(row === null || row === void 0 ? void 0 : row.isConnected) || found.length === 0) {
                continue;
            }
            const main = row.querySelector(".fh-row-main");
            if (!main || main.querySelector(".fh-row-tags")) {
                continue;
            }
            const tags = document.createElement("span");
            tags.className = "fh-row-tags";
            tags.append(...makeAffinityTags(found, links, snapshot === null || snapshot === void 0 ? void 0 : snapshot.dailyFriend));
            main.append(tags);
        }
    });
    fill().catch((error) => {
        console.error("Failed to look up who wants the capped items", error);
    });
};
exports.renderCapTab = renderCapTab;


/***/ }),

/***/ 7190:
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
exports.renderHereTab = exports.renderLocationView = void 0;
const shared_1 = __webpack_require__(4073);
const locationAdvice_1 = __webpack_require__(4764);
const api_1 = __webpack_require__(3413);
const gameLinks_1 = __webpack_require__(1616);
const promise_1 = __webpack_require__(6762);
const craftPlanner_1 = __webpack_require__(5825);
const theme_1 = __webpack_require__(1178);
// The Here tab: the place you are standing, read against what you need.
//
// buddy.farm's location page is the drop table; this is the drop table with
// your inventory, your cap and your backlog laid over it, which is the part no
// site can do. Standing nowhere in particular it turns into "where to go" --
// the trips that would close the most of what you are short of.
const NEAR_CAP_RATIO = 0.9;
const attemptsNoun = (type) => type === "fishing" ? "casts" : "explores";
const makeStat = (label, value) => {
    const stat = document.createElement("div");
    stat.className = "fh-stat";
    const labelElement = document.createElement("div");
    labelElement.className = "fh-stat-label";
    labelElement.textContent = label;
    const valueElement = document.createElement("div");
    valueElement.className = "fh-stat-value";
    valueElement.textContent = value;
    stat.append(labelElement, valueElement);
    return stat;
};
// Full-table row: one drop, with everything you know about it.
const makeDropRow = (drop, context, wantedFor, needed) => {
    var _a;
    const { cap, inventory } = context;
    const have = (_a = inventory[drop.name]) !== null && _a !== void 0 ? _a : 0;
    const isAtCap = cap !== undefined && cap > 0 && have >= cap;
    const isNearCap = !isAtCap && cap !== undefined && cap > 0 && have >= cap * NEAR_CAP_RATIO;
    const tags = [];
    if (isAtCap) {
        tags.push((0, shared_1.makeTag)("at cap — wasted", "err"));
    }
    else if (isNearCap) {
        tags.push((0, shared_1.makeTag)("near cap", "warn"));
    }
    if (wantedFor && wantedFor.length > 0) {
        for (const reason of wantedFor.slice(0, 2)) {
            tags.push((0, shared_1.makeTag)(reason, "ok"));
        }
        if (wantedFor.length > 2) {
            tags.push((0, shared_1.makeTag)(`+${wantedFor.length - 2}`, "ok"));
        }
    }
    let tone;
    if (isAtCap) {
        tone = "err";
    }
    else if (needed !== undefined) {
        tone = "ok";
    }
    const aside = [];
    const rate = document.createElement("strong");
    rate.textContent = `1 in ${(0, shared_1.formatHits)(drop.rate)}`;
    aside.push(rate);
    if (cap !== undefined && cap > 0) {
        aside.push(document.createElement("br"), `${have.toLocaleString()} / ${cap.toLocaleString()}`);
    }
    const sub = [];
    if (needed !== undefined) {
        sub.push(`${needed.toLocaleString()} needed · ~${(0, shared_1.formatHits)(needed * drop.rate)} tries`);
    }
    return (0, shared_1.makeRow)((0, gameLinks_1.makeItemLink)(drop.name, drop.id, theme_1.TEXT_WHITE), {
        aside,
        icon: (0, shared_1.toIconUrl)(drop.image),
        sub,
        tags,
        tone,
    });
};
const renderWhereToGo = (body, context, missing, title) => __awaiter(void 0, void 0, void 0, function* () {
    const { graph } = context;
    const sourcing = (0, craftPlanner_1.planSourcing)(graph, missing);
    if (sourcing.locations.length === 0) {
        return;
    }
    const top = sourcing.locations.slice(0, shared_1.MAX_LISTED);
    const references = yield Promise.all(top.map((entry) => (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: entry.location }))));
    const { card, body: cardBody } = (0, shared_1.makeCard)(title, {
        aside: `${sourcing.locations.length} trips`,
    });
    for (const [index, entry] of top.entries()) {
        const reference = references[index];
        const tags = entry.items
            .slice(0, 4)
            .map((item) => {
            var _a, _b;
            return (0, shared_1.makeTag)(item.name, entry.items.length > 1 ? "ok" : "muted", ((_a = graph.nodes.get(item.name)) === null || _a === void 0 ? void 0 : _a.id)
                ? `item.php?id=${(_b = graph.nodes.get(item.name)) === null || _b === void 0 ? void 0 : _b.id}`
                : undefined);
        });
        if (entry.items.length > 4) {
            tags.push((0, shared_1.makeTag)(`+${entry.items.length - 4}`));
        }
        cardBody.append((0, shared_1.makeRow)((0, gameLinks_1.makeLocationLink)(entry.location, reference, theme_1.TEXT_WHITE), {
            aside: [
                `~${(0, shared_1.formatHits)(entry.hits)} ${entry.type === "fishing" ? "casts" : "explores"}`,
            ],
            href: reference ? (0, gameLinks_1.toLocationHref)(reference) : undefined,
            tags,
            tone: entry.items.length > 1 ? "ok" : undefined,
        }));
    }
    body.append(card);
});
// A location's drop table laid over your inventory, cap and backlog. The Here
// tab draws the place you are standing; the lookup draws any place you search
// for, through the same function.
const renderLocationView = (body, context, here, focused) => {
    var _a, _b;
    const { cap, inventory, mastery, resolved } = context;
    const missing = (0, shared_1.getMissingDemand)(context, focused);
    const { image, location, stamina } = here;
    const reasons = (0, shared_1.getReasonsByItem)(resolved, focused);
    const advice = (0, locationAdvice_1.getLocationAdvice)(location.drops, missing, reasons, inventory, cap, mastery);
    const neededByName = new Map(advice.needed.map((entry) => [entry.name, entry]));
    const wastedNames = new Set(advice.wasted.map((entry) => entry.name));
    // header
    const place = document.createElement("div");
    place.className = "fh-place";
    const icon = (0, shared_1.toIconUrl)(image);
    if (icon) {
        const img = document.createElement("img");
        img.src = icon;
        img.alt = "";
        place.append(img);
    }
    const text = document.createElement("div");
    const name = document.createElement("div");
    name.className = "fh-place-name";
    name.append((0, gameLinks_1.makeLocationLink)(location.name, location, theme_1.TEXT_WHITE));
    const sub = document.createElement("div");
    sub.className = "fh-place-sub";
    sub.textContent = `${location.type === "fishing" ? "Fishing spot" : "Explore area"} · ${(0, shared_1.plural)(location.drops.length, "drop")}`;
    text.append(name, sub);
    place.append(text);
    body.append(place);
    // figures
    const stats = document.createElement("div");
    stats.className = "fh-stats";
    if (stamina !== undefined) {
        stats.append(makeStat("stamina", stamina.toLocaleString()));
    }
    if (location.silverPerHit !== undefined) {
        stats.append(makeStat(`silver / ${location.type === "fishing" ? "cast" : "explore"}`, Math.round(location.silverPerHit).toLocaleString()));
    }
    if (location.xpPerHit !== undefined) {
        stats.append(makeStat(`xp / ${location.type === "fishing" ? "cast" : "explore"}`, Math.round(location.xpPerHit).toLocaleString()));
    }
    if (stats.childElementCount > 0) {
        body.append(stats);
    }
    // wanted here: cheapest to finish first, with whether the stamina covers it
    if (advice.needed.length > 0) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("Wanted here", {
            aside: String(advice.needed.length),
            tone: "ok",
        });
        for (const entry of advice.needed.slice(0, shared_1.MAX_LISTED * 2)) {
            const covered = stamina !== undefined && stamina >= entry.attempts
                ? " — stamina covers it"
                : "";
            const drop = location.drops.find((candidate) => candidate.name === entry.name);
            cardBody.append((0, shared_1.makeRow)((0, gameLinks_1.makeItemLink)(entry.name, entry.id, theme_1.TEXT_WHITE), {
                aside: [
                    `~${(0, shared_1.formatHits)(entry.attempts)}`,
                    document.createElement("br"),
                    attemptsNoun(location.type),
                ],
                icon: (0, shared_1.toIconUrl)(drop === null || drop === void 0 ? void 0 : drop.image),
                sub: [`${entry.quantity.toLocaleString()} needed${covered}`],
                tags: entry.reasons
                    .slice(0, 3)
                    .map((reason) => (0, shared_1.makeTag)(reason, "ok")),
                tone: "ok",
            }));
        }
        body.append(card);
    }
    // wasted here: at cap, every drop discarded, and the mastery it costs
    if (advice.wasted.length > 0) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("Thrown away here", {
            aside: String(advice.wasted.length),
            tone: "err",
        });
        for (const entry of advice.wasted.slice(0, shared_1.MAX_LISTED * 2)) {
            const drop = location.drops.find((candidate) => candidate.name === entry.name);
            cardBody.append((0, shared_1.makeRow)((0, gameLinks_1.makeItemLink)(entry.name, entry.id, theme_1.TEXT_WHITE), {
                aside: ["at cap"],
                icon: (0, shared_1.toIconUrl)(drop === null || drop === void 0 ? void 0 : drop.image),
                sub: [
                    entry.masteryRemaining === undefined
                        ? "every one you find is discarded"
                        : `discarded — still owes ${entry.masteryRemaining.toLocaleString()} mastery`,
                ],
                tone: "err",
            }));
        }
        body.append(card);
    }
    // the whole table, best rate first, everything you know laid over it
    const { card, body: cardBody } = (0, shared_1.makeCard)("Everything that drops here", {
        aside: "1 in N tries",
    });
    for (const drop of location.drops) {
        const needed = (_a = neededByName.get(drop.name)) === null || _a === void 0 ? void 0 : _a.quantity;
        cardBody.append(makeDropRow(drop, context, (_b = reasons.get(drop.name)) !== null && _b !== void 0 ? _b : (wastedNames.has(drop.name) ? [] : undefined), needed));
    }
    body.append(card);
};
exports.renderLocationView = renderLocationView;
// A mine, drawn from what its dig board has shown so far. No site publishes a
// mine's drop table, so there are no rates and no "tries to finish" here --
// only which of the things you have seen come out of the ground you still
// want, which you are throwing away, and your count against the cap for each.
const renderMineView = (body, context, mine, focused) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const { cap, inventory, resolved } = context;
    const missing = (0, shared_1.getMissingDemand)(context, focused);
    const neededByName = new Map(missing.map((entry) => [entry.name, entry]));
    const reasons = (0, shared_1.getReasonsByItem)(resolved, focused);
    const isAtCap = (name) => { var _a; return cap !== undefined && cap > 0 && ((_a = inventory[name]) !== null && _a !== void 0 ? _a : 0) >= cap; };
    // header
    const place = document.createElement("div");
    place.className = "fh-place";
    const icon = (0, shared_1.toIconUrl)(mine.image);
    if (icon) {
        const img = document.createElement("img");
        img.src = icon;
        img.alt = "";
        place.append(img);
    }
    const text = document.createElement("div");
    const name = document.createElement("div");
    name.className = "fh-place-name";
    name.textContent = mine.name;
    const sub = document.createElement("div");
    sub.className = "fh-place-sub";
    sub.textContent = `Mine · ${(0, shared_1.plural)(mine.drops.length, "drop")} seen so far`;
    text.append(name, sub);
    place.append(text);
    body.append(place);
    if (mine.stamina !== undefined) {
        const stats = document.createElement("div");
        stats.className = "fh-stats";
        stats.append(makeStat("stamina", mine.stamina.toLocaleString()));
        body.append(stats);
    }
    if (mine.drops.length === 0) {
        body.append((0, shared_1.makeEmpty)("Nothing learned about this mine yet. Its drops are read off the dig board as you find them, so dig a little and they will appear here."));
        return;
    }
    const wanted = mine.drops.filter((drop) => neededByName.has(drop.name) && !isAtCap(drop.name));
    const wasted = mine.drops.filter((drop) => isAtCap(drop.name));
    // wanted here: what you are short of that this mine has turned up
    if (wanted.length > 0) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("Wanted here", {
            aside: String(wanted.length),
            tone: "ok",
        });
        for (const drop of wanted.slice(0, shared_1.MAX_LISTED * 2)) {
            const needed = (_b = (_a = neededByName.get(drop.name)) === null || _a === void 0 ? void 0 : _a.quantity) !== null && _b !== void 0 ? _b : 0;
            cardBody.append((0, shared_1.makeRow)((0, gameLinks_1.makeItemLink)(drop.name, drop.id, theme_1.TEXT_WHITE), {
                aside: [
                    `${((_c = inventory[drop.name]) !== null && _c !== void 0 ? _c : 0).toLocaleString()}${cap !== undefined && cap > 0 ? ` / ${cap.toLocaleString()}` : ""}`,
                ],
                icon: (0, shared_1.toIconUrl)(drop.image),
                sub: [`${needed.toLocaleString()} needed`],
                tags: ((_d = reasons.get(drop.name)) !== null && _d !== void 0 ? _d : [])
                    .slice(0, 3)
                    .map((reason) => (0, shared_1.makeTag)(reason, "ok")),
                tone: "ok",
            }));
        }
        body.append(card);
    }
    // wasted here: at cap, so every one the board turns up is discarded
    if (wasted.length > 0) {
        const { card, body: cardBody } = (0, shared_1.makeCard)("Thrown away here", {
            aside: String(wasted.length),
            tone: "err",
        });
        for (const drop of wasted.slice(0, shared_1.MAX_LISTED * 2)) {
            cardBody.append((0, shared_1.makeRow)((0, gameLinks_1.makeItemLink)(drop.name, drop.id, theme_1.TEXT_WHITE), {
                aside: ["at cap"],
                icon: (0, shared_1.toIconUrl)(drop.image),
                sub: ["every one you find is discarded"],
                tone: "err",
            }));
        }
        body.append(card);
    }
    // everything the board has shown, with your count against the cap
    const { card, body: cardBody } = (0, shared_1.makeCard)("Seen dropping here", {
        aside: "no rates known",
    });
    for (const drop of mine.drops) {
        const have = (_e = inventory[drop.name]) !== null && _e !== void 0 ? _e : 0;
        const atCap = isAtCap(drop.name);
        const nearCap = !atCap && cap !== undefined && cap > 0 && have >= cap * NEAR_CAP_RATIO;
        const wantedFor = (_f = reasons.get(drop.name)) !== null && _f !== void 0 ? _f : [];
        const tags = [];
        if (atCap) {
            tags.push((0, shared_1.makeTag)("at cap — wasted", "err"));
        }
        else if (nearCap) {
            tags.push((0, shared_1.makeTag)("near cap", "warn"));
        }
        for (const reason of wantedFor.slice(0, 2)) {
            tags.push((0, shared_1.makeTag)(reason, "ok"));
        }
        if (wantedFor.length > 2) {
            tags.push((0, shared_1.makeTag)(`+${wantedFor.length - 2}`, "ok"));
        }
        const needed = (_g = neededByName.get(drop.name)) === null || _g === void 0 ? void 0 : _g.quantity;
        let tone;
        if (atCap) {
            tone = "err";
        }
        else if (needed !== undefined) {
            tone = "ok";
        }
        cardBody.append((0, shared_1.makeRow)((0, gameLinks_1.makeItemLink)(drop.name, drop.id, theme_1.TEXT_WHITE), {
            aside: [
                cap !== undefined && cap > 0
                    ? `${have.toLocaleString()} / ${cap.toLocaleString()}`
                    : have.toLocaleString(),
            ],
            icon: (0, shared_1.toIconUrl)(drop.image),
            sub: needed === undefined ? [] : [`${needed.toLocaleString()} needed`],
            tags,
            tone,
        }));
    }
    body.append(card);
};
const renderHereTab = (body, context, focused) => __awaiter(void 0, void 0, void 0, function* () {
    const missing = (0, shared_1.getMissingDemand)(context, focused);
    if (context.here) {
        (0, exports.renderLocationView)(body, context, context.here, focused);
        yield renderWhereToGo(body, context, missing, "Elsewhere");
        return;
    }
    if (context.mine) {
        renderMineView(body, context, context.mine, focused);
        yield renderWhereToGo(body, context, missing, "Elsewhere");
        return;
    }
    body.append((0, shared_1.makeEmpty)("Not at an explore area, fishing spot or mine. Open the panel on one for its drop table against your needs."));
    yield renderWhereToGo(body, context, missing, "Where to go");
});
exports.renderHereTab = renderHereTab;


/***/ }),

/***/ 2294:
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
exports.lookupTitle = exports.renderLookup = exports.toLookup = void 0;
const shared_1 = __webpack_require__(4073);
const townsfolk_1 = __webpack_require__(2161);
const api_1 = __webpack_require__(3413);
const gameLinks_1 = __webpack_require__(1616);
const promise_1 = __webpack_require__(6762);
const here_1 = __webpack_require__(7190);
const search_1 = __webpack_require__(5164);
const theme_1 = __webpack_require__(1178);
const toLookup = (entry) => {
    switch (entry.kind) {
        case "item": {
            return { kind: "item", name: entry.name };
        }
        case "quest": {
            return { kind: "quest", name: entry.name };
        }
        case "townsfolk": {
            return { kind: "townsfolk", name: entry.name, slug: (0, search_1.slugOf)(entry) };
        }
        case "location": {
            return { kind: "location", name: entry.name };
        }
        default: {
            return undefined;
        }
    }
};
exports.toLookup = toLookup;
const MAX_ROWS = 8;
// a row's trailing "open here" control
const makeOpenHere = (open, lookup) => {
    const button = document.createElement("span");
    button.className = "fh-open-here";
    button.textContent = "▸";
    button.title = "Open in the panel";
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        open(lookup);
    });
    return button;
};
const makeMore = (total, shown, onMore) => {
    if (total <= shown) {
        return undefined;
    }
    const more = document.createElement("div");
    more.className = "fh-foot";
    const link = document.createElement("span");
    link.className = "fh-link";
    link.textContent = `show all ${total}`;
    link.addEventListener("click", (event) => {
        event.stopPropagation();
        onMore();
    });
    more.append(link);
    return more;
};
// A list that shows MAX_ROWS and expands in place.
const fillList = (body, entries, toRow) => {
    const paint = (limit) => {
        body.replaceChildren();
        for (const entry of entries.slice(0, limit)) {
            body.append(toRow(entry));
        }
        const more = makeMore(entries.length, limit, () => paint(entries.length));
        if (more) {
            body.append(more);
        }
    };
    paint(MAX_ROWS);
};
const makeHeader = (image, name, sub) => {
    const place = document.createElement("div");
    place.className = "fh-place";
    const icon = (0, shared_1.toIconUrl)(image);
    if (icon) {
        const img = document.createElement("img");
        img.src = icon;
        img.alt = "";
        place.append(img);
    }
    const text = document.createElement("div");
    const title = document.createElement("div");
    title.className = "fh-place-name";
    title.append(name);
    const subline = document.createElement("div");
    subline.className = "fh-place-sub";
    subline.append(...sub);
    text.append(title, subline);
    place.append(text);
    return place;
};
const haveOf = (context, name) => { var _a; return (_a = context.inventory[name]) !== null && _a !== void 0 ? _a : 0; };
// which of your undertakings are short of this item
const wantedBy = (context, name) => context.resolved.scopes
    .filter((scope) => scope.missing.some((entry) => entry.name === name))
    .map((scope) => scope.label);
const itemHref = (id) => id ? `item.php?id=${id}` : undefined;
const questHref = (id) => id ? `quest.php?id=${id}` : undefined;
const makeCountAside = (context, name, needed) => {
    const have = haveOf(context, name);
    const strong = document.createElement("strong");
    strong.textContent = have.toLocaleString();
    if (needed !== undefined) {
        strong.style.color = have >= needed ? "var(--fh-ok)" : "var(--fh-warn)";
        return [strong, ` / ${needed.toLocaleString()}`];
    }
    if (context.cap) {
        return [strong, ` / ${context.cap.toLocaleString()}`];
    }
    return [strong];
};
// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------
const renderItem = (body, context, name, open) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    const item = yield (0, promise_1.orUndefined)(api_1.itemDataState.get({ query: name }));
    if (!item) {
        body.append((0, shared_1.makeEmpty)(`buddy.farm has no page for “${name}”.`));
        return;
    }
    const have = haveOf(context, item.name);
    const { cap } = context;
    const isAtCap = cap !== undefined && cap > 0 && have >= cap;
    const sub = [];
    const gameLink = itemHref(item.id);
    if (gameLink) {
        sub.push((0, gameLinks_1.makeLink)(gameLink, "open item page ↗", "var(--fh-accent)"));
    }
    body.append(makeHeader(item.image, item.name, sub));
    // your standing with it, in one strip
    const tags = document.createElement("div");
    tags.className = "fh-row-tags";
    tags.style.marginBottom = "8px";
    tags.append((0, shared_1.makeTag)(`you have ${have.toLocaleString()}${cap ? ` / ${cap.toLocaleString()}` : ""}`, isAtCap ? "err" : "muted"));
    for (const label of wantedBy(context, item.name).slice(0, 3)) {
        tags.append((0, shared_1.makeTag)(`wanted: ${label}`, "ok"));
    }
    if (item.canBuy && item.buyPrice > 0) {
        tags.append((0, shared_1.makeTag)(`store ${item.buyPrice.toLocaleString()} silver`, "muted"));
    }
    if (item.fleaMarketPrice > 0) {
        tags.append((0, shared_1.makeTag)(`flea market ${item.fleaMarketPrice.toLocaleString()} gold`, "muted"));
    }
    if (item.craftingLevel > 0) {
        tags.append((0, shared_1.makeTag)(`crafting ${item.craftingLevel}`, "accent"));
    }
    if (item.cookingLevel > 0) {
        tags.append((0, shared_1.makeTag)(`cooking ${item.cookingLevel}`, "accent"));
    }
    body.append(tags);
    if (item.description) {
        const description = document.createElement("div");
        description.className = "fh-empty";
        description.style.padding = "0 2px 8px";
        description.textContent = item.description;
        body.append(description);
    }
    // where it comes from
    const sources = (0, shared_1.makeCard)("Obtainable from");
    let sourceCount = 0;
    const byLocation = new Map();
    for (const entry of (_a = item.dropRatesItems) !== null && _a !== void 0 ? _a : []) {
        const location = (_b = entry.dropRates) === null || _b === void 0 ? void 0 : _b.location;
        if (!(location === null || location === void 0 ? void 0 : location.name) || !entry.rate) {
            continue;
        }
        const existing = byLocation.get(location.name);
        if (!existing || entry.rate < existing.rate) {
            byLocation.set(location.name, {
                image: location.image,
                rate: entry.rate,
                type: location.type,
            });
        }
    }
    const locationNames = [...byLocation.keys()];
    const references = yield Promise.all(locationNames.map((locationName) => (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: locationName }))));
    const { resolved } = context;
    const wanted = Math.max(0, ...resolved.scopes
        .flatMap((scope) => scope.missing)
        .filter((entry) => entry.name === item.name)
        .map((entry) => entry.quantity));
    for (const [index, locationName] of locationNames
        .sort((a, b) => { var _a, _b, _c, _d; return ((_b = (_a = byLocation.get(a)) === null || _a === void 0 ? void 0 : _a.rate) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = byLocation.get(b)) === null || _c === void 0 ? void 0 : _c.rate) !== null && _d !== void 0 ? _d : 0); })
        .entries()) {
        const drop = byLocation.get(locationName);
        const reference = references[locationNames.indexOf(locationName)];
        if (!drop) {
            continue;
        }
        const rate = document.createElement("strong");
        rate.textContent = `1 in ${(0, shared_1.formatHits)(drop.rate)}`;
        const subParts = [
            drop.type === "fishing" ? "fishing" : "exploring",
        ];
        if (wanted > 0) {
            subParts.push(` · ~${(0, shared_1.formatHits)(wanted * drop.rate)} ${drop.type === "fishing" ? "casts" : "explores"} for the ${wanted.toLocaleString()} you need`);
        }
        sources.body.append((0, shared_1.makeRow)(reference
            ? (0, gameLinks_1.makeLink)((0, gameLinks_1.toLocationHref)(reference), locationName, theme_1.TEXT_WHITE)
            : locationName, {
            aside: [
                rate,
                makeOpenHere(open, { kind: "location", name: locationName }),
            ],
            icon: (0, shared_1.toIconUrl)(drop.image),
            sub: subParts,
            tone: index === 0 ? "ok" : undefined,
        }));
        sourceCount += 1;
    }
    for (const production of (_c = item.manualProductions) !== null && _c !== void 0 ? _c : []) {
        sources.body.append((0, shared_1.makeRow)(production.lineOne, {
            aside: [production.value],
            icon: (0, shared_1.toIconUrl)(production.image),
            sub: [production.lineTwo],
        }));
        sourceCount += 1;
    }
    for (const entry of (_d = item.petItems) !== null && _d !== void 0 ? _d : []) {
        sources.body.append((0, shared_1.makeRow)(entry.pet.name, {
            aside: [`level ${entry.level}`],
            icon: (0, shared_1.toIconUrl)(entry.pet.image),
            sub: ["pet"],
        }));
        sourceCount += 1;
    }
    for (const entry of (_e = item.locksmithOutputItems) !== null && _e !== void 0 ? _e : []) {
        sources.body.append((0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_f = itemHref(entry.item.id)) !== null && _f !== void 0 ? _f : "#", entry.item.name, theme_1.TEXT_WHITE), {
            aside: [
                entry.quantityMin === entry.quantityMax
                    ? `×${entry.quantityMax}`
                    : `×${entry.quantityMin}–${entry.quantityMax}`,
                makeOpenHere(open, { kind: "item", name: entry.item.name }),
            ],
            icon: (0, shared_1.toIconUrl)(entry.item.image),
            sub: ["locksmith"],
        }));
        sourceCount += 1;
    }
    for (const entry of (_g = item.npcRewards) !== null && _g !== void 0 ? _g : []) {
        sources.body.append((0, shared_1.makeRow)(entry.npc.name, {
            aside: [`×${entry.quantity}`],
            icon: (0, shared_1.toIconUrl)(entry.npc.image),
            sub: [`friendship level ${entry.level}`],
        }));
        sourceCount += 1;
    }
    for (const entry of (_h = item.rewardForQuests) !== null && _h !== void 0 ? _h : []) {
        sources.body.append((0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_j = questHref(entry.quest.id)) !== null && _j !== void 0 ? _j : "#", entry.quest.name, theme_1.TEXT_WHITE), {
            aside: [
                `×${entry.quantity}`,
                makeOpenHere(open, { kind: "quest", name: entry.quest.name }),
            ],
            icon: (0, shared_1.toIconUrl)(entry.quest.image),
            sub: ["quest reward"],
        }));
        sourceCount += 1;
    }
    for (const entry of (_k = item.towerRewards) !== null && _k !== void 0 ? _k : []) {
        sources.body.append((0, shared_1.makeRow)(`Tower floor ${entry.level}`, {
            aside: [`×${entry.itemQuantity.toLocaleString()}`],
            sub: ["tower"],
        }));
        sourceCount += 1;
    }
    for (const entry of (_l = item.skillLevelRewards) !== null && _l !== void 0 ? _l : []) {
        sources.body.append((0, shared_1.makeRow)(`${entry.skill} level ${entry.level}`, {
            aside: [`×${entry.itemQuantity.toLocaleString()}`],
            sub: ["level reward"],
        }));
        sourceCount += 1;
    }
    for (const entry of (_m = item.exchangeCenterOutputs) !== null && _m !== void 0 ? _m : []) {
        sources.body.append((0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_o = itemHref(entry.inputItem.id)) !== null && _o !== void 0 ? _o : "#", entry.inputItem.name, theme_1.TEXT_WHITE), {
            aside: [`${entry.inputQuantity} → ${entry.outputQuantity}`],
            icon: (0, shared_1.toIconUrl)(entry.inputItem.image),
            sub: ["exchange center"],
        }));
        sourceCount += 1;
    }
    if (sourceCount === 0) {
        sources.body.append((0, shared_1.makeEmpty)("No listed source."));
    }
    body.append(sources.card);
    // its recipe, with your counts against it
    if ((_p = item.recipeItems) === null || _p === void 0 ? void 0 : _p.length) {
        const recipe = (0, shared_1.makeCard)(item.canCook ? "Cooked from" : "Crafted from", {
            aside: (0, shared_1.plural)(item.recipeItems.length, "ingredient"),
        });
        for (const entry of item.recipeItems) {
            const ingredientHave = haveOf(context, entry.item.name);
            recipe.body.append((0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_q = itemHref(entry.item.id)) !== null && _q !== void 0 ? _q : "#", entry.item.name, theme_1.TEXT_WHITE), {
                aside: [
                    ...makeCountAside(context, entry.item.name, entry.quantity),
                    makeOpenHere(open, { kind: "item", name: entry.item.name }),
                ],
                icon: (0, shared_1.toIconUrl)(entry.item.image),
                tone: ingredientHave >= entry.quantity ? "ok" : "warn",
            }));
        }
        body.append(recipe.card);
    }
    // what it goes into
    if ((_r = item.recipeIngredientItems) === null || _r === void 0 ? void 0 : _r.length) {
        const usedIn = (0, shared_1.makeCard)("Used in", {
            aside: (0, shared_1.plural)(item.recipeIngredientItems.length, "recipe"),
        });
        fillList(usedIn.body, item.recipeIngredientItems, (entry) => {
            var _a;
            return (0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_a = itemHref(entry.item.id)) !== null && _a !== void 0 ? _a : "#", entry.item.name, theme_1.TEXT_WHITE), {
                aside: [
                    `×${entry.quantity}`,
                    makeOpenHere(open, { kind: "item", name: entry.item.name }),
                ],
                icon: (0, shared_1.toIconUrl)(entry.item.image),
            });
        });
        body.append(usedIn.card);
    }
    // the quests that want it, most demanding first
    if ((_s = item.requiredForQuests) === null || _s === void 0 ? void 0 : _s.length) {
        const quests = [...item.requiredForQuests].sort((a, b) => b.quantity - a.quantity);
        const total = quests.reduce((sum, entry) => sum + entry.quantity, 0);
        const needed = (0, shared_1.makeCard)("Needed for quests", {
            aside: `${(0, shared_1.plural)(quests.length, "quest")} · ${total.toLocaleString()} total`,
        });
        fillList(needed.body, quests, (entry) => {
            var _a;
            return (0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_a = questHref(entry.quest.id)) !== null && _a !== void 0 ? _a : "#", entry.quest.name, theme_1.TEXT_WHITE), {
                aside: [
                    `×${entry.quantity.toLocaleString()}`,
                    makeOpenHere(open, { kind: "quest", name: entry.quest.name }),
                ],
                icon: (0, shared_1.toIconUrl)(entry.quest.image),
                tone: have >= entry.quantity ? "ok" : undefined,
            });
        });
        body.append(needed.card);
    }
    // who wants it as a gift
    if ((_t = item.npcItems) === null || _t === void 0 ? void 0 : _t.length) {
        const snapshot = yield (0, promise_1.orUndefined)(townsfolk_1.townsfolkState.get());
        const links = (_u = snapshot === null || snapshot === void 0 ? void 0 : snapshot.links) !== null && _u !== void 0 ? _u : [];
        const townsfolk = (0, shared_1.makeCard)("Townsfolk");
        const order = { loves: 0, likes: 1, hates: 2 };
        const tone = {
            hates: "err",
            likes: "muted",
            loves: "accent",
        };
        const glyph = {
            hates: "✕",
            likes: "♡",
            loves: "♥",
        };
        const tagRow = document.createElement("div");
        tagRow.className = "fh-row-tags";
        for (const entry of [...item.npcItems].sort((a, b) => order[a.relationship] - order[b.relationship])) {
            const link = (0, townsfolk_1.findTownsfolkLink)(links, entry.npc.name);
            const tag = (0, shared_1.makeTag)(`${glyph[entry.relationship]} ${entry.npc.name}`, tone[entry.relationship], link === null || link === void 0 ? void 0 : link.href);
            tag.title = `${entry.npc.name} ${entry.relationship} this`;
            tagRow.append(tag);
        }
        townsfolk.body.append(tagRow);
        body.append(townsfolk.card);
    }
    // what it can be traded for
    if ((_v = item.exchangeCenterInputs) === null || _v === void 0 ? void 0 : _v.length) {
        const exchange = (0, shared_1.makeCard)("Exchange center", {
            aside: (0, shared_1.plural)(item.exchangeCenterInputs.length, "trade"),
        });
        fillList(exchange.body, item.exchangeCenterInputs, (entry) => {
            var _a;
            return (0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_a = itemHref(entry.outputItem.id)) !== null && _a !== void 0 ? _a : "#", entry.outputItem.name, theme_1.TEXT_WHITE), {
                aside: [
                    `${entry.inputQuantity} → ${entry.outputQuantity}`,
                    makeOpenHere(open, { kind: "item", name: entry.outputItem.name }),
                ],
                icon: (0, shared_1.toIconUrl)(entry.outputItem.image),
                sub: [`last seen ${entry.lastSeen}`],
            });
        });
        body.append(exchange.card);
    }
});
// ---------------------------------------------------------------------------
// Quest
// ---------------------------------------------------------------------------
const renderQuest = (body, context, name, open) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const quest = yield (0, promise_1.orUndefined)(api_1.questDataState.get({ query: name }));
    if (!quest) {
        body.append((0, shared_1.makeEmpty)(`buddy.farm has no page for “${name}”.`));
        return;
    }
    const sub = [];
    if (quest.npc) {
        sub.push(quest.npc, " · ");
    }
    const href = questHref(quest.id);
    if (href) {
        sub.push((0, gameLinks_1.makeLink)(href, "open quest ↗", "var(--fh-accent)"));
    }
    body.append(makeHeader(quest.image, quest.name, sub));
    const tags = document.createElement("div");
    tags.className = "fh-row-tags";
    tags.style.marginBottom = "8px";
    const levels = [
        ["farming", quest.requiredFarmingLevel],
        ["fishing", quest.requiredFishingLevel],
        ["crafting", quest.requiredCraftingLevel],
        ["exploring", quest.requiredExploringLevel],
        ["cooking", quest.requiredCookingLevel],
        ["tower", quest.requiredTowerLevel],
    ];
    for (const [skill, level] of levels) {
        if (level > 0) {
            tags.append((0, shared_1.makeTag)(`${skill} ${level}`, "accent"));
        }
    }
    if (quest.endDate) {
        tags.append((0, shared_1.makeTag)(`ends ${quest.endDate}`, "warn"));
    }
    if (tags.childElementCount > 0) {
        body.append(tags);
    }
    if (quest.cleanDescription) {
        const description = document.createElement("div");
        description.className = "fh-empty";
        description.style.padding = "0 2px 8px";
        description.textContent = quest.cleanDescription;
        body.append(description);
    }
    const required = (0, shared_1.makeCard)("Requires");
    let shortfalls = 0;
    for (const entry of (_a = quest.requiredItems) !== null && _a !== void 0 ? _a : []) {
        const have = haveOf(context, entry.item.name);
        if (have < entry.quantity) {
            shortfalls += 1;
        }
        required.body.append((0, shared_1.makeRow)(entry.item.name, {
            aside: [
                ...makeCountAside(context, entry.item.name, entry.quantity),
                makeOpenHere(open, { kind: "item", name: entry.item.name }),
            ],
            icon: (0, shared_1.toIconUrl)(entry.item.image),
            tone: have >= entry.quantity ? "ok" : "warn",
        }));
    }
    if (quest.requiredSilver > 0) {
        required.body.append((0, shared_1.makeRow)("Silver", { aside: [quest.requiredSilver.toLocaleString()] }));
    }
    if (required.body.childElementCount === 0) {
        required.body.append((0, shared_1.makeEmpty)("Nothing listed."));
    }
    const requiredHead = required.card.querySelector(".fh-card-head");
    if (requiredHead) {
        const aside = document.createElement("span");
        aside.className = "fh-card-aside";
        aside.textContent =
            shortfalls === 0 ? "you have it all" : `${shortfalls} short`;
        aside.style.color = shortfalls === 0 ? "var(--fh-ok)" : "var(--fh-warn)";
        requiredHead.append(aside);
    }
    body.append(required.card);
    const rewards = (0, shared_1.makeCard)("Rewards");
    for (const entry of (_b = quest.rewardItems) !== null && _b !== void 0 ? _b : []) {
        rewards.body.append((0, shared_1.makeRow)(entry.item.name, {
            aside: [
                `×${entry.quantity.toLocaleString()}`,
                makeOpenHere(open, { kind: "item", name: entry.item.name }),
            ],
            icon: (0, shared_1.toIconUrl)(entry.item.image),
        }));
    }
    if (quest.rewardSilver > 0) {
        rewards.body.append((0, shared_1.makeRow)("Silver", { aside: [quest.rewardSilver.toLocaleString()] }));
    }
    if (quest.rewardGold > 0) {
        rewards.body.append((0, shared_1.makeRow)("Gold", { aside: [quest.rewardGold.toLocaleString()] }));
    }
    if (rewards.body.childElementCount === 0) {
        rewards.body.append((0, shared_1.makeEmpty)("Nothing listed."));
    }
    body.append(rewards.card);
});
// ---------------------------------------------------------------------------
// Townsperson
// ---------------------------------------------------------------------------
const renderTownsfolk = (body, context, name, slug, open) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const [npc, snapshot] = yield Promise.all([
        (0, promise_1.orUndefined)(api_1.townsfolkDataState.get({ query: slug })),
        (0, promise_1.orUndefined)(townsfolk_1.townsfolkState.get()),
    ]);
    if (!npc) {
        body.append((0, shared_1.makeEmpty)(`buddy.farm has no page for “${name}”.`));
        return;
    }
    const link = (0, townsfolk_1.findTownsfolkLink)((_a = snapshot === null || snapshot === void 0 ? void 0 : snapshot.links) !== null && _a !== void 0 ? _a : [], npc.name);
    const sub = [];
    if (link) {
        sub.push((0, gameLinks_1.makeLink)(link.href, "open their page ↗", "var(--fh-accent)"));
    }
    body.append(makeHeader(npc.image, npc.name, sub));
    const groups = [
        { relationship: "loves", title: "Loves" },
        { relationship: "likes", title: "Likes" },
        { relationship: "hates", title: "Hates" },
    ];
    for (const group of groups) {
        const entries = npc.npcItems
            .filter((entry) => entry.relationship === group.relationship)
            // what you actually have to give, first
            .sort((a, b) => haveOf(context, b.item.name) - haveOf(context, a.item.name));
        if (entries.length === 0) {
            continue;
        }
        const inHand = entries.filter((entry) => haveOf(context, entry.item.name) > 0).length;
        const isHates = group.relationship === "hates";
        const card = (0, shared_1.makeCard)(group.title, {
            aside: isHates ? String(entries.length) : `${inHand} in hand`,
            tone: group.relationship === "loves" ? "ok" : undefined,
        });
        fillList(card.body, entries, (entry) => {
            var _a;
            const have = haveOf(context, entry.item.name);
            let tone = "muted";
            if (isHates) {
                tone = "err";
            }
            else if (have > 0) {
                tone = "ok";
            }
            return (0, shared_1.makeRow)((0, gameLinks_1.makeLink)((_a = itemHref(entry.item.id)) !== null && _a !== void 0 ? _a : "#", entry.item.name, theme_1.TEXT_WHITE), {
                aside: [
                    ...makeCountAside(context, entry.item.name),
                    makeOpenHere(open, { kind: "item", name: entry.item.name }),
                ],
                icon: (0, shared_1.toIconUrl)(entry.item.image),
                tone,
            });
        });
        body.append(card.card);
    }
    if ((_b = npc.quests) === null || _b === void 0 ? void 0 : _b.length) {
        const quests = (0, shared_1.makeCard)("Quests", { aside: String(npc.quests.length) });
        fillList(quests.body, npc.quests, (quest) => (0, shared_1.makeRow)(quest.name, {
            aside: [makeOpenHere(open, { kind: "quest", name: quest.name })],
            icon: (0, shared_1.toIconUrl)(quest.image),
        }));
        body.append(quests.card);
    }
});
// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------
const renderLocation = (body, context, name, focused) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const location = yield (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: name }));
    if (!((_a = location === null || location === void 0 ? void 0 : location.drops) === null || _a === void 0 ? void 0 : _a.length)) {
        body.append((0, shared_1.makeEmpty)(`buddy.farm has no drop table for “${name}”.`));
        return;
    }
    const image = ((_b = context.here) === null || _b === void 0 ? void 0 : _b.location.name) === name ? context.here.image : undefined;
    (0, here_1.renderLocationView)(body, context, { image, location }, focused);
});
const renderLookup = (body, context, lookup, focused, open) => __awaiter(void 0, void 0, void 0, function* () {
    switch (lookup.kind) {
        case "item": {
            yield renderItem(body, context, lookup.name, open);
            break;
        }
        case "quest": {
            yield renderQuest(body, context, lookup.name, open);
            break;
        }
        case "townsfolk": {
            yield renderTownsfolk(body, context, lookup.name, lookup.slug, open);
            break;
        }
        default: {
            yield renderLocation(body, context, lookup.name, focused);
        }
    }
});
exports.renderLookup = renderLookup;
const lookupTitle = (lookup) => lookup.name;
exports.lookupTitle = lookupTitle;


/***/ }),

/***/ 9454:
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
exports.renderQueuePlans = exports.buildQueuePlans = exports.isFedByDrops = exports.toSetName = void 0;
const needs_1 = __webpack_require__(2538);
const gameLinks_1 = __webpack_require__(1616);
const craftworks_1 = __webpack_require__(7831);
const craftworks_2 = __webpack_require__(920);
const theme_1 = __webpack_require__(1178);
// The game's set-name field is short; keep the prefix so the panel's own sets
// are recognisable in "My Item Sets" and can be told from Reed's loadouts.
const SET_NAME_LIMIT = 32;
const SET_NAME_PREFIX = "Plan: ";
const toSetName = (label) => `${SET_NAME_PREFIX}${label}`
    .replaceAll(/[^\s\w':-]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, SET_NAME_LIMIT)
    .trim();
exports.toSetName = toSetName;
const describeScope = (context, focused) => {
    const labels = context.resolved.scopes
        .filter((scope) => focused.has(scope.rootId))
        .map((scope) => scope.label);
    if (labels.length === 0) {
        return "all goals";
    }
    if (labels.length === 1) {
        return labels[0];
    }
    return `${labels[0]} +${labels.length - 1}`;
};
// Whether anything in `name`'s craft chain drops at the spot in view. Walks
// ingredients depth-first with a seen-set, so a cyclic or unknown recipe
// costs nothing worse than a "no".
const isFedByDrops = (graph, name, drops, seen = new Set()) => {
    const node = graph.nodes.get(name);
    if (!node) {
        return false;
    }
    for (const ingredient of node.ingredients) {
        if (drops.has(ingredient.name)) {
            return true;
        }
        if (!seen.has(ingredient.name)) {
            seen.add(ingredient.name);
            if ((0, exports.isFedByDrops)(graph, ingredient.name, drops, seen)) {
                return true;
            }
        }
    }
    return false;
};
exports.isFedByDrops = isFedByDrops;
const toProposal = (context, steps, maxSlots) => {
    var _a, _b;
    return (0, craftworks_1.planCraftworksQueue)({ steps, target: (_b = (_a = steps[0]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "" }, context.inventory, context.cap, maxSlots, context.unlimited);
};
const buildQueuePlans = (context, focused) => {
    var _a;
    const { craftworks, graph, here, inventory, resolved, unlimited } = context;
    if (!craftworks) {
        return [];
    }
    const maxSlots = (_a = craftworks.maxSlots) !== null && _a !== void 0 ? _a : craftworks.slots.length;
    const desired = (0, needs_1.getDesiredQueueForNeeds)(graph, resolved, inventory, unlimited, focused);
    if (desired.length === 0) {
        return [];
    }
    const plans = [];
    const label = describeScope(context, focused);
    plans.push(Object.assign(Object.assign({}, toProposal(context, desired, maxSlots)), { label, setName: (0, exports.toSetName)(label) }));
    if (here) {
        const { location } = here;
        const drops = new Set(location.drops.map((drop) => drop.name));
        const fed = desired.filter((entry) => (0, exports.isFedByDrops)(graph, entry.name, drops));
        // only worth a second list when it is genuinely narrower
        if (fed.length > 0 && fed.length < desired.length) {
            plans.push(Object.assign(Object.assign({}, toProposal(context, fed, maxSlots)), { label: `at ${location.name}`, setName: (0, exports.toSetName)(location.name) }));
        }
    }
    return plans;
};
exports.buildQueuePlans = buildQueuePlans;
// Two presses, like loading a set: the second names exactly what it saves.
const makeSaveControl = (plan, context, reload, onFailure) => {
    var _a;
    const { graph } = context;
    const ids = [];
    const unknown = [];
    for (const entry of plan.entries) {
        const id = (_a = graph.nodes.get(entry.name)) === null || _a === void 0 ? void 0 : _a.id;
        if (id) {
            ids.push(String(id));
        }
        else {
            unknown.push(entry.name);
        }
    }
    const action = document.createElement("a");
    action.href = "#";
    action.style.color = theme_1.TEXT_SUCCESS;
    action.style.fontSize = "12px";
    action.style.textDecoration = "underline";
    action.textContent = `save as set “${plan.setName}”`;
    let armed = false;
    action.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        event.stopPropagation();
        if (!armed) {
            armed = true;
            action.textContent = `confirm — saves ${ids.length} item${ids.length === 1 ? "" : "s"} as “${plan.setName}”${unknown.length > 0 ? ` (no id for ${unknown.join(", ")})` : ""}`;
            action.style.color = theme_1.TEXT_WARNING;
            return;
        }
        action.textContent = "saving…";
        action.style.color = theme_1.TEXT_GRAY;
        const result = yield (0, craftworks_2.saveSet)(plan.setName, ids);
        if (result.ok) {
            reload();
            return;
        }
        action.textContent = "save failed";
        action.style.color = theme_1.TEXT_ERROR;
        onFailure((0, gameLinks_1.makeMutedText)(` ${result.message}`));
    }));
    return action;
};
const renderQueuePlans = (body, context, focused, reload, 
// the panel's own set loader, so a saved plan loads the same confirmed,
// restorable way as any other set
makeLoadControl) => {
    var _a, _b;
    const { craftworks, graph } = context;
    if (!craftworks) {
        return;
    }
    const plans = (0, exports.buildQueuePlans)(context, focused);
    for (const plan of plans) {
        body.append((0, gameLinks_1.makeHeading)(`Queue plan — ${plan.label}`));
        for (const entry of plan.entries) {
            const slot = craftworks.slots.find((s) => s.name === entry.name);
            const color = slot ? theme_1.TEXT_SUCCESS : theme_1.TEXT_WARNING;
            const parts = [
                `${entry.position}. `,
                (0, gameLinks_1.makeItemLink)(entry.name, (_a = graph.nodes.get(entry.name)) === null || _a === void 0 ? void 0 : _a.id, color),
                ` ×${entry.quantity.toLocaleString()}`,
            ];
            if (slot) {
                parts.push(slot.position === entry.position
                    ? " — queued"
                    : ` — queued at ${slot.position}`);
            }
            else {
                parts.push(" — not queued");
            }
            body.append((0, gameLinks_1.makeLinkedLine)(color, parts));
        }
        if (plan.dropped.length > 0) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
                `left out: ${plan.dropped
                    .map((entry) => `${entry.name} (${entry.reason})`)
                    .join(", ")}`,
            ]));
        }
        const saved = ((_b = craftworks.sets) !== null && _b !== void 0 ? _b : []).find((set) => set.name.toLowerCase() === plan.setName.toLowerCase());
        const line = (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            saved ? `saved as “${saved.name}” — ` : "",
        ]);
        if (saved) {
            line.append(makeLoadControl(saved, (node) => line.append(node)));
        }
        else if (plan.entries.length > 0) {
            line.append(makeSaveControl(plan, context, reload, (node) => line.append(node)));
        }
        body.append(line);
    }
};
exports.renderQueuePlans = renderQueuePlans;


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
exports.makeSearchBox = exports.getSearchIndex = exports.slugOf = void 0;
const searchIndex_1 = __webpack_require__(9986);
const promise_1 = __webpack_require__(6762);
const api_1 = __webpack_require__(3413);
const shared_1 = __webpack_require__(4073);
var searchIndex_2 = __webpack_require__(9986);
Object.defineProperty(exports, "slugOf", ({ enumerable: true, get: function () { return searchIndex_2.slugOf; } }));
// Search over everything buddy.farm indexes -- items, quests, questlines,
// townsfolk, locations -- from the panel head, with the keyboard. A hit opens
// as a lookup inside the panel (see lookup.ts): buddy.farm's page, with the
// game's links and your own numbers on it.
let index;
let indexing;
const getSearchIndex = () => {
    if (index) {
        return Promise.resolve(index);
    }
    if (!indexing) {
        indexing = (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const data = yield (0, promise_1.orUndefined)(api_1.pageDataState.get());
            const entries = [];
            const buckets = [
                ...((_a = data === null || data === void 0 ? void 0 : data.items) !== null && _a !== void 0 ? _a : []),
                ...((_b = data === null || data === void 0 ? void 0 : data.quests) !== null && _b !== void 0 ? _b : []),
                ...((_c = data === null || data === void 0 ? void 0 : data.questlines) !== null && _c !== void 0 ? _c : []),
                ...((_d = data === null || data === void 0 ? void 0 : data.townsfolk) !== null && _d !== void 0 ? _d : []),
                ...((_e = data === null || data === void 0 ? void 0 : data.pages) !== null && _e !== void 0 ? _e : []),
            ];
            for (const page of buckets) {
                const kind = (0, searchIndex_1.kindOfHref)(page.href);
                // calculators and the like have no in-game counterpart, and a
                // questline has no page to open here (yet)
                if (!kind || kind === "questline") {
                    continue;
                }
                entries.push({
                    href: page.href,
                    image: page.image,
                    kind,
                    name: page.name,
                    searchText: (page.searchText || page.name).toLowerCase(),
                });
            }
            index = entries;
            return entries;
        }))();
    }
    return indexing;
};
exports.getSearchIndex = getSearchIndex;
// The input and its results list. `onSelect` gets the chosen entry; the box
// clears itself afterwards. Arrow keys move, Enter picks, Escape closes.
const makeSearchBox = (onSelect) => {
    const wrap = document.createElement("div");
    wrap.className = "fh-search";
    const input = document.createElement("input");
    input.className = "fh-search-input";
    input.type = "search";
    input.placeholder = "Search items, quests, places…";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", "Search buddy.farm");
    const hint = document.createElement("kbd");
    hint.className = "fh-search-kbd";
    hint.textContent = "Ctrl K";
    const results = document.createElement("div");
    results.className = "fh-search-results";
    results.dataset.on = "false";
    wrap.append(input, hint, results);
    let current = [];
    let cursor = -1;
    const close = () => {
        results.dataset.on = "false";
        results.replaceChildren();
        current = [];
        cursor = -1;
    };
    const paint = () => {
        results.replaceChildren();
        if (current.length === 0) {
            results.dataset.on = "false";
            return;
        }
        results.dataset.on = "true";
        for (const [position, entry] of current.entries()) {
            const row = document.createElement("div");
            row.className = "fh-search-row";
            row.dataset.active = String(position === cursor);
            const icon = (0, shared_1.toIconUrl)(entry.image);
            if (icon) {
                const img = document.createElement("img");
                img.src = icon;
                img.alt = "";
                img.loading = "lazy";
                row.append(img);
            }
            const name = document.createElement("span");
            name.className = "fh-search-name";
            name.textContent = entry.name;
            const kind = document.createElement("span");
            kind.className = "fh-search-kind";
            kind.textContent = searchIndex_1.KIND_LABEL[entry.kind];
            row.append(name, kind);
            // mousedown, not click: the input blurs on click and would close the
            // list before the click lands
            row.addEventListener("mousedown", (event) => {
                event.preventDefault();
                event.stopPropagation();
                pick(entry);
            });
            row.dataset.position = String(position);
            results.append(row);
        }
    };
    // hover moves the cursor; one listener on the list rather than one per row
    results.addEventListener("mousemove", (event) => {
        var _a, _b;
        const row = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(".fh-search-row");
        const position = Number((_b = row === null || row === void 0 ? void 0 : row.dataset.position) !== null && _b !== void 0 ? _b : -1);
        if (row && position !== cursor) {
            cursor = position;
            paint();
        }
    });
    const pick = (entry) => {
        input.value = "";
        close();
        onSelect(entry);
    };
    let latest = 0;
    input.addEventListener("input", () => {
        latest += 1;
        const stamp = latest;
        const query = input.value;
        if (query.trim().length === 0) {
            close();
            return;
        }
        (0, exports.getSearchIndex)()
            .then((entries) => {
            if (stamp !== latest) {
                return;
            }
            current = (0, searchIndex_1.searchEntries)(entries, query);
            cursor = current.length > 0 ? 0 : -1;
            paint();
        })
            .catch((error) => {
            console.error("Search failed", error);
        });
    });
    input.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp": {
                if (current.length === 0) {
                    return;
                }
                event.preventDefault();
                const step = event.key === "ArrowDown" ? 1 : -1;
                cursor = (cursor + step + current.length) % current.length;
                paint();
                break;
            }
            case "Enter": {
                if (cursor >= 0 && current[cursor]) {
                    event.preventDefault();
                    pick(current[cursor]);
                }
                break;
            }
            case "Escape": {
                event.stopPropagation();
                if (input.value) {
                    input.value = "";
                    close();
                }
                else {
                    input.blur();
                }
                break;
            }
            // No default
        }
    });
    input.addEventListener("blur", () => {
        // let a mousedown on a row land first
        setTimeout(close, 120);
    });
    input.addEventListener("focus", () => {
        if (input.value.trim().length > 0) {
            input.dispatchEvent(new Event("input"));
        }
    });
    // the panel closes on outside clicks; typing in here is not outside
    wrap.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    return {
        clear: () => {
            input.value = "";
            close();
        },
        element: wrap,
        focus: () => {
            input.focus();
            input.select();
        },
    };
};
exports.makeSearchBox = makeSearchBox;


/***/ }),

/***/ 9986:
/***/ ((__unused_webpack_module, exports) => {


// The search vocabulary and ranking, with no dependencies, so it can be
// tested outside the game.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.slugOf = exports.searchEntries = exports.kindOfHref = exports.KIND_LABEL = void 0;
exports.KIND_LABEL = {
    item: "item",
    location: "location",
    page: "page",
    quest: "quest",
    questline: "questline",
    townsfolk: "townsfolk",
};
// what a typed prefix filters to: "q:iron" for quests only
const KIND_PREFIX = {
    i: "item",
    l: "location",
    q: "quest",
    t: "townsfolk",
};
const MAX_RESULTS = 10;
const kindOfHref = (href) => {
    if (href.startsWith("/i/")) {
        return "item";
    }
    if (href.startsWith("/q/")) {
        return "quest";
    }
    if (href.startsWith("/ql/")) {
        return "questline";
    }
    if (href.startsWith("/t/")) {
        return "townsfolk";
    }
    if (href.startsWith("/l/")) {
        return "location";
    }
    return undefined;
};
exports.kindOfHref = kindOfHref;
// Ranked: exact name, then name prefix, then word prefix, then substring.
// Items before quests at equal rank, since that is what is searched for most.
const KIND_ORDER = {
    item: 0,
    location: 1,
    townsfolk: 2,
    quest: 3,
    questline: 4,
    page: 5,
};
const searchEntries = (entries, rawQuery) => {
    let query = rawQuery.trim().toLowerCase();
    let onlyKind;
    const prefix = /^([a-z]):\s*(.*)$/.exec(query);
    if (prefix && KIND_PREFIX[prefix[1]]) {
        onlyKind = KIND_PREFIX[prefix[1]];
        query = prefix[2];
    }
    if (query.length === 0) {
        return [];
    }
    const scored = [];
    for (const entry of entries) {
        if (onlyKind && entry.kind !== onlyKind) {
            continue;
        }
        const name = entry.name.toLowerCase();
        let score;
        if (name === query) {
            score = 0;
        }
        else if (name.startsWith(query)) {
            score = 1;
        }
        else if (name.includes(` ${query}`)) {
            score = 2;
        }
        else if (name.includes(query)) {
            score = 3;
        }
        else if (entry.searchText.includes(query)) {
            score = 4;
        }
        if (score !== undefined) {
            // within a tier the shortest name wins -- "Beatrix" over "Beach Ball"
            // for "bea" -- and the kind only breaks the remaining ties
            scored.push({
                entry,
                score: score * 1000 + name.length * 10 + KIND_ORDER[entry.kind],
            });
        }
    }
    return scored
        .sort((a, b) => a.score - b.score)
        .slice(0, MAX_RESULTS)
        .map(({ entry }) => entry);
};
exports.searchEntries = searchEntries;
const slugOf = (entry) => { var _a; return (_a = entry.href.split("/").filter(Boolean).pop()) !== null && _a !== void 0 ? _a : ""; };
exports.slugOf = slugOf;


/***/ }),

/***/ 4073:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toIconUrl = exports.makeEmpty = exports.makeTag = exports.makeRow = exports.makeCard = exports.appendMore = exports.formatAge = exports.formatHits = exports.plural = exports.getReasonsByItem = exports.getMissingDemand = exports.MAX_LISTED = exports.STYLE_ID = exports.PANEL_ID = exports.BUTTON_ID = void 0;
const focus_1 = __webpack_require__(7167);
const gameLinks_1 = __webpack_require__(1616);
const theme_1 = __webpack_require__(1178);
// What the panel and its tabs share: the ids the styles hang off, the context
// every tab reasons from, and the small primitives that make the tabs look
// like one panel rather than five.
exports.BUTTON_ID = "fh-briefing-button";
exports.PANEL_ID = "fh-briefing-panel";
exports.STYLE_ID = "fh-briefing-style";
exports.MAX_LISTED = 5;
// Everything you are short of, merged across every demand -- or, when
// undertakings are focused, only what those want. This is the ONE list focus
// narrows: alerts are never filtered, but "what do I go and get" is exactly
// the question focus exists to answer.
//
// Craftworks says what a slot is out of but never how many it is short by, so
// a blocker counts as one unit; a request's shortfall is exact. Both are the
// same trip, which is why they merge rather than being listed twice.
const getMissingDemand = (context, focused) => {
    var _a;
    const { advice, goalProgress, resolved, statuses } = context;
    const focusedScopes = resolved.scopes.filter((scope) => focused.has(scope.rootId));
    if (focusedScopes.length > 0) {
        return (0, focus_1.mergeMissing)(...focusedScopes.map((scope) => scope.missing));
    }
    return (0, focus_1.mergeMissing)((0, focus_1.rankBottlenecks)(statuses).map((entry) => ({
        name: entry.name,
        quantity: entry.maxNeeded,
    })), ((_a = advice === null || advice === void 0 ? void 0 : advice.roots) !== null && _a !== void 0 ? _a : []).map((root) => ({ name: root.name, quantity: 1 })), 
    // tracked goals steer this list too, so setting a goal changes where the
    // panel sends you rather than only what the Goals tab says
    ...goalProgress.map((entry) => entry.missing));
};
exports.getMissingDemand = getMissingDemand;
// Why the scope wants an item -- standing in a place, the question is which of
// your undertakings this drop is actually for.
const getReasonsByItem = (resolved, only) => {
    var _a;
    const reasons = new Map();
    for (const scope of resolved.scopes) {
        if (only.size > 0 && !only.has(scope.rootId)) {
            continue;
        }
        for (const entry of scope.missing) {
            reasons.set(entry.name, [
                ...((_a = reasons.get(entry.name)) !== null && _a !== void 0 ? _a : []),
                scope.label,
            ]);
        }
    }
    return reasons;
};
exports.getReasonsByItem = getReasonsByItem;
const plural = (count, noun) => `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;
exports.plural = plural;
const formatHits = (hits) => hits >= 100 ? Math.round(hits).toLocaleString() : hits.toFixed(1);
exports.formatHits = formatHits;
// Deliberately coarse: the question this answers is "is this still true?",
// and a number ticking by the second invites reading it as precision.
const formatAge = (readAt) => {
    const seconds = Math.max(0, Math.round((Date.now() - readAt) / 1000));
    if (seconds < 60) {
        return "just now";
    }
    const minutes = Math.round(seconds / 60);
    return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
};
exports.formatAge = formatAge;
// The alert sections cut at MAX_LISTED, but the button's badge counts them all,
// so a truncated list reads as the panel disagreeing with itself. Say what was
// left out instead.
const appendMore = (body, total) => {
    if (total <= exports.MAX_LISTED) {
        return;
    }
    body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [`+${total - exports.MAX_LISTED} more`]));
};
exports.appendMore = appendMore;
const makeCard = (title, options = {}) => {
    const card = document.createElement("section");
    card.className = "fh-card";
    if (options.tone) {
        card.dataset.tone = options.tone;
    }
    const head = document.createElement("header");
    head.className = "fh-card-head";
    const label = document.createElement("span");
    label.textContent = title;
    head.append(label);
    if (options.aside !== undefined) {
        const aside = document.createElement("span");
        aside.className = "fh-card-aside";
        aside.append(options.aside);
        head.append(aside);
    }
    const body = document.createElement("div");
    body.className = "fh-card-body";
    card.append(head, body);
    return { card, body };
};
exports.makeCard = makeCard;
const makeRow = (title, options = {}) => {
    const row = document.createElement(options.href ? "a" : "div");
    row.className = "fh-row";
    if (options.href) {
        row.href = options.href;
    }
    if (options.tone) {
        row.dataset.tone = options.tone;
    }
    const iconSlot = document.createElement("span");
    iconSlot.className = "fh-row-icon";
    if (options.icon) {
        const img = document.createElement("img");
        img.src = options.icon;
        img.alt = "";
        img.loading = "lazy";
        iconSlot.append(img);
    }
    const main = document.createElement("span");
    main.className = "fh-row-main";
    const titleLine = document.createElement("span");
    titleLine.className = "fh-row-title";
    titleLine.append(title);
    main.append(titleLine);
    if (options.sub && options.sub.length > 0) {
        const sub = document.createElement("span");
        sub.className = "fh-row-sub";
        sub.append(...options.sub);
        main.append(sub);
    }
    if (options.tags && options.tags.length > 0) {
        const tags = document.createElement("span");
        tags.className = "fh-row-tags";
        tags.append(...options.tags);
        main.append(tags);
    }
    const aside = document.createElement("span");
    aside.className = "fh-row-aside";
    if (options.aside) {
        aside.append(...options.aside);
    }
    row.append(iconSlot, main, aside);
    return row;
};
exports.makeRow = makeRow;
const makeTag = (text, tone = "muted", href) => {
    const tag = document.createElement(href ? "a" : "span");
    tag.className = "fh-tag";
    tag.dataset.tone = tone;
    tag.textContent = text;
    if (href) {
        tag.href = href;
    }
    return tag;
};
exports.makeTag = makeTag;
const makeEmpty = (text) => {
    const empty = document.createElement("div");
    empty.className = "fh-empty";
    empty.textContent = text;
    return empty;
};
exports.makeEmpty = makeEmpty;
// The buddy.farm image path is site-relative; the game serves the same icons.
const toIconUrl = (image) => {
    if (!image) {
        return undefined;
    }
    if (/^(?:https?:)?\/\//.test(image) || image.startsWith("data:")) {
        return image;
    }
    return image.startsWith("/") ? image : `/${image}`;
};
exports.toIconUrl = toIconUrl;


/***/ }),

/***/ 6306:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.injectPanelStyles = void 0;
const theme_1 = __webpack_require__(1178);
const shared_1 = __webpack_require__(4073);
const layout_1 = __webpack_require__(6253);
// Bottom-left, clear of the bottom bar. env() keeps the button clear of the
// iOS home indicator and any notch; the fallbacks make it identical to before
// on anything that does not report insets.
const EDGE_OFFSET = "calc(8px + env(safe-area-inset-left, 0px))";
const BOTTOM_OFFSET = "calc(62px + env(safe-area-inset-bottom, 0px))";
// On a phone the button moves to the RIGHT, at Reed's request: that is where a
// thumb rests.
const RIGHT_OFFSET = "calc(8px + env(safe-area-inset-right, 0px))";
const injectPanelStyles = () => {
    if (document.querySelector(`#${shared_1.STYLE_ID}`)) {
        return;
    }
    document.head.insertAdjacentHTML("beforeend", `<style id="${shared_1.STYLE_ID}">
      #${shared_1.BUTTON_ID} {
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
      #${shared_1.BUTTON_ID}:hover { color: ${theme_1.TEXT_WHITE}; border-color: #5a5a5a; }
      #${shared_1.BUTTON_ID}:active { transform: scale(0.94); }
      #${shared_1.BUTTON_ID}[data-open="true"] {
        color: ${theme_1.TEXT_WHITE};
        transform: rotate(90deg);
      }
      #${shared_1.BUTTON_ID} .fh-badge {
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
      /* The cap tracker's count, on the other shoulder of the button: red for
         items AT cap where you are (every drop of those is thrown away), amber
         when the worst of it is only near. It is what the row of icons in the
         stats bar used to be for -- a glance, without opening anything. */
      #${shared_1.BUTTON_ID} .fh-cap-badge {
        position: absolute;
        top: -2px;
        left: -2px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        background: ${theme_1.TEXT_ERROR};
        color: #fff;
        font-size: 11px;
        font-weight: bold;
        line-height: 18px;
        text-align: center;
      }
      #${shared_1.BUTTON_ID} .fh-cap-badge[data-level="near"] {
        background: ${theme_1.TEXT_WARNING};
        color: #111;
      }
      #${shared_1.PANEL_ID} .fh-cap-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin: 4px 0 8px;
      }
      #${shared_1.PANEL_ID} .fh-cap-item {
        display: block;
        line-height: 0;
        border-radius: 6px;
        border: 2px solid ${theme_1.TEXT_WARNING};
      }
      #${shared_1.PANEL_ID} .fh-cap-item[data-at-cap="true"] { border-color: ${theme_1.TEXT_ERROR}; }
      #${shared_1.PANEL_ID} .fh-cap-item img {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        display: block;
      }
      #${shared_1.PANEL_ID} .fh-cap-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 2px 0;
      }
      #${shared_1.PANEL_ID} .fh-cap-row img {
        width: 18px;
        height: 18px;
        border-radius: 3px;
        flex-shrink: 0;
      }
      #${shared_1.PANEL_ID} .fh-cap-row .fh-cap-count {
        margin-left: auto;
        color: ${theme_1.TEXT_GRAY};
        white-space: nowrap;
      }
      /* Design tokens. Every colour and radius in the panel comes from here,
         so a tab built later matches without copying hex values around, and
         the tints (a warning row's wash, a tag's border) are mixed from the
         same base rather than hand-picked. */
      #${shared_1.PANEL_ID} {
        --fh-bg: rgba(16, 17, 19, 0.94);
        --fh-surface: rgba(255, 255, 255, 0.035);
        --fh-surface-2: rgba(255, 255, 255, 0.07);
        --fh-border: rgba(255, 255, 255, 0.08);
        --fh-border-2: rgba(255, 255, 255, 0.14);
        --fh-text: #eceef0;
        --fh-muted: #9aa0a6;
        --fh-ok: ${theme_1.TEXT_SUCCESS};
        --fh-warn: ${theme_1.TEXT_WARNING};
        --fh-err: #ff5c5c;
        --fh-accent: #7cc4ff;
        --fh-radius: 12px;
        --fh-radius-s: 8px;
        --fh-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif;

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
        border-radius: var(--fh-radius);
        border: 1px solid var(--fh-border-2);
        background:
          radial-gradient(120% 80% at 0% 0%, rgba(124, 196, 255, 0.06), transparent 60%),
          var(--fh-bg);
        color: var(--fh-text);
        font-family: var(--fh-font);
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        -webkit-backdrop-filter: blur(14px) saturate(1.2);
        backdrop-filter: blur(14px) saturate(1.2);
        opacity: 0;
        transform: translateY(8px) scale(0.985);
        transform-origin: bottom left;
        pointer-events: none;
        transition: opacity 160ms ease, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
        container-type: inline-size;
        container-name: panel;
      }
      #${shared_1.PANEL_ID}[data-open="true"] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      /* Holds the tabs and the body. A column on a phone, exactly as before;
         a row on a wide screen, which turns the tab strip into a vertical
         rail. min-height:0 on both is what lets the body scroll inside a flex
         parent instead of pushing the panel taller. */
      #${shared_1.PANEL_ID} .fh-briefing-main {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }
      #${shared_1.PANEL_ID} .fh-briefing-body {
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
        flex: 1 1 auto;
        min-height: 0;
        padding-right: 2px;
      }
      #${shared_1.PANEL_ID} .fh-briefing-body::-webkit-scrollbar { width: 8px; }
      #${shared_1.PANEL_ID} .fh-briefing-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 4px;
      }
      #${shared_1.PANEL_ID} .fh-briefing-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      #${shared_1.PANEL_ID} .fh-briefing-refresh {
        cursor: pointer;
        color: ${theme_1.TEXT_GRAY};
        font-size: 11px;
      }
      #${shared_1.PANEL_ID} .fh-briefing-refresh:hover { color: ${theme_1.TEXT_WHITE}; }
      /* The way to the Farmhand settings from anywhere. On a desktop the
         menu gets you there; on a phone it is the one route that keeps
         going missing, and the panel is always on screen. */
      #${shared_1.PANEL_ID} .fh-briefing-settings {
        color: ${theme_1.TEXT_GRAY};
        font-size: 13px;
        line-height: 1;
        text-decoration: none;
      }
      #${shared_1.PANEL_ID} .fh-briefing-settings:hover { color: ${theme_1.TEXT_WHITE}; }
      /* How old the numbers are. The panel outlives navigation, so without
         this there is no telling whether it is showing this minute or whatever
         was true when it was opened. Muted: it is a caveat, not a reading. */
      #${shared_1.PANEL_ID} .fh-briefing-age {
        color: ${theme_1.TEXT_GRAY};
        font-size: 11px;
        opacity: 0.75;
      }
      #${shared_1.PANEL_ID} .fh-briefing-controls {
        align-items: center;
        display: flex;
        gap: 8px;
      }
      /* The perk indicator is a button, not a label: its tooltip is the only
         perk diagnostic there is, and a phone cannot show a tooltip. */
      #${shared_1.PANEL_ID} .fh-perk-chip {
        align-items: center;
        border-radius: 7px;
        cursor: pointer;
        display: flex;
        gap: 5px;
        padding: 3px 5px;
      }
      #${shared_1.PANEL_ID} .fh-perk-chip:hover,
      #${shared_1.PANEL_ID} .fh-perk-chip[data-on="true"] {
        background: rgba(255, 255, 255, 0.09);
      }
      #${shared_1.PANEL_ID} .fh-perk-note {
        display: none;
        color: ${theme_1.TEXT_GRAY};
        font-size: 11px;
        line-height: 1.4;
        margin: -2px 0 8px;
      }
      #${shared_1.PANEL_ID} .fh-perk-note[data-on="true"] { display: block; }
      /* The log under the note: one line per perk decision, newest last, so an
         ordering problem (a reconcile landing between a harvest's switch and
         the harvest) is visible as two entries a second apart. */
      /* Each log is a box of its own that scrolls, not a column that runs
         off the bottom of the panel: 40 diagnostic lines is taller than a
         phone. Newest is last, so the paint scrolls it to the end. */
      #${shared_1.PANEL_ID} .fh-perk-log {
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 6px;
        align-content: start;
        margin-top: 4px;
        max-height: 150px;
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        padding: 4px 6px;
        border-radius: var(--fh-radius-s);
        background: rgba(0, 0, 0, 0.18);
        opacity: 0.9;
      }
      #${shared_1.PANEL_ID} .fh-perk-log > span {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      #${shared_1.PANEL_ID} .fh-perk-log-time {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      #${shared_1.PANEL_ID} .fh-perk-log-heading {
        color: ${theme_1.TEXT_GRAY};
        font-size: 10px;
        letter-spacing: 0.04em;
        margin-top: 8px;
        text-transform: uppercase;
      }
      #${shared_1.PANEL_ID} .fh-briefing-tabs {
        display: flex;
        gap: 2px;
        margin-bottom: 10px;
        padding: 3px;
        border-radius: var(--fh-radius-s);
        background: var(--fh-surface);
        border: 1px solid var(--fh-border);
      }
      #${shared_1.PANEL_ID} .fh-tab {
        flex: 1 1 0;
        text-align: center;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        color: var(--fh-muted);
        background: transparent;
        transition: background 120ms ease, color 120ms ease;
        user-select: none;
        white-space: nowrap;
      }
      #${shared_1.PANEL_ID} .fh-tab:hover { color: var(--fh-text); }
      #${shared_1.PANEL_ID} .fh-tab[data-active="true"] {
        color: var(--fh-text);
        background: var(--fh-surface-2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
      }
      /* The count of things wanting attention in that tab. Muted, because it
         is there to be scanned rather than read. */
      #${shared_1.PANEL_ID} .fh-tab-count {
        margin-left: 5px;
        font-size: 11px;
        color: ${theme_1.TEXT_WARNING};
      }
      #${shared_1.PANEL_ID} .fh-tab[data-active="true"] .fh-tab-count {
        color: ${theme_1.TEXT_WARNING};
      }

      /* What you are focused on, and the way out of each one. Sits under the
         title so it is present on every tab, not only the one focus was set
         from. Wraps because focus is a list now -- two or three undertakings
         that share a material are the normal case. */
      #${shared_1.PANEL_ID} .fh-focus-chip {
        display: none;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 11px;
      }
      #${shared_1.PANEL_ID} .fh-focus-chip[data-on="true"] { display: flex; }
      #${shared_1.PANEL_ID} .fh-focus-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        border-radius: 7px;
        border: 1px solid ${theme_1.TEXT_WARNING};
        color: ${theme_1.TEXT_WARNING};
        max-width: 100%;
      }
      #${shared_1.PANEL_ID} .fh-focus-tag > span:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${shared_1.PANEL_ID} .fh-chip-clear {
        cursor: pointer;
        opacity: 0.75;
        flex: 0 0 auto;
      }
      #${shared_1.PANEL_ID} .fh-chip-clear:hover { opacity: 1; }
      /* Only appears once focus is a list: clearing three chips one at a time
         is the sort of thing that stops people using focus at all. */
      #${shared_1.PANEL_ID} .fh-focus-all {
        cursor: pointer;
        color: ${theme_1.TEXT_GRAY};
        padding: 3px 4px;
      }
      #${shared_1.PANEL_ID} .fh-focus-all:hover { color: ${theme_1.TEXT_WHITE}; }
      /* Dimmed, never hidden: a quest that disappeared because you focused
         another is exactly what you would forget about. */
      #${shared_1.PANEL_ID} .fh-dim {
        opacity: 0.38;
        transition: opacity 160ms ease;
      }
      #${shared_1.PANEL_ID} .fh-dim:hover { opacity: 0.75; }

      /* Wide screens get a two-pane panel: a vertical rail of sections and a
         content pane. The rail is what removes the four-tab ceiling -- a
         column takes as many entries as we want, where the horizontal strip
         could not fit a fifth at 380px. Below this width nothing changes. */
      @media (min-width: 1024px) {
        #${shared_1.PANEL_ID} {
          width: 920px;
          max-height: 82vh;
        }
        #${shared_1.PANEL_ID} .fh-briefing-main {
          flex-direction: row;
          gap: 14px;
        }
        #${shared_1.PANEL_ID} .fh-briefing-tabs {
          flex: 0 0 148px;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 0;
          padding: 0 12px 0 0;
          background: transparent;
          border: none;
          border-right: 1px solid var(--fh-border);
          border-radius: 0;
        }
        #${shared_1.PANEL_ID} .fh-tab {
          flex: 0 0 auto;
          text-align: left;
          padding: 7px 10px;
          font-size: 13px;
        }
      }
      /* Phone layout. Everything here is either a thumb target or a
         consequence of there being no hover on touch -- the desktop panel is
         driven by hover states a finger never produces. */
      @media (max-width: ${layout_1.MOBILE_MAX_WIDTH}px) {
        /* Bottom RIGHT on a phone: that is where the thumb is, and the cap
           tracker (the only other floating thing on that side) is not drawn
           below this width, so the corner is free. */
        #${shared_1.BUTTON_ID} {
          left: auto;
          right: ${RIGHT_OFFSET};
          width: 48px;
          height: 48px;
        }
        #${shared_1.PANEL_ID} {
          left: auto;
          right: ${RIGHT_OFFSET};
          width: calc(100vw - 16px);
          /* vh on iOS Safari is the LARGEST viewport, so 70vh can run under the
             URL bar; dvh is the visible one. The fallback above still applies
             where dvh is unsupported. */
          max-height: min(70vh, calc(100dvh - 150px));
        }
        /* 5px of padding is a 22px-tall target. This makes the tab strip
           thumb-sized without changing anything on a desktop. */
        #${shared_1.PANEL_ID} .fh-tab {
          padding: 10px 8px;
          font-size: 13px;
        }
        #${shared_1.PANEL_ID} .fh-briefing-refresh {
          font-size: 12px;
          padding: 6px 2px 6px 10px;
        }
        #${shared_1.PANEL_ID} .fh-briefing-settings {
          font-size: 16px;
          padding: 6px 4px;
        }
        /* The perk chip is the note's only way open on a phone, which is the
           one place the note matters, so it gets a thumb-sized box. */
        #${shared_1.PANEL_ID} .fh-perk-chip {
          padding: 7px 8px;
        }
        #${shared_1.PANEL_ID} .fh-perk-note {
          font-size: 12px;
        }
        /* A 14px glyph is not a target. Padding grows the hit box without
           moving the glyph. */
        #${shared_1.PANEL_ID} .fh-goal-remove,
        #${shared_1.PANEL_ID} .fh-goal-action,
        #${shared_1.PANEL_ID} .fh-chip-clear {
          padding: 6px 8px;
          margin: -6px -8px -6px 0;
        }
        #${shared_1.PANEL_ID} .fh-chip {
          padding: 6px 12px;
          font-size: 12px;
        }
        #${shared_1.PANEL_ID} .fh-search-input { padding: 10px 12px; font-size: 14px; }
        #${shared_1.PANEL_ID} .fh-search-kbd { display: none; }
        #${shared_1.PANEL_ID} .fh-search-row { padding: 9px 8px; font-size: 13px; }
        #${shared_1.PANEL_ID} .fh-open-here { padding: 4px 9px; font-size: 14px; }
        #${shared_1.PANEL_ID} .fh-lookup-back { padding: 8px 8px 8px 2px; }
        /* 0.38 relies on hover to read a dimmed row, and touch has no hover.
           Dimmed still reads as secondary at 0.55 but stays legible. */
        #${shared_1.PANEL_ID} .fh-dim { opacity: 0.55; }
      }
      #${shared_1.PANEL_ID} .fh-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 8px;
      }
      #${shared_1.PANEL_ID} .fh-chip {
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
      #${shared_1.PANEL_ID} .fh-chip:hover { color: ${theme_1.TEXT_WHITE}; }
      #${shared_1.PANEL_ID} .fh-chip[data-active="true"] {
        color: ${theme_1.TEXT_WHITE};
        background: rgba(255, 255, 255, 0.11);
        border-color: #5a5a5a;
      }
      #${shared_1.PANEL_ID} .fh-goal { margin-bottom: 10px; }
      #${shared_1.PANEL_ID} .fh-goal-top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }
      #${shared_1.PANEL_ID} .fh-goal-remove {
        cursor: pointer;
        color: #6a6a6a;
        font-size: 14px;
        line-height: 1;
      }
      #${shared_1.PANEL_ID} .fh-goal-remove:hover { color: ${theme_1.TEXT_ERROR}; }
      #${shared_1.PANEL_ID} .fh-bar {
        height: 4px;
        border-radius: 2px;
        background: #2a2a2a;
        margin: 4px 0 3px;
        overflow: hidden;
      }
      #${shared_1.PANEL_ID} .fh-bar > div {
        height: 100%;
        border-radius: 2px;
        background: ${theme_1.TEXT_SUCCESS};
        transition: width 200ms ease;
      }

      /* ---- primitives: cards, rows, tags ---------------------------------- */
      #${shared_1.PANEL_ID} .fh-card {
        background: var(--fh-surface);
        border: 1px solid var(--fh-border);
        border-radius: var(--fh-radius-s);
        padding: 8px 10px 6px;
        margin-bottom: 8px;
        content-visibility: auto;
        contain-intrinsic-size: auto 80px;
      }
      #${shared_1.PANEL_ID} .fh-card[data-tone="err"] {
        border-color: color-mix(in srgb, var(--fh-err) 35%, transparent);
        background: color-mix(in srgb, var(--fh-err) 7%, var(--fh-surface));
      }
      #${shared_1.PANEL_ID} .fh-card[data-tone="warn"] {
        border-color: color-mix(in srgb, var(--fh-warn) 30%, transparent);
      }
      #${shared_1.PANEL_ID} .fh-card[data-tone="ok"] {
        border-color: color-mix(in srgb, var(--fh-ok) 30%, transparent);
      }
      #${shared_1.PANEL_ID} .fh-card-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: var(--fh-muted);
        margin-bottom: 4px;
      }
      #${shared_1.PANEL_ID} .fh-card-aside {
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
        font-variant-numeric: tabular-nums;
      }
      #${shared_1.PANEL_ID} .fh-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 9px;
        padding: 5px 4px;
        margin: 0 -4px;
        border-radius: 6px;
        color: var(--fh-text);
        text-decoration: none;
        font-size: 12px;
        line-height: 1.35;
      }
      #${shared_1.PANEL_ID} a.fh-row:hover { background: var(--fh-surface-2); }
      #${shared_1.PANEL_ID} .fh-row + .fh-row {
        border-top: 1px solid var(--fh-border);
        border-radius: 0 0 6px 6px;
      }
      #${shared_1.PANEL_ID} .fh-row[data-tone="err"] .fh-row-title { color: var(--fh-err); }
      #${shared_1.PANEL_ID} .fh-row[data-tone="warn"] .fh-row-title { color: var(--fh-warn); }
      #${shared_1.PANEL_ID} .fh-row[data-tone="ok"] .fh-row-title { color: var(--fh-ok); }
      #${shared_1.PANEL_ID} .fh-row[data-tone="muted"] { opacity: 0.6; }
      #${shared_1.PANEL_ID} .fh-row-icon {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 6px;
        background: var(--fh-surface-2);
        overflow: hidden;
      }
      #${shared_1.PANEL_ID} .fh-row-icon:empty { visibility: hidden; }
      #${shared_1.PANEL_ID} .fh-row-icon img { width: 22px; height: 22px; display: block; }
      #${shared_1.PANEL_ID} .fh-row-main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      #${shared_1.PANEL_ID} .fh-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #${shared_1.PANEL_ID} .fh-row-title a { color: inherit; }
      #${shared_1.PANEL_ID} .fh-row-sub { font-size: 11px; color: var(--fh-muted); }
      #${shared_1.PANEL_ID} .fh-row-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
      #${shared_1.PANEL_ID} .fh-row-aside {
        font-size: 11px;
        color: var(--fh-muted);
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      #${shared_1.PANEL_ID} .fh-row-aside strong { color: var(--fh-text); font-weight: 600; }
      #${shared_1.PANEL_ID} .fh-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 1px 7px;
        border-radius: 999px;
        font-size: 10.5px;
        line-height: 16px;
        color: var(--fh-muted);
        border: 1px solid var(--fh-border-2);
        background: var(--fh-surface);
        text-decoration: none;
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${shared_1.PANEL_ID} a.fh-tag:hover { border-color: var(--fh-text); color: var(--fh-text); }
      #${shared_1.PANEL_ID} .fh-tag[data-tone="ok"] {
        color: var(--fh-ok);
        border-color: color-mix(in srgb, var(--fh-ok) 45%, transparent);
        background: color-mix(in srgb, var(--fh-ok) 10%, transparent);
      }
      #${shared_1.PANEL_ID} .fh-tag[data-tone="warn"] {
        color: var(--fh-warn);
        border-color: color-mix(in srgb, var(--fh-warn) 45%, transparent);
        background: color-mix(in srgb, var(--fh-warn) 10%, transparent);
      }
      #${shared_1.PANEL_ID} .fh-tag[data-tone="err"] {
        color: var(--fh-err);
        border-color: color-mix(in srgb, var(--fh-err) 45%, transparent);
        background: color-mix(in srgb, var(--fh-err) 10%, transparent);
      }
      #${shared_1.PANEL_ID} .fh-tag[data-tone="accent"] {
        color: var(--fh-accent);
        border-color: color-mix(in srgb, var(--fh-accent) 45%, transparent);
        background: color-mix(in srgb, var(--fh-accent) 10%, transparent);
      }
      #${shared_1.PANEL_ID} .fh-empty {
        color: var(--fh-muted);
        font-size: 12px;
        padding: 6px 2px;
      }
      /* Key figures in a strip: stamina banked, silver and xp per hit. */
      #${shared_1.PANEL_ID} .fh-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
        gap: 6px;
        margin-bottom: 8px;
      }
      #${shared_1.PANEL_ID} .fh-stat {
        background: var(--fh-surface);
        border: 1px solid var(--fh-border);
        border-radius: var(--fh-radius-s);
        padding: 6px 9px;
      }
      #${shared_1.PANEL_ID} .fh-stat-label {
        font-size: 10px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--fh-muted);
      }
      #${shared_1.PANEL_ID} .fh-stat-value {
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: var(--fh-text);
      }
      /* The location header: icon, name, type. */
      #${shared_1.PANEL_ID} .fh-place {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      #${shared_1.PANEL_ID} .fh-place img {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: var(--fh-surface-2);
      }
      #${shared_1.PANEL_ID} .fh-place-name { font-size: 14px; font-weight: 600; color: var(--fh-text); }
      #${shared_1.PANEL_ID} .fh-place-name a { color: inherit; text-decoration: none; }
      #${shared_1.PANEL_ID} .fh-place-sub { font-size: 11px; color: var(--fh-muted); }
      /* Icon grids (the Cap tab's "drops here"). */
      #${shared_1.PANEL_ID} .fh-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 2px 0 4px;
      }
      #${shared_1.PANEL_ID} .fh-grid-item {
        display: block;
        line-height: 0;
        border-radius: 8px;
        border: 2px solid var(--fh-warn);
        background: var(--fh-surface-2);
        transition: transform 120ms ease;
      }
      #${shared_1.PANEL_ID} .fh-grid-item:hover { transform: translateY(-1px); }
      #${shared_1.PANEL_ID} .fh-grid-item[data-at-cap="true"] { border-color: var(--fh-err); }
      #${shared_1.PANEL_ID} .fh-grid-item img { width: 30px; height: 30px; border-radius: 6px; display: block; }
      #${shared_1.PANEL_ID} .fh-foot {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-top: 6px;
        font-size: 11px;
        color: var(--fh-muted);
      }
      #${shared_1.PANEL_ID} .fh-link { cursor: pointer; text-decoration: underline; color: var(--fh-muted); }
      #${shared_1.PANEL_ID} .fh-link:hover { color: var(--fh-text); }
      /* ---- search + lookup ------------------------------------------------ */
      #${shared_1.PANEL_ID} .fh-search {
        position: relative;
        margin-bottom: 8px;
      }
      #${shared_1.PANEL_ID} .fh-search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 7px 58px 7px 10px;
        border-radius: var(--fh-radius-s);
        border: 1px solid var(--fh-border-2);
        background: var(--fh-surface);
        color: var(--fh-text);
        font: 12.5px var(--fh-font);
        outline: none;
        transition: border-color 120ms ease, background 120ms ease;
      }
      #${shared_1.PANEL_ID} .fh-search-input::placeholder { color: var(--fh-muted); }
      #${shared_1.PANEL_ID} .fh-search-input:focus {
        border-color: color-mix(in srgb, var(--fh-accent) 60%, transparent);
        background: var(--fh-surface-2);
      }
      #${shared_1.PANEL_ID} .fh-search-input::-webkit-search-cancel-button { -webkit-appearance: none; }
      #${shared_1.PANEL_ID} .fh-search-kbd {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font: 10px var(--fh-font);
        color: var(--fh-muted);
        border: 1px solid var(--fh-border-2);
        border-radius: 5px;
        padding: 1px 5px;
        pointer-events: none;
      }
      #${shared_1.PANEL_ID} .fh-search-input:focus ~ .fh-search-kbd { opacity: 0; }
      #${shared_1.PANEL_ID} .fh-search-results {
        display: none;
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 4px);
        z-index: 2;
        max-height: 320px;
        overflow-y: auto;
        padding: 4px;
        border-radius: var(--fh-radius-s);
        border: 1px solid var(--fh-border-2);
        background: rgba(22, 23, 26, 0.98);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      }
      #${shared_1.PANEL_ID} .fh-search-results[data-on="true"] { display: block; }
      #${shared_1.PANEL_ID} .fh-search-row {
        display: grid;
        grid-template-columns: 22px 1fr auto;
        align-items: center;
        gap: 8px;
        padding: 5px 7px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        color: var(--fh-text);
      }
      #${shared_1.PANEL_ID} .fh-search-row[data-active="true"] { background: var(--fh-surface-2); }
      #${shared_1.PANEL_ID} .fh-search-row img { width: 20px; height: 20px; border-radius: 4px; }
      #${shared_1.PANEL_ID} .fh-search-row img:not([src]) { visibility: hidden; }
      #${shared_1.PANEL_ID} .fh-search-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #${shared_1.PANEL_ID} .fh-search-kind { font-size: 10px; color: var(--fh-muted); text-transform: uppercase; letter-spacing: 0.4px; }
      #${shared_1.PANEL_ID} .fh-lookup-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;
      }
      #${shared_1.PANEL_ID} .fh-lookup-back {
        cursor: pointer;
        color: var(--fh-accent);
        padding: 4px 6px 4px 2px;
        border-radius: 6px;
      }
      #${shared_1.PANEL_ID} .fh-lookup-back:hover { background: var(--fh-surface-2); }
      #${shared_1.PANEL_ID} .fh-lookup-kind {
        font-size: 10px;
        color: var(--fh-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #${shared_1.PANEL_ID} .fh-open-here {
        display: inline-block;
        margin-left: 6px;
        padding: 0 5px;
        border-radius: 5px;
        cursor: pointer;
        color: var(--fh-muted);
        opacity: 0.7;
      }
      #${shared_1.PANEL_ID} .fh-open-here:hover {
        color: var(--fh-accent);
        background: var(--fh-surface-2);
        opacity: 1;
      }
      #${shared_1.PANEL_ID} .fh-briefing-body { view-transition-name: fh-briefing-body; }
      ::view-transition-old(fh-briefing-body),
      ::view-transition-new(fh-briefing-body) {
        animation-duration: 140ms;
      }
      @media (prefers-reduced-motion: reduce) {
        #${shared_1.PANEL_ID}, #${shared_1.BUTTON_ID}, #${shared_1.PANEL_ID} * { transition: none !important; }
        ::view-transition-group(*),
        ::view-transition-old(*),
        ::view-transition-new(*) { animation: none !important; }
      }
    </style>`);
};
exports.injectPanelStyles = injectPanelStyles;


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
const shared_1 = __webpack_require__(4073);
const needAdapters_1 = __webpack_require__(1903);
const recipes_1 = __webpack_require__(498);
const api_1 = __webpack_require__(3413);
const inventoryCapWarnings_1 = __webpack_require__(6660);
const page_1 = __webpack_require__(7952);
const diagnostics_1 = __webpack_require__(3747);
const focusScope_1 = __webpack_require__(1307);
const suggestions_1 = __webpack_require__(9262);
const focus_1 = __webpack_require__(7167);
const requests_1 = __webpack_require__(3300);
const perks_1 = __webpack_require__(5543);
const quests_1 = __webpack_require__(303);
const settings_1 = __webpack_require__(126);
const locationAdvice_1 = __webpack_require__(4764);
const styles_1 = __webpack_require__(6306);
const inventory_1 = __webpack_require__(4514);
const lookup_1 = __webpack_require__(2294);
const gameLinks_1 = __webpack_require__(1616);
const search_1 = __webpack_require__(5164);
const mastery_1 = __webpack_require__(283);
const pageTransitions_1 = __webpack_require__(7694);
const promise_1 = __webpack_require__(6762);
const unlimited_1 = __webpack_require__(4808);
const cap_1 = __webpack_require__(2206);
const here_1 = __webpack_require__(7190);
const queuePlan_1 = __webpack_require__(9454);
const needs_1 = __webpack_require__(2538);
const theme_1 = __webpack_require__(1178);
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
const TABS = [
    // strictly what wants you this minute
    { id: "now", label: "Now" },
    // the place you are standing, read against your needs -- or where to go
    { id: "here", label: "Here" },
    { id: "goals", label: "Goals" },
    // the queue and its saved sets, together: sets are craftworks-only and the
    // one thing you open on purpose, so they sit under the queue's alerts
    { id: "craftworks", label: "Craftworks" },
    // items at or near the inventory cap, and who would take them off your hands
    { id: "cap", label: "Cap" },
];
// Inline so it always draws: the game mixes Font Awesome 4 and 6 and neither
// set is guaranteed to carry a given glyph.
const ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h11M3 12h8M3 18h11" />
    <path d="M16 15l3 3 5-6" />
  </svg>`;
// How many things in each tab actually want you. The point of the rail is to
// answer "where is the work" without opening all five, so a tab with nothing
// outstanding shows no number at all rather than a zero -- a row of zeroes
// reads as noise and hides the one number that matters.
const getTabCounts = (context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const counts = {};
    const attention = summarizeAttention(context.advice, context.statuses.filter((status) => status.isReady).length);
    if (attention.count > 0) {
        counts.now = attention.count;
    }
    // what drops where you are that you are short of; the tab is the place to
    // answer "is it worth staying"
    const dropsHere = (_b = (_a = context.here) === null || _a === void 0 ? void 0 : _a.location.drops) !== null && _b !== void 0 ? _b : (_c = context.mine) === null || _c === void 0 ? void 0 : _c.drops;
    if (dropsHere) {
        const wanted = dropsHere.filter((drop) => context.resolved.scopes.some((scope) => scope.missing.some((entry) => entry.name === drop.name))).length;
        if (wanted > 0) {
            counts.here = wanted;
        }
    }
    const unfinished = context.goalProgress.filter((progress) => progress.ratio < 1).length;
    if (unfinished > 0) {
        counts.goals = unfinished;
    }
    // the blockers nothing in the queue produces: the only ones a trip fixes --
    // or, failing those, a saved set that matches something you want and is not
    // the one loaded (getRecommendedSet skips the active set, so anything it
    // returns is by definition a change)
    const roots = (_e = (_d = context.advice) === null || _d === void 0 ? void 0 : _d.roots.length) !== null && _e !== void 0 ? _e : 0;
    if (roots > 0) {
        counts.craftworks = roots;
    }
    else if ((0, suggestions_1.getRecommendedSet)(getWantedNames(context), (_g = (_f = context.craftworks) === null || _f === void 0 ? void 0 : _f.sets) !== null && _g !== void 0 ? _g : [], context.itemNames)) {
        counts.craftworks = 1;
    }
    // items at cap where you are (or anywhere, before this spot is learned);
    // live tracker state rather than the context, same as the button's badge
    const capView = (0, inventoryCapWarnings_1.getCapTrackerView)();
    const atCapHere = ((_h = capView.here) !== null && _h !== void 0 ? _h : capView.items).filter((item) => item.isAtCap).length;
    if (capView.isEnabled && atCapHere > 0) {
        counts.cap = atCapHere;
    }
    return counts;
};
const summarizeAttention = (advice, readyRequests) => {
    const parts = [];
    if (advice && advice.dead.length > 0) {
        parts.push(`${(0, shared_1.plural)(advice.dead.length, "slot")} at cap`);
    }
    if (advice && advice.ordering.length > 0) {
        parts.push(`${(0, shared_1.plural)(advice.ordering.length, "slot")} out of order`);
    }
    if (readyRequests > 0) {
        parts.push(`${(0, shared_1.plural)(readyRequests, "request")} ready`);
    }
    return {
        count: (advice ? advice.dead.length + advice.ordering.length : 0) +
            readyRequests,
        parts,
    };
};
// The count on the button's left shoulder. Counts what is AT cap where you are
// (or anywhere, when this location's drops aren't known yet); when nothing is
// at cap it falls back to the near-cap count in amber, and to nothing at all
// when there is nothing to say. Live: repainted on every tracker change, not
// only when the panel loads.
const setCapBadge = () => {
    var _a;
    const button = document.querySelector(`#${shared_1.BUTTON_ID}`);
    if (!button) {
        return;
    }
    const existing = button.querySelector(".fh-cap-badge");
    const view = (0, inventoryCapWarnings_1.getCapTrackerView)();
    const scope = (_a = view.here) !== null && _a !== void 0 ? _a : view.items;
    const atCap = scope.filter((item) => item.isAtCap).length;
    const nearCap = scope.length - atCap;
    if (!view.isEnabled || (atCap === 0 && nearCap === 0)) {
        existing === null || existing === void 0 ? void 0 : existing.remove();
        return;
    }
    const badge = existing !== null && existing !== void 0 ? existing : document.createElement("span");
    badge.className = "fh-cap-badge";
    badge.dataset.level = atCap > 0 ? "at" : "near";
    badge.textContent = String(atCap > 0 ? atCap : nearCap);
    const where = view.here ? "here" : "in your inventory";
    badge.title =
        atCap > 0
            ? `${(0, shared_1.plural)(atCap, "item")} at cap ${where}${nearCap > 0 ? `, ${nearCap} near` : ""}`
            : `${(0, shared_1.plural)(nearCap, "item")} near cap ${where}`;
    if (!existing) {
        button.append(badge);
    }
};
const setBadge = (count, parts, isStale = false) => {
    const button = document.querySelector(`#${shared_1.BUTTON_ID}`);
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
const fetchActiveQuests = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, requests_1.getHTML)(page_1.Page.QUESTS, new URLSearchParams());
        return (0, quests_1.parseActiveQuests)(response.body);
    }
    catch (_a) {
        return undefined;
    }
});
// Identify the explore or fishing spot in view, if the panel was opened on one.
//
// This lives in the panel rather than on the page itself because the panel is
// the surface that reliably renders: injecting a card into the explore page
// meant guessing at its structure, and a wrong guess fails silently.
const getHere = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const page = (0, page_1.getCurrentPage)();
    if (!page) {
        return undefined;
    }
    // The page's own identity, not the URL. Framework7 does not always put the
    // route in the hash -- exploring shows a bare "farmrpg.com/#" -- so gating on
    // the address meant this returned before it had looked at anything, which is
    // also why it never reached a log line. `data-page` is what the page actually
    // declares itself to be.
    const route = window.location.hash || window.location.pathname;
    const identity = page.dataset.page;
    const isLocation = identity === page_1.Page.AREA ||
        identity === page_1.Page.FISHING ||
        /\b(?:area|fishing)\.php/.test(route);
    if (!isLocation) {
        return undefined;
    }
    const locations = yield (0, api_1.getLocationEntries)();
    const title = getNavbarTitle();
    const header = page.querySelector("img[src*='/img/items/']");
    const name = (_a = (0, locationAdvice_1.matchLocationName)(title, locations.map((entry) => entry.name))) !== null && _a !== void 0 ? _a : (header
        ? (0, locationAdvice_1.matchLocationByImage)((_b = header.getAttribute("src")) !== null && _b !== void 0 ? _b : "", locations)
        : undefined);
    if (!name) {
        console.debug("[Farmhand] could not identify this location", {
            image: header === null || header === void 0 ? void 0 : header.getAttribute("src"),
            known: locations.length,
            title,
        });
        return undefined;
    }
    let location = yield (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: name }));
    // entries cached before drop tables (or the per-hit figures and icons that
    // came later) existed lack them, and that cache lives a week
    if (location && (!location.drops || location.silverPerHit === undefined)) {
        location = yield (0, promise_1.orUndefined)(api_1.locationDataState.get({ query: name, ignoreCache: true }));
    }
    if (!((_c = location === null || location === void 0 ? void 0 : location.drops) === null || _c === void 0 ? void 0 : _c.length)) {
        console.debug("[Farmhand] no drop table for", name, location);
        return undefined;
    }
    const staminaText = (_e = (_d = page.querySelector("#stamina")) === null || _d === void 0 ? void 0 : _d.textContent) !== null && _e !== void 0 ? _e : "";
    return {
        image: (_f = locations.find((entry) => entry.name === name)) === null || _f === void 0 ? void 0 : _f.image,
        location,
        stamina: Number(staminaText.replaceAll(",", "").trim()) ||
            (0, locationAdvice_1.parseStamina)((_g = page.textContent) !== null && _g !== void 0 ? _g : ""),
    };
});
// The title the game prints in the navbar for the page in view -- its own
// text node, not the buttons that share the bar.
const getNavbarTitle = () => {
    var _a, _b, _c, _d, _e, _f;
    const centre = document.querySelector(".navbar-on-center .center");
    return ((_f = (_d = (_c = (_b = [...((_a = centre === null || centre === void 0 ? void 0 : centre.childNodes) !== null && _a !== void 0 ? _a : [])]
        .find((node) => node.nodeType === Node.TEXT_NODE)) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : (_e = centre === null || centre === void 0 ? void 0 : centre.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "");
};
// Identify the mine in view, if the panel was opened on a dig board.
//
// Kept apart from getHere because no site has a mine's drop table -- buddy.farm
// lists Mossrock Mine with an empty one -- so there is nothing to look up. The
// cap tracker learns a mine's drops off the board as they are found, and that
// list is what the Here tab draws a mine from: names and icons from the item
// index, ids (for links) from the per-item pages, both cached for a week.
const getMine = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const learned = (0, inventoryCapWarnings_1.getLearnedMineDrops)();
    if (!learned) {
        return undefined;
    }
    const page = (0, page_1.getCurrentPage)();
    const [items, locations] = yield Promise.all([
        (0, promise_1.orUndefined)((0, api_1.getBasicItems)()),
        (0, promise_1.orUndefined)((0, api_1.getLocationEntries)()),
    ]);
    const byBasename = new Map((items !== null && items !== void 0 ? items : []).map((item) => [(0, locationAdvice_1.imageBasename)(item.image), item]));
    const drops = yield Promise.all(learned.basenames.map((basename) => __awaiter(void 0, void 0, void 0, function* () {
        const item = byBasename.get(basename.toLowerCase());
        if (!item) {
            // an icon the index does not know: show it by its file name rather
            // than drop it, so a new item is not silently missing from the board
            return { image: `/img/items/${basename}`, name: basename };
        }
        const detail = yield (0, promise_1.orUndefined)(api_1.itemDataState.get({ query: item.name }));
        return { id: detail === null || detail === void 0 ? void 0 : detail.id, image: item.image, name: item.name };
    })));
    const title = getNavbarTitle();
    const name = (_a = (0, locationAdvice_1.matchLocationName)(title, (locations !== null && locations !== void 0 ? locations : []).map((entry) => entry.name))) !== null && _a !== void 0 ? _a : (title || "Mine");
    const staminaText = (_c = (_b = page === null || page === void 0 ? void 0 : page.querySelector("#stamina")) === null || _b === void 0 ? void 0 : _b.textContent) !== null && _c !== void 0 ? _c : "";
    return {
        drops,
        image: (_d = (locations !== null && locations !== void 0 ? locations : []).find((entry) => entry.name === name)) === null || _d === void 0 ? void 0 : _d.image,
        key: learned.key,
        name,
        stamina: Number(staminaText.replaceAll(",", "").trim()) ||
            (0, locationAdvice_1.parseStamina)((_e = page === null || page === void 0 ? void 0 : page.textContent) !== null && _e !== void 0 ? _e : ""),
    };
});
// Everything the three tabs need, gathered once. Switching tabs re-renders from
// this rather than re-fetching, so only the refresh control costs requests.
const loadContext = (force) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
        here: yield getHere(),
        mine: yield getMine(),
        goalProgress: goals.map((goal) => { var _a; return (0, goals_1.getGoalProgress)(graph, goal, inventory, unlimited, (_a = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _a !== void 0 ? _a : []); }),
        goals,
        graph,
        inventory,
        itemNames: (basicItems !== null && basicItems !== void 0 ? basicItems : []).map((item) => item.name),
        mastery: (_e = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _e !== void 0 ? _e : [],
        questGoals,
        resolved: (0, needs_1.resolveNeeds)(graph, (0, needAdapters_1.buildNeeds)({
            craftworksRoots: (_f = advice === null || advice === void 0 ? void 0 : advice.roots) !== null && _f !== void 0 ? _f : [],
            questGoals: (_g = questGoals === null || questGoals === void 0 ? void 0 : questGoals.goals) !== null && _g !== void 0 ? _g : [],
            trackedGoals: goals,
        }), inventory, unlimited, (_h = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _h !== void 0 ? _h : []),
        statuses: (0, focus_1.getGoalStatuses)(graph, (_j = questGoals === null || questGoals === void 0 ? void 0 : questGoals.goals) !== null && _j !== void 0 ? _j : [], inventory, unlimited),
        unlimited,
    };
});
// The item names the backlog wants, for matching Craftworks set names against.
// Everything outstanding, not only what was tracked by hand: a set that makes
// an intermediate a request needs is worth offering too.
const getWantedNames = (context) => {
    const names = new Set();
    for (const status of context.resolved.statuses) {
        if (status.need.kind === "item" && !status.isReady) {
            names.add(status.need.item);
        }
    }
    for (const entry of context.resolved.missing) {
        names.add(entry.name);
    }
    return [...names];
};
const renderNow = (body, context, focused) => {
    var _a;
    const { advice, graph, questGoals, resolved, statuses } = context;
    const focusedScopes = resolved.scopes.filter((scope) => focused.has(scope.rootId));
    // Scope ids are `kind:label`, and the legacy statuses this tab still reads
    // are keyed by that same label, so this is how focus reaches them without
    // moving the whole tab onto `resolved` in one go.
    const focusedLabels = new Set(focusedScopes.map((scope) => scope.label));
    // Focus decides what survives the cut to MAX_LISTED rather than hiding
    // anything: the alert sections are the things you must not miss, focused or
    // not, so they SORT rather than filter.
    const byFocus = (a, b) => Number(focusedLabels.has(b.goal.label)) -
        Number(focusedLabels.has(a.goal.label));
    const ready = statuses.filter((status) => status.isReady).sort(byFocus);
    const nearlyDone = (0, focus_1.getNearlyDone)(statuses).sort(byFocus);
    if (ready.length > 0) {
        body.append((0, gameLinks_1.makeHeading)("Ready to turn in"));
        for (const status of ready.slice(0, shared_1.MAX_LISTED)) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, [
                (0, gameLinks_1.makeQuestLink)(status.goal.label, status.goal.href, theme_1.TEXT_SUCCESS),
            ]));
        }
        (0, shared_1.appendMore)(body, ready.length);
    }
    if (nearlyDone.length > 0) {
        body.append((0, gameLinks_1.makeHeading)("One item away"));
        for (const status of nearlyDone.slice(0, shared_1.MAX_LISTED)) {
            const [only] = status.missing;
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
                (0, gameLinks_1.makeQuestLink)(status.goal.label, status.goal.href, theme_1.TEXT_WARNING),
                ` — ${only.quantity.toLocaleString()} × `,
                (0, gameLinks_1.makeItemLink)(only.name, (_a = graph.nodes.get(only.name)) === null || _a === void 0 ? void 0 : _a.id, theme_1.TEXT_WARNING),
            ]));
        }
        (0, shared_1.appendMore)(body, nearlyDone.length);
    }
    if (advice && advice.dead.length + advice.ordering.length > 0) {
        body.append((0, gameLinks_1.makeHeading)("Craftworks needs a hand"));
        for (const slot of advice.dead.slice(0, shared_1.MAX_LISTED)) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_ERROR, [
                (0, gameLinks_1.makeItemLink)(slot.name, Number(slot.id) || undefined, theme_1.TEXT_ERROR),
                " is at cap — dead slot",
            ]));
        }
        (0, shared_1.appendMore)(body, advice.dead.length);
        for (const { producer, slot } of advice.ordering) {
            body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_WARNING, [
                `move #${producer.position} ${producer.name} above #${slot.position} ${slot.name}`,
            ]));
        }
    }
    if (body.childNodes.length === 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_SUCCESS, ["Nothing needs attention."]));
    }
    const { unmatched } = questGoals !== null && questGoals !== void 0 ? questGoals : {};
    if (unmatched === null || unmatched === void 0 ? void 0 : unmatched.length) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [`not on buddy.farm: ${unmatched.join(", ")}`]));
    }
};
// The whole-undertaking view: one row per thing you are working toward, with
// its own roll-up rather than a flat list of items. This is what the scope axis
// in needs.ts is for -- a quest's items share a pool, so "3 of 5 ready" and the
// shortfall below it are the real figures for finishing it, not the sum of five
// independent questions.
//
// Non-focused rows are dimmed rather than hidden. The panel's job is stopping
// you from missing things, and a quest that vanished because you focused
// another one is exactly the sort of thing you would miss.
const renderUndertakings = (body, context, focused, onFocus) => {
    const { graph, resolved } = context;
    // single-item scopes are tracked goals, which have their own rows below --
    // this section is for things made of several parts
    const scopes = resolved.scopes.filter((scope) => {
        const items = scope.needs.filter((status) => status.need.kind === "item");
        return items.length > 1;
    });
    if (scopes.length === 0) {
        return;
    }
    body.append((0, gameLinks_1.makeHeading)("Undertakings"));
    // Every focused scope floats above the rest, then progress order within each
    // group -- with several focused at once, "closest to done" is still the order
    // you want to work them in.
    const ordered = [...scopes].sort((a, b) => Number(focused.has(b.rootId)) - Number(focused.has(a.rootId)) ||
        b.ratio - a.ratio);
    for (const scope of ordered) {
        const isFocused = focused.has(scope.rootId);
        const isDimmed = focused.size > 0 && !isFocused;
        const items = scope.needs.filter((status) => status.need.kind === "item");
        const ready = items.filter((status) => status.isReady).length;
        const row = document.createElement("div");
        row.className = isDimmed ? "fh-goal fh-dim" : "fh-goal";
        const top = document.createElement("div");
        top.className = "fh-goal-top";
        const name = document.createElement("div");
        name.style.fontSize = "12px";
        let colour = theme_1.TEXT_WHITE;
        if (scope.isReady) {
            colour = theme_1.TEXT_SUCCESS;
        }
        else if (isFocused) {
            colour = theme_1.TEXT_WARNING;
        }
        const link = document.createElement("span");
        link.style.color = colour;
        link.textContent = scope.label;
        name.append(link);
        const action = document.createElement("span");
        action.className = "fh-goal-action";
        action.style.cursor = "pointer";
        action.style.fontSize = "11px";
        action.style.color = isFocused ? theme_1.TEXT_WARNING : theme_1.TEXT_GRAY;
        // Toggling rather than replacing is the whole of multi-focus at this end:
        // pressing focus on a second undertaking adds it instead of dropping the
        // first, which is how two things sharing a material get worked together.
        action.textContent = isFocused ? "focused" : "focus";
        action.addEventListener("click", (event) => {
            event.stopPropagation();
            onFocus(scope.rootId);
        });
        top.append(name, action);
        row.append(top);
        const bar = document.createElement("div");
        bar.className = "fh-bar";
        const fill = document.createElement("div");
        fill.style.width = `${Math.round(scope.ratio * 100)}%`;
        if (!scope.isReady) {
            fill.style.background = theme_1.TEXT_WARNING;
        }
        bar.append(fill);
        row.append(bar);
        const detail = (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            `${ready}/${items.length} ready`,
            scope.missing.length > 0 ? " — short " : "",
            ...scope.missing
                .slice(0, 3)
                .flatMap((entry, index) => {
                var _a;
                return [
                    index > 0 ? ", " : "",
                    (0, gameLinks_1.makeItemLink)(entry.name, (_a = graph.nodes.get(entry.name)) === null || _a === void 0 ? void 0 : _a.id, theme_1.TEXT_GRAY),
                    ` x${entry.quantity}`,
                ];
            }),
            scope.missing.length > 3 ? `, +${scope.missing.length - 3} more` : "",
        ]);
        detail.style.fontSize = "11px";
        detail.style.marginBottom = "0";
        row.append(detail);
        body.append(row);
    }
};
const renderGoals = (body, context, rerender, focused, onFocus) => {
    var _a, _b;
    const { goalProgress, goals, graph } = context;
    renderUndertakings(body, context, focused, onFocus);
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
    renderSuggestions(body, context, rerender);
};
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
    body.append((0, gameLinks_1.makeHeading)("Suggested"));
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
const renderCraftworks = (body, context, reload, focused) => {
    var _a, _b;
    const { advice, cap, craftworks, inventory, mastery, resolved } = context;
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
        body.append((0, gameLinks_1.makeHeading)("Mastery frozen at cap"));
        for (const entry of frozen.slice(0, shared_1.MAX_LISTED)) {
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
    // The queue the panel would build for what you are doing -- focused
    // undertakings, and the slice of that fed by the spot you are standing at --
    // each row marked queued / not queued against the live slots, and saveable
    // as a set in one press. This replaced the add/remove diff ("Suggested
    // changes"): the plan says the same thing in the order the queue wants, and
    // dead slots are already red in the live list above.
    (0, queuePlan_1.renderQueuePlans)(body, context, focused, reload, (set, onFailure) => makeSetLoadControl(set, context, reload, onFailure));
    // only when there is genuinely nothing to aim at -- the plan costs open
    // requests and stalled slots too, not tracked goals alone
    if (resolved.scopes.length === 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            "Track a goal to get a queue plan aimed at something.",
        ]));
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
    const { craftworks, itemNames } = context;
    if (!craftworks) {
        return;
    }
    const recommended = (0, suggestions_1.getRecommendedSet)(getWantedNames(context), (_a = craftworks.sets) !== null && _a !== void 0 ? _a : [], itemNames);
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
    const { craftworks, itemNames } = context;
    const sets = (_a = craftworks === null || craftworks === void 0 ? void 0 : craftworks.sets) !== null && _a !== void 0 ? _a : [];
    // Having no sets and never having read the page are different problems with
    // different fixes, and this tab holds nothing else now, so saying "none
    // found" for both sent you looking for sets you had already saved.
    if (!craftworks) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            "Haven't read the Craftworks page yet — open it once and refresh.",
        ]));
        return;
    }
    if (sets.length === 0) {
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, [
            "No saved sets. Save one on the Craftworks page and it can be loaded from here.",
        ]));
        return;
    }
    body.append((0, gameLinks_1.makeHeading)("Craftworks sets"));
    const recommended = (0, suggestions_1.getRecommendedSet)(getWantedNames(context), sets, itemNames);
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
const makeLoadingLine = () => {
    const line = (0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, ["Reading buddy.farm…"]);
    line.className = "fh-loading";
    return line;
};
const ensurePanel = () => {
    if (document.querySelector(`#${shared_1.BUTTON_ID}`)) {
        return;
    }
    (0, styles_1.injectPanelStyles)();
    const button = document.createElement("div");
    button.id = shared_1.BUTTON_ID;
    button.title = "Farmhand briefing";
    button.innerHTML = ICON;
    const panel = document.createElement("div");
    panel.id = shared_1.PANEL_ID;
    const head = document.createElement("div");
    head.className = "fh-briefing-head";
    const heading = document.createElement("div");
    heading.style.alignItems = "center";
    heading.style.display = "flex";
    heading.style.gap = "6px";
    // Which perk set the manager believes is on, in the same shape as the marker
    // in the stats bar. On a phone that bar has no room for it and there is no
    // console either, so without this there is no way to tell whether switching
    // is working at all.
    const perkDot = document.createElement("span");
    perkDot.style.borderRadius = "50%";
    perkDot.style.flexShrink = "0";
    perkDot.style.height = "8px";
    perkDot.style.width = "8px";
    const perkLabel = document.createElement("span");
    perkLabel.style.fontSize = "11px";
    perkLabel.style.whiteSpace = "nowrap";
    // The chip is the whole indicator, and it opens the note below. The note is
    // the only account of what the manager did -- which page it recognised and
    // whether the switch landed -- and it used to live in a tooltip, which a
    // phone never shows and which is where perk switching is hardest to trust.
    const perkChip = document.createElement("div");
    perkChip.className = "fh-perk-chip";
    perkChip.dataset.on = "false";
    perkChip.append(perkDot, perkLabel);
    const perkNote = document.createElement("div");
    perkNote.className = "fh-perk-note";
    perkNote.dataset.on = "false";
    const perkNoteText = document.createElement("div");
    perkNote.append(perkNoteText);
    const perkLogElement = document.createElement("div");
    perkLogElement.className = "fh-perk-log";
    // The script's own start-up and dispatch log, below the perk log, with the
    // running version on top. Together they are the only account a phone can
    // give of what the script did (see utils/diagnostics.ts).
    const diagnosticsHeading = document.createElement("div");
    diagnosticsHeading.className = "fh-perk-log-heading";
    diagnosticsHeading.textContent = `Farmhand ${ true && "1.1.80" !== void 0 ? "1.1.80" : "?"} log`;
    const diagnosticsElement = document.createElement("div");
    diagnosticsElement.className = "fh-perk-log";
    perkNote.append(perkLogElement, diagnosticsHeading, diagnosticsElement);
    const paintLog = (element, entries) => {
        element.replaceChildren();
        for (const entry of entries) {
            const time = document.createElement("span");
            time.className = "fh-perk-log-time";
            time.textContent = new Date(entry.at).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            const text = document.createElement("span");
            text.textContent = entry.text;
            element.append(time, text);
        }
        // newest entry last, so that is where the eye should land
        element.scrollTop = element.scrollHeight;
    };
    const paintPerkLog = () => {
        paintLog(perkLogElement, (0, perks_1.getPerkLog)());
        paintLog(diagnosticsElement, (0, diagnostics_1.getDiagnostics)());
    };
    const paintPerk = () => {
        var _a, _b, _c, _d;
        const status = (0, perks_1.getPerkStatus)();
        let colour = theme_1.TEXT_GRAY;
        if (status.isConfirmed) {
            colour = theme_1.TEXT_SUCCESS;
        }
        else if (status.isPending) {
            colour = theme_1.TEXT_WARNING;
        }
        perkDot.style.backgroundColor = colour;
        perkLabel.style.color = colour;
        perkLabel.textContent = (_a = status.name) !== null && _a !== void 0 ? _a : "no set";
        perkChip.title = status.note
            ? `Perks: ${(_b = status.name) !== null && _b !== void 0 ? _b : "none"} — ${status.note}`
            : `Perks: ${(_c = status.name) !== null && _c !== void 0 ? _c : "none"}`;
        // No note at all is itself the diagnostic: every path through the manager
        // sets one, so a blank note means it has not run on this page at all.
        perkNoteText.textContent =
            (_d = status.note) !== null && _d !== void 0 ? _d : "no note yet — the manager has not acted on this page";
        paintPerkLog();
    };
    paintPerk();
    (0, perks_1.onPerkStatusChange)(paintPerk);
    (0, diagnostics_1.onDiagnostic)(paintPerkLog);
    perkChip.addEventListener("click", (event) => {
        event.stopPropagation();
        const next = perkNote.dataset.on !== "true";
        perkNote.dataset.on = String(next);
        perkChip.dataset.on = String(next);
    });
    const title = document.createElement("div");
    title.textContent = "Briefing";
    title.style.color = theme_1.TEXT_WHITE;
    title.style.fontWeight = "bold";
    // name first, then the perk state: the title is what identifies the panel,
    // and the indicator reads as a status attached to it rather than a label
    // competing with it
    heading.append(title, perkChip);
    const age = document.createElement("span");
    age.className = "fh-briefing-age";
    const refresh = document.createElement("span");
    refresh.className = "fh-briefing-refresh";
    refresh.textContent = "refresh";
    const settingsLink = document.createElement("a");
    settingsLink.className = "fh-briefing-settings";
    settingsLink.href = gameLinks_1.SETTINGS_HREF;
    settingsLink.dataset.view = ".view-main";
    settingsLink.textContent = "⚙";
    settingsLink.title = "Farmhand settings";
    settingsLink.setAttribute("aria-label", "Farmhand settings");
    const controls = document.createElement("div");
    controls.className = "fh-briefing-controls";
    controls.append(age, refresh, settingsLink);
    head.append(heading, controls);
    const chip = document.createElement("div");
    chip.className = "fh-focus-chip";
    chip.dataset.on = "false";
    const tabs = document.createElement("div");
    tabs.className = "fh-briefing-tabs";
    const body = document.createElement("div");
    body.className = "fh-briefing-body";
    const main = document.createElement("div");
    main.className = "fh-briefing-main";
    main.append(tabs, body);
    // buddy.farm, searched from here and opened in here (see briefing/lookup.ts)
    const search = (0, search_1.makeSearchBox)((entry) => {
        const lookup = (0, lookup_1.toLookup)(entry);
        if (lookup) {
            openLookup(lookup);
        }
    });
    panel.append(head, search.element, perkNote, chip, main);
    document.body.append(button, panel);
    let active = "now";
    let context;
    // A lookup replaces the active tab's body until you go back; walking
    // item → quest → item pushes, and back pops. The tabs stay put underneath,
    // so leaving is one press whatever depth you reached.
    const lookups = [];
    let focused = new Set();
    (0, focusScope_1.getFocusedScopes)()
        .then((scopeIds) => {
        focused = new Set(scopeIds);
        if (context) {
            draw();
        }
    })
        .catch((error) => {
        console.error("Failed to read the focused undertakings", error);
    });
    const persistFocus = () => {
        (0, focusScope_1.setFocusedScopes)([...focused]).catch((error) => {
            console.error("Failed to save the focused undertakings", error);
        });
        draw();
    };
    // Add or remove one, never replace the set: focusing a second undertaking
    // that shares a material with the first is the case worth supporting.
    const toggleFocus = (scopeId) => {
        if (focused.has(scopeId)) {
            focused.delete(scopeId);
        }
        else {
            focused.add(scopeId);
        }
        persistFocus();
    };
    const clearFocus = () => {
        focused = new Set();
        persistFocus();
    };
    const draw = () => {
        var _a, _b, _c, _d;
        body.textContent = "";
        if (!context) {
            return;
        }
        // The way out of focus has to be visible from every tab, not only the one
        // you set it from -- otherwise a focus set days ago silently filters the
        // panel and reads as the panel being wrong.
        //
        // A scope id that no longer resolves is simply not drawn rather than
        // dropped from storage: a quest missing from one read of the page (a failed
        // fetch, a stale cache) would otherwise silently unfocus itself.
        const scopes = context.resolved.scopes.filter((entry) => focused.has(entry.rootId));
        chip.textContent = "";
        chip.dataset.on = String(scopes.length > 0);
        for (const scope of scopes) {
            const tag = document.createElement("div");
            tag.className = "fh-focus-tag";
            const chipLabel = document.createElement("span");
            chipLabel.textContent = scope.label;
            const clear = document.createElement("span");
            clear.className = "fh-chip-clear";
            clear.textContent = "✕";
            clear.title = `Stop focusing ${scope.label}`;
            clear.addEventListener("click", (event) => {
                event.stopPropagation();
                toggleFocus(scope.rootId);
            });
            tag.append(chipLabel, clear);
            chip.append(tag);
        }
        if (scopes.length > 1) {
            const all = document.createElement("span");
            all.className = "fh-focus-all";
            all.textContent = "clear all";
            all.addEventListener("click", (event) => {
                event.stopPropagation();
                clearFocus();
            });
            chip.append(all);
        }
        paintAge();
        const counts = getTabCounts(context);
        const lookup = lookups.at(-1);
        for (const tab of tabs.children) {
            const element = tab;
            element.dataset.active = String(lookup === undefined && element.dataset.tab === active);
            const count = counts[element.dataset.tab];
            const badge = element.querySelector(".fh-tab-count");
            if (badge) {
                badge.textContent = count === undefined ? "" : String(count);
            }
        }
        if (lookup) {
            const bar = document.createElement("div");
            bar.className = "fh-lookup-bar";
            const back = document.createElement("span");
            back.className = "fh-lookup-back";
            back.textContent =
                lookups.length > 1
                    ? `‹ ${(_b = (_a = lookups.at(-2)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "back"}`
                    : `‹ ${(_d = (_c = TABS.find((tab) => tab.id === active)) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : "back"}`;
            back.addEventListener("click", (event) => {
                event.stopPropagation();
                lookups.pop();
                draw();
            });
            const kind = document.createElement("span");
            kind.className = "fh-lookup-kind";
            kind.textContent = lookup.kind;
            bar.append(back, kind);
            body.append(bar);
            const view = document.createElement("div");
            body.append(view, makeLoadingLine());
            const snapshot = context;
            (0, lookup_1.renderLookup)(view, snapshot, lookup, focused, openLookup)
                .catch((error) => {
                console.error("Failed to draw the lookup", error);
                view.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, ["Could not load that from buddy.farm."]));
            })
                .finally(() => {
                var _a;
                (_a = body.querySelector(".fh-loading")) === null || _a === void 0 ? void 0 : _a.remove();
            });
            return;
        }
        switch (active) {
            case "now": {
                renderNow(body, context, focused);
                break;
            }
            case "here": {
                (0, here_1.renderHereTab)(body, context, focused).catch((error) => {
                    console.error("Failed to draw the Here tab", error);
                });
                break;
            }
            case "goals": {
                renderGoals(body, context, () => {
                    // a removed goal changes the list itself, so reload before redrawing
                    load(false);
                }, focused, toggleFocus);
                break;
            }
            case "cap": {
                (0, cap_1.renderCapTab)(body, () => {
                    (0, inventoryCapWarnings_1.refreshCapTrackerNow)().catch((error) => {
                        console.error("Failed to refresh the cap tracker", error);
                    });
                });
                break;
            }
            default: {
                renderCraftworks(body, context, () => load(true), focused);
                // the sets list only makes sense under a queue that was read; its own
                // "haven't read the page" line would repeat the one above
                if (context.craftworks) {
                    renderSets(body, context, () => load(true));
                }
            }
        }
    };
    // The tracker refreshes itself off your actions, so the Cap tab and the
    // button's count follow it rather than the panel's own read.
    (0, inventoryCapWarnings_1.onCapTrackerChange)(() => {
        setCapBadge();
        if (panel.dataset.open !== "true" || !context) {
            return;
        }
        if (active === "cap") {
            draw();
        }
        else if (active === "here" && context.mine) {
            // the tracker just learned a drop off the dig board (or read the
            // inventory again): the mine view is drawn from both
            refreshHere().catch((error) => {
                console.error("Failed to refresh the mine in view", error);
            });
        }
    });
    setCapBadge();
    // When the numbers in `context` were read. The panel outlives navigation, so
    // a figure on screen can be from any point in the session.
    let readAt;
    const paintAge = () => {
        age.textContent = readAt === undefined ? "" : `read ${(0, shared_1.formatAge)(readAt)}`;
    };
    // Only while it is open, and only once a minute: the label's whole job is to
    // stop a five-minute-old number reading as live.
    setInterval(() => {
        if (panel.dataset.open === "true") {
            paintAge();
        }
    }, 30000);
    const load = (force) => __awaiter(void 0, void 0, void 0, function* () {
        body.textContent = "";
        age.textContent = "reading…";
        body.append((0, gameLinks_1.makeLinkedLine)(theme_1.TEXT_GRAY, ["Reading your farm…"]));
        context = yield loadContext(force);
        readAt = Date.now();
        paintAge();
        const attention = summarizeAttention(context.advice, context.statuses.filter((status) => status.isReady).length);
        setBadge(attention.count, attention.parts);
        draw();
    });
    const openLookup = (lookup) => {
        const top = lookups.at(-1);
        if (top && top.kind === lookup.kind && top.name === lookup.name) {
            return;
        }
        lookups.push(lookup);
        if (panel.dataset.open !== "true") {
            setOpen(true);
        }
        if (context) {
            draw();
        }
    };
    // A tab switch crossfades where the browser can do it (View Transitions;
    // the panel body is the only named element, so nothing else on the page
    // moves) and simply redraws where it can't. Reduced-motion users get the
    // plain redraw via the stylesheet.
    const selectTab = (id) => {
        if (id === active && lookups.length === 0) {
            return;
        }
        lookups.length = 0;
        active = id;
        if (typeof document.startViewTransition === "function") {
            document.startViewTransition(() => {
                draw();
            });
            return;
        }
        draw();
    };
    for (const tab of TABS) {
        const element = document.createElement("div");
        element.className = "fh-tab";
        element.dataset.tab = tab.id;
        const tabLabel = document.createElement("span");
        tabLabel.textContent = tab.label;
        const tabCount = document.createElement("span");
        tabCount.className = "fh-tab-count";
        element.append(tabLabel, tabCount);
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
        if (!open) {
            return;
        }
        if (!hasLoaded) {
            hasLoaded = true;
            load(false);
            return;
        }
        // The panel outlives page navigation, so what it knows about where you are
        // standing goes stale the moment you walk somewhere else. Comparing routes
        // to detect that does not work -- the hash often does not change -- and
        // both lookups behind this are cached, so simply re-derive it every time.
        refreshHere();
    };
    const refreshHere = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const previous = context;
        if (!previous) {
            return;
        }
        const [here, mine] = yield Promise.all([getHere(), getMine()]);
        // a full reload may have replaced the context while this was in flight;
        // its `here` is already current, so leave it alone
        if (context !== previous) {
            return;
        }
        // Nothing moved, nothing to redraw: this also runs on every page
        // transition now, most of which are between pages that are not
        // locations, and a redraw would throw away a lookup you were reading.
        // A mine also redraws as the board teaches it a new drop.
        if ((here === null || here === void 0 ? void 0 : here.location.name) === ((_a = previous.here) === null || _a === void 0 ? void 0 : _a.location.name) &&
            (here === null || here === void 0 ? void 0 : here.stamina) === ((_b = previous.here) === null || _b === void 0 ? void 0 : _b.stamina) &&
            (mine === null || mine === void 0 ? void 0 : mine.key) === ((_c = previous.mine) === null || _c === void 0 ? void 0 : _c.key) &&
            (mine === null || mine === void 0 ? void 0 : mine.drops.length) === ((_d = previous.mine) === null || _d === void 0 ? void 0 : _d.drops.length) &&
            (mine === null || mine === void 0 ? void 0 : mine.stamina) === ((_e = previous.mine) === null || _e === void 0 ? void 0 : _e.stamina)) {
            return;
        }
        context = Object.assign(Object.assign({}, previous), { here, mine });
        draw();
    });
    // On a desktop the panel sits open beside the game, so walking from town to
    // the Misty Forest never re-opened it and "here" stayed wherever it was
    // first read. A phone closes and re-opens the panel around every move, which
    // is why the Now tab followed you there and not on a PC. Only while open and
    // loaded: nothing is fetched for a closed panel, as before.
    (0, pageTransitions_1.onPageTransition)(() => {
        if (panel.dataset.open === "true" && hasLoaded) {
            refreshHere().catch((error) => {
                console.error("Failed to refresh the panel's location", error);
            });
        }
    });
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
    // Deliberately not closed by clicks elsewhere on the page. The whole point
    // while exploring is to read the advice and keep pressing Continue, and an
    // outside-click-to-close made the panel vanish on the first press.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setOpen(false);
            return;
        }
        // Ctrl/⌘-K: the panel, with the search ready to type into, from anywhere
        // in the game -- the shortcut every launcher uses, and one the game does
        // not bind
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            const target = event.target;
            if ((target === null || target === void 0 ? void 0 : target.closest("#chatarea, textarea")) && !event.metaKey) {
                return;
            }
            event.preventDefault();
            setOpen(true);
            search.focus();
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
            (_a = document.querySelector(`#${shared_1.BUTTON_ID}`)) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = document.querySelector(`#${shared_1.PANEL_ID}`)) === null || _b === void 0 ? void 0 : _b.remove();
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
    const recommended = (0, suggestions_1.getRecommendedSet)(goals.map((goal) => goal.name), sets, items.map((item) => item.name));
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

/***/ 2783:
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
const settings_1 = __webpack_require__(126);
const page_1 = __webpack_require__(7952);
const diagnostics_1 = __webpack_require__(3747);
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
    onPageLoad: (settingValues) => {
        // Render into whichever page element holds the options form, without
        // asking which page is "current". onPageLoad fires when the page node is
        // ADDED, and on a phone Framework7 animates the transition, so at that
        // moment the page you came from is still the one on centre: getPage()
        // named it, the check here bailed, and no later dispatch came -- the
        // Farmhand section never appeared on mobile at all. A desktop skips the
        // animation, which is why it always worked there. The form is in the new
        // page's markup from the moment it is inserted, so it can be found
        // directly. Idempotent per page element, so the repeat dispatches and a
        // retained page revisited by back navigation cost nothing.
        let drawn = 0;
        for (const currentPage of document.querySelectorAll(".view-main .page")) {
            const settingsList = currentPage.querySelector("#settingsform_options ul");
            if (settingsList) {
                renderFarmhandSettings(currentPage, settingsList, settingValues);
                drawn += 1;
            }
        }
        // Only worth a line on the options page itself: it tells apart "the
        // dispatch never ran" from "it ran and the form was not where expected".
        if (drawn === 0 && (0, page_1.getHashPage)() === page_1.Page.SETTINGS_OPTIONS) {
            (0, diagnostics_1.logDiagnostic)("settings: options page open but no form found");
        }
    },
};
const renderFarmhandSettings = (currentPage, settingsList, settingValues) => {
    var _a;
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
const diagnostics_1 = __webpack_require__(3747);
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
    // The status is logged where it is set (apis/farm.ts); this is what the
    // banner made of it, so the two lines together say why it is or isn't there.
    if (state.status === farm_1.CropStatus.EMPTY &&
        settings[settings_1.SettingId.FIELD_EMPTY_NOTIFICATIONS]) {
        (0, diagnostics_1.logDiagnostic)("field banner: fields are empty");
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
        (0, diagnostics_1.logDiagnostic)(`field banner: crops are ready (farm ${farmId})`);
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
        (0, diagnostics_1.logDiagnostic)(state.status === farm_1.CropStatus.GROWING
            ? "field banner: none, crops growing"
            : `field banner: none, ${state.status} but its notification is off`);
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
exports.inventoryCapWarnings = exports.refreshCapTrackerNow = exports.onCapTrackerChange = exports.getCapTrackerView = exports.getLearnedMineDrops = void 0;
const diagnostics_1 = __webpack_require__(3747);
const page_1 = __webpack_require__(7952);
const requests_1 = __webpack_require__(3300);
const inventory_1 = __webpack_require__(4514);
const settings_1 = __webpack_require__(126);
const theme_1 = __webpack_require__(1178);
const SETTING_INVENTORY_CAP_WARNINGS = {
    id: settings_1.SettingId.INVENTORY_CAP_WARNINGS,
    title: "Inventory: Cap warnings",
    description: "Highlight items at or near your inventory cap so drops don't go to waste",
    type: "boolean",
    defaultValue: true,
};
const SETTING_INVENTORY_CAP_TRACKER = {
    id: settings_1.SettingId.INVENTORY_CAP_TRACKER,
    title: "Inventory: Cap tracker",
    description: `
    Track items at or near your inventory cap: a count on the Farmhand button
    and a Cap tab in the briefing panel, filtered to what drops where you are
  `,
    type: "boolean",
    defaultValue: true,
};
const NEAR_CAP_RATIO = 0.9;
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
const imageBasename = (source) => { var _a; return ((_a = source.split("/").pop()) !== null && _a !== void 0 ? _a : "").split("?")[0]; };
// per-location drop lists, learned from the game's own explore/fishing
// responses (the location pages themselves don't list what drops there).
// persisted so each location only needs to be learned once.
const LOCATION_DROPS_KEY = "fhCapTrackerLocationDrops";
let locationDrops = {};
let locationDropsLoaded = false;
const loadLocationDrops = () => {
    if (locationDropsLoaded) {
        return;
    }
    locationDropsLoaded = true;
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
// What the dig board has shown dropping at the mine you are standing in, as
// icon basenames (`foo.png`). No site publishes a mine's drop table -- buddy.farm
// lists Mossrock Mine with an empty one -- so this learned list is all there is,
// and the Here tab draws a mine from it. Undefined off a mine; empty when the
// board has not shown anything yet.
const getLearnedMineDrops = () => {
    var _a;
    loadLocationDrops();
    const key = getLocationKey();
    if (!(key === null || key === void 0 ? void 0 : key.startsWith("mining:"))) {
        return undefined;
    }
    return { basenames: (_a = locationDrops[key]) !== null && _a !== void 0 ? _a : [], key };
};
exports.getLearnedMineDrops = getLearnedMineDrops;
const getCapTrackerView = () => {
    const key = getLocationKey();
    const learned = key ? locationDrops[key] : undefined;
    const here = learned && learned.length > 0
        ? capTrackerState.items.filter((item) => item.image && learned.includes(imageBasename(item.image)))
        : undefined;
    return {
        cap: capTrackerState.cap,
        error: capTrackerState.error,
        here,
        isEnabled: isTrackerEnabled,
        isFetching: capTrackerState.isFetching,
        items: capTrackerState.items,
        updatedAt: capTrackerState.updatedAt,
    };
};
exports.getCapTrackerView = getCapTrackerView;
const capTrackerListeners = [];
const onCapTrackerChange = (listener) => {
    capTrackerListeners.push(listener);
};
exports.onCapTrackerChange = onCapTrackerChange;
const notifyCapTracker = () => {
    for (const listener of capTrackerListeners) {
        listener();
    }
};
// The panel's own refresh control: read the inventory now, regardless of the
// passive interval.
const refreshCapTrackerNow = () => fetchCapTrackerNow();
exports.refreshCapTrackerNow = refreshCapTrackerNow;
// every state change funnels through here: mutate, then announce it. Notices
// coalesce into a single microtask, so a burst of mutations announces once and
// no mutation site has to remember to do it.
let isRenderScheduled = false;
const scheduleRender = () => {
    if (isRenderScheduled) {
        return;
    }
    isRenderScheduled = true;
    queueMicrotask(() => {
        isRenderScheduled = false;
        notifyCapTracker();
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
    scheduleRender();
    try {
        const response = yield (0, requests_1.getHTML)(page_1.Page.INVENTORY, new URLSearchParams());
        // mark updated even if parsing fails so we don't hammer the server
        // eslint-disable-next-line require-atomic-updates
        capTrackerState.updatedAt = Date.now();
        // eslint-disable-next-line require-atomic-updates
        capTrackerState.error = undefined;
        const result = collectCapItems(response.body);
        if (result) {
            // eslint-disable-next-line require-atomic-updates
            capTrackerState.cap = result.cap;
            // eslint-disable-next-line require-atomic-updates
            capTrackerState.items = result.items;
        }
        else {
            // eslint-disable-next-line require-atomic-updates
            capTrackerState.error = "inventory page not recognised";
        }
    }
    catch (error) {
        // Kept, not swallowed: an "Inventory not read yet" that never changes
        // was this failing quietly. The next refresh still retries.
        // eslint-disable-next-line require-atomic-updates
        capTrackerState.error = (0, diagnostics_1.describeError)(error);
        (0, diagnostics_1.logFailure)("cap tracker: inventory read failed", error);
    }
    finally {
        // eslint-disable-next-line require-atomic-updates
        capTrackerState.isFetching = false;
        scheduleRender();
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
    // The flag the Cap tab reads was set only by onPageLoad, so until the first
    // page dispatch had run -- or if it never ran -- the tab reported the
    // tracker as "off" over a setting that was on. Read the setting up front.
    onInitialize: (settings) => {
        isTrackerEnabled = Boolean(settings[settings_1.SettingId.INVENTORY_CAP_TRACKER]);
    },
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

/***/ 8525:
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
exports.itemNeeds = void 0;
const craftworks_1 = __webpack_require__(7831);
const theme_1 = __webpack_require__(1178);
const needAdapters_1 = __webpack_require__(1903);
const craftworks_2 = __webpack_require__(920);
const recipes_1 = __webpack_require__(498);
const page_1 = __webpack_require__(7952);
const goals_1 = __webpack_require__(1267);
const requests_1 = __webpack_require__(3300);
const quests_1 = __webpack_require__(303);
const inventory_1 = __webpack_require__(4514);
const mastery_1 = __webpack_require__(283);
const needs_1 = __webpack_require__(2538);
const promise_1 = __webpack_require__(6762);
const unlimited_1 = __webpack_require__(4808);
const settings_1 = __webpack_require__(126);
const CONTAINER_ID = "fh-item-needs";
// The quest list is the one source here with no cached state behind it, and an
// item page is somewhere you land constantly -- browsing twenty items would be
// twenty requests for a list that changes a few times a day. Farm RPG's whole
// objection to scripting is server load, so this is memoised and the panel's
// own refresh stays the way you force it.
const QUESTS_TTL = 5 * 60 * 1000;
// the promise rather than the value, so two item pages opened at once share one
// request instead of racing to make two
let questCache;
const fetchQuestGoals = (previous) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, promise_1.orUndefined)((0, requests_1.getHTML)(page_1.Page.QUESTS, new URLSearchParams()));
    if (!response) {
        // a failed refresh keeps the last good answer rather than blanking the card
        return previous;
    }
    const quests = yield (0, quests_1.getQuestGoals)((0, quests_1.parseActiveQuests)(response.body));
    return quests.goals;
});
const getCachedQuestGoals = () => {
    var _a;
    if (!questCache || Date.now() - questCache.at >= QUESTS_TTL) {
        questCache = {
            at: Date.now(),
            goals: fetchQuestGoals((_a = questCache === null || questCache === void 0 ? void 0 : questCache.goals) !== null && _a !== void 0 ? _a : Promise.resolve([])),
        };
    }
    return questCache.goals;
};
const SETTING_ITEM_NEEDS = {
    id: settings_1.SettingId.ITEM_NEEDS,
    title: "Show what an item is needed for",
    description: "On an item page, show how many you are still short and which goals, " +
        "requests and Craftworks slots are waiting on it",
    type: "boolean",
    defaultValue: true,
};
// Where the item in view sits in everything you are working toward.
//
// The math for this already existed; it just wasn't where the decision is. You
// had to open the panel and go looking to find out whether the thing on screen
// mattered. Raw drops are the important case and the craft-plan card skips
// them, because a raw has no plan -- but "12 of the 20 Glass the Lanterns
// want" is exactly the sentence worth reading on a raw's page.
exports.itemNeeds = {
    settings: [SETTING_ITEM_NEEDS],
    onPageLoad: (settings, page) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (page !== page_1.Page.ITEM || !settings[settings_1.SettingId.ITEM_NEEDS]) {
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
        // the page is re-rendered on navigation, and re-shown on back navigation:
        // never stack two cards
        (_c = currentPage.querySelector(`#${CONTAINER_ID}`)) === null || _c === void 0 ? void 0 : _c.remove();
        const unlimited = (0, unlimited_1.parseUnlimitedItems)(String((_d = settings[settings_1.SettingId.UNLIMITED_ITEMS]) !== null && _d !== void 0 ? _d : ""));
        const [snapshot, trackedGoals, mastery, craftworks, questGoals] = yield Promise.all([
            (0, promise_1.orUndefined)(inventory_1.inventoryState.get()),
            (0, goals_1.getGoals)(),
            (0, promise_1.orUndefined)(mastery_1.masteryState.get()),
            (0, promise_1.orUndefined)(craftworks_2.craftworksState.get()),
            getCachedQuestGoals(),
        ]);
        const inventory = (_e = snapshot === null || snapshot === void 0 ? void 0 : snapshot.quantities) !== null && _e !== void 0 ? _e : {};
        const craftworksRoots = craftworks
            ? (0, craftworks_1.adviseOnSlots)(craftworks.slots, snapshot === null || snapshot === void 0 ? void 0 : snapshot.cap, unlimited).roots
            : [];
        const needs = (0, needAdapters_1.buildNeeds)({ craftworksRoots, questGoals, trackedGoals });
        if (needs.length === 0) {
            return;
        }
        const graph = yield (0, recipes_1.gatherRecipeGraph)([
            itemName,
            ...needs.flatMap((need) => (need.kind === "item" ? [need.item] : [])),
        ]);
        const resolved = (0, needs_1.resolveNeeds)(graph, needs, inventory, unlimited, (_f = mastery === null || mastery === void 0 ? void 0 : mastery.entries) !== null && _f !== void 0 ? _f : []);
        // Every undertaking whose shortfall names this item, plus every place it
        // appears as a milestone inside one.
        const shortfalls = [];
        for (const scope of resolved.scopes) {
            const entry = scope.missing.find((item) => item.name === itemName);
            if (entry) {
                shortfalls.push({ quantity: entry.quantity, scope });
            }
        }
        const milestones = resolved.statuses.filter((status) => status.need.kind === "item" &&
            status.need.item === itemName &&
            status.coveredByParent);
        if (shortfalls.length === 0 && milestones.length === 0) {
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
        title.textContent = "Needed for";
        title.style.color = theme_1.TEXT_WHITE;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "6px";
        inner.append(title);
        const held = (_g = inventory[itemName]) !== null && _g !== void 0 ? _g : 0;
        // The largest single ask, not the sum: these are competing undertakings,
        // and covering the biggest covers the rest.
        const worst = Math.max(0, ...shortfalls.map((entry) => entry.quantity));
        const headline = document.createElement("div");
        headline.style.fontSize = "13px";
        headline.style.marginBottom = "6px";
        headline.style.color = worst > 0 ? theme_1.TEXT_WARNING : theme_1.TEXT_SUCCESS;
        headline.textContent =
            worst > 0
                ? `${worst} more needed — you hold ${held}`
                : `You hold ${held}; nothing is short of it`;
        inner.append(headline);
        const list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.style.gap = "3px";
        const addRow = (text, href) => {
            const row = href
                ? document.createElement("a")
                : document.createElement("div");
            if (href && row instanceof HTMLAnchorElement) {
                row.href = href;
            }
            row.style.color = href ? theme_1.TEXT_WHITE : theme_1.TEXT_GRAY;
            row.style.fontSize = "12px";
            row.textContent = text;
            list.append(row);
        };
        for (const { quantity, scope } of shortfalls.sort((a, b) => b.quantity - a.quantity)) {
            const root = scope.needs.find((status) => status.need.id === scope.rootId);
            addRow(`${quantity}x — ${scope.label}`, root === null || root === void 0 ? void 0 : root.need.href);
        }
        for (const status of milestones) {
            const percent = Math.round(status.ratio * 100);
            addRow(`${status.have}/${status.need.kind === "item" ? status.need.quantity : 0} toward ${status.need.label} (${percent}%)`, status.need.href);
        }
        inner.append(list);
        content.append(inner);
        card.append(content);
        const anchor = currentPage.querySelector(".card");
        if (anchor) {
            anchor.after(card);
        }
        else {
            (_h = currentPage.querySelector(".page-content")) === null || _h === void 0 ? void 0 : _h.prepend(card);
        }
    }),
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
const diagnostics_1 = __webpack_require__(3747);
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
            (0, diagnostics_1.logDiagnostic)("oven banner: none, no ovens");
            (0, notifications_1.removeNotification)(notifications_1.NotificationId.OVEN);
            return;
        }
        (0, diagnostics_1.logDiagnostic)("oven banner: ovens are empty");
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
        (0, diagnostics_1.logDiagnostic)("oven banner: ovens need attention");
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
        (0, diagnostics_1.logDiagnostic)("oven banner: meals are ready");
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
        (0, diagnostics_1.logDiagnostic)(`oven banner: none (${state.status})`);
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
const layout_1 = __webpack_require__(6253);
const theme_1 = __webpack_require__(1178);
// A small "● Crafting" pill in the bottom stats bar, right of the currency
// counts, showing which perk set is equipped right now. (The cap tracker used
// to share this bar; it lives in the briefing panel now.)
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
// The same colours, with the same meaning, as the chip in the briefing panel's
// header: green when we drove the game to the set and watched it land, amber
// while a switch is in flight, grey when the name is only what the (optimistic)
// cache says. The pill used to colour by KIND of set instead -- orange for an
// activity set, grey for Default -- which looked identical whether the set was
// verified or not, so the panel read as the truthful one and this as
// decoration. One vocabulary now, so the two can't disagree.
const colourFor = (status) => {
    if (status.isConfirmed) {
        return theme_1.TEXT_SUCCESS;
    }
    if (status.isPending) {
        return theme_1.TEXT_WARNING;
    }
    return theme_1.TEXT_GRAY;
};
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
// The pill simply appends itself to the bar, and so does anything else that
// lands there (the game rewriting the toolbar, another feature's element) — so
// "last child" is kept as a maintained property rather than a one-time
// placement: fix the position on every render, and watch the bar so a later
// arrival is corrected at once.
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
    // Not on a phone. The bottom bar there holds the currency counts and the
    // game's own home and chat buttons and nothing more, and the panel shows the
    // equipped set already -- in a surface we control, which is the better place
    // for it. Same call the cap tracker in this bar already makes.
    //
    // An unknown set is shown as "no set", as the panel shows it, rather than
    // hiding the pill: a pill that vanishes looks like the feature is off, and
    // "no set" before the first switch of a session is information.
    if (!settings[settings_1.SettingId.PERK_MANAGER] || (0, layout_1.isMobileLayout)()) {
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
    paintIndicator(pill, status);
});
exports.renderPerkIndicator = renderPerkIndicator;
// Synchronous, like the panel's paint: a status change repaints the pill in the
// same tick it happens. Going through the full render for every change put an
// await (the settings read) between the change and the paint, so the pill was
// always a beat behind the panel chip on the same event.
const paintIndicator = (pill, status) => {
    var _a, _b;
    const name = (_a = status.name) !== null && _a !== void 0 ? _a : "no set";
    const signature = [
        name,
        status.isPending,
        status.isConfirmed,
        (_b = status.note) !== null && _b !== void 0 ? _b : "",
    ].join("|");
    if (pill.dataset.fhSignature === signature) {
        return;
    }
    pill.dataset.fhSignature = signature;
    const colour = colourFor(status);
    const dot = pill.querySelector("[data-fh-role='dot']");
    const label = pill.querySelector("[data-fh-role='label']");
    if (!dot || !label) {
        return;
    }
    // in flight: hollow dot + trailing ellipsis, so a real switch is visible
    // while it happens (the settle wait makes it ~1s — long enough to see)
    dot.style.backgroundColor = status.isPending ? "transparent" : colour;
    dot.style.border = status.isPending ? `1px solid ${colour}` : "none";
    label.textContent = status.isPending ? `${name}…` : name;
    label.style.color = colour;
    // the panel shows the manager's last note under its chip; here the bar has
    // no room, so it rides in the tooltip in the same shape
    pill.title = status.note
        ? `Perks: ${name} — ${status.note}`
        : `Perks: ${name}`;
};
// rotating a phone or dragging a window across the breakpoint has to repaint,
// or the pill keeps whatever shape it happened to mount in
(0, layout_1.onLayoutChange)(() => {
    (0, exports.renderPerkIndicator)().catch((error) => {
        console.error("Failed to render perk indicator", error);
    });
});
// Repaint whenever a switch starts, lands, or logs. A mounted pill is painted
// right here, synchronously; only when there is none yet (first status of the
// session, or the game rebuilt the bar) does this go through the full render.
(0, perks_1.onPerkStatusChange)(() => {
    const pill = document.querySelector(`#${INDICATOR_ID}`);
    if (pill === null || pill === void 0 ? void 0 : pill.isConnected) {
        paintIndicator(pill, (0, perks_1.getPerkStatus)());
        return;
    }
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
const farm_1 = __webpack_require__(6228);
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
// Town, and (via the confirmed-equipped fast path) only switches once on entry.
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
// so clicking between them never swaps perks -- swapping between sets is what
// caused every switch-timing bug in this feature. That set is the one named
// "Crafting"; it holds the selling, crafting and friendship perks together.
//
// GIVE is the exception: the friendship/give perks live in BOTH the Default set
// and the consolidated set, so if either is already confirmed on there is
// nothing to switch -- no set, no ~1s activation, the give fires immediately.
// (Selling and crafting perks are NOT in Default, so those always switch.)
const getQuickActionSet = (action) => __awaiter(void 0, void 0, void 0, function* () {
    const perks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.CRAFTING);
    if (!perks) {
        return undefined;
    }
    if (action === "give") {
        const defaultPerks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.DEFAULT);
        const activeId = (0, perks_1.getConfirmedEquippedSetId)();
        const isAlreadyCovered = activeId !== undefined &&
            (activeId === perks.id || activeId === (defaultPerks === null || defaultPerks === void 0 ? void 0 : defaultPerks.id));
        if (isAlreadyCovered) {
            return undefined;
        }
    }
    return perks;
});
// A quick action is a proxied click: we press the game's own button and the
// game runs its own request, which we never see finish. So the perk queue is
// held for a moment afterwards -- long enough for that request to go out --
// because the thing it is being held against is a page reconcile starting its
// resetperks() while the sale is in flight, which is how a 50-silver item sells
// for 55 instead of 80.
const QUICK_ACTION_HOLD_MS = 1500;
const runQuickAction = (action, fire) => __awaiter(void 0, void 0, void 0, function* () {
    const { value: isEnabled } = yield (0, settings_1.getSetting)(SETTING_PERK_MANAGER);
    if (!isEnabled) {
        fire();
        return;
    }
    yield (0, perks_1.runGatedAction)({
        label: `quick ${action}`,
        set: () => getQuickActionSet(action),
        action: () => fire(),
        holdMs: QUICK_ACTION_HOLD_MS,
    });
});
// Replace the native quick-craft button with a proxy that runs the click as a
// gated action. No-op if the native button is absent or already proxied.
//
// Quick-sell and quick-give are NOT installed here: quickSellSafely.ts already
// proxies both (.quicksellbtn / .quickgivebtn) with lock-safety and routes them
// through the gate registered below, which runs the same helper.
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
        yield runQuickAction("craft", () => nativeButton.click());
    }));
    (_b = nativeButton.parentElement) === null || _b === void 0 ? void 0 : _b.insertBefore(proxyButton, nativeButton);
};
// Quick-sell and quick-give, registered once at module scope. One gate, set
// rather than appended to, so it cannot accumulate across page loads.
(0, quickSellSafely_1.setQuicksellGate)(runQuickAction);
// The farm page's own harvests: the Harvest All button
// (`a.button.harvestallbtn`, "Harvest All<br>Crops") and the single-plot
// harvest, a click on a ready crop (`img.cropitem.harvest`). Not a proxy
// button like CRAFT: the game shows and hides these as the crops come ready,
// so a stand-in mounted at page load would be hidden or stale half the time.
// Instead the click itself is caught in the capture phase at the document --
// before the game's own delegated handler, which listens on the document in
// the bubble phase -- and replayed from inside the gate. Works on a retained
// page too, since it is not tied to any mount. The button is matched by the
// game's class, or failing that by what it says, so a renamed class degrades
// to the text.
let isReplayingHarvestClick = false;
const findHarvestControl = (target) => {
    var _a, _b;
    if (!(target instanceof Element)) {
        return undefined;
    }
    const plot = target.closest("img.cropitem.harvest");
    if (plot) {
        return plot;
    }
    const button = target.closest("a, button");
    if (!button) {
        return undefined;
    }
    const isHarvestAll = button.classList.contains("harvestallbtn") ||
        /^harvest all\b/i.test((_b = (_a = button.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "");
    return isHarvestAll ? button : undefined;
};
document.addEventListener("click", (event) => {
    if (isReplayingHarvestClick) {
        return;
    }
    const [page] = (0, page_1.getPage)();
    if ((page !== null && page !== void 0 ? page : (0, page_1.getHashPage)()) !== page_1.Page.FARM) {
        return;
    }
    const button = findHarvestControl(event.target);
    if (!button) {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    (0, settings_1.getSetting)(SETTING_PERK_MANAGER)
        .then((_a) => __awaiter(void 0, [_a], void 0, function* ({ value: isEnabled }) {
        const replay = () => {
            isReplayingHarvestClick = true;
            try {
                button.click();
            }
            finally {
                isReplayingHarvestClick = false;
            }
        };
        if (!isEnabled) {
            replay();
            return;
        }
        const label = [...button.childNodes];
        if (label.length > 0) {
            button.textContent = "Loading...";
        }
        try {
            yield (0, farm_1.harvestAllFromFarmPage)(replay);
        }
        finally {
            // the button is the game's; it repaints the page after the click
            // anyway, this only covers a switch that failed
            if (label.length > 0) {
                button.replaceChildren(...label);
            }
        }
    }))
        .catch((error) => {
        console.error("Failed to gate the farm page harvest", error);
    });
}, true);
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
// replant take the farm perks, quick-sell/craft/give take the consolidated set
// (both as gated actions, which hold the perk queue across the action itself),
// and the workshop, market, town and activity locations
// are activity pages in their own right. The one exception is the farm page's
// native Harvest All button, which is the game's and not gated by us — which is
// exactly why the farm stays a revert point.
const isRestingPage = (page) => page === page_1.Page.HOME_PAGE || page === page_1.Page.HOME_PATH || page === page_1.Page.FARM;
const resolveDecision = () => __awaiter(void 0, void 0, void 0, function* () {
    const { value: isEnabled } = yield (0, settings_1.getSetting)(SETTING_PERK_MANAGER);
    if (!isEnabled) {
        // The one silent path there was. With auto manage off nothing switches and
        // nothing says why, which is indistinguishable from a broken reconciler --
        // and manual equipping from the panel still works, so the setting looks on.
        return { note: "auto manage is off" };
    }
    // `getPage()` reads data-page off the live page element, which this fork has
    // found unreliable often enough that half this file matches on the URL
    // instead -- and when it comes back undefined the reconciler used to fall all
    // the way through to "keeping current set" and switch NOTHING. That is the
    // "it just doesn't switch sometimes" failure, and on the farm it is the
    // "came to the farm and it never went back to Default" one: an unidentified
    // page is not a resting page, so the revert never runs.
    //
    // The address bar is the second opinion (getHashPage: `#!/xfarm.php` ->
    // `xfarm`), used ONLY when the element can't identify itself, so a page that
    // reads fine is unaffected. Mid-transition the hash leads the DOM, but a
    // lagging hash can only name the page we just left, and the next dispatch
    // corrects it.
    const [domPage] = (0, page_1.getPage)();
    const page = domPage !== null && domPage !== void 0 ? domPage : (0, page_1.getHashPage)();
    // The note says which source answered, so a wrong decision can be traced to
    // the page id rather than to the switch.
    let where = "unknown page";
    if (domPage) {
        where = domPage;
    }
    else if (page) {
        where = `${page} (url)`;
    }
    // don't touch perks on the perks page so you can edit sets freely
    if (page === page_1.Page.PERKS) {
        return { note: `${where}: left alone` };
    }
    const defaultPerks = yield (0, perks_1.getActivityPerksSet)(perks_1.PerkActivity.DEFAULT);
    if (!defaultPerks) {
        console.warn("Default perk set not found");
        return { note: "no Default set" };
    }
    const activation = yield getPageActivation(page);
    if (activation) {
        return { set: activation.set, note: where };
    }
    // Not an activity page, and not a resting one either -- you're browsing
    // mid-activity (an item, your inventory, a quest), so leave the perks where
    // they are. This also covers the two cases that used to need their own
    // guards: item pages, where the quick actions manage perks themselves and a
    // revert would fire on top of a just-activated set; and an unidentifiable
    // page (getCurrentPage() momentarily returns null mid-render), which is not a
    // reliable "you've left the activity" signal and once caused the workshop to
    // reset and re-activate Crafting on every single craft.
    if (!isRestingPage(page)) {
        return { note: `${where}: keeping current set` };
    }
    return { set: defaultPerks, note: where };
});
// Put the page's set on. Used for BOTH halves of the job: the page-transition
// reconcile, and the restore after a quick action. (Harvest and replant opt
// OUT of the restore: they leave the farm set on and let the next page
// transition reconcile, the way the wrap worked from 1.0.40 -- see
// apis/farm.ts.) One function, so the two can't drift apart.
//
// Called with a live session, so it must never enqueue a task of its own.
const applyDecision = (perks) => __awaiter(void 0, void 0, void 0, function* () {
    const decision = yield resolveDecision();
    if (!decision.set) {
        (0, perks_1.setPerkStatusNote)(decision.note);
        return;
    }
    const { set, note } = decision;
    (0, perks_1.setPerkStatusNote)(`${note} → ${set.name}`);
    try {
        const switched = yield perks.apply(set);
        (0, perks_1.setPerkStatusNote)(`${note} → ${set.name}${switched ? "" : " (already on)"}`);
    }
    catch (error) {
        // A failed switch was invisible before: the queue swallows failures to
        // protect the next task, so there was no way to tell a request that failed
        // from a page that was never recognised.
        console.error(`Failed to activate the ${set.name} perk set`, error);
        (0, perks_1.setPerkStatusNote)(`${note} → ${set.name} FAILED`);
    }
});
// After any gated action, the perks go back to what the page calls for.
(0, perks_1.onPerkRestore)(applyDecision);
// Nothing awaits a feature's onPageLoad, so a throw in the reconciler would be
// an unhandled rejection: silent, and on a phone there is no console to find it
// in. Every path through applyDecision leaves a note, so this one does too.
const reconcileSafely = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, perks_1.runPerkTask)(applyDecision, "reconcile");
    }
    catch (error) {
        console.error("Failed to reconcile perks", error);
        (0, perks_1.setPerkStatusNote)(`reconcile failed: ${error instanceof Error ? error.message : String(error)}`);
    }
});
// Framework7 re-shows a RETAINED page element on back navigation instead of
// adding one, so the global childList dispatch in index.ts never fires and the
// reconciler never runs. A phone leans on cached pages and back navigation far
// harder than a desktop does, which is why auto switching has always worked on
// a PC and never on mobile.
//
// Deliberately LOCAL to this feature. 1.1.41 put this same observer on the
// global dispatch instead, which re-ran every notification feature against
// cached state and resurrected harvest and field banners that had already been
// cleared -- "I needed to plant, after I planted then fields empty when they
// are not". Same observer shape as utils/notifications.ts, which has run this
// way since 1.1.16, and the 100ms debounce matters for a second reason here:
// mid-transition the hash has already moved while the page swap has not landed,
// so a reconcile that ran then would be deciding about the page you are
// leaving. (Deciding inside the perk task rather than here is the real defence
// -- see resolveDecision -- but there is no reason to queue the work at all.)
let transitionTimeout;
// Everything this feature puts ON a page, as opposed to the perks it switches:
// the equipped-set marker and the quick-craft proxy. Both were reachable only
// from onPageLoad, which is precisely the dispatch that does not fire for a
// RETAINED page — so arriving at an item page by back navigation left the
// game's own quick-craft button live and unproxied, and clicking it crafted
// under whatever set happened to be equipped. That is "crafting perk switching
// does not happen on item pages", and it is a phone symptom because a phone
// leans on back navigation far harder than a desktop does.
//
// Safe to re-run: renderPerkIndicator mounts once and reuses, and
// installQuickActionProxy bails when the native button is missing or already
// hidden (i.e. already proxied), so a retained page keeps its one proxy.
const mountPageExtras = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, perkIndicator_1.renderPerkIndicator)();
    // With auto manage off nothing switches, so there is nothing for a proxy to
    // do but hide the game's own button and click it for you.
    const { value: isEnabled } = yield (0, settings_1.getSetting)(SETTING_PERK_MANAGER);
    if (!isEnabled) {
        return;
    }
    // the quick-craft proxy lives on item pages; skip the workshop, where the
    // reconciler already scopes perks. (quick-sell and quick-give are handled
    // by quickSellSafely.ts — see installQuickActionProxy's note.)
    const [page] = (0, page_1.getPage)();
    if (page !== page_1.Page.WORKSHOP) {
        installQuickActionProxy(".quickcraftbtn", "CRAFT");
    }
});
// Extras first, then the switch. They are independent -- the proxy button and
// the marker don't need to know which set is on -- and the reconcile now waits
// on the perk queue, which a harvest can hold for a couple of seconds. Mounting
// second meant arriving at an item page during one left the game's own,
// UNGATED craft button live and clickable for that whole window.
const onPageSettled = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mountPageExtras();
    yield reconcileSafely();
});
const scheduleReconcile = () => {
    clearTimeout(transitionTimeout);
    transitionTimeout = setTimeout(() => {
        onPageSettled().catch((error) => {
            console.error("Failed to reconcile perks", error);
        });
    }, 100);
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
            // the classes our own features put on the DOM would otherwise schedule
            // another reconcile, and so on.
            if ((_b = (_a = mutation.target).matches) === null || _b === void 0 ? void 0 : _b.call(_a, ".page")) {
                scheduleReconcile();
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
exports.perkManagment = {
    settings: [SETTING_PERK_MANAGER],
    onInitialize: () => {
        watchPageTransitions();
    },
    onPageLoad: () => __awaiter(void 0, void 0, void 0, function* () {
        // The marker and the quick-craft proxy, then page-scoped perk switching.
        // Idempotent, so the SPA's duplicate onPageLoad calls converge instead of
        // racing, and it agrees with the page-transition watcher below, which runs
        // the same pair for the arrivals this dispatch never sees.
        // (renderPerkIndicator waits out the game's own boot on its own — see
        // isGameBooted there.)
        yield onPageSettled();
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
exports.quicksellSafely = exports.setQuicksellGate = void 0;
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const SETTING_QUICKSELL_SAFELY = {
    id: settings_1.SettingId.QUICKSELL_SAFELY,
    title: "Item: Safe Quick Sell",
    description: "If item is locked, also lock the Quick Sell and Quick Give buttons",
    type: "boolean",
    defaultValue: true,
};
let quicksellGate;
const setQuicksellGate = (gate) => {
    quicksellGate = gate;
};
exports.setQuicksellGate = setQuicksellGate;
const fireQuickAction = (action, fire) => __awaiter(void 0, void 0, void 0, function* () {
    if (!quicksellGate) {
        fire();
        return;
    }
    yield quicksellGate(action, fire);
});
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
            proxyButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                if (isSafetyOn && isLocked) {
                    unlockButton.click();
                    return;
                }
                yield fireQuickAction("sell", () => quicksellButton.click());
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
            proxyButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
                if (isSafetyOn && isLocked) {
                    unlockButton.click();
                    return;
                }
                yield fireQuickAction("give", () => quickgiveButton.click());
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
const currentVersion = normalizeVersion( true && "1.1.80" !== void 0 ? "1.1.80" : "1.0.0");
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
const dismissableChatBanners_1 = __webpack_require__(2783);
const exploreFirst_1 = __webpack_require__(6030);
const farmhandSettings_1 = __webpack_require__(8973);
const harvestNotifications_1 = __webpack_require__(4894);
const fishInBarrel_1 = __webpack_require__(2100);
const fleaMarket_1 = __webpack_require__(9361);
const page_1 = __webpack_require__(7952);
const settings_1 = __webpack_require__(126);
const highlightSelfInChat_1 = __webpack_require__(5454);
const improvedInputs_1 = __webpack_require__(1108);
const inventoryCapWarnings_1 = __webpack_require__(6660);
const itemNeeds_1 = __webpack_require__(8525);
const kitchenNotifications_1 = __webpack_require__(9737);
const linkifyQuickCraft_1 = __webpack_require__(7092);
const diagnostics_1 = __webpack_require__(3747);
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
    itemNeeds_1.itemNeeds,
    // craftworks
    craftworksAdvisor_1.craftworksAdvisor,
    // inventory
    inventoryCapWarnings_1.inventoryCapWarnings,
    // quests
    quests_1.quests,
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
// Features have no name of their own; the first setting they register is the
// nearest thing, and the ones without settings are the internal utilities.
const describeFeature = (feature) => { var _a, _b, _c; return (_c = (_b = (_a = feature.settings) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : `feature #${FEATURES.indexOf(feature)}`; };
const watchSubtree = (selector, handler, filter) => {
    const target = document.querySelector(selector);
    if (!target) {
        console.error(`${selector} not found`);
        (0, diagnostics_1.logDiagnostic)(`watch: ${selector} not found (${handler} never fires)`);
        return;
    }
    const handle = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        let settings;
        try {
            settings = yield (0, settings_1.getSettingValues)();
        }
        catch (error) {
            (0, diagnostics_1.logFailure)(`${handler}: reading settings failed`, error);
            return;
        }
        const [page, parameters] = (0, page_1.getPage)();
        // console.debug(`${selector} Load`, page, parameters);
        if (handler === "onPageLoad") {
            (0, diagnostics_1.logDiagnostic)(`onPageLoad: ${page !== null && page !== void 0 ? page : "?"} (route ${(_a = (0, page_1.getHashPage)()) !== null && _a !== void 0 ? _a : "none"})`);
        }
        for (const feature of FEATURES) {
            // Each feature on its own: a hook that throws is logged and the loop
            // moves on. Uncontained, one bad hook silently skipped every feature
            // registered after it -- the cap tracker, the settings section, the
            // perk reconcile -- for that dispatch, with nothing on the page to say
            // so. On a phone there is no console to say so either.
            try {
                (_b = feature[handler]) === null || _b === void 0 ? void 0 : _b.call(feature, settings, page, parameters);
            }
            catch (error) {
                (0, diagnostics_1.logFailure)(`${handler} failed in ${describeFeature(feature)}`, error);
            }
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
        var _a;
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
        for (const feature of FEATURES) {
            try {
                (_a = feature.onInitialize) === null || _a === void 0 ? void 0 : _a.call(feature, settings);
            }
            catch (error) {
                (0, diagnostics_1.logFailure)(`onInitialize failed in ${describeFeature(feature)}`, error);
            }
        }
        (0, diagnostics_1.logDiagnostic)(`init: ${FEATURES.length} features initialized`);
        // Each remaining phase on its own. They were one straight line, so a throw
        // in any of them -- the request watchers not finding the game's fetchWorker
        // in this script's world, say -- meant the DOM watchers after it were never
        // registered and no page hook ever ran, with the panel (mounted above)
        // sitting there looking fine.
        // run any interceptors for the first page
        try {
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
                (0, diagnostics_1.logDiagnostic)("init: no first page found");
            }
        }
        catch (error) {
            (0, diagnostics_1.logFailure)("init: first-page interceptors failed", error);
        }
        console.info("Registering query interceptors...");
        try {
            (0, requests_1.watchQueries)();
            (0, diagnostics_1.logDiagnostic)("init: request watchers on");
        }
        catch (error) {
            (0, diagnostics_1.logFailure)("init: request watchers failed", error);
        }
        console.info("Registering DOM watchers...");
        try {
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
            (0, diagnostics_1.logDiagnostic)("init: DOM watchers on");
        }
        catch (error) {
            (0, diagnostics_1.logFailure)("init: DOM watchers failed", error);
        }
        console.info("Farmhand running!");
    });
})().catch((error) => {
    (0, diagnostics_1.logFailure)("init: start-up failed", error);
});


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

/***/ 3747:
/***/ ((__unused_webpack_module, exports) => {


// A short in-page log of what the script itself did: which start-up phases
// completed, which dispatches ran, which hooks failed. The panel shows it
// under the perk note.
//
// It exists because a phone has no console. Every mobile-only report so far
// ("works on the web, not on the phone") has come down to guessing which of
// the start-up steps or page dispatches never happened there, with nothing on
// screen to say. This is the something.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logFailure = exports.describeError = exports.logDiagnostic = exports.onDiagnostic = exports.getDiagnostics = void 0;
const LIMIT = 40;
const entries = [];
const listeners = [];
const getDiagnostics = () => entries;
exports.getDiagnostics = getDiagnostics;
const onDiagnostic = (listener) => {
    listeners.push(listener);
};
exports.onDiagnostic = onDiagnostic;
const logDiagnostic = (text) => {
    entries.push({ at: Date.now(), text });
    if (entries.length > LIMIT) {
        entries.shift();
    }
    console.debug(`[Farmhand] ${text}`);
    for (const listener of listeners) {
        listener();
    }
};
exports.logDiagnostic = logDiagnostic;
const describeError = (error) => error instanceof Error ? `${error.name}: ${error.message}` : String(error);
exports.describeError = describeError;
// Same as logDiagnostic, and to the console as an error.
const logFailure = (text, error) => {
    console.error(`[Farmhand] ${text}`, error);
    (0, exports.logDiagnostic)(`${text}: ${(0, exports.describeError)(error)}`);
};
exports.logFailure = logFailure;


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

/***/ 1307:
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
exports.setFocusedScopes = exports.getFocusedScopes = void 0;
const settings_1 = __webpack_require__(126);
// Which undertakings you are working through right now, or none.
//
// Its own key rather than a setting: it changes many times a day, it is state
// rather than preference, and several surfaces read it. Persisted because a
// quest is days of work, not one sitting -- the panel should come back where
// you left it rather than making you re-pick every time you open it.
//
// A LIST, not one id: real progress is usually two or three things sharing a
// material -- a quest, the mastery tier it feeds, and the queue slot that makes
// the part. Focusing one at a time made the panel argue with how the game is
// actually played.
const FOCUS_KEY = "farmhandFocus";
// Reads the pre-multi single id too, so a focus set before this change survives
// the upgrade rather than silently clearing.
const getFocusedScopes = () => __awaiter(void 0, void 0, void 0, function* () {
    const { scopeId, scopeIds } = yield (0, settings_1.getData)(FOCUS_KEY, {});
    let stored = [];
    if (Array.isArray(scopeIds)) {
        stored = scopeIds;
    }
    else if (typeof scopeId === "string") {
        stored = [scopeId];
    }
    return [
        ...new Set(stored.filter((entry) => typeof entry === "string" && entry.length > 0)),
    ];
});
exports.getFocusedScopes = getFocusedScopes;
const setFocusedScopes = (scopeIds) => __awaiter(void 0, void 0, void 0, function* () {
    const unique = [...new Set(scopeIds.filter((entry) => entry.length > 0))];
    yield (0, settings_1.setData)(FOCUS_KEY, unique.length > 0 ? { scopeIds: unique } : {});
});
exports.setFocusedScopes = setFocusedScopes;


/***/ }),

/***/ 1616:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeHeading = exports.makeMutedText = exports.makeLinkedLine = exports.makeQuestLink = exports.makeLocationLink = exports.toLocationHref = exports.makeItemLink = exports.makeLink = exports.applyLinkStyle = exports.SETTINGS_HREF = void 0;
const theme_1 = __webpack_require__(1178);
// Framework7 only routes a click through its own navigation when the anchor
// declares which view to load into. Without this the link does a full page
// load, which drops the SPA state and takes seconds — the same attribute the
// quick-craft linkifier sets.
const VIEW = ".view-main";
// The game's options page, where the Farmhand section lives.
exports.SETTINGS_HREF = "settings_options.php";
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
// Section label inside the briefing panel. Shared so anything that renders a
// block into that body -- or into a panel built like it -- looks the same.
//
// Same type as the briefing panel's card heads (briefing/styles.ts), so a tab
// still built from plain headings sits next to one built from cards without a
// visible seam.
const makeHeading = (text) => {
    const heading = document.createElement("div");
    heading.className = "fh-heading";
    heading.textContent = text;
    heading.style.color = "#9aa0a6";
    heading.style.fontSize = "10.5px";
    heading.style.fontWeight = "600";
    heading.style.letterSpacing = "0.6px";
    heading.style.textTransform = "uppercase";
    heading.style.margin = "12px 0 5px";
    return heading;
};
exports.makeHeading = makeHeading;


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

/***/ 6253:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.onLayoutChange = exports.isMobileLayout = exports.MOBILE_MAX_WIDTH = void 0;
// Where the game switches to its phone layout. 767px is the breakpoint the
// fork's own navigation styles already use, so anything keyed off this agrees
// with what the rest of the script considers "mobile".
//
// This matters because the bottom stats bar is a fundamentally different space
// on the two layouts. On a desktop there's room past the currency counts for
// anything we want to add. On a phone the bar holds the counts and the game's
// own home and chat buttons and nothing more — so an addition either fits in a
// few characters or doesn't belong there at all.
exports.MOBILE_MAX_WIDTH = 767;
const query = () => window.matchMedia(`(max-width: ${exports.MOBILE_MAX_WIDTH}px)`);
const isMobileLayout = () => query().matches;
exports.isMobileLayout = isMobileLayout;
// Fires when the layout crosses the breakpoint — rotating a phone, or dragging a
// desktop window narrow. Anything that renders differently on the two layouts
// has to repaint here, or it keeps whatever shape it happened to mount in.
const onLayoutChange = (listener) => {
    query().addEventListener("change", listener);
};
exports.onLayoutChange = onLayoutChange;


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

/***/ 1903:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildNeeds = exports.needFromBlocker = exports.composeNeed = exports.needsFromGoals = exports.needsFromGoal = exports.needsFromTrackedGoals = exports.needFromTrackedGoal = void 0;
// Bridges from the two goal models onto `Need`, so the panel and the item page
// can move over one surface at a time. These go away once nothing reads
// `Goal` or `TrackedGoal` directly.
// A declared goal is its own undertaking: the player asked for this thing on
// purpose, and it competes with the others for the same shelf.
const needFromTrackedGoal = (goal) => ({
    id: `declared:${goal.name}`,
    item: goal.name,
    kind: "item",
    label: goal.name,
    measure: goal.kind === "mastery" ? "acquire" : "hold",
    quantity: goal.quantity,
    source: goal.kind === "mastery" ? "mastery" : "declared",
});
exports.needFromTrackedGoal = needFromTrackedGoal;
const needsFromTrackedGoals = (goals) => goals.map((goal) => (0, exports.needFromTrackedGoal)(goal));
exports.needsFromTrackedGoals = needsFromTrackedGoals;
// A derived goal becomes a group with one child per item it consumes.
//
// The group is what makes this different from `getGoalStatuses`: a quest that
// wants two items both made of Steel used to cost each against the full
// inventory and so claimed the same Steel twice. As children of one scope they
// share a pool and the quest's shortfall is what it would actually take.
// The id has to be STABLE across sessions, because focus is persisted against
// it. It was the goal's position in the list, which shifts the moment a request
// is finished -- focus would silently jump to a different quest. The label is
// what actually identifies the undertaking; `suffix` only exists to keep two
// identically-named ones apart.
const needsFromGoal = (goal, suffix = "") => {
    const id = `${goal.kind}:${goal.label}${suffix}`;
    const source = goal.kind === "quest" ? "quest" : "craftworks";
    const group = {
        href: goal.href,
        id,
        kind: "group",
        label: goal.label,
        source,
    };
    return [
        group,
        ...goal.needs.map((need) => ({
            href: goal.href,
            id: `${id}/${need.name}`,
            item: need.name,
            kind: "item",
            label: need.name,
            measure: "hold",
            parent: id,
            quantity: need.quantity,
            source,
        })),
    ];
};
exports.needsFromGoal = needsFromGoal;
const needsFromGoals = (goals) => {
    const seen = new Map();
    return goals.flatMap((goal) => {
        var _a;
        const key = `${goal.kind}:${goal.label}`;
        const count = (_a = seen.get(key)) !== null && _a !== void 0 ? _a : 0;
        seen.set(key, count + 1);
        return (0, exports.needsFromGoal)(goal, count === 0 ? "" : `#${count}`);
    });
};
exports.needsFromGoals = needsFromGoals;
// Make one need the child of another: the composition the panel's "goalise"
// action performs. Returns a new list; the tree is only ever a parent id, so
// re-parenting is a field assignment and never a data migration.
const composeNeed = (needs, childId, parentId) => needs.map((need) => need.id === childId ? Object.assign(Object.assign({}, need), { parent: parentId }) : need);
exports.composeNeed = composeNeed;
// A Craftworks slot stalled on something nothing else in the queue makes.
//
// The queue reports what a slot is waiting for but never how many, so this is
// deliberately a need for one: enough to say "the queue is stuck on this and
// going out for it unsticks it", which is the whole claim the data supports.
const needFromBlocker = (blocker) => ({
    id: `craftworks:${blocker.name}`,
    item: blocker.name,
    kind: "item",
    label: blocker.slots.length > 0
        ? `Craftworks: ${blocker.slots.length} slot${blocker.slots.length === 1 ? "" : "s"} stalled`
        : "Craftworks",
    measure: "hold",
    quantity: 1,
    source: "craftworks",
});
exports.needFromBlocker = needFromBlocker;
// Every demand on the player, from every source, as one list.
//
// This is the single entry point the surfaces should use: the item page, the
// panel and the location advisor all asking the same question of the same data
// is the point of the model.
const buildNeeds = ({ craftworksRoots = [], questGoals = [], trackedGoals = [], }) => [
    ...(0, exports.needsFromTrackedGoals)(trackedGoals),
    ...(0, exports.needsFromGoals)(questGoals),
    ...craftworksRoots.map((blocker) => (0, exports.needFromBlocker)(blocker)),
];
exports.buildNeeds = buildNeeds;


/***/ }),

/***/ 2538:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDesiredQueueForNeeds = exports.getNearlyDoneScopes = exports.rankNeedBottlenecks = exports.resolveNeeds = exports.getScopeRoots = exports.MAX_NEED_DEPTH = void 0;
const craftPlanner_1 = __webpack_require__(5825);
const unlimited_1 = __webpack_require__(4808);
// Deep enough for any real chain of goals, and a stop for a malformed one.
// Mirrors craftPlanner's MAX_DEPTH for the same reason: a cycle should degrade,
// not hang the page.
exports.MAX_NEED_DEPTH = 12;
// Walk each need up to the root of its tree. A parent that isn't in the list,
// or a cycle, leaves the need standing as its own root rather than throwing:
// bad data should cost you composition, not the panel.
const getScopeRoots = (needs) => {
    const byId = new Map(needs.map((need) => [need.id, need]));
    const roots = new Map();
    for (const need of needs) {
        let current = need;
        let depth = 0;
        while (current.parent && depth < exports.MAX_NEED_DEPTH) {
            const parent = byId.get(current.parent);
            if (!parent || parent.id === current.id) {
                break;
            }
            current = parent;
            depth += 1;
        }
        roots.set(need.id, current.id);
    }
    return roots;
};
exports.getScopeRoots = getScopeRoots;
// Depth of a need in its tree, used only to order resolution parents-first.
const getDepth = (need, byId) => {
    let current = need;
    let depth = 0;
    while (current.parent && depth < exports.MAX_NEED_DEPTH) {
        const parent = byId.get(current.parent);
        if (!parent || parent.id === current.id) {
            break;
        }
        current = parent;
        depth += 1;
    }
    return depth;
};
const toList = (byName) => [...byName.entries()]
    .filter(([, quantity]) => quantity > 0)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
const READY = {
    canMakeNow: 0,
    coveredByParent: false,
    have: 0,
    isReady: true,
    missing: [],
    outstanding: 0,
    ratio: 1,
};
// Cost one item need against a pool, spending what it takes out of that pool.
//
// `spend` is deducted so the next need in the same scope sees a shelf that has
// already been drawn down — the thing that makes a parent and its children add
// up to one shopping list instead of two.
const costAgainstPool = (need, graph, pool, unlimited, mastery) => {
    var _a, _b, _c, _d;
    if ((0, unlimited_1.isUnlimited)(unlimited, need.item)) {
        return Object.assign({}, READY);
    }
    if (need.measure === "acquire") {
        // Mastery counts what has been made, never what is held, so nothing comes
        // off the shelf as credit — but the materials to make the remainder do.
        const entry = mastery.find((item) => item.name === need.item);
        const remaining = entry ? entry.remaining : need.quantity;
        const have = entry ? entry.value : 0;
        const required = entry ? entry.required : need.quantity;
        if (remaining <= 0) {
            return Object.assign(Object.assign({}, READY), { have });
        }
        const plan = (0, craftPlanner_1.planCraft)(graph, need.item, remaining, pool, unlimited);
        for (const [name, quantity] of Object.entries(plan.spend)) {
            pool[name] = Math.max(0, ((_a = pool[name]) !== null && _a !== void 0 ? _a : 0) - quantity);
        }
        return {
            canMakeNow: Math.min(remaining, (0, craftPlanner_1.getMaxCraftable)(graph, need.item, pool, unlimited)),
            coveredByParent: false,
            have,
            isReady: false,
            missing: plan.missing,
            outstanding: remaining,
            ratio: required > 0 ? Math.min(1, have / required) : 0,
        };
    }
    const have = Math.min(need.quantity, (_b = pool[need.item]) !== null && _b !== void 0 ? _b : 0);
    const outstanding = need.quantity - have;
    // the finished ones just claimed are no longer raw material for the rest
    pool[need.item] = Math.max(0, ((_c = pool[need.item]) !== null && _c !== void 0 ? _c : 0) - have);
    if (outstanding <= 0) {
        return Object.assign(Object.assign({}, READY), { have });
    }
    const node = graph.nodes.get(need.item);
    if (!(node === null || node === void 0 ? void 0 : node.canCraft) || node.ingredients.length === 0) {
        // a raw drop: nothing to plan, you go and get it
        return {
            canMakeNow: 0,
            coveredByParent: false,
            have,
            isReady: false,
            missing: [{ name: need.item, quantity: outstanding }],
            outstanding,
            ratio: have / need.quantity,
        };
    }
    const canMakeNow = Math.min(outstanding, (0, craftPlanner_1.getMaxCraftable)(graph, need.item, pool, unlimited));
    const plan = (0, craftPlanner_1.planCraft)(graph, need.item, outstanding, pool, unlimited);
    for (const [name, quantity] of Object.entries(plan.spend)) {
        pool[name] = Math.max(0, ((_d = pool[name]) !== null && _d !== void 0 ? _d : 0) - quantity);
    }
    return {
        canMakeNow,
        coveredByParent: false,
        have,
        isReady: false,
        missing: plan.missing,
        outstanding,
        ratio: Math.min(1, (have + canMakeNow) / need.quantity),
    };
};
// Read a child's progress off an ancestor's plan without adding to the bill.
//
// The child names an item the ancestor is already going to need, so it is a
// checkpoint inside that work — "you have 12 of the 20 Glass the Lanterns
// want". Counting it again would inflate the scope's shopping list for exactly
// the materials that matter most.
const costAsMilestone = (need, graph, inventory, unlimited) => {
    var _a;
    if ((0, unlimited_1.isUnlimited)(unlimited, need.item)) {
        return Object.assign(Object.assign({}, READY), { coveredByParent: true });
    }
    const have = Math.min(need.quantity, (_a = inventory[need.item]) !== null && _a !== void 0 ? _a : 0);
    const outstanding = need.quantity - have;
    if (outstanding <= 0) {
        return Object.assign(Object.assign({}, READY), { coveredByParent: true, have });
    }
    const pool = Object.assign(Object.assign({}, inventory), { [need.item]: 0 });
    const canMakeNow = Math.min(outstanding, (0, craftPlanner_1.getMaxCraftable)(graph, need.item, pool, unlimited));
    return {
        canMakeNow,
        coveredByParent: true,
        have,
        isReady: false,
        missing: [],
        outstanding,
        ratio: Math.min(1, (have + canMakeNow) / need.quantity),
    };
};
// True when one of the need's ancestors already plans for this item, which
// makes the need a checkpoint inside that work rather than another trip.
//
// Deliberately ancestors only: two siblings both wanting Stone are two real
// demands on one shelf and have to sum.
const isClaimedByAncestor = (need, byId, claimsByNeed) => {
    var _a;
    if (need.kind !== "item") {
        return false;
    }
    let current = need;
    let depth = 0;
    while ((current === null || current === void 0 ? void 0 : current.parent) && depth < exports.MAX_NEED_DEPTH) {
        const parent = byId.get(current.parent);
        if (!parent || parent.id === current.id) {
            return false;
        }
        if ((_a = claimsByNeed.get(parent.id)) === null || _a === void 0 ? void 0 : _a.has(need.item)) {
            return true;
        }
        current = parent;
        depth += 1;
    }
    return false;
};
// Work out what every need is short of, once.
//
// Needs in the same scope draw from one pool in parent-first order: they are
// one undertaking, and a material spent on the parent is not still on the shelf
// for the child. Needs in different scopes are alternatives competing for the
// same shelf, so each scope starts from the full inventory — that is the call
// `focus.ts` made deliberately and it stays right for "which of these should I
// do next".
const resolveNeeds = (graph, needs, inventory, unlimited = unlimited_1.NO_UNLIMITED, mastery = []) => {
    var _a, _b, _c, _d, _e;
    const byId = new Map(needs.map((need) => [need.id, need]));
    const roots = (0, exports.getScopeRoots)(needs);
    const statusById = new Map();
    const scopes = [];
    const grouped = new Map();
    for (const need of needs) {
        const root = (_a = roots.get(need.id)) !== null && _a !== void 0 ? _a : need.id;
        grouped.set(root, [...((_b = grouped.get(root)) !== null && _b !== void 0 ? _b : []), need]);
    }
    for (const [rootId, members] of grouped) {
        const pool = Object.assign({}, inventory);
        const ordered = [...members].sort((a, b) => getDepth(a, byId) - getDepth(b, byId));
        // what each need's own plan accounts for. A need is a milestone only when
        // one of its ANCESTORS already claimed the item -- two siblings both
        // wanting Stone are two real demands and have to sum, which is exactly the
        // shared-pool case, not a duplicate.
        const claimsByNeed = new Map();
        const scopeMissing = new Map();
        const ratios = [];
        for (const need of ordered) {
            if (need.kind === "group") {
                statusById.set(need.id, Object.assign(Object.assign({}, READY), { need, scopeId: rootId }));
                continue;
            }
            const status = isClaimedByAncestor(need, byId, claimsByNeed)
                ? costAsMilestone(need, graph, inventory, unlimited)
                : costAgainstPool(need, graph, pool, unlimited, mastery);
            statusById.set(need.id, Object.assign(Object.assign({}, status), { need, scopeId: rootId }));
            if (status.coveredByParent) {
                continue;
            }
            // what this need is going to take, so any descendant naming one of those
            // items reads as a checkpoint inside this work rather than another trip
            claimsByNeed.set(need.id, new Set([need.item, ...status.missing.map((entry) => entry.name)]));
            for (const entry of status.missing) {
                scopeMissing.set(entry.name, ((_c = scopeMissing.get(entry.name)) !== null && _c !== void 0 ? _c : 0) + entry.quantity);
            }
            ratios.push(status.ratio);
        }
        const root = byId.get(rootId);
        const scopeNeeds = members.map((need) => statusById.get(need.id));
        const missing = toList(scopeMissing);
        scopes.push({
            isReady: missing.length === 0,
            label: (_d = root === null || root === void 0 ? void 0 : root.label) !== null && _d !== void 0 ? _d : rootId,
            missing,
            needs: scopeNeeds,
            ratio: ratios.length > 0
                ? ratios.reduce((total, value) => total + value, 0) / ratios.length
                : 1,
            rootId,
        });
    }
    // Across scopes the largest ask wins rather than the sum: a request short of
    // 40 Steel and a Craftworks slot stalled on Steel are the same trip, not two.
    const merged = new Map();
    for (const scope of scopes) {
        for (const entry of scope.missing) {
            merged.set(entry.name, Math.max((_e = merged.get(entry.name)) !== null && _e !== void 0 ? _e : 0, entry.quantity));
        }
    }
    return {
        missing: toList(merged),
        scopes,
        statuses: needs.map((need) => statusById.get(need.id)),
    };
};
exports.resolveNeeds = resolveNeeds;
// Rank raw materials by how much of the backlog they unblock. One item gating
// five undertakings beats one gating a single undertaking even when the single
// one needs far more of it.
const rankNeedBottlenecks = (resolved) => {
    var _a;
    const byName = new Map();
    for (const scope of resolved.scopes) {
        for (const entry of scope.missing) {
            const existing = (_a = byName.get(entry.name)) !== null && _a !== void 0 ? _a : {
                gates: [],
                gatesCount: 0,
                maxNeeded: 0,
                name: entry.name,
                totalNeeded: 0,
            };
            existing.gatesCount += 1;
            existing.gates.push(scope.label);
            existing.maxNeeded = Math.max(existing.maxNeeded, entry.quantity);
            existing.totalNeeded += entry.quantity;
            byName.set(entry.name, existing);
        }
    }
    return [...byName.values()].sort((a, b) => b.gatesCount - a.gatesCount || b.maxNeeded - a.maxNeeded);
};
exports.rankNeedBottlenecks = rankNeedBottlenecks;
// Undertakings one item short. A single trip finishes them outright, which
// makes them the highest-leverage thing on the board.
const getNearlyDoneScopes = (resolved) => resolved.scopes.filter((scope) => !scope.isReady && scope.missing.length === 1);
exports.getNearlyDoneScopes = getNearlyDoneScopes;
// What the Craftworks queue should be making, across the whole backlog.
//
// The old queue advice reasoned from tracked goals alone, so a quest wanting
// forty of something never reached it and the fallback asked for ONE of each
// thing a slot happened to be stalled on -- which is how a queue full of
// single units happens. Every need is in here now, at the quantity it actually
// wants, and an item two undertakings both need keeps the deeper of its two
// positions so the order still builds bottom-up.
const getDesiredQueueForNeeds = (graph, resolved, inventory, unlimited = unlimited_1.NO_UNLIMITED, 
// when non-empty, only these undertakings' needs are costed -- what "work a
// whole quest at a time" means for the queue.
//
// Note this SUMS a shared material across the focused scopes where a trip
// takes the largest single ask (`mergeMissing`). That difference is real and
// deliberate: two quests each wanting 40 Steel need 80 crafted, but one trip
// for Coal covers both.
scopeIds) => {
    var _a, _b;
    const isScoped = scopeIds !== undefined && scopeIds.size > 0;
    const byName = new Map();
    for (const status of resolved.statuses) {
        // a milestone is already inside its parent's plan; costing it again would
        // ask the queue for the same materials twice
        if (status.need.kind !== "item" ||
            status.isReady ||
            status.coveredByParent ||
            status.outstanding <= 0 ||
            (isScoped && !scopeIds.has(status.scopeId))) {
            continue;
        }
        const node = graph.nodes.get(status.need.item);
        if (!(node === null || node === void 0 ? void 0 : node.canCraft) || node.ingredients.length === 0) {
            continue;
        }
        const plan = (0, craftPlanner_1.planCraft)(graph, status.need.item, status.outstanding, Object.assign(Object.assign({}, inventory), { [status.need.item]: 0 }), unlimited);
        for (const step of plan.steps) {
            const existing = byName.get(step.name);
            byName.set(step.name, {
                depth: Math.max((_a = existing === null || existing === void 0 ? void 0 : existing.depth) !== null && _a !== void 0 ? _a : 0, step.depth),
                quantity: ((_b = existing === null || existing === void 0 ? void 0 : existing.quantity) !== null && _b !== void 0 ? _b : 0) + step.quantity,
            });
        }
    }
    return [...byName.entries()]
        .sort((a, b) => b[1].depth - a[1].depth)
        .map(([name, entry]) => ({ name, quantity: entry.quantity }));
};
exports.getDesiredQueueForNeeds = getDesiredQueueForNeeds;


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
const diagnostics_1 = __webpack_require__(3747);
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
// A banner action that fails used to fail silently: the "Loading..." label
// stayed, or the banner simply came back, with nothing on a phone to say
// which. Timed and logged, so the panel's log shows what the tap did.
const runHandler = (notification, name, handler) => __awaiter(void 0, void 0, void 0, function* () {
    const startedAt = Date.now();
    try {
        yield handler(notification);
        (0, diagnostics_1.logDiagnostic)(`banner ${notification.id}: ${name} done (${Date.now() - startedAt}ms)`);
    }
    catch (error) {
        (0, diagnostics_1.logFailure)(`banner ${notification.id}: ${name} failed`, error);
    }
});
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
                (0, diagnostics_1.logDiagnostic)(`banner ${notification.id}: tapped`);
                const handler = notificationHandlers.get(notification.handler);
                if (handler) {
                    yield runHandler(notification, notification.handler, handler);
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
                    (0, diagnostics_1.logDiagnostic)(`banner ${notification.id}: ${action.text} tapped`);
                    const handler = notificationHandlers.get(action.handler);
                    if (handler) {
                        yield runHandler(notification, action.handler, handler);
                    }
                    else {
                        console.error(`Handler not found: ${action.handler}`);
                    }
                    // A failed action leaves the banner in place (the render below
                    // sees nothing to change), so give it its label back rather than
                    // a "Loading..." that never ends.
                    actionElement.textContent = action.text;
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
    // one oven's finished meal (`oven=N`); the "all" form above is only served
    // to accounts that own the Farm Supply perk for it
    WorkerGo["COLLECT_MEAL"] = "cookready";
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

/***/ 7694:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.onPageTransition = void 0;
// Fires after the game slides a different page into view -- forward OR back.
//
// The childList dispatch in index.ts only sees a page element being ADDED,
// and going back adds nothing: Framework7 keeps the page you came from in the
// DOM and re-shows it by changing its class. Watching the class catches every
// transition. Same observer shape as utils/notifications.ts and the perk
// reconciler, kept as one helper here for anything else that needs to notice
// you moved.
//
// Debounced, because a transition changes the class several times (leaving,
// entering, settled) and mid-transition the hash has already moved while the
// page swap has not landed. The last change is the settled one, so a listener
// that reads the page always gets the final state.
const onPageTransition = (listener, debounceMs = 100, attempt = 0) => {
    const pages = document.querySelector(".view-main .pages");
    if (!pages) {
        // Registered from an initializer, this can run before the shell is in the
        // DOM. Try again for a while rather than silently never watching.
        if (attempt < 40) {
            setTimeout(() => (0, exports.onPageTransition)(listener, debounceMs, attempt + 1), 500);
        }
        else {
            console.error("Pages not found");
        }
        return;
    }
    let timeout;
    const observer = new MutationObserver((mutations) => {
        var _a, _b;
        for (const mutation of mutations) {
            // Only a page's own class, never a descendant's: with subtree watching,
            // classes set on anything inside the page would otherwise fire this too.
            if ((_b = (_a = mutation.target).matches) === null || _b === void 0 ? void 0 : _b.call(_a, ".page")) {
                clearTimeout(timeout);
                timeout = setTimeout(listener, debounceMs);
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
exports.onPageTransition = onPageTransition;


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
    SettingId["ITEM_NEEDS"] = "itemNeeds";
    SettingId["CRAFTWORKS_ADVISOR"] = "craftworksAdvisor";
    SettingId["EXPLORE_FIRST"] = "exploreFirst";
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
    StorageKey["TOWNSFOLK"] = "townsfolk";
    StorageKey["TOWNSFOLK_DATA"] = "townsfolkData";
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
            // A rejected task used to leave isProcessingQueue stuck at true, so one
            // failed lazy fetch stopped every later one from ever being run.
            try {
                yield task();
            }
            catch (error) {
                console.error("[STATE] Lazy fetch failed", error);
            }
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
            // A fetch that fails resolves to whatever was cached (or nothing) and is
            // logged, rather than leaving this promise pending forever. It used to do
            // the latter: a rejected fetch never resolved, so it stayed registered in
            // gettingByQuery and every later get() for the same key -- including the
            // doNotFetch reads the request interceptors do before they run -- waited
            // on it for the rest of the session. One "Load failed" on the crop-status
            // refetch (which fires at readyAt, exactly when a phone is likely asleep)
            // was enough to stop the farm state, its interceptors and so the harvest
            // banner from ever updating again until a reload. A desktop reloads the
            // game often enough to hide that; a home-screen web app keeps one session
            // for days.
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
                    this.fetch(this, query)
                        .then((result) => this.set(result, query))
                        .catch((error) => {
                        console.error(`[STATE] Fetching ${this.key} (query: ${queryKey}) failed`, error);
                        return this.read(query);
                    })
                        .then(resolve);
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
            try {
                return yield newPromise;
            }
            finally {
                delete this.gettingByQuery[queryKey];
            }
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
// Takes the item names the backlog wants rather than the tracked goals, so a
// set that makes something a QUEST needs -- or an intermediate two
// undertakings both need -- is recommendable too. Matching only literal
// tracked-goal names meant the loader stayed silent on almost everything.
const getRecommendedSet = (wantedNames, sets, itemNames) => {
    const names = [...itemNames];
    const wanted = new Set([...wantedNames].map((name) => name.toLowerCase()));
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