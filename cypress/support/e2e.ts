// Cypress support file — required by Cypress 12+
// Add global hooks, custom commands, and imports here.

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (_err, _runnable) => {
  // Returning false prevents Cypress from failing the test on
  // unhandled errors thrown by the app (e.g. network errors in dev).
  return false;
});
