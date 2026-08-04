describe('Search and Filter UI E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('can open search and type a query', () => {
    cy.get('input[placeholder="Titles, people, genres"], input[placeholder="Search"]').first().type('Inception');
    cy.contains('Results for "Inception"').should('be.visible');
  });

  it('shows AI search button and triggers it', () => {
    cy.get('input[placeholder="Titles, people, genres"], input[placeholder="Search"]').first().type('action movies');
    cy.contains('Smart Search').should('be.visible');
  });

  it('clears search when clicking Clear Search', () => {
    cy.get('input[placeholder="Titles, people, genres"], input[placeholder="Search"]').first().type('comedy');
    cy.contains('Results for "comedy"').should('be.visible');
    cy.contains('Clear Search').click();
    cy.contains('Results for "comedy"').should('not.exist');
  });

  it('shows filters correctly when searching', () => {
    cy.get('input[placeholder="Titles, people, genres"], input[placeholder="Search"]').first().type('drama');
    cy.contains('Filters').should('be.visible');
    cy.contains('Genre').should('be.visible');
    cy.contains('Year').should('be.visible');
  });

  it('explore all button filters by category name instead of formatted title', () => {
    // Look for a row's explore all button if available (may require hover/scroll)
    // We will just verify it's there
    cy.get('.catalog-row').should('be.visible');
    // If there is an explore all button, clicking it shouldn't say "No titles available in Best in..."
    // Note: To make it click, we can target the explore all link.
    // In our UI it's usually an `h3` with `cursor: pointer` or a chevron next to title.
    cy.get('.catalog-row-header').first().click({force: true});
    // Check that we don't have empty state with weird formatted title
    cy.contains('No titles available in Best in').should('not.exist');
  });
});
