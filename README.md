# Farm RPG Farmhand

Farmhand is an add-on that helps you all around Redbrook in [Farm RPG](https://farmrpg.com)

All features are configurable and optional.

## About this fork

This is a fork of [anstosa/farmrpg-farmhand](https://github.com/anstosa/farmrpg-farmhand) maintained at [bwalkerr/farmrpg-farmhand](https://github.com/bwalkerr/farmrpg-farmhand) with additional fixes and features, listed below. Everything else in this README is the upstream project's documentation and applies unchanged.

Install this fork's build directly: <https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/reed-mods/dist/farmrpg-farmhand.user.js>

Updates come from this repository: the script's update URLs point at the build above, so your script manager offers fork releases on its own. It never consults the Greasy Fork release, which is upstream's and would replace this fork entirely.

Fork releases are numbered from **1.1.0** onwards; upstream's own releases are the 1.0.x line, so a version starting 1.1 is always this fork.

### Fork features

#### Never lose a drop to the storage cap

* **Inventory: Cap warnings** — on the inventory page, items at your storage cap get a red **MAX** badge and items at 90%+ get an orange **NEAR** badge, with a summary line ("⚠ 2 items at the 200 cap · 1 near cap") above the list.
* **Inventory: Cap tracker** — the same information where you need it while playing: a row of item icons in the bottom stats bar, right of your currency counts. Red ring = at cap, orange = near, hover for the exact count, click to open the item; up to 20 icons, then a "+N" link to your inventory.
  * Counts come from the inventory page while you're on it, and otherwise from a background check at most every 10 minutes — you don't have to visit your inventory for the row to be right.
  * While you're actually fishing, exploring, mining, harvesting or selling, the game's own requests refresh it (at most once every 15 seconds), so it keeps up as you play.
  * On a fishing spot, explore area or mine, the row narrows to items that actually drop *there*. Those drop lists are learned from your own play — explore and fishing results, and the dig board for mines — and remembered, so each location only needs to be seen once. A location it hasn't learned yet shows everything rather than nothing.
  * A **−** control collapses the row to two numbers (at cap / near cap) and remembers that choice.

#### Perk sets that are actually equipped when it counts

* **Perk set indicator** — a coloured dot and the set's first letter in the bottom stats bar, showing which set you're playing under: gray for Default, orange for an activity set, hollow while a switch is in flight (full name in the tooltip). It sits just after the currency counts, before the Menu button, on phones as well as desktop. It reports what the game has confirmed equipped, not merely what was requested. It replaces upstream's "…perks activated" banners, which pushed the page (and whatever button was under your finger) down each time they appeared.
* **Perks stay on while you browse** — an activity set is activated when you reach an activity page and put away when you go home or to your farm. Opening an item, your inventory or a wiki page mid-run leaves your perks alone instead of swapping them out and back.
* **Farming and Mining perk sets** — upstream supports Crafting/Fishing/Exploring/Selling/Friendship/Temple/Locksmith/Wheel; this fork adds sets named "Farming" and "Mining", the latter covering both the mine list and the dig board.
* **A shared "Town" set** — if you have a set named "Town" it covers the temple, wheel, locksmith, vault, farmers market and the town hub, so walking between town buildings doesn't re-switch perks at every door. Without one, each building still falls back to its own set.
* **Harvest and Replant use your farm perks** — the Harvest action on the crops-ready notification and Replant in the harvest popup equip the "Farming" set first, or Default when you don't have one (where most players keep their farm perks), and wait for the game to finish equipping before harvesting. Harvesting from home or your farm costs no extra requests.
* **Quick Sell, Quick Craft and Quick Give share one set** — all three use the set named "Crafting", so clicking between them never swaps perks, and each waits for its perks to be equipped before firing. If you keep your selling, crafting and friendship perks together in that one set, they simply stay on for the whole run.

### Fork fixes

* Quick sales could go out under the wrong perks — the script would report the selling set was active while the game still had Default equipped, and the sale paid the base rate.
* The farmers market, workshop and other activity pages could end up on Default, because the game's page-load event fires several times per navigation and two of those runs disagreed about which set to use.
* False "Crops are ready!" notification while crops were still growing (the timer now re-checks the farm instead of assuming).
* One notification excluded from a page silently hid every notification after it — on the farm page that meant no oven, meal, pets or update banners at all.
* "Ovens are empty!" notification spam for players who haven't unlocked the kitchen yet.
* Gold and Ancient Coins were hidden from the bottom toolbar by the compressed navigation styles.
* Temple perk sets never activated — the game moved the temple to `temple.php`, the script still looked for the old page identity.
* Perk set names now match case-insensitively and ignore stray whitespace.
* Explore areas, fishing spots and mines are all served by the same kind of URL and could be given each other's perks; the activity in the URL is now what decides.
* Inventory cap could be parsed from the wagon upgrade pitch (next tier's number) instead of your actual cap.

### Sending fixes back upstream

The fork's history is built as one commit per change on top of upstream `main`, so the fixes that aren't fork-specific can be offered upstream one at a time. None have been submitted yet. In cherry-pick order, each applies to upstream on its own:

| Commit | Fix | Why it's upstream's |
| --- | --- | --- |
| `2fef5e4` | Verify crops are ready before saying so | The ready time is a guess when it comes from the home page, so the banner fires early for everyone |
| `374891e` | Only warn about empty ovens if the player has ovens | Affects every player who hasn't unlocked the kitchen |
| `b498b1a` | Keep gold and ancient coins visible in the bottom bar | The compressed navigation styles hide them for everyone using that feature |
| `7a3ddf7` | Don't let a page-excluded banner hide the banners after it | Any page with an excluded notification loses the rest |
| `dda223d` | Compare release numbers part by part, in order | Version comparison misfires whenever a later part of the candidate exceeds the current release's |
| `d91d299` | Make perk set switching actually land | Same three causes upstream has (drifting active-set cache, the game confirming a switch before applying it, clearing perks racing the next action) — but it exports state the perk indicator consumes, so it pairs with `6f8fd9b` or needs a note |

The rest — sticky activity perks, the Town cluster, the consolidated quick-action set, the cap tracker and the perk indicator — are fork behaviour rather than bug fixes, and are not proposed upstream.

## Usage

Note that Farmhand is designed to make navigating Redbrook and your FarmRPG life easier *in ways that do not violate the [Code of Conduct](https://farmrpg.com/index.php#!/coc.php)*.

> ### Botting, Scripting, Macros, Etc
>
> **Don't do it.**
>
> While Farm RPG is non-competitive, using any sort of script, bot, macro, etc to play the game in an automated fashion is strictly forbidden. Discussions involving this topic are also not allowed.
>
> The reason for this is that automating the game causes a large amount of server requests and bandwidth usage that is not ideal as the game grows.

Farmhand purposefully avoids any features that would violate the letter or spirit of these rules (such as auto-fish, auto-explore, auto-farm, etc). Usage of Farmhand should not result in a ban and has been unofficially okayed by admins *but is not explicitly endorsed by Magic & Wires LLC*. [@anstosa](https://farmrpg.com/#!/profile.php?user_name=anstosa) makes no warranties with regard to its use.

## Install

**Installing this fork:** use its build — <https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/reed-mods/dist/farmrpg-farmhand.user.js> — in place of the Greasy Fork link in the steps below, and don't leave the Greasy Fork copy enabled alongside it. The Greasy Fork release auto-updates to upstream, which would replace the fork and everything in it.

### Desktop

1. Install a browser that supports extensions (including [Firefox](https://www.mozilla.org/en-US/firefox/new) on mobile)
2. [Install Violentmonkey](https://violentmonkey.github.io/) or another Greasemonkey script manager like [Userscripts on iOS](https://apps.apple.com/us/app/userscripts/id1463298887)
3. Install Farmhand via [Greasy Fork](https://greasyfork.org/en/scripts/497660-farm-rpg-farmhand) (or [directly from this repository](https://github.com/anstosa/farmrpg-farmhand/blob/main/dist/farmrpg-farmhand.user.js))
4. If you're on mobile, you can use your browser to add <https://farmrpg.com> to your homescreen so it feels like an app

### Mobile

1. Install [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)
2. Install Farmhand via [Greasy Fork](https://greasyfork.org/en/scripts/497660-farm-rpg-farmhand) (or [directly from this repository](https://github.com/anstosa/farmrpg-farmhand/blob/main/dist/farmrpg-farmhand.user.js))
3. Use the browser menu when visiting <https://farmrpg.com> to add it to you your homescreen so it feels like an app

## Features

### Farmhand Settings

All features are configurable via new settings in [My Settings > Change Game Options](https://farmrpg.com/#!/settings_options.php)

### Items

* Adds shortcut to view page in [Buddy's Almanac](https://buddy.farm)
* Shows Exploring, Fishing, and Mining sections right under Item Details
* Locks Quick Sell and Quick Donate for locked items
* Make missing ingredients in Quick Carft links
* Show ongoing notifications for meals

### Quests

* Adds shortcut to view page in [Buddy's Almanac](https://buddy.farm)
* Remember quest detail collapse state globally instead of per-quest
* Sort by completion
* Tagging
  * Starred quests appear with an icon at the top of the request list
  * low priority quests appear at the bottom of the quest list, grayed out
  * Untagged quests appear in the middle

### Banker

* Automatically calculates your target balance (minimum balance required to maximize your daily interest)
* Adds an option *Deposit Target Balance* which deposits up to your target balance
* Adds an option to *Withdraw Interest* which withdraws any earnings on top of your target balance

### Vault

* Prefills vault code with recommended guess
* Custom vault code keyboard with hints built-in
* Floating "recommended action" button that clicks submit guess, get more guesses, or get new vault for you

### Mining

* Floating "recommended action" button that clicks the recommended action for you
  * Next floor
  * Use bomb (disabled by default)
  * Use explosives
  * Make more picks (if none left)
  * Dig recommended location on board

### Chat

* Add popup on username hover/long press that shows mailbox size, bio, and looking for
* Compress chat view so more messages are visible
* Dismissable chat banners
* Highlight messages tagging you in chat
* Autocomplete ((item)) tags in chat
* Autocomplete usernames when @mentioning: in chat
* Add refresh button to chat

### Menu

* Customize menu (icon, name, order, URL)
* Compressed menu view so more items are visible
* Align menu to bottom so it's easier to reach on mobile
* Hide logo from menu
* Add menu button to bottom bar so it's easier to reach on mobile

### Perk set management

If you have a perk set named "Default" and perk sets with the names "Crafting", "Fishing", "Exploring", "Selling", "Friendship", "Temple", "Locksmish", or "Wheel", they will be automatically activated before doing the relevant activities, and deactivated after.

Supports Quick Craft for "Crafting", Quick Sell for "Selling", and Quick Give for "Friendship"

This frees up points from many activity specific perks to be re-invested in perks that need to be on all the time.

*In this fork this works differently — "Farming", "Mining" and "Town" sets are supported as well, sets are put away when you go home or to your farm rather than on every page, the three Quick actions share one set, and a pill in the bottom stats bar shows which set is on. See [Fork features](#fork-features) above.*

### Fishing

* Fish always appear in middle of pond
* Larger results display with consistent ordering for nets

### Exploring

* Larger results display with consistent ordering

### Farming

* Crop ready notifications
* Field empty notifications
* Popup showing items harvested with Replant button
* Buy and sell max animals by default (instead of 1)

### Flea Market

* Disabled (can be re-enabled in settings)

### Mailbox

* Quick collect from notification

### Pets

* Quick collection option from notification shows summary of what was collected

### Locksmith

* Open max containers by default (instead of 1)

### Cooking

* Ovens empty notification
* Meals ready notification

### UI Cleanup

* Home: hide players section
* Home: hide theme switcher
* Home: home footer
* Home: moves updates to top if there is a new one
* Home: compress skills section
* Quests: Styled border
* Quests: Minimizable
* Popups: Click outside to close
* Inputs: Cleaner and more consistent
* Buttons: Cleaner and more consistent
* Dropdowns: Cleaner, more consistent, and show item icons
* Wallet: compact money over 1M

### Export/Sync

All settings can be exported and imported on other devices.

Settings and data are also synced using the notes field on the home page if you are an [Alpha Supporter](https://farmrpg.com/index.php#!/wiki.php?page=Alpha+Testing)

## Roadmap

Future features under consideration or development

* Desktop notifications
* Grape juice button after replant popup if available
* Fix notifications page bouncing issue
* Use again functionality for meals
* Ctrl+K quick go to popup for quickly going to any page, item, etc from anywhere
* Contextual status information in custom navigation items (e.g. crops growing for farm, chores completed for Chores, items exchanged for exchange, etc)
* Notification for wine at max value
* Compressed view for home and town pages (square tiles)

## Tip

Do you like Farmhand? Tip me at [@anstosa in-game](https://farmrpg.com/#!/profile.php?user_name=anstosa)

## Changelog

*Fork releases are 1.1.0 and up, plus the older 1.0.32–1.0.75 line; 1.0.31 and below are upstream. The fork's history was tidied into modular commits at 1.1.0, so releases up to 1.0.75 no longer have a commit each — the entries below are what each of those releases changed.*

### 1.1.10

* Fixed: crop, oven and meal status were saved between sessions despite being live values that go stale in five seconds, so at load a banner could appear from the previous session's status and vanish a moment later when real data arrived

### 1.1.9

* Changed: the perk marker is now just a coloured dot and the set's first letter ("● C"), so it always fits in the bottom bar next to your counts. The full set name is in its tooltip

### 1.1.8

* Changed: the perk pill sits after your currency counts again, in the gap before the Menu button, on phones as well as desktop
* Added: **Perks: Debug indicator** setting (off by default) — the pill also reports what the perk manager last decided, e.g. "Crafting · workshop → Crafting" or "Default · unknown page: keeping current set", including when a switch failed. Useful on a phone, where there's no console to read

### 1.1.7

* Fixed: the script never ran on www.farmrpg.com — that host serves the whole game and doesn't redirect to the bare domain, so anyone whose browser used www got no Farmhand at all
* Fixed: requests are now made to the host the page was loaded from, rather than always to farmrpg.com. On any other host — www, or alpha, which was already supported — requests went cross-origin without your session and every page watcher was silently disabled

### 1.1.6

* Added: the script now carries update URLs pointing at this fork's own build, so a script manager offers new fork releases by itself. They point only at this repository — the Greasy Fork release, which would replace the fork with upstream, is never consulted

### 1.1.5

* Added: on a phone the perk set pill sits at the left end of the bottom bar, just left of your currency counts, instead of being appended past the game's home and chat buttons where it can't be seen. It follows the layout if you rotate the device

### 1.1.4

* Fixed: hovering a name in chat re-registered its handlers on every new chat message, so hovering an older name ran the popup once per copy that had piled up
* Fixed: cached player profiles, mailboxes and buddy.farm item data expired after under 3 hours instead of the intended week — three caches read their timeout as minutes when it is seconds. Profiles and mailboxes now hold for a day, item data for a week, so hovering the same player again costs nothing

### 1.1.3

* Fixed: "Body has already been consumed" errors in the console — when two watchers were interested in the same page (the farm page has two), the second one failed and silently lost its update
* Fixed: a hover that failed to load left "(loading...)" stuck on the username forever

### 1.1.2

* Fixed: hovering a username in chat showed "(loading...)" and then nothing — the game rebuilt its profile page, so the player's id and name couldn't be read any more
* Changed: the hover popup shows whichever details it could load instead of nothing at all, and says so when a profile can't be read; a mailbox with no stated capacity no longer reports a made-up one

### 1.1.1

* Fixed: the update check asked Greasy Fork, so it offered upstream's release as an "update" — it now checks this fork's own build
* Fixed: release numbers are compared part by part in order, so 1.0.31 is no longer treated as newer than 1.1.0
* Changed: "View Changes" shows this changelog rather than upstream's

### 1.1.0

* Added: perk set indicator in the bottom stats bar, replacing the "…perks activated" banners
* Changed: activity perk sets stay on while you browse; they're put away when you go home or to your farm
* Fixed: quick sales could go out under the wrong perks; harvest and replant now wait for the farm perks to be equipped
* Fixed: a notification excluded from a page no longer hides every notification after it

*Everything below is the older fork line. Releases 1.0.50–1.0.62 were one long hunt for why perk sets weren't reliably equipped; several of those steps were later undone once the real cause was found, so read that run as a whole rather than as individual improvements.*

### 1.0.75

* Changed: activity perk sets stay on while you browse — perks are put away when you go home or to your farm, and left alone everywhere else
* Fixed: explore areas, fishing spots and mines share a page identity, so a fishing spot could be given Exploring perks; the activity named in the location URL now decides

### 1.0.74

* Fixed: the perk indicator and the cap tracker fought over position in the stats bar depending on which mounted first; the indicator now keeps itself to the right

### 1.0.73

* Fixed: one notification excluded from a page hid every notification sorted after it — on the farm page that meant no oven, meal, pets or update banners

### 1.0.72

* Fixed: the perk indicator could mount twice, leaving two pills in the stats bar

### 1.0.71

* Added: perk set indicator in the bottom stats bar, this time mounted only after the game has finished booting

### 1.0.70

* Fixed: harvest and replant now wait for the farm perks to actually be equipped before harvesting

### 1.0.69

* Fixed: rollback to 1.0.67's code, republished at a higher version, after 1.0.68 left the game unable to finish loading

### 1.0.68

* Withdrawn: added the perk indicator and the harvest fix together; touching the page before the game's own start-up finished left the game unresponsive

### 1.0.67

* Fixed: crafting on the workshop re-switched perks (and re-flashed the banner) on every craft, because a moment of page rebuilding read as "you left the activity"
* Changed: the perks banner stays up while the perks are on instead of disappearing on a timer

### 1.0.66

* Changed: the whole town area (hub, temple, wheel, locksmith, vault, market) stays on one Town set instead of re-switching at each building
* Fixed: the "perks activated" banner appeared even when no switch actually happened

### 1.0.65

* Changed: repeat quick sells no longer re-switch perks that are already equipped; quick give skips the switch when Default already covers it; harvest is snappy again

### 1.0.64

* Fixed: removed a duplicate quick-give proxy that made the button's safety depend on feature load order

### 1.0.63

* Changed: the quick-action banner flashes briefly instead of lingering through navigation

### 1.0.62

* Fixed: perk sets are now reliably equipped for quick sell, craft and give — the switch is forced (an internal cache could wrongly report the set was already on), and the action waits for the game to finish equipping, since the game confirms a switch before it has applied it

### 1.0.56–1.0.61

* Changed: quick sell, craft and give share one consolidated perk set, so clicking between them never swaps perks
* Fixed: restored the clear-perks-first step that upstream had, then narrowed it to the cases that benefit — clearing perks immediately before a sale could leave no perks equipped at all
* Note: 1.0.55, 1.0.57, 1.0.59 and 1.0.61 were intermediate builds in the same work with no separately recorded change

### 1.0.54

* Fixed: quick actions wait after switching sets, because the game confirms activating a set before the perks are actually equipped

### 1.0.53

* Fixed: quick actions force the switch instead of trusting a cache that could wrongly say the set was already active

### 1.0.52

* Changed: perks are no longer reverted to Default on item pages, which was leaving the set label and the equipped perks disagreeing

### 1.0.51

* Changed: a minimum gap between perk switches (later removed once the real cause was found)

### 1.0.50

* Fixed: the farmers market sometimes sold at the base rate — the game fires its page-load event several times per navigation, and two of those runs disagreed about which set to use; all page-based switching now goes through one check that reads the live page

### 1.0.49

* Changed: version bump only

### 1.0.48

* Fixed: perk switches are queued so two of them can't overlap, which could leave a partially applied set

### 1.0.47

* Fixed: quick sell no longer reverts perks on a timer, which raced the revert that already happens when you navigate away

### 1.0.46

* Fixed: the quick-sell perk swap was registered on every page load, so one sale fired it once per page you'd visited

### 1.0.45

* Added: a shared "Town" perk set covering the temple, wheel, locksmith and vault, each still falling back to its own set

### 1.0.44

* Changed: dropped the clear-perks-first step before switching sets (restored later — it turned out to be load-bearing)

### 1.0.43

* Changed: cap tracker rendering centralized; quick craft also refreshes it

### 1.0.42

* Fixed: mine drops are learned by reading the dig board, replacing a popup scan that never matched the game's markup, so a mine's row never narrowed down

### 1.0.41

* Fixed: the cap tracker went stale after quick sell and quick give, which use the item page's own buttons rather than the requests it was watching

### 1.0.40

* Changed: Harvest/Replant perk handling ensures Default when no Farming set exists (zero requests when already on Default), instead of requiring a dedicated Farming set

### 1.0.39

* Changed: Farming perks no longer swap on farm page visits — only around the notification Harvest and popup Replant actions, keeping farm visits request-free
* Fixed: Mining pages were mapped backwards (mining.php?id=N is the dig board, mine.php is the mine list); per-mine tracking now keys off the board URL directly and needs no remembered state
* Changed: Mine drops are learned from the "You Found Something!" announcements instead of scraping the board DOM

### 1.0.38

* Added: Farming perk sets — auto-activated on the farm page and wrapped around the notification Harvest and popup Replant actions

### 1.0.37

* Added: Mining perk sets — auto-activated on mining pages and the dig board (mine.php)
* Added: Cap tracker mining support — drops learned from the revealed mine board, per-mine filtering, live refresh while digging

### 1.0.36

* Added: Collapse control on the inventory cap tracker — shrinks the row to a red at-cap count and yellow near-cap count; state is remembered

### 1.0.35

* Fixed: Temple perk sets never activated; the temple is now detected by its temple.php / templeitem.php URL as well as the legacy page name

### 1.0.34

* Fixed: Perk set names match case-insensitively and ignore surrounding whitespace, so "fishing " still activates as Fishing

### 1.0.33

* Fixed: The cap tracker's location filter now learns each location's drops from actual explore/fishing results (the location pages themselves don't list drops, which previously left the row empty); locations you haven't played yet show the full row

### 1.0.32

* Added: Inventory cap warnings — MAX/NEAR badges and an at-cap summary on the inventory page
* Added: Inventory cap tracker — at/near-cap item icons in the bottom stats bar with background + activity-triggered refresh and per-location filtering
* Fixed: False "Crops are ready!" notification while crops were still growing
* Fixed: "Ovens are empty!" notification spam when the kitchen isn't unlocked yet
* Fixed: Gold and Ancient Coins hidden in the bottom toolbar
* Fixed: Inventory cap parsed from the wagon upgrade text instead of the current cap

### 1.0.31

* Fixed: settings sync bug
* Fixed: dropdowns bugs
* Fixed: some number inputs not styled correctly

### 1.0.30

* Fixed: Notes sync not working

### 1.0.29

* Added: Cross device sync using the notes field if you are an alpha supporter
* Added: Data for quest collapse, hidden banners, hidden updates, and more added to export
* Added: User info popup in chat. Hover/long press to show mailbox size, bio, and looking for
* Added: Request Tagging. Quests can now be starred or low priority.
  * Starred quests appear with an icon at the top of the request list
  * low priority quests appear at the bottom of the quest list, grayed out
  * Untagged quests appear in the middle
* Fixed: Slow page response on pages with large item dropdowns like Storehouse

### 1.0.28

* Added: Quick collect option for pets now shows popup of what was collected
* Added: Quick collect option for mailbox notifications
* Fixed: Improved logic for excluding notifications on certain pages (e.g. no harvest notifications on farm page, no oven notifications on kitchen page)
* Fixed: Another kitchen notification verbosity bug

### 1.0.27

* Fixed: Oven notification settings interference
* Fixed: First page loaded not being parsed

### 1.0.26

* Fixed: low-noise oven notifications triggering at 2 actions instead of 3

### 1.0.25

* Added: Option to notify on ovens for every action (now defaults to only if all actions are available for all ovens)
* Fixed: Remove field-related notifications while on the farm page to avoid jumpiness
* Fixed: Mega Cotton breaking dropdown item rendering

### 1.0.24

* Fixed: Fix vault suggestion edge case

### 1.0.23

* Added: On item pages, move Exploring, Fishing, and Mining sections above Crafting and Cooking Sections

### 1.0.22

* Fixed: Version notification Update button actually updates
* Fixed: Vault button will ask for more tries and new vaults again

### 1.0.21

* Added: Vault now has custom keyboard with hints built-in
* Fixed: Miner will now correctly count pickaxes > 1000
* Fixed: Miner will now click Try Again if attempts left is 0
* Fixed: Miner will now prioritize candidates in alignment with hits
* Fixed: Miner will now prioritize the most promising candidates if there are no hits

### 1.0.20

* Added: Miner. Static button in bottom right to take the next suggested action on board
* Added: Static button for Vault like Miner above
* Fixed: Overlap when fishing on improved explore layout
* Fixed: Containers not maxing after the first one is opened
* Fixed: Improved inputs vault field

### 1.0.19

* Fixed: Select not selecting

### 1.0.18

* Added: Consistent, cleaner UI elements for buttons and text/number inputs
* Added: Improved item selector for seeds, kitchen, and well
* Fixed: Compact silver not working with tracked mastery or quest
* Fixed: Stabilized size of improved explore results so buttons don't bounce
* Fixed: Broken Buddy.Farm links

### 1.0.17

* Added: Improved explore view applies to fishing as well
* Added: Select maximum animals to buy or sell by default (instead of 1)
* Fixed: Clicking outside to close harvest popup replanted
* Fixed: "NaNM" silver

### 1.0.16

* Added: Disable Flea Market by default (because it's a waste of gold)
* Added: Disable Quick Give if sell is locked
* Added: Added Buddy's Almanac link to quests
* Added: Remember quest details collapse globally instead of per-quest
* Added: Made silver display compact numbers over 1M
* Added: Open max containers by default
* Added: Improved exploration results (larger icons, stable sort)
* Fixed: Notifications not rendering reliably

### 1.0.15

* Added: Harvest popup has re-plant option
* Added: Option to disable Harvest popup
* Added: Option to disable vault code suggestions

### 1.0.14

* Added: Click outside popups to close
* Fixed: Quest minimize button from overlapping
* Fixed: Fully black popup backgrounds
* Fixed: Perk managment not working in some cases

### 1.0.13

* Fixed: Remove meal notification after meal expires
* Fixed: Don't query farm or kitchen if notifications are enabled

### 1.0.12

* Added: Refresh button in chat

### 1.0.11

* Fixed: Sending messages with user tags
* Fixed: Stable notification sort

### 1.0.10

* Added: Crops ready notification
* Added: Field empty notification
* Added: Ovens empty notification
* Added: Meals ready notification
* Added: Ongoing meal effect notifications
* Added: Popup listing all items harvested
* Added: Pre-fills vault code with recommended guess
* Fixed: Some perk categories not visible
* Fixed: Perk sets chaning on perks screen
* Fixed: Missing ingredient links broke for multiple ingredients

### 1.0.9

* Added: Farmhand version checking and update notifications
* Added: Support for alpha
* Added: Make quests minimizable
* Fixed: Updated caching infrastructure to significantly reduce any load impact on farmrpg.com or buddy.farm

### 1.0.8

* Added: Make missing ingredients in Quick Craft links
* Added: Collapsed item view
* Added: Fish always appear in middle of pond
* Added: Nicer chat navigation
* Fixed: Autocomplete not closing on Esc
* Fixed: Rendering modded elements was sometimes delayed or missed

### 1.0.7

* Added: Locks Quick Sell button if item is locked

### 1.0.6

* Added: Reset button for dismissed chat banners
* Fixed: Bottom menu buttons go under tracked quest on small screens
* Fixed: Duplicate quick buttons on items
* Fixed: Friendship perks didn't apply to mailbox pages
* Fixed: Enter doesn't send messages in chat
* Fixed: Settings action buttons cause page reload
* Fixed: Compress skills inconsistent

### 1.0.5

* Added: Home: hide players section
* Added: Home: hide theme switcher
* Added: Home: home footer
* Added: Home: moves updates to top if there is a new one
* Added: Home: compress skills section

### 1.0.4

* Added: Home: hide players section
* Added: Home: hide theme switcher
* Added: Home: home footer
* Added: Home: moves updates to top if there is a new one
* Added: Home: compress skills section

### 1.0.3

* Added: Add perks management

### 1.0.2

* Added: Export/Import farmhand settings
* Added: Compressed navigation view so more items are visible
* Added: Hide logo from navigation
* Added: Customize navigation (icon, name, order, URL)

### 1.0.1

* Added: Compress chat view so more messages are visible
* Added: Dismissable chat banners
* Added: Highlight messages tagging you

### 1.0.0

Initial version 🎉

* Added: Basic infrastructure
* Added: Buddy's Almanac integration
* Added: Banker
