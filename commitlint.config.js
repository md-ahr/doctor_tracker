const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-max-length": [2, "always", 50],
    "header-max-length": [2, "always", 72],
    "subject-case": [0],
  },
};

export default config;
