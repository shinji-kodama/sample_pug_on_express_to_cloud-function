module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
  },
  parserOptions: {
    "ecmaVersion": 2021,
    "sourceType": "module",
  },
  globals: {
    window: true,
    document: true,
  },
};
