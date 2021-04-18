describe('access site', () => {
  it('loads site', () => {
    const url = 'http://localhost:3000';
    cy.visit(url);
    cy.contains('Chie');
  });
});
