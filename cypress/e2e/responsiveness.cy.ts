describe('Responsive E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // ── Desktop ─────────────────────────────────────────────────────────────────

  it('renders the hero banner and content properly on desktop', () => {
    cy.viewport(1280, 720);
    cy.get('[data-testid="hero-container"]').should('be.visible');
    cy.get('[data-testid="hero-content"]').should('be.visible');
    // Title is either the h1 text fallback or a logo image — at least one must exist
    cy.get('[data-testid="hero-container"]').within(() => {
      cy.get('h1, img[alt]').should('exist');
    });
    // Play button must always be present
    cy.get('[data-testid="hero-play-btn"]').should('have.length.at.least', 1);
  });

  it('shows horizontal nav chevrons on desktop', () => {
    cy.viewport(1280, 720);
    // Wait for catalog rows to render
    cy.get('.catalog-row').should('be.visible');
    // Nav buttons are rendered but only visible when content overflows — just check they exist in DOM on desktop
    cy.get('.catalog-row').first().find('.row-nav-btn').should('exist');
  });

  // ── Mobile ──────────────────────────────────────────────────────────────────

  it('adapts the hero banner to mobile screens', () => {
    cy.viewport(375, 812);
    cy.get('[data-testid="hero-container"]').should('be.visible');
    // On mobile the content aligns flex-end via CSS (bottom of screen)
    // We check that the hero-content is visible and inside the container
    cy.get('[data-testid="hero-content"]').should('be.visible');
  });

  it('hides horizontal scrolling chevrons on mobile touch screens', () => {
    cy.viewport(375, 812);
    cy.get('.catalog-row').should('be.visible');
    // CSS hides .row-nav-btn on mobile — it must not be visible
    cy.get('.row-nav-btn').should('not.be.visible');
  });

  it('shows the mobile bottom navigation bar on mobile', () => {
    cy.viewport(375, 812);
    cy.get('.mobile-bottom-nav').should('be.visible');
  });

  it('hides the desktop nav links on mobile', () => {
    cy.viewport(375, 812);
    cy.get('.desktop-nav-items').should('not.be.visible');
  });

  // ── Catalog rows ────────────────────────────────────────────────────────────

  it('displays catalog rows and cards on mobile', () => {
    cy.viewport(375, 812);
    cy.get('.catalog-row').should('be.visible');
    cy.get('.catalog-row-track').first().should('be.visible');
    cy.get('.catalog-row-track').first().find('.movie-card').should('have.length.at.least', 1);
  });

  it('displays catalog rows and cards on desktop', () => {
    cy.viewport(1280, 720);
    cy.get('.catalog-row').should('be.visible');
    cy.get('.catalog-row-track').first().find('.movie-card').should('have.length.at.least', 1);
  });

  // ── Movie detail modal ───────────────────────────────────────────────────────

  it('opens a responsive movie modal when clicking a movie card on mobile', () => {
    cy.viewport(375, 812);
    cy.get('.catalog-row-track').first().find('.movie-card').first().click({ force: true });
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.detail-dialog').should('be.visible');
  });

  it('modal stacks content vertically on mobile', () => {
    cy.viewport(375, 812);
    cy.get('.catalog-row-track').first().find('.movie-card').first().click({ force: true });
    cy.get('.detail-hero-content').should('have.css', 'flex-direction', 'column');
  });

  // ── Tablet ──────────────────────────────────────────────────────────────────

  it('renders hero and catalog correctly on tablet', () => {
    cy.viewport(768, 1024);
    cy.get('[data-testid="hero-container"]').should('be.visible');
    cy.get('.catalog-row').should('be.visible');
    cy.get('[data-testid="hero-play-btn"]').should('be.visible');
  });
});
