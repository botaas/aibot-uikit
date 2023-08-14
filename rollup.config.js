import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import url from 'rollup-plugin-url';
import copy from 'rollup-plugin-copy';
import visualizer from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';
import process from 'process';
import pkg from './package.json';

process.env.NODE_ENV = 'production';

const baseConfig = {
  cache: false,
  inlineDynamicImports: true,
  input: 'src/index.ts',
  watch: {
    chokidar: false,
  },
};

const externalDependencies = [
  /@babel/,
  '@braintree/sanitize-url',
  '@fortawesome/free-regular-svg-icons',
  '@fortawesome/react-fontawesome',
  '@juggle/resize-observer',
  '@stream-io/transliterate',
  'custom-event',
  /dayjs/,
  /emoji-mart/,
  'emoji-regex',
  'i18next',
  'isomorphic-ws',
  'linkifyjs',
  'lodash.debounce',
  'lodash.isequal',
  'lodash.throttle',
  'lodash.uniqby',
  'mml-react',
  'nanoid',
  'pretty-bytes',
  'prop-types',
  'react-fast-compare',
  /react-file-utils/,
  'react-images',
  'react-image-gallery',
  'react-is',
  'react-player',
  'react-textarea-autosize',
  'react-virtuoso',
  'textarea-caret',
  /uuid/,
];

const basePlugins = ({ useBrowserResolve = false }) => [
  replace({
    preventAssignment: true,
  }),
  // Remove peer-dependencies from final bundle
  external(),
  image(),
  resolve({
    browser: useBrowserResolve,
  }),
  typescript(),
  commonjs(),
  babel({
    babelHelpers: 'runtime',
    exclude: 'node_modules/**',
  }),
  // import files as data-uris or es modules
  url(),
  copy({
    targets: [
      { dest: 'dist/assets', src: './node_modules/@stream-io/stream-chat-css/dist/assets/*' },
      { dest: 'dist/css', src: './node_modules/@stream-io/stream-chat-css/dist/css/*' },
      { dest: 'dist/scss', src: './node_modules/@stream-io/stream-chat-css/dist/scss/*' },
      { dest: 'dist/css/v2', src: './node_modules/@stream-io/stream-chat-css/dist/v2/css/*' },
      { dest: 'dist/scss/v2', src: './node_modules/@stream-io/stream-chat-css/dist/v2/scss/*' },
      { dest: 'dist/css', src: './node_modules/katex/dist/katex.min.css' },
    ],
    verbose: process.env.VERBOSE,
    watch: process.env.ROLLUP_WATCH,
  }),
  // Json to ES modules conversion
  json({ compact: true }),
  process.env.BUNDLE_SIZE ? visualizer() : null,
];

const normalBundle = {
  ...baseConfig,
  external: externalDependencies,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [...basePlugins({ useBrowserResolve: false })],
};

const fullBrowserBundle = ({ min } = { min: false }) => ({
  ...baseConfig,
  output: [
    {
      file: min ? pkg.jsdelivr : pkg.jsdelivr.replace('.min', ''),
      format: 'iife',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      name: 'OneChatReact', // write all exported values to window under key OneChatReact
      sourcemap: true,
    },
  ],
  plugins: [
    ...basePlugins({ useBrowserResolve: true }),
    {
      load: (id) => (id.match(/.s?css$/) ? '' : null),
      name: 'ignore-css-and-scss',
      resolveId: (importee) => (importee.match(/.s?css$/) ? importee : null),
    },
    builtins(),
    min ? terser() : null,
  ],
});

export default () =>
  process.env.ROLLUP_WATCH
    ? [normalBundle]
    : [normalBundle, fullBrowserBundle({ min: true }), fullBrowserBundle()];
