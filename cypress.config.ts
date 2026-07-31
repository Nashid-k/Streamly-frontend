import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    blockHosts: [
      "*doubleclick.net",
      "*adsystem.com",
      "*popads.net",
      "*propellerads.com",
      "*onclickalgo.com",
      "*adsterra.com",
      "*adserver.*",
      "*exoclick.com"
    ],
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
