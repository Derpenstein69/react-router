const path = require("path");
const babel = require("@rollup/plugin-babel").default;
const copy = require("rollup-plugin-copy");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const prettier = require("rollup-plugin-prettier");
const replace = require("@rollup/plugin-replace");
const { terser } = require("rollup-plugin-terser");
const typescript = require("@rollup/plugin-typescript");
const {
  babelPluginReplaceVersionPlaceholder,
  createBanner,
  isBareModuleId,
  getBuildDirectories,
  validateReplacedVersion,
  PRETTY,
} = require("../../rollup.utils");
const { name, version } = require("./package.json");

module.exports = function rollup() {
  const { SOURCE_DIR, OUTPUT_DIR } = getBuildDirectories(name);
  const RR_DOM_DIR = "packages/react-router-dom";

  // JS modules for bundlers
  let modules = [
    {
      input: `${SOURCE_DIR}/index.ts`,
      output: {
        file: `${OUTPUT_DIR}/index.js`,
        format: "esm",
        sourcemap: !PRETTY,
        banner: createBanner("React Router DOM v5 Compat", version),
      },
      external: (id) => isBareModuleId(id),
      plugins: [
        copy({
          targets: [
            {
              src: `${RR_DOM_DIR}/(index|dom|server).ts*`,
              dest: `${SOURCE_DIR}/react-router-dom`,
            },
            {
              src: `${RR_DOM_DIR}/ssr/*.ts*`,
              dest: `${SOURCE_DIR}/react-router-dom/ssr`,
            },
          ],
          // buildStart is not soon enough to run before the typescript plugin :/
          hook: "options",
          verbose: true,
        }),
        nodeResolve({ extensions: [".tsx", ".ts"] }),
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          presets: [
            ["@babel/preset-env", { loose: true }],
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          plugins: [
            "babel-plugin-dev-expression",
            babelPluginReplaceVersionPlaceholder(),
          ],
          extensions: [".ts", ".tsx"],
        }),
        typescript({
          tsconfig: path.join(__dirname, "tsconfig.json"),
          exclude: ["__tests__"],
          noEmitOnError: true,
        }),
        copy({
          targets: [{ src: "LICENSE.md", dest: SOURCE_DIR }],
          verbose: true,
        }),
        validateReplacedVersion(),
      ].concat(PRETTY ? prettier({ parser: "babel" }) : []),
    },
  ];

  // UMD modules for <script> tags and CommonJS (node)
  let globals = [
    {
      input: `${SOURCE_DIR}/index.ts`,
      output: {
        file: `${OUTPUT_DIR}/umd/react-router-dom-v5-compat.development.js`,
        format: "umd",
        sourcemap: !PRETTY,
        banner: createBanner("React Router DOM v5 Compat", version),
        globals: {
          history: "HistoryLibrary",
          "@remix-run/router": "RemixRouter",
          react: "React",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDOM",
        },
        name: "ReactRouterDOMv5Compat",
      },
      external: (id) => isBareModuleId(id),
      plugins: [
        nodeResolve({ extensions: [".tsx", ".ts"] }),
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          presets: [
            ["@babel/preset-env", { loose: true }],
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          plugins: [
            "babel-plugin-dev-expression",
            babelPluginReplaceVersionPlaceholder(),
          ],
          extensions: [".ts", ".tsx"],
        }),
        replace({
          preventAssignment: true,
          values: { "process.env.NODE_ENV": JSON.stringify("development") },
        }),
        validateReplacedVersion(),
      ].concat(PRETTY ? prettier({ parser: "babel" }) : []),
    },
    {
      input: `${SOURCE_DIR}/index.ts`,
      output: {
        file: `${OUTPUT_DIR}/umd/react-router-dom-v5-compat.production.min.js`,
        format: "umd",
        sourcemap: !PRETTY,
        banner: createBanner("React Router DOM v5 Compat", version),
        globals: {
          history: "HistoryLibrary",
          "@remix-run/router": "RemixRouter",
          react: "React",
          "react-router": "ReactRouter",
          "react-router-dom": "ReactRouterDOM",
        },
        name: "ReactRouterDOMv5Compat",
      },
      external: (id) => isBareModuleId(id),
      plugins: [
        nodeResolve({ extensions: [".tsx", ".ts"] }),
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          presets: [
            ["@babel/preset-env", { loose: true }],
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          plugins: [
            "babel-plugin-dev-expression",
            babelPluginReplaceVersionPlaceholder(),
          ],
          extensions: [".ts", ".tsx"],
        }),
        replace({
          preventAssignment: true,
          values: { "process.env.NODE_ENV": JSON.stringify("production") },
        }),
        terser(),
        validateReplacedVersion(),
      ].concat(PRETTY ? prettier({ parser: "babel" }) : []),
    },
  ];

  // Node entry points
  let node = [
    {
      input: `${SOURCE_DIR}/node-main.js`,
      output: {
        file: `${OUTPUT_DIR}/main.js`,
        format: "cjs",
        banner: createBanner("React Router DOM v5 Compat", version),
      },
      plugins: [].concat(PRETTY ? prettier({ parser: "babel" }) : []),
    },
  ];

  return [...modules, ...globals, ...node];
};

/**
 * @typedef {import('rollup').InputOptions} RollupInputOptions
 * @typedef {import('rollup').OutputOptions} RollupOutputOptions
 * @typedef {import('rollup').RollupOptions} RollupOptions
 * @typedef {import('rollup').Plugin} RollupPlugin
 */
