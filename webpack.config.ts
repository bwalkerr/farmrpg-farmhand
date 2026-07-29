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
          updateURL:
            "https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/reed-mods/dist/farmrpg-farmhand.meta.js",
          downloadURL:
            "https://raw.githubusercontent.com/bwalkerr/farmrpg-farmhand/reed-mods/dist/farmrpg-farmhand.user.js",
          name: "Farm RPG Farmhand",
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
