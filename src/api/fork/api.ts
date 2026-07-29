import { CachedState, StorageKey } from "../../utils/state";
import { corsFetch } from "../../utils/requests";

// This fork is installed from its own build rather than from Greasy Fork, so
// the update check has to ask the fork. Asking Greasy Fork means being told
// upstream's version forever, and being offered an "update" that would replace
// this script with the one it was forked from.
const REPOSITORY = "bwalkerr/farmrpg-farmhand";
const BRANCH = "reed-mods";

// where the script is installed from; opening it offers the update
export const SCRIPT_URL = `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/dist/farmrpg-farmhand.user.js`;

// the metadata-only build — a few hundred bytes rather than the whole script
const META_URL = `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/dist/farmrpg-farmhand.meta.js`;

// the changelog lives in the fork's README
export const CHANGELOG_URL = `https://github.com/${REPOSITORY}/blob/${BRANCH}/README.md`;

export const latestVersionState = new CachedState<string>(
  StorageKey.LATEST_VERSION,
  async (): Promise<string> => {
    const response = await corsFetch(META_URL);
    const metadata = await response.text();
    return /^\/\/\s*@version\s+(\S+)/m.exec(metadata)?.[1] || "1.0.0";
  },
  {
    timeout: 60 * 60 * 6, // 6 hours
    defaultState: "1.0.0",
  }
);
