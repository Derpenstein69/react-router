const path = require("path");
const babel = require("@rollup/plugin-babel").default;
const copy = require("rollup-plugin-copy");
const prettier = require("rollup-plugin-prettier");
const typescript = require("@rollup/plugin-typescript");
const {
  createBanner,
  isBareModuleId,
  getBuildDirectories,
  PRETTY,
} = require("../../rollup.utils");
const { name, version } = require("./package.json");

module.exports = function rollup() {
  const { SOURCE_DIR, OUTPUT_DIR } = getBuildDirectories(name);

  const modules = [
    {
      input: `${SOURCE_DIR}/index.tsx`,
      output: {
        file: `${OUTPUT_DIR}/index.js`,
        format: "esm",
        sourcemap: !PRETTY,
        banner: createBanner("React Router Native", version),
      },
      external: (id) => isBareModuleId(id),
      plugins: [
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          presets: [
            [
              "module:metro-react-native-babel-preset",
              {
                disableImportExportTransform: true,
                enableBabelRuntime: false,
              },
            ],
            "@babel/preset-typescript",
          ],
          plugins: ["babel-plugin-dev-expression"],
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
      ].concat(PRETTY ? prettier({ parser: "babel" }) : []),
    },
  ];

  return modules;
};

/**
 * @typedef {import('rollup').InputOptions} RollupInputOptions
 * @typedef {import('rollup').OutputOptions} RollupOutputOptions
 * @typedef {import('rollup').RollupOptions} RollupOptions
 * @typedef {import('rollup').Plugin} RollupPlugin
 */
