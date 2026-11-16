module.exports = [
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest",
      globals: {
        __dirname: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        AbortSignal: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        document: "readonly",
        innerWidth: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
    },
  },
];
