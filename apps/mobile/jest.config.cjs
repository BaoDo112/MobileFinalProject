module.exports = {
  preset: "jest-expo",
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "<rootDir>/src/**/*.unit.test.ts",
    "<rootDir>/src/**/*.unit.test.tsx",
    "<rootDir>/src/**/*.integration.test.ts",
    "<rootDir>/src/**/*.integration.test.tsx",
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.spec.tsx"
  ],
};
