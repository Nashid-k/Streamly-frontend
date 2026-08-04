describe('Sign In Button & AuthModal E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  // ── Button visibility ───────────────────────────────────────────────────────

  it('renders the Sign In button in the navbar when unauthenticated', () => {
    cy.get('[data-testid="navbar-signin-btn"]').should('be.visible');
  });

  // ── Modal open ─────────────────────────────────────────────────────────────

  it('opens the Auth modal when Sign In is clicked', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-modal-overlay"]').should('exist');
    cy.get('[data-testid="auth-tab-login"]').should('be.visible');
    cy.get('[data-testid="auth-email-input"]').should('be.visible');
    cy.get('[data-testid="auth-password-input"]').should('be.visible');
  });

  // ── Tab switching ──────────────────────────────────────────────────────────

  it('shows Create Account fields when switching to signup tab', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-tab-signup"]').click();
    cy.get('[data-testid="auth-name-input"]').should('be.visible');
    cy.get('[data-testid="auth-confirm-password-input"]').should('be.visible');
    // Sign-in-only fields still present
    cy.get('[data-testid="auth-email-input"]').should('be.visible');
  });

  it('switches back to login tab correctly', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-tab-signup"]').click();
    cy.get('[data-testid="auth-tab-login"]').click();
    // Signup-only fields should be gone
    cy.get('[data-testid="auth-name-input"]').should('not.exist');
    cy.get('[data-testid="auth-confirm-password-input"]').should('not.exist');
  });

  // ── Form validation ────────────────────────────────────────────────────────

  it('keeps the modal visible when submitting empty form (native validation)', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-submit-btn"]').click();
    // Modal must still be present — native required validation blocked submission
    cy.get('[data-testid="auth-modal-overlay"]').should('exist');
  });

  it('shows an app-level error for mismatched passwords in signup', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-tab-signup"]').click();
    cy.get('[data-testid="auth-name-input"]').type('Test User');
    cy.get('[data-testid="auth-email-input"]').type('test@example.com');
    cy.get('[data-testid="auth-password-input"]').type('abc123');
    cy.get('[data-testid="auth-confirm-password-input"]').type('different');
    cy.get('[data-testid="auth-submit-btn"]').click();
    // The in-form error banner should appear
    cy.contains('Passwords do not match').should('be.visible');
  });

  // ── Close / dismiss ────────────────────────────────────────────────────────

  it('closes the modal via the X close button', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-modal-close"]').click();
    cy.get('[data-testid="auth-modal-overlay"]').should('not.exist');
    cy.get('[data-testid="navbar-signin-btn"]').should('be.visible');
  });

  it('closes the modal when clicking Continue as Guest', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-guest-btn"]').click();
    cy.get('[data-testid="auth-modal-overlay"]').should('not.exist');
    cy.get('[data-testid="navbar-signin-btn"]').should('be.visible');
  });

  it('closes the modal by clicking the backdrop overlay', () => {
    cy.get('[data-testid="navbar-signin-btn"]').click();
    cy.get('[data-testid="auth-modal-overlay"]').click({ force: true });
    cy.get('[data-testid="auth-modal-overlay"]').should('not.exist');
  });

  // ── Auth state ─────────────────────────────────────────────────────────────

  it('hides the Sign In button once auth token is stored (mocked)', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'mock-token-12345');
      win.localStorage.setItem(
        'auth_user',
        JSON.stringify({ name: 'Test User', email: 'test@example.com' })
      );
    });
    cy.reload();
    cy.get('[data-testid="navbar-signin-btn"]').should('not.exist');
  });
});
