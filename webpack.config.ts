/* eslint-disable unicorn/prefer-module */
import { HeadersProps, UserscriptPlugin } from "webpack-userscript";
import { Configuration as WebpackDevelopmentServerConfiguration } from "webpack-dev-server";
import CircularDependencyPlugin from "circular-dependency-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import ForkTSCheckerPlugin from "fork-ts-checker-webpack-plugin";
import manifest from "package.json";
import path from "node:path";
import webpack, { DefinePlugin } from "webpack";

interface Configuration extends webpack.Configuration {
  devServer?: WebpackDevelopmentServerConfiguration;
}

type NodeEnvironment = "development" | "production" | undefined;

const mode: webpack.Configuration["mode"] =
  (process.env.NODE_ENV as NodeEnvironment) || "production";
const isProduction = mode === "production";
const isDevelopment = process.env.NODE_ENV === "development";

const PORT = 3333;

console.log(`BUILDING IN ${mode} MODE`);

const config: Configuration = {
  mode,

  // don't allow any errors in production
  bail: isProduction,

  // use filesystem cache for speed in development
  cache: isDevelopment ? { type: "filesystem" } : false,

  // build fast source maps in dev
  devtool: isDevelopment ? "eval-cheap-module-source-map" : "source-map",

  devServer: {
    port: PORT,
  },
  watchOptions: {
    ignored: ["**/node_modules", "**/dist"],
  },
  entry: path.resolve(__dirname, "src", "index.ts"),
  output: {
    path: path.resolve(__dirname, "dist/"),
    filename: "farmrpg-farmhand.user.js",
  },
  optimization: {
    minimize: false,
    splitChunks: false,
    removeAvailableModules: true,
    removeEmptyChunks: false,
  },
  resolve: {
    extensions: [".js", ".ts", ".css", ".scss"],
    symlinks: false,
    // allow src-relative imports
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
    modules: ["/node_modules", "node_modules"],
  },
  module: {
    rules: [
      {
        // use the first matching rule and don't evaluate the rest
        oneOf: [
          {
            test: /\.svg$/,
            issuer: /\.ts$/,
            exclude: /node_modules/,
            use: ["@svgr/webpack", "url-loader"],
          },

          // load images by URL
          {
            test: /\.(gif|jpg|jpeg|png)$/,
            type: "asset",
          },

          // compile Typescript with ts-loader
          {
            test: /\.ts$/,
            loader: "ts-loader",
            options: {
              // type checking forked in plugins
              transpileOnly: true,
            },
          },

          // use file-loader for everything else
          {
            loader: require.resolve("file-loader"),
            exclude: /\.(js|mjs|ts|html|json)$/,
            options: {
              name: "static/media/[contenthash].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }) as any,

    // lint source with eslint config
    new ESLintPlugin({
      extensions: ["js", "ts", "json"],
    }),

    new DefinePlugin({
      __VERSION__: JSON.stringify(manifest.version),
    }),

    // performant type checking
    new ForkTSCheckerPlugin({}),

    new UserscriptPlugin({
      headers(original) {
        const overrides: HeadersProps = {
          grant: [
            "GM.deleteValue",
            "GM.getValue",
            "GM.listValues",
            "GM.setClipboard",
            "GM.setValue",
            "GM.xmlHttpRequest",
          ],
          icon: "https://www.google.com/s2/favicons?sz=64&domain=farmrpg.com",
          license: "MIT",
          // www.farmrpg.com serves the whole game and does NOT redirect to the
          // bare host, so a script matched only on farmrpg.com never ran there
          match: [
            "https://farmrpg.com/*",
            "https://www.farmrpg.com/*",
            "https://alpha.farmrpg.com/*",
          ],
          // Point updates at THIS fork's build. The header deliberately carried
          // no update URL for a long time, because the Greasy Fork release
          // auto-updates to upstream and would have replaced the fork wholesale.
          // Pointing at the fork's own raw dist gets the automatic updates
          // without that risk — nothing here can pull upstream's build.
          //
          // This branch tracks ITSELF, not reed-mods: the phone install follows
          // the mobile work, and the desktop install follows reed-mods, and
          // neither updater can drag the other branch's build onto the wrong
          // machine. The version lines are kept apart for the same reason —
          // reed-mods is 1.1.x, this is 1.2.x — so a mix-up shows up in the
          // version number instead of silently "updating" sideways.
          updateURL:
            "https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/mobile/dist/farmrpg-farmhand.meta.js",
          downloadURL:
            "https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/mobile/dist/farmrpg-farmhand.user.js",
          // Named apart from the desktop build. Userscript managers key an
          // install on @name + @namespace, so this is what decides whether the
          // two builds are one entry or two:
          //
          //   same name  → installing this REPLACES the reed-mods install, and
          //                going back is another reinstall
          //   this way   → two entries side by side, told apart at a glance and
          //                switched with the manager's enable toggle
          //
          // The second is what the debugging actually needs — the whole point is
          // comparing the two builds — but it comes with a hazard worth stating
          // plainly: BOTH match farmrpg.com, so if both are enabled at once every
          // feature runs twice. That looks exactly like the duplicate-dispatch bug
          // fixed in 1.1.12 (two harvest popups, doubled requests) and would send
          // you hunting for a code bug that isn't there. Keep exactly one enabled.
          //
          // No runtime guard against that: with @grant set, managers give each
          // script its own sandboxed `window`, so a "one instance already running"
          // flag isn't reliably visible across the two. The manager's own toggle is
          // the real protection.
          name: "Farm RPG Farmhand (mobile)",
          namespace: "https://github.com/anstosa/farmrpg-farmhand",
          connect: ["github.com", "raw.githubusercontent.com"],
          // from package.json
          //   description
          //   version
          //   author
          //   homepage
          //   bugs
        };
        const version = isDevelopment
          ? {
              version: `${original.version}-[buildTime]`,
            }
          : {};
        return {
          ...original,
          ...overrides,
          ...version,
        };
      },
      proxyScript: {
        baseURL: `http://localhost:${PORT}`,
        filename: `[basename].proxy.user.js`,
      },
    }),
  ],
};

export default config;
