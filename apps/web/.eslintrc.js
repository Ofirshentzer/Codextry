/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals"],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  settings: {
    next: {
      rootDir: [__dirname],
    },
  },
};
