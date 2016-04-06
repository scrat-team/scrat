'use strict';

module.exports = {
  write: true,
  prefix: '~',
  devprefix: '^',
  exclude: [
    'test/fixtures'
  ],
  dep: [
    "fis-lint-jshint",
    "fis-optimizer-html-minifier",
    "fis-parser-handlebars",
    "fis-parser-handlebars-3.x",
    "fis-parser-less",
    "fis-parser-marked",
    "fis-parser-node-sass",
    "fis-postprocessor-autoprefixer",
    "scrat-command-init",
    "scrat-command-install",
    "scrat-command-server",
    "scrat-deploy-compress",
    "scrat-parser-babel",
    "scrat-parser-stylus",
    "scrat-preprocessor-nightcss"
  ],
  devdep: [
    'autod',
    'mocha',
    'eslint',
    'eslint-config-ucweb'
  ],
  keep: [
  ],
  semver: [
  ]
};
