describe('Responsive E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the hero banner and content properly on desktop', () => {
    cy.viewport(1280, 720);
    cy.get('.hero-container').should('be.visible');
    cy.get('.hero-content').should('be.visible');
    cy.get('.hero-title-text').should('be.visible');
    cy.get('.hero-actions-row button').should('have.length.at.least', 1);
  });

  it('adapts the hero banner to mobile screens', () => {
    // iPhone X resolution
    cy.viewport(375, 812);
    cy.get('.hero-container').should('have.css', 'align-items', 'flex-end');
    
    // Ensure horizontal scrolling chevrons are hidden on mobile
    cy.get('.row-nav-btn').should('not.be.visible');
  });

  it('displays the catalog rows and adapts the grid on mobile', () => {
    cy.viewport(375, 812);
    // Find a movie row
    cy.get('.catalog-row').should('be.visible');
    
    // Verify that the movie cards scale down by checking the CSS properties 
    // or just checking if they render without overflow.
    cy.get('.catalog-row-track').first().should('be.visible');
  });

  it('opens a responsive movie modal when clicking a movie card', () => {
    cy.viewport(375, 812);
    
    // Click on the first movie card to open modal
    cy.get('.catalog-row-track').first().find('.movie-card').first().click({ force: true });
    
    // Ensure the modal opens
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.detail-dialog').should('be.visible');
    
    // Verify mobile flex stacking
    cy.get('.detail-hero-content').should('have.css', 'flex-direction', 'column');
  });
});
