describe('Info', () => {
  it('renders', () => {
    const url = 'http://localhost:6006/iframe.html?id=info--default';
    cy.visit(url);
    cy.contains('Welcome');
  });
});
